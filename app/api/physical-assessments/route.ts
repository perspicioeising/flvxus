// /opt/flvxus/app/api/physical-assessments/route.ts - VERSÃO CORRIGIDA

import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Interfaces para type safety
interface Profile {
  id: string;
  tenant_id: string;
  role: 'trainer' | 'student';
}

interface BodyCompositionParams {
  weight: number;
  height: number;
  age: number;
  gender: 'male' | 'female';
  protocol: string;
  measurements: Record<string, number>;
}

interface BodyCompositionResult {
  bmi: number;
  bodyDensity: number;
  fatPercentage: number;
  fatMass: number;
  leanMass: number;
}

const PROTOCOLS: Record<string, string> = {
  'jackson_pollock_3': 'Jackson & Pollock (3 dobras)',
  'jackson_pollock_7': 'Jackson & Pollock (7 dobras)',
  'durnin_womersley': 'Durnin & Womersley',
  'slaughter': 'Slaughter et al.',
  'boileau': 'Boileau et al.',
  'guedes_1994': 'Guedes 1994'
};

export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, tenant_id, role')
      .eq('user_id', session.user.id)
      .single() as { data: Profile | null };

    if (!profile) {
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });
    }

    const url = new URL(request.url);
    const studentId = url.searchParams.get('student_id');
    const page = url.searchParams.get('page');
    const limit = url.searchParams.get('limit');

    console.log('=== DEBUG GET ASSESSMENTS ===');
    console.log('Profile ID:', profile.id);
    console.log('Profile Role:', profile.role);
    console.log('Tenant ID:', profile.tenant_id);
    console.log('Student ID filter:', studentId);

    let query = supabase
      .from('physical_assessments')
      .select(`
        *,
        profiles!physical_assessments_student_id_fkey(
          full_name,
          avatar_url,
          email,
          goals
        )
      `)
      .eq('tenant_id', profile.tenant_id)
      .order('created_at', { ascending: false });

    if (studentId) {
      query = query.eq('student_id', studentId);
    }

    if (profile.role === 'student') {
      query = query.eq('student_id', profile.id);
    }

    // ===== CORREÇÃO: APLICAR PAGINAÇÃO APENAS SE SOLICITADA =====
    let assessments, error, count;
    
    if (page && limit) {
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const offset = (pageNum - 1) * limitNum;
      
      const result = await query.range(offset, offset + limitNum - 1);
      assessments = result.data;
      error = result.error;
      count = result.count;
    } else {
      // SEM PAGINAÇÃO - BUSCAR TODOS OS REGISTROS
      const result = await query;
      assessments = result.data;
      error = result.error;
      count = result.data?.length || 0;
    }

    if (error) {
      console.error('❌ Erro do Supabase:', error);
      throw error;
    }

    console.log(`✅ GET Assessments: ${assessments?.length || 0} registros encontrados`);
    console.log('Primeiros registros:', assessments?.slice(0, 2));

    // ===== PROCESSAR DADOS DE IA NOS RESULTADOS =====
    const processedAssessments = assessments?.map(assessment => {
      // Processar ai_analysis se necessário
      if (assessment.ai_analysis && typeof assessment.ai_analysis === 'string') {
        try {
          assessment.ai_analysis = JSON.parse(assessment.ai_analysis);
        } catch (error) {
          console.warn('Erro ao processar ai_analysis:', error);
        }
      }

      // Processar ai_recommendations se necessário
      if (assessment.ai_recommendations && typeof assessment.ai_recommendations === 'string') {
        try {
          assessment.ai_recommendations = JSON.parse(assessment.ai_recommendations);
        } catch (error) {
          console.warn('Erro ao processar ai_recommendations:', error);
        }
      }

      return assessment;
    }) || [];

    // ===== RETORNO PADRONIZADO =====
    if (page && limit) {
      // Com paginação
      return NextResponse.json({
        assessments: processedAssessments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil((count || 0) / parseInt(limit))
        }
      });
    } else {
      // ===== CORREÇÃO PRINCIPAL: SEMPRE RETORNAR FORMATO CONSISTENTE =====
      return NextResponse.json({
        assessments: processedAssessments,
        total: count
      });
    }

  } catch (error: any) {
    console.error('❌ Erro ao buscar avaliações físicas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, tenant_id, role')
      .eq('user_id', session.user.id)
      .single() as { data: Profile | null };

    if (!profile || profile.role !== 'trainer') {
      return NextResponse.json({ error: 'Acesso restrito a treinadores' }, { status: 403 });
    }

    const body = await request.json();
    
    // ===== LOGS DE DEBUG =====
    console.log('=== DADOS RECEBIDOS NA API ===');
    console.log('Body completo:', JSON.stringify(body, null, 2));
    console.log('ai_analysis no body:', body.ai_analysis ? 'PRESENTE' : 'AUSENTE');
    console.log('ai_recommendations no body:', body.ai_recommendations ? 'PRESENTE' : 'AUSENTE');
    console.log('Tipo ai_analysis:', typeof body.ai_analysis);
    console.log('Tipo ai_recommendations:', typeof body.ai_recommendations);
    
    // Validar dados obrigatórios
    const requiredFields = ['student_id', 'weight', 'height', 'protocol', 'age', 'gender'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Campo obrigatório: ${field}` },
          { status: 400 }
        );
      }
    }

    // Verificar se o student pertence ao mesmo tenant
    const { data: student, error: studentError } = await supabase
      .from('profiles')
      .select('id, tenant_id')
      .eq('id', body.student_id)
      .eq('tenant_id', profile.tenant_id)
      .single();

    if (studentError || !student) {
      return NextResponse.json({ error: 'Aluno não encontrado' }, { status: 404 });
    }

    // Calcular composição corporal se não fornecida
    let calculations = null;
    if (body.bmi && body.fat_percentage && body.fat_mass && body.lean_mass && body.body_density) {
      // Usar dados fornecidos pelo frontend
      calculations = {
        bmi: parseFloat(body.bmi),
        bodyDensity: parseFloat(body.body_density),
        fatPercentage: parseFloat(body.fat_percentage),
        fatMass: parseFloat(body.fat_mass),
        leanMass: parseFloat(body.lean_mass)
      };
    } else {
      // Calcular automaticamente
      calculations = calculateBodyComposition({
        weight: parseFloat(body.weight),
        height: parseFloat(body.height),
        age: parseInt(body.age),
        gender: body.gender,
        protocol: body.protocol,
        measurements: body.measurements || {}
      });
    }

    // Preparar dados para inserção
    const assessmentData: any = {
      student_id: body.student_id,
      weight: parseFloat(body.weight),
      height: parseFloat(body.height),
      age: parseInt(body.age),
      gender: body.gender,
      protocol: body.protocol,
      date: body.date || new Date().toISOString().split('T')[0],
      notes: body.notes || null,
      tenant_id: profile.tenant_id,
      
      // Circunferências
      neck: body.measurements?.neck ? parseFloat(body.measurements.neck) : null,
      shoulders: body.measurements?.shoulders ? parseFloat(body.measurements.shoulders) : null,
      chest: body.measurements?.chest ? parseFloat(body.measurements.chest) : null,
      chest_circ: body.measurements?.chest_circ ? parseFloat(body.measurements.chest_circ) : null,
      abdomen: body.measurements?.abdomen ? parseFloat(body.measurements.abdomen) : null,
      waist: body.measurements?.waist ? parseFloat(body.measurements.waist) : null,
      hips: body.measurements?.hips ? parseFloat(body.measurements.hips) : null,
      left_arm: body.measurements?.left_arm ? parseFloat(body.measurements.left_arm) : null,
      right_arm: body.measurements?.right_arm ? parseFloat(body.measurements.right_arm) : null,
      left_thigh: body.measurements?.left_thigh ? parseFloat(body.measurements.left_thigh) : null,
      right_thigh: body.measurements?.right_thigh ? parseFloat(body.measurements.right_thigh) : null,
      left_calf: body.measurements?.left_calf ? parseFloat(body.measurements.left_calf) : null,
      right_calf: body.measurements?.right_calf ? parseFloat(body.measurements.right_calf) : null,
      
      // Dobras cutâneas
      triceps: body.measurements?.triceps ? parseFloat(body.measurements.triceps) : null,
      biceps: body.measurements?.biceps ? parseFloat(body.measurements.biceps) : null,
      subscapular: body.measurements?.subscapular ? parseFloat(body.measurements.subscapular) : null,
      abdominal: body.measurements?.abdominal ? parseFloat(body.measurements.abdominal) : null,
      suprailiac: body.measurements?.suprailiac ? parseFloat(body.measurements.suprailiac) : null,
      midaxillary: body.measurements?.midaxillary ? parseFloat(body.measurements.midaxillary) : null,
      thigh: body.measurements?.thigh ? parseFloat(body.measurements.thigh) : null,
      
      // Cálculos automáticos
      body_density: calculations?.bodyDensity,
      fat_percentage: calculations?.fatPercentage,
      fat_mass: calculations?.fatMass,
      lean_mass: calculations?.leanMass,
      bmi: calculations?.bmi,
      
      // Metadados
      calculations_used: body.protocol,
      accuracy_estimate: getAccuracyEstimate(body.protocol),
      measurements: body.measurements || {}
    };

    // ===== PROCESSAMENTO DOS DADOS DE IA =====
    console.log('📝 Processando dados de IA...');

    // 1. Processar ai_analysis
    if (body.ai_analysis) {
      console.log('📝 Processando ai_analysis...');
      
      if (typeof body.ai_analysis === 'string') {
        try {
          assessmentData.ai_analysis = JSON.parse(body.ai_analysis);
          console.log('✅ ai_analysis convertido de string para objeto');
        } catch (error) {
          console.error('❌ Erro ao converter ai_analysis string:', error);
          assessmentData.ai_analysis = body.ai_analysis; // Manter como string se parse falhar
        }
      } else if (typeof body.ai_analysis === 'object') {
        assessmentData.ai_analysis = body.ai_analysis;
        console.log('✅ ai_analysis já é objeto');
      }
    } else {
      console.log('⚠️ ai_analysis não fornecido');
      assessmentData.ai_analysis = null;
    }

    // 2. Processar ai_recommendations
    if (body.ai_recommendations) {
      console.log('📝 Processando ai_recommendations...');
      
      if (typeof body.ai_recommendations === 'string') {
        try {
          assessmentData.ai_recommendations = JSON.parse(body.ai_recommendations);
          console.log('✅ ai_recommendations convertido de string para objeto');
        } catch (error) {
          console.error('❌ Erro ao converter ai_recommendations string:', error);
          assessmentData.ai_recommendations = body.ai_recommendations; // Manter como string se parse falhar
        }
      } else if (typeof body.ai_recommendations === 'object') {
        assessmentData.ai_recommendations = body.ai_recommendations;
        console.log('✅ ai_recommendations já é objeto');
      }
    } else {
      console.log('⚠️ ai_recommendations não fornecido');
      assessmentData.ai_recommendations = null;
    }

    // ===== FALLBACK: EXTRAIR RECOMMENDATIONS DE DENTRO DE AI_ANALYSIS =====
    if (!assessmentData.ai_recommendations && 
        assessmentData.ai_analysis && 
        assessmentData.ai_analysis.recommendations) {
      console.log('🔄 Extraindo recommendations de dentro de ai_analysis...');
      assessmentData.ai_recommendations = {
        training: assessmentData.ai_analysis.recommendations.training,
        nutrition: assessmentData.ai_analysis.recommendations.nutrition,
        lifestyle: assessmentData.ai_analysis.recommendations.lifestyle
      };
      console.log('✅ ai_recommendations extraído de ai_analysis');
    }

    console.log('=== DADOS FINAIS PARA INSERÇÃO ===');
    console.log('ai_analysis final:', assessmentData.ai_analysis ? 'PRESENTE' : 'NULL');
    console.log('ai_recommendations final:', assessmentData.ai_recommendations ? 'PRESENTE' : 'NULL');
    console.log('Tipo ai_analysis final:', typeof assessmentData.ai_analysis);
    console.log('Tipo ai_recommendations final:', typeof assessmentData.ai_recommendations);

    // ===== INSERIR NO BANCO =====
    const { data: assessment, error } = await supabase
      .from('physical_assessments')
      .insert(assessmentData)
      .select(`
        *,
        profiles!physical_assessments_student_id_fkey(
          full_name,
          avatar_url,
          email,
          goals
        )
      `)
      .single();

    if (error) {
      console.error('❌ Erro do Supabase ao inserir:', error);
      console.error('Dados que causaram erro:', JSON.stringify(assessmentData, null, 2));
      throw error;
    }

    console.log('=== AVALIAÇÃO CRIADA COM SUCESSO ===');
    console.log('ID da avaliação:', assessment.id);
    console.log('ai_analysis salvo no banco:', assessment.ai_analysis ? 'SIM' : 'NÃO');
    console.log('ai_recommendations salvo no banco:', assessment.ai_recommendations ? 'SIM' : 'NÃO');

    return NextResponse.json(assessment);
  } catch (error: any) {
    console.error('❌ Erro geral ao criar avaliação física:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    );
  }
}

function calculateBodyComposition({ 
  weight, 
  height, 
  age, 
  gender, 
  protocol, 
  measurements 
}: BodyCompositionParams): BodyCompositionResult {
  const heightM = height / 100;
  const bmi = weight / (heightM * heightM);

  let bodyDensity = 0;
  let fatPercentage = 0;

  switch (protocol) {
    case 'jackson_pollock_3':
      if (gender === 'male') {
        const sum3 = (measurements.chest || 0) + (measurements.abdominal || 0) + (measurements.thigh || 0);
        bodyDensity = 1.10938 - (0.0008267 * sum3) + (0.0000016 * sum3 * sum3) - (0.0002574 * age);
      } else {
        const sum3 = (measurements.triceps || 0) + (measurements.suprailiac || 0) + (measurements.thigh || 0);
        bodyDensity = 1.0994921 - (0.0009929 * sum3) + (0.0000023 * sum3 * sum3) - (0.0001392 * age);
      }
      break;

    case 'jackson_pollock_7':
      const sum7 = Object.values(measurements).reduce((acc: number, val: number) => acc + (val || 0), 0);
      if (gender === 'male') {
        bodyDensity = 1.112 - (0.00043499 * sum7) + (0.00000055 * sum7 * sum7) - (0.00028826 * age);
      } else {
        bodyDensity = 1.097 - (0.00046971 * sum7) + (0.00000056 * sum7 * sum7) - (0.00012828 * age);
      }
      break;

    case 'durnin_womersley':
      const sumDW = (measurements.biceps || 0) + (measurements.triceps || 0) + 
                    (measurements.subscapular || 0) + (measurements.suprailiac || 0);
      if (gender === 'male') {
        bodyDensity = 1.1765 - (0.0744 * Math.log10(sumDW));
      } else {
        bodyDensity = 1.1567 - (0.0717 * Math.log10(sumDW));
      }
      break;

    case 'guedes_1994':
      const sumGuedes = (measurements.triceps || 0) + (measurements.subscapular || 0);
      if (gender === 'male') {
        fatPercentage = (0.735 * sumGuedes) + 1.0;
      } else {
        fatPercentage = (0.610 * sumGuedes) + 5.1;
      }
      break;

    default:
      // Estimativa básica usando IMC
      if (gender === 'male') {
        fatPercentage = (1.2 * bmi) + (0.23 * age) - 16.2;
      } else {
        fatPercentage = (1.2 * bmi) + (0.23 * age) - 5.4;
      }
  }

  if (bodyDensity > 0 && protocol !== 'guedes_1994') {
    fatPercentage = ((4.95 / bodyDensity) - 4.5) * 100;
  }

  const fatMass = (weight * fatPercentage) / 100;
  const leanMass = weight - fatMass;

  return {
    bmi: parseFloat(bmi.toFixed(1)),
    bodyDensity: parseFloat(bodyDensity.toFixed(4)),
    fatPercentage: parseFloat(Math.max(0, fatPercentage).toFixed(1)),
    fatMass: parseFloat(Math.max(0, fatMass).toFixed(1)),
    leanMass: parseFloat(leanMass.toFixed(1))
  };
}

function getAccuracyEstimate(protocol: string): string {
  const accuracy: Record<string, string> = {
    'jackson_pollock_3': 'Boa (±3-4%)',
    'jackson_pollock_7': 'Excelente (±2-3%)',
    'durnin_womersley': 'Boa (±3-4%)',
    'slaughter': 'Boa para jovens (±3-4%)',
    'boileau': 'Específico para jovens (±3-4%)',
    'guedes_1994': 'Boa para jovens brasileiros (±3-4%)'
  };
  return accuracy[protocol] || 'Estimativa (±5-6%)';
}