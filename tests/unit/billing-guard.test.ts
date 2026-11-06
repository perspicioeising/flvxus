import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Testes do gate REAL (`requireEntitlement`) com a RPC `billing_tenant_state`
 * mockada: trial vigente/expirado, assinatura ativa/past_due/cancelada, aluno
 * vinculado herdando o estado do tenant, filiado, fail-closed e features.
 * O mock global do guard (vitest.setup.ts) é contornado com `importActual`.
 */
const { rpcMock, getSessionUserMock } = vi.hoisted(() => ({
  rpcMock: vi.fn(),
  getSessionUserMock: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({ getSessionUser: getSessionUserMock }));
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({ rpc: rpcMock })),
}));

type Guard = typeof import('@/lib/billing/guard');
async function guard(): Promise<Guard> {
  return vi.importActual<Guard>('@/lib/billing/guard');
}

const AGORA = Date.now();
const DIA = 24 * 60 * 60 * 1000;

function user(over: Record<string, unknown> = {}) {
  return {
    userId: 'u1',
    role: 'trainer',
    tenantId: 't1',
    email: 'a@b.c',
    fullName: 'A',
    avatarUrl: null,
    isMaster: true,
    accountType: 'professional',
    ...over,
  };
}

function estado(over: Record<string, unknown> = {}) {
  return {
    status: 'trialing',
    tier: 'personal',
    billing_cycle: 'monthly',
    trial_ends_at: new Date(AGORA + 5 * DIA).toISOString(),
    current_period_end: null,
    cancel_at_period_end: false,
    has_stripe_subscription: false,
    has_stripe_customer: false,
    ...over,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, 'error').mockImplementation(() => {});
  getSessionUserMock.mockResolvedValue(user());
  rpcMock.mockResolvedValue({ data: [estado()], error: null });
});

describe('requireEntitlement', () => {
  it('master em trial vigente => ok', async () => {
    const { requireEntitlement } = await guard();
    expect(await requireEntitlement(null)).toEqual({ ok: true });
    expect(rpcMock).toHaveBeenCalledWith('billing_tenant_state');
  });

  it('trial expirado => bloqueia com mensagem pt-BR do master', async () => {
    rpcMock.mockResolvedValue({
      data: [estado({ trial_ends_at: new Date(AGORA - DIA).toISOString() })],
      error: null,
    });
    const { requireEntitlement } = await guard();
    const r = await requireEntitlement(null);
    expect(r.ok).toBe(false);
    expect(r.message).toMatch(/teste grátis terminou/i);
  });

  it('assinatura ativa => ok; past_due e cancelada => bloqueia', async () => {
    const { requireEntitlement } = await guard();
    rpcMock.mockResolvedValue({
      data: [estado({ status: 'active', has_stripe_subscription: true, trial_ends_at: null })],
      error: null,
    });
    expect((await requireEntitlement(null)).ok).toBe(true);
    for (const status of ['past_due', 'canceled']) {
      rpcMock.mockResolvedValue({
        data: [estado({ status, has_stripe_subscription: true, trial_ends_at: null })],
        error: null,
      });
      const r = await requireEntitlement(null);
      expect(r.ok).toBe(false);
      expect(r.message).toBeTruthy();
    }
  });

  it('sem linha de assinatura => bloqueia', async () => {
    rpcMock.mockResolvedValue({ data: [], error: null });
    const { requireEntitlement } = await guard();
    expect((await requireEntitlement(null)).ok).toBe(false);
  });

  it('aluno vinculado herda o estado do tenant (vigente libera, expirado bloqueia sem expor cobrança)', async () => {
    const aluno = user({ role: 'student', isMaster: false });
    getSessionUserMock.mockResolvedValue(aluno);
    const { requireEntitlement } = await guard();
    expect((await requireEntitlement(null, aluno as never)).ok).toBe(true);
    rpcMock.mockResolvedValue({
      data: [estado({ trial_ends_at: new Date(AGORA - DIA).toISOString() })],
      error: null,
    });
    const r = await requireEntitlement(null, aluno as never);
    expect(r.ok).toBe(false);
    expect(r.message).toMatch(/personal está suspenso/i);
    expect(r.message).not.toMatch(/pagamento|R\$/i);
  });

  it('filiado bloqueado recebe orientação ao responsável pela conta', async () => {
    const filiado = user({ isMaster: false });
    rpcMock.mockResolvedValue({
      data: [estado({ trial_ends_at: new Date(AGORA - DIA).toISOString() })],
      error: null,
    });
    const { requireEntitlement } = await guard();
    const r = await requireEntitlement(null, filiado as never);
    expect(r.ok).toBe(false);
    expect(r.message).toMatch(/responsável pela conta/i);
  });

  it('autônomo bloqueado: mensagem sem "professor"', async () => {
    const autonomo = user({ accountType: 'self_managed' });
    rpcMock.mockResolvedValue({
      data: [estado({ tier: 'individual', trial_ends_at: new Date(AGORA - DIA).toISOString() })],
      error: null,
    });
    const { requireEntitlement } = await guard();
    const r = await requireEntitlement(null, autonomo as never);
    expect(r.ok).toBe(false);
    expect(r.message).not.toMatch(/professor|personal/i);
  });

  it('RPC com erro ou resposta ausente => fail-closed', async () => {
    const { requireEntitlement } = await guard();
    rpcMock.mockResolvedValue({ data: null, error: { message: 'boom' } });
    const a = await requireEntitlement(null);
    expect(a.ok).toBe(false);
    expect(a.message).toMatch(/Não foi possível verificar sua assinatura/);
    rpcMock.mockRejectedValue(new Error('rede'));
    const b = await requireEntitlement(null);
    expect(b.ok).toBe(false);
  });

  it('sem sessão => pede novo login', async () => {
    getSessionUserMock.mockResolvedValue(null);
    const { requireEntitlement } = await guard();
    const r = await requireEntitlement(null);
    expect(r).toEqual({ ok: false, message: 'Sessão expirada. Entre novamente.' });
  });

  it('feature fora do plano (tier desconhecido) => mensagem de recurso', async () => {
    rpcMock.mockResolvedValue({ data: [estado({ tier: null })], error: null });
    const { requireEntitlement, MSG_SEM_DIREITO } = await guard();
    const r = await requireEntitlement('ai');
    expect(r).toEqual({ ok: false, message: MSG_SEM_DIREITO });
  });

  it('feature incluída no plano => ok', async () => {
    const { requireEntitlement } = await guard();
    expect((await requireEntitlement('ai')).ok).toBe(true);
  });
});
