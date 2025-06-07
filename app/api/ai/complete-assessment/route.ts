// app/api/ai/complete-assessment/route.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface CompleteAssessmentRequest {
  student_id: string;
  assessment_data: {
    protocol: string;
    weight: number;
    height: number;
    age: number;
    gender: string;
    measurements: Record<string, number>;
    goals: string[];
    notes?: string;
  };
  generate_workout_plan?: boolean;
  generate_nutrition_plan?: boolean;
  activity_preferences?: {
    training_frequency: number;
    training_intensity: 'low' | 'moderate' | 'high';
    available_days: number[];
    equipment_access: string[];
  };
  nutrition_preferences?: {
    dietary_restrictions?: string[];
    food_allergies?: string[];
    budget_level?: 'low' | 'medium' | 'high';
    cooking_skill?: 'beginner' | 'intermediate' | 'advanced';
  };
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

    const requestData: CompleteAssessmentRequest = await request.json();

    // 1. Validar e calcular composição corporal
    const calculationResult = await calculateBodyComposition(requestData.assessment_data);
    
    if (!calculationResult.success) {
      return NextResponse.json(
        { error: calculationResult.error },
        { status: 400 }
      );
    }

    // 2. Buscar dados do estudante e histórico
    const { data: studentData, error: studentError } = await supabase
      .from('profiles')
      .select('full_name, birth_date, gender, goals, experience_level, medical_conditions')
      .eq('id', requestData.student_id)
      .single();

    if (studentError) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // 3. Buscar avaliações anteriores
    const { data: previousAssessments } = await supabase
      .from('physical_assessments')
      .select('fat_percentage, lean_mass, fat_mass, bmi, weight, created_at')
      .eq('student_id', requestData.student_id)
      .eq('tenant_id', profile.tenant_id)
      .order('created_at', { ascending: false })
      .limit(5);

    // 4. Gerar análise completa com IA
    const aiAnalysis = await generateCompleteAnalysis({
      current_assessment: {
        ...requestData.assessment_data,
        ...calculationResult.results
      },
      student_profile: studentData,
      previous_assessments: previousAssessments || [],
      generate_workout: requestData.generate_workout_plan,
      generate_nutrition: requestData.generate_nutrition_plan,
      preferences: {
        activity: requestData.activity_preferences,
        nutrition: requestData.nutrition_preferences
      }
    });

    // 5. Salvar avaliação no banco
    const assessmentToSave = {
      student_id: requestData.student_id,
      protocol: requestData.assessment_data.protocol,
      date: new Date().toISOString().split('T')[0],
      weight: requestData.assessment_data.weight,
      height: requestData.assessment_data.height,
      age: requestData.assessment_data.age,
      gender: requestData.assessment_data.gender,
      notes: requestData.assessment_data.notes || '',
      goals: requestData.assessment_data.goals,
      tenant_id: profile.tenant_id,
      
      // Medições
      ...requestData.assessment_data.measurements,
      
      // Resultados calculados
      ...calculationResult.results,
      
      // Análise da IA
      ai_analysis: aiAnalysis.analysis,
      ai_recommendations: aiAnalysis.recommendations,
      workout_plan: aiAnalysis.workout_plan,
      nutrition_plan: aiAnalysis.nutrition_plan
    };

    const { data: savedAssessment, error: saveError } = await supabase
      .from('physical_assessments')
      .insert(assessmentToSave)
      .select()
      .single();

    if (saveError) {
      return NextResponse.json(
        { error: saveError.message },
        { status: 500 }
      );
    }

    // 6. Atualizar perfil do estudante
    await supabase
      .from('profiles')
      .update({ 
        last_assessment_date: new Date().toISOString(),
        weight: requestData.assessment_data.weight,
        height: requestData.assessment_data.height
      })
      .eq('id', requestData.student_id);

    // 7. Retornar resposta completa
    return NextResponse.json({
      assessment: savedAssessment,
      ai_analysis: aiAnalysis,
      calculation_metadata: calculationResult.metadata,
      recommendations: {
        immediate_actions: aiAnalysis.immediate_actions,
        follow_up_schedule: aiAnalysis.follow_up_schedule,
        risk_alerts: aiAnalysis.risk_alerts
      }
    });

  } catch (error: any) {
    console.error('Error in complete assessment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function calculateBodyComposition(assessmentData: any) {
  try {
    // Implementar cálculos baseados no protocolo
    const { protocol, measurements, weight, height, age, gender } = assessmentData;
    
    let bodyDensity: number;
    
    switch (protocol) {
      case "Jackson & Pollock (3 dobras)":
        bodyDensity = calculateJacksonPollock3(measurements, gender, age);
        break;
      case "Jackson & Pollock (7 dobras)":
        bodyDensity = calculateJacksonPollock7(measurements, gender, age);
        break;
      case "Guedes (1994)":
        bodyDensity = calculateGuedes(measurements, gender);
        break;
      default:
        throw new Error("Protocolo não implementado");
    }
    
    const fatPercentage = ((4.95 / bodyDensity) - 4.50) * 100;
    const fatMass = (fatPercentage / 100) * weight;
    const leanMass = weight - fatMass;
    const bmi = weight / Math.pow(height / 100, 2);
    
    return {
      success: true,
      results: {
        body_density: bodyDensity,
        fat_percentage: fatPercentage,
        fat_mass: fatMass,
        lean_mass: leanMass,
        bmi: bmi
      },
      metadata: {
        protocol_used: protocol,
        calculation_date: new Date().toISOString(),
        accuracy_estimate: getProtocolAccuracy(protocol)
      }
    };
    
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message
    };
  }
}

async function generateCompleteAnalysis(data: any) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const evolutionContext = data.previous_assessments.length > 0 
    ? `HISTÓRICO DE AVALIAÇÕES (${data.previous_assessments.length} anteriores):
${data.previous_assessments.map((prev: any, index: number) => `
${index + 1}. ${prev.created_at}: Peso ${prev.weight}kg, Gordura ${prev.fat_percentage}%, Massa Magra ${prev.lean_mass}kg
`).join('')}` 
    : 'PRIMEIRA AVALIAÇÃO - Sem histórico anterior';

  const prompt = `
Como especialista em avaliação física e prescrição de exercícios, gere uma análise COMPLETA e INTEGRADA.

DADOS ATUAIS:
- Protocolo: ${data.current_assessment.protocol}
- Peso: ${data.current_assessment.weight}kg
- Altura: ${data.current_assessment.height}cm
- Idade: ${data.current_assessment.age} anos
- Gênero: ${data.current_assessment.gender}
- IMC: ${data.current_assessment.bmi?.toFixed(1)}
- % Gordura: ${data.current_assessment.fat_percentage?.toFixed(1)}%
- Massa Magra: ${data.current_assessment.lean_mass?.toFixed(1)}kg
- Massa Gorda: ${data.current_assessment.fat_mass?.toFixed(1)}kg
- Objetivos: ${data.current_assessment.goals?.join(', ')}

PERFIL DO ALUNO:
- Nome: ${data.student_profile.full_name}
- Experiência: ${data.student_profile.experience_level || 'Não informado'}
- Condições médicas: ${data.student_profile.medical_conditions || 'Nenhuma'}

${evolutionContext}

SOLICITAÇÕES ESPECÍFICAS:
- Gerar plano de treino: ${data.generate_workout ? 'SIM' : 'NÃO'}
- Gerar plano nutricional: ${data.generate_nutrition ? 'SIM' : 'NÃO'}

Gere uma análise estruturada em JSON com:

1. ANÁLISE PRINCIPAL (analysis)
   - overall_assessment: avaliação geral (excellent/good/average/needs_improvement/concerning)
   - key_findings: principais achados (array de strings)
   - health_risk_level: nível de risco (low/medium/high)
   - evolution_summary: resumo da evolução (se houver dados)
   - classification_details: classificações detalhadas (IMC, gordura, etc.)

2. RECOMENDAÇÕES GERAIS (recommendations)
   - priority_areas: áreas prioritárias (array)
   - immediate_actions: ações imediatas (array)
   - long_term_goals: objetivos de longo prazo (array)
   - frequency_recommendations: frequência de atividades
   - lifestyle_modifications: modificações no estilo de vida

3. PLANO DE TREINO (workout_plan) - SE SOLICITADO
   - program_overview: visão geral do programa
   - weekly_structure: estrutura semanal
   - exercise_recommendations: recomendações de exercícios
   - progression_plan: plano de progressão
   - safety_considerations: considerações de segurança

4. PLANO NUTRICIONAL (nutrition_plan) - SE SOLICITADO
   - caloric_target: meta calórica
   - macronutrient_distribution: distribuição de macros
   - meal_recommendations: recomendações de refeições
   - supplementation: suplementação sugerida
   - hydration_guidelines: diretrizes de hidratação

5. ALERTAS E RISCOS (risk_alerts)
   - immediate_concerns: preocupações imediatas
   - monitoring_required: o que monitorar
   - medical_referral_needed: necessidade de encaminhamento médico
   - contraindications: contraindicações

6. CRONOGRAMA DE ACOMPANHAMENTO (follow_up_schedule)
   - next_assessment: próxima avaliação
   - interim_checkpoints: pontos de verificação intermediários
   - metric_tracking: métricas para acompanhar
   - adjustment_triggers: quando ajustar o plano

7. INSIGHTS PERSONALIZADOS (personalized_insights)
   - motivational_factors: fatores motivacionais
   - potential_challenges: desafios potenciais
   - success_predictors: preditores de sucesso
   - customization_notes: notas de personalização

Responda APENAS com JSON válido, sem texto adicional.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
    const analysis = JSON.parse(cleanedText);
    
    return {
      ...analysis,
      metadata: {
        generated_at: new Date().toISOString(),
        model_used: "gemini-1.5-flash",
        analysis_type: "complete_integrated",
        has_evolution_data: data.previous_assessments.length > 0,
        workout_plan_requested: data.generate_workout,
        nutrition_plan_requested: data.generate_nutrition
      }
    };
    
  } catch (error) {
    console.error('Error generating AI analysis:', error);
    
    // Fallback para análise básica
    return generateFallbackCompleteAnalysis(data);
  }
}

function generateFallbackCompleteAnalysis(data: any) {
  const assessment = data.current_assessment;
  const hasEvolution = data.previous_assessments.length > 0;
  
  return {
    analysis: {
      overall_assessment: 'average',
      key_findings: [
        `IMC: ${assessment.bmi?.toFixed(1)} - ${getBMICategory(assessment.bmi)}`,
        `Percentual de gordura: ${assessment.fat_percentage?.toFixed(1)}%`,
        `Massa magra: ${assessment.lean_mass?.toFixed(1)}kg`
      ],
      health_risk_level: assessment.bmi > 30 ? 'high' : assessment.bmi > 25 ? 'medium' : 'low',
      evolution_summary: hasEvolution ? 'Dados de evolução disponíveis para comparação' : 'Primeira avaliação estabelece baseline',
      classification_details: {
        bmi: getBMICategory(assessment.bmi),
        body_fat: getFatCategory(assessment.fat_percentage, assessment.gender)
      }
    },
    recommendations: {
      priority_areas: ['Composição corporal', 'Condicionamento físico'],
      immediate_actions: ['Iniciar programa de exercícios', 'Orientação nutricional'],
      long_term_goals: ['Otimizar composição corporal', 'Melhorar condicionamento'],
      frequency_recommendations: '3-4x por semana de atividade física',
      lifestyle_modifications: ['Melhorar qualidade do sono', 'Aumentar atividade diária']
    },
    workout_plan: data.generate_workout ? {
      program_overview: 'Programa personalizado baseado na avaliação',
      weekly_structure: '3-4 sessões semanais',
      exercise_recommendations: 'Exercícios compostos e funcionais',
      progression_plan: 'Progressão gradual de intensidade',
      safety_considerations: 'Aquecimento e volta à calma obrigatórios'
    } : null,
    nutrition_plan: data.generate_nutrition ? {
      caloric_target: 'Baseado no gasto energético total',
      macronutrient_distribution: 'Proteína 2g/kg, carboidratos e gorduras balanceados',
      meal_recommendations: '4-6 refeições distribuídas ao longo do dia',
      supplementation: 'Whey protein e multivitamínico básicos',
      hydration_guidelines: '35ml/kg de peso corporal'
    } : null,
    risk_alerts: {
      immediate_concerns: assessment.bmi > 30 ? ['IMC elevado'] : [],
      monitoring_required: ['Peso corporal', 'Circunferências'],
      medical_referral_needed: false,
      contraindications: 'Nenhuma identificada'
    },
    follow_up_schedule: {
      next_assessment: '3 meses',
      interim_checkpoints: 'Verificações quinzenais',
      metric_tracking: ['Peso', 'Medidas', 'Performance'],
      adjustment_triggers: 'Estagnação por 4 semanas'
    },
    personalized_insights: {
      motivational_factors: ['Objetivos claros definidos'],
      potential_challenges: ['Aderência ao programa'],
      success_predictors: ['Motivação inicial'],
      customization_notes: 'Programa adaptado ao perfil individual'
    },
    metadata: {
      generated_at: new Date().toISOString(),
      model_used: "fallback-analysis",
      analysis_type: "complete_integrated",
      has_evolution_data: hasEvolution,
      workout_plan_requested: data.generate_workout,
      nutrition_plan_requested: data.generate_nutrition
    }
  };
}

// Funções auxiliares para cálculos
function calculateJacksonPollock3(measurements: any, gender: string, age: number): number {
  if (gender === 'male') {
    const sum = measurements.chest + measurements.abdominal + measurements.thigh;
    return 1.10938 - (0.0008267 * sum) + (0.0000016 * Math.pow(sum, 2)) - (0.0002574 * age);
  } else {
    const sum = measurements.triceps + measurements.suprailiac + measurements.thigh;
    return 1.0994921 - (0.0009929 * sum) + (0.0000023 * Math.pow(sum, 2)) - (0.0001392 * age);
  }
}

function calculateJacksonPollock7(measurements: any, gender: string, age: number): number {
  if (gender === 'male') {
    const sum = measurements.triceps + measurements.subscapular + measurements.chest + 
                 measurements.midaxillary + measurements.suprailiac + measurements.abdominal + measurements.thigh;
    return 1.112 - (0.00043499 * sum) + (0.00000055 * Math.pow(sum, 2)) - (0.00028826 * age);
  } else {
    const sum = measurements.triceps + measurements.subscapular + measurements.chest + 
                 measurements.midaxillary + measurements.suprailiac + measurements.abdominal + measurements.thigh;
    return 1.097 - (0.00046971 * sum) + (0.00000056 * Math.pow(sum, 2)) - (0.00012828 * age);
  }
}

function calculateGuedes(measurements: any, gender: string): number {
  const sum = measurements.triceps + measurements.suprailiac + measurements.abdominal;
  const logSum = Math.log10(sum);
  
  if (gender === 'male') {
    return 1.17136 - 0.06706 * logSum;
  } else {
    return 1.16650 - 0.07063 * logSum;
  }
}

function getProtocolAccuracy(protocol: string): string {
  const accuracyMap: Record<string, string> = {
    "Jackson & Pollock (3 dobras)": "±3.5%",
    "Jackson & Pollock (7 dobras)": "±2.8%",
    "Guedes (1994)": "±3.2%"
  };
  return accuracyMap[protocol] || "±4.0%";
}

function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Abaixo do peso';
  if (bmi < 25) return 'Peso normal';
  if (bmi < 30) return 'Sobrepeso';
  return 'Obesidade';
}

function getFatCategory(fatPercentage: number, gender: string): string {
  if (gender === 'male') {
    if (fatPercentage < 6) return 'Essencial';
    if (fatPercentage < 14) return 'Atlético';
    if (fatPercentage < 18) return 'Fitness';
    if (fatPercentage < 25) return 'Aceitável';
    return 'Obesidade';
  } else {
    if (fatPercentage < 12) return 'Essencial';
    if (fatPercentage < 21) return 'Atlético';
    if (fatPercentage < 25) return 'Fitness';
    if (fatPercentage < 32) return 'Aceitável';
    return 'Obesidade';
  }
}