import { History } from 'lucide-react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  intervaloPagina,
  totalPaginas,
  type IntervaloPagina,
} from '@/lib/paginacao';
import { listarHistorico } from '@/lib/treino/resumo-dados';
import { ListaHistorico } from '@/components/aluno/execucao/lista-historico';
import { HistoricoPagination } from '@/components/aluno/execucao/historico-pagination';

/**
 * Seção "Histórico" da ficha do aluno (lado professor). Server Component que lê,
 * sob RLS via `createClient()` em `listarHistorico`, as sessões CONCLUÍDAS do
 * aluno (visibilidade herdada do cadastro do aluno — Fase 3). Reaproveita o
 * cartão apresentacional `ListaHistorico`, variando só o href de "Ver detalhes"
 * (rota-espelho de resumo no professor).
 *
 * A paginação usa searchParams DEDICADOS `?hist_page=`/`?hist_size=` já
 * resolvidos pelo `page.tsx` do aluno e repassados como `page`/`pageSize`, para
 * não colidir com outros paginadores da página.
 */
export async function SecaoHistorico({
  studentId,
  page,
  pageSize,
}: {
  studentId: string;
  page: number;
  pageSize: number;
}) {
  const intervalo: IntervaloPagina = intervaloPagina(page, pageSize);
  const { itens, total } = await listarHistorico({ studentId, intervalo });
  const totalPages = totalPaginas(total, pageSize);

  return (
    <Card id="historico" className="scroll-mt-20 rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-extrabold">
          <History className="h-5 w-5 text-primary" aria-hidden="true" />
          Histórico
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ListaHistorico
          itens={itens}
          hrefDetalhes={(item) =>
            `/professor/alunos/${studentId}/execucao/${item.planId}/resumo/${item.sessionId}`
          }
        />

        <HistoricoPagination
          page={page}
          totalPages={totalPages}
          total={total}
          pageSize={pageSize}
          basePath={`/professor/alunos/${studentId}`}
          paramPagina="hist_page"
          paramsExtra={{ hist_size: String(pageSize) }}
          hash="#historico"
        />
      </CardContent>
    </Card>
  );
}
