import type Stripe from 'stripe';

import type { SubscriptionStatus } from '@/types/database.types';

/**
 * Mapeamento PURO evento Stripe -> estado local de `subscriptions` (design §6e).
 * Extraído para testar headless (sem rede) o mapa evento->status e a resolução
 * de tenant/customer/subscription. O route handler aplica o resultado via
 * service_role, idempotente por stripe_subscription_id.
 *
 * Autoridade por evento (MED #5):
 *  - checkout.session.completed: só VINCULA tenant<->Stripe (customer/subscription)
 *    via metadata.tenant_id. NÃO decide status/plan_id.
 *  - customer.subscription.created/.updated: autoritativo para status, período,
 *    cancel_at_period_end e o price (→ plan_id via lookup posterior).
 *  - customer.subscription.deleted: status canceled, limpa período.
 *  - invoice.payment_failed: status past_due.
 *  - invoice.payment_succeeded: status active, atualiza período (se presente).
 */

/** Campos que o handler usa para resolver o tenant antes de gravar. */
export interface TenantHint {
  /** tenant_id vindo de metadata (checkout) — vínculo direto. */
  tenantId?: string;
  /** customer do Stripe — usado para achar o tenant quando metadata ausente. */
  stripeCustomerId?: string;
}

/** Patch a aplicar na linha de `subscriptions` (campos presentes = a gravar). */
export interface SubscriptionPatch {
  status?: SubscriptionStatus;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  current_period_start?: string | null;
  current_period_end?: string | null;
  cancel_at_period_end?: boolean;
  /** Price ID do item da subscription; o handler resolve → plan_id. */
  stripePriceId?: string;
}

export interface WebhookMapResult {
  /** `true` quando o evento não afeta `subscriptions` (ignorado com 200). */
  ignored: boolean;
  /** Como localizar o tenant para gravar. */
  tenant: TenantHint;
  /** Alterações a aplicar (vazio quando ignored). */
  patch: SubscriptionPatch;
}

const IGNORED: WebhookMapResult = { ignored: true, tenant: {}, patch: {} };

/** Converte epoch-seconds do Stripe em ISO-8601 (ou null). */
function toIso(epochSeconds: number | null | undefined): string | null {
  if (epochSeconds == null) {
    return null;
  }
  return new Date(epochSeconds * 1000).toISOString();
}

/** Extrai o price id do primeiro item da subscription (quando houver). */
function firstPriceId(sub: Stripe.Subscription): string | undefined {
  const item = sub.items?.data?.[0];
  return item?.price?.id ?? undefined;
}

/** Normaliza um id que pode vir como string ou objeto expandido do Stripe. */
function idOf(value: string | { id: string } | null | undefined): string | undefined {
  if (value == null) {
    return undefined;
  }
  return typeof value === 'string' ? value : value.id;
}

/**
 * Mapeia um evento do Stripe para o patch local. Função pura e total: qualquer
 * tipo não tratado vira `ignored` (o handler responde 200 sem gravar).
 */
export function mapWebhookEvent(event: Stripe.Event): WebhookMapResult {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const tenantId = session.metadata?.tenant_id ?? undefined;
      const customerId = idOf(session.customer);
      const subscriptionId = idOf(session.subscription);
      // Só vincula tenant<->Stripe; NÃO decide status/plan_id (MED #5).
      return {
        ignored: false,
        tenant: { tenantId, stripeCustomerId: customerId },
        patch: {
          stripe_customer_id: customerId ?? null,
          stripe_subscription_id: subscriptionId ?? null,
        },
      };
    }

    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription;
      return {
        ignored: false,
        tenant: {
          tenantId: sub.metadata?.tenant_id ?? undefined,
          stripeCustomerId: idOf(sub.customer),
        },
        patch: {
          status: sub.status as SubscriptionStatus,
          stripe_subscription_id: sub.id,
          stripe_customer_id: idOf(sub.customer) ?? null,
          current_period_start: toIso(sub.current_period_start),
          current_period_end: toIso(sub.current_period_end),
          cancel_at_period_end: Boolean(sub.cancel_at_period_end),
          stripePriceId: firstPriceId(sub),
        },
      };
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      return {
        ignored: false,
        tenant: {
          tenantId: sub.metadata?.tenant_id ?? undefined,
          stripeCustomerId: idOf(sub.customer),
        },
        patch: {
          status: 'canceled',
          stripe_subscription_id: sub.id,
          current_period_start: null,
          current_period_end: null,
        },
      };
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      return {
        ignored: false,
        tenant: { stripeCustomerId: idOf(invoice.customer) },
        patch: { status: 'past_due' },
      };
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice;
      const period = invoice.lines?.data?.[0]?.period;
      return {
        ignored: false,
        tenant: { stripeCustomerId: idOf(invoice.customer) },
        patch: {
          status: 'active',
          current_period_start: toIso(period?.start),
          current_period_end: toIso(period?.end),
        },
      };
    }

    default:
      return IGNORED;
  }
}
