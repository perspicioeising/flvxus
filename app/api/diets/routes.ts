// app/api/diets/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  const { searchParams } = new URL(request.url);
  
  // Get pagination parameters
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const offset = (page - 1) * limit;
  const studentId = searchParams.get('studentId');

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

    let query = supabase
      .from('diets')
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
        ),
        physical_assessment:physical_assessments(
          id,
          weight,
          height,
          fat_percentage,
          lean_mass
        )
      `, { count: 'exact' })
      .eq('tenant_id', profile.tenant_id)
      .order('created_at', { ascending: false });

    // Se for aluno, filtrar apenas suas dietas
    if (profile.role === 'student') {
      query = query.eq('student_id', profile.id);
    } else if (studentId) {
      // Se for personal e passou studentId, filtrar por aluno
      query = query.eq('student_id', studentId);
    }

    // Get total count
    const { count: totalCount } = await query;

    // Get paginated data
    const { data: diets, error } = await query
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      diets,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil((totalCount || 0) / limit)
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'An error occurred while fetching diets' },
      { status: 500 }
    );
  }
}

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
    
    // Se for aluno, o student_id deve ser o próprio id
    if (profile.role === 'student') {
      data.student_id = profile.id;
    }

    // Criar a dieta
    const { data: diet, error: dietError } = await supabase
      .from('diets')
      .insert({
        ...data,
        created_by: profile.id,
        tenant_id: profile.tenant_id,
        status: 'active'
      })
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

    if (dietError) {
      return NextResponse.json(
        { error: dietError.message },
        { status: 500 }
      );
    }

    // Se houver refeições para criar
    if (data.meals && data.meals.length > 0) {
      const mealsToInsert = data.meals.map((meal: any, index: number) => ({
        ...meal,
        diet_id: diet.id,
        order_index: index,
        tenant_id: profile.tenant_id
      }));

      const { error: mealsError } = await supabase
        .from('diet_meals')
        .insert(mealsToInsert);

      if (mealsError) {
        // Rollback - deletar a dieta criada
        await supabase.from('diets').delete().eq('id', diet.id);
        
        return NextResponse.json(
          { error: mealsError.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(diet);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'An error occurred while creating the diet' },
      { status: 500 }
    );
  }
}


