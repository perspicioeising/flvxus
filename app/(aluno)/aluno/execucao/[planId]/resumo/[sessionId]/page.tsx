import { notFound, redirect } from 'next/navigation';

import { DIVISAO_SEM } from '@/lib/divisao';
import { montarResumoSessao } from '@/lib/treino/resumo-dados';
import { ResumoSessao } from '@/components/aluno/execucao/resumo-sessao';

/**
 * Resumo pós-treino (RSC) de uma sessão finalizada do ALUNO. Casca fina sobre
 * `montarResumoSessao` (lógica compartilhada com a rota-espelho do professor):
 * - `nao-encontrada` (inexistente/alheia sob RLS) → `notFound()`;
 * - `em-andamento` (sessão do aluno não finalizada) → `redirect` à execução
 *   preservando o eixo (mesma regra anterior com `DIVISAO_SEM`);
 * - `ok` → `ResumoSessao` com "Voltar" para os treinos do aluno.
 */
export default async function AlunoResumoSessaoPage({
  params,
}: {
  params: Promise<{ planId: string; sessionId: string }>;
}) {
  const { planId, sessionId } = await params;

  const resultado = await montarResumoSessao(sessionId, planId);

  if (resultado.tipo === 'nao-encontrada') {
    notFound();
  }

  if (resultado.tipo === 'em-andamento') {
    const base = `/aluno/execucao/${resultado.planId ?? planId}`;
    const destino =
      resultado.division !== null
        ? `${base}?divisao=${encodeURIComponent(resultado.division)}`
        : `${base}?divisao=${DIVISAO_SEM}`;
    redirect(destino);
  }

  return <ResumoSessao {...resultado.dados} href="/aluno/treinos" />;
}
