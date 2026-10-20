import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    console.log('🚀 Iniciando busca de treinos do aluno...');

    // 1. Verificar autenticação
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      console.log('❌ Erro de autenticação:', authError);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    console.log('✅ Usuário autenticado:', session.user.id);

    // 2. Buscar perfil do usuário
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, tenant_id, role, full_name')
      .eq('user_id', session.user.id)
      .single();

    if (profileError) {
      console.log('❌ Erro ao buscar perfil:', profileError);
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 }
      );
    }

    console.log('✅ Perfil encontrado:', {
      id: profile.id,
      tenant_id: profile.tenant_id,
      role: profile.role,
      name: profile.full_name
    });

    // 3. Verificar se é estudante
    if (profile.role !== 'student') {
      console.log('❌ Usuário não é estudante:', profile.role);
      return NextResponse.json(
        { error: 'Access restricted to students' },
        { status: 403 }
      );
    }

    // 4. Buscar planos de treino do aluno
    console.log('🔍 Buscando planos de treino para o aluno:', profile.id);
    
    const { data: workoutPlans, error: plansError } = await supabase
      .from('workout_plans')
      .select('*')
      .eq('student_id', profile.id)
      .eq('tenant_id', profile.tenant_id)
      .order('created_at', { ascending: false });

    if (plansError) {
      console.log('❌ Erro ao buscar planos:', plansError);
      return NextResponse.json(
        { error: plansError.message },
        { status: 500 }
      );
    }

    console.log('📊 Planos encontrados:', workoutPlans?.length || 0);

    if (!workoutPlans || workoutPlans.length === 0) {
      console.log('⚠️ Nenhum plano encontrado, retornando array vazio');
      return NextResponse.json([]);
    }

    // 5. Buscar workout_plan_items para cada plano
    const planIds = workoutPlans.map(plan => plan.id);
    console.log('🔍 Buscando workout_plan_items para os planos:', planIds);

    const { data: workoutItems, error: itemsError } = await supabase
      .from('workout_plan_items')
      .select('*')
      .in('workout_plan_id', planIds)
      .eq('tenant_id', profile.tenant_id);

    if (itemsError) {
      console.log('❌ Erro ao buscar workout items:', itemsError);
      return NextResponse.json(
        { error: itemsError.message },
        { status: 500 }
      );
    }

    console.log('📊 Workout items encontrados:', workoutItems?.length || 0);

    if (!workoutItems || workoutItems.length === 0) {
      console.log('⚠️ Nenhum workout item encontrado');
      return NextResponse.json(workoutPlans.map(plan => ({
        id: plan.id,
        name: plan.name,
        description: plan.description,
        startDate: plan.start_date,
        endDate: plan.end_date,
        workouts: []
      })));
    }

    // 6. Buscar dados dos workouts
    const workoutIds = [...new Set(workoutItems.map(item => item.workout_id))];
    console.log('🔍 Buscando workouts únicos:', workoutIds.length);

    const { data: workouts, error: workoutsError } = await supabase
      .from('workouts')
      .select('*')
      .in('id', workoutIds)
      .eq('tenant_id', profile.tenant_id);

    if (workoutsError) {
      console.log('❌ Erro ao buscar workouts:', workoutsError);
      return NextResponse.json(
        { error: workoutsError.message },
        { status: 500 }
      );
    }

    console.log('📊 Workouts encontrados:', workouts?.length || 0);

    // 7. Buscar exercícios dos workouts COM A NOVA ESTRUTURA
    const { data: workoutExercises, error: exercisesError } = await supabase
      .from('workout_exercises')
      .select('*')
      .in('workout_id', workoutIds)
      .eq('tenant_id', profile.tenant_id)
      .order('order');

    if (exercisesError) {
      console.log('❌ Erro ao buscar workout exercises:', exercisesError);
      return NextResponse.json(
        { error: exercisesError.message },
        { status: 500 }
      );
    }

    console.log('📊 Workout exercises encontrados:', workoutExercises?.length || 0);

    // 8. Buscar dados dos exercícios
    let exercises = [];
    if (workoutExercises && workoutExercises.length > 0) {
      const exerciseIds = [...new Set(workoutExercises.map(we => we.exercise_id))];
      console.log('🔍 Buscando exercises únicos:', exerciseIds.length);

      const { data: exercisesData, error: exercisesDataError } = await supabase
        .from('exercises')
        .select('*')
        .in('id', exerciseIds)
        .eq('tenant_id', profile.tenant_id);

      if (exercisesDataError) {
        console.log('❌ Erro ao buscar exercises data:', exercisesDataError);
      } else {
        exercises = exercisesData || [];
        console.log('📊 Exercises data encontrados:', exercises.length);
      }
    }

    // 9. Buscar histórico de progresso do aluno (últimos 30 dias)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: exerciseProgress, error: progressError } = await supabase
      .from('exercise_progress')
      .select('*')
      .eq('student_id', profile.id)
      .eq('tenant_id', profile.tenant_id)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false });

    if (progressError) {
      console.log('⚠️ Erro ao buscar progresso:', progressError);
    } else {
      console.log('📊 Registros de progresso encontrados:', exerciseProgress?.length || 0);
    }

    // 10. Montar resposta estruturada
    console.log('🔨 Montando resposta final...');

    const result = workoutPlans.map(plan => {
      console.log(`📝 Processando plano: ${plan.name}`);
      
      // Buscar items deste plano
      const planItems = workoutItems.filter(item => item.workout_plan_id === plan.id);
      console.log(`   - Items do plano: ${planItems.length}`);

      const planWorkouts = planItems.map(item => {
        // Buscar workout
        const workout = workouts?.find(w => w.id === item.workout_id);
        if (!workout) {
          console.log(`   ⚠️ Workout não encontrado: ${item.workout_id}`);
          return null;
        }

        console.log(`   - Processando workout: ${workout.name}`);

        // Buscar exercícios deste workout
        const workoutExercisesList = workoutExercises?.filter(we => we.workout_id === workout.id) || [];
        console.log(`     - Exercícios do workout: ${workoutExercisesList.length}`);

        const workoutExercisesWithData = workoutExercisesList.map(we => {
          const exercise = exercises.find(e => e.id === we.exercise_id);
          
          // Buscar último progresso deste exercício
          const lastProgress = exerciseProgress
            ?.filter(p => p.exercise_id === we.exercise_id && p.workout_id === workout.id)
            ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

          return {
            id: we.id,
            exerciseId: we.exercise_id,
            name: exercise?.name || 'Exercício não encontrado',
            description: exercise?.description || '',
            videoUrl: exercise?.video_url || null,
            audioUrl: exercise?.audio_url || null,
            muscleGroup: exercise?.muscle_group || [],
            equipment: exercise?.equipment || [],
            sets: we.sets,
            reps: we.reps,
            duration: we.duration,
            rest: we.rest,
            notes: we.notes,
            general_notes: we.general_notes,
            sets_config: we.sets_config || null,
            order: we.order,
            tips: exercise?.tips || [],
            commonErrors: exercise?.common_errors || [],
            lastProgress: lastProgress ? {
              weight: lastProgress.weight,
              setWeights: lastProgress.set_weights,
              notes: lastProgress.notes,
              completedAt: lastProgress.created_at
            } : null,
            // Estrutura completa do exercício para o componente
            exercise: {
              id: exercise?.id,
              name: exercise?.name,
              description: exercise?.description,
              video_url: exercise?.video_url,
              audio_url: exercise?.audio_url,
              muscle_group: exercise?.muscle_group || [],
              equipment: exercise?.equipment || [],
              tips: exercise?.tips || [],
              common_errors: exercise?.common_errors || []
            }
          };
        });

        return {
          id: workout.id,
          name: workout.name,
          description: workout.description,
          level: workout.level,
          goal: workout.goal,
          planId: plan.id,
          planName: plan.name,
          dayOfWeek: item.day_of_week,
          exercises: workoutExercisesWithData.sort((a, b) => a.order - b.order),
          duration: workoutExercisesList.reduce((sum, ex) => {
            // Calcular duração estimada baseada no número de séries e tempo de descanso
            const setsTime = (ex.sets || 0) * 45; // 45 segundos por série em média
            const restTime = (ex.sets - 1) * (ex.rest || 60); // Tempo de descanso entre séries
            return sum + setsTime + restTime;
          }, 0) / 60, // Converter para minutos
          // Incluir também no formato antigo para compatibilidade
          workout_exercises: workoutExercisesWithData.sort((a, b) => a.order - b.order)
        };
      }).filter(w => w !== null);

      return {
        id: plan.id,
        name: plan.name,
        description: plan.description,
        startDate: plan.start_date,
        endDate: plan.end_date,
        status: plan.status || 'active',
        workouts: planWorkouts
      };
    });

    console.log('✅ Resposta montada com sucesso!');
    console.log('📊 Total de planos:', result.length);
    console.log('📊 Total de workouts:', result.reduce((sum, plan) => sum + plan.workouts.length, 0));
    
    // Log resumido da estrutura final
    result.forEach((plan, index) => {
      console.log(`Plano ${index + 1}: ${plan.name} - ${plan.workouts.length} workouts`);
      plan.workouts.forEach((workout, wIndex) => {
        console.log(`  Workout ${wIndex + 1}: ${workout.name} - ${workout.exercises.length} exercícios`);
        
        // Contar exercícios com sets_config
        const exercisesWithConfig = workout.exercises.filter(ex => ex.sets_config).length;
        if (exercisesWithConfig > 0) {
          console.log(`    - ${exercisesWithConfig} exercícios com configuração personalizada de séries`);
        }
      });
    });

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('💥 Erro geral na API:', error);
    console.error('Stack trace:', error.stack);
    return NextResponse.json(
      { error: error.message || 'An error occurred while fetching workouts' },
      { status: 500 }
    );
  }
}