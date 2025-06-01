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

    // Get assessment with posture assessment data
    const { data: assessment, error } = await supabase
      .from('physical_assessments')
      .select(`
        *,
        student:profiles (
          id,
          full_name,
          email
        ),
        posture_assessment:posture_assessments (
          id,
          front_image_url,
          side_image_url,
          back_image_url,
          ai_analysis,
          recommendations,
          notes
        )
      `)
      .eq('id', params.id)
      .eq('tenant_id', profile.tenant_id)
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(assessment);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'An error occurred while fetching the assessment' },
      { status: 500 }
    );
  }
}

export async function POST(
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

    // Check if posture assessment already exists
    const { data: existingAssessment } = await supabase
      .from('posture_assessments')
      .select('id')
      .eq('student_id', params.id)
      .single();

    if (existingAssessment) {
      // Update existing assessment
      const { error } = await supabase
        .from('posture_assessments')
        .update({
          front_image_url: data.front_image_url,
          side_image_url: data.side_image_url,
          back_image_url: data.back_image_url,
          ai_analysis: data.ai_analysis,
          recommendations: data.recommendations,
          notes: data.notes
        })
        .eq('id', existingAssessment.id)
        .eq('tenant_id', profile.tenant_id);

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }
    } else {
      // Create new assessment
      const { error } = await supabase
        .from('posture_assessments')
        .insert({
          student_id: params.id,
          front_image_url: data.front_image_url,
          side_image_url: data.side_image_url,
          back_image_url: data.back_image_url,
          ai_analysis: data.ai_analysis,
          recommendations: data.recommendations,
          notes: data.notes,
          tenant_id: profile.tenant_id
        });

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'An error occurred while saving the assessment' },
      { status: 500 }
    );
  }
}