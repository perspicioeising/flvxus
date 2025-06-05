// app/api/ai/nutrition-recommendations/route.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface NutritionRequest {
  assessment_data: {
    weight: number;
    height: number;
    fat_percentage: number;
    lean_mass: number;
    bmi: number;
    age: number;
    gender: string;
  };
  activity_data: {
    training_frequency: number;
    training_intensity: 'low' | 'moderate' | 'high';
    cardio_frequency: number;
    daily_activity_level: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active';
  };
  preferences: {
    dietary_restrictions?: string[];
    food_allergies?: string[];
    meal_preferences?: string[];
    budget_level?: 'low' | 'medium' | 'high';
    cooking_skill?: 'beginner' | 'intermediate' | 'advanced';
  };
  goals: string[];
  medical_conditions?: string;
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
      .select('role, tenant_id')
      .eq('user_id', session.user.id)
      .single();

    if (profileError || profile?.role !== 'trainer') {
      return NextResponse.json(
        { error: 'Access restricted to trainers' },
        { status: 403 }
      );
    }

    const requestData: NutritionRequest = await request.json();

    // Gerar recomendações nutricionais com IA
    const recommendations = await generateNutritionRecommendations(requestData);

    return NextResponse.json(recommendations);

  } catch (error: any) {
    console.error('Error generating nutrition recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to generate nutrition recommendations' },
      { status: 500 }
    );
  }
}

async function generateNutritionRecommendations(data: NutritionRequest) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
Como nutricionista esportivo especializado, crie um plano nutricional personalizado baseado nos dados fornecidos.

DADOS ANTROPOMÉTRICOS:
- Idade: ${data.assessment_data.age} anos
- Gênero: ${data.assessment_data.gender === 'male' ? 'Masculino' : 'Feminino'}
- Peso: ${data.assessment_data.weight} kg
- Altura: ${data.assessment_data.height} cm
- IMC: ${data.assessment_data.bmi}
- % Gordura: ${data.assessment_data.fat_percentage}%
- Massa Magra: ${data.assessment_data.lean_mass} kg

ATIVIDADE FÍSICA:
- Treinos por semana: ${data.activity_data.training_frequency}
- Intensidade: ${data.activity_data.training_intensity}
- Cardio por semana: ${data.activity_data.cardio_frequency}
- Nível de atividade diária: ${data.activity_data.daily_activity_level}

PREFERÊNCIAS E RESTRIÇÕES:
- Restrições alimentares: ${data.preferences.dietary_restrictions?.join(', ') || 'Nenhuma'}
- Alergias: ${data.preferences.food_allergies?.join(', ') || 'Nenhuma'}
- Preferências: ${data.preferences.meal_preferences?.join(', ') || 'Nenhuma'}
- Orçamento: ${data.preferences.budget_level || 'Médio'}
- Habilidade culinária: ${data.preferences.cooking_skill || 'Intermediária'}

OBJETIVOS: ${data.goals.join(', ')}
CONDIÇÕES MÉDICAS: ${data.medical_conditions || 'Nenhuma'}

Crie um plano nutricional estruturado em JSON com:

1. ANÁLISE METABÓLICA (metabolic_analysis)
   - bmr: taxa metabólica basal calculada
   - tdee: gasto energético total diário
   - caloric_target: meta calórica para os objetivos
   - macronutrient_distribution: distribuição de macros em gramas e percentuais

2. PLANO CALÓRICO (caloric_plan)
   - maintenance_calories: calorias de manutenção
   - target_calories: calorias alvo
   - caloric_adjustment: ajuste (+/- calorias)
   - weekly_adjustment: ajuste semanal baseado em resultados

3. MACRONUTRIENTES (macronutrients)
   - protein: proteína em gramas e g/kg
   - carbohydrates: carboidratos em gramas e percentual
   - fats: gorduras em gramas e percentual
   - fiber: fibras em gramas
   - water: hidratação em litros

4. CRONOGRAMA DE REFEIÇÕES (meal_timing)
   - Para cada refeição (café, lanche manhã, almoço, lanche tarde, jantar, ceia):
     - meal_name: nome da refeição
     - timing: horário sugerido
     - calories: calorias da refeição
     - macros: macros da refeição
     - food_examples: exemplos de alimentos

5. SUPLEMENTAÇÃO (supplementation)
   - essential: suplementos essenciais
   - recommended: suplementos recomendados
   - optional: suplementos opcionais
   - timing: quando tomar cada um

6. HIDRATAÇÃO (hydration)
   - daily_target: meta diária em litros
   - pre_workout: hidratação pré-treino
   - during_workout: durante treino
   - post_workout: pós-treino
   - general_tips: dicas gerais

7. TIMING NUTRICIONAL (nutrient_timing)
   - pre_workout: alimentação pré-treino
   - post_workout: alimentação pós-treino
   - before_bed: antes de dormir
   - upon_waking: ao acordar

8. ALIMENTOS RECOMENDADOS (recommended_foods)
   - proteins: fontes de proteína
   - carbohydrates: fontes de carboidrato
   - fats: fontes de gordura
   - vegetables: vegetais recomendados
   - fruits: frutas recomendadas

9. ALIMENTOS A EVITAR (foods_to_avoid)
   - Lista de alimentos ou grupos alimentares a limitar/evitar baseado nos objetivos

10. MONITORAMENTO (monitoring)
   - metrics_to_track: métricas para acompanhar
   - frequency: frequência de avaliação
   - adjustment_indicators: quando ajustar o plano
   - success_markers: marcadores de sucesso

11. DICAS PRÁTICAS (practical_tips)
   - meal_prep: dicas de preparação de refeições
   - budget_tips: dicas para economizar
   - cooking_tips: dicas culinárias baseadas no nível
   - lifestyle_integration: como integrar ao estilo de vida

Responda APENAS com JSON válido, sem texto adicional.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
    const recommendations = JSON.parse(cleanedText);
    
    return {
      ...recommendations,
      metadata: {
        generated_at: new Date().toISOString(),
        model_used: "gemini-1.5-flash",
        based_on_assessment: true,
        personalization_factors: {
          has_dietary_restrictions: !!(data.preferences.dietary_restrictions && data.preferences.dietary_restrictions.length > 0),
          has_allergies: !!(data.preferences.food_allergies && data.preferences.food_allergies.length > 0),
          activity_level: data.activity_data.daily_activity_level,
          training_frequency: data.activity_data.training_frequency,
          primary_goal: data.goals[0] || 'general_health'
        }
      }
    };
    
  } catch (error) {
    console.error('Error parsing AI response:', error);
    
    // Fallback para recomendação básica
    return generateFallbackNutritionPlan(data);
  }
}

function generateFallbackNutritionPlan(data: NutritionRequest) {
  const { assessment_data, activity_data, goals } = data;
  
  // Cálculos básicos
  const bmr = calculateBMR(assessment_data.weight, assessment_data.height, assessment_data.age, assessment_data.gender);
  const activityMultiplier = getActivityMultiplier(activity_data.daily_activity_level, activity_data.training_frequency);
  const tdee = bmr * activityMultiplier;
  
  // Determinar objetivo calórico
  let caloricAdjustment = 0;
  if (goals.includes('Redução de gordura corporal')) {
    caloricAdjustment = -500; // Déficit para perda de peso
  } else if (goals.includes('Ganho de massa muscular')) {
    caloricAdjustment = 300; // Superávit para ganho
  }
  
  const targetCalories = tdee + caloricAdjustment;
  
  // Macronutrientes
  const proteinGrams = assessment_data.weight * 2.2; // 2.2g/kg para treino
  const fatGrams = targetCalories * 0.25 / 9; // 25% das calorias
  const carbGrams = (targetCalories - (proteinGrams * 4) - (fatGrams * 9)) / 4;
  
  return {
    metabolic_analysis: {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      caloric_target: Math.round(targetCalories),
      macronutrient_distribution: {
        protein: { grams: Math.round(proteinGrams), percentage: Math.round((proteinGrams * 4 / targetCalories) * 100) },
        carbs: { grams: Math.round(carbGrams), percentage: Math.round((carbGrams * 4 / targetCalories) * 100) },
        fats: { grams: Math.round(fatGrams), percentage: 25 }
      }
    },
    caloric_plan: {
      maintenance_calories: Math.round(tdee),
      target_calories: Math.round(targetCalories),
      caloric_adjustment: caloricAdjustment,
      weekly_adjustment: "Ajustar ±200 calorias baseado nos resultados"
    },
    macronutrients: {
      protein: { grams: Math.round(proteinGrams), per_kg: 2.2 },
      carbohydrates: { grams: Math.round(carbGrams), percentage: Math.round((carbGrams * 4 / targetCalories) * 100) },
      fats: { grams: Math.round(fatGrams), percentage: 25 },
      fiber: 25,
      water: Math.round(assessment_data.weight * 0.035)
    },
    meal_timing: generateBasicMealPlan(Math.round(targetCalories)),
    supplementation: {
      essential: ["Whey Protein", "Multivitamínico"],
      recommended: ["Creatina", "Ômega 3"],
      optional: ["Vitamina D", "Magnésio"],
      timing: "Whey pós-treino, multivitamínico com café da manhã"
    },
    hydration: {
      daily_target: Math.round(assessment_data.weight * 0.035),
      pre_workout: "500ml 30min antes",
      during_workout: "150-200ml a cada 15-20min",
      post_workout: "150% do peso perdido",
      general_tips: "Monitore cor da urina"
    },
    nutrient_timing: {
      pre_workout: "Carboidratos 30-60min antes",
      post_workout: "Proteína + carboidratos até 2h após",
      before_bed: "Proteína de digestão lenta",
      upon_waking: "Hidratação + proteína"
    },
    recommended_foods: {
      proteins: ["Frango", "Peixe", "Ovos", "Whey", "Carne magra"],
      carbohydrates: ["Aveia", "Batata doce", "Arroz integral", "Frutas"],
      fats: ["Azeite", "Castanhas", "Abacate", "Peixes gordos"],
      vegetables: ["Brócolis", "Espinafre", "Couve", "Abobrinha"],
      fruits: ["Banana", "Maçã", "Berries", "Laranja"]
    },
    foods_to_avoid: [
      "Alimentos ultraprocessados",
      "Açúcar refinado em excesso",
      "Frituras frequentes",
      "Refrigerantes regulares"
    ],
    monitoring: {
      metrics_to_track: ["Peso corporal", "Circunferências", "Performance", "Energia"],
      frequency: "Semanal",
      adjustment_indicators: ["Estagnação por 2 semanas", "Perda/ganho muito rápido"],
      success_markers: ["Melhora na composição corporal", "Aumento de energia"]
    },
    practical_tips: {
      meal_prep: "Prepare proteínas e carboidratos em lote",
      budget_tips: "Compre em quantidade, use alimentos sazonais",
      cooking_tips: "Temperos naturais, métodos de cocção saudáveis",
      lifestyle_integration: "Planeje refeições conforme rotina"
    },
    metadata: {
      generated_at: new Date().toISOString(),
      model_used: "fallback-calculations",
      based_on_assessment: true,
      personalization_factors: {
        has_dietary_restrictions: false,
        has_allergies: false,
        activity_level: activity_data.daily_activity_level,
        training_frequency: activity_data.training_frequency,
        primary_goal: goals[0] || 'general_health'
      }
    }
  };
}

function calculateBMR(weight: number, height: number, age: number, gender: string): number {
  // Fórmula de Harris-Benedict revisada
  if (gender === 'male') {
    return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
  } else {
    return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
  }
}

function getActivityMultiplier(activityLevel: string, trainingFrequency: number): number {
  let baseMultiplier = 1.2; // Sedentário
  
  switch (activityLevel) {
    case 'lightly_active': baseMultiplier = 1.375; break;
    case 'moderately_active': baseMultiplier = 1.55; break;
    case 'very_active': baseMultiplier = 1.725; break;
  }
  
  // Ajuste baseado na frequência de treino
  const trainingAdjustment = trainingFrequency * 0.05;
  return baseMultiplier + trainingAdjustment;
}

function generateBasicMealPlan(totalCalories: number) {
  const calorieDistribution = {
    breakfast: 0.25,
    morning_snack: 0.10,
    lunch: 0.30,
    afternoon_snack: 0.10,
    dinner: 0.20,
    evening_snack: 0.05
  };
  
  return Object.entries(calorieDistribution).map(([meal, percentage]) => ({
    meal_name: getMealName(meal),
    timing: getMealTiming(meal),
    calories: Math.round(totalCalories * percentage),
    macros: "Distribuição equilibrada de macronutrientes",
    food_examples: getMealExamples(meal)
  }));
}

function getMealName(meal: string): string {
  const names = {
    breakfast: 'Café da Manhã',
    morning_snack: 'Lanche da Manhã',
    lunch: 'Almoço',
    afternoon_snack: 'Lanche da Tarde',
    dinner: 'Jantar',
    evening_snack: 'Ceia'
  };
  return names[meal as keyof typeof names] || meal;
}

function getMealTiming(meal: string): string {
  const timings = {
    breakfast: '07:00-08:00',
    morning_snack: '10:00-10:30',
    lunch: '12:00-13:00',
    afternoon_snack: '15:30-16:00',
    dinner: '19:00-20:00',
    evening_snack: '21:30-22:00'
  };
  return timings[meal as keyof typeof timings] || '';
}

function getMealExamples(meal: string): string[] {
  const examples = {
    breakfast: ['Aveia com frutas', 'Ovos mexidos', 'Iogurte com granola'],
    morning_snack: ['Fruta com castanhas', 'Vitamina de proteína'],
    lunch: ['Arroz + proteína + legumes', 'Salada completa'],
    afternoon_snack: ['Sanduíche natural', 'Shake de proteína'],
    dinner: ['Proteína + vegetais + carboidrato'],
    evening_snack: ['Caseína', 'Iogurte natural']
  };
  return examples[meal as keyof typeof examples] || [];
}