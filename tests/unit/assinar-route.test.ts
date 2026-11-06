import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * `GET /assinar`: prefetch não tem efeito; parâmetros inválidos voltam aos
 * planos; visitante vai ao cadastro com a intenção; master logado vai à URL do
 * checkout; erros caem em /professor/plano. Nada de destino vindo de input.
 */
const { getSessionUserMock, criarSessaoMock } = vi.hoisted(() => ({
  getSessionUserMock: vi.fn(),
  criarSessaoMock: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({ getSessionUser: getSessionUserMock }));
vi.mock('@/lib/billing/checkout', () => ({ criarSessaoCheckout: criarSessaoMock }));

import { GET } from '@/app/assinar/route';

const BASE = 'http://localhost:3000/assinar';
const MASTER = {
  userId: 'u1',
  role: 'trainer',
  tenantId: 't1',
  email: 'a@b.c',
  fullName: 'A',
  avatarUrl: null,
  isMaster: true,
  accountType: 'professional',
};

function req(qs: string, headers: Record<string, string> = {}): Request {
  return new Request(`${BASE}?${qs}`, { headers });
}

function destino(res: Response): string {
  return res.headers.get('location') ?? '';
}

beforeEach(() => {
  vi.clearAllMocks();
  getSessionUserMock.mockResolvedValue(MASTER);
  criarSessaoMock.mockResolvedValue({ ok: true, url: 'https://checkout.stripe.test/sess' });
});

describe('GET /assinar', () => {
  it.each([
    { 'next-router-prefetch': '1' },
    { rsc: '1' },
    { purpose: 'prefetch' },
    { 'sec-purpose': 'prefetch' },
    { 'next-router-state-tree': '[]' },
  ] as Array<Record<string, string>>)('requisição de prefetch (%o) => 204 sem sessão nem Stripe', async (headers) => {
    const res = await GET(req('plano=personal&ciclo=monthly', headers));
    expect(res.status).toBe(204);
    expect(res.headers.get('cache-control')).toBe('no-store');
    expect(getSessionUserMock).not.toHaveBeenCalled();
    expect(criarSessaoMock).not.toHaveBeenCalled();
  });

  it('parâmetros inválidos => /#planos', async () => {
    for (const qs of ['', 'plano=team', 'plano=personal&ciclo=weekly']) {
      const res = await GET(req(qs));
      expect(res.status).toBe(303);
      expect(destino(res)).toBe('http://localhost:3000/#planos');
    }
    expect(criarSessaoMock).not.toHaveBeenCalled();
  });

  it('visitante => /register com plano/ciclo e acao=assinar', async () => {
    getSessionUserMock.mockResolvedValue(null);
    const res = await GET(req('plano=personal&ciclo=yearly'));
    expect(res.status).toBe(303);
    expect(res.headers.get('cache-control')).toBe('no-store');
    expect(destino(res)).toBe(
      'http://localhost:3000/register?plano=personal&ciclo=yearly&acao=assinar'
    );
    expect(criarSessaoMock).not.toHaveBeenCalled();
  });

  it('não-master (filiado/aluno) => home do papel, sem checkout', async () => {
    getSessionUserMock.mockResolvedValue({ ...MASTER, isMaster: false });
    expect(destino(await GET(req('plano=personal')))).toBe('http://localhost:3000/professor');
    getSessionUserMock.mockResolvedValue({ ...MASTER, role: 'student', isMaster: false });
    expect(destino(await GET(req('plano=personal')))).toBe('http://localhost:3000/aluno');
    expect(criarSessaoMock).not.toHaveBeenCalled();
  });

  it('master logado => redireciona para a URL do checkout', async () => {
    const res = await GET(req('plano=assessoria&ciclo=yearly'));
    expect(res.status).toBe(303);
    expect(destino(res)).toBe('https://checkout.stripe.test/sess');
    expect(criarSessaoMock).toHaveBeenCalledWith({
      user: MASTER,
      tier: 'assessoria',
      cycle: 'yearly',
    });
  });

  it('falhas do checkout caem em /professor/plano', async () => {
    criarSessaoMock.mockResolvedValueOnce({ ok: false, reason: 'conta_incompativel', message: 'x' });
    expect(destino(await GET(req('plano=personal')))).toBe(
      'http://localhost:3000/professor/plano?checkout=incompativel'
    );
    criarSessaoMock.mockResolvedValueOnce({ ok: false, reason: 'ja_assinante', message: 'x' });
    expect(destino(await GET(req('plano=personal')))).toBe(
      'http://localhost:3000/professor/plano?checkout=ja_assinante'
    );
    criarSessaoMock.mockResolvedValueOnce({ ok: false, reason: 'stripe', message: 'x' });
    expect(destino(await GET(req('plano=personal')))).toBe(
      'http://localhost:3000/professor/plano?checkout=erro'
    );
  });

  it('ignora qualquer destino vindo da query (sem open redirect)', async () => {
    getSessionUserMock.mockResolvedValue(null);
    const res = await GET(req('plano=personal&next=https://evil.test&redirect=https://evil.test'));
    expect(destino(res)).not.toMatch(/evil/);
  });
});
