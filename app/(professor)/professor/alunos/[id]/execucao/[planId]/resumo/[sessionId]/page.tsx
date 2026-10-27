import { notFound, redirect } from 'next/navigation';

import { getSessionUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { DIVISAO_SEM } from '@/lib/divisao';
import { montarResumoSessao } from '@/lib/treino/resumo-dados';
import { ResumoSessao } from '@/components/aluno/execucao/resumo-sessao';

/**
 * Rota-espelho do resumo pós-treino para o PROFESSOR. Consome a MESMA
 * `montarResumoSessao` da rota do aluno (sem recálculo divergente) e varia só o
 * `href` do botão "Voltar". Guard em profundidade (além do layout `(professor)`
 * e da RLS), espelhando `treinar/[planId]/page.tsx`:
 * - sessão ausente/`role !== 'trainer'` → `notFound()`;
 * - aluno precisa ser `student` do tenant (RLS de `profiles`) → senão `notFound()`;
 * - `nao-encontrada` (RLS vazio) → `notFound()`;
 * - posse: `dados.studentId !== id` → `notFound()` (sessão de outro aluno);
 * - `em-andamento` → `redirect` ao treino presencial preservando o eixo;
 * - `ok` → `ResumoSessao` com "Voltar" para a ficha do aluno.
 */
export default async function ProfessorResumoSessaoPage({
  params,
}: {
  params: Promise<{ id: string; planId: string; sessionId: string }>;
}) {
  const { id, planId, sessionId } = await params;

  // O layout (professor) já garante trainer; revalidar é defesa em profundidade.
  const professor = await getSessionUser();
  if (!professor || professor.role !== 'trainer') {
    notFound();
  }

  const supabase = await createClient();

  // Aluno é do tenant do professor (RLS restringe ao tenant) e é student.
  const { data: aluno } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('user_id', id)
    .eq('role', 'student')
    .maybeSingle();

  if (!aluno) {
    notFound();
  }

  const resultado = await montarResumoSessao(sessionId, planId);

  if (resultado.tipo === 'nao-encontrada') {
    notFound();
  }

  // Guard de posse: a sessão existe sob RLS, mas precisa ser DESTE aluno.
  if (resultado.tipo === 'ok' && resultado.dados.studentId !== id) {
    notFound();
  }

  if (resultado.tipo === 'em-andamento') {
    const base = `/professor/alunos/${id}/treinar/${resultado.planId ?? planId}`;
    const destino =
      resultado.division !== null
        ? `${base}?divisao=${encodeURIComponent(resultado.division)}`
        : `${base}?divisao=${DIVISAO_SEM}`;
    redirect(destino);
  }

  return (
    <ResumoSessao {...resultado.dados} href={`/professor/alunos/${id}`} />
  );
}
