import { formatarData } from '@/lib/datas';
import { agruparPorDivisao, DIVISAO_SEM } from '@/lib/divisao';
import { DivisaoResumoCard } from '@/components/aluno/treinos/divisao-resumo-card';
import { DescansoResumoCard } from '@/components/aluno/treinos/descanso-resumo-card';

/** Item de ficha vindo do select (campos usados pela seção). */
interface ItemFicha {
  id: string;
  weekday?: number | null;
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
   * Quando `true`, alguma divisão desta ficha recebe o selo "Próximo".
   * `false` quando `proximoTreinoDaFicha` retornou `null` (ficha legada sem
   * treino hoje) — nesse caso nenhuma divisão recebe o selo.
   */
  marcarProximo: boolean;
  /**
   * Rótulo da divisão que deve receber o selo "Próximo" (ex.: 'A'), ou `null`
   * para o balde sem divisão. `undefined` = fichas legadas por dia (sem
   * divisão nomeada) → aplica o comportamento anterior (index 0).
   */
  proximaDivisao?: string | null;
  /**
   * Set das divisões (rótulo ou `null` para o balde) que têm sessão ABERTA
   * para esta ficha. Quando uma divisão está no set, exibe "Em andamento"
   * em vez de (ou com prioridade sobre) "Próximo".
   */
  sessoesAbertas?: Set<string | null>;
  /**
   * Quando `true` (FEAT-003), o próximo passo da rotação é um DESCANSO: injeta
   * o card "Hoje é descanso" no topo e NENHUM card de divisão recebe o selo
   * "Próximo" (o estado "Em andamento" é preservado). Default `false`.
   */
  descansoProximo?: boolean;
  /**
   * Índice do passo de descanso em `rotation_steps` (para o card confirmar o
   * descanso). Relevante só quando `descansoProximo === true`.
   */
  restStepIndex?: number | null;
}

/**
 * Uma SEÇÃO da lista de treinos: cabeçalho da ficha (nome + data de liberação +
 * nº de exercícios) e a lista de `DivisaoResumoCard` daquela ficha (uma por
 * divisão). Cada card navega ao detalhe filtrando pela divisão escolhida
 * (`?divisao=`); o balde "Divisão única" usa o sentinela `__sem__`. Com uma só
 * ficha na tela, o resultado é equivalente em conteúdo e layout ao anterior.
 */
export function FichaSecao({
  ficha,
  marcarProximo,
  proximaDivisao,
  sessoesAbertas = new Set(),
  descansoProximo = false,
  restStepIndex = null,
}: FichaSecaoProps) {
  const itens = ficha.workout_plan_items ?? [];
  const divisoes = agruparPorDivisao(itens, (item) => item.division ?? null);

  // Detecta se a ficha usa eixo divisão (pelo menos um item com divisão).
  const porDivisao = itens.some((item) => (item.division ?? null) !== null);

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
        {descansoProximo && restStepIndex !== null ? (
          <DescansoResumoCard planId={ficha.id} restStepIndex={restStepIndex} />
        ) : null}
        {divisoes.map((grupo, index) => {
          const grupos = Array.from(
            new Set(grupo.itens.flatMap((item) => gruposDoExercicio(item.exercises)))
          );
          // Eixo explícito no href: divisão nomeada → ?divisao=A; balde sem
          // divisão → sentinela __sem__ (nunca "sem query").
          const eixo = grupo.division ?? DIVISAO_SEM;

          // Chave de comparação da divisão neste card (null = balde sem divisão).
          const divKey = grupo.division;

          // "Em andamento": sessão aberta para esta divisão.
          const emAndamento = sessoesAbertas.has(divKey);

          // "Próximo": depende do eixo da ficha.
          // - Por divisão: marca o card cuja divisão bate com `proximaDivisao`.
          //   Quando `proximaDivisao` não foi passado (`undefined`) e a ficha é
          //   por divisão, cai no comportamento anterior (index 0).
          //   (null == null para o balde sem divisão)
          // - Legado por dia (proximaDivisao === undefined E não porDivisao): index 0.
          // FEAT-003: quando o próximo passo é descanso, nenhum card de divisão
          // recebe "Próximo" (o aviso vai no card de descanso no topo).
          let eProximo = false;
          if (marcarProximo && !descansoProximo) {
            if (porDivisao && proximaDivisao !== undefined) {
              eProximo = !emAndamento && divKey === proximaDivisao;
            } else {
              // Fichas legadas por dia OU chamadores sem proximaDivisao: index 0.
              eProximo = !emAndamento && index === 0;
            }
          }

          // CTA para execução quando em andamento (aponta direto para a execução).
          // Fichas legadas por dia NÃO usam ?divisao= na rota de execução —
          // precisariam de ?dia=N. Como não temos o weekday da sessão aberta,
          // o CTA de "Em andamento" para planos legados cai no detalhe da ficha
          // (hrefDetalhe), onde o aluno pode escolher o dia e retomar.
          const hrefDetalhe = `/aluno/treinos/${ficha.id}?divisao=${encodeURIComponent(eixo)}`;
          const hrefExecucao = porDivisao
            ? `/aluno/execucao/${ficha.id}?divisao=${encodeURIComponent(eixo)}`
            : hrefDetalhe;

          return (
            <DivisaoResumoCard
              key={grupo.division ?? 'sem-divisao'}
              letra={grupo.division}
              nome={grupos.length > 0 ? grupos.join(', ') : ''}
              grupos={grupos}
              proximo={eProximo}
              emAndamento={emAndamento}
              href={hrefDetalhe}
              ctaHref={emAndamento ? hrefExecucao : undefined}
            />
          );
        })}
      </div>
    </section>
  );
}
