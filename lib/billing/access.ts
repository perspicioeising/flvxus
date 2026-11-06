import { cache } from 'react';
import { getSessionUser, type SessionUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { resolverAcesso, type EstadoAcesso } from '@/lib/billing/acesso';
import type { PerfilAcesso } from '@/lib/billing/mensagens';
import type { BillingCycle, SubscriptionStatus } from '@/types/database.types';

/**
 * Camada de servidor do estado de acesso. Lê a RPC `billing_tenant_state()`
 * (SECURITY DEFINER, tenant derivado do auth.uid()), que serve QUALQUER membro
 * do tenant (aluno vinculado herda o estado do tenant do personal) sem afrouxar
 * a RLS de `subscriptions`. Falha na leitura => FAIL-CLOSED.
 */
export interface Acesso extends EstadoAcesso {
  perfil: PerfilAcesso;
  /** TRUE quando a RPC falhou (fail-closed). */
  indisponivel: boolean;
  status: SubscriptionStatus | null;
  billingCycle: BillingCycle | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  hasStripeSubscription: boolean;
  hasStripeCustomer: boolean;
}

export function perfilDe(user: Pick<SessionUser, 'role' | 'isMaster' | 'accountType'>): PerfilAcesso {
  if (user.role === 'student') {
    return 'aluno';
  }
  if (!user.isMaster) {
    return 'filiado';
  }
  return user.accountType === 'self_managed' ? 'autonomo' : 'master';
}

interface LinhaEstado {
  status: SubscriptionStatus;
  tier: Acesso['tier'];
  billing_cycle: BillingCycle;
  trial_ends_at: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  has_stripe_subscription: boolean;
  has_stripe_customer: boolean;
}

/** Variante NÃO cacheada: usada pelas Server Actions que já têm o usuário. */
export async function getAccessFor(user: SessionUser): Promise<Acesso> {
  const perfil = perfilDe(user);
  const base: Acesso = {
    podeEscrever: false,
    motivo: 'sem_assinatura',
    tier: null,
    diasRestantesTrial: null,
    trialEndsAt: null,
    perfil,
    indisponivel: true,
    status: null,
    billingCycle: null,
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
    hasStripeSubscription: false,
    hasStripeCustomer: false,
  };
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc('billing_tenant_state');
    if (error || data == null) {
      console.error('[billing] falha ao ler o estado de acesso do tenant.');
      return base;
    }
    const linha = (Array.isArray(data) ? data[0] : data) as LinhaEstado | undefined;
    if (!linha) {
      return { ...base, indisponivel: false };
    }
    const estado = resolverAcesso({
      status: linha.status,
      tier: linha.tier,
      trialEndsAt: linha.trial_ends_at,
      hasStripeSubscription: linha.has_stripe_subscription,
    });
    return {
      ...estado,
      perfil,
      indisponivel: false,
      status: linha.status,
      billingCycle: linha.billing_cycle,
      currentPeriodEnd: linha.current_period_end,
      cancelAtPeriodEnd: linha.cancel_at_period_end,
      hasStripeSubscription: linha.has_stripe_subscription,
      hasStripeCustomer: linha.has_stripe_customer,
    };
  } catch {
    console.error('[billing] exceção ao ler o estado de acesso do tenant.');
    return base;
  }
}

const getAccessCached = cache(async () => {
  const user = await getSessionUser();
  return user ? getAccessFor(user) : null;
});

/** Estado de acesso do usuário logado (cacheado por render). `null` sem sessão. */
export function getAccess(): Promise<Acesso | null> {
  return getAccessCached();
}
