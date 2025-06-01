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

    const { data: workout, error } = await supabase
      .from('workouts')
      .select(`
        *,
        workout_exercises (
          *,
          exercise:exercises (*)
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

    return NextResponse.json(workout);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'An error occurred while fetching the workout' },
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

    // Update workout details
    const { data: workout, error: workoutError } = await supabase
      .from('workouts')
      .update({
        name: data.name,
        description: data.description,
        level: data.level,
        goal: data.goal
      })
      .eq('id', params.id)
      .eq('tenant_id', profile.tenant_id)
      .select()
      .single();

    if (workoutError) {
      return NextResponse.json(
        { error: workoutError.message },
        { status: 500 }
      );
    }

    // Delete existing exercises
    await supabase
      .from('workout_exercises')
      .delete()
      .eq('workout_id', params.id);

    // Add updated exercises
    if (data.exercises && data.exercises.length > 0) {
      interface ExerciseInput {
        exercise_id: string;
        sets: number;
        reps: number;
        rest: number;
        notes?: string;
        order: number;
      }

      interface WorkoutExerciseInsert {
        workout_id: string;
        exercise_id: string;
        sets: number;
        reps: number;
        rest: number;
        notes?: string;
        order: number;
        tenant_id: string;
      }

      const workoutExercises: WorkoutExerciseInsert[] = (data.exercises as ExerciseInput[]).map((exercise: ExerciseInput): WorkoutExerciseInsert => ({
        workout_id: workout.id as string,
        exercise_id: exercise.exercise_id,
        sets: exercise.sets,
        reps: exercise.reps,
        rest: exercise.rest,
        notes: exercise.notes,
        order: exercise.order,
        tenant_id: profile.tenant_id as string
      }));

      const { error: exercisesError } = await supabase
        .from('workout_exercises')
        .insert(workoutExercises);

      if (exercisesError) {
        return NextResponse.json(
          { error: exercisesError.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(workout);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'An error occurred while updating the workout' },
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
      .from('workouts')
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
      { error: error.message || 'An error occurred while deleting the workout' },
      { status: 500 }
    );
  }
}