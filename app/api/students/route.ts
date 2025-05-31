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
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const data = await request.json();
    
    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    
    // Get trainer's tenant_id first
    const { data: trainerData, error: trainerError } = await supabase
      .from('profiles')
      .select('tenant_id, id')
      .single();

    if (trainerError) throw trainerError;
    
    // Create auth user using admin client with is_student_creation flag
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: data.name,
        is_student_creation: true, // Add this flag to prevent tenant creation
        tenant_id: trainerData.tenant_id // Store tenant_id in metadata
      }
    });

    if (authError) throw authError;

    // Create student profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: authData.user.id,
        email: data.email,
        full_name: data.name,
        phone: data.phone,
        role: 'student',
        tenant_id: trainerData.tenant_id,
        trainer_id: trainerData.id // Link student to trainer
      })
      .select()
      .single();

    if (profileError) throw profileError;

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
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get trainer's tenant_id first
    const { data: trainerData, error: trainerError } = await supabase
      .from('profiles')
      .select('tenant_id')
      .single();

    if (trainerError) throw trainerError;
    
    // Get students for this tenant
    const { data: students, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'student')
      .eq('tenant_id', trainerData.tenant_id);

    if (error) throw error;

    return NextResponse.json(students);
  } catch (error: any) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred while fetching students' },
      { status: 500 }
    );
  }
}