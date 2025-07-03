import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

// Interface para configuração de série
interface SetConfig {
  set_number: number;
  target_reps: number;
  suggested_weight?: number;
  notes?: string;
}

export async function GET(request: NextRequest) {
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

    // Extract pagination parameters from URL
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const offset = (page - 1) * limit;

    // Get total count for pagination
    const { count, error: countError } = await supabase
      .from('workouts')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', profile.tenant_id);

    if (countError) {
      return NextResponse.json(
        { error: countError.message },
        { status: 500 }
      );
    }

    // Get workouts with exercise count and pagination
    const { data: workouts, error } = await supabase
      .from('workouts')
      .select(`
        *,
        workout_exercises (
          count
        )
      `)
      .eq('tenant_id', profile.tenant_id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    const totalPages = Math.ceil((count || 0) / limit);
    const currentPageItems = workouts?.length || 0;
    const totalLoaded = offset + currentPageItems;
    const hasMore = totalLoaded < (count || 0);

    const response = {
      workouts: workouts || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasMore,
        offset,
        currentPageItems
      }
    };

    return NextResponse.json(response);
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

    // Then add the exercises with new structure
    if (data.exercises && data.exercises.length > 0) {
      interface ExerciseInput {
        exercise_id: string;
        sets: number;
        reps: number;
        rest?: number;
        sets_config: SetConfig[];
        general_notes?: string;
        order: number;
      }

      interface WorkoutExerciseInsert {
        workout_id: string;
        exercise_id: string;
        sets: number;
        reps: number;
        rest?: number;
        notes?: string; // Mantido para compatibilidade
        general_notes?: string;
        sets_config: SetConfig[];
        order: number;
        tenant_id: string;
      }

      const workoutExercises: WorkoutExerciseInsert[] = (data.exercises as ExerciseInput[]).map((exercise: ExerciseInput): WorkoutExerciseInsert => ({
        workout_id: workout.id,
        exercise_id: exercise.exercise_id,
        sets: exercise.sets,
        reps: exercise.reps,
        rest: exercise.rest,
        notes: exercise.general_notes, // Compatibilidade
        general_notes: exercise.general_notes,
        sets_config: exercise.sets_config,
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