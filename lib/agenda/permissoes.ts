/**
 * Matriz de permissões da Agenda (papel × tipo × ação) — PURA, espelho de UI
 * da autorização que as funções SQL `agenda_*` aplicam (a RLS/SQL é a dona).
 * Design: §5.2 e §17 M3.
 */

import type { AppointmentKind } from '@/lib/agenda/tipos';

export type PerfilAgenda = 'professor' | 'aluno' | 'autonomo';
export type AcaoAgenda = 'criar' | 'editar' | 'cancelar';

export const TIPOS_AGENDA: readonly AppointmentKind[] = [
  'in_person',
  'online',
  'assessment',
  'personal',
  'block',
];

const ATENDIMENTOS: readonly AppointmentKind[] = ['in_person', 'online', 'assessment'];

/** `true` para os tipos com aluno + professor (presencial, online, avaliação). */
export function ehAtendimento(kind: AppointmentKind): boolean {
  return ATENDIMENTOS.includes(kind);
}

/** Perfil da agenda a partir de papel e tipo de conta. */
export function perfilAgenda(role: 'trainer' | 'student', accountType: 'professional' | 'self_managed'): PerfilAgenda {
  if (role === 'student') return 'aluno';
  return accountType === 'self_managed' ? 'autonomo' : 'professor';
}

/** Tipos que o perfil pode CRIAR (aluno/autônomo: só pessoal; professor: os 5). */
export function tiposCriaveis(perfil: PerfilAgenda): AppointmentKind[] {
  return perfil === 'professor' ? [...TIPOS_AGENDA] : ['personal'];
}

export interface ContextoPermissao {
  /** `owner_id === usuário`. */
  ehDono?: boolean;
  /** Usuário é master do tenant. */
  ehMaster?: boolean;
  /** `trainer_id === usuário` (responsável pelo atendimento). */
  ehTrainerDoAtendimento?: boolean;
}

/**
 * Pode executar `acao` num compromisso do tipo `kind`?
 * - aluno/autônomo: só `personal`, e editar/cancelar só o próprio;
 * - professor: 5 tipos; `personal`/`block` só o dono; atendimento do dono OU
 *   (de terceiro) apenas master ou o próprio `trainer_id` (M3: o módulo agenda
 *   aberto dá só visibilidade);
 * - aluno nunca edita/cancela atendimento (Fase 2).
 */
export function podeAgenda(
  perfil: PerfilAgenda,
  kind: AppointmentKind,
  acao: AcaoAgenda,
  ctx: ContextoPermissao = {}
): boolean {
  if (acao === 'criar') return tiposCriaveis(perfil).includes(kind);
  if (perfil !== 'professor') return kind === 'personal' && ctx.ehDono === true;
  if (kind === 'personal' || kind === 'block') return ctx.ehDono === true;
  return ctx.ehDono === true || ctx.ehMaster === true || ctx.ehTrainerDoAtendimento === true;
}
