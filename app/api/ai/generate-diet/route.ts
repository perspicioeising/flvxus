// app/api/ai/generate-diet/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

interface DietRequest {
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

// Função para calcular TMB (Taxa Metabólica Basal)
function calculateBMR(weight: number, height: number, age: number, gender: string): number {
  if (gender === 'male') {
    return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
  } else {
    return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
  }
}

// Função para calcular TDEE (Total Daily Energy Expenditure)
function calculateTDEE(bmr: number, activityLevel: string): number {
  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    intense: 1.725,
    athlete: 1.9
  };
  return bmr * (multipliers[activityLevel as keyof typeof multipliers] || 1.2);
}

// Função para ajustar calorias baseado no objetivo
function adjustCaloriesForGoal(tdee: number, goal: string): number {
  switch (goal) {
    case 'fat_loss':
      return tdee * 0.8; // Déficit de 20%
    case 'muscle_gain':
      return tdee * 1.1; // Superávit de 10%
    case 'performance':
      return tdee * 1.05; // Leve superávit
    case 'maintenance':
    case 'reeducation':
    default:
      return tdee; // Manutenção
  }
}

// Função para calcular macronutrientes
function calculateMacros(calories: number, goal: string, weight: number) {
  let proteinRatio = 0.3;
  let carbRatio = 0.4;
  let fatRatio = 0.3;

  switch (goal) {
    case 'muscle_gain':
      proteinRatio = 0.35;
      carbRatio = 0.4;
      fatRatio = 0.25;
      break;
    case 'fat_loss':
      proteinRatio = 0.4;
      carbRatio = 0.3;
      fatRatio = 0.3;
      break;
    case 'performance':
      proteinRatio = 0.25;
      carbRatio = 0.5;
      fatRatio = 0.25;
      break;
  }

  const protein = Math.max((calories * proteinRatio) / 4, weight * 1.2); // Mínimo 1.2g/kg
  const fat = (calories * fatRatio) / 9;
  const carbs = (calories - (protein * 4) - (fat * 9)) / 4;

  return { protein, carbs, fat };
}

// Função para gerar refeições baseadas nos parâmetros
function generateMeals(
  targetCalories: number,
  macros: { protein: number; carbs: number; fat: number },
  mealsPerDay: number,
  dietaryStyle: string[],
  restrictions: string[],
  budgetProfile: string
) {
  const mealTypes = [
    { type: 'breakfast', time: '07:00', name: 'Café da Manhã' },
    { type: 'morning_snack', time: '10:00', name: 'Lanche da Manhã' },
    { type: 'lunch', time: '12:30', name: 'Almoço' },
    { type: 'afternoon_snack', time: '15:30', name: 'Lanche da Tarde' },
    { type: 'dinner', time: '19:00', name: 'Jantar' },
    { type: 'evening_snack', time: '21:30', name: 'Lanche da Noite' }
  ];

  const selectedMeals = mealTypes.slice(0, mealsPerDay);
  const caloriesPerMeal = targetCalories / mealsPerDay;
  const proteinPerMeal = macros.protein / mealsPerDay;
  const carbsPerMeal = macros.carbs / mealsPerDay;
  const fatPerMeal = macros.fat / mealsPerDay;

  // Alimentos base por categoria e restrições
  const foodDatabase = {
    proteins: {
      omnivore: ['Frango grelhado', 'Ovos mexidos', 'Salmão', 'Carne magra', 'Atum'],
      vegetarian: ['Ovos mexidos', 'Queijo cottage', 'Iogurte grego', 'Feijão', 'Lentilha'],
      vegan: ['Tofu', 'Feijão', 'Lentilha', 'Grão-de-bico', 'Quinoa']
    },
    carbs: ['Arroz integral', 'Pão integral', 'Batata doce', 'Aveia', 'Banana', 'Maçã'],
    vegetables: ['Salada verde', 'Brócolis', 'Cenoura', 'Abobrinha', 'Tomate'],
    fats: ['Abacate', 'Azeite', 'Castanhas', 'Amêndoas', 'Óleo de coco'],
    dairy: ['Iogurte natural', 'Leite', 'Queijo', 'Requeijão']
  };

  // Filtrar alimentos baseado em restrições
  let availableProteins = foodDatabase.proteins.omnivore;
  if (dietaryStyle.includes('vegetarian')) {
    availableProteins = foodDatabase.proteins.vegetarian;
  }
  if (dietaryStyle.includes('vegan')) {
    availableProteins = foodDatabase.proteins.vegan;
  }

  let availableDairy = foodDatabase.dairy;
  if (restrictions.includes('Lactose') || dietaryStyle.includes('vegan')) {
    availableDairy = [];
  }

  const meals = selectedMeals.map((mealInfo, index) => {
    // Exemplo de composição simples para cada refeição
    let foods = [];

    if (mealInfo.type === 'breakfast') {
      foods = [
        {
          food_name: availableProteins[0] || 'Ovos mexidos',
          quantity: 2,
          unit: 'unidades',
          calories: Math.round(caloriesPerMeal * 0.4),
          protein: Math.round(proteinPerMeal * 0.6),
          carbs: Math.round(carbsPerMeal * 0.1),
          fat: Math.round(fatPerMeal * 0.5)
        },
        {
          food_name: 'Pão integral',
          quantity: 2,
          unit: 'fatias',
          calories: Math.round(caloriesPerMeal * 0.4),
          protein: Math.round(proteinPerMeal * 0.3),
          carbs: Math.round(carbsPerMeal * 0.7),
          fat: Math.round(fatPerMeal * 0.2)
        },
        {
          food_name: 'Banana',
          quantity: 1,
          unit: 'unidade média',
          calories: Math.round(caloriesPerMeal * 0.2),
          protein: Math.round(proteinPerMeal * 0.1),
          carbs: Math.round(carbsPerMeal * 0.2),
          fat: Math.round(fatPerMeal * 0.3)
        }
      ];
    } else if (mealInfo.type === 'lunch' || mealInfo.type === 'dinner') {
      foods = [
        {
          food_name: 'Arroz integral',
          quantity: 150,
          unit: 'g cozido',
          calories: Math.round(caloriesPerMeal * 0.3),
          protein: Math.round(proteinPerMeal * 0.2),
          carbs: Math.round(carbsPerMeal * 0.6),
          fat: Math.round(fatPerMeal * 0.1)
        },
        {
          food_name: availableProteins[1] || 'Frango grelhado',
          quantity: 150,
          unit: 'g',
          calories: Math.round(caloriesPerMeal * 0.4),
          protein: Math.round(proteinPerMeal * 0.7),
          carbs: 0,
          fat: Math.round(fatPerMeal * 0.4)
        },
        {
          food_name: 'Salada verde',
          quantity: 100,
          unit: 'g',
          calories: Math.round(caloriesPerMeal * 0.1),
          protein: Math.round(proteinPerMeal * 0.1),
          carbs: Math.round(carbsPerMeal * 0.2),
          fat: 0
        },
        {
          food_name: 'Feijão',
          quantity: 100,
          unit: 'g cozido',
          calories: Math.round(caloriesPerMeal * 0.2),
          protein: Math.round(proteinPerMeal * 0.0),
          carbs: Math.round(carbsPerMeal * 0.2),
          fat: Math.round(fatPerMeal * 0.5)
        }
      ];
    } else {
      // Lanche
      foods = [
        {
          food_name: availableDairy[0] || 'Iogurte natural',
          quantity: 170,
          unit: 'g',
          calories: Math.round(caloriesPerMeal * 0.6),
          protein: Math.round(proteinPerMeal * 0.8),
          carbs: Math.round(carbsPerMeal * 0.4),
          fat: 0
        },
        {
          food_name: 'Granola',
          quantity: 30,
          unit: 'g',
          calories: Math.round(caloriesPerMeal * 0.4),
          protein: Math.round(proteinPerMeal * 0.2),
          carbs: Math.round(carbsPerMeal * 0.6),
          fat: Math.round(fatPerMeal * 1.0)
        }
      ];
    }

    return {
      meal_type: mealInfo.type,
      meal_time: mealInfo.time,
      name: mealInfo.name,
      description: `${mealInfo.name.includes('Lanche') ? 'Lanche leve para manter o metabolismo ativo' : 'Refeição completa para fornecer energia e nutrientes'}`,
      calories: caloriesPerMeal,
      protein: proteinPerMeal,
      carbs: carbsPerMeal,
      fat: fatPerMeal,
      foods
    };
  });

  return meals;
}

// Função para gerar lista de compras
function generateShoppingList(meals: any[]) {
  const categories = {
    proteins: [],
    carbs: [],
    vegetables: [],
    fruits: [],
    dairy: [],
    others: []
  };

  const allFoods = meals.flatMap(meal => meal.foods);
  const uniqueFoodNames = new Set(allFoods.map(food => food.food_name));
  const uniqueFoods = Array.from(uniqueFoodNames);

  uniqueFoods.forEach((foodName, index) => {
    let category = 'others';
    
    if (['Frango', 'Ovos', 'Atum', 'Salmão', 'Carne', 'Tofu', 'Feijão'].some(p => foodName.includes(p))) {
      category = 'proteins';
    } else if (['Arroz', 'Pão', 'Batata', 'Aveia'].some(c => foodName.includes(c))) {
      category = 'carbs';
    } else if (['Salada', 'Brócolis', 'Cenoura', 'Tomate'].some(v => foodName.includes(v))) {
      category = 'vegetables';
    } else if (['Banana', 'Maçã', 'Abacate'].some(f => foodName.includes(f))) {
      category = 'fruits';
    } else if (['Iogurte', 'Leite', 'Queijo'].some(d => foodName.includes(d))) {
      category = 'dairy';
    }

    (categories as any)[category].push({
      category,
      item_name: foodName,
      quantity: 'Quantidade semanal',
      notes: '',
      order_index: index
    });
  });

  return Object.values(categories).flat();
}

// Função para gerar recomendações
function generateRecommendations(goal: string, dietaryStyle: string[], restrictions: string[]) {
  const baseRecommendations = [
    'Beba pelo menos 2 litros de água por dia',
    'Faça as refeições em horários regulares',
    'Evite pular refeições',
    'Mastigue bem os alimentos'
  ];

  if (goal === 'muscle_gain') {
    baseRecommendations.push('Consuma proteína após o treino');
    baseRecommendations.push('Mantenha um leve superávit calórico');
  }

  if (goal === 'fat_loss') {
    baseRecommendations.push('Priorize alimentos ricos em fibras');
    baseRecommendations.push('Controle as porções');
  }

  if (dietaryStyle.includes('vegan')) {
    baseRecommendations.push('Combine diferentes fontes de proteína vegetal');
    baseRecommendations.push('Considere suplementação de B12');
  }

  if (restrictions.includes('Lactose')) {
    baseRecommendations.push('Verifique rótulos para lactose oculta');
  }

  return baseRecommendations;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Verificar autenticação
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body: DietRequest = await request.json();

    // Validar dados obrigatórios
    if (!body.student_id || !body.age || !body.weight || !body.goal) {
      return NextResponse.json({ error: 'Dados obrigatórios não fornecidos' }, { status: 400 });
    }

    // Usar altura da avaliação física se disponível, senão usar valor padrão
    const height = body.physical_assessment?.height || body.height || 170;

    // Calcular calorias e macros
    const bmr = calculateBMR(body.weight, height, body.age, body.gender);
    const tdee = calculateTDEE(bmr, body.activity_level);
    const targetCalories = adjustCaloriesForGoal(tdee, body.goal);
    const macros = calculateMacros(targetCalories, body.goal, body.weight);

    // Gerar refeições
    const meals = generateMeals(
      targetCalories,
      macros,
      body.meals_per_day,
      body.dietary_style,
      body.restrictions,
      body.budget_profile
    );

    // Gerar lista de compras
    const shoppingList = generateShoppingList(meals);

    // Gerar recomendações
    const recommendations = generateRecommendations(
      body.goal,
      body.dietary_style,
      body.restrictions
    );

    // Gerar nome e descrição da dieta
    const goalLabels = {
      muscle_gain: 'Ganho de Massa',
      fat_loss: 'Perda de Gordura',
      reeducation: 'Reeducação Alimentar',
      performance: 'Performance',
      maintenance: 'Manutenção'
    };

    const dietName = `Dieta para ${goalLabels[body.goal as keyof typeof goalLabels] || 'Personalizada'}`;
    const dietDescription = `Dieta personalizada com ${Math.round(targetCalories)} calorias diárias, focada em ${goalLabels[body.goal as keyof typeof goalLabels]?.toLowerCase() || 'objetivos personalizados'}.`;

    const response = {
      name: dietName,
      description: dietDescription,
      target_calories: targetCalories,
      target_protein: macros.protein,
      target_carbs: macros.carbs,
      target_fat: macros.fat,
      meals,
      shopping_list: shoppingList,
      recommendations
    };

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('Error generating diet:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}