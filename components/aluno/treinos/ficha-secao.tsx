import { formatarData } from '@/lib/datas';
import { agruparPorDivisao, DIVISAO_SEM } from '@/lib/divisao';
import { DivisaoResumoCard } from '@/components/aluno/treinos/divisao-resumo-card';

/** Item de ficha vindo do select (campos usados pela seção). */
interface ItemFicha {
  id: string;
  division: string | null;
  order_index: number;
  sets: number | null;
  reps: string | null;
  exercises: unknown;
}

/** Uma ficha liberada com seus itens. */
export interface FichaSecaoDados {
  id: string;
  name: string;
  released_at: string | null;
  workout_plan_items: ItemFicha[] | null;
}

/** Extrai os grupos musculares de um join `exercises` (array ou objeto). */
function gruposDoExercicio(exercises: unknown): string[] {
  const e = Array.isArray(exercises) ? exercises[0] : exercises;
  const registro = e as { muscle_groups: string[] | null } | null;
  return registro?.muscle_groups ?? [];
}

export interface FichaSecaoProps {
  /** A ficha a renderizar como seção. */
  ficha: FichaSecaoDados;
  /**
   * Quando `true`, a primeira divisão desta ficha recebe o selo "Próximo".
   * Só a ficha mais recente passa `true` (uma única divisão com o selo na tela).
   */
  marcarProximo: boolean;
}

/**
 * Uma SEÇÃO da lista de treinos: cabeçalho da ficha (nome + data de liberação +
 * nº de exercícios) e a lista de `DivisaoResumoCard` daquela ficha (uma por
 * divisão). Cada card navega ao detalhe filtrando pela divisão escolhida
 * (`?divisao=`); o balde "Divisão única" usa o sentinela `__sem__`. Com uma só
 * ficha na tela, o resultado é equivalente em conteúdo e layout ao anterior.
 */
export function FichaSecao({ ficha, marcarProximo }: FichaSecaoProps) {
  const itens = ficha.workout_plan_items ?? [];
  const divisoes = agruparPorDivisao(itens, (item) => item.division ?? null);

  return (
    <section className="space-y-3">
      <div className="rounded-2xl border border-border bg-card p-4">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">
          Ficha ativa
        </p>
        <p className="mt-1 text-lg font-bold text-foreground">{ficha.name}</p>
        <p className="text-sm text-muted-foreground">
          Liberada em {formatarData(ficha.released_at)} ·{' '}
          {itens.length === 1 ? '1 exercício' : `${itens.length} exercícios`}
        </p>
      </div>

      <div className="space-y-3">
        {divisoes.map((grupo, index) => {
          const grupos = Array.from(
            new Set(grupo.itens.flatMap((item) => gruposDoExercicio(item.exercises)))
          );
          // Eixo explícito no href: divisão nomeada → ?divisao=A; balde sem
          // divisão → sentinela __sem__ (nunca "sem query").
          const eixo = grupo.division ?? DIVISAO_SEM;
          return (
            <DivisaoResumoCard
              key={grupo.division ?? 'sem-divisao'}
              letra={grupo.division}
              nome={grupos.length > 0 ? grupos.join(', ') : ''}
              grupos={grupos}
              proximo={marcarProximo && index === 0}
              href={`/aluno/treinos/${ficha.id}?divisao=${encodeURIComponent(eixo)}`}
            />
          );
        })}
      </div>
    </section>
  );
}
