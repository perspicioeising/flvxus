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

    console.log('🔍 DEBUG - Buscando plano:', params.id, 'para tenant:', profile.tenant_id);

    // CORREÇÃO: Query separada em duas etapas para melhor debugging
    const { data: plan, error: planError } = await supabase
      .from('workout_plans')
      .select(`
        *,
        student:profiles!workout_plans_student_id_fkey (
          id,
          full_name,
          email
        )
      `)
      .eq('id', params.id)
      .eq('tenant_id', profile.tenant_id)
      .single();

    if (planError) {
      console.error('❌ Erro ao buscar plano:', planError);
      return NextResponse.json(
        { error: planError.message },
        { status: 500 }
      );
    }

    console.log('✅ Plano encontrado:', plan.name);

    // CORREÇÃO: Buscar workout_plan_items com JOIN explícito
    const { data: workoutItems, error: itemsError } = await supabase
      .from('workout_plan_items')
      .select(`
        id,
        workout_id,
        day_of_week,
        workout:workouts (
          id,
          name,
          description,
          level,
          goal,
          created_at,
          updated_at
        )
      `)
      .eq('workout_plan_id', params.id)
      .eq('tenant_id', profile.tenant_id);

    if (itemsError) {
      console.error('❌ Erro ao buscar workout items:', itemsError);
      // Não falhar se não houver items, apenas logar
      console.log('⚠️ Continuando sem workout items');
    }

    console.log('🔍 DEBUG - Workout items encontrados:', workoutItems?.length || 0);
    
    if (workoutItems && workoutItems.length > 0) {
      console.log('🔍 DEBUG - Primeiro item:', workoutItems[0]);
    }

    // CORREÇÃO: Montar resposta com workouts corretamente
    const response = {
      ...plan,
      workouts: workoutItems || []
    };

    console.log('📤 Enviando resposta com', response.workouts.length, 'workouts');

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('❌ Erro geral na API:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred while fetching the workout plan' },
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

    // Update plan details
    const { data: plan, error: planError } = await supabase
      .from('workout_plans')
      .update({
        name: data.name,
        description: data.description,
        student_id: data.student_id,
        start_date: data.start_date,
        end_date: data.end_date,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .eq('tenant_id', profile.tenant_id)
      .select()
      .single();

    if (planError) {
      return NextResponse.json(
        { error: planError.message },
        { status: 500 }
      );
    }

    // Delete existing workout assignments
    const { error: deleteError } = await supabase
      .from('workout_plan_items')
      .delete()
      .eq('workout_plan_id', params.id)
      .eq('tenant_id', profile.tenant_id);

    if (deleteError) {
      console.error('Erro ao deletar items existentes:', deleteError);
    }

    // Add updated workout assignments
    if (data.workouts && data.workouts.length > 0) {
      interface WorkoutItemInput {
        workout_id: string;
        day_of_week: number;
      }

      interface WorkoutPlanItemInsert {
        workout_plan_id: string;
        workout_id: string;
        day_of_week: number;
        tenant_id: string;
        created_at: string;
        updated_at: string;
      }

      const now = new Date().toISOString();
      const planItems: WorkoutPlanItemInsert[] = (data.workouts as WorkoutItemInput[]).map((item: WorkoutItemInput): WorkoutPlanItemInsert => ({
        workout_plan_id: plan.id,
        workout_id: item.workout_id,
        day_of_week: item.day_of_week,
        tenant_id: profile.tenant_id,
        created_at: now,
        updated_at: now
      }));

      const { error: itemsError } = await supabase
        .from('workout_plan_items')
        .insert(planItems);

      if (itemsError) {
        console.error('Erro ao inserir workout items:', itemsError);
        return NextResponse.json(
          { error: itemsError.message },
          { status: 500 }
        );
      }
    }

    // Retornar o plano atualizado com os workouts
    const { data: updatedPlan, error: fetchError } = await supabase
      .from('workout_plans')
      .select(`
        *,
        student:profiles!workout_plans_student_id_fkey (
          id,
          full_name,
          email
        )
      `)
      .eq('id', params.id)
      .eq('tenant_id', profile.tenant_id)
      .single();

    if (fetchError) {
      return NextResponse.json(plan); // Retornar o plano básico se houver erro
    }

    // Buscar os workout items atualizados
    const { data: updatedItems } = await supabase
      .from('workout_plan_items')
      .select(`
        id,
        workout_id,
        day_of_week,
        workout:workouts (
          id,
          name,
          description,
          level,
          goal,
          created_at,
          updated_at
        )
      `)
      .eq('workout_plan_id', params.id)
      .eq('tenant_id', profile.tenant_id);

    return NextResponse.json({
      ...updatedPlan,
      workouts: updatedItems || []
    });
  } catch (error: any) {
    console.error('❌ Erro no PUT:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred while updating the workout plan' },
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

    // Primeiro deletar os workout_plan_items (cascade pode não estar configurado)
    const { error: itemsDeleteError } = await supabase
      .from('workout_plan_items')
      .delete()
      .eq('workout_plan_id', params.id)
      .eq('tenant_id', profile.tenant_id);

    if (itemsDeleteError) {
      console.error('Erro ao deletar workout items:', itemsDeleteError);
      // Continuar mesmo com erro nos items
    }

    // Depois deletar o plano
    const { error } = await supabase
      .from('workout_plans')
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
    console.error('❌ Erro no DELETE:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred while deleting the workout plan' },
      { status: 500 }
    );
  }
}