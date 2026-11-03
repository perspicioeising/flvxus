/**
 * Missões diárias/semanais FIXAS da Arena (RF8.1) — função PURA (sem I/O),
 * testável em `tests/unit/arena-missoes.test.ts`.
 *
 * Conjunto FIXO (não configurável na G1). O estado de conclusão é POR USUÁRIO
 * POR PERÍODO (dia para diárias, semana para semanais) no fuso `America/Sao_Paulo`
 * (RF8.2), derivado de EVENTOS REAIS (RF8.4) — nunca marcação manual.
 *
 * Regras:
 *  - Missões cuja fonte não existe na G1 (água, dieta, "todas as refeições")
 *    ficam BLOQUEADAS/indisponíveis (RF8.5) — nunca concluíveis sem fonte.
 *  - Num dia de descanso programado, a missão do dia é o PRÓPRIO DESCANSO:
 *    concluída ao cumprir o descanso; não se cobra treino (RF8.3).
 */

import { diaSP, diaSPdeDiaOuInstante, periodoSP } from '@/lib/arena/datas';

/** Identificadores fixos das missões G1. */
export type MissaoId =
  | 'treino_dia'
  | 'descanso_dia'
  | 'agua_dia'
  | 'dieta_dia'
  | 'refeicoes_dia'
  | 'treinos_semana'
  | 'consistencia_semana';

/** Estado de uma missão para render na UI. */
export type EstadoMissao = 'concluida' | 'pendente' | 'bloqueada';

/** Período de reset da missão. */
export type PeriodoMissao = 'diaria' | 'semanal';

/** Uma missão resolvida para a tela da Arena. */
export interface Missao {
  id: MissaoId;
  titulo: string;
  xp: number;
  periodo: PeriodoMissao;
  estado: EstadoMissao;
  /**
   * Progresso atual rumo à meta, SÓ para missões de meta múltipla
   * (`treinos_semana`, `consistencia_semana`). Ausente nas missões binárias.
   */
  atual?: number;
  /** Meta da missão de progresso. Ausente nas missões binárias. */
  meta?: number;
}

/**
 * Estado real dos hábitos do dia-SP (G2). Cada flag vem da PRESENÇA do evento
 * de hábito correspondente no dia (`water_goal`/`meal_logged`/`diet_day`).
 * Quando `habitos` está AUSENTE em `EntradaMissoes`, as três missões de hábito
 * seguem bloqueadas (retrocompat com a G1, que não tinha fonte).
 */
export interface EstadoHabitos {
  /** Meta de água atingida hoje (evento `water_goal`). */
  aguaMetaAtingida?: boolean;
  /** Pelo menos uma refeição registrada hoje (evento `meal_logged`). */
  refeicoesRegistradas?: boolean;
  /** Dieta do dia cumprida (evento `diet_day`). */
  dietaCumprida?: boolean;
}

/** Eventos reais usados para derivar a conclusão das missões. */
export interface EntradaMissoes {
  /**
   * Dias-SP (`YYYY-MM-DD`) OU instantes de sessões concluídas (>=1 série
   * `completed`). Aceita `Date`/string; dias-SP são extraídos via `diaSP`.
   */
  treinos: Array<Date | string>;
  /** Dias-SP OU instantes de descansos programados cumpridos. */
  descansos: Array<Date | string>;
  /** `true` quando hoje-SP é um dia de descanso programado (RF8.3). */
  diaDeDescanso?: boolean;
  /**
   * Estado real dos hábitos do dia-SP (G2). AUSENTE = sem fonte (as três
   * missões de hábito ficam `bloqueada`, como na G1). PRESENTE = cada missão
   * resolve `concluida`/`pendente` pelo flag correspondente.
   */
  habitos?: EstadoHabitos;
}

/** Converte instantes/dias em um conjunto de dias-SP válidos. */
function diasSP(valores: Array<Date | string>): Set<string> {
  const dias = new Set<string>();
  for (const v of valores) {
    // `occurred_on` já vem do banco como dia-SP cru (`YYYY-MM-DD`): normalizamos
    // sem reconverter por fuso (que deslocaria −1 dia). Instantes continuam
    // resolvidos pelo fuso SP.
    const dia = diaSPdeDiaOuInstante(v);
    if (dia !== null) {
      dias.add(dia);
    }
  }
  return dias;
}

/** Primeiro dia (segunda) da semana-SP que contém `dia` (`YYYY-MM-DD`). */
function inicioSemanaSP(dia: string): string {
  const base = new Date(`${dia}T12:00:00.000Z`);
  // getUTCDay: 0=domingo..6=sábado; semana inicia na segunda.
  const diaSemana = base.getUTCDay();
  const recuo = diaSemana === 0 ? 6 : diaSemana - 1;
  base.setUTCDate(base.getUTCDate() - recuo);
  return diaSP(base) ?? dia;
}

/**
 * Monta as 6 missões fixas (RF8.1) já com o estado resolvido para `referencia`
 * (padrão: agora). No dia de descanso, a missão de treino é substituída pela
 * missão de descanso.
 */
export function montarMissoes(
  entrada: EntradaMissoes,
  referencia: Date | string = new Date()
): Missao[] {
  // `referencia` pode ser um instante (`Date`/ISO) OU já um dia-SP cru
  // (`YYYY-MM-DD`, a fonte única de "hoje-SP" vinda de `dados.ts`). Normalizamos
  // sem reconverter por fuso quando já é dia-SP cru.
  const hoje = diaSPdeDiaOuInstante(referencia);
  const periodoAtual = hoje !== null ? hoje.slice(0, 7) : null;

  const diasTreino = diasSP(entrada.treinos);
  const diasDescanso = diasSP(entrada.descansos);

  // --- Missão do dia: treino OU descanso (RF8.3) ---
  const missaoDoDia: Missao = entrada.diaDeDescanso
    ? {
        id: 'descanso_dia',
        titulo: 'Cumprir o descanso de hoje',
        xp: 30,
        periodo: 'diaria',
        estado:
          hoje !== null && diasDescanso.has(hoje) ? 'concluida' : 'pendente',
      }
    : {
        id: 'treino_dia',
        titulo: 'Concluir o treino de hoje',
        xp: 30,
        periodo: 'diaria',
        estado:
          hoje !== null && diasTreino.has(hoje) ? 'concluida' : 'pendente',
      };

  // --- Missões diárias de hábito (G2) ---
  // Sem `habitos` (G1/sem fonte), cada uma fica `bloqueada` (RF8.5). Com
  // `habitos`, resolve `concluida`/`pendente` pela presença do evento do dia.
  const { habitos } = entrada;
  const estadoHabito = (flag: boolean | undefined): EstadoMissao =>
    habitos === undefined ? 'bloqueada' : flag ? 'concluida' : 'pendente';

  const habitosDiarios: Missao[] = [
    {
      id: 'agua_dia',
      titulo: 'Atingir a meta de água',
      xp: 10,
      periodo: 'diaria',
      estado: estadoHabito(habitos?.aguaMetaAtingida),
    },
    {
      id: 'dieta_dia',
      titulo: 'Cumprir a dieta do dia',
      xp: 20,
      periodo: 'diaria',
      estado: estadoHabito(habitos?.dietaCumprida),
    },
    {
      id: 'refeicoes_dia',
      titulo: 'Registrar uma refeição',
      xp: 10,
      periodo: 'diaria',
      estado: estadoHabito(habitos?.refeicoesRegistradas),
    },
  ];

  // --- Missões semanais (derivadas de eventos reais da semana-SP) ---
  const inicioSemana = hoje !== null ? inicioSemanaSP(hoje) : null;

  const treinosNaSemana =
    inicioSemana !== null
      ? [...diasTreino].filter(
          (d) => d >= inicioSemana && (hoje === null || d <= hoje)
        ).length
      : 0;

  // Dias de aderência (treino OU descanso) no período da temporada vigente,
  // para a missão de "7 dias de consistência".
  const diasAderenciaPeriodo = new Set<string>();
  if (periodoAtual !== null) {
    for (const d of diasTreino) {
      if (periodoSP(`${d}T12:00:00.000Z`) === periodoAtual) diasAderenciaPeriodo.add(d);
    }
    for (const d of diasDescanso) {
      if (periodoSP(`${d}T12:00:00.000Z`) === periodoAtual) diasAderenciaPeriodo.add(d);
    }
  }

  const missoesSemanais: Missao[] = [
    {
      id: 'treinos_semana',
      titulo: '3 treinos na semana',
      xp: 50,
      periodo: 'semanal',
      atual: treinosNaSemana,
      meta: 3,
      estado: treinosNaSemana >= 3 ? 'concluida' : 'pendente',
    },
    {
      id: 'consistencia_semana',
      titulo: '7 dias de consistência',
      xp: 100,
      periodo: 'semanal',
      atual: diasAderenciaPeriodo.size,
      meta: 7,
      estado: diasAderenciaPeriodo.size >= 7 ? 'concluida' : 'pendente',
    },
  ];

  return [missaoDoDia, ...habitosDiarios, ...missoesSemanais];
}
