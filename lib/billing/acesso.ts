import type { PlanTier, SubscriptionStatus } from '@/types/database.types';

/**
 * Estado de ACESSO do tenant (trial/ativo/inadimplente/cancelado/expirado).
 * Função PURA e testável sem banco: dado o que a assinatura tem, decide se o
 * tenant pode ESCREVER (criar/editar/executar) ou fica em SOMENTE LEITURA.
 * O gate real é `lib/billing/guard.ts`; a UI apenas espelha.
 */

export type MotivoAcesso =
  | 'assinatura_ativa'
  | 'trial_vigente'
  | 'trial_expirado'
  | 'pagamento_pendente'
  | 'cancelada'
  | 'incompleta'
  | 'sem_assinatura';

export interface EstadoAcesso {
  /** TRUE: assinatura_ativa | trial_vigente. */
  podeEscrever: boolean;
  motivo: MotivoAcesso;
  /** Tier do plano vigente (para entitlements). */
  tier: PlanTier | null;
  /** Dias restantes do trial (ceil); só em trial_vigente. */
  diasRestantesTrial: number | null;
  trialEndsAt: string | null;
}

export interface ResolverAcessoInput {
  /** null = tenant sem linha de assinatura. */
  status: SubscriptionStatus | null;
  tier: PlanTier | null;
  trialEndsAt: string | null;
  /** TRUE quando a linha tem stripe_subscription_id (a Stripe é autoritativa). */
  hasStripeSubscription: boolean;
  /** Injetável nos testes. */
  now?: Date;
}

const DIA_MS = 24 * 60 * 60 * 1000;

function semDireito(motivo: MotivoAcesso, tier: PlanTier | null, trialEndsAt: string | null): EstadoAcesso {
  return { podeEscrever: false, motivo, tier, diasRestantesTrial: null, trialEndsAt };
}

function motivoSemDireito(status: SubscriptionStatus): MotivoAcesso {
  switch (status) {
    case 'past_due':
    case 'unpaid':
      return 'pagamento_pendente';
    case 'canceled':
    case 'incomplete_expired':
      return 'cancelada';
    case 'incomplete':
      return 'incompleta';
    default:
      return 'sem_assinatura';
  }
}

export function resolverAcesso(input: ResolverAcessoInput): EstadoAcesso {
  const { status, tier, trialEndsAt, hasStripeSubscription } = input;
  const now = input.now ?? new Date();

  if (status == null) {
    return semDireito('sem_assinatura', null, null);
  }

  // Assinatura real: a Stripe é autoritativa; trial_ends_at é ignorado.
  if (hasStripeSubscription) {
    if (status === 'active' || status === 'trialing') {
      return { podeEscrever: true, motivo: 'assinatura_ativa', tier, diasRestantesTrial: null, trialEndsAt };
    }
    return semDireito(motivoSemDireito(status), tier, trialEndsAt);
  }

  // Sem assinatura real: só 'trialing' é o trial do app.
  if (status === 'trialing') {
    const fim = trialEndsAt ? new Date(trialEndsAt).getTime() : Number.NaN;
    if (Number.isFinite(fim) && fim > now.getTime()) {
      return {
        podeEscrever: true,
        motivo: 'trial_vigente',
        tier,
        diasRestantesTrial: Math.ceil((fim - now.getTime()) / DIA_MS),
        trialEndsAt,
      };
    }
    return semDireito('trial_expirado', tier, trialEndsAt);
  }
  // 'active' sem id Stripe (linha manual) conta como ativa.
  if (status === 'active') {
    return { podeEscrever: true, motivo: 'assinatura_ativa', tier, diasRestantesTrial: null, trialEndsAt };
  }
  return semDireito(motivoSemDireito(status), tier, trialEndsAt);
}
