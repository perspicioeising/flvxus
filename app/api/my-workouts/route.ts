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
      .select('id, tenant_id')
      .eq('user_id', session.user.id)
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 }
      );
    }

    // Get today's workouts from workout plans
    const today = new Date();
    const dayOfWeek = today.getDay() + 1; // 1 for Monday, 7 for Sunday

    const { data: workouts, error } = await supabase
      .from('workout_plan_items')
      .select(`
        workout_id,
        workout:workouts (
          id,
          name,
          description,
          level,
          goal,
          workout_exercises (
            id,
            exercise:exercises (
              id,
              name,
              description,
              video_url,
              muscle_group,
              equipment
            ),
            sets,
            reps,
            rest,
            notes,
            order
          )
        )
      `)
      .eq('tenant_id', profile.tenant_id)
      .eq('day_of_week', dayOfWeek);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Transform the data for the frontend
    const transformedWorkouts = workouts.map(item => ({
      id: item.workout.id,
      name: item.workout.name,
      description: item.workout.description,
      level: item.workout.level,
      goal: item.workout.goal,
      exercises: item.workout.workout_exercises
        .sort((a, b) => a.order - b.order)
        .map(we => ({
          id: we.exercise.id,
          name: we.exercise.name,
          description: we.exercise.description,
          videoUrl: we.exercise.video_url,
          muscleGroup: we.exercise.muscle_group,
          equipment: we.exercise.equipment,
          sets: we.sets,
          reps: we.reps,
          rest: we.rest,
          notes: we.notes,
          completed: false,
          completedSets: 0,
          weight: null
        })),
      duration: item.workout.workout_exercises.length * 5 // Rough estimate
    }));

    return NextResponse.json(transformedWorkouts);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'An error occurred while fetching workouts' },
      { status: 500 }
    );
  }
}