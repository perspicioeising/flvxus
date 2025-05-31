import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const data = await request.json();
    
    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    
    // Create auth user using admin client
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: data.name,
      }
    });

    if (authError) throw authError;

    // Get trainer's tenant_id
    const { data: trainerData, error: trainerError } = await supabase
      .from('profiles')
      .select('tenant_id')
      .single();

    if (trainerError) throw trainerError;

    // Create student profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: authData.user.id,
        email: data.email,
        full_name: data.name,
        phone: data.phone,
        role: 'student',
        tenant_id: trainerData.tenant_id
      })
      .select()
      .single();

    if (profileError) throw profileError;

    // TODO: Send email to student with temporary password
    // For now, return the temporary password in the response
    return NextResponse.json({
      message: 'Student created successfully',
      data: {
        ...profileData,
        temporaryPassword: tempPassword // In production, this should be sent via email
      }
    });
  } catch (error: any) {
    console.error('Error creating student:', error);
    return NextResponse.json(
      { error: error.message },
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
      { error: error.message },
      { status: 500 }
    );
  }
}