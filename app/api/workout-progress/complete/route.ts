// app/api/workout-progress/complete/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

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
      .select('id, tenant_id, role, total_points')
      .eq('user_id', session.user.id)
      .single();

    if (profileError || profile?.role !== 'student') {
      return NextResponse.json(
        { error: 'Access restricted to students' },
        { status: 403 }
      );
    }

    const data = await request.json();
    const { workoutId, planId, duration, exercises, notes } = data;

    // Calcular estatísticas do treino
    const exercisesCompleted = exercises.filter((e: any) => e.sets_completed > 0).length;
    const totalWeight = exercises.reduce((sum: number, e: any) => {
      return sum + (e.weights?.reduce((w: number, weight: number) => w + (weight || 0), 0) || 0);
    }, 0);

    // Salvar progresso de cada exercício
    const exerciseProgressPromises = exercises.map((exerciseData: any) => {
      if (exerciseData.sets_completed === 0) return Promise.resolve();
      
      return supabase
        .from('exercise_progress')
        .insert({
          student_id: profile.id,
          workout_id: workoutId,
          exercise_id: exerciseData.exercise_id,
          weight: exerciseData.weights?.reduce((sum: number, w: number) => sum + (w || 0), 0) / (exerciseData.weights?.length || 1) || 0,
          notes: exerciseData.notes || null,
          set_weights: exerciseData.weights || [],
          tenant_id: profile.tenant_id
        });
    });

    await Promise.all(exerciseProgressPromises);

    // Registrar histórico do treino
    const { error: historyError } = await supabase
      .from('workout_history')
      .insert({
        student_id: profile.id,
        workout_id: workoutId,
        completed_at: new Date().toISOString(),
        duration: Math.floor(duration / 60), // Converter para minutos
        exercises_completed: exercisesCompleted,
        total_weight: totalWeight,
        notes: notes || null,
        tenant_id: profile.tenant_id
      });

    if (historyError) {
      console.error('Error saving workout history:', historyError);
      throw new Error('Erro ao salvar histórico do treino');
    }

    // Calcular pontos baseados na performance
    let pointsEarned = 10; // Pontos base por completar treino
    
    // Bônus por exercícios completados
    pointsEarned += exercisesCompleted * 2;
    
    // Bônus por dificuldade média alta
    const avgDifficulty = exercises
      .filter((e: any) => e.difficulty_rating)
      .reduce((sum: number, e: any) => sum + e.difficulty_rating, 0) / 
      exercises.filter((e: any) => e.difficulty_rating).length;
    
    if (avgDifficulty >= 4) pointsEarned += 5; // Bônus por treino difícil

    // Atualizar pontos do usuário e data do último treino
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        last_workout_date: new Date().toISOString().split('T')[0],
        total_points: (profile.total_points || 0) + pointsEarned
      })
      .eq('id', profile.id);

    if (updateError) {
      console.error('Error updating user profile:', updateError);
    }

    // Verificar conquistas
    await checkAndAwardAchievements(supabase, profile.id, profile.tenant_id);

    return NextResponse.json({ 
      success: true,
      pointsEarned,
      totalWeight,
      exercisesCompleted,
      duration: Math.floor(duration / 60)
    });

  } catch (error: any) {
    console.error('Error completing workout:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred while completing the workout' },
      { status: 500 }
    );
  }
}

async function checkAndAwardAchievements(supabase: any, userId: string, tenantId: string) {
  try {
    // Buscar todas as conquistas do tenant
    const { data: achievements, error: achievementsError } = await supabase
      .from('achievements')
      .select('*')
      .eq('tenant_id', tenantId);

    if (achievementsError) throw achievementsError;

    // Buscar histórico de treinos do usuário
    const { data: workoutHistory, error: historyError } = await supabase
      .from('workout_history')
      .select('*')
      .eq('student_id', userId)
      .eq('tenant_id', tenantId);

    if (historyError) throw historyError;

    // Buscar perfil do usuário para pontos totais
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('total_points')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;

    // Verificar cada conquista
    for (const achievement of achievements) {
      // Verificar se o usuário já possui esta conquista
      const { data: existingAchievement, error: existingError } = await supabase
        .from('user_achievements')
        .select('id')
        .eq('user_id', userId)
        .eq('achievement_id', achievement.id)
        .maybeSingle();

      if (existingError) throw existingError;
      if (existingAchievement) continue; // Já possui

      // Verificar critério
      let criteriaFulfilled = false;

      switch (achievement.criteria_type) {
        case 'workouts_completed':
          criteriaFulfilled = workoutHistory.length >= achievement.criteria_value;
          break;
          
        case 'consecutive_days':
          criteriaFulfilled = calculateStreak(workoutHistory) >= achievement.criteria_value;
          break;
          
        case 'total_weight':
          const totalWeight = workoutHistory.reduce((sum: number, wh: any) => sum + (wh.total_weight || 0), 0);
          criteriaFulfilled = totalWeight >= achievement.criteria_value;
          break;
          
        case 'exercises_completed':
          const totalExercises = workoutHistory.reduce((sum: number, wh: any) => sum + (wh.exercises_completed || 0), 0);
          criteriaFulfilled = totalExercises >= achievement.criteria_value;
          break;
      }

      // Conceder conquista se critério atendido
      if (criteriaFulfilled) {
        // Adicionar conquista
        const { error: insertError } = await supabase
          .from('user_achievements')
          .insert({
            user_id: userId,
            achievement_id: achievement.id,
            tenant_id: tenantId
          });

        if (insertError) throw insertError;

        // Adicionar pontos da conquista
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            total_points: (profile.total_points || 0) + achievement.points_reward
          })
          .eq('id', userId);

        if (updateError) throw updateError;

        console.log(`Achievement ${achievement.name} awarded to user ${userId}`);
      }
    }
  } catch (error) {
    console.error('Error checking achievements:', error);
    // Não falhar o treino por erro nas conquistas
  }
}

function calculateStreak(history: any[]): number {
  if (!history.length) return 0;
  
  const sortedDates = history
    .map(h => new Date(h.completed_at).toDateString())
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  
  const uniqueDates = [...new Set(sortedDates)];
  
  let streak = 0;
  const today = new Date().toDateString();
  let currentDate = new Date();
  
  for (const dateStr of uniqueDates) {
    const workoutDate = new Date(dateStr);
    const diffDays = Math.floor((currentDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === streak) {
      streak++;
      currentDate = workoutDate;
    } else {
      break;
    }
  }
  
  return streak;
}