import Link from 'next/link';
import { ClipboardList, Plus } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { EmptyState, ErrorState } from '@/components/patterns';
import { Button } from '@/components/ui/button';
import { FichaCard } from '@/components/professor/treinos/ficha-card';
import { ClonarFicha } from '@/components/professor/treinos/clonar-ficha';
import { CriarDeModelo } from '@/components/professor/treinos/criar-de-modelo';
import { SugerirTreinoIa } from '@/components/professor/ia/sugerir-treino';
import type { PlanStatus } from '@/types/database.types';

/**
 * Listagem de FICHAS por aluno (`workout_plans`). Leitura via RSC (RLS entrega
 * só as fichas do tenant/professor). Oferece criar do zero ou a partir de um
 * modelo.
 */
export default async function TreinosPage() {
  const supabase = await createClient();

  const [{ data: fichasData, error }, { data: modelosData }, { data: alunosData }] =
    await Promise.all([
      supabase
        .from('workout_plans')
        .select(
          'id, name, status, scheduled_release_at, profiles!workout_plans_student_id_fkey(full_name)'
        )
        .order('created_at', { ascending: false }),
      supabase
        .from('workouts')
        .select('id, name')
        .eq('is_template', true)
        .order('name', { ascending: true }),
      supabase
        .from('profiles')
        .select('user_id, full_name')
        .eq('role', 'student')
        .order('full_name', { ascending: true }),
    ]);

  const fichas = (fichasData ?? []).map((f) => ({
    id: f.id,
    name: f.name,
    status: f.status as PlanStatus,
    scheduledReleaseAt: f.scheduled_release_at,
    alunoNome:
      (f.profiles as unknown as { full_name: string | null } | null)?.full_name ?? null,
  }));

  const modelos = modelosData ?? [];
  const alunos = alunosData ?? [];

  return (
    <section className="mx-auto w-full max-w-4xl space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-black uppercase leading-[0.95] tracking-tight text-foreground md:text-5xl">Treinos</h1>
          <p className="text-sm text-muted-foreground">
            Fichas de treino por aluno. Só fichas liberadas ficam visíveis ao aluno.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <SugerirTreinoIa alunos={alunos} />
          <CriarDeModelo modelos={modelos} alunos={alunos} />
          <Button asChild className="min-h-11">
            <Link href="/professor/treinos/nova">
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
              Nova ficha
            </Link>
          </Button>
        </div>
      </header>

      {alunos.length === 0 ? (
        <p className="rounded-xl border border-border bg-muted/50 p-3 text-sm text-muted-foreground">
          Para montar uma ficha você precisa de um aluno.{' '}
          <Link href="/professor/alunos/novo" className="font-medium text-foreground underline">
            Cadastre um aluno
          </Link>{' '}
          e o botão “Criar a partir de modelo” será liberado.
        </p>
      ) : modelos.length === 0 ? (
        <p className="rounded-xl border border-border bg-muted/50 p-3 text-sm text-muted-foreground">
          Você ainda não tem modelos de treino.{' '}
          <Link href="/professor/modelos-treino/novo" className="font-medium text-foreground underline">
            Crie um modelo
          </Link>{' '}
          para reaproveitá-lo em várias fichas.
        </p>
      ) : null}

      {error ? (
        <ErrorState
          title="Não foi possível carregar as fichas"
          description="Ocorreu um erro ao buscar as fichas. Tente novamente."
        />
      ) : fichas.length === 0 ? (
        <div className="flex flex-col items-center gap-4">
          <EmptyState
            icon={ClipboardList}
            title="Nenhuma ficha ainda"
            description="Crie a primeira ficha de treino para um aluno, do zero ou a partir de um modelo."
          />
          <Button asChild className="min-h-11">
            <Link href="/professor/treinos/nova">
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
              Nova ficha
            </Link>
          </Button>
        </div>
      ) : (
        <ul className="space-y-3">
          {fichas.map((ficha) => (
            <li key={ficha.id} className="relative">
              <FichaCard ficha={ficha} />
              {/* Ação discreta no canto do card; irmã do Link (não aninhada),
                  então clicar aqui abre o diálogo sem navegar e clicar no
                  restante do card abre o detalhe. */}
              <div className="absolute right-1 top-1">
                <ClonarFicha
                  sourcePlanId={ficha.id}
                  sourceName={ficha.name}
                  alunos={alunos}
                  variant="item"
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
