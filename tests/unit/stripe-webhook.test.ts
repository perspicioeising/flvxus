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
// Route handler: rejeição de assinatura inválida (Stripe MOCKADO) + resolve de
// plan_id/billing_cycle por price mensal/anual/legado.
// ---------------------------------------------------------------------------
const constructEventMock = vi.fn();

vi.mock('@/lib/stripe/server', () => ({
  getStripe: () => ({
    webhooks: { constructEvent: constructEventMock },
  }),
}));

// Mock do service_role client: banco em memória (uma linha de `subscriptions`)
// que registra o `.or` da resolução de plano, sem rede. Reconfigurável por teste.
const { createClientMock, planRow, orSpy, upsertSpy, planSelectSpy, linha } = vi.hoisted(() => ({
  createClientMock: vi.fn(),
  planRow: { current: null as unknown },
  orSpy: vi.fn(),
  upsertSpy: vi.fn(),
  planSelectSpy: vi.fn(),
  linha: { current: null as Record<string, unknown> | null },
}));
vi.mock('@supabase/supabase-js', () => ({
  createClient: createClientMock,
}));
type Filtro = { col: string; val: unknown };
function makeDb() {
  return {
    from(table: string) {
      if (table === 'plans') {
        return {
          select: (cols: string) => {
            planSelectSpy(cols);
            return {
              or: (expr: string) => {
                orSpy(expr);
                return { maybeSingle: async () => ({ data: planRow.current }) };
              },
            };
          },
        };
      }
      if (table === 'subscriptions') {
        return {
          upsert: (payload: Record<string, unknown>, opts: unknown) => {
            upsertSpy(payload, opts);
            linha.current = { ...(linha.current ?? {}), ...payload };
            return Promise.resolve({ error: null });
          },
          select: () => {
            const filtros: Filtro[] = [];
            const q = {
              eq: (col: string, val: unknown) => {
                filtros.push({ col, val });
                return q;
              },
              maybeSingle: async () => {
                const row = linha.current;
                if (!row) return { data: null };
                const casa = filtros.every((f) => row[f.col] === f.val || f.col === 'tenant_id');
                return { data: casa ? { ...row } : null };
              },
            };
            return q;
          },
          update: (patch: Record<string, unknown>) => {
            const filtros: Filtro[] = [];
            const q = {
              eq: (col: string, val: unknown) => {
                filtros.push({ col, val });
                return q;
              },
              is: (col: string, val: unknown) => {
                filtros.push({ col, val });
                return q;
              },
              select: async () => {
                const row = linha.current;
                const casa =
                  row != null &&
                  filtros.every(
                    (f) => f.col === 'tenant_id' || (row[f.col] ?? null) === f.val
                  );
                if (casa) {
                  linha.current = { ...row, ...patch };
                  return { data: [{ tenant_id: 'tenant-1' }] };
                }
                return { data: [] };
              },
            };
            return q;
          },
        };
      }
      throw new Error(`tabela inesperada no mock: ${table}`);
    },
  };
}
afterEach(() => {
  vi.clearAllMocks();
  delete process.env.STRIPE_WEBHOOK_SECRET;
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  planRow.current = null;
  linha.current = null;
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

describe('POST /api/stripe/webhook — resolve de plan_id/billing_cycle', () => {
  function setupEnv() {
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';
    createClientMock.mockReturnValue(makeDb());
  }

  function subscriptionEvent(priceId: string): Stripe.Event {
    return {
      type: 'customer.subscription.updated',
      data: {
        object: {
          id: 'sub_123',
          customer: 'cus_123',
          status: 'active',
          current_period_start: 1_700_000_000,
          current_period_end: 1_702_592_000,
          cancel_at_period_end: false,
          metadata: { tenant_id: 'tenant-1' },
          items: { data: [{ price: { id: priceId } }] },
        },
      },
    } as unknown as Stripe.Event;
  }

  it('deriva billing_cycle=yearly quando casa a coluna anual', async () => {
    setupEnv();
    planRow.current = {
      id: 'plan-1',
      stripe_price_id_monthly: 'price_month',
      stripe_price_id_yearly: 'price_year',
    };
    constructEventMock.mockReturnValue(subscriptionEvent('price_year'));

    const { POST } = await importRoute();
    const res = await POST(makeRequest('{}', { 'stripe-signature': 'sig' }));

    expect(res.status).toBe(200);
    // O filtro `.or` cobre as 3 colunas (mensal/anual/legado).
    expect(orSpy).toHaveBeenCalledWith(
      'stripe_price_id_monthly.eq.price_year,stripe_price_id_yearly.eq.price_year,stripe_price_id.eq.price_year'
    );
    const [payload] = upsertSpy.mock.calls[0];
    expect(payload).toMatchObject({ plan_id: 'plan-1', billing_cycle: 'yearly' });
  });

  it('deriva billing_cycle=monthly quando casa a coluna mensal', async () => {
    setupEnv();
    planRow.current = {
      id: 'plan-1',
      stripe_price_id_monthly: 'price_month',
      stripe_price_id_yearly: 'price_year',
    };
    constructEventMock.mockReturnValue(subscriptionEvent('price_month'));

    const { POST } = await importRoute();
    const res = await POST(makeRequest('{}', { 'stripe-signature': 'sig' }));

    expect(res.status).toBe(200);
    const [payload] = upsertSpy.mock.calls[0];
    expect(payload).toMatchObject({ plan_id: 'plan-1', billing_cycle: 'monthly' });
  });

  it('price malformado => não consulta plans nem grava plan_id/billing_cycle', async () => {
    setupEnv();
    // price com caractere inválido (burla de operador PostgREST).
    constructEventMock.mockReturnValue(subscriptionEvent('price_bad,injection'));

    const { POST } = await importRoute();
    const res = await POST(makeRequest('{}', { 'stripe-signature': 'sig' }));

    expect(res.status).toBe(200);
    expect(orSpy).not.toHaveBeenCalled();
    const [payload] = upsertSpy.mock.calls[0];
    expect(payload).not.toHaveProperty('plan_id');
    expect(payload).not.toHaveProperty('billing_cycle');
  });
});

// ---------------------------------------------------------------------------
// Ordem / idempotência / robustez (banco em memória)
// ---------------------------------------------------------------------------
import { deveAplicarEvento } from '@/lib/stripe/webhook-map';

describe('deveAplicarEvento (puro)', () => {
  const ativa = {
    status: 'active' as const,
    stripe_subscription_id: 'sub_1',
    stripe_event_at: new Date(2_000_000 * 1000).toISOString(),
    stripe_event_kind: 'subscription' as const,
  };

  it('sem linha => aplica', () => {
    expect(deveAplicarEvento(null, { kind: 'subscription', subscriptionId: 'sub_1', created: 1 })).toBe(true);
  });

  it('evento antigo é descartado; novo é aplicado; mesmo timestamp da mesma família reaplica', () => {
    expect(deveAplicarEvento(ativa, { kind: 'subscription', subscriptionId: 'sub_1', created: 1_999_999 })).toBe(false);
    expect(deveAplicarEvento(ativa, { kind: 'subscription', subscriptionId: 'sub_1', created: 2_000_001 })).toBe(true);
    expect(deveAplicarEvento(ativa, { kind: 'subscription', subscriptionId: 'sub_1', created: 2_000_000 })).toBe(true);
  });

  it('empate de timestamp: subscription vence invoice nas duas ordens de chegada', () => {
    // linha já tem subscription no mesmo instante => invoice descartada
    expect(deveAplicarEvento(ativa, { kind: 'invoice', subscriptionId: 'sub_1', created: 2_000_000 })).toBe(false);
    // linha tem invoice no mesmo instante => subscription aplicada
    const comInvoice = { ...ativa, stripe_event_kind: 'invoice' as const };
    expect(deveAplicarEvento(comInvoice, { kind: 'subscription', subscriptionId: 'sub_1', created: 2_000_000 })).toBe(true);
  });

  it('canceled é terminal para o mesmo id; assinatura nova (outro id) reabre', () => {
    const cancelada = { ...ativa, status: 'canceled' as const };
    expect(deveAplicarEvento(cancelada, { kind: 'subscription', subscriptionId: 'sub_1', created: 9_999_999 })).toBe(false);
    expect(deveAplicarEvento(cancelada, { kind: 'invoice', subscriptionId: 'sub_1', created: 9_999_999 })).toBe(false);
    expect(deveAplicarEvento(cancelada, { kind: 'invoice', subscriptionId: 'sub_2', created: 9_999_999 })).toBe(false);
    expect(deveAplicarEvento(cancelada, { kind: 'subscription', subscriptionId: 'sub_2', created: 9_999_999 })).toBe(true);
  });

  it('invoice de outra assinatura (ou sem assinatura) é descartada', () => {
    expect(deveAplicarEvento(ativa, { kind: 'invoice', subscriptionId: 'sub_outra', created: 9_999_999 })).toBe(false);
    expect(deveAplicarEvento(ativa, { kind: 'invoice', subscriptionId: undefined, created: 9_999_999 })).toBe(false);
  });
});

describe('POST /api/stripe/webhook — ordem, idempotência e robustez', () => {
  function setupEnv() {
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';
    createClientMock.mockReturnValue(makeDb());
  }
  function ev(type: string, created: number, object: Record<string, unknown>): Stripe.Event {
    return { type, created, data: { object } } as unknown as Stripe.Event;
  }
  const sub = (status: string, extra: Record<string, unknown> = {}) => ({
    id: 'sub_1',
    customer: 'cus_1',
    status,
    current_period_start: 1_700_000_000,
    current_period_end: 1_702_592_000,
    cancel_at_period_end: false,
    metadata: { tenant_id: 'tenant-1' },
    items: { data: [{ price: { id: 'price_bad,x' } }] },
    ...extra,
  });
  const invoice = (subscription: string | null) => ({
    customer: 'cus_1',
    subscription,
    lines: { data: [{ period: { start: 1_700_000_000, end: 1_702_592_000 } }] },
  });
  async function enviar(evento: Stripe.Event): Promise<Response> {
    constructEventMock.mockReturnValue(evento);
    const { POST } = await importRoute();
    return POST(makeRequest('{}', { 'stripe-signature': 'sig' }));
  }

  it('o mesmo evento duas vezes => mesmo estado final (idempotente)', async () => {
    setupEnv();
    const e = ev('customer.subscription.updated', 100, sub('active'));
    expect((await enviar(e)).status).toBe(200);
    const aposPrimeira = { ...linha.current };
    expect((await enviar(e)).status).toBe(200);
    expect(linha.current).toEqual(aposPrimeira);
    expect(linha.current).toMatchObject({ status: 'active', stripe_subscription_id: 'sub_1' });
  });

  it('subscription.deleted (t2) e invoice.payment_succeeded atrasado (t1<t2) => permanece canceled', async () => {
    setupEnv();
    await enviar(ev('customer.subscription.updated', 50, sub('active')));
    await enviar(ev('customer.subscription.deleted', 200, sub('canceled')));
    expect(linha.current).toMatchObject({ status: 'canceled' });
    await enviar(ev('invoice.payment_succeeded', 100, invoice('sub_1')));
    expect(linha.current).toMatchObject({ status: 'canceled' });
  });

  it('empate de created entre deleted e invoice.payment_succeeded => canceled nas duas ordens', async () => {
    setupEnv();
    // Ordem A: deleted depois invoice
    await enviar(ev('customer.subscription.updated', 50, sub('active')));
    await enviar(ev('customer.subscription.deleted', 300, sub('canceled')));
    await enviar(ev('invoice.payment_succeeded', 300, invoice('sub_1')));
    expect(linha.current).toMatchObject({ status: 'canceled' });
    // Ordem B: invoice depois deleted
    linha.current = null;
    await enviar(ev('customer.subscription.updated', 50, sub('active')));
    await enviar(ev('invoice.payment_succeeded', 300, invoice('sub_1')));
    await enviar(ev('customer.subscription.deleted', 300, sub('canceled')));
    expect(linha.current).toMatchObject({ status: 'canceled' });
  });

  it('canceled é terminal para o mesmo id; subscription nova (outro id) reabre', async () => {
    setupEnv();
    await enviar(ev('customer.subscription.updated', 50, sub('active')));
    await enviar(ev('customer.subscription.deleted', 100, sub('canceled')));
    await enviar(ev('customer.subscription.updated', 500, sub('active')));
    expect(linha.current).toMatchObject({ status: 'canceled' });
    await enviar(ev('customer.subscription.created', 600, sub('active', { id: 'sub_2' })));
    expect(linha.current).toMatchObject({ status: 'active', stripe_subscription_id: 'sub_2' });
  });

  it('invoice de outra assinatura é ignorada (200, sem alterar a linha)', async () => {
    setupEnv();
    await enviar(ev('customer.subscription.updated', 50, sub('active')));
    const res = await enviar(ev('invoice.payment_failed', 900, invoice('sub_antiga')));
    expect(res.status).toBe(200);
    expect(linha.current).toMatchObject({ status: 'active' });
  });

  it('invoice.payment_failed da assinatura da linha => past_due', async () => {
    setupEnv();
    await enviar(ev('customer.subscription.updated', 50, sub('active')));
    await enviar(ev('invoice.payment_failed', 150, invoice('sub_1')));
    expect(linha.current).toMatchObject({ status: 'past_due' });
  });

  it('status fora do enum (paused) => ignorado com 200, sem gravar', async () => {
    setupEnv();
    const res = await enviar(ev('customer.subscription.updated', 50, sub('paused')));
    expect(res.status).toBe(200);
    expect(linha.current).toBeNull();
    expect(upsertSpy).not.toHaveBeenCalled();
  });

  it('período lido de items.data[0] quando o raiz não existe (API basil)', async () => {
    setupEnv();
    const s = sub('active', {
      current_period_start: undefined,
      current_period_end: undefined,
      items: {
        data: [
          {
            price: { id: 'price_bad,x' },
            current_period_start: 1_700_000_000,
            current_period_end: 1_702_592_000,
          },
        ],
      },
    });
    await enviar(ev('customer.subscription.updated', 50, s));
    expect(linha.current).toMatchObject({
      current_period_end: new Date(1_702_592_000 * 1000).toISOString(),
    });
  });

  it('checkout.session.completed só vincula (usa client_reference_id) e não altera status', async () => {
    setupEnv();
    const res = await enviar(
      ev('checkout.session.completed', 10, {
        client_reference_id: 'tenant-1',
        customer: 'cus_1',
        subscription: 'sub_1',
      })
    );
    expect(res.status).toBe(200);
    expect(linha.current).toMatchObject({
      tenant_id: 'tenant-1',
      stripe_customer_id: 'cus_1',
      stripe_subscription_id: 'sub_1',
    });
    expect(linha.current).not.toHaveProperty('status');
  });

  it('tenant não resolvido => 200 sem gravar', async () => {
    setupEnv();
    const res = await enviar(
      ev('invoice.payment_failed', 10, { customer: 'cus_desconhecido', subscription: 'sub_1' })
    );
    expect(res.status).toBe(200);
    expect(linha.current).toBeNull();
  });

  it('mapeia o price ID do plano anual da Assessoria para plan_id e ciclo yearly', async () => {
    setupEnv();
    planRow.current = {
      id: 'plan-assessoria',
      stripe_price_id_monthly: 'price_1UYFcfFVM32R4q9lOZ5d4yoo',
      stripe_price_id_yearly: 'price_1UYFcfFVM32R4q9lkULnJvme',
    };
    await enviar(
      ev(
        'customer.subscription.updated',
        50,
        sub('active', { items: { data: [{ price: { id: 'price_1UYFcfFVM32R4q9lkULnJvme' } }] } })
      )
    );
    expect(linha.current).toMatchObject({ plan_id: 'plan-assessoria', billing_cycle: 'yearly' });
  });
});
