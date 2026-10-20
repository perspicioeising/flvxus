import Link from 'next/link';
import { HeartPulse, Plus } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import {
  intervaloPagina,
  normalizarPagina,
  normalizarTamanho,
  totalPaginas,
} from '@/lib/paginacao';
import { EmptyState, ErrorState } from '@/components/patterns';
import { Button } from '@/components/ui/button';
import type { AssessmentProtocol } from '@/types/database.types';
import { PROTOCOLOS } from '@/schemas/avaliacao';
import { AvaliacoesFilters } from '@/components/professor/avaliacoes/avaliacoes-filters';
import { AvaliacoesPagination } from '@/components/professor/avaliacoes/avaliacoes-pagination';
import {
  AvaliacaoCard,
  type AvaliacaoResumo,
} from '@/components/professor/avaliacoes/avaliacao-card';

type SearchParams = Record<string, string | string[] | undefined>;

function umParam(valor: string | string[] | undefined): string | undefined {
  return Array.isArray(valor) ? valor[0] : valor;
}

export default async function AvaliacoesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;

  const q = (umParam(sp.q) ?? '').trim();
  const protocolParam = umParam(sp.protocol);
  const protocol =
    protocolParam && (PROTOCOLOS as readonly string[]).includes(protocolParam)
      ? (protocolParam as AssessmentProtocol)
      : undefined;
  const page = normalizarPagina(umParam(sp.page));
  const pageSize = normalizarTamanho(umParam(sp.pageSize));
  const { from, to } = intervaloPagina(page, pageSize);

  const supabase = await createClient();

  // Busca textual é por aluno: resolvemos os ids de alunos que casam com `q`.
  let idsAlunoFiltro: string[] | null = null;
  if (q) {
    const { data: alunos } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('role', 'student')
      .or(`full_name.ilike.%${q}%,email.ilike.%${q}%`);
    idsAlunoFiltro = (alunos ?? []).map((a) => a.user_id);
  }

  // Sem alunos casando com a busca → lista vazia sem ir ao banco.
  if (idsAlunoFiltro && idsAlunoFiltro.length === 0) {
    return (
      <PaginaAvaliacoes q={q} protocol={protocol ?? ''}>
        <EmptyState
          icon={HeartPulse}
          title="Nenhuma avaliação encontrada"
          description="Nenhum aluno corresponde à busca. Ajuste os filtros."
        />
      </PaginaAvaliacoes>
    );
  }

  let query = supabase
    .from('physical_assessments')
    .select('id, student_id, assessed_at, protocol, weight_kg, bmi, body_fat_pct', {
      count: 'exact',
    });

  if (protocol) {
    query = query.eq('protocol', protocol);
  }
  if (idsAlunoFiltro) {
    query = query.in('student_id', idsAlunoFiltro);
  }

  const { data, count, error } = await query
    .order('assessed_at', { ascending: false })
    .range(from, to);

  if (error) {
    return (
      <PaginaAvaliacoes q={q} protocol={protocol ?? ''}>
        <ErrorState
          title="Não foi possível carregar as avaliações"
          description="Ocorreu um erro ao buscar a lista. Tente novamente."
        />
      </PaginaAvaliacoes>
    );
  }

  // Resolve os nomes dos alunos das avaliações da página (um único select).
  const idsPagina = Array.from(new Set((data ?? []).map((a) => a.student_id)));
  const nomePorId = new Map<string, string>();
  if (idsPagina.length > 0) {
    const { data: perfis } = await supabase
      .from('profiles')
      .select('user_id, full_name, email')
      .in('user_id', idsPagina);
    for (const p of perfis ?? []) {
      nomePorId.set(p.user_id, p.full_name ?? p.email ?? 'Aluno sem nome');
    }
  }

  const avaliacoes: AvaliacaoResumo[] = (data ?? []).map((a) => ({
    id: a.id,
    assessed_at: a.assessed_at,
    protocol: a.protocol,
    weight_kg: a.weight_kg,
    bmi: a.bmi,
    body_fat_pct: a.body_fat_pct,
    alunoNome: nomePorId.get(a.student_id) ?? 'Aluno sem nome',
  }));

  const paramsParaLinks = {
    q: q || undefined,
    protocol: protocol ?? undefined,
    pageSize: String(pageSize),
  };

  return (
    <PaginaAvaliacoes q={q} protocol={protocol ?? ''}>
      {avaliacoes.length === 0 ? (
        <EmptyAvaliacoes temFiltro={Boolean(q || protocol)} />
      ) : (
        <>
          <ul className="space-y-3">
            {avaliacoes.map((a) => (
              <li key={a.id}>
                <AvaliacaoCard avaliacao={a} />
              </li>
            ))}
          </ul>

          <AvaliacoesPagination
            page={page}
            totalPages={totalPaginas(count, pageSize)}
            total={count ?? 0}
            pageSize={pageSize}
            searchParams={paramsParaLinks}
          />
        </>
      )}
    </PaginaAvaliacoes>
  );
}

/** Casca da página (cabeçalho + filtros), reutilizada nos estados de vazio/erro. */
function PaginaAvaliacoes({
  q,
  protocol,
  children,
}: {
  q: string;
  protocol: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto w-full max-w-4xl space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Avaliações físicas</h1>
          <p className="text-sm text-muted-foreground">
            Registre avaliações, acompanhe o histórico e a evolução de cada aluno.
          </p>
        </div>
        <Button asChild className="min-h-11">
          <Link href="/professor/avaliacoes/nova">
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            Nova avaliação
          </Link>
        </Button>
      </header>

      <AvaliacoesFilters initialQuery={q} initialProtocol={protocol} />

      {children}
    </section>
  );
}

function EmptyAvaliacoes({ temFiltro }: { temFiltro: boolean }) {
  if (temFiltro) {
    return (
      <EmptyState
        icon={HeartPulse}
        title="Nenhuma avaliação encontrada"
        description="Ajuste a busca ou o filtro de protocolo para ver mais resultados."
      />
    );
  }
  return (
    <div className="flex flex-col items-center gap-4">
      <EmptyState
        icon={HeartPulse}
        title="Nenhuma avaliação registrada"
        description="Registre a primeira avaliação física para começar a acompanhar a evolução."
      />
      <Button asChild className="min-h-11">
        <Link href="/professor/avaliacoes/nova">
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
          Nova avaliação
        </Link>
      </Button>
    </div>
  );
}
