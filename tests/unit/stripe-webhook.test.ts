import { afterEach, describe, expect, it, vi } from 'vitest';
import type Stripe from 'stripe';

import { mapWebhookEvent } from '@/lib/stripe/webhook-map';

/**
 * Testes HEADLESS do webhook do Stripe (design §6e / §12). O mapeamento
 * evento->estado é puro e testado diretamente; o route handler é testado com o
 * Stripe MOCKADO (nunca chama a API/rede real) para confirmar a rejeição de
 * assinatura inválida (400).
 */

// ---------------------------------------------------------------------------
// Mapa evento -> patch (função pura)
// ---------------------------------------------------------------------------
function evt(type: string, object: unknown): Stripe.Event {
  return { type, data: { object } } as unknown as Stripe.Event;
}

describe('mapWebhookEvent', () => {
  it('checkout.session.completed só vincula customer/subscription (sem status)', () => {
    const r = mapWebhookEvent(
      evt('checkout.session.completed', {
        metadata: { tenant_id: 'tenant-1' },
        customer: 'cus_123',
        subscription: 'sub_123',
      })
    );
    expect(r.ignored).toBe(false);
    expect(r.tenant.tenantId).toBe('tenant-1');
    expect(r.patch.stripe_customer_id).toBe('cus_123');
    expect(r.patch.stripe_subscription_id).toBe('sub_123');
    expect(r.patch.status).toBeUndefined();
  });

  it('customer.subscription.updated é autoritativo p/ status, período e price', () => {
    const r = mapWebhookEvent(
      evt('customer.subscription.updated', {
        id: 'sub_123',
        customer: 'cus_123',
        status: 'active',
        current_period_start: 1_700_000_000,
        current_period_end: 1_702_592_000,
        cancel_at_period_end: false,
        metadata: { tenant_id: 'tenant-1' },
        items: { data: [{ price: { id: 'price_team' } }] },
      })
    );
    expect(r.patch.status).toBe('active');
    expect(r.patch.stripe_subscription_id).toBe('sub_123');
    expect(r.patch.stripePriceId).toBe('price_team');
    expect(r.patch.current_period_start).toBe(new Date(1_700_000_000 * 1000).toISOString());
    expect(r.patch.cancel_at_period_end).toBe(false);
  });

  it('customer.subscription.deleted => canceled e limpa período', () => {
    const r = mapWebhookEvent(
      evt('customer.subscription.deleted', {
        id: 'sub_123',
        customer: 'cus_123',
        status: 'canceled',
      })
    );
    expect(r.patch.status).toBe('canceled');
    expect(r.patch.current_period_end).toBeNull();
  });

  it('invoice.payment_failed => past_due', () => {
    const r = mapWebhookEvent(evt('invoice.payment_failed', { customer: 'cus_123' }));
    expect(r.patch.status).toBe('past_due');
    expect(r.tenant.stripeCustomerId).toBe('cus_123');
  });

  it('invoice.payment_succeeded => active (com período quando presente)', () => {
    const r = mapWebhookEvent(
      evt('invoice.payment_succeeded', {
        customer: 'cus_123',
        lines: { data: [{ period: { start: 1_700_000_000, end: 1_702_592_000 } }] },
      })
    );
    expect(r.patch.status).toBe('active');
    expect(r.patch.current_period_end).toBe(new Date(1_702_592_000 * 1000).toISOString());
  });

  it('evento não tratado é ignorado', () => {
    const r = mapWebhookEvent(evt('customer.created', { id: 'cus_1' }));
    expect(r.ignored).toBe(true);
  });

  it('aceita customer/subscription como objeto expandido', () => {
    const r = mapWebhookEvent(
      evt('checkout.session.completed', {
        metadata: { tenant_id: 't1' },
        customer: { id: 'cus_exp' },
        subscription: { id: 'sub_exp' },
      })
    );
    expect(r.patch.stripe_customer_id).toBe('cus_exp');
    expect(r.patch.stripe_subscription_id).toBe('sub_exp');
  });
});

// ---------------------------------------------------------------------------
// Route handler: rejeição de assinatura inválida (Stripe MOCKADO)
// ---------------------------------------------------------------------------
const constructEventMock = vi.fn();

vi.mock('@/lib/stripe/server', () => ({
  getStripe: () => ({
    webhooks: { constructEvent: constructEventMock },
  }),
}));

afterEach(() => {
  vi.clearAllMocks();
  delete process.env.STRIPE_WEBHOOK_SECRET;
});

async function importRoute() {
  return import('@/app/api/stripe/webhook/route');
}

function makeRequest(body: string, headers: Record<string, string>): Request {
  return new Request('http://localhost/api/stripe/webhook', {
    method: 'POST',
    headers,
    body,
  });
}

describe('POST /api/stripe/webhook', () => {
  it('retorna 400 quando a assinatura é inválida (nunca chama a API real)', async () => {
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
    constructEventMock.mockImplementation(() => {
      throw new Error('invalid signature');
    });

    const { POST } = await importRoute();
    const res = await POST(
      makeRequest('{"id":"evt_1"}', { 'stripe-signature': 'sig_bad' })
    );
    expect(res.status).toBe(400);
    expect(constructEventMock).toHaveBeenCalledOnce();
  });

  it('retorna 400 quando falta o header de assinatura', async () => {
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
    const { POST } = await importRoute();
    const res = await POST(makeRequest('{}', {}));
    expect(res.status).toBe(400);
    expect(constructEventMock).not.toHaveBeenCalled();
  });

  it('retorna 500 quando o segredo do webhook não está configurado', async () => {
    const { POST } = await importRoute();
    const res = await POST(makeRequest('{}', { 'stripe-signature': 'sig' }));
    expect(res.status).toBe(500);
  });
});
