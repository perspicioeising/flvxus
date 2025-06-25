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

    // 3. 🔥 MELHORADO: Usar INVITE como método principal
    console.log('📧 [DEBUG] Gerando Invite Link...');
    
    let linkGenerated = false;
    let actionLink = '';
    let inviteMethod = '';
    
    try {
      // 🎯 PRIMEIRO: Tentar gerar INVITE (método recomendado para novos usuários)
      console.log('📨 [DEBUG] Tentando método INVITE...');
      const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
        data.email,
        {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/set-password?new_user=true&welcome=true`,
          data: {
            full_name: data.name,
            role: 'student',
            trainer_name: profile.full_name || 'Seu Personal Trainer',
            is_student_creation: true
          }
        }
      );

      if (!inviteError && inviteData?.user) {
        linkGenerated = true;
        inviteMethod = 'invite';
        console.log('✅ [DEBUG] Invite enviado com sucesso!');
        console.log('✅ [DEBUG] User ID do invite:', inviteData.user.id);
        
        // O link não é retornado no invite, mas o email é enviado automaticamente
        actionLink = `Convite enviado para ${data.email} - verifique a caixa de entrada`;
      } else {
        console.warn('⚠️ [DEBUG] Invite falhou:', inviteError);
        throw inviteError;
      }

    } catch (inviteError) {
      console.error('❌ [DEBUG] Invite falhou, tentando Magic Link como fallback...');
      
      // 🔄 FALLBACK: Magic Link
      try {
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
          console.error('❌ [DEBUG] Magic Link também falhou:', magicError);
          throw magicError;
        }

        if (magicData?.properties?.action_link) {
          actionLink = magicData.properties.action_link;
          linkGenerated = true;
          inviteMethod = 'magiclink';
          console.log('✅ [DEBUG] Magic Link gerado como fallback!');
        }

      } catch (magicError) {
        console.error('❌ [DEBUG] Ambos os métodos falharam:', { inviteError, magicError });
        
        // 🆘 ÚLTIMO RECURSO: Tentar generateLink com tipo invite
        try {
          const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
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
          
          if (!linkError && linkData?.properties?.action_link) {
            actionLink = linkData.properties.action_link;
            linkGenerated = true;
            inviteMethod = 'generateLink-invite';
            console.log('✅ [DEBUG] Generate Link Invite funcionou como último recurso!');
          }
          
        } catch (linkError) {
          console.error('❌ [DEBUG] Todos os métodos falharam:', linkError);
        }
      }
    }

    // 4. Log do resultado
    if (linkGenerated && actionLink) {
      console.log('\n' + '='.repeat(80));
      console.log('🎯 CONVITE GERADO:');
      console.log('📧 Para:', data.email);
      console.log('👤 Aluno:', data.name);
      console.log('💪 Personal:', profile.full_name);
      console.log('📮 Método:', inviteMethod.toUpperCase());
      
      if (inviteMethod === 'invite') {
        console.log('✉️ Status: Email enviado automaticamente pelo Supabase');
        console.log('📬 Instrução: Peça ao aluno para verificar a caixa de entrada');
      } else {
        console.log('🔗 Link:', actionLink);
        console.log('📬 Instrução: Envie este link diretamente para o aluno');
      }
      
      console.log('='.repeat(80) + '\n');
    } else {
      console.warn('⚠️ [DEBUG] Nenhum método de convite funcionou!');
    }

    return NextResponse.json({
      ...profileData,
      message: linkGenerated 
        ? inviteMethod === 'invite'
          ? 'Aluno criado com sucesso! Um convite foi enviado por email.' 
          : 'Aluno criado com sucesso! Link de acesso gerado.'
        : 'Aluno criado, mas houve problema no envio do convite. Gere um novo convite.',
      invite_sent: linkGenerated,
      invite_method: inviteMethod,
      action_link: inviteMethod !== 'invite' ? actionLink : undefined, // Só mostrar link se não for invite automático
      instructions: inviteMethod === 'invite' 
        ? 'Email enviado automaticamente - peça ao aluno para verificar a caixa de entrada'
        : 'Use o link fornecido para dar acesso ao aluno'
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