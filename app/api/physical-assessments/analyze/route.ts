// /opt/flvxus/app/api/physical-assessments/analyze/route.ts
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Interfaces para type safety
interface StudentInfo {
  name?: string;
  goals?: string[];
}

interface AssessmentData {
  age: number;
  gender: 'male' | 'female';
  weight: number;
  height: number;
  bmi: number;
  fatPercentage: number;
  fatMass: number;
  leanMass: number;
  protocol: string;
}

interface PreviousAssessment {
  date: string;
  weight: number;
  fat_percentage: number;
  lean_mass: number;
}

interface RequestBody {
  assessmentData: AssessmentData;
  studentInfo: StudentInfo;
  previousAssessments?: PreviousAssessment[];
}

interface AIAnalysis {
  classification: string;
  healthStatus: string;
  somatotype: string;
  metabolicProfile: string;
  analysis: {
    strengths: string[];
    improvements: string[];
    risks: string[];
  };
  recommendations: {
    training: {
      focus: string;
      frequency: string;
      cardio: string;
      strength: string;
      flexibility: string;
    };
    nutrition: {
      caloricStrategy: string;
      proteinIntake: string;
      mealTiming: string;
      supplementation: string;
    };
    lifestyle: {
      sleep: string;
      hydration: string;
      stress: string;
    };
  };
  progressTracking: {
    nextAssessment: string;
    keyMetrics: string[];
    expectedTimeline: string;
  };
  specificNotes: string;
}

export async function POST(request: Request) {
  try {
    const body: RequestBody = await request.json();
    const { assessmentData, studentInfo, previousAssessments = [] } = body;

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Chave da API Gemini não configurada' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Preparar prompt para análise
    const prompt = `
Você é um especialista em avaliação física e composição corporal. Analise os seguintes dados de uma avaliação física e forneça recomendações detalhadas.

DADOS DA AVALIAÇÃO:
- Nome: ${studentInfo.name || 'Não informado'}
- Idade: ${assessmentData.age} anos
- Gênero: ${assessmentData.gender === 'male' ? 'Masculino' : 'Feminino'}
- Peso: ${assessmentData.weight}kg
- Altura: ${assessmentData.height}cm
- IMC: ${assessmentData.bmi}
- Percentual de Gordura: ${assessmentData.fatPercentage}%
- Massa Gorda: ${assessmentData.fatMass}kg
- Massa Magra: ${assessmentData.leanMass}kg
- Protocolo: ${assessmentData.protocol}

OBJETIVOS: ${studentInfo.goals ? studentInfo.goals.join(', ') : 'Não informados'}

${previousAssessments.length > 0 ? `
HISTÓRICO DE AVALIAÇÕES ANTERIORES:
${previousAssessments.map((prev, index) => `
Avaliação ${index + 1} (${prev.date}):
- Peso: ${prev.weight}kg
- Gordura: ${prev.fat_percentage}%
- Massa Magra: ${prev.lean_mass}kg
`).join('')}
` : ''}

Por favor, forneça uma análise COMPLETA em formato JSON com as seguintes seções:

{
  "classification": "Classificação da composição corporal (Ex: Atlético, Fitness, Aceitável, etc.)",
  "healthStatus": "Status de saúde baseado nos indicadores",
  "somatotype": "Estimativa do somatótipo (Ectomorfo, Mesomorfo, Endomorfo)",
  "metabolicProfile": "Perfil metabólico estimado",
  "analysis": {
    "strengths": ["Lista de pontos fortes identificados"],
    "improvements": ["Lista de áreas que precisam melhorar"],
    "risks": ["Lista de fatores de risco, se houver"]
  },
  "recommendations": {
    "training": {
      "focus": "Foco principal do treinamento",
      "frequency": "Frequência recomendada",
      "cardio": "Recomendações específicas de cardio",
      "strength": "Recomendações de treinamento de força",
      "flexibility": "Recomendações de flexibilidade/mobilidade"
    },
    "nutrition": {
      "caloricStrategy": "Estratégia calórica (déficit, manutenção, superávit)",
      "proteinIntake": "Ingestão de proteína recomendada em gramas",
      "mealTiming": "Estratégia de horários das refeições",
      "supplementation": "Suplementação sugerida, se aplicável"
    },
    "lifestyle": {
      "sleep": "Recomendações de sono",
      "hydration": "Recomendações de hidratação",
      "stress": "Gestão de estresse"
    }
  },
  "progressTracking": {
    "nextAssessment": "Quando fazer a próxima avaliação",
    "keyMetrics": ["Métricas principais para acompanhar"],
    "expectedTimeline": "Timeline esperada para ver resultados"
  },
  "specificNotes": "Observações específicas baseadas no protocolo usado e características individuais"
}

IMPORTANTE: 
- Base suas recomendações nas evidências científicas mais atuais
- Considere as especificidades do gênero e idade
- Se houver histórico, comente sobre a evolução
- Seja específico e prático nas recomendações
- Use linguagem profissional mas acessível
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
      // Tentar extrair JSON do texto
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const analysisJson: AIAnalysis | null = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

      if (!analysisJson) {
        throw new Error('Resposta da IA não está em formato JSON válido');
      }

      return NextResponse.json({
        success: true,
        analysis: analysisJson,
        rawResponse: text
      });

    } catch (parseError) {
      console.error('Erro ao parsear resposta da IA:', parseError);
      
      // Fallback: análise básica
      const fallbackAnalysis = generateFallbackAnalysis(assessmentData);
      
      return NextResponse.json({
        success: true,
        analysis: fallbackAnalysis,
        warning: 'Análise gerada com dados básicos devido a erro na IA',
        rawResponse: text
      });
    }

  } catch (error: any) {
    console.error('Erro na análise IA:', error);
    
    // Fallback: análise básica
    const body: RequestBody = await request.json();
    const fallbackAnalysis = generateFallbackAnalysis(body?.assessmentData);
    
    return NextResponse.json({
      success: true,
      analysis: fallbackAnalysis,
      warning: 'Análise gerada com dados básicos devido a erro na IA'
    });
  }
}

function generateFallbackAnalysis(data: AssessmentData): AIAnalysis {
  const fatPercentage = data.fatPercentage;
  const bmi = data.bmi;
  const gender = data.gender;

  let classification = '';
  let recommendations: AIAnalysis['recommendations'];

  // Classificação baseada no percentual de gordura
  if (gender === 'male') {
    if (fatPercentage < 6) classification = 'Muito baixo';
    else if (fatPercentage < 14) classification = 'Atlético';
    else if (fatPercentage < 18) classification = 'Fitness';
    else if (fatPercentage < 25) classification = 'Aceitável';
    else classification = 'Elevado';
  } else {
    if (fatPercentage < 16) classification = 'Muito baixo';
    else if (fatPercentage < 21) classification = 'Atlético';
    else if (fatPercentage < 25) classification = 'Fitness';
    else if (fatPercentage < 32) classification = 'Aceitável';
    else classification = 'Elevado';
  }

  // Recomendações básicas
  if (fatPercentage > 25) {
    recommendations = {
      training: {
        focus: 'Redução de gordura corporal',
        frequency: '5-6x por semana',
        cardio: 'HIIT 3x/semana + cardio moderado 2x/semana',
        strength: 'Circuitos e exercícios compostos',
        flexibility: 'Alongamento pós-treino'
      },
      nutrition: {
        caloricStrategy: 'Déficit calórico moderado (300-500 kcal)',
        proteinIntake: `${Math.round(data.leanMass * 2.2)}g/dia`,
        mealTiming: '4-5 refeições menores',
        supplementation: 'Whey protein, multivitamínico'
      },
      lifestyle: {
        sleep: '7-9 horas de sono de qualidade',
        hydration: '35ml por kg de peso corporal',
        stress: 'Técnicas de relaxamento e meditação'
      }
    };
  } else if (fatPercentage < 15) {
    recommendations = {
      training: {
        focus: 'Ganho de massa muscular',
        frequency: '4-5x por semana',
        cardio: 'Cardio leve 2-3x/semana',
        strength: 'Treinos de hipertrofia com progressão',
        flexibility: 'Mobilidade diária'
      },
      nutrition: {
        caloricStrategy: 'Leve superávit calórico (200-400 kcal)',
        proteinIntake: `${Math.round(data.leanMass * 2.5)}g/dia`,
        mealTiming: '5-6 refeições ao longo do dia',
        supplementation: 'Creatina, whey protein'
      },
      lifestyle: {
        sleep: '8-9 horas para recuperação muscular',
        hydration: '40ml por kg de peso corporal',
        stress: 'Gestão do estresse para melhor recuperação'
      }
    };
  } else {
    recommendations = {
      training: {
        focus: 'Manutenção e melhoria da composição',
        frequency: '4-5x por semana',
        cardio: 'Cardio moderado 3x/semana',
        strength: 'Treinos mistos força/hipertrofia',
        flexibility: 'Yoga ou pilates 1-2x/semana'
      },
      nutrition: {
        caloricStrategy: 'Manutenção calórica',
        proteinIntake: `${Math.round(data.leanMass * 2.0)}g/dia`,
        mealTiming: '4-5 refeições balanceadas',
        supplementation: 'Conforme necessidade individual'
      },
      lifestyle: {
        sleep: '7-8 horas consistentes',
        hydration: 'Mínimo 2-3 litros por dia',
        stress: 'Atividades recreativas e hobbies'
      }
    };
  }

  return {
    classification,
    healthStatus: bmi > 30 ? 'Atenção necessária' : 'Dentro dos parâmetros',
    somatotype: fatPercentage > 20 ? 'Endomorfo' : fatPercentage < 12 ? 'Ectomorfo' : 'Mesomorfo',
    metabolicProfile: fatPercentage > 20 ? 'Lento' : 'Normal',
    analysis: {
      strengths: fatPercentage < 20 ? ['Boa composição corporal'] : ['Potencial para melhoria'],
      improvements: fatPercentage > 25 ? ['Reduzir gordura corporal'] : ['Manter consistência'],
      risks: bmi > 30 ? ['Sobrepeso/obesidade'] : []
    },
    recommendations,
    progressTracking: {
      nextAssessment: '4-6 semanas',
      keyMetrics: ['Peso', 'Percentual de gordura', 'Circunferências'],
      expectedTimeline: '8-12 semanas para mudanças significativas'
    },
    specificNotes: `Análise baseada em ${data.protocol}. Resultados individuais podem variar.`
  };
}