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

// Função para calcular TMB
function calculateBMR(weight: number, height: number, age: number, gender: string): number {
  if (gender === 'male') {
    return (10 * weight) + (6.25 * height) - (5 * age) + 5;
  } else {
    return (10 * weight) + (6.25 * height) - (5 * age) - 161;
  }
}

// Função para calcular TDEE
function calculateTDEE(bmr: number, activityLevel: string, goal: string): number {
  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    intense: 1.725,
    athlete: 1.9
  };
  
  let tdee = bmr * (multipliers[activityLevel as keyof typeof multipliers] || 1.2);
  
  switch (goal) {
    case 'fat_loss':
      return tdee * 0.85;
    case 'muscle_gain':
      return tdee * 1.15;
    case 'performance':
      return tdee * 1.1;
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
      proteinGrams = weight * 2.0;
      fatPercent = 0.25;
      break;
    case 'fat_loss':
      proteinGrams = weight * 2.2;
      fatPercent = 0.3;
      break;
    case 'performance':
      proteinGrams = weight * 1.6;
      fatPercent = 0.25;
      break;
    default:
      proteinGrams = weight * 1.4;
      fatPercent = 0.3;
  }
  
  const proteinCalories = proteinGrams * 4;
  const fatCalories = calories * fatPercent;
  const fatGrams = fatCalories / 9;
  const carbCalories = calories - proteinCalories - fatCalories;
  const carbGrams = carbCalories / 4;
  
  return {
    protein: Math.max(proteinGrams, 50),
    carbs: Math.max(carbGrams, 100),
    fat: Math.max(fatGrams, 30)
  };
}

// Função para gerar prompt inteligente
function generateAIPrompt(dietParams: DietRequest, targetCalories: number, macros: any): string {
  const restrictions = dietParams.restrictions.length > 0 ? 
    `RESTRIÇÕES ALIMENTARES: ${dietParams.restrictions.join(', ')}. ` : '';
  
  const dietaryStyle = dietParams.dietary_style.length > 0 ? 
    `ESTILO ALIMENTAR: ${dietParams.dietary_style.join(', ')}. ` : '';
  
  const preferences = dietParams.food_preferences.length > 0 ? 
    `PREFERÊNCIAS: ${dietParams.food_preferences.join(', ')}. ` : '';
  
  const budget = dietParams.budget_profile === 'economic' ? 'ORÇAMENTO: Econômico, priorize alimentos básicos e acessíveis. ' : 
                dietParams.budget_profile === 'free' ? 'ORÇAMENTO: Livre, pode incluir alimentos premium e exóticos. ' : 
                'ORÇAMENTO: Moderado, equilibre preço e qualidade. ';

  return `Você é um nutricionista especializado CRIATIVO que conhece centenas de alimentos diferentes. Crie uma dieta ÚNICA e VARIADA com exatamente ${dietParams.meals_per_day} refeições para:

PERFIL DO CLIENTE:
- ${dietParams.gender === 'male' ? 'Homem' : 'Mulher'} de ${dietParams.age} anos
- Peso: ${dietParams.weight}kg
- Altura: ${dietParams.height || 170}cm
- Nível de atividade: ${dietParams.activity_level}
- Objetivo principal: ${dietParams.goal}

METAS NUTRICIONAIS DIÁRIAS:
- Calorias: ${Math.round(targetCalories)} kcal
- Proteínas: ${Math.round(macros.protein)}g
- Carboidratos: ${Math.round(macros.carbs)}g
- Gorduras: ${Math.round(macros.fat)}g

${restrictions}${dietaryStyle}${preferences}${budget}

INSTRUÇÕES IMPORTANTES - SEJA CRIATIVO:
1. Use alimentos BRASILEIROS variados e regionais (mandioca, caju, açaí, cupuaçu, pequi, etc.)
2. Inclua superalimentos (chia, linhaça, spirulina, chlorella, goji berry, etc.)
3. Varie MUITO as proteínas: além do básico, use pintado, dourado, camarão, polvo, codorna, etc.
4. Use carboidratos diferentes: inhame, cará, quinoa colorida, amaranto, trigo sarraceno
5. Inclua vegetais e frutas exóticas: ora-pro-nobis, bertalha, physalis, pitaya, etc.
6. Use temperos e ervas variados: cúrcuma, gengibre, manjericão roxo, etc.
7. Métodos de preparo diversos: vapor, papillote, sous-vide, defumado, fermentado
8. NUNCA repita a mesma combinação - seja único e criativo!

EXEMPLOS DO QUE USAR (seja ainda mais criativo):
- Proteínas: salmão selvagem, linguado, robalo, camarão rosa, polvo, lula, cordeiro, cabrito, codorna, ovos de pata
- Carboidratos: batata baroa, inhame roxo, cará, quinoa vermelha, amaranto, trigo sarraceno, tapioca colorida
- Vegetais: ora-pro-nobis, bertalha, almeirão, taioba, couve-rábano, rabanete, nabo
- Frutas: physalis, pitaya, graviola, cupuaçu, caju, jabuticaba, cambuci, uvaia
- Gorduras: óleo de macadâmia, manteiga ghee, óleo de coco extravirgem, pasta de amendoim integral

RESPONDA APENAS NO FORMATO JSON EXATO:
{
  "meals": [
    {
      "meal_type": "breakfast",
      "meal_time": "07:00",
      "name": "Café da Manhã",
      "description": "Descrição criativa da refeição",
      "foods": [
        {
          "food_name": "Nome específico e criativo do alimento com preparo",
          "quantity": 100,
          "unit": "g"
        }
      ]
    }
  ]
}

Seja EXTREMAMENTE criativo e use alimentos que eu nunca imaginaria! Surpreenda-me com combinações únicas e nutritivas!`;
}

// Função para gerar dieta com Gemini
async function generateDietWithGemini(prompt: string): Promise<any> {
  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY não configurada');
    }

    console.log('Chamando Gemini API...');
    
    // URL corrigida para a versão mais recente
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192,
            topP: 0.95,
            topK: 40
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_NONE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_NONE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_NONE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_NONE"
            }
          ]
        })
      }
    );

    console.log('Status da resposta:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Error Response:', errorText);
      
      // Se for 404, tentar com modelo alternativo
      if (response.status === 404) {
        console.log('Tentando com modelo alternativo...');
        return await generateDietWithGeminiAlternative(prompt);
      }
      
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Resposta completa da Gemini:', JSON.stringify(data, null, 2));
    
    if (!data.candidates || !data.candidates[0]) {
      console.error('Estrutura de resposta inválida:', data);
      throw new Error('Resposta inválida da Gemini API - sem candidates');
    }

    if (data.candidates[0].finishReason === 'SAFETY') {
      console.error('Resposta bloqueada por filtros de segurança');
      throw new Error('Conteúdo bloqueado por filtros de segurança');
    }

    const aiContent = data.candidates[0].content.parts[0].text;
    console.log('Conteúdo da resposta:', aiContent.substring(0, 500) + '...');
    
    // Tentar extrair JSON da resposta
    const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Resposta sem JSON válido:', aiContent);
      throw new Error('Resposta da IA não contém JSON válido');
    }

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('Erro ao fazer parse do JSON:', parseError);
      console.error('JSON problemático:', jsonMatch[0]);
      throw new Error('JSON malformado na resposta da IA');
    }
    
    if (!parsedResponse.meals || !Array.isArray(parsedResponse.meals)) {
      console.error('Estrutura inválida:', parsedResponse);
      throw new Error('Estrutura de resposta inválida - meals não encontrado');
    }

    console.log('Resposta processada com sucesso:', parsedResponse.meals.length, 'refeições');
    return parsedResponse;
    
  } catch (error) {
    console.error('Erro ao gerar dieta com Gemini:', error);
    throw error;
  }
}

// Função alternativa com modelo diferente
async function generateDietWithGeminiAlternative(prompt: string): Promise<any> {
  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    
    console.log('Tentando com gemini-pro...');
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4096,
            topP: 0.8,
            topK: 40
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro com modelo alternativo:', errorText);
      
      // Se ainda der erro, usar fallback local
      console.log('Usando fallback local...');
      return generateFallbackDiet(prompt);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0]) {
      return generateFallbackDiet(prompt);
    }

    const aiContent = data.candidates[0].content.parts[0].text;
    const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      return generateFallbackDiet(prompt);
    }

    const parsedResponse = JSON.parse(jsonMatch[0]);
    
    if (!parsedResponse.meals || !Array.isArray(parsedResponse.meals)) {
      return generateFallbackDiet(prompt);
    }

    return parsedResponse;
    
  } catch (error) {
    console.error('Erro com modelo alternativo:', error);
    return generateFallbackDiet(prompt);
  }
}

// Função de fallback para gerar dieta localmente
function generateFallbackDiet(prompt: string): any {
  console.log('Gerando dieta com fallback local...');
  
  // Extrair informações básicas do prompt
  const mealsMatch = prompt.match(/exatamente (\d+) refeições/);
  const mealsCount = mealsMatch ? parseInt(mealsMatch[1]) : 3;
  
  const caloriesMatch = prompt.match(/Calorias: (\d+) kcal/);
  const targetCalories = caloriesMatch ? parseInt(caloriesMatch[1]) : 2000;
  
  const proteinMatch = prompt.match(/Proteínas: (\d+)g/);
  const targetProtein = proteinMatch ? parseInt(proteinMatch[1]) : 100;
  
  const isVegan = prompt.toLowerCase().includes('vegan');
  const isVegetarian = prompt.toLowerCase().includes('vegetarian');
  const isLowCarb = prompt.toLowerCase().includes('low carb') || prompt.toLowerCase().includes('low_carb');
  const isAthlete = prompt.toLowerCase().includes('athlete') || prompt.toLowerCase().includes('intense');
  const isEconomic = prompt.toLowerCase().includes('econômico');
  
  // Listas expandidas de alimentos criativos
  const creativeProteins = {
    vegan: [
      'Tofu defumado marinado', 'Tempeh grelhado com ervas', 'Seitan caseiro', 
      'Hambúrguer de lentilha e quinoa', 'Homus de grão-de-bico', 'Pasta de amendoim integral',
      'Mix de castanhas ativadas', 'Quinoa tricolor cozida', 'Amaranto em flocos',
      'Proteína texturizada de soja refogada', 'Tahine de gergelim', 'Spirulina em pó'
    ],
    vegetarian: [
      'Omelete de ovos caipira com espinafre', 'Queijo cottage com ervas finas',
      'Ricota temperada com manjericão', 'Iogurte grego com probióticos',
      'Queijo frescal de cabra', 'Ovos de codorna cozidos', 'Paneer indiano grelhado',
      'Kefir caseiro', 'Queijo minas padrão', 'Requeijão de búfala'
    ],
    omnivore: [
      'Salmão selvagem grelhado', 'Linguado ao vapor com limão siciliano',
      'Camarão rosa refogado com alho', 'Robalo assado com ervas',
      'Pintado grelhado na brasa', 'Cordeiro assado com alecrim',
      'Peito de pato confitado', 'Codorna assada', 'Polvo cozido no vinho',
      'Atum selado com gergelim', 'Hadoque defumado', 'Bacalhau desfiado'
    ]
  };

  const creativeCarbs = {
    economic: [
      'Mandioca cozida com coco', 'Inhame roxo assado', 'Cará refogado com cebola',
      'Batata baroa no vapor', 'Jerimum (abóbora) assado', 'Milho verde cozido',
      'Tapioca recheada', 'Farinha de mandioca torrada', 'Polenta cremosa'
    ],
    premium: [
      'Quinoa vermelha cozida', 'Amaranto em grãos', 'Trigo sarraceno germinado',
      'Arroz negro integral', 'Aveia steel cut', 'Chia pudding',
      'Granola artesanal com frutas secas', 'Pão de fermentação natural',
      'Batata-doce roxa assada', 'Cuscuz marroquino integral'
    ]
  };

  const creativeFruits = [
    'Pitaya vermelha fatiada', 'Physalis in natura', 'Graviola polpa',
    'Cupuaçu cremoso', 'Caju fresco', 'Jabuticaba', 'Cambuci',
    'Uvaia', 'Mangaba', 'Pequi', 'Buriti polpa', 'Açaí puro',
    'Caqui fuyu', 'Figo roxo', 'Amora silvestre', 'Goji berry'
  ];

  const creativeVeggies = [
    'Ora-pro-nobis refogado', 'Bertalha no vapor', 'Taioba grelhada',
    'Almeirão salteado', 'Couve-rábano em cubos', 'Maxixe refogado',
    'Quiabo grelhado', 'Jiló na brasa', 'Chuchu recheado',
    'Abobrinha italiana em espirais', 'Beterraba baby assada',
    'Rabanete em fatias', 'Nabo refogado', 'Acelga colorida'
  ];

  const creativeFats = [
    'Óleo de macadâmia extravirgem', 'Manteiga ghee', 'Óleo de coco orgânico',
    'Pasta de castanha de caju', 'Tahine de gergelim preto', 'Óleo de linhaça dourada',
    'Manteiga de amêndoas crua', 'Óleo de abacate', 'Castanha-do-pará gigante',
    'Nozes pecan', 'Pistache torrado', 'Macadâmia crua'
  ];

  const mealTypes = [
    { type: 'breakfast', time: '07:00', name: 'Café da Manhã Energético' },
    { type: 'morning_snack', time: '10:00', name: 'Lanche Matinal Nutritivo' },
    { type: 'lunch', time: '12:30', name: 'Almoço Balanceado' },
    { type: 'afternoon_snack', time: '15:30', name: 'Lanche Vespertino' },
    { type: 'dinner', time: '19:00', name: 'Jantar Reparador' },
    { type: 'evening_snack', time: '21:30', name: 'Lanche Noturno Leve' }
  ];

  const selectedMeals = mealTypes.slice(0, mealsCount);
  
  // Função para selecionar alimento aleatório
  const getRandomItem = (array: string[]) => array[Math.floor(Math.random() * array.length)];
  
  const meals = selectedMeals.map((meal, index) => {
    let foods = [];
    
    if (meal.type === 'breakfast') {
      if (isVegan) {
        foods = [
          { food_name: getRandomItem(creativeCarbs.premium), quantity: 50, unit: 'g' },
          { food_name: getRandomItem(creativeFruits), quantity: 1, unit: 'unidade' },
          { food_name: 'Leite de amêndoas caseiro', quantity: 200, unit: 'ml' },
          { food_name: getRandomItem(creativeFats), quantity: 15, unit: 'g' },
          { food_name: 'Spirulina em pó', quantity: 5, unit: 'g' }
        ];
      } else if (isVegetarian) {
        foods = [
          { food_name: getRandomItem(creativeProteins.vegetarian), quantity: 2, unit: 'unidades' },
          { food_name: isEconomic ? 'Tapioca de goma integral' : 'Pão de fermentação natural', quantity: 2, unit: 'fatias' },
          { food_name: getRandomItem(creativeFruits), quantity: 1, unit: 'unidade' },
          { food_name: getRandomItem(creativeFats), quantity: 10, unit: 'g' }
        ];
      } else {
        foods = [
          { food_name: 'Ovos de codorna cozidos', quantity: 6, unit: 'unidades' },
          { food_name: isEconomic ? 'Mandioca cozida' : 'Quinoa em flocos dourada', quantity: 40, unit: 'g' },
          { food_name: getRandomItem(creativeFruits), quantity: 1, unit: 'unidade' },
          { food_name: 'Manteiga ghee', quantity: 10, unit: 'g' }
        ];
      }
    } else if (meal.type === 'lunch' || meal.type === 'dinner') {
      if (isVegan) {
        foods = [
          { food_name: isEconomic ? getRandomItem(creativeCarbs.economic) : getRandomItem(creativeCarbs.premium), quantity: 120, unit: 'g' },
          { food_name: getRandomItem(creativeProteins.vegan), quantity: 100, unit: 'g' },
          { food_name: getRandomItem(creativeVeggies), quantity: 80, unit: 'g' },
          { food_name: getRandomItem(creativeVeggies), quantity: 60, unit: 'g' },
          { food_name: getRandomItem(creativeFats), quantity: 15, unit: 'ml' }
        ];
      } else if (isLowCarb) {
        foods = [
          { food_name: getRandomItem(creativeProteins.omnivore), quantity: 180, unit: 'g' },
          { food_name: getRandomItem(creativeVeggies), quantity: 100, unit: 'g' },
          { food_name: getRandomItem(creativeVeggies), quantity: 80, unit: 'g' },
          { food_name: 'Abacate maduro fatiado', quantity: 60, unit: 'g' },
          { food_name: 'Óleo de macadâmia', quantity: 15, unit: 'ml' }
        ];
      } else {
        const protein = isEconomic ? 'Peito de frango orgânico grelhado' : getRandomItem(creativeProteins.omnivore);
        const carb = isEconomic ? getRandomItem(creativeCarbs.economic) : getRandomItem(creativeCarbs.premium);
        
        foods = [
          { food_name: carb, quantity: 120, unit: 'g' },
          { food_name: protein, quantity: 150, unit: 'g' },
          { food_name: 'Feijão fradinho cozido', quantity: 80, unit: 'g' },
          { food_name: getRandomItem(creativeVeggies), quantity: 100, unit: 'g' },
          { food_name: getRandomItem(creativeVeggies), quantity: 60, unit: 'g' }
        ];
      }
    } else {
      // Lanches criativos
      if (isVegan) {
        foods = [
          { food_name: 'Mix de castanhas ativadas', quantity: 30, unit: 'g' },
          { food_name: getRandomItem(creativeFruits), quantity: 1, unit: 'unidade' },
          { food_name: 'Chia pudding com leite de coco', quantity: 80, unit: 'g' }
        ];
      } else if (isAthlete) {
        foods = [
          { food_name: 'Whey protein de cabra', quantity: 30, unit: 'g' },
          { food_name: 'Banana nanica', quantity: 1, unit: 'unidade' },
          { food_name: 'Pasta de amendoim integral', quantity: 20, unit: 'g' },
          { food_name: 'Aveia em flocos grossos', quantity: 30, unit: 'g' }
        ];
      } else {
        foods = [
          { food_name: 'Kefir de leite de cabra', quantity: 150, unit: 'ml' },
          { food_name: 'Granola artesanal sem açúcar', quantity: 40, unit: 'g' },
          { food_name: getRandomItem(creativeFruits), quantity: 80, unit: 'g' }
        ];
      }
    }
    
    return {
      meal_type: meal.type,
      meal_time: meal.time,
      name: meal.name,
      description: `${meal.name} elaborado com ingredientes selecionados e nutritivos`,
      foods
    };
  });

  return { meals };
}

// Função para calcular dados nutricionais estimados
function calculateNutritionData(foodName: string, quantity: number, unit: string) {
  // Base de dados expandida para alimentos criativos
  const nutritionDB: { [key: string]: { cal: number; prot: number; carb: number; fat: number } } = {
    // Proteínas tradicionais
    'frango': { cal: 165, prot: 31, carb: 0, fat: 3.6 },
    'peito de frango': { cal: 165, prot: 31, carb: 0, fat: 3.6 },
    'ovo': { cal: 155, prot: 13, carb: 1, fat: 11 },
    'salmão': { cal: 208, prot: 25, carb: 0, fat: 12 },
    'atum': { cal: 132, prot: 28, carb: 0, fat: 1 },
    'carne': { cal: 250, prot: 26, carb: 0, fat: 15 },
    'tofu': { cal: 76, prot: 8, carb: 1.9, fat: 4.8 },
    'lentilha': { cal: 116, prot: 9, carb: 20, fat: 0.4 },
    'feijão': { cal: 127, prot: 9, carb: 23, fat: 0.5 },
    'queijo cottage': { cal: 98, prot: 11, carb: 3.4, fat: 4.3 },
    
    // Proteínas criativas
    'linguado': { cal: 91, prot: 18.8, carb: 0, fat: 1.2 },
    'robalo': { cal: 97, prot: 18.4, carb: 0, fat: 2.0 },
    'camarão': { cal: 99, prot: 18, carb: 0.9, fat: 1.7 },
    'polvo': { cal: 82, prot: 14.9, carb: 2.2, fat: 1.0 },
    'cordeiro': { cal: 294, prot: 24.5, carb: 0, fat: 20.9 },
    'codorna': { cal: 227, prot: 25.1, carb: 0, fat: 13.2 },
    'pintado': { cal: 108, prot: 18.7, carb: 0, fat: 3.2 },
    'hadoque': { cal: 90, prot: 20.6, carb: 0, fat: 0.7 },
    'bacalhau': { cal: 105, prot: 22.8, carb: 0, fat: 0.9 },
    'tempeh': { cal: 193, prot: 19, carb: 9, fat: 11 },
    'seitan': { cal: 140, prot: 25, carb: 6, fat: 2 },
    'spirulina': { cal: 290, prot: 57, carb: 24, fat: 8 },
    'paneer': { cal: 265, prot: 20, carb: 1.2, fat: 20 },
    'kefir': { cal: 41, prot: 3.5, carb: 4.7, fat: 1.0 },
    
    // Carboidratos tradicionais
    'arroz': { cal: 130, prot: 2.7, carb: 28, fat: 0.3 },
    'batata doce': { cal: 86, prot: 1.6, carb: 20, fat: 0.1 },
    'aveia': { cal: 389, prot: 17, carb: 66, fat: 7 },
    'pão': { cal: 247, prot: 13, carb: 41, fat: 4.2 },
    'banana': { cal: 89, prot: 1.1, carb: 23, fat: 0.3 },
    'maçã': { cal: 52, prot: 0.3, carb: 14, fat: 0.2 },
    'quinoa': { cal: 120, prot: 4.4, carb: 22, fat: 1.9 },
    
    // Carboidratos criativos
    'mandioca': { cal: 160, prot: 1.4, carb: 38, fat: 0.3 },
    'inhame': { cal: 118, prot: 1.5, carb: 28, fat: 0.2 },
    'cará': { cal: 105, prot: 2.3, carb: 24, fat: 0.1 },
    'batata baroa': { cal: 98, prot: 0.8, carb: 24, fat: 0.1 },
    'amaranto': { cal: 371, prot: 13.6, carb: 65, fat: 7.0 },
    'trigo sarraceno': { cal: 343, prot: 13.2, carb: 72, fat: 3.4 },
    'arroz negro': { cal: 356, prot: 8.9, carb: 75, fat: 3.2 },
    'tapioca': { cal: 358, prot: 1.2, carb: 88, fat: 0.2 },
    'cuscuz': { cal: 112, prot: 3.8, carb: 23, fat: 0.2 },
    'jerimum': { cal: 26, prot: 1.0, carb: 6.5, fat: 0.1 },
    'milho': { cal: 96, prot: 3.4, carb: 21, fat: 1.5 },
    
    // Frutas criativas
    'pitaya': { cal: 60, prot: 1.2, carb: 13, fat: 0.4 },
    'physalis': { cal: 53, prot: 1.9, carb: 11, fat: 0.7 },
    'graviola': { cal: 66, prot: 1.0, carb: 17, fat: 0.3 },
    'cupuaçu': { cal: 72, prot: 1.7, carb: 18, fat: 0.2 },
    'caju': { cal: 43, prot: 1.6, carb: 9.3, fat: 0.4 },
    'jabuticaba': { cal: 58, prot: 0.6, carb: 15, fat: 0.1 },
    'cambuci': { cal: 41, prot: 0.5, carb: 10, fat: 0.2 },
    'uvaia': { cal: 33, prot: 0.8, carb: 7.6, fat: 0.3 },
    'mangaba': { cal: 43, prot: 0.5, carb: 11, fat: 0.1 },
    'pequi': { cal: 205, prot: 4.2, carb: 8.5, fat: 18 },
    'buriti': { cal: 306, prot: 3.3, carb: 27, fat: 21 },
    'açaí': { cal: 58, prot: 0.8, carb: 6.2, fat: 3.9 },
    'goji berry': { cal: 349, prot: 14, carb: 77, fat: 0.4 },
    'caqui': { cal: 70, prot: 0.6, carb: 18, fat: 0.2 },
    'figo': { cal: 74, prot: 0.8, carb: 19, fat: 0.3 },
    'amora': { cal: 43, prot: 1.4, carb: 10, fat: 0.5 },
    
    // Vegetais criativos
    'brócolis': { cal: 34, prot: 2.8, carb: 7, fat: 0.4 },
    'salada': { cal: 20, prot: 2, carb: 4, fat: 0.2 },
    'cenoura': { cal: 41, prot: 0.9, carb: 10, fat: 0.2 },
    'tomate': { cal: 18, prot: 0.9, carb: 3.9, fat: 0.2 },
    'espinafre': { cal: 23, prot: 2.9, carb: 3.6, fat: 0.4 },
    'ora-pro-nobis': { cal: 25, prot: 4.2, carb: 2.9, fat: 0.3 },
    'bertalha': { cal: 19, prot: 1.8, carb: 3.1, fat: 0.3 },
    'taioba': { cal: 28, prot: 2.5, carb: 5.2, fat: 0.4 },
    'almeirão': { cal: 17, prot: 1.7, carb: 3.2, fat: 0.2 },
    'couve-rábano': { cal: 27, prot: 1.7, carb: 6.2, fat: 0.1 },
    'maxixe': { cal: 19, prot: 0.7, carb: 4.6, fat: 0.1 },
    'quiabo': { cal: 33, prot: 1.9, carb: 7.5, fat: 0.2 },
    'jiló': { cal: 27, prot: 1.4, carb: 6.0, fat: 0.2 },
    'chuchu': { cal: 19, prot: 0.8, carb: 4.5, fat: 0.1 },
    'acelga': { cal: 19, prot: 1.8, carb: 3.7, fat: 0.2 },
    'rabanete': { cal: 16, prot: 0.7, carb: 3.4, fat: 0.1 },
    'nabo': { cal: 28, prot: 0.9, carb: 6.4, fat: 0.1 },
    
    // Gorduras criativas
    'abacate': { cal: 160, prot: 2, carb: 9, fat: 15 },
    'castanha': { cal: 656, prot: 14, carb: 12, fat: 66 },
    'amêndoa': { cal: 579, prot: 21, carb: 22, fat: 50 },
    'azeite': { cal: 884, prot: 0, carb: 0, fat: 100 },
    'macadâmia': { cal: 718, prot: 7.9, carb: 14, fat: 76 },
    'ghee': { cal: 900, prot: 0, carb: 0, fat: 100 },
    'óleo de coco': { cal: 862, prot: 0, carb: 0, fat: 100 },
    'tahine': { cal: 595, prot: 18, carb: 21, fat: 54 },
    'óleo de linhaça': { cal: 884, prot: 0, carb: 0, fat: 100 },
    'pistache': { cal: 560, prot: 20, carb: 28, fat: 45 },
    'nozes': { cal: 654, prot: 15, carb: 14, fat: 65 },
    'chia': { cal: 486, prot: 17, carb: 42, fat: 31 },
    
    // Laticínios criativos
    'iogurte': { cal: 59, prot: 10, carb: 3.6, fat: 0.4 },
    'leite': { cal: 42, prot: 3.4, carb: 5, fat: 0.1 },
    'ricota': { cal: 138, prot: 11, carb: 4, fat: 8 },
    'queijo frescal': { cal: 264, prot: 17.4, carb: 2.9, fat: 20 },
    'requeijão': { cal: 223, prot: 8.2, carb: 3.8, fat: 19 },
    
    // Superalimentos e outros
    'chlorella': { cal: 290, prot: 58, carb: 23, fat: 9 },
    'whey protein': { cal: 413, prot: 82, carb: 8, fat: 8 },
    'creatina': { cal: 0, prot: 0, carb: 0, fat: 0 },
    'levedo': { cal: 325, prot: 45, carb: 37, fat: 4 }
  };

  // Encontrar dados nutricionais (busca mais inteligente)
  let key = Object.keys(nutritionDB).find(k => 
    foodName.toLowerCase().includes(k) || k.includes(foodName.toLowerCase().split(' ')[0])
  );
  
  // Se não encontrar, tentar com palavras-chave
  if (!key) {
    const keywords = foodName.toLowerCase().split(' ');
    key = Object.keys(nutritionDB).find(k => 
      keywords.some(word => k.includes(word) || word.includes(k))
    );
  }
  
  const baseNutrition = key ? nutritionDB[key] : { cal: 100, prot: 5, carb: 15, fat: 2 };
  
  // Ajustar para quantidade
  let factor = 1;
  if (unit === 'g') {
    factor = quantity / 100;
  } else if (unit === 'ml') {
    factor = quantity / 100; // Assumir densidade similar à água
  } else if (unit === 'unidade' || unit === 'unidades') {
    // Estimativas por tipo de alimento
    if (foodName.toLowerCase().includes('ovo')) {
      factor = quantity * 0.6; // ~60g por ovo
    } else if (foodName.toLowerCase().includes('banana')) {
      factor = quantity * 1.2; // ~120g por banana
    } else if (foodName.toLowerCase().includes('maçã')) {
      factor = quantity * 1.8; // ~180g por maçã
    } else {
      factor = quantity * 0.5; // Estimativa geral
    }
  } else if (unit === 'colher' || unit === 'colheres' || unit.includes('colher')) {
    factor = quantity * 0.15; // ~15g por colher
  } else if (unit === 'fatias' || unit.includes('fatia')) {
    factor = quantity * 0.25; // ~25g por fatia
  }
  
  return {
    calories: Math.round(baseNutrition.cal * factor),
    protein: Math.round(baseNutrition.prot * factor * 10) / 10,
    carbs: Math.round(baseNutrition.carb * factor * 10) / 10,
    fat: Math.round(baseNutrition.fat * factor * 10) / 10
  };
}

// Função para gerar lista de compras
function generateShoppingList(meals: any[]): any[] {
  const categories: { [key: string]: any[] } = {
    proteins: [],
    carbs: [],
    vegetables: [],
    fruits: [],
    dairy: [],
    fats: [],
    others: []
  };

  const foodCounts: { [key: string]: { total: number; unit: string } } = {};
  
  // Contar alimentos
  meals.forEach(meal => {
    if (meal.foods) {
      meal.foods.forEach((food: any) => {
        const key = food.food_name;
        if (!foodCounts[key]) {
          foodCounts[key] = { total: 0, unit: food.unit };
        }
        foodCounts[key].total += food.quantity || 0;
      });
    }
  });

  // Categorizar e calcular quantidades semanais
  Object.entries(foodCounts).forEach(([foodName, data], index) => {
    let category = 'others';
    
    if (['frango', 'salmão', 'ovo', 'carne', 'tofu', 'lentilha', 'feijão', 'atum'].some(p => 
        foodName.toLowerCase().includes(p))) {
      category = 'proteins';
    } else if (['arroz', 'batata', 'aveia', 'pão', 'quinoa', 'tapioca'].some(c => 
        foodName.toLowerCase().includes(c))) {
      category = 'carbs';
    } else if (['brócolis', 'salada', 'cenoura', 'tomate', 'espinafre', 'couve'].some(v => 
        foodName.toLowerCase().includes(v))) {
      category = 'vegetables';
    } else if (['banana', 'maçã', 'manga', 'morango', 'abacaxi'].some(f => 
        foodName.toLowerCase().includes(f))) {
      category = 'fruits';
    } else if (['iogurte', 'leite', 'queijo', 'ricota'].some(d => 
        foodName.toLowerCase().includes(d))) {
      category = 'dairy';
    } else if (['abacate', 'castanha', 'amêndoa', 'azeite', 'óleo'].some(fat => 
        foodName.toLowerCase().includes(fat))) {
      category = 'fats';
    }

    // Calcular quantidade semanal (7 dias + 20% margem)
    const weeklyTotal = Math.ceil(data.total * 8.4);
    let formattedQuantity = `${weeklyTotal}${data.unit}`;
    
    // Ajustar formato para unidades práticas
    if (data.unit === 'g' && weeklyTotal >= 1000) {
      formattedQuantity = `${(weeklyTotal / 1000).toFixed(1)}kg`;
    } else if (data.unit === 'ml' && weeklyTotal >= 1000) {
      formattedQuantity = `${(weeklyTotal / 1000).toFixed(1)}L`;
    }

    categories[category].push({
      category,
      item_name: foodName,
      quantity: formattedQuantity,
      notes: 'Quantidade para uma semana',
      order_index: index,
      weekly_quantity: formattedQuantity
    });
  });

  return Object.values(categories).flat();
}

// Função para gerar recomendações
function generateRecommendations(dietParams: DietRequest): string[] {
  const recommendations = [
    'Beba pelo menos 35ml de água por kg de peso corporal diariamente',
    'Mantenha horários regulares para as refeições (±30 minutos)',
    'Mastigue cada porção pelo menos 20-30 vezes para melhor digestão'
  ];

  // Recomendações por objetivo
  switch (dietParams.goal) {
    case 'muscle_gain':
      recommendations.push('Consuma proteína dentro de 2 horas após o treino de força');
      recommendations.push('Durma pelo menos 7-9 horas para otimizar a síntese proteica');
      recommendations.push('Distribua a proteína igualmente ao longo do dia');
      break;
    case 'fat_loss':
      recommendations.push('Priorize proteínas em todas as refeições para maior saciedade');
      recommendations.push('Inclua fibras em cada refeição para controle glicêmico');
      recommendations.push('Evite líquidos calóricos (refrigerantes, sucos industrializados)');
      break;
    case 'performance':
      recommendations.push('Hidrate-se adequadamente antes, durante e após exercícios');
      recommendations.push('Consuma carboidratos 1-3 horas antes de treinos intensos');
      recommendations.push('Inclua antioxidantes naturais para recuperação');
      break;
  }

  // Recomendações por estilo alimentar
  if (dietParams.dietary_style.includes('vegan')) {
    recommendations.push('Combine leguminosas + cereais para proteína completa');
    recommendations.push('Monitore vitamina B12, ferro e zinco com exames regulares');
  }

  if (dietParams.dietary_style.includes('vegetarian')) {
    recommendations.push('Varie as fontes de proteína: ovos, laticínios, leguminosas');
  }

  // Recomendações por restrições
  if (dietParams.restrictions.includes('Lactose')) {
    recommendations.push('Experimente produtos fermentados que podem ser melhor tolerados');
  }

  if (dietParams.restrictions.includes('Glúten')) {
    recommendations.push('Leia rótulos cuidadosamente - glúten pode estar oculto');
  }

  return recommendations;
}

// Função principal da API
export async function POST(request: NextRequest) {
  try {
    console.log('=== INICIANDO GERAÇÃO DE DIETA COM IA ===');
    
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body: DietRequest = await request.json();
    console.log('Dados recebidos:', JSON.stringify(body, null, 2));

    // Validar dados obrigatórios
    if (!body.student_id || !body.age || !body.weight || !body.goal || !body.activity_level || !body.budget_profile) {
      return NextResponse.json({ 
        error: 'Dados obrigatórios não fornecidos' 
      }, { status: 400 });
    }

    const height = body.physical_assessment?.height || body.height || 170;

    // Calcular calorias e macros
    const bmr = calculateBMR(body.weight, height, body.age, body.gender);
    const targetCalories = calculateTDEE(bmr, body.activity_level, body.goal);
    const macros = calculateMacros(targetCalories, body.goal, body.weight);

    console.log('Cálculos nutricionais:', { bmr, targetCalories, macros });

    // Gerar prompt para IA
    const aiPrompt = generateAIPrompt(body, targetCalories, macros);
    console.log('Prompt gerado para IA');

    // Gerar dieta com Gemini
    const aiResponse = await generateDietWithGemini(aiPrompt);
    console.log('Resposta da IA recebida:', aiResponse);

    // Processar e calcular dados nutricionais
    const processedMeals = aiResponse.meals.map((meal: any) => {
      const mealCalories = targetCalories / body.meals_per_day;
      const mealProtein = macros.protein / body.meals_per_day;
      const mealCarbs = macros.carbs / body.meals_per_day;
      const mealFat = macros.fat / body.meals_per_day;

      const processedFoods = meal.foods.map((food: any) => {
        const nutrition = calculateNutritionData(food.food_name, food.quantity, food.unit);
        return {
          ...food,
          ...nutrition
        };
      });

      return {
        ...meal,
        calories: Math.round(mealCalories),
        protein: Math.round(mealProtein * 10) / 10,
        carbs: Math.round(mealCarbs * 10) / 10,
        fat: Math.round(mealFat * 10) / 10,
        foods: processedFoods
      };
    });

    // Gerar lista de compras
    const shoppingList = generateShoppingList(processedMeals);

    // Gerar recomendações
    const recommendations = generateRecommendations(body);

    // Gerar nome e descrição
    const goalLabels = {
      muscle_gain: 'Hipertrofia Muscular',
      fat_loss: 'Emagrecimento Inteligente',
      reeducation: 'Reeducação Alimentar',
      performance: 'Performance Esportiva',
      maintenance: 'Manutenção Saudável'
    };

    const styleLabel = body.dietary_style.length > 0 ? 
      ` ${body.dietary_style.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' + ')}` : '';

    const dietName = `Plano ${goalLabels[body.goal as keyof typeof goalLabels] || 'Personalizado'}${styleLabel}`;
    
    let dietDescription = `Plano nutricional com IA para ${goalLabels[body.goal as keyof typeof goalLabels]?.toLowerCase() || 'objetivos personalizados'}. `;
    dietDescription += `${Math.round(targetCalories)} kcal/dia • ${Math.round(macros.protein)}g proteína • ${Math.round(macros.carbs)}g carboidratos • ${Math.round(macros.fat)}g gorduras. `;
    
    if (body.physical_assessment) {
      dietDescription += `Baseado em avaliação física (${body.physical_assessment.fat_percentage?.toFixed(1)}% BF). `;
    }
    
    dietDescription += 'Gerado por inteligência artificial considerando suas preferências específicas.';

    const response = {
      name: dietName,
      description: dietDescription,
      target_calories: Math.round(targetCalories),
      target_protein: Math.round(macros.protein * 10) / 10,
      target_carbs: Math.round(macros.carbs * 10) / 10,
      target_fat: Math.round(macros.fat * 10) / 10,
      meals: processedMeals,
      shopping_list: shoppingList,
      recommendations,
      // Campos adicionais necessários para o salvamento
      student_id: body.student_id,
      age: body.age,
      weight: body.weight,
      height: body.height,
      gender: body.gender,
      activity_level: body.activity_level,
      goal: body.goal,
      goal_description: body.goal_description || '',
      budget_profile: body.budget_profile,
      meals_per_day: body.meals_per_day,
      dietary_style: body.dietary_style || [],
      food_preferences: body.food_preferences || [],
      restrictions: body.restrictions || [],
      custom_restrictions: body.custom_restrictions || '',
      used_physical_assessment: body.physical_assessment ? true : false,
      physical_assessment_id: body.physical_assessment?.id || null,
      // Dados gerados para salvar
      generatedMeals: processedMeals,
      generatedShoppingList: shoppingList,
      generatedRecommendations: recommendations
    };

    console.log('=== DIETA GERADA COM SUCESSO ===');
    console.log('Nome da dieta:', dietName);
    console.log('Campos obrigatórios:', {
      name: dietName,
      student_id: body.student_id,
      target_calories: Math.round(targetCalories)
    });
    return NextResponse.json(response);

  } catch (error: any) {
    console.error('=== ERRO AO GERAR DIETA ===', error);
    return NextResponse.json(
      { 
        error: 'Erro ao gerar dieta personalizada', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}