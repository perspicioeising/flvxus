import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  console.log('=== DIETS GET ROUTE FUNCIONANDO ===');
  console.log('URL:', request.url);
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

    // Primeiro, buscar as dietas sem relacionamentos
    let dietsQuery = supabase
      .from('diets')
      .select('*', { count: 'exact' })
      .eq('tenant_id', profile.tenant_id)
      .order('created_at', { ascending: false });

    // Se for aluno, filtrar apenas suas dietas
    if (profile.role === 'student') {
      dietsQuery = dietsQuery.eq('student_id', profile.id);
    } else if (studentId) {
      // Se for personal e passou studentId, filtrar por aluno
      dietsQuery = dietsQuery.eq('student_id', studentId);
    }

    // Get total count
    const { count: totalCount } = await dietsQuery;

    // Get paginated data
    const { data: diets, error: dietsError } = await dietsQuery
      .range(offset, offset + limit - 1);

    if (dietsError) {
      console.error('Erro ao buscar dietas:', dietsError);
      return NextResponse.json(
        { error: dietsError.message },
        { status: 500 }
      );
    }

    if (!diets || diets.length === 0) {
      return NextResponse.json({
        diets: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0
        }
      });
    }

    // Buscar informações dos estudantes e criadores separadamente
    const studentIds = [...new Set(diets.map(diet => diet.student_id))];
    const creatorIds = [...new Set(diets.map(diet => diet.created_by))];

    console.log('Student IDs:', studentIds);
    console.log('Creator IDs:', creatorIds);

    // Buscar dados dos estudantes
    const { data: students, error: studentsError } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .in('id', studentIds);

    if (studentsError) {
      console.error('Erro ao buscar estudantes:', studentsError);
    }

    // Buscar dados dos criadores
    const { data: creators, error: creatorsError } = await supabase
      .from('profiles')
      .select('id, full_name, role')
      .in('id', creatorIds);

    if (creatorsError) {
      console.error('Erro ao buscar criadores:', creatorsError);
    }

    // Mapear os dados
    const enrichedDiets = diets.map(diet => ({
      ...diet,
      student: students?.find(s => s.id === diet.student_id) || null,
      creator: creators?.find(c => c.id === diet.created_by) || null
    }));

    console.log('Dietas enriquecidas:', enrichedDiets.length);

    return NextResponse.json({
      diets: enrichedDiets,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil((totalCount || 0) / limit)
      }
    });
  } catch (error: any) {
    console.error('Erro geral na busca de dietas:', error);
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
    console.log('Dados recebidos para salvar:', JSON.stringify(data, null, 2));
    
    // Se for aluno, o student_id deve ser o próprio id
    if (profile.role === 'student') {
      data.student_id = profile.id;
    }

    // Extrair dados das refeições, lista de compras e recomendações
    const { generatedMeals, generatedShoppingList, generatedRecommendations, ...dietData } = data;

    // Preparar dados da dieta principal
    const mainDietData = {
      student_id: data.student_id,
      created_by: profile.id,
      name: data.name,
      description: data.description,
      age: data.age,
      weight: data.weight,
      height: data.height || null,
      gender: data.gender,
      activity_level: data.activity_level,
      goal: data.goal,
      goal_description: data.goal_description || '',
      budget_profile: data.budget_profile,
      meals_per_day: data.meals_per_day,
      dietary_style: data.dietary_style || [],
      food_preferences: data.food_preferences || [],
      restrictions: data.restrictions || [],
      custom_restrictions: data.custom_restrictions || '',
      used_physical_assessment: data.used_physical_assessment || false,
      physical_assessment_id: data.physical_assessment_id || null,
      target_calories: data.target_calories,
      target_protein: data.target_protein,
      target_carbs: data.target_carbs,
      target_fat: data.target_fat,
      status: 'active',
      tenant_id: profile.tenant_id
    };

    console.log('Dados da dieta principal:', JSON.stringify(mainDietData, null, 2));

    // Criar a dieta principal SEM relacionamentos
    const { data: diet, error: dietError } = await supabase
      .from('diets')
      .insert(mainDietData)
      .select()
      .single();

    if (dietError) {
      console.error('Erro ao criar dieta:', dietError);
      return NextResponse.json(
        { error: dietError.message },
        { status: 500 }
      );
    }

    console.log('Dieta criada com sucesso:', diet.id);

    // Se houver refeições para criar
    if (generatedMeals && generatedMeals.length > 0) {
      console.log('Criando refeições...');
      
      const mealsToInsert = generatedMeals.map((meal: any, index: number) => ({
        diet_id: diet.id,
        meal_type: meal.meal_type,
        meal_time: meal.meal_time,
        name: meal.name,
        description: meal.description,
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fat: meal.fat,
        order_index: index,
        tenant_id: profile.tenant_id
      }));

      const { data: createdMeals, error: mealsError } = await supabase
        .from('diet_meals')
        .insert(mealsToInsert)
        .select();

      if (mealsError) {
        console.error('Erro ao criar refeições:', mealsError);
        // Rollback - deletar a dieta criada
        await supabase.from('diets').delete().eq('id', diet.id);
        
        return NextResponse.json(
          { error: mealsError.message },
          { status: 500 }
        );
      }

      console.log('Refeições criadas:', createdMeals.length);

      // Criar alimentos para cada refeição
      for (let i = 0; i < generatedMeals.length; i++) {
        const meal = generatedMeals[i];
        const createdMeal = createdMeals[i];

        if (meal.foods && meal.foods.length > 0) {
          console.log(`Criando alimentos para refeição ${createdMeal.id}...`);
          
          const foodsToInsert = meal.foods.map((food: any, foodIndex: number) => ({
            meal_id: createdMeal.id,
            food_name: food.food_name,
            quantity: food.quantity,
            unit: food.unit,
            calories: food.calories,
            protein: food.protein,
            carbs: food.carbs,
            fat: food.fat,
            substitutions: food.substitutions || [],
            notes: food.notes || '',
            order_index: foodIndex,
            tenant_id: profile.tenant_id
          }));

          const { error: foodsError } = await supabase
            .from('diet_meal_foods')
            .insert(foodsToInsert);

          if (foodsError) {
            console.error('Erro ao criar alimentos:', foodsError);
            // Rollback - deletar a dieta criada
            await supabase.from('diets').delete().eq('id', diet.id);
            
            return NextResponse.json(
              { error: foodsError.message },
              { status: 500 }
            );
          }
        }
      }
    }

    // Se houver lista de compras para criar
    if (generatedShoppingList && generatedShoppingList.length > 0) {
      console.log('Criando lista de compras...');
      
      const shoppingToInsert = generatedShoppingList.map((item: any, index: number) => ({
        diet_id: diet.id,
        category: item.category,
        item_name: item.item_name,
        quantity: item.quantity,
        notes: item.notes || '',
        order_index: item.order_index || index,
        tenant_id: profile.tenant_id
      }));

      const { error: shoppingError } = await supabase
        .from('diet_shopping_lists')
        .insert(shoppingToInsert);

      if (shoppingError) {
        console.error('Erro ao criar lista de compras:', shoppingError);
        // Rollback - deletar a dieta criada
        await supabase.from('diets').delete().eq('id', diet.id);
        
        return NextResponse.json(
          { error: shoppingError.message },
          { status: 500 }
        );
      }
    }

    // Buscar informações do estudante e criador para retorno
    const { data: student } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .eq('id', diet.student_id)
      .single();

    const { data: creator } = await supabase
      .from('profiles')
      .select('id, full_name, role')
      .eq('id', diet.created_by)
      .single();

    // Retornar dieta com dados do estudante e criador
    const enrichedDiet = {
      ...diet,
      student,
      creator
    };

    console.log('Dieta salva com sucesso!');
    return NextResponse.json(enrichedDiet);
    
  } catch (error: any) {
    console.error('Erro geral ao criar dieta:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred while creating the diet' },
      { status: 500 }
    );
  }
}