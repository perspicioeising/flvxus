/**
 * Lógica PURA do "próximo treino" de uma ficha para a tela de início do aluno
 * (sem UI, sem Supabase). Deriva, para cada ficha liberada, qual treino aparece
 * no cartão: a primeira divisão (ficha por divisão) ou o treino do dia de hoje
 * (ficha legada por dia). Testável em tests/unit/treino-inicio.test.ts.
 */

import { agruparPorDivisao, DIVISAO_SEM } from '@/lib/divisao';
import { weekdayAtual } from '@/lib/semana';

/** Exercício resumido para o cartão de "próximo treino". */
export interface ExercicioHojeDados {
  id: string;
  nome: string;
  sets: number | null;
  reps: string | null;
}

/** Item de ficha com os campos usados pela derivação. */
export interface ItemFichaInicio {
  id: string;
  weekday: number | null;
  division: string | null;
  order_index: number;
  sets: number | null;
  reps: string | null;
  /** Join `exercises` (array ou objeto), do qual extraímos nome e grupos. */
  exercises: unknown;
}

/** Uma ficha liberada com seus itens. */
export interface FichaInicio {
  id: string;
  name: string;
  workout_plan_items: ItemFichaInicio[] | null;
  /**
   * Sequência de rotação (FEAT-003). `null`/ausente = ficha legada: a rotação
   * derivada atual permanece intacta (critério 10). Lida da coluna jsonb.
   */
  rotation_steps?: PassoRotacao[] | null;
}

/**
 * Último evento concluído da ficha para resolver o ponto atual da rotação
 * EXPLÍCITA (`rotation_steps`). A page cruza, sob RLS:
 *   - `ultimaDivisao`: label + `finished_at` da última `workout_sessions`;
 *   - `ultimoDescanso`: `rest_step_index` + `completed_at` do último descanso
 *     cumprido (`workout_plan_rest_completions`).
 * O passo atual é o MAIS RECENTE entre os dois (desempate por timestamp).
 */
export interface UltimoEventoRotacao {
  ultimaDivisao?: { label: string | null; finishedAt: string } | null;
  ultimoDescanso?: { restStepIndex: number; completedAt: string } | null;
}

/** "Próximo treino" derivado de uma ficha. */
export interface ProximoTreino {
  /** Letra da divisão (ex.: 'A') ou `null` (balde sem divisão / legado). */
  divisionLabel: string | null;
  /** Grupos musculares (união dos grupos dos exercícios do treino). */
  grupos: string[];
  /** Exercícios prescritos do treino, ordenados por `order_index`. */
  exercicios: ExercicioHojeDados[];
  /** Deep-link do CTA, com o eixo explícito (`?divisao=`/`?dia=`). */
  href: string;
  /**
   * `true` quando o próximo passo da rotação é um DESCANSO (só em fichas com
   * `rotation_steps`). Nesse caso `exercicios`/`grupos` ficam vazios e
   * `divisionLabel` é `null`. Default `false` (fichas legadas/sem rotação).
   */
  descanso: boolean;
  /**
   * Índice do passo de descanso em `rotation_steps` quando `descanso === true`
   * (para o aluno confirmar o descanso cumprido); `null` caso contrário.
   */
  restStepIndex: number | null;
}

/** Um passo da sequência de rotação (divisão nomeada ou descanso). */
export type PassoRotacao =
  | { type: 'division'; label: string }
  | { type: 'rest' };

/**
 * Decide o PRÓXIMO passo na rotação (divisão ou descanso) a partir dos `passos`
 * e do ÍNDICE do último passo concluído (`ultimoPassoConcluido`). Função PURA.
 *
 * - lista vazia → `null`;
 * - sem último passo (`null`) → o primeiro passo (índice 0);
 * - com último passo → o SEGUINTE, com wrap-around `(idx + 1) % n`;
 * - índice fora de faixa (ficha reeditada) → fallback no primeiro passo.
 *
 * Retorna `{ step, index }` para o chamador saber qual passo e sua posição.
 */
export function proximoPassoNaRotacao(
  passos: PassoRotacao[],
  ultimoPassoConcluido: number | null
): { step: PassoRotacao; index: number } | null {
  if (passos.length === 0) return null;
  if (ultimoPassoConcluido === null) {
    return { step: passos[0], index: 0 };
  }
  if (ultimoPassoConcluido < 0 || ultimoPassoConcluido >= passos.length) {
    return { step: passos[0], index: 0 };
  }
  const index = (ultimoPassoConcluido + 1) % passos.length;
  return { step: passos[index], index };
}

/**
 * Decide a PRÓXIMA divisão na rotação a partir dos rótulos da ficha (na ordem
 * em que `agruparPorDivisao` já os entrega: pt-BR) e do rótulo da ÚLTIMA divisão
 * CONCLUÍDA (`division` da última `workout_sessions` finalizada, ou `null` se não
 * houver histórico). Função PURA (sem I/O) para ser testável.
 *
 * Regra:
 * - lista vazia → `null` (sem divisões para rodar);
 * - sem histórico (`ultimaConcluida === null`) → a primeira divisão (preserva o
 *   comportamento de aluno novo: começa no A);
 * - com histórico → a divisão SEGUINTE à última concluída, com wrap-around
 *   (`(idx + 1) % n`), caindo na primeira depois da última (ciclo A→B→C→A);
 * - se a última concluída NÃO existe mais na ficha (ficha reeditada) → fallback
 *   na primeira divisão.
 *
 * Observação: com uma única divisão, `(0 + 1) % 1 === 0` → sempre ela mesma.
 * A ordem usada é a REAL dos rótulos da ficha; não assume alfabeto fixo A/B/C.
 */
export function proximaDivisaoNaRotacao(
  divisoes: string[],
  ultimaConcluida: string | null
): string | null {
  if (divisoes.length === 0) return null;
  if (ultimaConcluida === null) return divisoes[0];
  const idx = divisoes.indexOf(ultimaConcluida);
  // Última divisão não existe mais na ficha → fallback na primeira.
  if (idx === -1) return divisoes[0];
  return divisoes[(idx + 1) % divisoes.length];
}

/** Extrai nome e grupos musculares de um join `exercises` (array ou objeto). */
function infoExercicio(exercises: unknown): { nome: string; grupos: string[] } {
  const e = Array.isArray(exercises) ? exercises[0] : exercises;
  const nome = (e as { name: string | null } | null)?.name;
  const grupos = (e as { muscle_groups: string[] | null } | null)?.muscle_groups;
  return {
    nome: nome?.trim() || 'Exercício',
    grupos: Array.isArray(grupos) ? grupos : [],
  };
}

/**
 * Resolve o "próximo treino" de UMA ficha. Dois ramos distintos:
 *
 * - Ficha POR DIVISÃO (qualquer item com `division` não-nula) → avança pela
 *   ROTAÇÃO: a divisão SEGUINTE à última concluída (`ultimaConcluida`), com
 *   wrap-around (A→B→C→A). Sem histórico → primeira divisão. Monta `?divisao=`
 *   (sentinela `__sem__` no balde sem divisão). Nunca retorna `null`.
 *
 * - Ficha LEGADA POR DIA (nenhuma divisão) → itens do weekday atual, com
 *   `?dia=N`. `ultimaConcluida` é IGNORADA neste ramo (comportamento por dia
 *   preservado byte-a-byte). Retorna `null` quando NÃO há treino para hoje — a
 *   UI então mostra o cartão "sem treino para hoje", nunca ocultando a ficha
 *   (MEDIUM #2).
 *
 * `ultimaConcluida` identifica a última `workout_sessions` finalizada desta
 * ficha (a page faz a leitura sob RLS e repassa):
 * - `undefined` → NÃO há histórico (ou ficha por dia) → começa na primeira;
 * - `null`      → a última sessão concluída foi o balde SEM divisão;
 * - `'A'`…      → a última divisão concluída foi esse rótulo.
 *
 * `referencia` permite testar o dia de hoje de forma determinística.
 */
export function proximoTreinoDaFicha(
  ficha: FichaInicio,
  referencia: Date = new Date(),
  ultimaConcluida: string | null | undefined = undefined,
  ultimoEvento?: UltimoEventoRotacao
): ProximoTreino | null {
  const itens = ficha.workout_plan_items ?? [];
  const porDivisao = itens.some((item) => (item.division ?? null) !== null);

  // RAMO ROTAÇÃO EXPLÍCITA (FEAT-003): só quando `rotation_steps` está presente
  // e não-nulo. Fichas legadas (null/ausente) NUNCA entram aqui — a rotação
  // derivada atual segue byte-a-byte (critério 10).
  const steps = ficha.rotation_steps;
  if (porDivisao && steps !== undefined && steps !== null && steps.length > 0) {
    return proximoComRotacaoExplicita(ficha, itens, steps, ultimoEvento);
  }

  let itensTreino: ItemFichaInicio[] = [];
  let divisionLabel: string | null = null;

  if (porDivisao) {
    // Ramo POR DIVISÃO: rotaciona a partir da última divisão concluída.
    const grupos = agruparPorDivisao(itens, (item) => item.division ?? null);
    // Rótulos na ordem real da ficha (pt-BR + balde sem divisão por último).
    const rotulos = grupos.map((g) => g.division ?? DIVISAO_SEM);
    // Normaliza o histórico para o espaço de rótulos: sem histórico → null
    // (primeira divisão); sessão sem divisão (`null`) → sentinela do balde.
    const referenciaRotacao =
      ultimaConcluida === undefined
        ? null
        : ultimaConcluida === null
          ? DIVISAO_SEM
          : ultimaConcluida;
    const proximoRotulo = proximaDivisaoNaRotacao(rotulos, referenciaRotacao);
    const escolhido =
      proximoRotulo !== null
        ? grupos.find((g) => (g.division ?? DIVISAO_SEM) === proximoRotulo)
        : undefined;
    const primeiro = escolhido ?? grupos[0];
    if (primeiro) {
      itensTreino = primeiro.itens;
      divisionLabel = primeiro.division;
    }
  } else {
    const weekday = weekdayAtual(referencia);
    itensTreino = itens.filter((item) => item.weekday === weekday);
    if (itensTreino.length === 0) return null;
  }

  const itensOrdenados = [...itensTreino].sort(
    (a, b) => a.order_index - b.order_index
  );

  const exercicios: ExercicioHojeDados[] = itensOrdenados.map((item) => ({
    id: item.id,
    nome: infoExercicio(item.exercises).nome,
    sets: item.sets,
    reps: item.reps,
  }));

  const grupos = Array.from(
    new Set(itensOrdenados.flatMap((item) => infoExercicio(item.exercises).grupos))
  );

  let href = `/aluno/treinos/${ficha.id}`;
  if (exercicios.length > 0) {
    if (porDivisao) {
      const eixo = divisionLabel ?? DIVISAO_SEM;
      href = `/aluno/execucao/${ficha.id}?divisao=${encodeURIComponent(eixo)}`;
    } else {
      href = `/aluno/execucao/${ficha.id}?dia=${weekdayAtual(referencia)}`;
    }
  }

  return { divisionLabel, grupos, exercicios, href, descanso: false, restStepIndex: null };
}

/**
 * Monta o "próximo treino" de uma ficha POR DIVISÃO com rotação EXPLÍCITA
 * (`rotation_steps`). Resolve o ponto atual cruzando os dois últimos eventos:
 *   - última divisão concluída → `findIndex` do passo `division` com esse label
 *     (inequívoco: R1 garante label único na sequência);
 *   - último descanso cumprido → o `rest_step_index` direto.
 * O passo "mais recente" (desempate por timestamp) define `ultimoPassoConcluido`;
 * daí `proximoPassoNaRotacao` avança (wrap-around). Se o próximo é descanso,
 * retorna `descanso: true` + `restStepIndex`; se é divisão, monta o treino dela.
 */
function proximoComRotacaoExplicita(
  ficha: FichaInicio,
  itens: ItemFichaInicio[],
  steps: PassoRotacao[],
  ultimoEvento: UltimoEventoRotacao | undefined
): ProximoTreino {
  // Índice do passo correspondente à última divisão concluída (se houver).
  let idxDivisao: number | null = null;
  const labelDivisao = ultimoEvento?.ultimaDivisao?.label ?? null;
  if (labelDivisao !== null) {
    const encontrado = steps.findIndex(
      (s) => s.type === 'division' && s.label === labelDivisao
    );
    idxDivisao = encontrado === -1 ? null : encontrado;
  }

  // Índice do passo do último descanso cumprido (se houver e no range).
  let idxDescanso: number | null = null;
  const descanso = ultimoEvento?.ultimoDescanso ?? null;
  if (
    descanso &&
    descanso.restStepIndex >= 0 &&
    descanso.restStepIndex < steps.length &&
    steps[descanso.restStepIndex]?.type === 'rest'
  ) {
    idxDescanso = descanso.restStepIndex;
  }

  // Desempate por timestamp: o passo concluído MAIS RECENTE vence.
  let ultimoPassoConcluido: number | null = null;
  if (idxDivisao !== null && idxDescanso !== null) {
    const tDiv = Date.parse(ultimoEvento!.ultimaDivisao!.finishedAt);
    const tRest = Date.parse(ultimoEvento!.ultimoDescanso!.completedAt);
    ultimoPassoConcluido = tRest >= tDiv ? idxDescanso : idxDivisao;
  } else if (idxDivisao !== null) {
    ultimoPassoConcluido = idxDivisao;
  } else if (idxDescanso !== null) {
    ultimoPassoConcluido = idxDescanso;
  }

  const proximo = proximoPassoNaRotacao(steps, ultimoPassoConcluido);
  // `steps.length > 0` garantido pelo chamador → `proximo` nunca é null.
  const passo = proximo!.step;

  if (passo.type === 'rest') {
    return {
      divisionLabel: null,
      grupos: [],
      exercicios: [],
      href: `/aluno/treinos/${ficha.id}`,
      descanso: true,
      restStepIndex: proximo!.index,
    };
  }

  // Passo de divisão: monta o treino daquela divisão (itens + grupos + href).
  const alvo = itens.filter((item) => (item.division ?? null) === passo.label);
  const itensOrdenados = [...alvo].sort((a, b) => a.order_index - b.order_index);

  const exercicios: ExercicioHojeDados[] = itensOrdenados.map((item) => ({
    id: item.id,
    nome: infoExercicio(item.exercises).nome,
    sets: item.sets,
    reps: item.reps,
  }));

  const grupos = Array.from(
    new Set(itensOrdenados.flatMap((item) => infoExercicio(item.exercises).grupos))
  );

  const href =
    exercicios.length > 0
      ? `/aluno/execucao/${ficha.id}?divisao=${encodeURIComponent(passo.label)}`
      : `/aluno/treinos/${ficha.id}`;

  return {
    divisionLabel: passo.label,
    grupos,
    exercicios,
    href,
    descanso: false,
    restStepIndex: null,
  };
}
