// /opt/flvxus/app/api/physical-assessments/comparison/[studentId]/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

interface Profile {
  id: string;
  tenant_id: string;
  role: 'trainer' | 'student';
}

interface RouteParams {
  params: {
    studentId: string;
  };
}

interface ComparisonData {
  student: {
    full_name: string;
    email: string;
    goals: string[];
  };
  assessments: Array<{
    id: string;
    date: string;
    weight: number;
    bmi: number;
    fat_percentage: number;
    fat_mass: number;
    lean_mass: number;
    protocol: string;
    created_at: string;
  }>;
  trends: {
    weight: {
      change: number;
      trend: 'up' | 'down' | 'stable';
      periods: Array<{ date: string; value: number }>;
    };
    fatPercentage: {
      change: number;
      trend: 'up' | 'down' | 'stable';
      periods: Array<{ date: string; value: number }>;
    };
    leanMass: {
      change: number;
      trend: 'up' | 'down' | 'stable';
      periods: Array<{ date: string; value: number }>;
    };
    bmi: {
      change: number;
      trend: 'up' | 'down' | 'stable';
      periods: Array<{ date: string; value: number }>;
    };
  };
  insights: {
    totalAssessments: number;
    averageInterval: number; // dias entre avaliações
    bestPeriod: string;
    recommendations: string[];
  };
}

export async function GET(request: Request, { params }: RouteParams) {
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

    // Verificar permissão
    if (profile.role === 'student' && profile.id !== params.studentId) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Buscar dados do estudante
    const { data: student, error: studentError } = await supabase
      .from('profiles')
      .select('full_name, email, goals')
      .eq('id', params.studentId)
      .eq('tenant_id', profile.tenant_id)
      .single();

    if (studentError || !student) {
      return NextResponse.json({ error: 'Estudante não encontrado' }, { status: 404 });
    }

    // Buscar todas as avaliações do estudante
    const { data: assessments, error: assessmentsError } = await supabase
      .from('physical_assessments')
      .select(`
        id,
        date,
        weight,
        bmi,
        fat_percentage,
        fat_mass,
        lean_mass,
        protocol,
        created_at
      `)
      .eq('student_id', params.studentId)
      .eq('tenant_id', profile.tenant_id)
      .order('date', { ascending: true });

    if (assessmentsError) {
      throw assessmentsError;
    }

    if (!assessments || assessments.length < 2) {
      return NextResponse.json({
        error: 'Mínimo de 2 avaliações necessárias para comparação',
        assessments: assessments || []
      }, { status: 400 });
    }

    // Calcular tendências
    const trends = calculateTrends(assessments);
    
    // Gerar insights
    const insights = generateInsights(assessments, trends);

    const comparisonData: ComparisonData = {
      student,
      assessments,
      trends,
      insights
    };

    return NextResponse.json(comparisonData);
  } catch (error: any) {
    console.error('Erro ao buscar dados de comparação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

function calculateTrends(assessments: any[]) {
  const first = assessments[0];
  const last = assessments[assessments.length - 1];
  
  const calculateTrend = (initialValue: number, finalValue: number) => {
    const change = finalValue - initialValue;
    const percentChange = (change / initialValue) * 100;
    
    let trend: 'up' | 'down' | 'stable';
    if (Math.abs(percentChange) < 2) {
      trend = 'stable';
    } else if (change > 0) {
      trend = 'up';
    } else {
      trend = 'down';
    }
    
    return { change: parseFloat(change.toFixed(2)), trend };
  };

  return {
    weight: {
      ...calculateTrend(first.weight, last.weight),
      periods: assessments.map(a => ({ date: a.date, value: a.weight }))
    },
    fatPercentage: {
      ...calculateTrend(first.fat_percentage, last.fat_percentage),
      periods: assessments.map(a => ({ date: a.date, value: a.fat_percentage }))
    },
    leanMass: {
      ...calculateTrend(first.lean_mass, last.lean_mass),
      periods: assessments.map(a => ({ date: a.date, value: a.lean_mass }))
    },
    bmi: {
      ...calculateTrend(first.bmi, last.bmi),
      periods: assessments.map(a => ({ date: a.date, value: a.bmi }))
    }
  };
}

function generateInsights(assessments: any[], trends: any) {
  const totalAssessments = assessments.length;
  
  // Calcular intervalo médio entre avaliações
  const intervals = [];
  for (let i = 1; i < assessments.length; i++) {
    const prev = new Date(assessments[i - 1].date);
    const curr = new Date(assessments[i].date);
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
    intervals.push(diffDays);
  }
  const averageInterval = Math.round(intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length);

  // Identificar melhor período (maior redução de gordura + aumento massa magra)
  let bestPeriodIndex = 0;
  let bestScore = -Infinity;
  
  for (let i = 1; i < assessments.length; i++) {
    const prev = assessments[i - 1];
    const curr = assessments[i];
    
    const fatReduction = prev.fat_percentage - curr.fat_percentage;
    const leanGain = curr.lean_mass - prev.lean_mass;
    const score = fatReduction * 2 + leanGain; // Peso maior para redução de gordura
    
    if (score > bestScore) {
      bestScore = score;
      bestPeriodIndex = i;
    }
  }
  
  const bestPeriod = bestPeriodIndex > 0 
    ? `${assessments[bestPeriodIndex - 1].date} a ${assessments[bestPeriodIndex].date}`
    : 'Período inicial';

  // Gerar recomendações baseadas nas tendências
  const recommendations = [];
  
  if (trends.fatPercentage.trend === 'up') {
    recommendations.push('Revisar estratégia nutricional e aumentar atividade cardiovascular');
  }
  
  if (trends.leanMass.trend === 'down') {
    recommendations.push('Intensificar treinamento de força e verificar ingestão proteica');
  }
  
  if (trends.weight.trend === 'stable' && trends.fatPercentage.trend === 'down') {
    recommendations.push('Excelente recomposição corporal! Manter estratégia atual');
  }
  
  if (averageInterval > 60) {
    recommendations.push('Reduzir intervalo entre avaliações para melhor acompanhamento');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Manter consistência no programa atual');
  }

  return {
    totalAssessments,
    averageInterval,
    bestPeriod,
    recommendations
  };
}