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

    // Get user profile with tenant info
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        *,
        tenant:tenants (
          id,
          name,
          plan,
          plan_type,
          max_students,
          max_trainers,
          created_at
        )
      `)
      .eq('user_id', session.user.id)
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(profile);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'An error occurred while fetching profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
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

    const data = await request.json();

    // Update profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: data.full_name,
        avatar_url: data.avatar_url,
      })
      .eq('user_id', session.user.id)
      .select()
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 }
      );
    }

    // If tenant name is provided and user is tenant owner, update tenant name
    if (data.tenant_name) {
      const { error: tenantError } = await supabase
        .from('tenants')
        .update({ name: data.tenant_name })
        .eq('owner_id', session.user.id);

      if (tenantError) {
        return NextResponse.json(
          { error: tenantError.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(profile);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'An error occurred while updating profile' },
      { status: 500 }
    );
  }
}
