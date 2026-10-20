import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { WEEKDAY_LABEL } from '@/lib/semana';
import { EmptyState } from '@/components/patterns';
import {
  SessaoExecucao,
  type ItemExecucao,
} from '@/components/aluno/execucao/sessao-execucao';

/** Extrai o nome do exercício de um join `exercises` (array ou objeto). */
function nomeExercicio(exercises: unknown): string {
  const e = Array.isArray(exercises) ? exercises[0] : exercises;
  const nome = (e as { name: string | null } | null)?.name;
  return nome?.trim() || 'Exercício';
}

/** Converte o searchParam `?dia` num weekday válido (0..6) ou `null`. */
function parseDia(valor: string | string[] | undefined): number | null {
  const bruto = Array.isArray(valor) ? valor[0] : valor;
  if (bruto === undefined) return null;
  const n = Number(bruto);
  return Number.isInteger(n) && n >= 0 && n <= 6 ? n : null;
}

/**
 * Execução de uma ficha liberada. Carrega os itens do dia indicado por `?dia`
 * (senão, todos os itens da ficha) e entrega ao Client Component de execução. A
 * sessão NÃO é criada aqui — só ao confirmar o início (primeiro toque), para
 * não gravar sessão vazia ao abrir a tela. RLS limita a fichas `released` do
 * próprio aluno (vazio → 404).
 */
export default async function AlunoExecucaoFichaPage({
  params,
  searchParams,
}: {
  params: Promise<{ planId: string }>;
  searchParams: Promise<{ dia?: string | string[] }>;
}) {
  const { planId } = await params;
  const { dia } = await searchParams;
  const weekday = parseDia(dia);

  const supabase = await createClient();

  const { data: ficha } = await supabase
    .from('workout_plans')
    .select('id, name')
    .eq('id', planId)
    .eq('status', 'released')
    .maybeSingle();

  if (!ficha) {
    notFound();
  }

  let query = supabase
    .from('workout_plan_items')
    .select('id, weekday, order_index, sets, reps, rest_seconds, target_load, exercises(name)')
    .eq('plan_id', planId)
    .order('order_index', { ascending: true });

  if (weekday !== null) {
    query = query.eq('weekday', weekday);
  }

  const { data: itensData } = await query;

  const itens: ItemExecucao[] = (itensData ?? []).map((item) => ({
    id: item.id,
    nome: nomeExercicio(item.exercises),
    // Sem séries prescritas, assumimos 1 para que haja ao menos uma linha.
    sets: item.sets && item.sets > 0 ? item.sets : 1,
    reps: item.reps,
    cargaAlvo: item.target_load,
    descansoSegundos: item.rest_seconds,
  }));

  const subtitulo =
    weekday !== null ? WEEKDAY_LABEL[weekday] : 'Todos os exercícios da ficha';

  return (
    <section className="mx-auto w-full max-w-2xl space-y-6">
      <Link
        href={`/aluno/treinos/${ficha.id}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Voltar para a ficha
      </Link>

      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{ficha.name}</h1>
        <p className="text-sm text-muted-foreground">{subtitulo}</p>
      </header>

      {itens.length === 0 ? (
        <EmptyState
          title="Nenhum exercício para este dia"
          description="Não há exercícios prescritos para o dia selecionado nesta ficha."
        />
      ) : (
        <SessaoExecucao planId={ficha.id} itens={itens} />
      )}
    </section>
  );
}
