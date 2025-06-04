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

    // Get all achievements for the tenant
    const { data: achievements, error: achievementsError } = await supabase
      .from('achievements')
      .select('*')
      .eq('tenant_id', profile.tenant_id);

    if (achievementsError) {
      return NextResponse.json(
        { error: achievementsError.message },
        { status: 500 }
      );
    }

    // Get user's earned achievements
    const { data: userAchievements, error: userAchievementsError } = await supabase
      .from('user_achievements')
      .select(`
        *,
        achievement:achievements (*)
      `)
      .eq('user_id', profile.id);

    if (userAchievementsError) {
      return NextResponse.json(
        { error: userAchievementsError.message },
        { status: 500 }
      );
    }

    // Get user's progress data for achievements
    const { data: workoutHistory, error: workoutHistoryError } = await supabase
      .from('workout_history')
      .select('*')
      .eq('student_id', profile.id);

    if (workoutHistoryError) {
      return NextResponse.json(
        { error: workoutHistoryError.message },
        { status: 500 }
      );
    }

    // Calculate progress for each achievement
    const achievementsWithProgress = achievements.map(achievement => {
      const earned = userAchievements.some(ua => ua.achievement_id === achievement.id);
      let progress = 0;

      if (achievement.criteria_type === 'workouts_completed') {
        progress = Math.min(100, (workoutHistory.length / achievement.criteria_value) * 100);
      } else if (achievement.criteria_type === 'consecutive_days') {
        // This would require more complex logic in a real app
        progress = Math.min(100, (3 / achievement.criteria_value) * 100); // Mock data: 3 day streak
      } else if (achievement.criteria_type === 'total_weight') {
        const totalWeight = workoutHistory.reduce((sum, wh) => sum + (wh.total_weight || 0), 0);
        progress = Math.min(100, (totalWeight / achievement.criteria_value) * 100);
      } else if (achievement.criteria_type === 'exercises_completed') {
        const totalExercises = workoutHistory.reduce((sum, wh) => sum + (wh.exercises_completed || 0), 0);
        progress = Math.min(100, (totalExercises / achievement.criteria_value) * 100);
      }

      return {
        ...achievement,
        earned,
        progress: Math.round(progress)
      };
    });

    return NextResponse.json({
      achievements: achievementsWithProgress,
      userAchievements
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'An error occurred while fetching achievements' },
      { status: 500 }
    );
  }
}