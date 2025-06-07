// app/api/ai/protocol-recommendation/route.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface StudentProfile {
  age: number;
  gender: 'male' | 'female';
  experience_level?: string;
  goals?: string[];
  medical_conditions?: string;
  previous_assessments?: number;
  last_protocol_used?: string;
}

const AVAILABLE_PROTOCOLS = {
  "Jackson & Pollock (3 dobras)": {
    age_range: [18, 61],
    accuracy: "±3.5%",
    complexity: "medium",
    time_required: "15-20 min",
    best_for: ["adultos", "população geral", "acompanhamento longitudinal"],
    measurements: ["triceps", "suprailiac", "coxa/peitoral"]
  },
  "Jackson & Pollock (7 dobras)": {
    age_range: [18, 61],
    accuracy: "±2.8%",
    complexity: "high",
    time_required: "25-30 min",
    best_for: ["atletas", "avaliações precisas", "pesquisa"],
    measurements: ["triceps", "subescapular", "peitoral", "axilar_media", "suprailiac", "abdominal", "coxa"]
  },
  "Durnin & Womersley": {
    age_range: [16, 68],
    accuracy: "±3.8%",
    complexity: "medium",
    time_required: "15-20 min",
    best_for: ["ampla faixa etária", "população europeia", "estudos populacionais"],
    measurements: ["triceps", "biceps", "subescapular", "suprailiac"]
  },
  "Guedes (1994)": {
    age_range: [18, 30],
    accuracy: "±3.2%",
    complexity: "low",
    time_required: "10-15 min",
    best_for: ["jovens brasileiros", "universitários", "população local"],
    measurements: ["triceps", "suprailiac", "abdominal"]
  },
  "ACSM": {
    age_range: [18, 65],
    accuracy: "±3.5%",
    complexity: "medium",
    time_required: "15-20 min",
    best_for: ["padrão internacional", "certificações", "guidelines clínicas"],
    measurements: ["baseado em Jackson & Pollock"]
  },
  "PROESP-BR": {
    age_range: [7, 17],
    accuracy: "±4.0%",
    complexity: "low",
    time_required: "10-15 min",
    best_for: ["crianças", "adolescentes", "escolas", "projetos esportivos"],
    measurements: ["triceps", "subescapular"]
  }
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

    const requestData: StudentProfile = await request.json();

    // Gerar recomendação com IA Gemini
    const recommendation = await generateProtocolRecommendation(requestData);

    return NextResponse.json(recommendation);

  } catch (error: any) {
    console.error('Error generating protocol recommendation:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendation' },
      { status: 500 }
    );
  }
}

async function generateProtocolRecommendation(profile: StudentProfile) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const protocolsInfo = JSON.stringify(AVAILABLE_PROTOCOLS, null, 2);
  
  const prompt = `
Como especialista em avaliação física e antropometria, analise o perfil do aluno e recomende os melhores protocolos de avaliação de composição corporal.

PERFIL DO ALUNO:
- Idade: ${profile.age} anos
- Gênero: ${profile.gender === 'male' ? 'Masculino' : 'Feminino'}
- Nível de experiência: ${profile.experience_level || 'Não informado'}
- Objetivos: ${profile.goals?.join(', ') || 'Não informado'}
- Condições médicas: ${profile.medical_conditions || 'Nenhuma'}
- Avaliações anteriores: ${profile.previous_assessments || 0}
- Último protocolo usado: ${profile.last_protocol_used || 'Nenhum'}

PROTOCOLOS DISPONÍVEIS:
${protocolsInfo}

Forneça uma análise em JSON com:

1. PROTOCOLO PRIMÁRIO (primary_recommendation)
   - protocol: nome do protocolo mais recomendado
   - confidence_score: pontuação de confiança (0-100)
   - reasoning: justificativa detalhada da escolha

2. ALTERNATIVAS (alternatives)
   - Array com 2-3 protocolos alternativos, cada um com:
     - protocol: nome
     - confidence_score: pontuação
     - reasoning: por que seria adequado
     - when_to_use: quando seria melhor que o primário

3. CONSIDERAÇÕES ESPECIAIS (special_considerations)
   - age_factors: considerações relacionadas à idade
   - gender_factors: considerações de gênero
   - experience_factors: fatores de experiência
   - goal_alignment: alinhamento com objetivos

4. RECOMENDAÇÕES PRÁTICAS (practical_recommendations)
   - preparation_tips: dicas de preparação
   - measurement_sequence: sequência recomendada
   - frequency: frequência de reavaliação sugerida
   - equipment_needed: equipamentos necessários

5. SCORE DETALHADO (detailed_scoring)
   - Para cada protocolo disponível, forneça score de 0-100 baseado em:
     - age_compatibility: compatibilidade com idade
     - goal_alignment: alinhamento com objetivos
     - accuracy_for_profile: precisão para este perfil
     - ease_of_use: facilidade de uso
     - time_efficiency: eficiência de tempo

Responda APENAS com JSON válido, sem texto adicional.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
    const recommendation = JSON.parse(cleanedText);
    
    return {
      ...recommendation,
      metadata: {
        generated_at: new Date().toISOString(),
        model_used: "gemini-1.5-flash",
        profile_analyzed: {
          age: profile.age,
          gender: profile.gender,
          has_goals: !!(profile.goals && profile.goals.length > 0),
          has_medical_conditions: !!profile.medical_conditions,
          is_experienced: !!(profile.previous_assessments && profile.previous_assessments > 0)
        }
      }
    };
    
  } catch (error) {
    console.error('Error parsing AI response:', error);
    
    // Fallback para recomendação básica
    return generateFallbackRecommendation(profile);
  }
}

function generateFallbackRecommendation(profile: StudentProfile) {
  let primaryProtocol = "Jackson & Pollock (3 dobras)";
  let reasoning = "Protocolo padrão amplamente validado";
  
  // Lógica básica de seleção
  if (profile.age < 18) {
    primaryProtocol = "PROESP-BR";
    reasoning = "Protocolo específico para jovens brasileiros";
  } else if (profile.age <= 30 && profile.goals?.includes("Ganho de massa muscular")) {
    primaryProtocol = "Guedes (1994)";
    reasoning = "Protocolo validado para jovens brasileiros com foco em hipertrofia";
  } else if (profile.goals?.includes("Performance esportiva")) {
    primaryProtocol = "Jackson & Pollock (7 dobras)";
    reasoning = "Maior precisão para atletas e esportistas";
  }

  return {
    primary_recommendation: {
      protocol: primaryProtocol,
      confidence_score: 75,
      reasoning: reasoning
    },
    alternatives: [
      {
        protocol: "ACSM",
        confidence_score: 60,
        reasoning: "Padrão internacional amplamente aceito",
        when_to_use: "Para certificações e padronização internacional"
      }
    ],
    special_considerations: {
      age_factors: profile.age < 18 ? "Protocolo específico para jovens" : "Idade adequada para protocolos adultos",
      gender_factors: "Considerações de gênero aplicadas nas fórmulas",
      experience_factors: "Protocolo adequado ao nível de experiência",
      goal_alignment: "Protocolo alinhado com objetivos gerais"
    },
    practical_recommendations: {
      preparation_tips: ["Hidratação adequada", "Evitar exercícios intensos 24h antes"],
      measurement_sequence: "Seguir protocolo padrão de medições",
      frequency: "Reavaliação a cada 3 meses",
      equipment_needed: ["Adipômetro", "Balança", "Estadiômetro"]
    },
    detailed_scoring: {
      [primaryProtocol]: 75
    },
    metadata: {
      generated_at: new Date().toISOString(),
      model_used: "fallback-logic",
      profile_analyzed: {
        age: profile.age,
        gender: profile.gender,
        has_goals: !!(profile.goals && profile.goals.length > 0),
        has_medical_conditions: !!profile.medical_conditions,
        is_experienced: !!(profile.previous_assessments && profile.previous_assessments > 0)
      }
    }
  };
}