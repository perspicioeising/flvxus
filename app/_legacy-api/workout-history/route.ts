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

    // Get workout history
    const { data: history, error } = await supabase
      .from('workout_history')
      .select(`
        id,
        workout_id,
        workout:workouts (
          id,
          name,
          description
        ),
        completed_at,
        duration,
        exercises_completed,
        total_weight,
        notes
      `)
      .eq('student_id', profile.id)
      .order('completed_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(history);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'An error occurred while fetching workout history' },
      { status: 500 }
    );
  }
}