import { redirect } from 'next/navigation';

import {
  intervaloPagina,
  normalizarPagina,
  normalizarTamanho,
  totalPaginas,
} from '@/lib/paginacao';
import { listarHistorico } from '@/lib/treino/resumo-dados';
import { PageHeader } from '@/components/patterns';
import { ListaHistorico } from '@/components/aluno/execucao/lista-historico';
import { HistoricoPagination } from '@/components/aluno/execucao/historico-pagination';

type SearchParams = Record<string, string | string[] | undefined>;

/** Lê um parâmetro único, ignorando arrays (ex.: `?page=a&page=b`). */
function umParam(valor: string | string[] | undefined): string | undefined {
  return Array.isArray(valor) ? valor[0] : valor;
}

/**
 * Histórico de treinos do ALUNO (RSC). Lista as sessões CONCLUÍDAS do próprio
 * aluno (sem `studentId` → a RLS restringe ao dono), paginadas server-side pelo
 * padrão do projeto (`?page=&pageSize=` via `lib/paginacao.ts`). Cada item leva
 * à MESMA tela de resumo da sessão.
 */
export default async function AlunoHistoricoPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const page = normalizarPagina(umParam(sp.page));
  const pageSize = normalizarTamanho(umParam(sp.pageSize));
  const intervalo = intervaloPagina(page, pageSize);

  const { itens, total } = await listarHistorico({ intervalo });

  // page > 1 com janela vazia ⇒ offset além do fim: volta à página 1.
  if (itens.length === 0 && page > 1) {
    const params = new URLSearchParams();
    params.set('pageSize', String(pageSize));
    redirect(`/aluno/historico?${params.toString()}`);
  }

  const totalPages = totalPaginas(total, pageSize);

  return (
    <section className="mx-auto w-full max-w-2xl space-y-6">
      <PageHeader
        emphasis="caps"
        title="Histórico"
        subtitle="Seus treinos concluídos, do mais recente ao mais antigo."
      />

      <ListaHistorico
        itens={itens}
        hrefDetalhes={(item) =>
          `/aluno/execucao/${item.planId}/resumo/${item.sessionId}`
        }
      />

      <HistoricoPagination
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={pageSize}
        basePath="/aluno/historico"
        paramPagina="page"
        paramsExtra={{ pageSize: String(pageSize) }}
      />
    </section>
  );
}
