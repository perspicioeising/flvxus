/**
 * Recorrência da Agenda — expansão na leitura e planejamento de escopos de
 * edição/cancelamento. Funções PURAS (sem I/O). Semântica idêntica à da função
 * SQL `agenda_is_occurrence` (design §6.2): trabalha em datas locais
 * (`YYYY-MM-DD`) no `tz` da SÉRIE e hora de parede de `starts_at`.
 */

import {
  diaLocal,
  horaLocal,
  instanteDeLocal,
  somarDias,
  weekdayDeDia,
} from '@/lib/agenda/fuso';
import type { AgendaScope, CompromissoRow, RecurFreq } from '@/lib/agenda/tipos';

/** Limite de segurança ao procurar a próxima ocorrência (mensal dia 31 precisa de poucos meses). */
const LIMITE_BUSCA_DIAS = 800;

export interface JanelaInstantes {
  /** Inclusivo. */
  inicio: Date;
  /** Exclusivo. */
  fim: Date;
}

export interface OcorrenciaExpandida {
  /** Linha que define a ocorrência (mestre ou override); campos de texto/status vêm dela. */
  linha: CompromissoRow;
  /** Mestre da série (ou a própria linha quando avulsa). */
  mestreId: string;
  /** `null` para avulso. */
  serieId: string | null;
  /** `YYYY-MM-DD` no `tz` da série. */
  dataOriginal: string;
  tzSerie: string;
  inicio: Date;
  fim: Date;
  /** Dia (`YYYY-MM-DD`) do início no fuso do espectador (pode diferir de `dataOriginal`). */
  dia: string;
  ehOverride: boolean;
}

/** `true` quando `linha` é mestre recorrente. */
export function ehMestre(linha: CompromissoRow): boolean {
  return linha.recur_freq !== null && linha.series_id === null;
}

/** Primeira data local (no `tz` da série) do mestre. */
function primeiraData(mestre: CompromissoRow): string {
  return diaLocal(mestre.starts_at, mestre.tz);
}

/** Regra de recorrência: `dia` é ocorrência do mestre? (espelha `agenda_is_occurrence`). */
export function ehOcorrencia(
  mestre: Pick<CompromissoRow, 'starts_at' | 'tz' | 'recur_freq' | 'recur_weekdays' | 'recur_until'>,
  dia: string
): boolean {
  if (mestre.recur_freq === null) return false;
  const primeira = diaLocal(mestre.starts_at, mestre.tz);
  if (dia < primeira) return false;
  if (mestre.recur_until !== null && dia > mestre.recur_until) return false;
  switch (mestre.recur_freq) {
    case 'daily':
      return true;
    case 'weekly':
      return (mestre.recur_weekdays ?? []).includes(weekdayDeDia(dia));
    case 'monthly':
      // Mesmo dia-do-mês da primeira; meses sem esse dia nunca produzem `dia` igual.
      return dia.slice(8, 10) === primeira.slice(8, 10);
    default:
      return false;
  }
}

/** Primeira ocorrência com data ≥ `aPartirDe` (ou `null`). */
export function proximaOcorrencia(
  mestre: Pick<CompromissoRow, 'starts_at' | 'tz' | 'recur_freq' | 'recur_weekdays' | 'recur_until'>,
  aPartirDe: string
): string | null {
  const primeira = diaLocal(mestre.starts_at, mestre.tz);
  let d = aPartirDe < primeira ? primeira : aPartirDe;
  for (let i = 0; i < LIMITE_BUSCA_DIAS; i += 1) {
    if (mestre.recur_until !== null && d > mestre.recur_until) return null;
    if (ehOcorrencia(mestre, d)) return d;
    d = somarDias(d, 1);
  }
  return null;
}

function sobrepoe(inicio: Date, fim: Date, janela: JanelaInstantes): boolean {
  return inicio.getTime() < janela.fim.getTime() && fim.getTime() > janela.inicio.getTime();
}

function ocorrenciaDeLinha(
  linha: CompromissoRow,
  mestreId: string,
  dataOriginal: string,
  tzSerie: string,
  ehOverride: boolean,
  tzEspectador: string
): OcorrenciaExpandida {
  const inicio = new Date(linha.starts_at);
  const fim = new Date(linha.ends_at);
  return {
    linha,
    mestreId,
    serieId: linha.series_id ?? (linha.recur_freq !== null ? linha.id : null),
    dataOriginal,
    tzSerie,
    inicio,
    fim,
    dia: diaLocal(inicio, tzEspectador),
    ehOverride,
  };
}

/** Ocorrência de um compromisso avulso (sem série) para exibição no fuso do espectador. */
export function ocorrenciaAvulsa(linha: CompromissoRow, tzEspectador: string): OcorrenciaExpandida {
  return ocorrenciaDeLinha(linha, linha.id, diaLocal(linha.starts_at, linha.tz), linha.tz, false, tzEspectador);
}

/**
 * Expande mestres recorrentes e seus overrides numa janela de instantes.
 * - mestre `canceled` ignora o mestre E todos os seus overrides;
 * - override substitui a ocorrência (`series_id` + `original_date`), pode estar
 *   em outra data/hora; se `canceled`, a ocorrência some;
 * - `recur_until` é inclusivo; mensal pula meses sem o dia.
 * `tzEspectador` define o `dia` exibido (padrão: o `tz` de cada série).
 */
export function expandir(
  janela: JanelaInstantes,
  mestres: CompromissoRow[],
  overrides: CompromissoRow[],
  tzEspectador?: string
): OcorrenciaExpandida[] {
  const resultado: OcorrenciaExpandida[] = [];

  for (const mestre of mestres) {
    if (!ehMestre(mestre) || mestre.status === 'canceled') continue;
    const tz = mestre.tz;
    const tzVista = tzEspectador ?? tz;
    const primeira = primeiraData(mestre);
    const horaParede = horaLocal(mestre.starts_at, tz);
    const duracaoMs = new Date(mestre.ends_at).getTime() - new Date(mestre.starts_at).getTime();
    const meus = overrides.filter((o) => o.series_id === mestre.id);
    const substituidas = new Set(meus.map((o) => o.original_date));

    // Dias a considerar: do dia local da janela (−1 pela duração) até o fim (+1).
    const diaIni = somarDias(diaLocal(janela.inicio, tz), -1);
    const diaFim = somarDias(diaLocal(janela.fim, tz), 1);
    let d = diaIni < primeira ? primeira : diaIni;
    for (; d <= diaFim; d = somarDias(d, 1)) {
      if (mestre.recur_until !== null && d > mestre.recur_until) break;
      if (!ehOcorrencia(mestre, d) || substituidas.has(d)) continue;
      const inicio = instanteDeLocal(d, horaParede, tz);
      const fim = new Date(inicio.getTime() + duracaoMs);
      if (!sobrepoe(inicio, fim, janela)) continue;
      resultado.push({
        linha: mestre,
        mestreId: mestre.id,
        serieId: mestre.id,
        dataOriginal: d,
        tzSerie: tz,
        inicio,
        fim,
        dia: diaLocal(inicio, tzVista),
        ehOverride: false,
      });
    }

    for (const o of meus) {
      if (o.status === 'canceled' || o.original_date === null) continue;
      const ocorrencia = ocorrenciaDeLinha(o, mestre.id, o.original_date, tz, true, tzVista);
      if (sobrepoe(ocorrencia.inicio, ocorrencia.fim, janela)) resultado.push(ocorrencia);
    }
  }

  return resultado.sort((a, b) => a.inicio.getTime() - b.inicio.getTime());
}

// ---------------------------------------------------------------------------
// Escopos de edição / cancelamento (design §6.3 e §17 M2)
// ---------------------------------------------------------------------------

export type AcaoEscopo = 'editar' | 'cancelar';

export type CodigoErroEscopo =
  | 'agenda_past'
  | 'agenda_invalid_occurrence'
  | 'agenda_invalid_range';

export interface NovaRecorrencia {
  freq: RecurFreq | null;
  weekdays: number[] | null;
  until: string | null;
}

/**
 * Alterações pedidas pelo usuário. Nos escopos `following`/`all` só hora de
 * parede e texto mudam (M2): `data`, quando informada, DEVE ser igual a D.
 * Mudar de dia exige o escopo `occurrence`.
 */
export interface EdicaoCompromisso {
  /** `YYYY-MM-DD` (no `tz` da série). Em `following`/`all` precisa ser D. */
  data?: string;
  horaInicio?: string;
  horaFim?: string;
  titulo?: string | null;
  localizacao?: string | null;
  notas?: string | null;
  /** Só em `following`/`all`; `undefined` = mantém a regra. */
  recorrencia?: NovaRecorrencia;
}

export interface CamposCompromisso {
  /** Dia de início (`YYYY-MM-DD`, `tz` da série). */
  dia: string;
  horaInicio: string;
  horaFim: string;
  /** Dias entre o dia de início e o de fim (evento que atravessa a meia-noite). */
  fimMaisDias: number;
  titulo: string | null;
  localizacao: string | null;
  notas: string | null;
  recorrencia: NovaRecorrencia | null;
}

export type Alteracao =
  | { tipo: 'atualizar_mestre'; id: string; campos: CamposCompromisso }
  | { tipo: 'cancelar_mestre'; id: string }
  | { tipo: 'encerrar_mestre'; id: string; recurUntil: string }
  | { tipo: 'criar_mestre'; deId: string; campos: CamposCompromisso }
  | { tipo: 'reapontar_overrides'; ids: string[]; deId: string }
  | { tipo: 'cancelar_overrides'; ids: string[] }
  | { tipo: 'upsert_override'; serieId: string; dataOriginal: string; campos: CamposCompromisso }
  | { tipo: 'cancelar_ocorrencia'; serieId: string; dataOriginal: string }
  | { tipo: 'cancelar_avulso'; id: string }
  | { tipo: 'atualizar_avulso'; id: string; campos: CamposCompromisso };

export type PlanoEscopo =
  | { ok: true; alteracoes: Alteracao[] }
  | { ok: false; erro: CodigoErroEscopo };

export interface EntradaEscopo {
  escopo: AgendaScope;
  acao: AcaoEscopo;
  mestre: CompromissoRow;
  /** Ocorrência selecionada `D` (`YYYY-MM-DD` no `tz` da série). */
  dataOcorrencia: string;
  /** Hoje no `tz` da série. */
  hojeLocal: string;
  /** Overrides existentes da série. */
  overrides: CompromissoRow[];
  edicao?: EdicaoCompromisso;
}

function diferencaDias(de: string, ate: string): number {
  let n = 0;
  let d = de;
  while (d < ate && n < 4000) {
    d = somarDias(d, 1);
    n += 1;
  }
  return n;
}

function camposBase(
  linha: CompromissoRow,
  dia: string,
  edicao: EdicaoCompromisso | undefined,
  recorrencia: NovaRecorrencia | null
): CamposCompromisso {
  const horaIni = horaLocal(linha.starts_at, linha.tz);
  const horaFim = horaLocal(linha.ends_at, linha.tz);
  const fimMaisDias = diferencaDias(diaLocal(linha.starts_at, linha.tz), diaLocal(linha.ends_at, linha.tz));
  return {
    dia,
    horaInicio: edicao?.horaInicio ?? horaIni,
    horaFim: edicao?.horaFim ?? horaFim,
    fimMaisDias,
    titulo: edicao && 'titulo' in edicao ? (edicao.titulo ?? null) : linha.title,
    localizacao: edicao && 'localizacao' in edicao ? (edicao.localizacao ?? null) : linha.location,
    notas: edicao && 'notas' in edicao ? (edicao.notas ?? null) : linha.notes,
    recorrencia,
  };
}

/**
 * Planeja (sem I/O) as alterações de um escopo. Passado fica intacto. Erros:
 * `agenda_past` (D < hoje), `agenda_invalid_occurrence` (D não é ocorrência),
 * `agenda_invalid_range` (M2: data ≠ D em following/all; recorrência
 * incompatível com o weekday de D).
 */
export function planejarEscopo(entrada: EntradaEscopo): PlanoEscopo {
  const { escopo, acao, mestre, dataOcorrencia: D, hojeLocal, overrides, edicao } = entrada;
  const recorrente = mestre.recur_freq !== null;

  if (D < hojeLocal) return { ok: false, erro: 'agenda_past' };

  // ---- Avulso (sem série): qualquer escopo equivale a atualizar/cancelar a linha.
  if (!recorrente) {
    if (D !== diaLocal(mestre.starts_at, mestre.tz)) {
      return { ok: false, erro: 'agenda_invalid_occurrence' };
    }
    if (acao === 'cancelar') return { ok: true, alteracoes: [{ tipo: 'cancelar_avulso', id: mestre.id }] };
    if (edicao?.recorrencia !== undefined && edicao.recorrencia.freq !== null) {
      return { ok: false, erro: 'agenda_invalid_range' };
    }
    return {
      ok: true,
      alteracoes: [
        {
          tipo: 'atualizar_avulso',
          id: mestre.id,
          campos: camposBase(mestre, edicao?.data ?? D, edicao, null),
        },
      ],
    };
  }

  if (!ehOcorrencia(mestre, D)) return { ok: false, erro: 'agenda_invalid_occurrence' };

  // ---- Somente esta ocorrência.
  if (escopo === 'occurrence') {
    if (acao === 'cancelar') {
      return {
        ok: true,
        alteracoes: [{ tipo: 'cancelar_ocorrencia', serieId: mestre.id, dataOriginal: D }],
      };
    }
    if (edicao?.recorrencia !== undefined) return { ok: false, erro: 'agenda_invalid_range' };
    return {
      ok: true,
      alteracoes: [
        {
          tipo: 'upsert_override',
          serieId: mestre.id,
          dataOriginal: D,
          campos: camposBase(mestre, edicao?.data ?? D, edicao, null),
        },
      ],
    };
  }

  // ---- following / all: M2 — só hora de parede e texto; data ≠ D rejeitada.
  if (acao === 'editar' && edicao?.data !== undefined && edicao.data !== D) {
    return { ok: false, erro: 'agenda_invalid_range' };
  }

  const primeira = primeiraData(mestre);
  // `all` parte da primeira ocorrência futura (≥ hoje); `following`, de D.
  let S = D;
  if (escopo === 'all') {
    const futura = proximaOcorrencia(mestre, hojeLocal);
    if (futura === null) return { ok: false, erro: 'agenda_past' };
    S = futura;
  }

  const novaRegra = edicao?.recorrencia;
  if (acao === 'editar' && novaRegra !== undefined) {
    if (novaRegra.freq === 'weekly') {
      const dias = novaRegra.weekdays ?? [];
      if (!dias.includes(weekdayDeDia(D)) || !dias.includes(weekdayDeDia(S))) {
        return { ok: false, erro: 'agenda_invalid_range' };
      }
    }
    if (novaRegra.until !== null && novaRegra.until < S) {
      return { ok: false, erro: 'agenda_invalid_range' };
    }
  }

  const futuros = overrides.filter((o) => o.original_date !== null && o.original_date >= S);
  const noLugar = S === primeira;
  const alteracoes: Alteracao[] = [];

  if (acao === 'cancelar') {
    const ids = futuros.filter((o) => o.status !== 'canceled').map((o) => o.id);
    if (noLugar) {
      alteracoes.push({ tipo: 'cancelar_mestre', id: mestre.id });
    } else {
      alteracoes.push({
        tipo: 'encerrar_mestre',
        id: mestre.id,
        recurUntil: escopo === 'all' ? somarDias(hojeLocal, -1) : somarDias(S, -1),
      });
    }
    if (ids.length > 0) alteracoes.push({ tipo: 'cancelar_overrides', ids });
    return { ok: true, alteracoes };
  }

  // editar
  const regra: NovaRecorrencia | null =
    novaRegra !== undefined
      ? novaRegra
      : { freq: mestre.recur_freq, weekdays: mestre.recur_weekdays, until: mestre.recur_until };
  const campos = camposBase(mestre, S, edicao, regra);
  if (noLugar) {
    alteracoes.push({ tipo: 'atualizar_mestre', id: mestre.id, campos });
  } else {
    alteracoes.push({ tipo: 'encerrar_mestre', id: mestre.id, recurUntil: somarDias(S, -1) });
    alteracoes.push({ tipo: 'criar_mestre', deId: mestre.id, campos });
    if (futuros.length > 0) {
      alteracoes.push({ tipo: 'reapontar_overrides', ids: futuros.map((o) => o.id), deId: mestre.id });
    }
  }
  return { ok: true, alteracoes };
}
