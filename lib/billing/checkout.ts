import { getAccessFor } from '@/lib/billing/access';
import { priceIdFor, tierCompativel } from '@/lib/billing/catalogo';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getStripe } from '@/lib/stripe/server';
import { siteUrl } from '@/lib/site-url';
import type { SessionUser } from '@/lib/auth';
import type { BillingCycle, PlanTier } from '@/types/database.types';

/**
 * Criação da sessão de Stripe Checkout (assinatura). Compartilhada pela action
 * do painel (`iniciarCheckout`) e pela rota `GET /assinar` (landing). O trial é
 * do APP (sem `trial_period_days`, sem cartão no cadastro): o cartão só é
 * pedido aqui. Autorização (master) é responsabilidade de quem chama.
 */
export type ResultadoCheckout =
  | { ok: true; url: string }
  | {
      ok: false;
      message: string;
      reason: 'conta_incompativel' | 'ja_assinante' | 'preco_ausente' | 'plano_inexistente' | 'stripe';
    };

const MSG_STRIPE = 'Não foi possível iniciar o checkout. Tente novamente.';

export async function criarSessaoCheckout(params: {
  user: SessionUser;
  tier: PlanTier;
  cycle: BillingCycle;
}): Promise<ResultadoCheckout> {
  const { user, tier, cycle } = params;

  // Tier × tipo de conta.
  if (!tierCompativel(user.accountType, tier)) {
    return {
      ok: false,
      reason: 'conta_incompativel',
      message: 'Este plano não está disponível para o seu tipo de conta.',
    };
  }

  const supabase = await createClient();
  const { data: plano, error: erroPlano } = await supabase
    .from('plans')
    .select('id, stripe_price_id_monthly, stripe_price_id_yearly')
    .eq('tier', tier)
    .eq('is_active', true)
    .single();
  if (erroPlano || !plano) {
    return { ok: false, reason: 'plano_inexistente', message: 'Plano não encontrado.' };
  }
  const priceId = priceIdFor(plano, cycle);
  if (!priceId) {
    return {
      ok: false,
      reason: 'preco_ausente',
      message:
        cycle === 'yearly'
          ? 'O plano anual ainda não foi configurado (price ID do Stripe ausente).'
          : 'O plano mensal ainda não foi configurado (price ID do Stripe ausente).',
    };
  }

  // Evita cobrança duplicada: assinatura real vigente ou inadimplente.
  const acesso = await getAccessFor(user);
  if (
    acesso.hasStripeSubscription &&
    (acesso.status === 'active' || acesso.status === 'past_due' || acesso.status === 'unpaid')
  ) {
    return {
      ok: false,
      reason: 'ja_assinante',
      message:
        acesso.status === 'active'
          ? 'Você já tem uma assinatura ativa. Use "Gerenciar assinatura" para trocar de plano.'
          : 'Não conseguimos confirmar o pagamento da sua assinatura. Use "Gerenciar assinatura" para atualizar a forma de pagamento.',
    };
  }

  try {
    const stripe = getStripe();
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('tenant_id', user.tenantId)
      .maybeSingle();
    let customerId = sub?.stripe_customer_id ?? null;
    if (!customerId) {
      const customer = await stripe.customers.create(
        {
          email: user.email ?? undefined,
          name: user.fullName ?? undefined,
          metadata: { tenant_id: user.tenantId },
        },
        { idempotencyKey: `customer-${user.tenantId}` }
      );
      customerId = customer.id;
      const admin = createAdminClient(user.tenantId);
      if (sub) {
        await admin.update('subscriptions', { stripe_customer_id: customerId });
      } else {
        await admin.insert('subscriptions', { stripe_customer_id: customerId });
      }
    }

    const checkout = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      client_reference_id: user.tenantId,
      line_items: [{ price: priceId, quantity: 1 }],
      locale: 'pt-BR',
      success_url: siteUrl('/professor/plano?checkout=sucesso'),
      cancel_url: siteUrl('/professor/plano?checkout=cancelado'),
      metadata: { tenant_id: user.tenantId, user_id: user.userId, tier, cycle },
      subscription_data: {
        metadata: { tenant_id: user.tenantId, tier, cycle },
      },
    });
    if (!checkout.url) {
      return { ok: false, reason: 'stripe', message: MSG_STRIPE };
    }
    return { ok: true, url: checkout.url };
  } catch (erro) {
    console.error(
      '[criarSessaoCheckout] Falha no Stripe:',
      erro instanceof Error ? erro.message : 'erro desconhecido'
    );
    return { ok: false, reason: 'stripe', message: MSG_STRIPE };
  }
}
