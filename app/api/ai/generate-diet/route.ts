// app/api/ai/generate-diet/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

type ShoppingItem = {
  category: string;
  item_name: string;
  quantity: string;
  notes: string;
  order_index: number;
};

type Meal = {
  meal_type: string;
  meal_time: string;
  name: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  foods: any[];
};

type DietPlan = {
  name: string;
  description: string;
  target_calories: number;
  target_protein: number;
  target_carbs: number;
  target_fat: number;
  meals: Meal[];
  shopping_list: ShoppingItem[];
  recommendations: string[];
};

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

    const data = await request.json();
    const mockDiet = generateMockDiet(data);

    return NextResponse.json(mockDiet);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'An error occurred while generating the diet' },
      { status: 500 }
    );
  }
}

function generateMockDiet(params: any): DietPlan {
  const {
    age,
    weight,
    height,
    gender,
    activity_level,
    goal,
    budget_profile,
    meals_per_day,
    dietary_style,
    restrictions,
    food_preferences,
    physical_assessment
  } = params;

  // Cálculo básico de TMB (Taxa Metabólica Basal)
  let tmb: number;
  if (gender === 'male') {
    tmb = (10 * weight) + (6.25 * (height || 170)) - (5 * age) + 5;
  } else {
    tmb = (10 * weight) + (6.25 * (height || 160)) - (5 * age) - 161;
  }

  // Fator de atividade
  const activityFactors: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    intense: 1.725,
    athlete: 1.9
  };

  const tdee = tmb * (activityFactors[activity_level] || 1.2);

  // Ajuste baseado no objetivo
  let targetCalories = tdee;
  if (goal === 'fat_loss') {
    targetCalories = tdee - 500; // Déficit de 500 calorias
  } else if (goal === 'muscle_gain') {
    targetCalories = tdee + 300; // Superávit de 300 calorias
  }

  // Distribuição de macronutrientes
  let proteinRatio = 0.25;
  let carbsRatio = 0.45;
  let fatRatio = 0.30;

  if (goal === 'muscle_gain') {
    proteinRatio = 0.30;
    carbsRatio = 0.45;
    fatRatio = 0.25;
  } else if (goal === 'fat_loss') {
    proteinRatio = 0.35;
    carbsRatio = 0.35;
    fatRatio = 0.30;
  }

  const targetProtein = (targetCalories * proteinRatio) / 4;
  const targetCarbs = (targetCalories * carbsRatio) / 4;
  const targetFat = (targetCalories * fatRatio) / 9;

  // Gerar refeições baseadas no número de refeições por dia
  const meals = generateMeals(
    meals_per_day,
    targetCalories,
    targetProtein,
    targetCarbs,
    targetFat,
    dietary_style,
    restrictions,
    budget_profile
  );

  // Gerar lista de compras
  const shoppingList = generateShoppingList(meals, budget_profile);

  return {
    name: `Dieta ${goal === 'muscle_gain' ? 'para Ganho de Massa' : goal === 'fat_loss' ? 'para Perda de Gordura' : 'Personalizada'}`,
    description: `Dieta personalizada com ${targetCalories.toFixed(0)} calorias diárias, focada em ${getGoalDescription(goal)}.`,
    target_calories: targetCalories,
    target_protein: targetProtein,
    target_carbs: targetCarbs,
    target_fat: targetFat,
    meals,
    shopping_list: shoppingList,
    recommendations: [
      'Beba pelo menos 2 litros de água por dia',
      'Faça as refeições em horários regulares',
      'Evite pular refeições',
      'Mastigue bem os alimentos',
      goal === 'muscle_gain' ? 'Consuma proteína após o treino' : 'Priorize alimentos integrais'
    ]
  };
}

function generateMeals(
  mealsPerDay: number,
  totalCalories: number,
  totalProtein: number,
  totalCarbs: number,
  totalFat: number,
  dietaryStyle: string[],
  restrictions: string[],
  budgetProfile: string
): Meal[] {
  const mealTypes = [
    'breakfast',
    'morning_snack',
    'lunch',
    'afternoon_snack',
    'dinner',
    'evening_snack'
  ].slice(0, mealsPerDay);

  const caloriesPerMeal = totalCalories / mealsPerDay;
  const proteinPerMeal = totalProtein / mealsPerDay;
  const carbsPerMeal = totalCarbs / mealsPerDay;
  const fatPerMeal = totalFat / mealsPerDay;

  return mealTypes.map((type, index) => {
    const foods = generateFoodsForMeal(
      type,
      caloriesPerMeal,
      proteinPerMeal,
      carbsPerMeal,
      fatPerMeal,
      dietaryStyle,
      restrictions,
      budgetProfile
    );

    return {
      meal_type: type,
      meal_time: getMealTime(type),
      name: getMealName(type),
      description: getMealDescription(type),
      calories: caloriesPerMeal,
      protein: proteinPerMeal,
      carbs: carbsPerMeal,
      fat: fatPerMeal,
      foods
    };
  });
}

function generateFoodsForMeal(
  mealType: string,
  calories: number,
  protein: number,
  carbs: number,
  fat: number,
  dietaryStyle: string[],
  restrictions: string[],
  budgetProfile: string
): any[] {
  // Aqui seria a lógica mais complexa para gerar alimentos específicos
  // Por enquanto, vamos retornar exemplos baseados no tipo de refeição
  
  const mealFoods: Record<string, any[]> = {
    breakfast: [
      { food_name: 'Ovos mexidos', quantity: 2, unit: 'unidades', calories: 140, protein: 12, carbs: 2, fat: 10 },
      { food_name: 'Pão integral', quantity: 2, unit: 'fatias', calories: 140, protein: 6, carbs: 26, fat: 2 },
      { food_name: 'Banana', quantity: 1, unit: 'unidade média', calories: 105, protein: 1, carbs: 27, fat: 0 }
    ],
    lunch: [
      { food_name: 'Arroz integral', quantity: 150, unit: 'g cozido', calories: 165, protein: 4, carbs: 34, fat: 1 },
      { food_name: 'Frango grelhado', quantity: 150, unit: 'g', calories: 195, protein: 37, carbs: 0, fat: 4 },
      { food_name: 'Salada verde', quantity: 100, unit: 'g', calories: 20, protein: 2, carbs: 4, fat: 0 },
      { food_name: 'Feijão', quantity: 100, unit: 'g cozido', calories: 120, protein: 8, carbs: 21, fat: 0.5 }
    ],
    dinner: [
      { food_name: 'Batata doce', quantity: 200, unit: 'g cozida', calories: 180, protein: 4, carbs: 41, fat: 0 },
      { food_name: 'Salmão grelhado', quantity: 150, unit: 'g', calories: 280, protein: 39, carbs: 0, fat: 13 },
      { food_name: 'Brócolis', quantity: 100, unit: 'g cozido', calories: 35, protein: 3, carbs: 7, fat: 0 }
    ],
    morning_snack: [
      { food_name: 'Iogurte natural', quantity: 170, unit: 'g', calories: 100, protein: 17, carbs: 6, fat: 0 },
      { food_name: 'Granola', quantity: 30, unit: 'g', calories: 130, protein: 3, carbs: 22, fat: 4 }
    ],
    afternoon_snack: [
      { food_name: 'Maçã', quantity: 1, unit: 'unidade média', calories: 95, protein: 0, carbs: 25, fat: 0 },
      { food_name: 'Pasta de amendoim', quantity: 20, unit: 'g', calories: 120, protein: 5, carbs: 4, fat: 10 }
    ],
    evening_snack: [
      { food_name: 'Queijo cottage', quantity: 100, unit: 'g', calories: 100, protein: 11, carbs: 3, fat: 4 },
      { food_name: 'Nozes', quantity: 30, unit: 'g', calories: 185, protein: 4, carbs: 4, fat: 18 }
    ]
  };

  return mealFoods[mealType] || [];
}

function getMealTime(mealType: string): string {
  const times: Record<string, string> = {
    breakfast: '07:00',
    morning_snack: '10:00',
    lunch: '12:30',
    afternoon_snack: '15:30',
    dinner: '19:00',
    evening_snack: '21:00'
  };
  return times[mealType] || '12:00';
}

function getMealName(mealType: string): string {
  const names: Record<string, string> = {
    breakfast: 'Café da Manhã',
    morning_snack: 'Lanche da Manhã',
    lunch: 'Almoço',
    afternoon_snack: 'Lanche da Tarde',
    dinner: 'Jantar',
    evening_snack: 'Ceia'
  };
  return names[mealType] || 'Refeição';
}

function getMealDescription(mealType: string): string {
  const descriptions: Record<string, string> = {
    breakfast: 'Refeição completa para começar o dia com energia',
    morning_snack: 'Lanche leve para manter o metabolismo ativo',
    lunch: 'Refeição principal do dia com todos os nutrientes',
    afternoon_snack: 'Lanche para evitar a fome até o jantar',
    dinner: 'Refeição leve e nutritiva para o período noturno',
    evening_snack: 'Opção leve antes de dormir'
  };
  return descriptions[mealType] || '';
}

function getGoalDescription(goal: string): string {
  const descriptions: Record<string, string> = {
    muscle_gain: 'ganho de massa muscular com superávit calórico moderado',
    fat_loss: 'perda de gordura com déficit calórico controlado',
    reeducation: 'reeducação alimentar e hábitos saudáveis',
    performance: 'melhora da performance esportiva',
    maintenance: 'manutenção do peso atual',
    other: 'objetivos personalizados'
  };
  return descriptions[goal] || 'objetivos personalizados';
}

function generateShoppingList(meals: Meal[], budgetProfile: string): ShoppingItem[] {
  const categories = {
    proteins: new Set<string>(),
    carbs: new Set<string>(),
    vegetables: new Set<string>(),
    fruits: new Set<string>(),
    dairy: new Set<string>(),
    others: new Set<string>()
  };

  // Mapear alimentos para categorias
  meals.forEach(meal => {
    meal.foods?.forEach((food: any) => {
      const name = food.food_name.toLowerCase();
      
      if (name.includes('frango') || name.includes('ovos') || name.includes('salmão') || name.includes('carne')) {
        categories.proteins.add(food.food_name);
      } else if (name.includes('arroz') || name.includes('pão') || name.includes('batata') || name.includes('macarrão')) {
        categories.carbs.add(food.food_name);
      } else if (name.includes('brócolis') || name.includes('salada') || name.includes('espinafre') || name.includes('alface')) {
        categories.vegetables.add(food.food_name);
      } else if (name.includes('banana') || name.includes('maçã') || name.includes('laranja')) {
        categories.fruits.add(food.food_name);
      } else if (name.includes('leite') || name.includes('iogurte') || name.includes('queijo')) {
        categories.dairy.add(food.food_name);
      } else {
        categories.others.add(food.food_name);
      }
    });
  });

  const shoppingList: ShoppingItem[] = [];
  let orderIndex = 0;

  Object.entries(categories).forEach(([category, items]) => {
    items.forEach(item => {
      shoppingList.push({
        category: category,
        item_name: item,
        quantity: 'Quantidade semanal',
        notes: budgetProfile === 'economic' ? 'Opção mais em conta' : '',
        order_index: orderIndex++
      });
    });
  });

  return shoppingList;
}