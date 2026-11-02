import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Teste de degradação por bloco de `montarDadosArena` focado nos rankings
 * globais (G2): quando a RPC de UM ranking global falha, aquele bloco cai para
 * `null` enquanto os demais blocos sobrevivem, e o log do erro inclui
 * `error.code` (além de `error.message`). O cliente Supabase é mockado.
 */

// --- Mock do cliente Supabase (RLS server-side).
// `.from()` devolve um builder encadeável que resolve em {data:[], error:null};
// `.rpc()` é controlado por teste via `rpcImpl`.
let rpcImpl: (
  fn: string,
  args: Record<string, unknown>
) => { data: unknown; error: unknown };

function builderVazio() {
  const builder: Record<string, unknown> = {};
  const chain = () => builder;
  for (const m of ['select', 'eq', 'in', 'order']) {
    builder[m] = vi.fn(chain);
  }
  builder.maybeSingle = vi.fn(async () => ({ data: null, error: null }));
  // Torna o builder "thenable" para os `await supabase.from(...).select(...)`.
  builder.then = (resolve: (v: { data: unknown[]; error: null }) => unknown) =>
    resolve({ data: [], error: null });
  return builder;
}

const supabaseMock = {
  from: vi.fn(() => builderVazio()),
  rpc: vi.fn((fn: string, args: Record<string, unknown>) => rpcImpl(fn, args)),
};

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => supabaseMock),
}));

import { montarDadosArena } from '@/lib/arena/dados';

describe('montarDadosArena — degradação dos rankings globais (G2)', () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    errorSpy.mockRestore();
    vi.clearAllMocks();
  });

  it('falha no ranking global mensal vira null; anual e tenant sobrevivem', async () => {
    const anualOk = {
      period: 'yearly',
      period_key: '2026',
      total: 1,
      me: null,
      linhas: [],
    };
    rpcImpl = (fn, args) => {
      if (fn === 'gamification_tenant_leaderboard') {
        return { data: { active: false, participantes: 0, minimo: 5, linhas: [] }, error: null };
      }
      if (fn === 'gamification_global_leaderboard' && args.p_period === 'monthly') {
        return { data: null, error: { code: '42501', message: 'permission denied' } };
      }
      if (fn === 'gamification_global_leaderboard' && args.p_period === 'yearly') {
        return { data: anualOk, error: null };
      }
      return { data: null, error: null };
    };

    const dados = await montarDadosArena('user-eu');

    expect(dados.rankingGlobalMensal).toBeNull();
    expect(dados.rankingGlobalAnual).toEqual(anualOk);
    // Bloco do tenant sobreviveu.
    expect(dados.ranking).not.toBeNull();
    expect(dados.meuUserId).toBe('user-eu');

    // O log do erro inclui o error.code.
    const logouCode = errorSpy.mock.calls.some((args) =>
      args.some((a) => a === '42501')
    );
    expect(logouCode).toBe(true);
  });
});
