// app/api/analytics/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { subDays, subMonths, startOfMonth, endOfMonth, format } from 'date-fns';

interface AnalyticsData {
  totalAssessments: number;
  totalStudents: number;
  averageBMI: number;
  averageFat: number;
  protocolDistribution: { protocol: string; count: number; percentage: number }[];
  monthlyTrends: { month: string; assessments: number; avgFat: number; avgLean: number }[];
  demographicData: { ageGroup: string; count: number; avgFat: number }[];
  improvementMetrics: {
    studentsImproving: number;
    averageImprovement: number;
    topPerformers: { name: string; improvement: number }[];
  };
  riskAnalysis: {
    highRisk: number;
    mediumRisk: number;
    lowRisk: number;
  };
}

export async function GET(request: Request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  const { searchParams } = new URL(request.url);
  
  const timeRange = searchParams.get('timeRange') || 'month';

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
      .select('tenant_id, role')
      .eq('user_id', session.user.id)
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 }
      );
    }

    // Calcular range de datas baseado no timeRange
    const dateRange = getDateRange(timeRange);

    // Buscar dados básicos
    const analyticsData = await generateAnalyticsData(supabase, profile.tenant_id, dateRange);

    return NextResponse.json(analyticsData);
  } catch (error: any) {
    console.error('Error generating analytics:', error);
    return NextResponse.json(
      { error: 'Failed to generate analytics' },
      { status: 500 }
    );
  }
}

function getDateRange(timeRange: string) {
  const now = new Date();
  
  switch (timeRange) {
    case 'week':
      return {
        start: subDays(now, 7),
        end: now
      };
    case 'quarter':
      return {
        start: subMonths(now, 3),
        end: now
      };
    case 'year':
      return {
        start: subMonths(now, 12),
        end: now
      };
    case 'month':
    default:
      return {
        start: subMonths(now, 1),
        end: now
      };
  }
}

async function generateAnalyticsData(supabase: any, tenantId: string, dateRange: { start: Date; end: Date }): Promise<AnalyticsData> {
  // 1. Total de avaliações no período
  const { data: assessments, count: totalAssessments } = await supabase
    .from('physical_assessments')
    .select('*', { count: 'exact' })
    .eq('tenant_id', tenantId)
    .gte('created_at', dateRange.start.toISOString())
    .lte('created_at', dateRange.end.toISOString());

  // 2. Total de alunos únicos
  const { data: uniqueStudents } = await supabase
    .from('physical_assessments')
    .select('student_id')
    .eq('tenant_id', tenantId)
    .gte('created_at', dateRange.start.toISOString())
    .lte('created_at', dateRange.end.toISOString());

  const totalStudents = new Set(uniqueStudents?.map((a: { student_id: any; }) => a.student_id) || []).size;

  // 3. Médias gerais
  const averageBMI = assessments?.reduce((acc: any, curr: { bmi: any; }) => acc + (curr.bmi || 0), 0) / (assessments?.length || 1);
  const averageFat = assessments?.reduce((acc: any, curr: { fat_percentage: any; }) => acc + (curr.fat_percentage || 0), 0) / (assessments?.length || 1);

  // 4. Distribuição de protocolos
  const protocolCounts = assessments?.reduce((acc: any, curr: { protocol: string | number; }) => {
    acc[curr.protocol] = (acc[curr.protocol] || 0) + 1;
    return acc;
  }, {}) || {};

  const protocolDistribution = Object.entries(protocolCounts).map(([protocol, count]: [string, any]) => ({
    protocol,
    count,
    percentage: Number(((count / (totalAssessments || 1)) * 100).toFixed(1))
  }));

  // 5. Tendências mensais (últimos 6 meses)
  const monthlyTrends = await getMonthlyTrends(supabase, tenantId);

  // 6. Dados demográficos
  const demographicData = await getDemographicData(supabase, tenantId, dateRange);

  // 7. Métricas de melhoria
  const improvementMetrics = await getImprovementMetrics(supabase, tenantId, dateRange);

  // 8. Análise de riscos
  const riskAnalysis = await getRiskAnalysis(supabase, tenantId, dateRange);

  return {
    totalAssessments: totalAssessments || 0,
    totalStudents,
    averageBMI: Number(averageBMI.toFixed(1)),
    averageFat: Number(averageFat.toFixed(1)),
    protocolDistribution,
    monthlyTrends,
    demographicData,
    improvementMetrics,
    riskAnalysis
  };
}

async function getMonthlyTrends(supabase: any, tenantId: string) {
  const trends = [];
  
  for (let i = 5; i >= 0; i--) {
    const date = subMonths(new Date(), i);
    const startDate = startOfMonth(date);
    const endDate = endOfMonth(date);

    const { data: monthData, count } = await supabase
      .from('physical_assessments')
      .select('fat_percentage, lean_mass', { count: 'exact' })
      .eq('tenant_id', tenantId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    const avgFat = monthData?.reduce((acc: any, curr: { fat_percentage: any; }) => acc + (curr.fat_percentage || 0), 0) / (monthData?.length || 1);
    const avgLean = monthData?.reduce((acc: any, curr: { lean_mass: any; }) => acc + (curr.lean_mass || 0), 0) / (monthData?.length || 1);

    trends.push({
      month: format(date, 'MMM'),
      assessments: count || 0,
      avgFat: Number(avgFat.toFixed(1)),
      avgLean: Number(avgLean.toFixed(1))
    });
  }

  return trends;
}

async function getDemographicData(supabase: any, tenantId: string, dateRange: { start: Date; end: Date }) {
  const { data: assessmentsWithProfiles } = await supabase
    .from('physical_assessments')
    .select(`
      fat_percentage,
      student:profiles (
        birth_date
      )
    `)
    .eq('tenant_id', tenantId)
    .gte('created_at', dateRange.start.toISOString())
    .lte('created_at', dateRange.end.toISOString());

  const ageGroups: { [key: string]: { count: number; totalFat: number } } = {
    '18-25': { count: 0, totalFat: 0 },
    '26-35': { count: 0, totalFat: 0 },
    '36-45': { count: 0, totalFat: 0 },
    '46-55': { count: 0, totalFat: 0 },
    '55+': { count: 0, totalFat: 0 }
  };

  assessmentsWithProfiles?.forEach((assessment: { student: { birth_date: string | number | Date; }; fat_percentage: any; }) => {
    if (assessment.student?.birth_date) {
      const age = new Date().getFullYear() - new Date(assessment.student.birth_date).getFullYear();
      let ageGroup = '55+';
      
      if (age >= 18 && age <= 25) ageGroup = '18-25';
      else if (age >= 26 && age <= 35) ageGroup = '26-35';
      else if (age >= 36 && age <= 45) ageGroup = '36-45';
      else if (age >= 46 && age <= 55) ageGroup = '46-55';

      ageGroups[ageGroup].count++;
      ageGroups[ageGroup].totalFat += assessment.fat_percentage || 0;
    }
  });

  return Object.entries(ageGroups).map(([ageGroup, data]) => ({
    ageGroup,
    count: data.count,
    avgFat: data.count > 0 ? Number((data.totalFat / data.count).toFixed(1)) : 0
  }));
}

async function getImprovementMetrics(supabase: any, tenantId: string, dateRange: { start: Date; end: Date }) {
  // Buscar alunos com mais de uma avaliação
  const { data: studentsWithMultipleAssessments } = await supabase
    .from('physical_assessments')
    .select(`
      student_id,
      fat_percentage,
      created_at,
      student:profiles (
        full_name
      )
    `)
    .eq('tenant_id', tenantId)
    .order('student_id, created_at');

  const studentProgress: { [key: string]: any } = {};

  studentsWithMultipleAssessments?.forEach((assessment: { student_id: string | number; student: { full_name: any; }; fat_percentage: any; created_at: any; }) => {
    if (!studentProgress[assessment.student_id]) {
      studentProgress[assessment.student_id] = {
        name: assessment.student?.full_name || 'Aluno',
        assessments: []
      };
    }
    studentProgress[assessment.student_id].assessments.push({
      fat_percentage: assessment.fat_percentage,
      created_at: assessment.created_at
    });
  });

  const improvements: { name: any; improvement: number; }[] = [];
  let studentsImproving = 0;

  Object.values(studentProgress).forEach((student: any) => {
    if (student.assessments.length >= 2) {
      const first = student.assessments[0];
      const last = student.assessments[student.assessments.length - 1];
      
      const improvement = ((first.fat_percentage - last.fat_percentage) / first.fat_percentage) * 100;
      
      if (improvement > 0) {
        studentsImproving++;
        improvements.push({
          name: student.name,
          improvement: Number(improvement.toFixed(1))
        });
      }
    }
  });

  const averageImprovement = improvements.length > 0 
    ? improvements.reduce((acc, curr) => acc + curr.improvement, 0) / improvements.length 
    : 0;

  const topPerformers = improvements
    .sort((a, b) => b.improvement - a.improvement)
    .slice(0, 3);

  return {
    studentsImproving,
    averageImprovement: Number(averageImprovement.toFixed(1)),
    topPerformers
  };
}

async function getRiskAnalysis(supabase: any, tenantId: string, dateRange: { start: Date; end: Date }) {
  const { data: assessments } = await supabase
    .from('physical_assessments')
    .select('bmi, fat_percentage, student:profiles(gender)')
    .eq('tenant_id', tenantId)
    .gte('created_at', dateRange.start.toISOString())
    .lte('created_at', dateRange.end.toISOString());

  let highRisk = 0;
  let mediumRisk = 0;
  let lowRisk = 0;

  assessments?.forEach((assessment: { bmi: any; fat_percentage: any; student: { gender: any; }; }) => {
    const bmi = assessment.bmi;
    const fatPercentage = assessment.fat_percentage;
    const gender = assessment.student?.gender;

    // Critérios de risco baseados em BMI e percentual de gordura
    const isHighBMI = bmi >= 30;
    const isHighFat = gender === 'male' ? fatPercentage > 25 : fatPercentage > 32;
    const isMediumBMI = bmi >= 25 && bmi < 30;
    const isMediumFat = gender === 'male' ? fatPercentage > 20 && fatPercentage <= 25 : fatPercentage > 28 && fatPercentage <= 32;

    if (isHighBMI || isHighFat) {
      highRisk++;
    } else if (isMediumBMI || isMediumFat) {
      mediumRisk++;
    } else {
      lowRisk++;
    }
  });

  return {
    highRisk,
    mediumRisk,
    lowRisk
  };
}