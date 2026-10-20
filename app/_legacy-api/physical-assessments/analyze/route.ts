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
    console.log('Received request body:', body); // Debug log

    const { assessmentData, studentInfo, previousAssessments = [] } = body;

    // VALIDAÇÃO MAIS ROBUSTA DOS DADOS
    if (!assessmentData || typeof assessmentData !== 'object') {
      return NextResponse.json({ error: 'Dados da avaliação são obrigatórios' }, { status: 400 });
    }

    const requiredFields = ['age', 'gender', 'weight', 'height', 'bmi', 'fatPercentage', 'fatMass', 'leanMass'];
    for (const field of requiredFields) {
      if (assessmentData[field as keyof AssessmentData] === undefined || assessmentData[field as keyof AssessmentData] === null) {
        return NextResponse.json({ error: `Campo obrigatório ausente: ${field}` }, { status: 400 });
      }
    }

    // Se não há chave da API, usar análise fallback
    if (!process.env.GEMINI_API_KEY) {
      console.log('Gemini API key not found, using fallback analysis');
      const fallbackAnalysis = generateFallbackAnalysis(assessmentData);
      return NextResponse.json({
        success: true,
        analysis: fallbackAnalysis,
        warning: 'Análise gerada com dados básicos (API IA não configurada)'
      });
    }

    try {
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
- Retorne APENAS o JSON, sem texto adicional
`;

      console.log('Sending prompt to Gemini AI'); // Debug log

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log('Received AI response:', text.substring(0, 200) + '...'); // Debug log

      try {
        // Tentar extrair JSON do texto
        let jsonText = text.trim();
        
        // Remover marcações de código se existirem
        if (jsonText.startsWith('```json')) {
          jsonText = jsonText.replace(/```json\s*/, '').replace(/\s*```$/, '');
        } else if (jsonText.startsWith('```')) {
          jsonText = jsonText.replace(/```\s*/, '').replace(/\s*```$/, '');
        }

        // Tentar encontrar JSON no texto
        const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonText = jsonMatch[0];
        }

        const analysisJson: AIAnalysis = JSON.parse(jsonText);

        // Validar estrutura básica do JSON
        if (!analysisJson.classification || !analysisJson.recommendations) {
          throw new Error('Estrutura JSON inválida');
        }

        console.log('Successfully parsed AI analysis'); // Debug log

        return NextResponse.json({
          success: true,
          analysis: analysisJson,
          rawResponse: text
        });

      } catch (parseError) {
        console.error('Erro ao parsear resposta da IA:', parseError);
        console.error('Raw AI response:', text);
        
        // Fallback: análise básica
        const fallbackAnalysis = generateFallbackAnalysis(assessmentData);
        
        return NextResponse.json({
          success: true,
          analysis: fallbackAnalysis,
          warning: 'Análise gerada com dados básicos devido a erro no parsing da IA',
          rawResponse: text
        });
      }

    } catch (aiError) {
      console.error('Erro na API do Gemini:', aiError);
      
      // Fallback: análise básica
      const fallbackAnalysis = generateFallbackAnalysis(assessmentData);
      
      return NextResponse.json({
        success: true,
        analysis: fallbackAnalysis,
        warning: 'Análise gerada com dados básicos devido a erro na IA'
      });
    }

  } catch (error: any) {
    console.error('Erro geral na análise IA:', error);
    
    // Em caso de erro geral, tentar ainda assim retornar uma análise básica
    try {
      const body: RequestBody = await request.json();
      if (body?.assessmentData) {
        const fallbackAnalysis = generateFallbackAnalysis(body.assessmentData);
        return NextResponse.json({
          success: true,
          analysis: fallbackAnalysis,
          warning: 'Análise gerada com dados básicos devido a erro geral'
        });
      }
    } catch (fallbackError) {
      console.error('Erro ao gerar análise fallback:', fallbackError);
    }
    
    return NextResponse.json({ 
      error: 'Erro interno do servidor na análise IA',
      details: error.message 
    }, { status: 500 });
  }
}

function generateFallbackAnalysis(data: AssessmentData): AIAnalysis {
  const fatPercentage = data.fatPercentage;
  const bmi = data.bmi;
  const gender = data.gender;
  const age = data.age;

  let classification = '';
  let healthStatus = '';
  let somatotype = '';
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

  // Status de saúde baseado no IMC
  if (bmi < 18.5) healthStatus = 'Abaixo do peso';
  else if (bmi < 25) healthStatus = 'Peso normal';
  else if (bmi < 30) healthStatus = 'Sobrepeso';
  else healthStatus = 'Obesidade';

  // Somatótipo estimado
  if (fatPercentage > 25) somatotype = 'Endomorfo';
  else if (fatPercentage < 12) somatotype = 'Ectomorfo';
  else somatotype = 'Mesomorfo';

  // Recomendações baseadas na classificação
  if (fatPercentage > 25 || bmi > 25) {
    recommendations = {
      training: {
        focus: 'Redução de gordura corporal e melhoria cardiovascular',
        frequency: '5-6 sessões por semana',
        cardio: 'HIIT 3x/semana + cardio moderado 2-3x/semana (30-45 min)',
        strength: 'Circuitos funcionais e exercícios compostos 3x/semana',
        flexibility: 'Alongamento diário e yoga/pilates 2x/semana'
      },
      nutrition: {
        caloricStrategy: 'Déficit calórico moderado de 300-500 kcal/dia',
        proteinIntake: `${Math.round(data.leanMass * 2.2)}g/dia (distribuído ao longo do dia)`,
        mealTiming: '5-6 refeições menores, evitar carboidratos simples à noite',
        supplementation: 'Whey protein, multivitamínico, ômega-3'
      },
      lifestyle: {
        sleep: '7-9 horas de sono de qualidade, horários regulares',
        hydration: `${Math.round(data.weight * 35)}ml/dia (aumentar em dias de treino)`,
        stress: 'Técnicas de relaxamento, meditação, atividades prazerosas'
      }
    };
  } else if (fatPercentage < 15 || bmi < 20) {
    recommendations = {
      training: {
        focus: 'Ganho de massa muscular e força',
        frequency: '4-5 sessões de musculação por semana',
        cardio: 'Cardio leve 2-3x/semana (20-30 min) para saúde cardiovascular',
        strength: 'Treinos de hipertrofia com progressão de carga, foco em compostos',
        flexibility: 'Mobilidade diária e alongamento pós-treino'
      },
      nutrition: {
        caloricStrategy: 'Superávit calórico de 200-400 kcal/dia',
        proteinIntake: `${Math.round(data.leanMass * 2.5)}g/dia em todas as refeições`,
        mealTiming: '6 refeições, carboidratos ao redor dos treinos',
        supplementation: 'Whey protein, creatina, multivitamínico'
      },
      lifestyle: {
        sleep: '8-9 horas para recuperação muscular adequada',
        hydration: `${Math.round(data.weight * 40)}ml/dia`,
        stress: 'Gestão do estresse para otimizar recuperação e ganhos'
      }
    };
  } else {
    recommendations = {
      training: {
        focus: 'Manutenção e melhoria da composição corporal',
        frequency: '4-5 sessões variadas por semana',
        cardio: 'Cardio moderado 3x/semana, variando modalidades',
        strength: 'Treinos mistos força/hipertrofia, periodização',
        flexibility: 'Yoga ou pilates 2x/semana, mobilidade diária'
      },
      nutrition: {
        caloricStrategy: 'Manutenção calórica com ajustes conforme objetivos',
        proteinIntake: `${Math.round(data.leanMass * 2.0)}g/dia distribuídos`,
        mealTiming: '4-5 refeições balanceadas, timing pré/pós-treino',
        supplementation: 'Conforme necessidade individual e exames'
      },
      lifestyle: {
        sleep: '7-8 horas consistentes, higiene do sono',
        hydration: 'Mínimo 2-3 litros/dia, mais nos treinos',
        stress: 'Atividades recreativas, hobbies, equilíbrio vida/treino'
      }
    };
  }

  // Análise de pontos fortes, melhorias e riscos
  const analysis = {
    strengths: [] as string[],
    improvements: [] as string[],
    risks: [] as string[]
  };

  // Pontos fortes
  if (fatPercentage <= 20) analysis.strengths.push('Boa composição corporal');
  if (bmi >= 18.5 && bmi <= 25) analysis.strengths.push('IMC dentro da faixa ideal');
  if (age < 30) analysis.strengths.push('Jovem, boa capacidade de adaptação');
  if (data.leanMass > data.fatMass * 2) analysis.strengths.push('Boa proporção de massa magra');

  // Melhorias
  if (fatPercentage > 25) analysis.improvements.push('Reduzir percentual de gordura corporal');
  if (bmi > 25) analysis.improvements.push('Melhorar índice de massa corporal');
  if (data.leanMass < data.weight * 0.7) analysis.improvements.push('Aumentar massa muscular');

  // Riscos
  if (bmi > 30) analysis.risks.push('Obesidade - risco cardiovascular elevado');
  if (fatPercentage > 30) analysis.risks.push('Excesso de gordura corporal');
  if (age > 40 && fatPercentage > 20) analysis.risks.push('Risco metabólico relacionado à idade');

  // Garantir que há pelo menos um item em cada categoria
  if (analysis.strengths.length === 0) analysis.strengths.push('Potencial para melhoria significativa');
  if (analysis.improvements.length === 0) analysis.improvements.push('Manter consistência no programa atual');
  if (analysis.risks.length === 0) analysis.risks.push('Sem fatores de risco evidentes');

  return {
    classification,
    healthStatus,
    somatotype,
    metabolicProfile: fatPercentage > 20 ? 'Lento' : fatPercentage < 15 ? 'Rápido' : 'Normal',
    analysis,
    recommendations,
    progressTracking: {
      nextAssessment: '4-6 semanas',
      keyMetrics: ['Peso corporal', 'Percentual de gordura', 'Circunferências', 'Força'],
      expectedTimeline: '8-12 semanas para mudanças significativas'
    },
    specificNotes: `Análise baseada no protocolo ${data.protocol}. Resultados individuais podem variar conforme aderência ao programa e fatores genéticos. Recomenda-se acompanhamento profissional.`
  };
}