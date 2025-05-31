import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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
      .select('tenant_id')
      .eq('user_id', session.user.id)
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 }
      );
    }

    const { data: plan, error } = await supabase
      .from('workout_plans')
      .select(`
        *,
        student:profiles!workout_plans_student_id_fkey (
          id,
          full_name,
          email
        ),
        workout_plan_items (
          id,
          workout:workouts (
            id,
            name,
            level,
            goal,
            workout_exercises (
              id,
              exercise:exercises (*)
            )
          ),
          day_of_week
        )
      `)
      .eq('id', params.id)
      .eq('tenant_id', profile.tenant_id)
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(plan);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'An error occurred while fetching the workout plan' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Update plan details
    const { data: plan, error: planError } = await supabase
      .from('workout_plans')
      .update({
        name: data.name,
        description: data.description,
        student_id: data.student_id,
        start_date: data.start_date,
        end_date: data.end_date
      })
      .eq('id', params.id)
      .eq('tenant_id', profile.tenant_id)
      .select()
      .single();

    if (planError) {
      return NextResponse.json(
        { error: planError.message },
        { status: 500 }
      );
    }

    // Delete existing workout assignments
    await supabase
      .from('workout_plan_items')
      .delete()
      .eq('workout_plan_id', params.id);

    // Add updated workout assignments
    if (data.workouts && data.workouts.length > 0) {
      const planItems = data.workouts.map(item => ({
        workout_plan_id: plan.id,
        workout_id: item.workout_id,
        day_of_week: item.day_of_week,
        tenant_id: profile.tenant_id
      }));

      const { error: itemsError } = await supabase
        .from('workout_plan_items')
        .insert(planItems);

      if (itemsError) {
        return NextResponse.json(
          { error: itemsError.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(plan);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'An error occurred while updating the workout plan' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const { error } = await supabase
      .from('workout_plans')
      .delete()
      .eq('id', params.id)
      .eq('tenant_id', profile.tenant_id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'An error occurred while deleting the workout plan' },
      { status: 500 }
    );
  }
}