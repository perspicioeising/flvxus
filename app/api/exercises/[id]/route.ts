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
      .select('tenant_id')
      .eq('user_id', session.user.id)
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 }
      );
    }

    const { data: exercise, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('id', params.id)
      .eq('tenant_id', profile.tenant_id)
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(exercise);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'An error occurred while fetching the exercise' },
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

    const { data: exercise, error } = await supabase
      .from('exercises')
      .update(data)
      .eq('id', params.id)
      .eq('tenant_id', profile.tenant_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(exercise);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'An error occurred while updating the exercise' },
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

    // Check for dependencies in workout_exercises
    const { data: dependencies, error: dependenciesError } = await supabase
      .from('workout_exercises')
      .select('id')
      .eq('exercise_id', params.id)
      .limit(1);

    if (dependenciesError) {
      return NextResponse.json(
        { error: dependenciesError.message },
        { status: 500 }
      );
    }

    // If dependencies exist, return a conflict error
    if (dependencies && dependencies.length > 0) {
      return NextResponse.json(
        { 
          error: 'Este exercício não pode ser excluído pois está sendo usado em um ou mais treinos.',
          code: 'DEPENDENCY_ERROR'
        },
        { status: 409 }
      );
    }

    // Get exercise to delete associated video if exists
    const { data: exercise } = await supabase
      .from('exercises')
      .select('video_url')
      .eq('id', params.id)
      .eq('tenant_id', profile.tenant_id)
      .single();

    if (exercise?.video_url) {
      const videoPath = new URL(exercise.video_url).pathname.split('/').pop();
      if (videoPath) {
        await supabase.storage
          .from('exercise-videos')
          .remove([`videos/${videoPath}`]);
      }
    }

    const { error } = await supabase
      .from('exercises')
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
      { error: error.message || 'An error occurred while deleting the exercise' },
      { status: 500 }
    );
  }
}