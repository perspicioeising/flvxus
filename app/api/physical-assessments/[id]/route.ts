// /opt/flvxus/app/api/physical-assessments/[id]/route.ts - VERSÃO CORRIGIDA
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Interfaces para type safety
interface Profile {
  id: string;
  tenant_id: string;
  role: 'trainer' | 'student';
}

interface RouteParams {
  params: {
    id: string;
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
      .eq('id', params.id)
      .eq('tenant_id', profile.tenant_id);

    if (profile.role === 'student') {
      query = query.eq('student_id', profile.id);
    }

    const { data: assessment, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Avaliação não encontrada' }, { status: 404 });
      }
      throw error;
    }

    // CORREÇÃO: Processar dados de IA corretamente
    console.log('=== DADOS RAW DO BANCO ===');
    console.log('ai_analysis (raw):', assessment.ai_analysis);
    console.log('ai_recommendations (raw):', assessment.ai_recommendations);
    console.log('Type ai_analysis:', typeof assessment.ai_analysis);
    console.log('Type ai_recommendations:', typeof assessment.ai_recommendations);

    // Processar ai_analysis
    if (assessment.ai_analysis) {
      if (typeof assessment.ai_analysis === 'string') {
        try {
          assessment.ai_analysis = JSON.parse(assessment.ai_analysis);
        } catch (parseError) {
          console.error('Erro ao fazer parse de ai_analysis:', parseError);
          console.error('String original:', assessment.ai_analysis);
          assessment.ai_analysis = null;
        }
      }
    }

    // Processar ai_recommendations
    if (assessment.ai_recommendations) {
      if (typeof assessment.ai_recommendations === 'string') {
        try {
          assessment.ai_recommendations = JSON.parse(assessment.ai_recommendations);
        } catch (parseError) {
          console.error('Erro ao fazer parse de ai_recommendations:', parseError);
          console.error('String original:', assessment.ai_recommendations);
          assessment.ai_recommendations = null;
        }
      }
    }

    // FALLBACK: Se ai_recommendations está vazio mas ai_analysis tem recommendations
    if (!assessment.ai_recommendations && 
        assessment.ai_analysis && 
        assessment.ai_analysis.recommendations) {
      assessment.ai_recommendations = {
        training: assessment.ai_analysis.recommendations.training,
        nutrition: assessment.ai_analysis.recommendations.nutrition,
        lifestyle: assessment.ai_analysis.recommendations.lifestyle
      };
    }

    console.log('=== DADOS PROCESSADOS ===');
    console.log('ai_analysis (processado):', assessment.ai_analysis);
    console.log('ai_recommendations (processado):', assessment.ai_recommendations);

    return NextResponse.json(assessment);
  } catch (error: any) {
    console.error('Erro ao buscar avaliação física:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
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

    // CORREÇÃO: Garantir que os dados de IA são salvos corretamente
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (body.notes !== undefined) {
      updateData.notes = body.notes;
    }

    if (body.ai_analysis !== undefined) {
      // Se ai_analysis é um objeto, salvar como JSONB
      // Se é uma string, tentar fazer parse primeiro
      if (typeof body.ai_analysis === 'string') {
        try {
          updateData.ai_analysis = JSON.parse(body.ai_analysis);
        } catch (error) {
          updateData.ai_analysis = body.ai_analysis;
        }
      } else {
        updateData.ai_analysis = body.ai_analysis;
      }
    }

    if (body.ai_recommendations !== undefined) {
      // Mesmo tratamento para ai_recommendations
      if (typeof body.ai_recommendations === 'string') {
        try {
          updateData.ai_recommendations = JSON.parse(body.ai_recommendations);
        } catch (error) {
          updateData.ai_recommendations = body.ai_recommendations;
        }
      } else {
        updateData.ai_recommendations = body.ai_recommendations;
      }
    }

    console.log('=== DADOS PARA ATUALIZAÇÃO ===');
    console.log('Body recebido:', body);
    console.log('Update data:', updateData);

    const { data: assessment, error } = await supabase
      .from('physical_assessments')
      .update(updateData)
      .eq('id', params.id)
      .eq('tenant_id', profile.tenant_id)
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
      console.error('Erro do Supabase:', error);
      throw error;
    }

    console.log('=== AVALIAÇÃO ATUALIZADA ===');
    console.log('ai_analysis salvo:', assessment.ai_analysis);
    console.log('ai_recommendations salvo:', assessment.ai_recommendations);

    return NextResponse.json(assessment);
  } catch (error: any) {
    console.error('Erro ao atualizar avaliação física:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
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

    const { error } = await supabase
      .from('physical_assessments')
      .delete()
      .eq('id', params.id)
      .eq('tenant_id', profile.tenant_id);

    if (error) throw error;

    return NextResponse.json({ message: 'Avaliação deletada com sucesso' });
  } catch (error: any) {
    console.error('Erro ao deletar avaliação física:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}