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
      .select('id, role, tenant_id')
      .eq('user_id', session.user.id)
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 }
      );
    }

    // Buscar a dieta com todos os relacionamentos
    const { data: diet, error } = await supabase
      .from('diets')
      .select(`
        *,
        student:profiles!student_id(
          id,
          full_name,
          avatar_url,
          weight,
          height,
          birth_date
        ),
        creator:profiles!created_by(
          id,
          full_name,
          role
        ),
        physical_assessment:physical_assessments(
          *
        ),
        meals:diet_meals(
          *,
          foods:diet_meal_foods(*)
        ),
        shopping_list:diet_shopping_lists(*)
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

    // Verificar permissões
    if (profile.role === 'student' && diet.student_id !== profile.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json(diet);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'An error occurred while fetching the diet' },
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
      .select('id, role, tenant_id')
      .eq('user_id', session.user.id)
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 }
      );
    }

    const data = await request.json();

    // Verificar se a dieta pertence ao tenant
    const { data: existingDiet, error: checkError } = await supabase
      .from('diets')
      .select('id, created_by, student_id')
      .eq('id', params.id)
      .eq('tenant_id', profile.tenant_id)
      .single();

    if (checkError || !existingDiet) {
      return NextResponse.json(
        { error: 'Diet not found' },
        { status: 404 }
      );
    }

    // Verificar permissões
    if (profile.role === 'student' && existingDiet.student_id !== profile.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const { data: diet, error } = await supabase
      .from('diets')
      .update(data)
      .eq('id', params.id)
      .select(`
        *,
        student:profiles!student_id(
          id,
          full_name,
          avatar_url
        ),
        creator:profiles!created_by(
          id,
          full_name,
          role
        )
      `)
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(diet);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'An error occurred while updating the diet' },
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
      .select('id, role, tenant_id')
      .eq('user_id', session.user.id)
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 }
      );
    }

    // Verificar se a dieta existe e pertence ao usuário/tenant
    const { data: existingDiet, error: checkError } = await supabase
      .from('diets')
      .select('id, created_by, student_id')
      .eq('id', params.id)
      .eq('tenant_id', profile.tenant_id)
      .single();

    if (checkError || !existingDiet) {
      return NextResponse.json(
        { error: 'Diet not found' },
        { status: 404 }
      );
    }

    // Verificar permissões
    if (profile.role === 'student' && existingDiet.student_id !== profile.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const { error } = await supabase
      .from('diets')
      .delete()
      .eq('id', params.id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'An error occurred while deleting the diet' },
      { status: 500 }
    );
  }
}