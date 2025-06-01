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
      .select('id, tenant_id')
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
      .select('weight')
      .eq('workout_id', workoutId)
      .eq('student_id', profile.id);

    if (progressError) {
      return NextResponse.json(
        { error: progressError.message },
        { status: 500 }
      );
    }

    // Calculate total weight lifted
    const totalWeight = progress.reduce((sum, p) => sum + (p.weight || 0), 0);

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

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'An error occurred while completing the workout' },
      { status: 500 }
    );
  }
}