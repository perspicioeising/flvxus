// app/api/diets/[id]/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log('=== BUSCANDO DETALHES DA DIETA ===');
  console.log('Diet ID:', params.id);
  
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

    // Buscar a dieta principal SEM relacionamentos
    const { data: diet, error: dietError } = await supabase
      .from('diets')
      .select('*')
      .eq('id', params.id)
      .eq('tenant_id', profile.tenant_id)
      .single();

    if (dietError) {
      console.error('Erro ao buscar dieta:', dietError);
      return NextResponse.json(
        { error: dietError.message },
        { status: 500 }
      );
    }

    if (!diet) {
      return NextResponse.json(
        { error: 'Diet not found' },
        { status: 404 }
      );
    }

    // Verificar permissões
    if (profile.role === 'student' && diet.student_id !== profile.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    console.log('Dieta encontrada:', diet.name);

    // Buscar dados do estudante
    const { data: student, error: studentError } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, weight, height, birth_date')
      .eq('id', diet.student_id)
      .single();

    if (studentError) {
      console.error('Erro ao buscar estudante:', studentError);
    }

    // Buscar dados do criador
    const { data: creator, error: creatorError } = await supabase
      .from('profiles')
      .select('id, full_name, role')
      .eq('id', diet.created_by)
      .single();

    if (creatorError) {
      console.error('Erro ao buscar criador:', creatorError);
    }

    // Buscar avaliação física se houver
    let physicalAssessment = null;
    if (diet.physical_assessment_id) {
      const { data: assessment, error: assessmentError } = await supabase
        .from('physical_assessments')
        .select('*')
        .eq('id', diet.physical_assessment_id)
        .single();

      if (!assessmentError && assessment) {
        physicalAssessment = assessment;
      }
    }

    // Buscar refeições
    const { data: meals, error: mealsError } = await supabase
      .from('diet_meals')
      .select('*')
      .eq('diet_id', diet.id)
      .order('order_index');

    if (mealsError) {
      console.error('Erro ao buscar refeições:', mealsError);
    }

    // Buscar alimentos para cada refeição
    let mealsWithFoods = [];
    if (meals && meals.length > 0) {
      mealsWithFoods = await Promise.all(
        meals.map(async (meal) => {
          const { data: foods, error: foodsError } = await supabase
            .from('diet_meal_foods')
            .select('*')
            .eq('meal_id', meal.id)
            .order('order_index');

          if (foodsError) {
            console.error('Erro ao buscar alimentos:', foodsError);
          }

          return {
            ...meal,
            foods: foods || []
          };
        })
      );
    }

    // Buscar lista de compras
    const { data: shoppingList, error: shoppingError } = await supabase
      .from('diet_shopping_lists')
      .select('*')
      .eq('diet_id', diet.id)
      .order('order_index');

    if (shoppingError) {
      console.error('Erro ao buscar lista de compras:', shoppingError);
    }

    // Montar resposta completa
    const enrichedDiet = {
      ...diet,
      student: student || null,
      creator: creator || null,
      physical_assessment: physicalAssessment,
      meals: mealsWithFoods,
      shopping_list: shoppingList || []
    };

    console.log('=== DETALHES DA DIETA CARREGADOS ===');
    console.log('Refeições:', mealsWithFoods.length);
    console.log('Lista de compras:', shoppingList?.length || 0);

    return NextResponse.json(enrichedDiet);
    
  } catch (error: any) {
    console.error('=== ERRO AO BUSCAR DETALHES DA DIETA ===', error);
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

    // Atualizar a dieta
    const { data: updatedDiet, error: updateError } = await supabase
      .from('diets')
      .update(data)
      .eq('id', params.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    // Buscar dados relacionados para retorno
    const { data: student } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .eq('id', updatedDiet.student_id)
      .single();

    const { data: creator } = await supabase
      .from('profiles')
      .select('id, full_name, role')
      .eq('id', updatedDiet.created_by)
      .single();

    const enrichedDiet = {
      ...updatedDiet,
      student,
      creator
    };

    return NextResponse.json(enrichedDiet);
    
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

    // Deletar a dieta (cascade vai deletar refeições e alimentos relacionados)
    const { error: deleteError } = await supabase
      .from('diets')
      .delete()
      .eq('id', params.id);

    if (deleteError) {
      return NextResponse.json(
        { error: deleteError.message },
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