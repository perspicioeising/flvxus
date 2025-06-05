// app/api/students/route.ts - CORRIGIDO
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Cliente admin para operações que requerem privilégios elevados
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  const { searchParams } = new URL(request.url);
  
  // Get pagination parameters
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const offset = (page - 1) * limit;

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

    // Get total count
    const { count: totalCount, error: countError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'student')
      .eq('tenant_id', profile.tenant_id);

    if (countError) {
      return NextResponse.json(
        { error: countError.message },
        { status: 500 }
      );
    }

    // Get paginated students
    const { data: students, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'student')
      .eq('tenant_id', profile.tenant_id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      students,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil((totalCount || 0) / limit)
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'An error occurred while fetching students' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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

    // Validar dados obrigatórios
    if (!data.email || !data.name) {
      return NextResponse.json(
        { error: 'Email and name are required' },
        { status: 400 }
      );
    }

    // Verificar se o email já existe
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', data.email)
      .single();

    if (existingProfile) {
      return NextResponse.json(
        { error: 'Um usuário com este email já existe' },
        { status: 400 }
      );
    }

    // 1. Primeiro, criar o usuário no sistema de autenticação
    const temporaryPassword = Math.random().toString(36).slice(-12) + 'Aa1!'; // Senha temporária segura
    
    const { data: authUser, error: authError2 } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: temporaryPassword,
      email_confirm: true, // Confirmar email automaticamente
      user_metadata: {
        full_name: data.name,
        role: 'student'
      }
    });

    if (authError2) {
      console.error('Auth creation error:', authError2);
      return NextResponse.json(
        { error: `Erro ao criar usuário: ${authError2.message}` },
        { status: 500 }
      );
    }

    if (!authUser.user) {
      return NextResponse.json(
        { error: 'Falha ao criar usuário de autenticação' },
        { status: 500 }
      );
    }

    // 2. Agora criar o perfil com o user_id válido
    const height = data.height ? parseFloat(data.height) : null;
    const weight = data.weight ? parseFloat(data.weight) : null;
    const birthDate = data.birthDate || null;

    const { data: profileData, error: profileError2 } = await supabase
      .from('profiles')
      .insert({
        user_id: authUser.user.id, // Usar o ID do usuário criado
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
      // Se falhar ao criar o perfil, deletar o usuário de autenticação criado
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      
      return NextResponse.json(
        { error: profileError2.message },
        { status: 500 }
      );
    }

    // 3. Enviar email de convite com link para definir senha
    try {
      const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'invite',
        email: data.email,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/set-password?type=invite`,
          data: {
            full_name: data.name,
            role: 'student'
          }
        }
      });

      if (inviteError) {
        console.warn('Invite email error (user still created):', inviteError);
      }
    } catch (inviteError) {
      console.warn('Failed to send invite email (user still created):', inviteError);
    }

    return NextResponse.json({
      ...profileData,
      message: 'Aluno criado com sucesso. Um email de convite foi enviado.'
    });

  } catch (error: any) {
    console.error('Student creation error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred while creating the student' },
      { status: 500 }
    );
  }
}