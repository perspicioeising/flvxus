import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Testes HEADLESS das Server Actions de filiados/visibilidade com Supabase e
 * auth MOCKADOS (design §12). Cobre: gate master-only, enforcement de limite
 * (can_add_affiliate=false bloqueia), e recusa de não-master.
 */

const { assertMasterMock, rpcMock, inviteUserByEmailMock, adminInsertMock } = vi.hoisted(() => ({
  assertMasterMock: vi.fn(),
  rpcMock: vi.fn(),
  inviteUserByEmailMock: vi.fn(),
  adminInsertMock: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  assertMaster: assertMasterMock,
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    rpc: rpcMock,
    from: (table: string) => {
      if (table === 'tenant_module_visibility') {
        return {
          update: () => ({
            eq: () => ({ eq: () => Promise.resolve({ error: null }) }),
          }),
        };
      }
      // profiles (removerFiliado)
      return {
        update: () => ({
          eq: () => ({
            eq: () => ({
              eq: () => ({
                select: () => Promise.resolve({ data: [{ user_id: 'fil-1' }], error: null }),
              }),
            }),
          }),
        }),
      };
    },
  })),
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    authAdmin: { inviteUserByEmail: inviteUserByEmailMock },
    insert: adminInsertMock,
  })),
}));

vi.mock('@/lib/site-url', () => ({
  siteUrl: (p: string) => `http://localhost:3000${p}`,
}));

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

import { convidarFiliado, removerFiliado, atualizarVisibilidade } from '@/actions/filiados';

const MASTER = {
  userId: '00000000-0000-4000-8000-000000000001',
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
  rpcMock.mockResolvedValue({ data: true, error: null });
  inviteUserByEmailMock.mockResolvedValue({ data: { user: { id: 'fil-1' } }, error: null });
  adminInsertMock.mockResolvedValue({ error: null });
});

describe('convidarFiliado', () => {
  it('recusa quando não é master', async () => {
    assertMasterMock.mockResolvedValueOnce(null);
    const r = await convidarFiliado(undefined, fd({ full_name: 'Ana Lima', email: 'ana@ex.com' }));
    expect(r.ok).toBe(false);
    expect(inviteUserByEmailMock).not.toHaveBeenCalled();
  });

  it('BLOQUEIA quando can_add_affiliate retorna false (limite do plano)', async () => {
    rpcMock.mockResolvedValueOnce({ data: false, error: null });
    const r = await convidarFiliado(undefined, fd({ full_name: 'Ana Lima', email: 'ana@ex.com' }));
    expect(r.ok).toBe(false);
    expect(r.message).toMatch(/plano/i);
    expect(inviteUserByEmailMock).not.toHaveBeenCalled();
  });

  it('convida com is_affiliate=true e insere profile não-master quando permitido', async () => {
    const r = await convidarFiliado(undefined, fd({ full_name: 'Ana Lima', email: 'ana@ex.com' }));
    expect(r.ok).toBe(true);
    expect(inviteUserByEmailMock).toHaveBeenCalledOnce();
    const [, opts] = inviteUserByEmailMock.mock.calls[0];
    expect(opts.data).toMatchObject({ role: 'trainer', is_affiliate: 'true' });
    expect(adminInsertMock).toHaveBeenCalledWith(
      'profiles',
      expect.objectContaining({ role: 'trainer', is_tenant_master: false, trainer_id: null })
    );
  });

  it('valida os campos (nome curto / e-mail inválido)', async () => {
    const r = await convidarFiliado(undefined, fd({ full_name: 'A', email: 'nao-email' }));
    expect(r.ok).toBe(false);
    expect(r.fieldErrors).toBeDefined();
    expect(rpcMock).not.toHaveBeenCalled();
  });
});

describe('removerFiliado', () => {
  it('recusa não-master', async () => {
    assertMasterMock.mockResolvedValueOnce(null);
    const r = await removerFiliado('fil-1');
    expect(r.ok).toBe(false);
  });

  it('recusa desativar o próprio master', async () => {
    const r = await removerFiliado(MASTER.userId);
    expect(r.ok).toBe(false);
    expect(r.message).toMatch(/master/i);
  });

  it('desativa um filiado válido', async () => {
    const r = await removerFiliado('123e4567-e89b-12d3-a456-426614174000');
    expect(r.ok).toBe(true);
  });
});

describe('atualizarVisibilidade', () => {
  it('recusa não-master', async () => {
    assertMasterMock.mockResolvedValueOnce(null);
    const r = await atualizarVisibilidade(undefined, fd({ module: 'workouts', is_open: 'false' }));
    expect(r.ok).toBe(false);
  });

  it('salva estado bloqueado (is_open=false)', async () => {
    const r = await atualizarVisibilidade(undefined, fd({ module: 'workouts', is_open: 'false' }));
    expect(r.ok).toBe(true);
    expect(r.message).toMatch(/restrito/i);
  });

  it('salva estado liberado (is_open=true)', async () => {
    const r = await atualizarVisibilidade(undefined, fd({ module: 'diets', is_open: 'true' }));
    expect(r.ok).toBe(true);
    expect(r.message).toMatch(/liberado/i);
  });

  it('rejeita módulo inválido', async () => {
    const r = await atualizarVisibilidade(undefined, fd({ module: 'xpto', is_open: 'true' }));
    expect(r.ok).toBe(false);
  });
});
