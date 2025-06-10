// /opt/flvxus/app/api/physical-assessments/[id]/route.ts
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

    const { data: assessment, error } = await supabase
      .from('physical_assessments')
      .update({
        notes: body.notes,
        ai_analysis: body.ai_analysis,
        ai_recommendations: body.ai_recommendations,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .eq('tenant_id', profile.tenant_id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(assessment);
  } catch (error: any) {
    console.error('Erro ao atualizar avaliação física:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
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