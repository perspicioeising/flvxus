import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Testes HEADLESS de `iniciarCheckout` com Supabase e Stripe MOCKADOS (design
 * §12). Cobre: gate master-only, recusa de plano sem price configurado, e o
 * caminho feliz (nunca chama a API real do Stripe).
 */

const {
  assertMasterMock,
  planSingleMock,
  subMaybeSingleMock,
  customersCreateMock,
  checkoutCreateMock,
  adminInsertMock,
  adminUpdateMock,
} = vi.hoisted(() => ({
  assertMasterMock: vi.fn(),
  planSingleMock: vi.fn(),
  subMaybeSingleMock: vi.fn(),
  customersCreateMock: vi.fn(),
  checkoutCreateMock: vi.fn(),
  adminInsertMock: vi.fn(),
  adminUpdateMock: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({ assertMaster: assertMasterMock }));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    from: (table: string) => {
      if (table === 'plans') {
        return { select: () => ({ eq: () => ({ single: planSingleMock }) }) };
      }
      // subscriptions
      return { select: () => ({ eq: () => ({ maybeSingle: subMaybeSingleMock }) }) };
    },
  })),
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    insert: adminInsertMock,
    update: adminUpdateMock,
  })),
}));

vi.mock('@/lib/stripe/server', () => ({
  getStripe: () => ({
    customers: { create: customersCreateMock },
    checkout: { sessions: { create: checkoutCreateMock } },
  }),
}));

vi.mock('@/lib/site-url', () => ({ siteUrl: (p: string) => `http://localhost:3000${p}` }));

import { iniciarCheckout } from '@/actions/billing';

const MASTER = {
  userId: 'master-1',
  role: 'trainer' as const,
  tenantId: 'tenant-1',
  email: 'master@ex.com',
  fullName: 'Master',
  avatarUrl: null,
  isMaster: true,
};

function fd(obj: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(obj)) f.append(k, v);
  return f;
}

beforeEach(() => {
  vi.clearAllMocks();
  assertMasterMock.mockResolvedValue(MASTER);
  planSingleMock.mockResolvedValue({ data: { id: 'plan-team', stripe_price_id: 'price_team' }, error: null });
  subMaybeSingleMock.mockResolvedValue({ data: { stripe_customer_id: 'cus_123' }, error: null });
  checkoutCreateMock.mockResolvedValue({ url: 'https://checkout.stripe.test/sess_1' });
  adminInsertMock.mockResolvedValue({ error: null });
  adminUpdateMock.mockResolvedValue({ error: null });
});

describe('iniciarCheckout', () => {
  it('recusa não-master', async () => {
    assertMasterMock.mockResolvedValueOnce(null);
    const r = await iniciarCheckout(undefined, fd({ tier: 'team' }));
    expect(r.ok).toBe(false);
    expect(checkoutCreateMock).not.toHaveBeenCalled();
  });

  it('recusa plano sem price configurado (placeholder)', async () => {
    planSingleMock.mockResolvedValueOnce({ data: { id: 'plan-solo', stripe_price_id: null }, error: null });
    const r = await iniciarCheckout(undefined, fd({ tier: 'solo' }));
    expect(r.ok).toBe(false);
    expect(r.message).toMatch(/price/i);
    expect(checkoutCreateMock).not.toHaveBeenCalled();
  });

  it('cria a checkout session e retorna a url (customer já existe)', async () => {
    const r = await iniciarCheckout(undefined, fd({ tier: 'team' }));
    expect(r.ok).toBe(true);
    expect(r.url).toBe('https://checkout.stripe.test/sess_1');
    expect(customersCreateMock).not.toHaveBeenCalled();
    const [args] = checkoutCreateMock.mock.calls[0];
    expect(args).toMatchObject({
      mode: 'subscription',
      customer: 'cus_123',
      metadata: { tenant_id: 'tenant-1' },
    });
  });

  it('cria o customer quando ausente e segue para o checkout', async () => {
    subMaybeSingleMock.mockResolvedValueOnce({ data: null, error: null });
    customersCreateMock.mockResolvedValueOnce({ id: 'cus_new' });
    const r = await iniciarCheckout(undefined, fd({ tier: 'team' }));
    expect(r.ok).toBe(true);
    expect(customersCreateMock).toHaveBeenCalledOnce();
    const [args] = checkoutCreateMock.mock.calls[0];
    expect(args.customer).toBe('cus_new');
  });

  it('rejeita tier inválido', async () => {
    const r = await iniciarCheckout(undefined, fd({ tier: 'enterprise' }));
    expect(r.ok).toBe(false);
  });
});
