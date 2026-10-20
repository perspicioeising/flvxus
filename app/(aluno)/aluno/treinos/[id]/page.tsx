import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { agruparPorDia } from '@/lib/semana';
import { formatarData } from '@/lib/datas';
import { DiaLista, type ItemDia } from '@/components/aluno/treinos/dia-lista';

/** Extrai nome e grupos musculares de um join `exercises` (array ou objeto). */
function dadosExercicio(exercises: unknown): { nome: string; grupos: string[] } {
  const e = Array.isArray(exercises) ? exercises[0] : exercises;
  const registro = e as { name: string | null; muscle_groups: string[] | null } | null;
  return {
    nome: registro?.name?.trim() || 'Exercício',
    grupos: registro?.muscle_groups ?? [],
  };
}

/**
 * Detalhe de uma ficha liberada: os exercícios agrupados por dia da semana
 * (pt-BR), com séries×reps, carga alvo, descanso e observações. O RLS limita a
 * fichas `released` do próprio aluno — vazio vira 404. Cada dia oferece um
 * botão "Iniciar sessão" que leva à execução daquele dia.
 */
export default async function AlunoFichaDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: ficha } = await supabase
    .from('workout_plans')
    .select('id, name, released_at')
    .eq('id', id)
    .eq('status', 'released')
    .maybeSingle();

  if (!ficha) {
    notFound();
  }

  const { data: itensData } = await supabase
    .from('workout_plan_items')
    .select(
      'id, weekday, order_index, sets, reps, rest_seconds, target_load, notes, exercises(name, muscle_groups)'
    )
    .eq('plan_id', id)
    .order('weekday', { ascending: true, nullsFirst: false })
    .order('order_index', { ascending: true });

  const itens = itensData ?? [];

  const grupos = agruparPorDia(itens, (item) => item.weekday);

  return (
    <section className="mx-auto w-full max-w-2xl space-y-6">
      <Link
        href="/aluno/treinos"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Voltar para treinos
      </Link>

      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{ficha.name}</h1>
        <p className="text-sm text-muted-foreground">
          Liberada em {formatarData(ficha.released_at)}
        </p>
      </header>

      {grupos.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Esta ficha ainda não tem exercícios cadastrados.
        </p>
      ) : (
        <div className="space-y-4">
          {grupos.map((grupo) => {
            const itensDia: ItemDia[] = grupo.itens.map((item) => {
              const { nome, grupos: gruposMusculares } = dadosExercicio(item.exercises);
              return {
                id: item.id,
                nome,
                gruposMusculares,
                sets: item.sets,
                reps: item.reps,
                cargaAlvo: item.target_load,
                descansoSegundos: item.rest_seconds,
                observacoes: item.notes,
              };
            });

            return (
              <DiaLista
                key={grupo.weekday ?? 'sem-dia'}
                rotulo={grupo.rotulo}
                weekday={grupo.weekday}
                planId={ficha.id}
                itens={itensDia}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
