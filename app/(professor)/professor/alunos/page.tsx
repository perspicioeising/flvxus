import Link from 'next/link';
import { UserPlus, Users } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import {
  intervaloPagina,
  normalizarPagina,
  normalizarTamanho,
  totalPaginas,
} from '@/lib/paginacao';
import { EmptyState, ErrorState } from '@/components/patterns';
import { Button } from '@/components/ui/button';
import type { StudentStatus } from '@/types/database.types';
import { StudentCard } from '@/components/professor/alunos/student-card';
import { StudentsFilters } from '@/components/professor/alunos/students-filters';
import { StudentsPagination } from '@/components/professor/alunos/students-pagination';

/** Status aceitos como filtro (demais valores da URL são ignorados). */
const STATUS_VALIDOS: StudentStatus[] = ['active', 'inactive', 'pending', 'archived'];

type SearchParams = Record<string, string | string[] | undefined>;

/** Lê um parâmetro único, ignorando arrays (ex.: `?q=a&q=b`). */
function umParam(valor: string | string[] | undefined): string | undefined {
  return Array.isArray(valor) ? valor[0] : valor;
}

export default async function AlunosPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;

  const q = (umParam(sp.q) ?? '').trim();
  const statusParam = umParam(sp.status);
  const status =
    statusParam && STATUS_VALIDOS.includes(statusParam as StudentStatus)
      ? (statusParam as StudentStatus)
      : undefined;
  const page = normalizarPagina(umParam(sp.page));
  const pageSize = normalizarTamanho(umParam(sp.pageSize));
  const { from, to } = intervaloPagina(page, pageSize);

  const supabase = await createClient();

  // RLS filtra tenant/papel; aqui só restringimos a alunos e aos filtros da UI.
  let query = supabase
    .from('profiles')
    .select('user_id, full_name, email, avatar_url, status', { count: 'exact' })
    .eq('role', 'student');

  if (q) {
    query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%`);
  }
  if (status) {
    query = query.eq('status', status);
  }

  const { data, count, error } = await query
    .order('full_name', { ascending: true })
    .range(from, to);

  const paramsParaLinks = {
    q: q || undefined,
    status: status ?? undefined,
    pageSize: String(pageSize),
  };

  return (
    <section className="mx-auto w-full max-w-4xl space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Alunos</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie seus alunos, convide novos e acompanhe o status de cada um.
          </p>
        </div>
        <Button asChild className="min-h-11">
          <Link href="/professor/alunos/novo">
            <UserPlus className="mr-2 h-4 w-4" aria-hidden="true" />
            Convidar aluno
          </Link>
        </Button>
      </header>

      <StudentsFilters initialQuery={q} initialStatus={status ?? ''} />

      {error ? (
        <ErrorState
          title="Não foi possível carregar os alunos"
          description="Ocorreu um erro ao buscar a lista. Tente novamente."
        />
      ) : !data || data.length === 0 ? (
        <EmptyStateAlunos temFiltro={Boolean(q || status)} />
      ) : (
        <>
          <ul className="space-y-3">
            {data.map((aluno) => (
              <li key={aluno.user_id}>
                <StudentCard aluno={aluno} />
              </li>
            ))}
          </ul>

          <StudentsPagination
            page={page}
            totalPages={totalPaginas(count, pageSize)}
            total={count ?? 0}
            pageSize={pageSize}
            searchParams={paramsParaLinks}
          />
        </>
      )}
    </section>
  );
}

/** Estado vazio: distingue "sem alunos ainda" de "sem resultados para o filtro". */
function EmptyStateAlunos({ temFiltro }: { temFiltro: boolean }) {
  if (temFiltro) {
    return (
      <EmptyState
        icon={Users}
        title="Nenhum aluno encontrado"
        description="Ajuste a busca ou o filtro de status para ver mais resultados."
      />
    );
  }
  return (
    <div className="flex flex-col items-center gap-4">
      <EmptyState
        icon={Users}
        title="Você ainda não tem alunos"
        description="Convide seu primeiro aluno para começar a acompanhar treinos, avaliações e dieta."
      />
      <Button asChild className="min-h-11">
        <Link href="/professor/alunos/novo">
          <UserPlus className="mr-2 h-4 w-4" aria-hidden="true" />
          Convidar aluno
        </Link>
      </Button>
    </div>
  );
}
