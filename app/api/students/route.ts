// app/api/students/route.ts - VERSÃO CORRIGIDA
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Cliente admin para operações que requerem privilégios elevados
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    console.log('🚀 [DEBUG] Iniciando criação de estudante...');
    
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, tenant_id, id, full_name')
      .eq('user_id', session.user.id)
      .single();

    if (profileError || profile?.role !== 'trainer') {
      return NextResponse.json({ error: 'Access restricted to trainers' }, { status: 403 });
    }

    const data = await request.json();

    if (!data.email || !data.name) {
      return NextResponse.json({ error: 'Email and name are required' }, { status: 400 });
    }

    // Verificar se o email já existe na tabela profiles
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', data.email)
      .single();

    if (existingProfile) {
      return NextResponse.json({ error: 'Um usuário com este email já existe' }, { status: 400 });
    }

    console.log('✅ [DEBUG] Email disponível:', data.email);

    // 1. Verificar se usuário já existe no Auth (e deletar se necessário)
    let authUserId;
    
    try {
      console.log('🔍 [DEBUG] Verificando se usuário já existe no Auth...');
      
      // Tentar buscar usuário existente
      const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 1000
      });
      
      const existingUser = existingUsers?.users?.find(u => u.email === data.email);
      
      if (existingUser) {
        console.log('🗑️ [DEBUG] Usuário encontrado no Auth, deletando:', existingUser.id);
        
        // Deletar usuário existente
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(existingUser.id);
        
        if (deleteError) {
          console.error('❌ [DEBUG] Erro ao deletar usuário existente:', deleteError);
        } else {
          console.log('✅ [DEBUG] Usuário deletado com sucesso');
        }
        
        // Aguardar um pouco para garantir que a deleção foi processada
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
    } catch (checkError) {
      console.warn('⚠️ [DEBUG] Erro ao verificar usuário existente:', checkError);
    }

    // 2. Criar novo usuário no Auth
    console.log('🔑 [DEBUG] Criando novo usuário no Auth...');
    
    const temporaryPassword = Math.random().toString(36).slice(-12) + 'Aa1!';
    
    const { data: authUser, error: authError2 } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: {
        full_name: data.name,
        role: 'student',
        trainer_name: profile.full_name || 'Seu Personal Trainer'
      }
    });

    if (authError2) {
      console.error('❌ [DEBUG] Erro ao criar usuário:', authError2);
      return NextResponse.json({ error: `Erro ao criar usuário: ${authError2.message}` }, { status: 500 });
    }

    if (!authUser.user) {
      return NextResponse.json({ error: 'Falha ao criar usuário de autenticação' }, { status: 500 });
    }

    authUserId = authUser.user.id;
    console.log('✅ [DEBUG] Usuário criado no Auth:', authUserId);

    // 3. Criar perfil
    const height = data.height ? parseFloat(data.height) : null;
    const weight = data.weight ? parseFloat(data.weight) : null;
    const birthDate = data.birthDate || null;

    const { data: profileData, error: profileError2 } = await supabase
      .from('profiles')
      .insert({
        user_id: authUserId,
        email: data.email,
        full_name: data.name,
        phone: data.phone || null,
        role: 'student',
        tenant_id: profile.tenant_id,
        trainer_id: profile.id,
        birth_date: birthDate,
        gender: data.gender || null,
        height: height,
        weight: weight,
        goals: Array.isArray(data.goals) ? data.goals : [],
        medical_conditions: data.medicalConditions || null,
        emergency_contact: data.emergencyContact || null,
        preferred_training_time: data.preferredTime || null,
        experience_level: data.experienceLevel || null,
        notes: data.notes || null,
        status: 'active'
      })
      .select()
      .single();

    if (profileError2) {
      console.error('❌ [DEBUG] Erro ao criar perfil:', profileError2);
      await supabaseAdmin.auth.admin.deleteUser(authUserId);
      return NextResponse.json({ error: profileError2.message }, { status: 500 });
    }

    console.log('✅ [DEBUG] Perfil criado:', profileData.id);

    // 4. Enviar Magic Link (mais confiável que invite)
    console.log('📧 [DEBUG] Enviando Magic Link...');
    
    try {
      const { data: magicData, error: magicError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email: data.email,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/profile/set-password?type=magic&new_user=true`,
          data: {
            full_name: data.name,
            role: 'student',
            trainer_name: profile.full_name || 'Seu Personal Trainer',
            user_id: authUserId
          }
        }
      });

      if (magicError) {
        console.error('❌ [DEBUG] Erro ao gerar Magic Link:', magicError);
        
        // Fallback: tentar invite
        console.log('🔄 [DEBUG] Tentando invite como fallback...');
        const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.generateLink({
          type: 'invite',
          email: data.email,
          options: {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/profile/set-password`,
            data: {
              full_name: data.name,
              role: 'student',
              trainer_name: profile.full_name || 'Seu Personal Trainer'
            }
          }
        });
        
        if (inviteError) {
          console.error('❌ [DEBUG] Invite também falhou:', inviteError);
        } else {
          console.log('✅ [DEBUG] Invite enviado como fallback');
        }
        
      } else {
        console.log('✅ [DEBUG] Magic Link enviado com sucesso!');
        
        if (magicData?.properties?.action_link) {
          console.log('\n' + '='.repeat(80));
          console.log('🎯 MAGIC LINK GERADO:');
          console.log('📧 Para:', data.email);
          console.log('👤 Aluno:', data.name);
          console.log('💪 Personal:', profile.full_name);
          console.log('🔗 Link:', magicData.properties.action_link);
          console.log('='.repeat(80) + '\n');
        }
      }

    } catch (emailError) {
      console.error('💥 [DEBUG] Exceção ao enviar email:', emailError);
    }

    return NextResponse.json({
      ...profileData,
      message: 'Aluno criado com sucesso! Um email de acesso foi enviado.',
      invite_sent: true
    });

  } catch (error: any) {
    console.error('💥 [DEBUG] Erro geral:', error);
    return NextResponse.json({ error: error.message || 'An error occurred while creating the student' }, { status: 500 });
  }
}



export async function GET(request: Request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  const { searchParams } = new URL(request.url);
  
  // Get pagination parameters
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const offset = (page - 1) * limit;
  
  // Get filter parameters
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || 'all';
  const experience = searchParams.get('experience') || 'all';

  try {
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, tenant_id, id')
      .eq('user_id', session.user.id)
      .single();

    if (profileError || profile?.role !== 'trainer') {
      return NextResponse.json(
        { error: 'Access restricted to trainers' },
        { status: 403 }
      );
    }

    // Build query with filters
    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .eq('role', 'student')
      .eq('tenant_id', profile.tenant_id);

    // Apply search filter
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // Apply status filter
    if (status !== 'all') {
      query = query.eq('status', status);
    }

    // Apply experience filter
    if (experience !== 'all') {
      query = query.eq('experience_level', experience);
    }

    // Get total count
    const { count: totalCount, error: countError } = await query;

    if (countError) {
      return NextResponse.json(
        { error: countError.message },
        { status: 500 }
      );
    }

    // Get paginated students
    const { data: students, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Generate stats
    const stats = {
      total: totalCount || 0,
      active: students?.filter(s => s.status === 'active').length || 0,
      inactive: students?.filter(s => s.status === 'inactive').length || 0,
      beginners: students?.filter(s => s.experience_level === 'beginner').length || 0,
      intermediate: students?.filter(s => s.experience_level === 'intermediate').length || 0,
      advanced: students?.filter(s => s.experience_level === 'advanced').length || 0,
      thisMonth: students?.filter(s => {
        const createdAt = new Date(s.created_at);
        const now = new Date();
        return createdAt.getMonth() === now.getMonth() && 
               createdAt.getFullYear() === now.getFullYear();
      }).length || 0
    };

    return NextResponse.json({
      students,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil((totalCount || 0) / limit),
        hasMore: page < Math.ceil((totalCount || 0) / limit)
      },
      stats
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'An error occurred while fetching students' },
      { status: 500 }
    );
  }
}


// PUT method for updating students
export async function PUT(request: Request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, tenant_id, id')
      .eq('user_id', session.user.id)
      .single();

    if (profileError || profile?.role !== 'trainer') {
      return NextResponse.json(
        { error: 'Access restricted to trainers' },
        { status: 403 }
      );
    }

    const data = await request.json();
    const { studentId, ...updateData } = data;

    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    // Prepare update data
    const height = updateData.height ? parseFloat(updateData.height) : null;
    const weight = updateData.weight ? parseFloat(updateData.weight) : null;
    const birthDate = updateData.birthDate || null;

    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: updateData.name,
        phone: updateData.phone || null,
        birth_date: birthDate,
        gender: updateData.gender || null,
        height: height,
        weight: weight,
        goals: Array.isArray(updateData.goals) ? updateData.goals : [],
        medical_conditions: updateData.medicalConditions || null,
        emergency_contact: updateData.emergencyContact || null,
        preferred_training_time: updateData.preferredTime || null,
        experience_level: updateData.experienceLevel || null,
        notes: updateData.notes || null
      })
      .eq('id', studentId)
      .eq('tenant_id', profile.tenant_id) // Security: only update students from same tenant
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ...updatedProfile,
      message: 'Aluno atualizado com sucesso!'
    });

  } catch (error: any) {
    console.error('Student update error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred while updating the student' },
      { status: 500 }
    );
  }
}