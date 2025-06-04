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
    const { exerciseId, workoutId, weight, notes, setWeights } = data;

    // Record exercise progress with set weights
    const { error } = await supabase
      .from('exercise_progress')
      .insert({
        student_id: profile.id,
        workout_id: workoutId,
        exercise_id: exerciseId,
        weight: weight,
        notes: notes,
        set_weights: setWeights, // Store the weights for each set
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
      { error: error.message || 'An error occurred while saving progress' },
      { status: 500 }
    );
  }
}