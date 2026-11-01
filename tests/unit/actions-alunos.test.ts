import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Testes HEADLESS da Server Action `convidarAluno` com Supabase e auth
 * MOCKADOS (design §12). Foco da Fase B1: o aluno autônomo (self_managed) NÃO
 * gerencia alunos — a action recusa ANTES de qualquer escrita
 * (inviteUserByEmail/insert); o personal (professional) segue o fluxo normal.
 */

const { getSessionUserMock, inviteUserByEmailMock, adminInsertMock } = vi.hoisted(() => ({
  getSessionUserMock: vi.fn(),
  inviteUserByEmailMock: vi.fn(),
  adminInsertMock: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  getSessionUser: getSessionUserMock,
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({})),
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

import { convidarAluno } from '@/actions/alunos';

const PROFESSIONAL = {
  userId: '00000000-0000-4000-8000-000000000001',
  role: 'trainer' as const,
  tenantId: 'tenant-1',
  email: 'personal@ex.com',
  fullName: 'Personal',
  avatarUrl: null,
  isMaster: true,
  accountType: 'professional' as const,
};

const SELF_MANAGED = { ...PROFESSIONAL, accountType: 'self_managed' as const };

function fd(obj: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(obj)) f.append(k, v);
  return f;
}

beforeEach(() => {
  vi.clearAllMocks();
  getSessionUserMock.mockResolvedValue(PROFESSIONAL);
  inviteUserByEmailMock.mockResolvedValue({ data: { user: { id: 'aluno-1' } }, error: null });
  adminInsertMock.mockResolvedValue({ error: null });
});

describe('convidarAluno', () => {
  it('recusa aluno autônomo (self_managed) ANTES de qualquer escrita', async () => {
    getSessionUserMock.mockResolvedValueOnce(SELF_MANAGED);
    const r = await convidarAluno(undefined, fd({ full_name: 'Ana Lima', email: 'ana@ex.com' }));
    expect(r.ok).toBe(false);
    expect(r.message).toMatch(/individual/i);
    expect(inviteUserByEmailMock).not.toHaveBeenCalled();
    expect(adminInsertMock).not.toHaveBeenCalled();
  });

  it('recusa quando não há professor autenticado', async () => {
    getSessionUserMock.mockResolvedValueOnce(null);
    const r = await convidarAluno(undefined, fd({ full_name: 'Ana Lima', email: 'ana@ex.com' }));
    expect(r.ok).toBe(false);
    expect(inviteUserByEmailMock).not.toHaveBeenCalled();
  });

  it('permite o personal (professional) e envia o convite', async () => {
    const r = await convidarAluno(undefined, fd({ full_name: 'Ana Lima', email: 'ana@ex.com' }));
    expect(r.ok).toBe(true);
    expect(inviteUserByEmailMock).toHaveBeenCalledOnce();
    expect(adminInsertMock).toHaveBeenCalledWith(
      'profiles',
      expect.objectContaining({ role: 'student', status: 'pending' })
    );
  });

  it('valida os campos (nome curto / e-mail inválido) sem chamar o convite', async () => {
    const r = await convidarAluno(undefined, fd({ full_name: '', email: 'nao-email' }));
    expect(r.ok).toBe(false);
    expect(r.fieldErrors).toBeDefined();
    expect(inviteUserByEmailMock).not.toHaveBeenCalled();
  });
});
