// /opt/flvxus/app/api/physical-assessments/students/[studentId]/route.ts
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
    studentId: string;
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

    // Verificar se o usuário pode acessar as avaliações deste aluno
    if (profile.role === 'student' && profile.id !== params.studentId) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { data: assessments, error } = await supabase
      .from('physical_assessments')
      .select('*')
      .eq('student_id', params.studentId)
      .eq('tenant_id', profile.tenant_id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(assessments);
  } catch (error: any) {
    console.error('Erro ao buscar avaliações do aluno:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}