// app/api/ai/assessment-analysis/route.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface AssessmentData {
  current: {
    weight: number;
    height: number;
    fat_percentage: number;
    lean_mass: number;
    fat_mass: number;
    bmi: number;
    age: number;
    gender: string;
    protocol: string;
    goals?: string[];
  };
  previous?: {
    weight: number;
    fat_percentage: number;
    lean_mass: number;
    fat_mass: number;
    bmi: number;
    date: string;
  }[];
  student_profile?: {
    full_name: string;
    birth_date?: string;
    goals?: string[];
    medical_conditions?: string;
    experience_level?: string;
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

    const requestData: AssessmentData = await request.json();

    // Gerar análise com IA Gemini
    const analysis = await generateAssessmentAnalysis(requestData);

    return NextResponse.json(analysis);

  } catch (error: any) {
    console.error('Error generating AI analysis:', error);
    return NextResponse.json(
      { error: 'Failed to generate analysis' },
      { status: 500 }
    );
  }
}

async function generateAssessmentAnalysis(data: AssessmentData) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // Construir contexto para a IA
  const context = buildAnalysisContext(data);
  
  const prompt = `
Como especialista em avaliação física e composição corporal, analise os dados fornecidos e gere um relatório completo.

DADOS DA AVALIAÇÃO:
${context}

Por favor, forneça uma análise estruturada em JSON com as seguintes seções:

1. RESUMO EXECUTIVO (summary)
   - Classificação geral da composição corporal (excellent/good/average/needs_improvement/concerning)
   - Principais pontos de atenção
   - Status de saúde geral

2. ANÁLISE DETALHADA (detailed_analysis)
   - Análise do IMC e classificação
   - Análise do percentual de gordura corporal
   - Análise da massa magra
   - Comparação com padrões de referência para idade/gênero

3. EVOLUÇÃO (evolution) - apenas se houver dados anteriores
   - Tendências identificadas
   - Progressos positivos
   - Áreas que precisam de atenção
   - Taxa de evolução

4. RECOMENDAÇÕES (recommendations)
   - Treino (training): tipo, intensidade, frequência
   - Nutrição (nutrition): diretrizes gerais, calorias, macros
   - Lifestyle (lifestyle): sono, hidratação, estresse
   - Monitoramento (monitoring): frequência de reavaliações

5. ALERTAS (alerts)
   - Riscos identificados (se houver)
   - Necessidade de acompanhamento médico
   - Precauções especiais

6. METAS INTELIGENTES (smart_goals)
   - Objetivos de curto prazo (3 meses)
   - Objetivos de médio prazo (6 meses)
   - Métricas para acompanhamento

Responda APENAS com JSON válido, sem texto adicional.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Limpar e parsear a resposta
    const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
    const analysis = JSON.parse(cleanedText);
    
    return {
      ...analysis,
      metadata: {
        generated_at: new Date().toISOString(),
        model_used: "gemini-1.5-flash",
        protocol_used: data.current.protocol,
        has_comparison: !!data.previous && data.previous.length > 0
      }
    };
    
  } catch (error) {
    console.error('Error parsing AI response:', error);
    
    // Fallback para análise básica se a IA falhar
    return generateFallbackAnalysis(data);
  }
}

function buildAnalysisContext(data: AssessmentData): string {
  let context = `
AVALIAÇÃO ATUAL:
- Idade: ${data.current.age} anos
- Gênero: ${data.current.gender === 'male' ? 'Masculino' : 'Feminino'}
- Peso: ${data.current.weight} kg
- Altura: ${data.current.height} cm
- IMC: ${data.current.bmi}
- Percentual de Gordura: ${data.current.fat_percentage}%
- Massa Magra: ${data.current.lean_mass} kg
- Massa Gorda: ${data.current.fat_mass} kg
- Protocolo utilizado: ${data.current.protocol}
  `;

  if (data.current.goals && data.current.goals.length > 0) {
    context += `\nOBJETIVOS: ${data.current.goals.join(', ')}`;
  }

  if (data.student_profile) {
    context += `\nPERFIL DO ALUNO:`;
    if (data.student_profile.experience_level) {
      context += `\n- Nível de experiência: ${data.student_profile.experience_level}`;
    }
    if (data.student_profile.medical_conditions) {
      context += `\n- Condições médicas: ${data.student_profile.medical_conditions}`;
    }
  }

  if (data.previous && data.previous.length > 0) {
    context += `\n\nHISTÓRICO DE AVALIAÇÕES:`;
    data.previous.forEach((prev, index) => {
      context += `\nAvaliação ${index + 1} (${prev.date}):`;
      context += `\n- Peso: ${prev.weight} kg`;
      context += `\n- % Gordura: ${prev.fat_percentage}%`;
      context += `\n- Massa Magra: ${prev.lean_mass} kg`;
      context += `\n- IMC: ${prev.bmi}`;
    });
  }

  return context;
}

function generateFallbackAnalysis(data: AssessmentData) {
  const { current } = data;
  
  // Análise básica sem IA
  let classification = 'average';
  const alerts = [];
  
  // Classificação do IMC
  if (current.bmi < 18.5) {
    classification = 'needs_improvement';
    alerts.push('IMC abaixo do normal');
  } else if (current.bmi > 30) {
    classification = 'concerning';
    alerts.push('IMC indica obesidade');
  } else if (current.bmi >= 25) {
    classification = 'needs_improvement';
    alerts.push('IMC indica sobrepeso');
  }

  // Classificação da gordura corporal
  const isHighFat = current.gender === 'male' ? current.fat_percentage > 25 : current.fat_percentage > 32;
  if (isHighFat) {
    classification = 'needs_improvement';
    alerts.push('Percentual de gordura corporal elevado');
  }

  return {
    summary: {
      classification,
      main_points: ['Avaliação de composição corporal realizada', 'Dados dentro dos parâmetros básicos'],
      health_status: classification === 'concerning' ? 'Requer atenção' : 'Estável'
    },
    detailed_analysis: {
      bmi: `IMC de ${current.bmi} - ${getBMIClassification(current.bmi)}`,
      body_fat: `${current.fat_percentage}% de gordura corporal`,
      lean_mass: `${current.lean_mass}kg de massa magra`
    },
    recommendations: {
      training: 'Programa de exercícios personalizado recomendado',
      nutrition: 'Orientação nutricional individualizada',
      lifestyle: 'Manter hábitos saudáveis de sono e hidratação',
      monitoring: 'Reavaliação em 3 meses'
    },
    alerts: alerts,
    smart_goals: {
      short_term: ['Manter peso atual', 'Melhorar composição corporal'],
      medium_term: ['Otimizar percentual de gordura', 'Aumentar massa magra'],
      metrics: ['Peso', 'Percentual de gordura', 'Massa magra']
    },
    metadata: {
      generated_at: new Date().toISOString(),
      model_used: "fallback-analysis",
      protocol_used: current.protocol,
      has_comparison: false
    }
  };
}

function getBMIClassification(bmi: number): string {
  if (bmi < 18.5) return 'Abaixo do peso';
  if (bmi < 25) return 'Peso normal';
  if (bmi < 30) return 'Sobrepeso';
  return 'Obesidade';
}