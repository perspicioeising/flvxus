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
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    // Verify user is authenticated and is a trainer
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
    
    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    
    // Create auth user using admin client with is_student_creation flag
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
      return NextResponse.json(
        { error: authError2.message },
        { status: 500 }
      );
    }

    // Create student profile with all fields
    const { data: profileData, error: profileError2 } = await supabase
      .from('profiles')
      .insert({
        user_id: authData.user.id,
        email: data.email,
        full_name: data.name,
        phone: data.phone,
        role: 'student',
        tenant_id: profile.tenant_id,
        trainer_id: profile.id,
        birth_date: data.birthDate,
        gender: data.gender,
        height: data.height,
        weight: data.weight,
        goals: data.goals,
        medical_conditions: data.medicalConditions,
        emergency_contact: data.emergencyContact,
        preferred_training_time: data.preferredTime,
        experience_level: data.experienceLevel,
        notes: data.notes,
        status: 'active'
      })
      .select()
      .single();

    if (profileError2) {
      return NextResponse.json(
        { error: profileError2.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Student created successfully',
      data: {
        ...profileData,
        temporaryPassword: tempPassword
      }
    });
  } catch (error: any) {
    console.error('Error creating student:', error);
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