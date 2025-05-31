import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';


if (!process.env.NEXT_PUBLIC_SUPABASE_URL) throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error('Missing env.SUPABASE_SERVICE_ROLE_KEY');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request: Request) {
  const cookieStore = cookies();
  console.log('Received cookies:', cookieStore.getAll());

  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    console.log('API: Iniciando requisição POST para criar estudante.'); // Adicione este log
    // Verify user is authenticated and is a trainer
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      console.error('Authentication error:', authError);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    console.log('API: Usuário autenticado. Session ID:', session.user.id); // Adicione este log

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, tenant_id, id')
      .eq('user_id', session.user.id)
      .single();

    if (profileError || profile?.role !== 'trainer') {
      console.error('Profile error:', profileError);
      return NextResponse.json(
        { error: 'Access restricted to trainers' },
        { status: 403 }
      );
    }
    console.log('API: Perfil de treinador encontrado. Tenant ID:', profile.tenant_id); // Adicione este log

    const data = await request.json();
    console.log('API: Dados recebidos para novo estudante:', data.email); // Adicione este log
    
    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    
    // Create auth user using admin client with is_student_creation flag
    console.log('API: Tentando criar usuário de autenticação para:', data.email); // Adicione este log
    const { data: authData, error: authError2 } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: data.name,
        is_student_creation: true,
        tenant_id: profile.tenant_id
      }
    });

    if (authError2) {
      console.error('Auth creation error:', authError2);
      return NextResponse.json(
        { error: authError2.message },
        { status: 500 }
      );
    }
    console.log('API: Usuário de autenticação criado com sucesso. User ID:', authData.user.id); // Adicione este log

    // Process and validate data types
    const height = data.height ? parseFloat(data.height) : null;
    const weight = data.weight ? parseFloat(data.weight) : null;
    const birthDate = data.birthDate || null;

    // Create student profile with all fields
    console.log('API: Tentando inserir perfil do estudante no banco de dados.'); // Adicione este log
    const { data: profileData, error: profileError2 } = await supabase
      .from('profiles')
      .insert({
        user_id: authData.user.id,
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
      console.error('Profile creation error:', profileError2);
      // Try to clean up the auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: profileError2.message },
        { status: 500 }
      );
    }
    console.log('API: Perfil do estudante criado com sucesso.'); // Adicione este log

    return NextResponse.json({
      message: 'Student created successfully',
      data: {
        ...profileData,
        temporaryPassword: tempPassword
      }
    });
  } catch (error: any) {
    console.error('Erro geral na API ao criar estudante:', error); // Modifique este log
    return NextResponse.json(
      { error: error.message || 'An error occurred while creating the student' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    // Verify user is authenticated and is a trainer
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      console.error('Authentication error:', authError);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, tenant_id')
      .eq('user_id', session.user.id)
      .single();

    if (profileError || profile?.role !== 'trainer') {
      console.error('Profile error:', profileError);
      return NextResponse.json(
        { error: 'Access restricted to trainers' },
        { status: 403 }
      );
    }
    
    // Get students for this tenant with all fields
    const { data: students, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'student')
      .eq('tenant_id', profile.tenant_id);

    if (error) {
      console.error('Students fetch error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(students);
  } catch (error: any) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred while fetching students' },
      { status: 500 }
    );
  }
}