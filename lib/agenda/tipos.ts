/**
 * Tipos comuns da Agenda (puros, sem I/O). Design: §8.
 */

import type { AppointmentKind, Tables } from '@/types/database.types';

export type { AgendaScope, AppointmentKind, RecurFreq } from '@/types/database.types';

/** Origem do evento projetado na agenda. */
export type OrigemEvento = 'compromisso' | 'treino' | 'refeicao' | 'agua';

/** Status de exibição de um evento da agenda. */
export type StatusEvento = 'pendente' | 'concluido' | 'cancelado' | 'previsto' | 'atrasado';

/** Ação associada ao evento (link ou ação de módulo já existente). */
export type AcaoEvento =
  | { tipo: 'link'; href: string; rotulo: string }
  | { tipo: 'concluir_refeicao'; mealId: string; dietId: string }
  | { tipo: 'concluir_agua'; ml: number }
  | { tipo: 'confirmar_descanso'; planId: string; restStepIndex: number };

/** Metadados de um evento de origem `compromisso` (editar/cancelar usam estes, nunca o `dia` exibido). */
export interface MetaCompromisso {
  compromissoId: string;
  serieId: string | null;
  /** `YYYY-MM-DD` no `tz` da SÉRIE (não do espectador). */
  dataOriginal: string;
  tzSerie: string;
  kind: AppointmentKind;
}

export interface EventoAgenda {
  /** Estável: `${origem}:${id}:${dia}[:n]`. */
  chave: string;
  origem: OrigemEvento;
  titulo: string;
  /** `YYYY-MM-DD` no fuso do espectador. */
  dia: string;
  /** ISO; `null` = faixa "Sem horário" do dia. */
  inicio: string | null;
  fim: string | null;
  status: StatusEvento;
  acao: AcaoEvento | null;
  /** Campos de exibição (divisão, porção, tipo...). Para `compromisso`, ver `MetaCompromisso`. */
  meta: Record<string, unknown>;
}

/** Linha de `appointments` usada pelo expansor (subconjunto do Row do banco). */
export type CompromissoRow = Pick<
  Tables<'appointments'>,
  | 'id'
  | 'owner_id'
  | 'kind'
  | 'trainer_id'
  | 'student_id'
  | 'title'
  | 'location'
  | 'notes'
  | 'starts_at'
  | 'ends_at'
  | 'status'
  | 'tz'
  | 'recur_freq'
  | 'recur_weekdays'
  | 'recur_until'
  | 'series_id'
  | 'original_date'
>;
