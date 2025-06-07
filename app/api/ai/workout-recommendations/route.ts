// app/api/ai/workout-recommendations/route.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface WorkoutRecommendationRequest {
  assessment_data: {
    weight: number;
    height: number;
    fat_percentage: number;
    lean_mass: number;
    bmi: number;
    age: number;
    gender: string;
  };
  student_profile: {
    experience_level?: string;
    goals?: string[];
    medical_conditions?: string;
    available_days?: number;
    preferred_training_time?: string;
    equipment_access?: string[];
  };
  previous_assessments?: {
    fat_percentage: number;
    lean_mass: number;
    date: string;
  }[];
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

    const requestData: WorkoutRecommendationRequest = await request.json();

    // Gerar recomendações de treino com IA
    const recommendations = await generateWorkoutRecommendations(requestData);

    return NextResponse.json(recommendations);

  } catch (error: any) {
    console.error('Error generating workout recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to generate workout recommendations' },
      { status: 500 }
    );
  }
}

async function generateWorkoutRecommendations(data: WorkoutRecommendationRequest) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const evolutionContext = data.previous_assessments && data.previous_assessments.length > 0 
    ? `
EVOLUÇÃO:
${data.previous_assessments.map(prev => `
- Data: ${prev.date}
- % Gordura: ${prev.fat_percentage}%
- Massa Magra: ${prev.lean_mass}kg
`).join('')}

Mudança na gordura: ${(data.assessment_data.fat_percentage - data.previous_assessments[0].fat_percentage).toFixed(1)}%
Mudança na massa magra: ${(data.assessment_data.lean_mass - data.previous_assessments[0].lean_mass).toFixed(1)}kg
    `
    : 'Primeira avaliação - sem dados de evolução';

  const prompt = `
Como especialista em treinamento físico e fisiologia do exercício, crie um programa de treino personalizado baseado na avaliação física.

DADOS DA AVALIAÇÃO:
- Idade: ${data.assessment_data.age} anos
- Gênero: ${data.assessment_data.gender === 'male' ? 'Masculino' : 'Feminino'}
- Peso: ${data.assessment_data.weight} kg
- Altura: ${data.assessment_data.height} cm
- IMC: ${data.assessment_data.bmi}
- % Gordura: ${data.assessment_data.fat_percentage}%
- Massa Magra: ${data.assessment_data.lean_mass} kg

PERFIL DO ALUNO:
- Experiência: ${data.student_profile.experience_level || 'Não informado'}
- Objetivos: ${data.student_profile.goals?.join(', ') || 'Não informado'}
- Condições médicas: ${data.student_profile.medical_conditions || 'Nenhuma'}
- Dias disponíveis: ${data.student_profile.available_days || 'Não informado'}
- Horário preferido: ${data.student_profile.preferred_training_time || 'Não informado'}
- Equipamentos: ${data.student_profile.equipment_access?.join(', ') || 'Academia completa'}

${evolutionContext}

Crie um programa estruturado em JSON com:

1. ANÁLISE (analysis)
   - current_fitness_level: nível atual (beginner/intermediate/advanced)
   - priority_areas: áreas prioritárias para trabalhar
   - body_composition_insights: insights sobre composição corporal
   - evolution_assessment: avaliação da evolução (se houver dados)

2. PROGRAMA PRINCIPAL (main_program)
   - program_type: tipo do programa (strength/cardio/mixed/functional)
   - duration_weeks: duração em semanas
   - frequency_per_week: frequência semanal
   - session_duration: duração das sessões
   - training_split: divisão do treino

3. PERIODIZAÇÃO (periodization)
   - phase_1: primeira fase (4-6 semanas)
     - focus: foco principal
     - intensity: intensidade (low/moderate/high)
     - volume: volume (low/moderate/high)
     - key_exercises: exercícios principais
   - phase_2: segunda fase
   - phase_3: terceira fase (se aplicável)

4. TREINOS DETALHADOS (detailed_workouts)
   - Para cada dia da semana:
     - day: dia da semana
     - focus: foco do treino
     - exercises: array de exercícios com:
       - name: nome do exercício
       - sets: séries
       - reps: repetições ou tempo
       - rest: descanso
       - notes: observações

5. DIRETRIZES CARDIO (cardio_guidelines)
   - type: tipo de cardio recomendado
   - frequency: frequência semanal
   - duration: duração
   - intensity: intensidade
   - timing: quando fazer (pré/pós treino)

6. PROGRESSÃO (progression_plan)
   - week_1_2: primeiras semanas
   - week_3_4: semanas intermediárias
   - week_5_plus: semanas avançadas
   - adjustment_indicators: quando ajustar

7. MONITORAMENTO (monitoring)
   - key_metrics: métricas principais para acompanhar
   - assessment_frequency: frequência de reavaliação
   - warning_signs: sinais de alerta
   - adjustment_triggers: quando modificar o programa

8. RECOMENDAÇÕES ESPECIAIS (special_recommendations)
   - warm_up: aquecimento recomendado
   - cool_down: volta à calma
   - recovery: estratégias de recuperação
   - nutrition_tips: dicas nutricionais básicas

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
        has_evolution_data: !!(data.previous_assessments && data.previous_assessments.length > 0),
        student_profile: {
          experience_level: data.student_profile.experience_level,
          goals_count: data.student_profile.goals?.length || 0,
          has_medical_conditions: !!data.student_profile.medical_conditions
        }
      }
    };
    
  } catch (error) {
    console.error('Error parsing AI response:', error);
    
    // Fallback para recomendação básica
    return generateFallbackWorkoutPlan(data);
  }
}

function generateFallbackWorkoutPlan(data: WorkoutRecommendationRequest) {
  const { assessment_data, student_profile } = data;
  
  // Determinar foco principal baseado na composição corporal
  let primaryFocus = 'mixed';
  let intensity = 'moderate';
  
  if (assessment_data.fat_percentage > (assessment_data.gender === 'male' ? 20 : 28)) {
    primaryFocus = 'fat_loss';
    intensity = 'moderate';
  } else if (assessment_data.lean_mass < (assessment_data.gender === 'male' ? 60 : 40)) {
    primaryFocus = 'muscle_building';
    intensity = 'high';
  }

  const experience = student_profile.experience_level || 'beginner';
  const hasGoals = student_profile.goals && student_profile.goals.length > 0;
  
  return {
    analysis: {
      current_fitness_level: experience,
      priority_areas: primaryFocus === 'fat_loss' ? ['Redução de gordura', 'Condicionamento cardiovascular'] : ['Ganho de massa magra', 'Força'],
      body_composition_insights: `IMC: ${assessment_data.bmi.toFixed(1)} - ${getBMICategory(assessment_data.bmi)}`,
      evolution_assessment: data.previous_assessments ? 'Dados de evolução disponíveis' : 'Primeira avaliação'
    },
    main_program: {
      program_type: primaryFocus,
      duration_weeks: 12,
      frequency_per_week: experience === 'beginner' ? 3 : 4,
      session_duration: '45-60 minutos',
      training_split: experience === 'beginner' ? 'Full Body' : 'Upper/Lower'
    },
    periodization: {
      phase_1: {
        focus: 'Adaptação e técnica',
        intensity: 'low',
        volume: 'moderate',
        key_exercises: ['Agachamento', 'Flexão', 'Prancha', 'Caminhada']
      },
      phase_2: {
        focus: 'Desenvolvimento',
        intensity: 'moderate',
        volume: 'moderate',
        key_exercises: ['Agachamento com peso', 'Supino', 'Remada', 'Cardio intervalado']
      },
      phase_3: {
        focus: 'Intensificação',
        intensity: 'high',
        volume: 'high',
        key_exercises: ['Exercícios compostos', 'Cardio HIIT', 'Exercícios funcionais']
      }
    },
    detailed_workouts: generateBasicWorkouts(experience, primaryFocus),
    cardio_guidelines: {
      type: primaryFocus === 'fat_loss' ? 'HIIT + Steady State' : 'Steady State',
      frequency: '3-4x por semana',
      duration: '20-30 minutos',
      intensity: primaryFocus === 'fat_loss' ? 'moderate-high' : 'moderate',
      timing: 'Pós-treino ou dias separados'
    },
    progression_plan: {
      week_1_2: 'Foco na técnica e adaptação',
      week_3_4: 'Aumento gradual da intensidade',
      week_5_plus: 'Progressão baseada em performance',
      adjustment_indicators: ['Melhora da técnica', 'Aumento da resistência', 'Feedback do aluno']
    },
    monitoring: {
      key_metrics: ['Peso corporal', 'Circunferências', 'Performance nos exercícios'],
      assessment_frequency: 'A cada 4 semanas',
      warning_signs: ['Fadiga excessiva', 'Dores articulares', 'Falta de progresso'],
      adjustment_triggers: ['Estagnação por 2 semanas', 'Mudança nos objetivos']
    },
    special_recommendations: {
      warm_up: '5-10 minutos de aquecimento dinâmico',
      cool_down: '5-10 minutos de alongamento estático',
      recovery: 'Sono adequado (7-9h) e hidratação',
      nutrition_tips: hasGoals ? 'Alinhamento nutricional com objetivos específicos' : 'Dieta balanceada e hidratação adequada'
    },
    metadata: {
      generated_at: new Date().toISOString(),
      model_used: "fallback-logic",
      based_on_assessment: true,
      has_evolution_data: !!(data.previous_assessments && data.previous_assessments.length > 0),
      student_profile: {
        experience_level: experience,
        goals_count: student_profile.goals?.length || 0,
        has_medical_conditions: !!student_profile.medical_conditions
      }
    }
  };
}

function generateBasicWorkouts(experience: string, focus: string) {
  if (experience === 'beginner') {
    return [
      {
        day: 'Segunda-feira',
        focus: 'Corpo inteiro - Iniciante',
        exercises: [
          { name: 'Agachamento livre', sets: '3', reps: '10-12', rest: '60s', notes: 'Foque na técnica' },
          { name: 'Flexão de braço', sets: '3', reps: '8-10', rest: '60s', notes: 'Joelhos no chão se necessário' },
          { name: 'Prancha', sets: '3', reps: '30s', rest: '45s', notes: 'Mantenha o core contraído' },
          { name: 'Caminhada', sets: '1', reps: '20 min', rest: '-', notes: 'Ritmo moderado' }
        ]
      },
      {
        day: 'Quarta-feira',
        focus: 'Corpo inteiro - Iniciante',
        exercises: [
          { name: 'Leg press', sets: '3', reps: '12-15', rest: '60s', notes: 'Amplitude completa' },
          { name: 'Remada sentada', sets: '3', reps: '10-12', rest: '60s', notes: 'Puxe com as costas' },
          { name: 'Desenvolvimento ombros', sets: '3', reps: '8-10', rest: '60s', notes: 'Peso leve' },
          { name: 'Bicicleta', sets: '1', reps: '15 min', rest: '-', notes: 'Resistência leve' }
        ]
      },
      {
        day: 'Sexta-feira',
        focus: 'Corpo inteiro - Iniciante',
        exercises: [
          { name: 'Stiff', sets: '3', reps: '10-12', rest: '60s', notes: 'Movimento controlado' },
          { name: 'Supino inclinado', sets: '3', reps: '8-10', rest: '60s', notes: 'Descida lenta' },
          { name: 'Abdominais', sets: '3', reps: '15', rest: '45s', notes: 'Contraiam o core' },
          { name: 'Esteira', sets: '1', reps: '20 min', rest: '-', notes: 'Inclinação moderada' }
        ]
      }
    ];
  }
  
  return [
    {
      day: 'Segunda-feira',
      focus: 'Membros superiores',
      exercises: [
        { name: 'Supino reto', sets: '4', reps: '8-10', rest: '90s', notes: 'Progressão de carga' },
        { name: 'Remada curvada', sets: '4', reps: '8-10', rest: '90s', notes: 'Técnica rigorosa' },
        { name: 'Desenvolvimento militar', sets: '3', reps: '10-12', rest: '75s', notes: 'Core estabilizado' },
        { name: 'Rosca direta', sets: '3', reps: '12-15', rest: '60s', notes: 'Movimento isolado' }
      ]
    },
    {
      day: 'Terça-feira',
      focus: 'Membros inferiores',
      exercises: [
        { name: 'Agachamento', sets: '4', reps: '8-10', rest: '2 min', notes: 'Profundidade completa' },
        { name: 'Stiff', sets: '4', reps: '10-12', rest: '90s', notes: 'Ativação posterior' },
        { name: 'Leg press', sets: '3', reps: '12-15', rest: '90s', notes: 'Amplitude máxima' },
        { name: 'Panturrilha', sets: '4', reps: '15-20', rest: '60s', notes: 'Pausa no topo' }
      ]
    },
    {
      day: 'Quinta-feira',
      focus: 'Membros superiores',
      exercises: [
        { name: 'Supino inclinado', sets: '4', reps: '8-10', rest: '90s', notes: 'Foco no peitoral superior' },
        { name: 'Puxada frontal', sets: '4', reps: '10-12', rest: '90s', notes: 'Amplitude completa' },
        { name: 'Elevação lateral', sets: '3', reps: '12-15', rest: '60s', notes: 'Movimento controlado' },
        { name: 'Tríceps pulley', sets: '3', reps: '12-15', rest: '60s', notes: 'Extensão completa' }
      ]
    },
    {
      day: 'Sexta-feira',
      focus: 'Membros inferiores + Core',
      exercises: [
        { name: 'Agachamento búlgaro', sets: '3', reps: '10 cada', rest: '90s', notes: 'Unilateral' },
        { name: 'Hip thrust', sets: '4', reps: '12-15', rest: '75s', notes: 'Ativação glúteo' },
        { name: 'Afundo', sets: '3', reps: '12 cada', rest: '90s', notes: 'Estabilização' },
        { name: 'Prancha lateral', sets: '3', reps: '30s cada', rest: '60s', notes: 'Core lateral' }
      ]
    }
  ];
}

function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Abaixo do peso';
  if (bmi < 25) return 'Peso normal';
  if (bmi < 30) return 'Sobrepeso';
  return 'Obesidade';
}