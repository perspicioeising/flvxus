// app/api/ai/generate-diet/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { GoogleGenerativeAI } from '@google/generative-ai';

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

interface GeneratedMeal {
  meal_type: string;
  meal_time: string;
  name: string;
  description: string;
  foods: GeneratedFood[];
}

interface GeneratedFood {
  food_name: string;
  quantity: number;
  unit: string;
}

interface GeneratedDiet {
  meals: GeneratedMeal[];
}

// Função para calcular TMB usando fórmula de Mifflin-St Jeor
function calculateBMR(weight: number, height: number, age: number, gender: string): number {
  if (gender === 'male') {
    return (10 * weight) + (6.25 * height) - (5 * age) + 5;
  } else {
    return (10 * weight) + (6.25 * height) - (5 * age) - 161;
  }
}

// Função para calcular TDEE
function calculateTDEE(bmr: number, activityLevel: string, goal: string): number {
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    intense: 1.725,
    athlete: 1.9
  };
  
  let tdee = bmr * (activityMultipliers[activityLevel as keyof typeof activityMultipliers] || 1.2);
  
  switch (goal) {
    case 'fat_loss':
      return tdee * 0.8;
    case 'muscle_gain':
      return tdee * 1.1;
    case 'performance':
      return tdee * 1.05;
    case 'reeducation':
    case 'maintenance':
    default:
      return tdee;
  }
}

// Função para calcular macros
function calculateMacros(calories: number, goal: string, weight: number) {
  let proteinGrams: number;
  let fatPercent: number;
  
  switch (goal) {
    case 'muscle_gain':
      proteinGrams = weight * 2.2;
      fatPercent = 0.25;
      break;
    case 'fat_loss':
      proteinGrams = weight * 2.5;
      fatPercent = 0.3;
      break;
    case 'performance':
      proteinGrams = weight * 1.8;
      fatPercent = 0.25;
      break;
    default:
      proteinGrams = weight * 1.6;
      fatPercent = 0.3;
  }
  
  const proteinCalories = proteinGrams * 4;
  const fatCalories = calories * fatPercent;
  const fatGrams = fatCalories / 9;
  const carbCalories = calories - proteinCalories - fatCalories;
  const carbGrams = Math.max(carbCalories / 4, 50);
  
  return {
    protein: Math.round(proteinGrams * 10) / 10,
    carbs: Math.round(carbGrams * 10) / 10,
    fat: Math.round(fatGrams * 10) / 10
  };
}

// Função para gerar prompt otimizado
function generatePrompt(dietParams: DietRequest, targetCalories: number, macros: any): string {
  const genderLabel = dietParams.gender === 'male' ? 'Homem' : 'Mulher';
  
  const activityLabels = {
    sedentary: 'Sedentário',
    light: 'Levemente ativo',
    moderate: 'Moderadamente ativo', 
    intense: 'Muito ativo',
    athlete: 'Extremamente ativo'
  };

  const goalLabels = {
    muscle_gain: 'Ganho de massa muscular',
    fat_loss: 'Perda de gordura',
    reeducation: 'Reeducação alimentar',
    performance: 'Melhora da performance',
    maintenance: 'Manutenção do peso'
  };

  const budgetLabels = {
    economic: 'Econômico - alimentos básicos e acessíveis',
    intermediate: 'Intermediário - equilibrio entre custo e variedade',
    free: 'Livre - sem restrições de custo'
  };

  let restrictionsText = '';
  if (dietParams.restrictions.length > 0) {
    restrictionsText = `\nRESTRIÇÕES ALIMENTARES: ${dietParams.restrictions.join(', ')}`;
  }

  let stylesText = '';
  if (dietParams.dietary_style.length > 0) {
    stylesText = `\nESTILO ALIMENTAR: ${dietParams.dietary_style.join(', ')}`;
  }

  let preferencesText = '';
  if (dietParams.food_preferences.length > 0) {
    preferencesText = `\nPREFERÊNCIAS: ${dietParams.food_preferences.join(', ')}`;
  }

  let customText = '';
  if (dietParams.custom_restrictions) {
    customText = `\nOBSERVAÇÕES: ${dietParams.custom_restrictions}`;
  }

  let assessmentText = '';
  if (dietParams.physical_assessment) {
    assessmentText = `\nAVALIAÇÃO FÍSICA:
- Gordura corporal: ${dietParams.physical_assessment.fat_percentage?.toFixed(1)}%
- Massa magra: ${dietParams.physical_assessment.lean_mass?.toFixed(1)}kg`;
  }

  const mealTypes = ['breakfast', 'morning_snack', 'lunch', 'afternoon_snack', 'dinner', 'evening_snack'].slice(0, dietParams.meals_per_day);

  return `Você é um nutricionista especializado brasileiro. Crie uma dieta personalizada baseada nos dados abaixo:

PERFIL DO CLIENTE:
- ${genderLabel}, ${dietParams.age} anos
- Peso: ${dietParams.weight}kg
- Altura: ${dietParams.height || 170}cm  
- Atividade: ${activityLabels[dietParams.activity_level as keyof typeof activityLabels]}
- Objetivo: ${goalLabels[dietParams.goal as keyof typeof goalLabels]}${dietParams.goal_description ? ` (${dietParams.goal_description})` : ''}${assessmentText}

METAS NUTRICIONAIS:
- Calorias: ${Math.round(targetCalories)} kcal/dia
- Proteínas: ${Math.round(macros.protein)}g/dia
- Carboidratos: ${Math.round(macros.carbs)}g/dia
- Gorduras: ${Math.round(macros.fat)}g/dia
- Refeições: ${dietParams.meals_per_day} por dia

DIRETRIZES:
- Orçamento: ${budgetLabels[dietParams.budget_profile as keyof typeof budgetLabels]}${restrictionsText}${stylesText}${preferencesText}${customText}

INSTRUÇÕES:
1. Use apenas alimentos brasileiros comuns
2. Seja específico nas quantidades (gramas, unidades, colheres)
3. Distribua os macronutrientes proporcionalmente
4. Varie os alimentos entre refeições
5. Inclua métodos de preparo simples
6. Use os tipos de refeição: ${mealTypes.join(', ')}

HORÁRIOS SUGERIDOS:
- breakfast: 07:30
- morning_snack: 10:00  
- lunch: 12:30
- afternoon_snack: 15:30
- dinner: 19:00
- evening_snack: 21:30

Responda APENAS com JSON válido no formato:

{
  "meals": [
    {
      "meal_type": "breakfast",
      "meal_time": "07:30", 
      "name": "Nome da Refeição",
      "description": "Descrição nutritiva",
      "foods": [
        {
          "food_name": "Nome do alimento com preparo",
          "quantity": 100,
          "unit": "g"
        }
      ]
    }
  ]
}

IMPORTANTE: Retorne apenas o JSON, sem texto antes ou depois.`;
}

// Função principal para gerar dieta com Google Generative AI
async function generateDietWithGemini(prompt: string): Promise<GeneratedDiet> {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY não configurada');
  }

  console.log('🤖 Inicializando Google Generative AI...');

  try {
    // Inicializar o Google Generative AI
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    
    // Obter o modelo
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      },
    });

    console.log('📤 Enviando prompt para Gemini...');
    
    // Gerar conteúdo
    const result = await model.generateContent(prompt);
    
    if (!result.response) {
      throw new Error('Nenhuma resposta recebida do Gemini');
    }

    const responseText = result.response.text();
    console.log('📥 Resposta recebida do Gemini');
    console.log('📝 Primeiros 200 chars:', responseText.substring(0, 200) + '...');

    // Extrair JSON da resposta
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('❌ JSON não encontrado na resposta:', responseText);
      throw new Error('Resposta não contém JSON válido');
    }

    let dietData: GeneratedDiet;
    try {
      dietData = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('❌ Erro ao parsear JSON:', parseError);
      console.error('JSON problemático:', jsonMatch[0]);
      throw new Error('JSON malformado na resposta');
    }

    // Validar estrutura
    if (!dietData.meals || !Array.isArray(dietData.meals) || dietData.meals.length === 0) {
      console.error('❌ Estrutura inválida:', dietData);
      throw new Error('Estrutura de meals inválida');
    }

    // Validar cada refeição
    for (let i = 0; i < dietData.meals.length; i++) {
      const meal = dietData.meals[i];
      if (!meal.meal_type || !meal.foods || !Array.isArray(meal.foods)) {
        console.error(`❌ Refeição ${i} inválida:`, meal);
        throw new Error(`Estrutura da refeição ${i} inválida`);
      }
    }

    console.log('✅ Dieta validada com sucesso -', dietData.meals.length, 'refeições');
    return dietData;

  } catch (error: any) {
    console.error('❌ Erro ao gerar dieta com Gemini:', error);
    throw error;
  }
}

// Base de dados nutricional para cálculos
const nutritionDB: { [key: string]: { cal: number; prot: number; carb: number; fat: number } } = {
  'ovo': { cal: 155, prot: 13, carb: 1.1, fat: 11 },
  'frango': { cal: 165, prot: 31, carb: 0, fat: 3.6 },
  'carne': { cal: 250, prot: 26, carb: 0, fat: 15 },
  'peixe': { cal: 120, prot: 22, carb: 0, fat: 2.5 },
  'salmão': { cal: 208, prot: 25, carb: 0, fat: 12 },
  'arroz': { cal: 130, prot: 2.7, carb: 28, fat: 0.3 },
  'batata': { cal: 86, prot: 1.6, carb: 20, fat: 0.1 },
  'pão': { cal: 265, prot: 9, carb: 49, fat: 3.2 },
  'aveia': { cal: 389, prot: 17, carb: 66, fat: 7 },
  'banana': { cal: 89, prot: 1.1, carb: 23, fat: 0.3 },
  'maçã': { cal: 52, prot: 0.3, carb: 14, fat: 0.2 },
  'brócolis': { cal: 34, prot: 2.8, carb: 7, fat: 0.4 },
  'tomate': { cal: 18, prot: 0.9, carb: 3.9, fat: 0.2 },
  'azeite': { cal: 884, prot: 0, carb: 0, fat: 100 },
  'abacate': { cal: 160, prot: 2, carb: 9, fat: 15 },
  'feijão': { cal: 127, prot: 9, carb: 23, fat: 0.5 },
  'iogurte': { cal: 59, prot: 10, carb: 3.6, fat: 0.4 },
  'leite': { cal: 42, prot: 3.4, carb: 5, fat: 0.1 },
  'queijo': { cal: 113, prot: 7, carb: 1, fat: 9 }
};

// Função para calcular dados nutricionais
function calculateNutritionData(foodName: string, quantity: number, unit: string) {
  let nutritionData = { cal: 100, prot: 5, carb: 15, fat: 2 };
  
  const foodLower = foodName.toLowerCase();
  for (const [key, value] of Object.entries(nutritionDB)) {
    if (foodLower.includes(key) || key.includes(foodLower.split(' ')[0])) {
      nutritionData = value;
      break;
    }
  }

  let conversionFactor = 1;
  
  if (unit === 'g') {
    conversionFactor = quantity / 100;
  } else if (unit === 'ml') {
    conversionFactor = quantity / 100;
  } else if (unit === 'unidade' || unit === 'unidades') {
    if (foodLower.includes('ovo')) conversionFactor = quantity * 0.55;
    else if (foodLower.includes('banana')) conversionFactor = quantity * 1.2;
    else if (foodLower.includes('maçã')) conversionFactor = quantity * 1.8;
    else conversionFactor = quantity * 0.5;
  } else if (unit.includes('fatia')) {
    conversionFactor = quantity * 0.25;
  } else if (unit.includes('colher')) {
    conversionFactor = quantity * 0.15;
  }

  return {
    calories: Math.round(nutritionData.cal * conversionFactor),
    protein: Math.round(nutritionData.prot * conversionFactor * 10) / 10,
    carbs: Math.round(nutritionData.carb * conversionFactor * 10) / 10,
    fat: Math.round(nutritionData.fat * conversionFactor * 10) / 10
  };
}

// Função para gerar lista de compras
function generateShoppingList(meals: any[]): any[] {
  const itemCounts: { [key: string]: { total: number; unit: string } } = {};
  
  meals.forEach(meal => {
    meal.foods?.forEach((food: any) => {
      const key = food.food_name.toLowerCase();
      if (!itemCounts[key]) {
        itemCounts[key] = { total: 0, unit: food.unit };
      }
      itemCounts[key].total += food.quantity || 0;
    });
  });

  const shoppingList: any[] = [];
  let orderIndex = 0;

  Object.entries(itemCounts).forEach(([foodName, data]) => {
    const weeklyQuantity = Math.ceil(data.total * 8.4);
    
    let category = 'outros';
    if (['frango', 'carne', 'peixe', 'salmão', 'ovo'].some(p => foodName.includes(p))) {
      category = 'proteínas';
    } else if (['arroz', 'pão', 'batata', 'banana', 'maçã'].some(c => foodName.includes(c))) {
      category = 'carboidratos';
    } else if (['brócolis', 'tomate'].some(v => foodName.includes(v))) {
      category = 'vegetais';
    }

    let formattedQuantity = `${weeklyQuantity}${data.unit}`;
    if (data.unit === 'g' && weeklyQuantity >= 1000) {
      formattedQuantity = `${(weeklyQuantity / 1000).toFixed(1)}kg`;
    }

    shoppingList.push({
      category,
      item_name: foodName.charAt(0).toUpperCase() + foodName.slice(1),
      quantity: formattedQuantity,
      notes: 'Quantidade para uma semana',
      order_index: orderIndex++,
      weekly_quantity: formattedQuantity
    });
  });

  return shoppingList;
}

// Função para gerar recomendações
function generateRecommendations(dietParams: DietRequest): string[] {
  const recommendations = [
    'Beba pelo menos 35ml de água por kg de peso corporal diariamente',
    'Mantenha horários regulares para as refeições',
    'Mastigue bem os alimentos para melhor digestão'
  ];

  switch (dietParams.goal) {
    case 'muscle_gain':
      recommendations.push('Consuma proteína após o treino');
      recommendations.push('Durma 7-9 horas por noite');
      break;
    case 'fat_loss':
      recommendations.push('Priorize proteínas em todas as refeições');
      recommendations.push('Inclua fibras para saciedade');
      break;
  }

  return recommendations;
}

// Endpoint principal
export async function POST(request: NextRequest) {
  console.log('🚀 === INICIANDO GERAÇÃO DE DIETA ===');
  
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body: DietRequest = await request.json();
    console.log('📋 Dados recebidos:', {
      student_id: body.student_id,
      goal: body.goal,
      meals_per_day: body.meals_per_day
    });

    // Validação
    const requiredFields = ['student_id', 'age', 'weight', 'goal', 'activity_level', 'budget_profile'];
    const missingFields = requiredFields.filter(field => !body[field as keyof DietRequest]);
    
    if (missingFields.length > 0) {
      return NextResponse.json({ 
        error: `Campos obrigatórios: ${missingFields.join(', ')}` 
      }, { status: 400 });
    }

    const height = body.physical_assessment?.height || body.height || 170;

    // Cálculos
    const bmr = calculateBMR(body.weight, height, body.age, body.gender);
    const targetCalories = calculateTDEE(bmr, body.activity_level, body.goal);
    const macros = calculateMacros(targetCalories, body.goal, body.weight);

    console.log('🧮 Cálculos:', { targetCalories: Math.round(targetCalories), macros });

    // Gerar dieta com IA
    const prompt = generatePrompt(body, targetCalories, macros);
    const aiResponse = await generateDietWithGemini(prompt);

    // Processar refeições
    const processedMeals = aiResponse.meals.map((meal: any) => {
      const processedFoods = meal.foods.map((food: any) => {
        const nutrition = calculateNutritionData(food.food_name, food.quantity, food.unit);
        return { ...food, ...nutrition };
      });

      const mealTotals = processedFoods.reduce(
        (acc: { calories: any; protein: any; carbs: any; fat: any; }, food: { calories: any; protein: any; carbs: any; fat: any; }) => ({
          calories: acc.calories + food.calories,
          protein: acc.protein + food.protein,
          carbs: acc.carbs + food.carbs,
          fat: acc.fat + food.fat
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );

      return {
        ...meal,
        calories: Math.round(mealTotals.calories),
        protein: Math.round(mealTotals.protein * 10) / 10,
        carbs: Math.round(mealTotals.carbs * 10) / 10,
        fat: Math.round(mealTotals.fat * 10) / 10,
        foods: processedFoods
      };
    });

    const shoppingList = generateShoppingList(processedMeals);
    const recommendations = generateRecommendations(body);

    // Nome e descrição
    const goalLabels = {
      muscle_gain: 'Hipertrofia Muscular',
      fat_loss: 'Emagrecimento Saudável',
      reeducation: 'Reeducação Alimentar',
      performance: 'Performance Esportiva',
      maintenance: 'Manutenção Saudável'
    };

    const dietName = `Plano ${goalLabels[body.goal as keyof typeof goalLabels] || 'Personalizado'}`;
    const dietDescription = `Plano nutricional personalizado com ${Math.round(targetCalories)} kcal/dia. Gerado com IA considerando suas preferências específicas.`;

    const response = {
      name: dietName,
      description: dietDescription,
      target_calories: Math.round(targetCalories),
      target_protein: Math.round(macros.protein * 10) / 10,
      target_carbs: Math.round(macros.carbs * 10) / 10,
      target_fat: Math.round(macros.fat * 10) / 10,
      meals: processedMeals,
      shopping_list: shoppingList,
      recommendations
    };

    console.log('✅ === DIETA GERADA COM SUCESSO ===');
    return NextResponse.json(response);

  } catch (error: any) {
    console.error('❌ === ERRO AO GERAR DIETA ===', error);
    return NextResponse.json(
      { error: 'Erro ao gerar dieta', details: error.message },
      { status: 500 }
    );
  }
}