// app/api/ai/exercise-insights/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
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

    // Get exercise progress data
    const { data: progressData } = await supabase
      .from('exercise_progress')
      .select(`
        *,
        exercise:exercises (
          name,
          muscle_group
        )
      `)
      .eq('student_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(50);

    // Get workout history
    const { data: workoutHistory } = await supabase
      .from('workout_history')
      .select(`
        *,
        workout:workouts (
          name,
          level,
          goal
        )
      `)
      .eq('student_id', profile.id)
      .order('completed_at', { ascending: false })
      .limit(30);

    // Generate insights based on the data
    const insights = generateInsights(progressData || [], workoutHistory || []);

    return NextResponse.json(insights);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'An error occurred while generating insights' },
      { status: 500 }
    );
  }
}

function generateInsights(progressData: any[], workoutHistory: any[]) {
  const insights = [];

  // Analyze workout frequency
  const workoutFrequency = analyzeWorkoutFrequency(workoutHistory);
  if (workoutFrequency.insight && 'description' in workoutFrequency) {
    insights.push({
      type: 'frequency',
      title: workoutFrequency.title,
      description: workoutFrequency.description,
      confidence: workoutFrequency.confidence,
      recommendation: workoutFrequency.recommendation
    });
  }

  // Analyze weight progression
  const weightProgression = analyzeWeightProgression(progressData);
  if (weightProgression.insight && 'description' in weightProgression) {
    insights.push({
      type: 'progression',
      title: weightProgression.title,
      description: weightProgression.description,
      confidence: weightProgression.confidence,
      recommendation: weightProgression.recommendation
    });
  }

  // Analyze muscle group balance
  const muscleBalance = analyzeMuscleBalance(progressData);
  if (muscleBalance.insight && 'description' in muscleBalance) {
    insights.push({
      type: 'balance',
      title: muscleBalance.title,
      description: muscleBalance.description,
      confidence: muscleBalance.confidence,
      recommendation: muscleBalance.recommendation
    });
  }

  return insights;
}

function analyzeWorkoutFrequency(workoutHistory: any[]) {
  if (workoutHistory.length < 2) {
    return { insight: false };
  }

  const workoutsPerWeek = workoutHistory.length / 4; // Assuming data is from last 30 days
  let insight = {
    title: '',
    description: '',
    confidence: 0,
    recommendation: '',
    insight: true
  };

  if (workoutsPerWeek < 2) {
    insight.title = 'Frequência de treino baixa';
    insight.description = 'Sua frequência média de treinos está abaixo do ideal';
    insight.confidence = 0.85;
    insight.recommendation = 'Tente aumentar para pelo menos 3 treinos por semana';
  } else if (workoutsPerWeek > 5) {
    insight.title = 'Alta frequência de treinos';
    insight.description = 'Você está mantendo uma frequência muito alta de treinos';
    insight.confidence = 0.9;
    insight.recommendation = 'Considere incluir mais dias de recuperação';
  }

  return insight;
}

function analyzeWeightProgression(progressData: any[]) {
  if (progressData.length < 5) {
    return { insight: false };
  }

  // Group by exercise and analyze progression
  const exerciseProgress = progressData.reduce((acc: any, curr: any) => {
    if (!acc[curr.exercise_id]) {
      acc[curr.exercise_id] = [];
    }
    acc[curr.exercise_id].push(curr);
    return acc;
  }, {});

  let insight = {
    title: '',
    description: '',
    confidence: 0,
    recommendation: '',
    insight: true
  };

  // Find exercises with stagnant progression
  const stagnantExercises = Object.entries(exerciseProgress).filter(([_, records]) => {
    const recs = records as any[];
    const weights = recs.map(r => r.weight).filter(Boolean);
    return weights.length >= 3 && new Set(weights).size === 1;
  });

  if (stagnantExercises.length > 0) {
    insight.title = 'Progressão de carga estagnada';
    insight.description = 'Alguns exercícios não mostram progressão de carga';
    insight.confidence = 0.8;
    insight.recommendation = 'Considere aumentar a carga em 5-10% nos exercícios estagnados';
  }

  return insight;
}

function analyzeMuscleBalance(progressData: any[]) {
  if (progressData.length < 10) {
    return { insight: false };
  }

  // Count exercises per muscle group
  const muscleGroupCount = progressData.reduce((acc: any, curr: any) => {
    const muscleGroups = curr.exercise?.muscle_group || [];
    muscleGroups.forEach((group: string) => {
      acc[group] = (acc[group] || 0) + 1;
    });
    return acc;
  }, {});

  let insight = {
    title: '',
    description: '',
    confidence: 0,
    recommendation: '',
    insight: true
  };

  // Find imbalances
  const counts = Object.values(muscleGroupCount) as number[];
  const max = Math.max(...counts);
  const min = Math.min(...counts);
  const ratio = max / min;

  if (ratio > 2) {
    insight.title = 'Desequilíbrio muscular detectado';
    insight.description = 'Alguns grupos musculares estão recebendo mais atenção que outros';
    insight.confidence = 0.75;
    insight.recommendation = 'Equilibre seu treino incluindo mais exercícios para os grupos menos trabalhados';
  }

  return insight;
}
