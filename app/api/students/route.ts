// app/api/students/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

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
      .select('role, tenant_id')
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
      .select('role, tenant_id')
      .eq('user_id', session.user.id)
      .single();

    if (profileError || profile?.role !== 'trainer') {
      return NextResponse.json(
        { error: 'Access restricted to trainers' },
        { status: 403 }
      );
    }

    const data = await request.json();

    // Process and validate data types
    const height = data.height ? parseFloat(data.height) : null;
    const weight = data.weight ? parseFloat(data.weight) : null;
    const birthDate = data.birthDate || null;

    // Create student profile
    const { data: profileData, error: profileError2 } = await supabase
      .from('profiles')
      .insert({
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
      return NextResponse.json(
        { error: profileError2.message },
        { status: 500 }
      );
    }

    return NextResponse.json(profileData);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'An error occurred while creating the student' },
      { status: 500 }
    );
  }
}
