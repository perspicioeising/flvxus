import type { PlanStatus } from '@/types/database.types';
import { TRANSICOES_STATUS } from '@/schemas/treino';

/** Uma transição oferecida ao professor, com rótulo de ação e destaque. */
export interface TransicaoInfo {
  para: PlanStatus;
  /** Rótulo do botão (ação, não o nome do estado). */
  rotulo: string;
  /** `true` para a ação de avanço principal daquele estado (botão primário). */
  principal: boolean;
}

/** Rótulo de ação pt-BR para cada destino de transição. */
const ROTULO_ACAO: Record<PlanStatus, string> = {
  draft: 'Voltar para rascunho',
  pending_review: 'Enviar para revisão',
  approved: 'Aprovar',
  released: 'Liberar para o aluno',
  archived: 'Arquivar',
};

/** Qual destino é o avanço principal a partir de cada estado. */
const AVANCO_PRINCIPAL: Partial<Record<PlanStatus, PlanStatus>> = {
  draft: 'pending_review',
  pending_review: 'approved',
  approved: 'released',
};

/**
 * Transições oferecidas na UI, derivadas da MESMA tabela usada pela validação
 * no servidor (`TRANSICOES_STATUS` em `schemas/treino.ts`). Assim o controle do
 * professor nunca oferece uma transição que a Server Action vá rejeitar.
 */
export const TRANSICOES_STATUS_INFO: Record<PlanStatus, TransicaoInfo[]> =
  Object.fromEntries(
    (Object.keys(TRANSICOES_STATUS) as PlanStatus[]).map((de) => [
      de,
      TRANSICOES_STATUS[de].map((para) => ({
        para,
        rotulo: ROTULO_ACAO[para],
        principal: AVANCO_PRINCIPAL[de] === para,
      })),
    ])
  ) as Record<PlanStatus, TransicaoInfo[]>;
