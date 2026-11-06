import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Testes HEADLESS do checkout (Stripe e Supabase MOCKADOS; nenhuma chamada
 * real). Cobre: gate master, tier×tipo de conta, mapeamento tier×ciclo→price
 * ID (6 combinações), ausência de trial da Stripe, vínculo tenant/usuário,
 * guarda contra assinatura duplicada e o Customer Portal.
 */
const {
  assertMasterMock,
  planSingleMock,
  subMaybeSingleMock,
  customersCreateMock,
  checkoutCreateMock,
  portalCreateMock,
  adminInsertMock,
  adminUpdateMock,
  getAccessForMock,
} = vi.hoisted(() => ({
  assertMasterMock: vi.fn(),
  planSingleMock: vi.fn(),
  subMaybeSingleMock: vi.fn(),
  customersCreateMock: vi.fn(),
  checkoutCreateMock: vi.fn(),
  portalCreateMock: vi.fn(),
  adminInsertMock: vi.fn(),
  adminUpdateMock: vi.fn(),
  getAccessForMock: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({ assertMaster: assertMasterMock }));
vi.mock('@/lib/billing/access', () => ({ getAccessFor: getAccessForMock }));
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    from: (table: string) => {
      if (table === 'plans') {
        return { select: () => ({ eq: () => ({ eq: () => ({ single: planSingleMock }) }) }) };
      }
      return { select: () => ({ eq: () => ({ maybeSingle: subMaybeSingleMock }) }) };
    },
  })),
}));
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({ insert: adminInsertMock, update: adminUpdateMock })),
}));
vi.mock('@/lib/stripe/server', () => ({
  getStripe: () => ({
    customers: { create: customersCreateMock },
    checkout: { sessions: { create: checkoutCreateMock } },
    billingPortal: { sessions: { create: portalCreateMock } },
  }),
}));
vi.mock('@/lib/site-url', () => ({ siteUrl: (p: string) => `http://localhost:3000${p}` }));

import { abrirPortal, iniciarCheckout } from '@/actions/billing';
import { priceIdFor, tierCompativel } from '@/lib/billing/catalogo';

const PRICE_IDS = {
  individual: {
    monthly: 'price_1UYFXIFVM32R4q9lSAvbZEEe',
    yearly: 'price_1UYFXIFVM32R4q9lQJR8i0yZ',
  },
  personal: {
    monthly: 'price_1UYFYqFVM32R4q9lOi2nj7d3',
    yearly: 'price_1UYFa6FVM32R4q9l6qAc3WKe',
  },
  assessoria: {
    monthly: 'price_1UYFcfFVM32R4q9lOZ5d4yoo',
    yearly: 'price_1UYFcfFVM32R4q9lkULnJvme',
  },
} as const;

const MASTER = {
  userId: 'master-1',
  role: 'trainer' as const,
  tenantId: 'tenant-1',
  email: 'master@ex.com',
  fullName: 'Master',
  avatarUrl: null,
  isMaster: true,
  accountType: 'professional' as const,
};
const AUTONOMO = { ...MASTER, accountType: 'self_managed' as const };

function fd(obj: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(obj)) f.append(k, v);
  return f;
}

function planoDe(tier: keyof typeof PRICE_IDS) {
  return {
    id: `plan-${tier}`,
    stripe_price_id_monthly: PRICE_IDS[tier].monthly,
    stripe_price_id_yearly: PRICE_IDS[tier].yearly,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  assertMasterMock.mockResolvedValue(MASTER);
  planSingleMock.mockResolvedValue({ data: planoDe('personal'), error: null });
  subMaybeSingleMock.mockResolvedValue({ data: { stripe_customer_id: 'cus_123' }, error: null });
  checkoutCreateMock.mockResolvedValue({ url: 'https://checkout.stripe.test/sess_1' });
  getAccessForMock.mockResolvedValue({ hasStripeSubscription: false, status: 'trialing' });
  adminInsertMock.mockResolvedValue({ error: null });
  adminUpdateMock.mockResolvedValue({ error: null });
});

describe('priceIdFor / tierCompativel (puros)', () => {
  it.each([
    ['individual', 'monthly'],
    ['individual', 'yearly'],
    ['personal', 'monthly'],
    ['personal', 'yearly'],
    ['assessoria', 'monthly'],
    ['assessoria', 'yearly'],
  ] as const)('%s × %s → price ID correto', (tier, cycle) => {
    expect(priceIdFor(planoDe(tier), cycle)).toBe(PRICE_IDS[tier][cycle]);
  });

  it('price ausente/vazio => null', () => {
    expect(priceIdFor({ stripe_price_id_monthly: null, stripe_price_id_yearly: '' }, 'monthly')).toBeNull();
    expect(priceIdFor({ stripe_price_id_monthly: null, stripe_price_id_yearly: '' }, 'yearly')).toBeNull();
  });

  it('autônomo só contrata individual; profissional só personal/assessoria', () => {
    expect(tierCompativel('self_managed', 'individual')).toBe(true);
    expect(tierCompativel('self_managed', 'personal')).toBe(false);
    expect(tierCompativel('professional', 'individual')).toBe(false);
    expect(tierCompativel('professional', 'personal')).toBe(true);
    expect(tierCompativel('professional', 'assessoria')).toBe(true);
  });
});

describe('iniciarCheckout', () => {
  it('recusa não-master', async () => {
    assertMasterMock.mockResolvedValueOnce(null);
    const r = await iniciarCheckout(undefined, fd({ tier: 'personal', cycle: 'monthly' }));
    expect(r.ok).toBe(false);
    expect(r.message).toBe('Acesso negado.');
    expect(checkoutCreateMock).not.toHaveBeenCalled();
  });

  it('rejeita tier inválido e tiers legados', async () => {
    for (const tier of ['enterprise', 'team', 'solo', 'gym']) {
      const r = await iniciarCheckout(undefined, fd({ tier, cycle: 'monthly' }));
      expect(r.ok).toBe(false);
    }
    expect(checkoutCreateMock).not.toHaveBeenCalled();
  });

  it('recusa plano sem price do ciclo configurado', async () => {
    planSingleMock.mockResolvedValueOnce({
      data: { id: 'p', stripe_price_id_monthly: null, stripe_price_id_yearly: null },
      error: null,
    });
    const r = await iniciarCheckout(undefined, fd({ tier: 'personal', cycle: 'monthly' }));
    expect(r.ok).toBe(false);
    expect(r.message).toMatch(/price/i);
    expect(checkoutCreateMock).not.toHaveBeenCalled();
  });

  it('plano inexistente => mensagem de plano não encontrado', async () => {
    planSingleMock.mockResolvedValueOnce({ data: null, error: { message: 'x' } });
    const r = await iniciarCheckout(undefined, fd({ tier: 'personal', cycle: 'monthly' }));
    expect(r.ok).toBe(false);
    expect(r.message).toBe('Plano não encontrado.');
  });

  it('profissional × individual e autônomo × personal => conta incompatível', async () => {
    const a = await iniciarCheckout(undefined, fd({ tier: 'individual', cycle: 'monthly' }));
    expect(a.ok).toBe(false);
    assertMasterMock.mockResolvedValueOnce(AUTONOMO);
    const b = await iniciarCheckout(undefined, fd({ tier: 'personal', cycle: 'monthly' }));
    expect(b.ok).toBe(false);
    expect(checkoutCreateMock).not.toHaveBeenCalled();
  });

  it.each([
    ['personal', 'monthly', MASTER],
    ['personal', 'yearly', MASTER],
    ['assessoria', 'monthly', MASTER],
    ['assessoria', 'yearly', MASTER],
    ['individual', 'monthly', AUTONOMO],
    ['individual', 'yearly', AUTONOMO],
  ] as const)(
    '%s × %s usa o price ID certo, sem trial da Stripe e com vínculo ao tenant',
    async (tier, cycle, user) => {
      assertMasterMock.mockResolvedValue(user);
      planSingleMock.mockResolvedValue({ data: planoDe(tier), error: null });
      const r = await iniciarCheckout(undefined, fd({ tier, cycle }));
      expect(r.ok).toBe(true);
      expect(r.url).toBe('https://checkout.stripe.test/sess_1');
      const [args] = checkoutCreateMock.mock.calls[0];
      expect(args).toMatchObject({
        mode: 'subscription',
        customer: 'cus_123',
        client_reference_id: 'tenant-1',
        line_items: [{ price: PRICE_IDS[tier][cycle], quantity: 1 }],
        metadata: { tenant_id: 'tenant-1', user_id: 'master-1', tier, cycle },
      });
      expect(args.subscription_data.metadata).toMatchObject({ tenant_id: 'tenant-1' });
      expect(args.subscription_data).not.toHaveProperty('trial_period_days');
      expect(args.success_url).toContain('/professor/plano?checkout=sucesso');
      expect(args.cancel_url).toContain('/professor/plano?checkout=cancelado');
    }
  );

  it('cria o customer (idempotente) quando ausente e grava no tenant', async () => {
    subMaybeSingleMock.mockResolvedValueOnce({ data: { stripe_customer_id: null }, error: null });
    customersCreateMock.mockResolvedValueOnce({ id: 'cus_new' });
    const r = await iniciarCheckout(undefined, fd({ tier: 'personal', cycle: 'monthly' }));
    expect(r.ok).toBe(true);
    expect(customersCreateMock).toHaveBeenCalledOnce();
    expect(customersCreateMock.mock.calls[0][1]).toEqual({ idempotencyKey: 'customer-tenant-1' });
    expect(adminUpdateMock).toHaveBeenCalledWith('subscriptions', { stripe_customer_id: 'cus_new' });
    expect(checkoutCreateMock.mock.calls[0][0].customer).toBe('cus_new');
  });

  it('assinatura ativa ou past_due bloqueia nova assinatura; cancelada permite', async () => {
    getAccessForMock.mockResolvedValueOnce({ hasStripeSubscription: true, status: 'active' });
    const a = await iniciarCheckout(undefined, fd({ tier: 'personal', cycle: 'monthly' }));
    expect(a.ok).toBe(false);
    getAccessForMock.mockResolvedValueOnce({ hasStripeSubscription: true, status: 'past_due' });
    const b = await iniciarCheckout(undefined, fd({ tier: 'personal', cycle: 'monthly' }));
    expect(b.ok).toBe(false);
    expect(checkoutCreateMock).not.toHaveBeenCalled();
    getAccessForMock.mockResolvedValueOnce({ hasStripeSubscription: true, status: 'canceled' });
    const c = await iniciarCheckout(undefined, fd({ tier: 'personal', cycle: 'monthly' }));
    expect(c.ok).toBe(true);
  });

  it('erro da Stripe => mensagem recuperável sem vazar detalhes', async () => {
    checkoutCreateMock.mockRejectedValueOnce(new Error('detalhe interno da stripe'));
    const r = await iniciarCheckout(undefined, fd({ tier: 'personal', cycle: 'monthly' }));
    expect(r.ok).toBe(false);
    expect(r.message).toBe('Não foi possível iniciar o checkout. Tente novamente.');
  });
});

describe('abrirPortal', () => {
  it('recusa não-master', async () => {
    assertMasterMock.mockResolvedValueOnce(null);
    const r = await abrirPortal();
    expect(r.ok).toBe(false);
    expect(portalCreateMock).not.toHaveBeenCalled();
  });

  it('sem customer => avisa que não há assinatura', async () => {
    subMaybeSingleMock.mockResolvedValueOnce({ data: { stripe_customer_id: null }, error: null });
    const r = await abrirPortal();
    expect(r.ok).toBe(false);
    expect(portalCreateMock).not.toHaveBeenCalled();
  });

  it('com customer => devolve a URL do portal', async () => {
    portalCreateMock.mockResolvedValueOnce({ url: 'https://portal.stripe.test/s' });
    const r = await abrirPortal();
    expect(r).toEqual({ ok: true, url: 'https://portal.stripe.test/s' });
    expect(portalCreateMock.mock.calls[0][0]).toMatchObject({ customer: 'cus_123' });
  });
});
