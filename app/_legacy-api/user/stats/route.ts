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
      .select('id, total_points, last_workout_date')
      .eq('user_id', session.user.id)
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 }
      );
    }

    // Get workout history count
    const { count: workoutsCount, error: workoutsError } = await supabase
      .from('workout_history')
      .select('*', { count: 'exact', head: true })
      .eq('student_id', profile.id);

    if (workoutsError) {
      return NextResponse.json(
        { error: workoutsError.message },
        { status: 500 }
      );
    }

    // Get user achievements count
    const { count: achievementsCount, error: achievementsError } = await supabase
      .from('user_achievements')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', profile.id);

    if (achievementsError) {
      return NextResponse.json(
        { error: achievementsError.message },
        { status: 500 }
      );
    }

    // Calculate level based on points
    const totalPoints = profile.total_points || 0;
    const level = Math.floor(Math.sqrt(totalPoints / 100)) + 1;

    // Calculate streak (in a real app, this would be more complex)
    const streak = calculateStreak(profile.last_workout_date);

    // Calculate next level requirements
    const pointsForCurrentLevel = (level - 1) * (level - 1) * 100;
    const pointsForNextLevel = level * level * 100;
    const pointsToNextLevel = pointsForNextLevel - totalPoints;
    const progressToNextLevel = ((totalPoints - pointsForCurrentLevel) / (pointsForNextLevel - pointsForCurrentLevel)) * 100;

    return NextResponse.json({
      workoutsCompleted: workoutsCount || 0,
      achievementsEarned: achievementsCount || 0,
      totalPoints,
      level,
      streak,
      nextLevel: {
        level: level + 1,
        pointsRequired: pointsForNextLevel,
        pointsToNextLevel,
        progressPercentage: progressToNextLevel
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'An error occurred while fetching user stats' },
      { status: 500 }
    );
  }
}

function calculateStreak(lastWorkoutDate: string | null): number {
  if (!lastWorkoutDate) return 0;
  
  const lastWorkout = new Date(lastWorkoutDate);
  const today = new Date();
  
  // Reset hours, minutes, seconds, and milliseconds for accurate day comparison
  lastWorkout.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  // Calculate difference in days
  const diffTime = Math.abs(today.getTime() - lastWorkout.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // If last workout was today or yesterday, maintain streak
  if (diffDays <= 1) {
    // In a real app, you would fetch the actual streak from a database
    // For this example, we'll return a mock value
    return 3; // Mock streak value
  }
  
  // Streak broken
  return 0;
}