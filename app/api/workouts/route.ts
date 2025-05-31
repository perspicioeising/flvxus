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

    // Get workouts with exercise count
    const { data: workouts, error } = await supabase
      .from('workouts')
      .select(`
        *,
        workout_exercises (
          count
        )
      `)
      .eq('tenant_id', profile.tenant_id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(workouts);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'An error occurred while fetching workouts' },
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

    // First create the workout
    const { data: workout, error: workoutError } = await supabase
      .from('workouts')
      .insert({
        name: data.name,
        description: data.description,
        level: data.level,
        goal: data.goal,
        tenant_id: profile.tenant_id
      })
      .select()
      .single();

    if (workoutError) {
      return NextResponse.json(
        { error: workoutError.message },
        { status: 500 }
      );
    }

    // Then add the exercises
    if (data.exercises && data.exercises.length > 0) {
      const workoutExercises = data.exercises.map(exercise => ({
        workout_id: workout.id,
        exercise_id: exercise.exercise_id,
        sets: exercise.sets,
        reps: exercise.reps,
        rest: exercise.rest,
        notes: exercise.notes,
        order: exercise.order,
        tenant_id: profile.tenant_id
      }));

      const { error: exercisesError } = await supabase
        .from('workout_exercises')
        .insert(workoutExercises);

      if (exercisesError) {
        // If adding exercises fails, delete the workout
        await supabase
          .from('workouts')
          .delete()
          .eq('id', workout.id);

        return NextResponse.json(
          { error: exercisesError.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(workout);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'An error occurred while creating the workout' },
      { status: 500 }
    );
  }
}