import type { PlanStatus } from '@/types/database.types';

/**
 * Rótulos pt-BR do domínio de treinos, compartilhados entre páginas (RSC) e
 * componentes client. Centralizar evita divergência de texto/cor.
 */

/** Rótulo legível de cada status de ficha. */
export const STATUS_LABEL: Record<PlanStatus, string> = {
  draft: 'Rascunho',
  pending_review: 'Em revisão',
  approved: 'Aprovada',
  released: 'Liberada',
  archived: 'Arquivada',
};

/**
 * Descrição curta do que cada status significa para o aluno. Só `released`
 * chega ao aluno (invariante garantida por RLS).
 */
export const STATUS_DESCRICAO: Record<PlanStatus, string> = {
  draft: 'Em edição. O aluno ainda não vê esta ficha.',
  pending_review: 'Aguardando revisão. O aluno ainda não vê esta ficha.',
  approved: 'Aprovada, mas ainda não liberada. O aluno ainda não vê esta ficha.',
  released: 'Liberada. Esta ficha está visível para o aluno.',
  archived: 'Arquivada. O aluno não vê esta ficha.',
};

/** Variante visual do `Badge` por status (apenas `released` é "sucesso"). */
export const STATUS_VARIANTE: Record<PlanStatus, 'default' | 'secondary' | 'outline'> = {
  draft: 'secondary',
  pending_review: 'secondary',
  approved: 'outline',
  released: 'default',
  archived: 'outline',
};

/** `true` quando o status torna a ficha visível ao aluno. */
export function visivelAoAluno(status: PlanStatus): boolean {
  return status === 'released';
}

/**
 * `true` quando a ficha está AGENDADA: ainda em rascunho (`draft`) e com uma
 * data de liberação programada. "Agendada" não é um status de primeira classe
 * (ver design §2) — é derivado de `status` + `scheduled_release_at`.
 */
export function estaAgendada(
  status: PlanStatus,
  scheduledReleaseAt: string | null
): boolean {
  return status === 'draft' && !!scheduledReleaseAt;
}

/**
 * Formata um timestamp ISO como data pt-BR (DD/MM/AAAA). Helper puro que
 * encapsula `Intl`/`toLocaleDateString` do runtime (zero dependência nova),
 * consistente entre RSC e client. Nenhum componente deve chamar
 * `toLocaleDateString` direto.
 */
export function formatarDataBr(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR');
}

/** Dias da semana (0 = domingo … 6 = sábado), como no banco (`weekday`). */
export const DIAS_SEMANA = [
  { valor: 0, nome: 'Domingo', curto: 'Dom' },
  { valor: 1, nome: 'Segunda', curto: 'Seg' },
  { valor: 2, nome: 'Terça', curto: 'Ter' },
  { valor: 3, nome: 'Quarta', curto: 'Qua' },
  { valor: 4, nome: 'Quinta', curto: 'Qui' },
  { valor: 5, nome: 'Sexta', curto: 'Sex' },
  { valor: 6, nome: 'Sábado', curto: 'Sáb' },
] as const;

/** Nome do dia da semana a partir do número (ou "Sem dia" quando nulo). */
export function nomeDiaSemana(weekday: number | null | undefined): string {
  if (weekday === null || weekday === undefined) return 'Sem dia definido';
  return DIAS_SEMANA.find((d) => d.valor === weekday)?.nome ?? 'Sem dia definido';
}
