// hooks/use-diets.ts
import { useState, useEffect } from 'react';
import { useSupabase } from '@/app/providers';
import { useToast } from '@/hooks/use-toast';

interface DietParams {
  student_id: string;
  age: number;
  weight: number;
  height?: number;
  gender: string;
  activity_level: string;
  goal: string;
  goal_description?: string;
  budget_profile: string;
  meals_per_day: number;
  dietary_style: string[];
  food_preferences: string[];
  restrictions: string[];
  custom_restrictions?: string;
  physical_assessment?: any;
}

interface CreateDietParams extends DietParams {
  name: string;
  description: string;
  target_calories: number;
  target_protein: number;
  target_carbs: number;
  target_fat: number;
  used_physical_assessment: boolean;
  physical_assessment_id?: string;
  generatedMeals: any[];
  generatedShoppingList: any[];
  generatedRecommendations: string[];
}

interface Diet {
  id: string;
  name: string;
  description: string;
  student_id: string;
  student: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  age: number;
  weight: number;
  height?: number;
  gender: string;
  activity_level: string;
  goal: string;
  goal_description?: string;
  budget_profile: string;
  meals_per_day: number;
  dietary_style: string[];
  food_preferences: string[];
  restrictions: string[];
  custom_restrictions?: string;
  used_physical_assessment: boolean;
  physical_assessment_id?: string;
  target_calories: number;
  target_protein: number;
  target_carbs: number;
  target_fat: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function useDiets(studentId?: string) {
  const { supabase } = useSupabase();
  const { toast } = useToast();
  const [diets, setDiets] = useState<Diet[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchDiets();
  }, [studentId, pagination.page, pagination.limit]);

  const fetchDiets = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('diets')
        .select(`
          *,
          student:student_id (
            id,
            full_name,
            avatar_url
          )
        `, { count: 'exact' });

      if (studentId) {
        query = query.eq('student_id', studentId);
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(
          (pagination.page - 1) * pagination.limit,
          pagination.page * pagination.limit - 1
        );

      if (error) throw error;

      setDiets(data || []);
      setPagination(prev => ({
        ...prev,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / prev.limit)
      }));

    } catch (error: any) {
      console.error('Error fetching diets:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar dietas",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const generateDietWithAI = async (params: DietParams) => {
    try {
      const response = await fetch('/api/ai/generate-diet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao gerar dieta');
      }

      const data = await response.json();
      return data;

    } catch (error: any) {
      console.error('Error generating diet:', error);
      throw error;
    }
  };

  const createDiet = async (dietData: CreateDietParams) => {
    try {
      // 1. Obter sessão do usuário
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Usuário não autenticado');

      // 2. Obter perfil do usuário
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, tenant_id')
        .eq('user_id', session.user.id)
        .single();

      if (!profile) throw new Error('Perfil não encontrado');

      // 3. Verificar se o student_id existe
      const { data: student } = await supabase
        .from('profiles')
        .select('id, tenant_id')
        .eq('id', dietData.student_id)
        .single();

      if (!student) throw new Error('Aluno não encontrado');

      // 4. Verificar se o student pertence ao mesmo tenant
      if (student.tenant_id !== profile.tenant_id) {
        throw new Error('Aluno não pertence ao mesmo tenant');
      }

      // 5. Preparar dados da dieta principal (sem meals, shopping_list, etc.)
      const mainDietData = {
        student_id: dietData.student_id,
        created_by: profile.id,
        name: dietData.name,
        description: dietData.description,
        age: dietData.age,
        weight: dietData.weight,
        height: dietData.height || null, // Converter undefined para null para o banco
        gender: dietData.gender,
        activity_level: dietData.activity_level,
        goal: dietData.goal,
        goal_description: dietData.goal_description,
        budget_profile: dietData.budget_profile,
        meals_per_day: dietData.meals_per_day,
        dietary_style: dietData.dietary_style,
        food_preferences: dietData.food_preferences,
        restrictions: dietData.restrictions,
        custom_restrictions: dietData.custom_restrictions,
        used_physical_assessment: dietData.used_physical_assessment,
        physical_assessment_id: dietData.physical_assessment_id || null, // Converter undefined para null para o banco
        target_calories: dietData.target_calories,
        target_protein: dietData.target_protein,
        target_carbs: dietData.target_carbs,
        target_fat: dietData.target_fat,
        status: 'active',
        tenant_id: profile.tenant_id
      };

      // 6. Criar dieta principal
      const { data: createdDiet, error: dietError } = await supabase
        .from('diets')
        .insert(mainDietData)
        .select()
        .single();

      if (dietError) {
        console.error('Erro ao criar dieta:', dietError);
        throw dietError;
      }

      // 7. Criar refeições
      if (dietData.generatedMeals && dietData.generatedMeals.length > 0) {
        const mealsToInsert = dietData.generatedMeals.map((meal, index) => ({
          diet_id: createdDiet.id,
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

        if (mealsError) throw mealsError;

        // 8. Criar alimentos para cada refeição
        for (let i = 0; i < dietData.generatedMeals.length; i++) {
          const meal = dietData.generatedMeals[i];
          const createdMeal = createdMeals[i];

          if (meal.foods && meal.foods.length > 0) {
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

            if (foodsError) throw foodsError;
          }
        }
      }

      // 9. Criar lista de compras
      if (dietData.generatedShoppingList && dietData.generatedShoppingList.length > 0) {
        const shoppingToInsert = dietData.generatedShoppingList.map((item, index) => ({
          diet_id: createdDiet.id,
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

        if (shoppingError) throw shoppingError;
      }

      // 10. Atualizar lista local
      await fetchDiets();

      return createdDiet;

    } catch (error: any) {
      console.error('Error creating diet:', error);
      throw error;
    }
  };

  const updateDiet = async (id: string, updateData: Partial<CreateDietParams>) => {
    try {
      const { data, error } = await supabase
        .from('diets')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await fetchDiets();
      return data;

    } catch (error: any) {
      console.error('Error updating diet:', error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar dieta",
        description: error.message
      });
      throw error;
    }
  };

  const deleteDiet = async (id: string) => {
    try {
      const { error } = await supabase
        .from('diets')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Dieta excluída",
        description: "A dieta foi excluída com sucesso"
      });

      await fetchDiets();

    } catch (error: any) {
      console.error('Error deleting diet:', error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir dieta",
        description: error.message
      });
      throw error;
    }
  };

  const changePage = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const changePageSize = (limit: number) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }));
  };

  return {
    diets,
    loading,
    pagination,
    generateDietWithAI,
    createDiet,
    updateDiet,
    deleteDiet,
    changePage,
    changePageSize,
    fetchDiets
  };
}

