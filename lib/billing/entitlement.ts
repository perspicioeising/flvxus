import type { SubscriptionStatus, VisibilityModule } from '@/types/database.types';

/**
 * Helpers PUROS de decisão de billing/visibilidade (Fase 3 / design.md §12).
 *
 * Fonte ÚNICA da decisão para a UI (desabilitar botão, rotular status). A
 * fronteira de SEGURANÇA continua sendo a RPC `can_add_affiliate()` e a RLS
 * condicional — estes helpers apenas ESPELHAM a mesma regra, de forma testável
 * sem banco (headless).
 */

/** Statuses de assinatura que dão direito a filiados (design §5). */
export const STATUSES_COM_DIREITO: readonly SubscriptionStatus[] = ['active', 'trialing'];

/** TRUE se o status dá direito a ter/adicionar filiados. */
export function statusComDireito(status: SubscriptionStatus | null | undefined): boolean {
  return status != null && STATUSES_COM_DIREITO.includes(status);
}

export interface CanAddAffiliateInput {
  /** Status da assinatura do tenant (null = sem assinatura). */
  status: SubscriptionStatus | null | undefined;
  /** Limite do plano: null = ilimitado; 0 = Solo (nenhum filiado). */
  maxAffiliates: number | null | undefined;
  /** Filiados ATIVOS atuais (role trainer, não-master, não desativados). */
  usedActive: number;
  /** TRUE quando o plano vigente tem price/plano resolvido (plan_id não nulo). */
  hasResolvedPlan?: boolean;
}

/**
 * Espelha a RPC `can_add_affiliate()` (design §6f / MED #8):
 *  - sem status com direito => false (0 filiados);
 *  - plano não resolvido (hasResolvedPlan=false) => false (lado seguro);
 *  - maxAffiliates = 0 (Solo) => false sempre;
 *  - maxAffiliates = null (ilimitado) com plano ativo => true;
 *  - senão => usedActive < maxAffiliates.
 */
export function canAddAffiliate({
  status,
  maxAffiliates,
  usedActive,
  hasResolvedPlan = true,
}: CanAddAffiliateInput): boolean {
  if (!statusComDireito(status)) {
    return false;
  }
  if (!hasResolvedPlan) {
    return false;
  }
  if (maxAffiliates === null || maxAffiliates === undefined) {
    return true; // ilimitado (plano ativo)
  }
  if (maxAffiliates <= 0) {
    return false; // Solo: nenhum filiado
  }
  return usedActive < maxAffiliates;
}

/**
 * Espelha `app_module_is_open` (design §3/§4): ausência de config para o módulo
 * => LIBERADO (true), preservando o comportamento atual (visão geral).
 */
export function moduleIsOpen(
  config: Partial<Record<VisibilityModule, boolean>> | null | undefined,
  module: VisibilityModule
): boolean {
  if (!config || config[module] === undefined) {
    return true;
  }
  return Boolean(config[module]);
}
