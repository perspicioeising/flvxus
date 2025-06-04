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
      .select('id, tenant_id, total_points')
      .eq('user_id', session.user.id)
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 }
      );
    }

    const data = await request.json();
    const { workoutId, duration } = data;

    // Get exercise progress for this workout
    const { data: progress, error: progressError } = await supabase
      .from('exercise_progress')
      .select('weight, set_weights')
      .eq('workout_id', workoutId)
      .eq('student_id', profile.id);

    if (progressError) {
      return NextResponse.json(
        { error: progressError.message },
        { status: 500 }
      );
    }

    // Calculate total weight lifted
    const totalWeight = progress.reduce((sum, p) => {
      // If we have set_weights, use the sum of all sets
      if (p.set_weights && p.set_weights.length > 0) {
        return sum + p.set_weights.reduce((setSum, weight) => setSum + (weight || 0), 0);
      }
      // Otherwise use the average weight
      return sum + (p.weight || 0);
    }, 0);

    // Record workout completion
    const { error } = await supabase
      .from('workout_history')
      .insert({
        student_id: profile.id,
        workout_id: workoutId,
        completed_at: new Date().toISOString(),
        duration,
        exercises_completed: progress.length,
        total_weight: totalWeight,
        tenant_id: profile.tenant_id
      });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Update user's last workout date and add points
    const pointsEarned = 10; // Base points for completing a workout
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        last_workout_date: new Date().toISOString(),
        total_points: (profile.total_points || 0) + pointsEarned
      })
      .eq('id', profile.id);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    // Check for achievements
    await checkAndAwardAchievements(supabase, profile.id, profile.tenant_id);

    return NextResponse.json({ 
      success: true,
      pointsEarned
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'An error occurred while completing the workout' },
      { status: 500 }
    );
  }
}

async function checkAndAwardAchievements(supabase: any, userId: string, tenantId: string) {
  try {
    // Get all achievements for this tenant
    const { data: achievements, error: achievementsError } = await supabase
      .from('achievements')
      .select('*')
      .eq('tenant_id', tenantId);

    if (achievementsError) throw achievementsError;

    // Get user's workout history
    const { data: workoutHistory, error: historyError } = await supabase
      .from('workout_history')
      .select('*')
      .eq('student_id', userId);

    if (historyError) throw historyError;

    // Get user's current points
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('total_points')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;

    // Check each achievement
    for (const achievement of achievements) {
      // Check if user already has this achievement
      const { data: existingAchievement, error: existingError } = await supabase
        .from('user_achievements')
        .select('id')
        .eq('user_id', userId)
        .eq('achievement_id', achievement.id)
        .maybeSingle();

      if (existingError) throw existingError;
      if (existingAchievement) continue; // Skip if already earned

      // Check if achievement criteria is met
      let criteriaFulfilled = false;

      if (achievement.criteria_type === 'workouts_completed') {
        criteriaFulfilled = workoutHistory.length >= achievement.criteria_value;
      } else if (achievement.criteria_type === 'consecutive_days') {
        // This would require more complex logic in a real app
        // For now, we'll just check if they have enough workouts
        criteriaFulfilled = workoutHistory.length >= achievement.criteria_value;
      } else if (achievement.criteria_type === 'total_weight') {
        const totalWeight = workoutHistory.reduce((sum, wh) => sum + (wh.total_weight || 0), 0);
        criteriaFulfilled = totalWeight >= achievement.criteria_value;
      } else if (achievement.criteria_type === 'exercises_completed') {
        const totalExercises = workoutHistory.reduce((sum, wh) => sum + (wh.exercises_completed || 0), 0);
        criteriaFulfilled = totalExercises >= achievement.criteria_value;
      }

      // Award achievement if criteria is met
      if (criteriaFulfilled) {
        // Add achievement to user_achievements
        const { error: insertError } = await supabase
          .from('user_achievements')
          .insert({
            user_id: userId,
            achievement_id: achievement.id,
            tenant_id: tenantId
          });

        if (insertError) throw insertError;

        // Add points to user
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            total_points: (profile.total_points || 0) + achievement.points_reward
          })
          .eq('id', userId);

        if (updateError) throw updateError;
      }
    }
  } catch (error) {
    console.error('Error checking achievements:', error);
  }
}