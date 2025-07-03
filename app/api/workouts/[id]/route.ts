// app/api/workouts/[id]/route.ts
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
      .select('id, tenant_id, role')
      .eq('user_id', session.user.id)
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 }
      );
    }

    // Buscar workout com exercícios
    const { data: workout, error: workoutError } = await supabase
      .from('workouts')
      .select(`
        *,
        workout_exercises (
          id,
          exercise_id,
          sets,
          reps,
          duration,
          rest,
          notes,
          general_notes,
          sets_config,
          order,
          exercise:exercises (
            id,
            name,
            description,
            video_url,
            audio_url,
            muscle_group,
            equipment,
            variations,
            tips,
            common_errors
          )
        )
      `)
      .eq('id', params.id)
      .eq('tenant_id', profile.tenant_id)
      .single();

    if (workoutError) {
      return NextResponse.json(
        { error: workoutError.message },
        { status: 500 }
      );
    }

    if (!workout) {
      return NextResponse.json(
        { error: 'Workout not found' },
        { status: 404 }
      );
    }

    // Se for aluno, buscar histórico de progresso
    let progressHistory = [];
    if (profile.role === 'student') {
      const { data: progress, error: progressError } = await supabase
        .from('exercise_progress')
        .select('*')
        .eq('student_id', profile.id)
        .eq('workout_id', params.id)
        .eq('tenant_id', profile.tenant_id)
        .order('created_at', { ascending: false });

      if (!progressError) {
        progressHistory = progress || [];
      }
    }

    // Organizar os exercícios por ordem
    const sortedExercises = workout.workout_exercises?.sort((a: { order: number; }, b: { order: number; }) => a.order - b.order) || [];

    // Mapear para incluir histórico de progresso se for aluno
    const exercisesWithProgress = sortedExercises.map((we: { exercise_id: any; }) => {
      const exerciseProgress = progressHistory.filter(p => p.exercise_id === we.exercise_id);
      const lastProgress = exerciseProgress[0];

      return {
        ...we,
        lastProgress: lastProgress ? {
          weight: lastProgress.weight,
          setWeights: lastProgress.set_weights,
          notes: lastProgress.notes,
          completedAt: lastProgress.created_at
        } : null,
        progressHistory: exerciseProgress
      };
    });

    return NextResponse.json({
      ...workout,
      workout_exercises: exercisesWithProgress
    });

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
        goal: data.goal,
        updated_at: new Date().toISOString()
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
    const { error: deleteError } = await supabase
      .from('workout_exercises')
      .delete()
      .eq('workout_id', params.id)
      .eq('tenant_id', profile.tenant_id);

    if (deleteError) {
      return NextResponse.json(
        { error: deleteError.message },
        { status: 500 }
      );
    }

    // Add updated exercises with new structure
    if (data.exercises && data.exercises.length > 0) {
      interface ExerciseInput {
        exercise_id: string;
        sets: number;
        reps: number;
        rest?: number;
        sets_config?: any[];
        general_notes?: string;
        order: number;
      }

      interface WorkoutExerciseInsert {
        workout_id: string;
        exercise_id: string;
        sets: number;
        reps: number;
        rest?: number;
        notes?: string;
        general_notes?: string;
        sets_config?: any[];
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