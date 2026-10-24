import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TERMS_VERSION, PRIVACY_VERSION } from '@/lib/legal/versions';

/**
 * Testes da Server Action `registrarAceiteLegal` com o server client mockado.
 * Cobre: sem sessão, versão divergente, no-op idempotente (upsert sem erro) e
 * falha de persistência. Roda SEM Docker (verificação A do design.md §2.15).
 */

const upsertMock = vi.fn();
const getUserMock = vi.fn();

// Query builder encadeável para profiles (.select().eq().single()) e para o
// upsert de terms_acceptances.
function makeSupabase() {
  return {
    auth: { getUser: getUserMock },
    from: (tabela: string) => {
      if (tabela === 'profiles') {
        return {
          select: () => ({
            eq: () => ({
              single: () =>
                Promise.resolve({ data: { tenant_id: 'tenant-1' }, error: null }),
            }),
          }),
        };
      }
      // terms_acceptances
      return { upsert: upsertMock };
    },
  };
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => makeSupabase()),
}));

vi.mock('@/lib/legal/request-meta', () => ({
  resolverRequestMeta: vi.fn(async () => ({
    ipAddress: '203.0.113.7',
    userAgent: 'vitest',
  })),
}));

import { registrarAceiteLegal } from '@/actions/legal';

const inputValido = {
  documents: [
    { type: 'terms' as const, version: TERMS_VERSION },
    { type: 'privacy' as const, version: PRIVACY_VERSION },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
  upsertMock.mockResolvedValue({ error: null });
  getUserMock.mockResolvedValue({ data: { user: { id: 'user-1' } } });
});

describe('registrarAceiteLegal', () => {
  it('retorna erro quando não há sessão (not_authenticated)', async () => {
    getUserMock.mockResolvedValueOnce({ data: { user: null } });
    const r = await registrarAceiteLegal(inputValido);
    expect(r.ok).toBe(false);
    expect(upsertMock).not.toHaveBeenCalled();
  });

  it('rejeita versão divergente (version_mismatch)', async () => {
    const r = await registrarAceiteLegal({
      documents: [{ type: 'terms', version: '0.1' }],
    });
    expect(r.ok).toBe(false);
    expect(upsertMock).not.toHaveBeenCalled();
  });

  it('grava com ignoreDuplicates (no-op idempotente em conflito)', async () => {
    const r = await registrarAceiteLegal(inputValido);
    expect(r.ok).toBe(true);
    expect(upsertMock).toHaveBeenCalledTimes(1);
    const [linhas, opcoes] = upsertMock.mock.calls[0];
    expect(linhas).toHaveLength(2);
    expect(linhas[0]).toMatchObject({
      user_id: 'user-1',
      tenant_id: 'tenant-1',
      ip_address: '203.0.113.7',
      user_agent: 'vitest',
    });
    expect(opcoes).toMatchObject({
      onConflict: 'user_id,document_type,document_version',
      ignoreDuplicates: true,
    });
  });

  it('retorna erro quando a persistência falha (persist_failed)', async () => {
    upsertMock.mockResolvedValueOnce({ error: { message: 'boom' } });
    const r = await registrarAceiteLegal(inputValido);
    expect(r.ok).toBe(false);
  });
});
