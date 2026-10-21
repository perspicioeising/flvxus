/**
 * Lógica PURA de evolução de CARGA (peso dos aparelhos / `load_done`), volume e
 * frequência de execução do aluno — sem React/UI, sem Supabase. Testável em
 * `tests/unit/evolucao-carga.test.ts`.
 *
 * A série é reconstruída a partir da cadeia de JOINs
 * `workout_sessions → workout_set_logs → workout_plan_items → exercises`,
 * montada no servidor sob RLS e passada aqui já achatada.
 *
 * Reusa `volumeSessao` (`lib/treino/progresso.ts`) para o volume do ponto e
 * `resumoAderencia` (`lib/treino/aderencia.ts`) para os totais de frequência —
 * nenhum dos dois é reescrito.
 */

import { volumeSessao } from './progresso';
import { resumoAderencia } from './aderencia';

/**
 * Linha mínima de log COM o nome do exercício já resolvido (montado no server a
 * partir do JOIN). Mantém os campos de progresso + o nome + a sessão.
 */
export interface LogCarga {
  session_id: string;
  plan_item_id: string | null;
  /** null = log órfão (item prescrito apagado); ignorado na série por exercício. */
  exercicioNome: string | null;
  set_number: number;
  reps_done: number | null;
  load_done: number | null;
  completed: boolean;
}

/** Linha mínima de sessão (started_at para o eixo X). */
export interface SessaoCarga {
  id: string;
  started_at: string;
  finished_at: string | null;
}

/** Um ponto da série de carga de UM exercício (uma sessão). */
export interface PontoCarga {
  /** started_at ISO da sessão (ordenação/tooltip). */
  data: string;
  /** dd/mm, ou dd/mm HH:mm quando há colisão no mesmo dia (UTC). */
  rotulo: string;
  /** Máx de load_done do exercício na sessão; null se nenhum valor. */
  cargaMax: number | null;
  /** Média de load_done (ignora nulls); null se nenhum valor. */
  cargaMedia: number | null;
  /** Σ reps_done × load_done (nulls → 0) do exercício na sessão. */
  volume: number;
  /** Nº de séries com completed=true. */
  seriesFeitas: number;
  /** Nº de séries registradas. */
  seriesTotais: number;
}

/** Série de um exercício (nome + pontos ordenados por data asc). */
export interface SerieCarga {
  exercicio: string;
  pontos: PontoCarga[];
}

/** Resumo de frequência de execução. */
export interface ResumoFrequencia {
  /** Sessões concluídas dentro da janela `dias` (via resumoAderencia). */
  concluidasPeriodo: number;
  /** Sessões concluídas no total (via resumoAderencia). */
  concluidasTotal: number;
  /** Janela usada (em dias). */
  dias: number;
  /** Contagem de sessões concluídas por semana (dentro da janela), asc por semana. */
  porSemana: { semana: string; total: number }[];
  /** Nº de semanas distintas com ao menos um treino concluído (na janela). */
  semanasComTreino: number;
}

/** Formata uma data ISO em dd/mm (eixo X, UTC). Datas inválidas viram '—'. */
function rotuloData(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const dia = String(d.getUTCDate()).padStart(2, '0');
  const mes = String(d.getUTCMonth() + 1).padStart(2, '0');
  return `${dia}/${mes}`;
}

/** Formata dd/mm HH:mm (UTC) — desambigua sessões do mesmo dia. */
function rotuloDataHora(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const dia = String(d.getUTCDate()).padStart(2, '0');
  const mes = String(d.getUTCMonth() + 1).padStart(2, '0');
  const hora = String(d.getUTCHours()).padStart(2, '0');
  const min = String(d.getUTCMinutes()).padStart(2, '0');
  return `${dia}/${mes} ${hora}:${min}`;
}

/** Início (segunda-feira, UTC, 00:00) da semana de uma data. */
function inicioSemanaUTC(iso: string): Date {
  const d = new Date(iso);
  // getUTCDay: 0=domingo..6=sábado. Queremos segunda como início.
  const diaSemana = d.getUTCDay();
  const diffParaSegunda = (diaSemana + 6) % 7; // 0 se já é segunda
  const base = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
  );
  base.setUTCDate(base.getUTCDate() - diffParaSegunda);
  return base;
}

/**
 * Converte logs (com nome do exercício) + sessões numa lista de séries de carga,
 * uma por exercício nomeado, com pontos ordenados por `started_at` asc.
 *
 * - Agrupa por `exercicioNome`; logs órfãos (`exercicioNome == null`) são
 *   IGNORADOS (decisão registrada no plano: um bucket "sem exercício" não ajuda a
 *   leitura de progressão e polui o seletor). Esses logs ainda somam volume/
 *   conclusão da sessão quando o volume é computado diretamente das sessões.
 * - Tolera `null` em load_done/reps_done: `cargaMax`/`cargaMedia` ficam `null`
 *   quando nenhuma série tem carga; `volume` soma 0 para nulos.
 * - Sessões sem `started_at` válido (ou cujo id não aparece nas sessões) são
 *   descartadas.
 * - Rótulo do eixo X desambigua sessões do mesmo dia com a hora (UTC), por
 *   exercício, igual a `montarSerieEvolucao`.
 */
export function montarSerieCarga(
  logs: LogCarga[],
  sessoes: SessaoCarga[]
): SerieCarga[] {
  // Mapa session_id → started_at (apenas sessões com data válida).
  const inicioPorSessao = new Map<string, string>();
  for (const s of sessoes) {
    if (!Number.isNaN(new Date(s.started_at).getTime())) {
      inicioPorSessao.set(s.id, s.started_at);
    }
  }

  // Agrupa: exercício → (session_id → logs daquela sessão).
  const porExercicio = new Map<string, Map<string, LogCarga[]>>();
  for (const log of logs) {
    if (log.exercicioNome == null) continue; // órfão: ignorado
    if (!inicioPorSessao.has(log.session_id)) continue; // sessão inválida/desconhecida
    let porSessao = porExercicio.get(log.exercicioNome);
    if (!porSessao) {
      porSessao = new Map<string, LogCarga[]>();
      porExercicio.set(log.exercicioNome, porSessao);
    }
    const bucket = porSessao.get(log.session_id);
    if (bucket) {
      bucket.push(log);
    } else {
      porSessao.set(log.session_id, [log]);
    }
  }

  const series: SerieCarga[] = [];

  // Exercícios ordenados por nome asc.
  const nomes = [...porExercicio.keys()].sort((a, b) => a.localeCompare(b));

  for (const exercicio of nomes) {
    const porSessao = porExercicio.get(exercicio)!;

    // Um ponto por sessão, ordenado por started_at asc.
    const pontosBrutos = [...porSessao.entries()]
      .map(([sessionId, logsSessao]) => {
        const data = inicioPorSessao.get(sessionId)!;
        const cargas = logsSessao
          .map((l) => l.load_done)
          .filter((v): v is number => v != null);
        const cargaMax = cargas.length > 0 ? Math.max(...cargas) : null;
        const cargaMedia =
          cargas.length > 0
            ? cargas.reduce((a, b) => a + b, 0) / cargas.length
            : null;
        const volume = volumeSessao(
          logsSessao.map((l) => ({
            completed: l.completed,
            reps_done: l.reps_done,
            load_done: l.load_done,
            plan_item_id: l.plan_item_id,
            set_number: l.set_number,
          }))
        );
        const seriesFeitas = logsSessao.reduce(
          (acc, l) => acc + (l.completed ? 1 : 0),
          0
        );
        return {
          data,
          cargaMax,
          cargaMedia,
          volume,
          seriesFeitas,
          seriesTotais: logsSessao.length,
        };
      })
      .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());

    // Desambigua rótulos do mesmo dia (dd/mm) com hora.
    const contagemPorDia = new Map<string, number>();
    for (const p of pontosBrutos) {
      const r = rotuloData(p.data);
      contagemPorDia.set(r, (contagemPorDia.get(r) ?? 0) + 1);
    }

    const pontos: PontoCarga[] = pontosBrutos.map((p) => {
      const base = rotuloData(p.data);
      const rotulo =
        (contagemPorDia.get(base) ?? 0) > 1 ? rotuloDataHora(p.data) : base;
      return { ...p, rotulo };
    });

    series.push({ exercicio, pontos });
  }

  return series;
}

/**
 * Indica se uma série tem dados suficientes para plotar/selecionar: ao menos
 * dois pontos com `cargaMax` não nulo.
 */
export function temSerieCarga(serie: SerieCarga): boolean {
  return serie.pontos.filter((p) => p.cargaMax != null).length >= 2;
}

/**
 * Sinal simples de platô: a `cargaMax` não aumenta nas últimas `n` sessões
 * consecutivas (padrão n=3). Considera apenas pontos com `cargaMax` não nulo.
 * Retorna `false` se houver menos de `n` pontos com carga.
 */
export function detectarEstagnacao(serie: SerieCarga, n: number = 3): boolean {
  const comCarga = serie.pontos
    .filter((p): p is PontoCarga & { cargaMax: number } => p.cargaMax != null)
    .map((p) => p.cargaMax);

  if (comCarga.length < n) return false;

  const ultimos = comCarga.slice(-n);
  // Estagnado quando nenhum passo aumenta (cada ponto ≤ o anterior).
  for (let i = 1; i < ultimos.length; i += 1) {
    if (ultimos[i] > ultimos[i - 1]) {
      return false;
    }
  }
  return true;
}

/**
 * Frequência de execução: usa `resumoAderencia` para os totais (concluídas no
 * período e no total) e adiciona a contagem por semana (apenas sessões
 * concluídas dentro da janela `dias`). A semana é rotulada pelo dd/mm da
 * segunda-feira (UTC) e a lista vem ordenada asc. Não altera `aderencia.ts`.
 */
export function resumoFrequencia(
  sessoes: SessaoCarga[],
  dias: number = 30,
  referencia: Date = new Date()
): ResumoFrequencia {
  const base = resumoAderencia(
    sessoes.map((s) => ({ finished_at: s.finished_at })),
    dias,
    referencia
  );

  const limite = referencia.getTime() - dias * 24 * 60 * 60 * 1000;
  const totalPorSemana = new Map<string, number>();
  const ordemSemana = new Map<string, number>(); // chave → timestamp do início

  for (const s of sessoes) {
    if (!s.finished_at) continue;
    const tempo = new Date(s.finished_at).getTime();
    if (Number.isNaN(tempo)) continue;
    if (tempo < limite || tempo > referencia.getTime()) continue;

    const inicio = inicioSemanaUTC(s.finished_at);
    const chave = rotuloData(inicio.toISOString());
    totalPorSemana.set(chave, (totalPorSemana.get(chave) ?? 0) + 1);
    ordemSemana.set(chave, inicio.getTime());
  }

  const porSemana = [...totalPorSemana.entries()]
    .map(([semana, total]) => ({ semana, total }))
    .sort((a, b) => (ordemSemana.get(a.semana) ?? 0) - (ordemSemana.get(b.semana) ?? 0));

  return {
    concluidasPeriodo: base.concluidasPeriodo,
    concluidasTotal: base.concluidasTotal,
    dias: base.dias,
    porSemana,
    semanasComTreino: porSemana.length,
  };
}
