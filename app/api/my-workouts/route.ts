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

    // Get all workouts from active workout plans for this student
    const today = new Date();
    
    const { data: workoutPlans, error: plansError } = await supabase
      .from('workout_plans')
      .select(`
        id,
        name,
        description,
        start_date,
        end_date
      `)
      .eq('student_id', profile.id)
      .lte('start_date', today.toISOString())
      .gte('end_date', today.toISOString());

    if (plansError) {
      return NextResponse.json(
        { error: plansError.message },
        { status: 500 }
      );
    }

    // Get all workouts for these plans
    const planIds = workoutPlans.map(plan => plan.id);
    
    if (planIds.length === 0) {
      return NextResponse.json([]);
    }

    const { data: workoutItems, error: itemsError } = await supabase
      .from('workout_plan_items')
      .select(`
        workout_plan_id,
        day_of_week,
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
              audio_url,
              muscle_group,
              equipment,
              tips,
              common_errors
            ),
            sets,
            reps,
            rest,
            notes,
            order
          )
        )
      `)
      .in('workout_plan_id', planIds);

    if (itemsError) {
      return NextResponse.json(
        { error: itemsError.message },
        { status: 500 }
      );
    }

    // Group workouts by plan
    const workoutsByPlan = workoutItems.reduce<Record<string, typeof workoutItems[number][]>>((acc, item) => {
      const planId = item.workout_plan_id;
      if (!acc[planId]) {
        acc[planId] = [];
      }
      acc[planId].push(item);
      return acc;
    }, {});

    // Define types for workout_exercises and exercise to avoid 'never' type
    type Exercise = {
      id: string;
      name: string;
      description: string;
      video_url: string;
      audio_url: string;
      muscle_group: string;
      equipment: string;
      tips: string;
      common_errors: string;
    };
    
    type WorkoutExercise = {
      id: string;
      exercise: Exercise | Exercise[];
      sets: number;
      reps: number;
      rest: number;
      notes: string;
      order: number;
    };
    
    type Workout = {
      id: string;
      name: string;
      description: string;
      level: string;
      goal: string;
      workout_exercises: WorkoutExercise[];
    };
    
        // Transform the data for the frontend
        const transformedWorkouts = [];
    
        for (const plan of workoutPlans) {
          const planWorkouts = workoutsByPlan[plan.id] || [];
          
          for (const item of planWorkouts) {
            const workout: Workout = Array.isArray(item.workout) ? item.workout[0] : item.workout;
            if (!workout) continue;
            
            transformedWorkouts.push({
              id: workout.id,
              name: workout.name,
              description: workout.description,
              level: workout.level,
              goal: workout.goal,
              planId: plan.id,
              planName: plan.name,
              dayOfWeek: item.day_of_week,
              exercises: workout.workout_exercises
                .sort((a, b) => a.order - b.order)
                .map((we: WorkoutExercise) => ({
                  id: we.id,
                  exerciseId: Array.isArray(we.exercise) ? we.exercise[0]?.id : we.exercise.id,
                  name: Array.isArray(we.exercise) ? we.exercise[0]?.name : we.exercise.name,
                  description: Array.isArray(we.exercise) ? we.exercise[0]?.description : we.exercise.description,
                  videoUrl: Array.isArray(we.exercise) ? we.exercise[0]?.video_url : we.exercise.video_url,
                  audioUrl: Array.isArray(we.exercise) ? we.exercise[0]?.audio_url : we.exercise.audio_url,
                  muscleGroup: Array.isArray(we.exercise) ? we.exercise[0]?.muscle_group : we.exercise.muscle_group,
                  equipment: Array.isArray(we.exercise) ? we.exercise[0]?.equipment : we.exercise.equipment,
                  sets: we.sets,
                  reps: we.reps,
                  rest: we.rest,
                  notes: we.notes,
                  tips: Array.isArray(we.exercise) ? we.exercise[0]?.tips : we.exercise.tips,
                  commonErrors: Array.isArray(we.exercise) ? we.exercise[0]?.common_errors : we.exercise.common_errors,
                  completed: false,
                  completedSets: 0,
                  weight: null
                })),
              duration: workout.workout_exercises.length * 5 // Rough estimate
            });
          }
        }

    return NextResponse.json(transformedWorkouts);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'An error occurred while fetching workouts' },
      { status: 500 }
    );
  }
}