import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

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
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', session.user.id)
      .single();

    if (profileError || profile?.role !== 'trainer') {
      return NextResponse.json(
        { error: 'Access restricted to trainers' },
        { 
          status: 403,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    const data = await request.json();
    
    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    
    // Get trainer's tenant_id first
    const { data: trainerData, error: trainerError } = await supabase
      .from('profiles')
      .select('tenant_id, id')
      .single();

    if (trainerError) {
      return NextResponse.json(
        { error: trainerError.message },
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    // Create auth user using admin client with is_student_creation flag
    const { data: authData, error: authError2 } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: data.name,
        is_student_creation: true,
        tenant_id: trainerData.tenant_id
      }
    });

    if (authError2) {
      return NextResponse.json(
        { error: authError2.message },
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // Create student profile
    const { data: profileData, error: profileError2 } = await supabase
      .from('profiles')
      .insert({
        user_id: authData.user.id,
        email: data.email,
        full_name: data.name,
        phone: data.phone,
        role: 'student',
        tenant_id: trainerData.tenant_id,
        trainer_id: trainerData.id
      })
      .select()
      .single();

    if (profileError2) {
      return NextResponse.json(
        { error: profileError2.message },
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    return NextResponse.json(
      {
        message: 'Student created successfully',
        data: {
          ...profileData,
          temporaryPassword: tempPassword
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error: any) {
    console.error('Error creating student:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred while creating the student' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
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
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', session.user.id)
      .single();

    if (profileError || profile?.role !== 'trainer') {
      return NextResponse.json(
        { error: 'Access restricted to trainers' },
        { 
          status: 403,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // Get trainer's tenant_id first
    const { data: trainerData, error: trainerError } = await supabase
      .from('profiles')
      .select('tenant_id')
      .single();

    if (trainerError) {
      return NextResponse.json(
        { error: trainerError.message },
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    // Get students for this tenant
    const { data: students, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'student')
      .eq('tenant_id', trainerData.tenant_id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    return NextResponse.json(
      students,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error: any) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred while fetching students' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}