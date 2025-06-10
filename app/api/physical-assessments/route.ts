// /opt/flvxus/app/api/physical-assessments/route.ts
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
  'boileau': 'Boileau et al.'
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
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('physical_assessments')
      .select(`
        *,
        profiles!physical_assessments_student_id_fkey(
          full_name,
          avatar_url,
          email
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

    const { data: assessments, error, count } = await query
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({
      assessments,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error: any) {
    console.error('Erro ao buscar avaliações físicas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
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

    // Calcular composição corporal
    const calculations = calculateBodyComposition({
      weight: parseFloat(body.weight),
      height: parseFloat(body.height),
      age: parseInt(body.age),
      gender: body.gender,
      protocol: body.protocol,
      measurements: body.measurements || {}
    });

    // Preparar dados para inserção
    const assessmentData = {
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

    const { data: assessment, error } = await supabase
      .from('physical_assessments')
      .insert(assessmentData)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(assessment);
  } catch (error: any) {
    console.error('Erro ao criar avaliação física:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Função para calcular composição corporal com tipos corretos
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

    default:
      // Estimativa básica usando IMC
      if (gender === 'male') {
        fatPercentage = (1.2 * bmi) + (0.23 * age) - 16.2;
      } else {
        fatPercentage = (1.2 * bmi) + (0.23 * age) - 5.4;
      }
  }

  if (bodyDensity > 0) {
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
    'boileau': 'Específico para jovens (±3-4%)'
  };
  return accuracy[protocol] || 'Estimativa (±5-6%)';
}