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
  /** event.created (ISO) do evento de status aplicado — ordenação do webhook. */
  stripe_event_at?: string;
  /** Família do evento de status aplicado — desempate do webhook. */
  stripe_event_kind?: 'subscription' | 'invoice';
}

/** Família do evento: decide as regras de ordenação em `deveAplicarEvento`. */
export type FamiliaEvento = 'subscription' | 'invoice' | 'checkout';

export interface WebhookMapResult {
  /** `true` quando o evento não afeta `subscriptions` (ignorado com 200). */
  ignored: boolean;
  /** Como localizar o tenant para gravar. */
  tenant: TenantHint;
  /** Alterações a aplicar (vazio quando ignored). */
  patch: SubscriptionPatch;
  /** Família do evento (undefined quando ignored). */
  kind?: FamiliaEvento;
  /** stripe_subscription_id a que o evento se refere (quando conhecido). */
  subscriptionId?: string;
  /** event.created em epoch-seconds (0 quando ausente). */
  created: number;
}

const IGNORED: WebhookMapResult = { ignored: true, tenant: {}, patch: {}, created: 0 };

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

/** Statuses aceitos pelo enum `subscription_status` (status fora dele é ignorado). */
const STATUSES_VALIDOS: readonly SubscriptionStatus[] = [
  'trialing',
  'active',
  'past_due',
  'canceled',
  'incomplete',
  'incomplete_expired',
  'unpaid',
];

/** Período da subscription: raiz (API antiga) ou `items.data[0]` (API `basil`). */
function periodoDaSubscription(sub: Stripe.Subscription): {
  start: number | null | undefined;
  end: number | null | undefined;
} {
  const item = sub.items?.data?.[0] as
    | { current_period_start?: number; current_period_end?: number }
    | undefined;
  return {
    start: sub.current_period_start ?? item?.current_period_start,
    end: sub.current_period_end ?? item?.current_period_end,
  };
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
  const created = typeof event.created === 'number' ? event.created : 0;
  const stampSub = { stripe_event_at: toIso(created) ?? undefined, stripe_event_kind: 'subscription' as const };
  const stampInv = { stripe_event_at: toIso(created) ?? undefined, stripe_event_kind: 'invoice' as const };
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const tenantId = session.metadata?.tenant_id ?? session.client_reference_id ?? undefined;
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
        kind: 'checkout',
        subscriptionId,
        created,
      };
    }

    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription;
      if (!STATUSES_VALIDOS.includes(sub.status as SubscriptionStatus)) {
        // Ex.: `paused` não existe no enum local; ignorar evita 500 eterno.
        console.warn('[stripe webhook] status de subscription ignorado:', sub.status);
        return IGNORED;
      }
      const periodo = periodoDaSubscription(sub);
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
          current_period_start: toIso(periodo.start),
          current_period_end: toIso(periodo.end),
          cancel_at_period_end: Boolean(sub.cancel_at_period_end),
          stripePriceId: firstPriceId(sub),
          ...stampSub,
        },
        kind: 'subscription',
        subscriptionId: sub.id,
        created,
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
          ...stampSub,
        },
        kind: 'subscription',
        subscriptionId: sub.id,
        created,
      };
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      return {
        ignored: false,
        tenant: { stripeCustomerId: idOf(invoice.customer) },
        patch: { status: 'past_due', ...stampInv },
        kind: 'invoice',
        subscriptionId: idOf(invoice.subscription as string | { id: string } | null | undefined),
        created,
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
          ...stampInv,
        },
        kind: 'invoice',
        subscriptionId: idOf(invoice.subscription as string | { id: string } | null | undefined),
        created,
      };
    }

    default:
      return IGNORED;
  }
}

/** Linha atual de `subscriptions` relevante para a ordenação. */
export interface LinhaOrdenacao {
  status: SubscriptionStatus;
  stripe_subscription_id: string | null;
  stripe_event_at: string | null;
  stripe_event_kind: 'subscription' | 'invoice' | null;
}

/**
 * Decide, de forma DETERMINÍSTICA, se um evento deve ser aplicado sobre a linha
 * atual (ordem/idempotência do webhook):
 *  - `canceled` é terminal para aquele stripe_subscription_id: qualquer evento
 *    dessa assinatura é descartado; só uma assinatura NOVA (outro id, via
 *    subscription ou checkout) reabre a linha;
 *  - `invoice.*` só vale para a assinatura da linha (id igual);
 *  - ordem temporal por `event.created` (> aplica; < descarta); empate:
 *    `subscription.*` vence `invoice.*`; mesma família reaplica (idempotente).
 */
export function deveAplicarEvento(
  linha: LinhaOrdenacao | null,
  ev: { kind: FamiliaEvento; subscriptionId?: string; created: number }
): boolean {
  if (!linha) {
    return true;
  }
  const mesmoId =
    linha.stripe_subscription_id != null && ev.subscriptionId === linha.stripe_subscription_id;

  if (linha.status === 'canceled' && linha.stripe_subscription_id != null) {
    if (mesmoId || ev.kind === 'invoice') {
      return false;
    }
    // Assinatura nova (outro id): reabre a linha.
    return true;
  }

  if (ev.kind === 'invoice') {
    if (!mesmoId) {
      return false;
    }
  }
  if (ev.kind === 'checkout') {
    return true;
  }
  if (linha.stripe_event_at == null) {
    return true;
  }
  const anterior = new Date(linha.stripe_event_at).getTime();
  const atual = ev.created * 1000;
  if (atual > anterior) {
    return true;
  }
  if (atual < anterior) {
    return false;
  }
  // Empate de timestamp.
  if (ev.kind === 'subscription') {
    return true;
  }
  return linha.stripe_event_kind !== 'subscription';
}
