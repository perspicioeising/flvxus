// app/api/students/route.ts - VERSÃO CORRIGIDA E MELHORADA
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

    // 🔥 MELHORADO: Verificação mais robusta de email existente
    console.log('🔍 [DEBUG] Verificando email existente:', data.email);

    // Verificar na tabela profiles
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('email, status')
      .eq('email', data.email)
      .single();

    if (existingProfile && existingProfile.status === 'active') {
      return NextResponse.json({ error: 'Um usuário ativo com este email já existe' }, { status: 400 });
    }

    // Verificar no Auth com listagem mais específica
    let existingAuthUser = null;
    try {
      const { data: authUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 1000
      });
      
      if (!listError && authUsers?.users) {
        existingAuthUser = authUsers.users.find(u => u.email === data.email);
      }
    } catch (authCheckError) {
      console.warn('⚠️ [DEBUG] Erro ao verificar usuário no Auth:', authCheckError);
    }

    console.log('✅ [DEBUG] Email disponível:', data.email);

    // 🔥 NOVO: Limpeza mais segura de usuários existentes
    if (existingAuthUser || existingProfile) {
      console.log('🧹 [DEBUG] Limpando registros existentes...');
      
      // Deletar do Auth se existir
      if (existingAuthUser) {
        try {
          await supabaseAdmin.auth.admin.deleteUser(existingAuthUser.id);
          console.log('✅ [DEBUG] Usuário deletado do Auth');
        } catch (deleteError) {
          console.error('❌ [DEBUG] Erro ao deletar do Auth:', deleteError);
        }
      }
      
      // Deletar do profiles se existir
      if (existingProfile) {
        try {
          await supabase
            .from('profiles')
            .delete()
            .eq('email', data.email);
          console.log('✅ [DEBUG] Perfil deletado');
        } catch (deleteError) {
          console.error('❌ [DEBUG] Erro ao deletar perfil:', deleteError);
        }
      }
      
      // Aguardar limpeza
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // 1. Criar novo usuário no Auth
    console.log('🔑 [DEBUG] Criando novo usuário no Auth...');
    
    const temporaryPassword = Math.random().toString(36).slice(-12) + 'Aa1!';
    
    const { data: authUser, error: authError2 } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: {
        full_name: data.name,
        role: 'student',
        trainer_name: profile.full_name || 'Seu Personal Trainer',
        is_student_creation: true
      }
    });

    if (authError2) {
      console.error('❌ [DEBUG] Erro ao criar usuário:', authError2);
      return NextResponse.json({ error: `Erro ao criar usuário: ${authError2.message}` }, { status: 500 });
    }

    if (!authUser.user) {
      return NextResponse.json({ error: 'Falha ao criar usuário de autenticação' }, { status: 500 });
    }

    const authUserId = authUser.user.id;
    console.log('✅ [DEBUG] Usuário criado no Auth:', authUserId);

    // 2. Criar perfil
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
        status: 'pending' // 🔥 MUDANÇA: Iniciar como pendente
      })
      .select()
      .single();

    if (profileError2) {
      console.error('❌ [DEBUG] Erro ao criar perfil:', profileError2);
      await supabaseAdmin.auth.admin.deleteUser(authUserId);
      return NextResponse.json({ error: profileError2.message }, { status: 500 });
    }

    console.log('✅ [DEBUG] Perfil criado:', profileData.id);

    // 3. 🔥 MELHORADO: Gerar Magic Link direto para set-password
    console.log('📧 [DEBUG] Gerando Magic Link...');
    
    let linkGenerated = false;
    let actionLink = '';
    
    try {
      // Tentar gerar magic link direto para set-password
      const { data: magicData, error: magicError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email: data.email,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/set-password?new_user=true&welcome=true`,
          data: {
            full_name: data.name,
            role: 'student',
            trainer_name: profile.full_name || 'Seu Personal Trainer',
            is_student_creation: true
          }
        }
      });

      if (magicError) {
        console.error('❌ [DEBUG] Erro no Magic Link:', magicError);
        throw magicError;
      }

      if (magicData?.properties?.action_link) {
        actionLink = magicData.properties.action_link;
        linkGenerated = true;
        console.log('✅ [DEBUG] Magic Link gerado com sucesso!');
      }

    } catch (magicError) {
      console.error('❌ [DEBUG] Magic Link falhou, tentando invite...');
      
      // Fallback: tentar invite
      try {
        const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.generateLink({
          type: 'invite',
          email: data.email,
          options: {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/set-password?new_user=true&welcome=true`,
            data: {
              full_name: data.name,
              role: 'student',
              trainer_name: profile.full_name || 'Seu Personal Trainer',
              is_student_creation: true
            }
          }
        });
        
        if (!inviteError && inviteData?.properties?.action_link) {
          actionLink = inviteData.properties.action_link;
          linkGenerated = true;
          console.log('✅ [DEBUG] Invite enviado como fallback');
        } else {
          console.error('❌ [DEBUG] Invite também falhou:', inviteError);
        }
        
      } catch (inviteError) {
        console.error('❌ [DEBUG] Invite exception:', inviteError);
      }
    }

    // 4. Log do link gerado
    if (linkGenerated && actionLink) {
      console.log('\n' + '='.repeat(80));
      console.log('🎯 LINK DE ACESSO GERADO:');
      console.log('📧 Para:', data.email);
      console.log('👤 Aluno:', data.name);
      console.log('💪 Personal:', profile.full_name);
      console.log('🔗 Link:', actionLink);
      console.log('='.repeat(80) + '\n');
    } else {
      console.warn('⚠️ [DEBUG] Nenhum link foi gerado!');
    }

    return NextResponse.json({
      ...profileData,
      message: linkGenerated 
        ? 'Aluno criado com sucesso! Um email de acesso foi enviado.' 
        : 'Aluno criado, mas houve problema no envio do email. Gere um novo convite.',
      invite_sent: linkGenerated,
      action_link: actionLink // Para debug/teste
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
      pending: students?.filter(s => s.status === 'pending').length || 0,
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