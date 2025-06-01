import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
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

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 }
      );
    }

    // Get workout plans with related data
    const { data: plans, error } = await supabase
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
            goal
          ),
          day_of_week
        )
      `)
      .eq('tenant_id', profile.tenant_id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(plans);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'An error occurred while fetching workout plans' },
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

    // First create the workout plan
    const { data: plan, error: planError } = await supabase
      .from('workout_plans')
      .insert({
        name: data.name,
        description: data.description,
        student_id: data.student_id,
        start_date: data.start_date,
        end_date: data.end_date,
        tenant_id: profile.tenant_id
      })
      .select()
      .single();

    if (planError) {
      return NextResponse.json(
        { error: planError.message },
        { status: 500 }
      );
    }

    // Then add the workout assignments
    if (data.workouts && data.workouts.length > 0) {
      interface WorkoutItemInput {
        workout_id: string;
        day_of_week: number;
      }

      interface PlanItemInsert {
        workout_plan_id: string;
        workout_id: string;
        day_of_week: number;
        tenant_id: string;
      }

      const planItems: PlanItemInsert[] = (data.workouts as WorkoutItemInput[]).map((item: WorkoutItemInput): PlanItemInsert => ({
        workout_plan_id: plan.id,
        workout_id: item.workout_id,
        day_of_week: item.day_of_week,
        tenant_id: profile.tenant_id
      }));

      const { error: itemsError } = await supabase
        .from('workout_plan_items')
        .insert(planItems);

      if (itemsError) {
        // If adding items fails, delete the plan
        await supabase
          .from('workout_plans')
          .delete()
          .eq('id', plan.id);

        return NextResponse.json(
          { error: itemsError.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(plan);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'An error occurred while creating the workout plan' },
      { status: 500 }
    );
  }
}