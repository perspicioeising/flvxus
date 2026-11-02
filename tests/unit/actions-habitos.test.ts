import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Testes das Server Actions de hábitos (`actions/habitos.ts`). Molde de
 * `execucao-self-managed.test.ts`: `getSessionUser` e o server client mockados.
 * A posse real é da RLS em produção; aqui validamos autorização de papel,
 * carimbo de `user_id`/`tenant_id`, ausência de `occurred_on` e o toggle de
 * refeição (delete quando existe, insert quando não).
 */

const getSessionUserMock = vi.fn();

// Estado controlável do client mockado.
let aguaInsertResult: { data: { id: string } | null; error: unknown } = {
  data: { id: 'agua-1' },
  error: null,
};
let completionExistente: { id: string } | null = null;

const aguaInsertSpy = vi.fn();
const aguaDeleteSpy = vi.fn();
const metaUpsertSpy = vi.fn();
const completionDeleteSpy = vi.fn();
const completionUpsertSpy = vi.fn();
const checkinUpsertSpy = vi.fn();

function makeSupabase() {
  return {
    from: (tabela: string) => {
      if (tabela === 'water_intake_logs') {
        return {
          insert: (linha: unknown) => {
            aguaInsertSpy(linha);
            return {
              select: () => ({
                single: () => Promise.resolve(aguaInsertResult),
              }),
            };
          },
          delete: () => ({
            eq: (_col: string, id: string) => {
              aguaDeleteSpy(id);
              return Promise.resolve({ error: null });
            },
          }),
        };
      }

      if (tabela === 'water_goals') {
        return {
          upsert: (linha: unknown, opts: unknown) => {
            metaUpsertSpy(linha, opts);
            return Promise.resolve({ error: null });
          },
        };
      }

      if (tabela === 'diet_meal_completions') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                eq: () => ({
                  limit: () => ({
                    maybeSingle: () =>
                      Promise.resolve({ data: completionExistente, error: null }),
                  }),
                }),
                // caso dia-SP null (sem terceiro eq): limit direto
                limit: () => ({
                  maybeSingle: () =>
                    Promise.resolve({ data: completionExistente, error: null }),
                }),
              }),
            }),
          }),
          delete: () => ({
            eq: (_col: string, id: string) => {
              completionDeleteSpy(id);
              return Promise.resolve({ error: null });
            },
          }),
          upsert: (linha: unknown, opts: unknown) => {
            completionUpsertSpy(linha, opts);
            return Promise.resolve({ error: null });
          },
        };
      }

      if (tabela === 'daily_checkins') {
        return {
          upsert: (linha: unknown, opts: unknown) => {
            checkinUpsertSpy(linha, opts);
            return Promise.resolve({ error: null });
          },
        };
      }

      throw new Error(`tabela inesperada: ${tabela}`);
    },
  };
}

vi.mock('@/lib/auth', async () => {
  const atual = await vi.importActual<typeof import('@/lib/auth')>('@/lib/auth');
  return {
    ...atual,
    getSessionUser: () => getSessionUserMock(),
  };
});

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => makeSupabase()),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

import {
  alternarRefeicaoCumprida,
  definirMetaAgua,
  fazerCheckin,
  registrarAgua,
} from '@/actions/habitos';

const ALUNO = {
  userId: 'aluno-1',
  role: 'student' as const,
  tenantId: 'tenant-1',
  email: null,
  fullName: null,
  avatarUrl: null,
  isMaster: false,
  accountType: 'professional' as const,
};

const AUTONOMO = {
  userId: 'autonomo-1',
  role: 'trainer' as const,
  tenantId: 'tenant-1',
  email: null,
  fullName: null,
  avatarUrl: null,
  isMaster: true,
  accountType: 'self_managed' as const,
};

const PROFISSIONAL = {
  userId: 'prof-1',
  role: 'trainer' as const,
  tenantId: 'tenant-1',
  email: null,
  fullName: null,
  avatarUrl: null,
  isMaster: true,
  accountType: 'professional' as const,
};

const MEAL = '11111111-1111-1111-1111-111111111111';
const DIET = '22222222-2222-2222-2222-222222222222';
const ALVO = '33333333-3333-3333-3333-333333333333';

beforeEach(() => {
  vi.clearAllMocks();
  aguaInsertResult = { data: { id: 'agua-1' }, error: null };
  completionExistente = null;
});

describe('registrarAgua', () => {
  it('carimba user_id/tenant_id e NÃO envia occurred_on', async () => {
    getSessionUserMock.mockResolvedValue(ALUNO);

    const r = await registrarAgua(500);

    expect(r.ok).toBe(true);
    expect(aguaInsertSpy).toHaveBeenCalledTimes(1);
    const linha = aguaInsertSpy.mock.calls[0][0];
    expect(linha).toMatchObject({
      user_id: ALUNO.userId,
      tenant_id: ALUNO.tenantId,
      amount_ml: 500,
    });
    expect('occurred_on' in linha).toBe(false);
  });

  it('o aluno autônomo também registra água', async () => {
    getSessionUserMock.mockResolvedValue(AUTONOMO);
    const r = await registrarAgua(250);
    expect(r.ok).toBe(true);
    expect(aguaInsertSpy).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: AUTONOMO.userId })
    );
  });

  it('rejeita quantidade inválida antes de inserir', async () => {
    getSessionUserMock.mockResolvedValue(ALUNO);
    const r = await registrarAgua(0);
    expect(r.ok).toBe(false);
    expect(aguaInsertSpy).not.toHaveBeenCalled();
  });

  it('sem sessão retorna erro', async () => {
    getSessionUserMock.mockResolvedValue(null);
    const r = await registrarAgua(500);
    expect(r.ok).toBe(false);
    expect(aguaInsertSpy).not.toHaveBeenCalled();
  });
});

describe('definirMetaAgua', () => {
  it('sem alvo = própria meta (carimba user_id = próprio)', async () => {
    getSessionUserMock.mockResolvedValue(ALUNO);
    const r = await definirMetaAgua(2800, 'manual');
    expect(r.ok).toBe(true);
    expect(metaUpsertSpy).toHaveBeenCalledTimes(1);
    expect(metaUpsertSpy.mock.calls[0][0]).toMatchObject({
      user_id: ALUNO.userId,
      target_ml: 2800,
      source: 'manual',
    });
  });

  it('com alvo exige trainer (professional define meta do aluno)', async () => {
    getSessionUserMock.mockResolvedValue(PROFISSIONAL);
    const r = await definirMetaAgua(3000, 'derived_weight', ALVO);
    expect(r.ok).toBe(true);
    expect(metaUpsertSpy.mock.calls[0][0]).toMatchObject({ user_id: ALVO });
  });

  it('student com alvo é recusado (só o professor define meta de aluno)', async () => {
    getSessionUserMock.mockResolvedValue(ALUNO);
    const r = await definirMetaAgua(3000, 'manual', ALVO);
    expect(r.ok).toBe(false);
    expect(metaUpsertSpy).not.toHaveBeenCalled();
  });

  it('meta fora do intervalo é rejeitada', async () => {
    getSessionUserMock.mockResolvedValue(ALUNO);
    const r = await definirMetaAgua(100, 'manual');
    expect(r.ok).toBe(false);
    expect(metaUpsertSpy).not.toHaveBeenCalled();
  });
});

describe('alternarRefeicaoCumprida', () => {
  it('sem marcação do dia → insere (on conflict do nothing), sem occurred_on', async () => {
    getSessionUserMock.mockResolvedValue(ALUNO);
    completionExistente = null;

    const r = await alternarRefeicaoCumprida(MEAL, DIET);

    expect(r.ok).toBe(true);
    expect(completionUpsertSpy).toHaveBeenCalledTimes(1);
    const linha = completionUpsertSpy.mock.calls[0][0];
    expect(linha).toMatchObject({
      user_id: ALUNO.userId,
      tenant_id: ALUNO.tenantId,
      meal_id: MEAL,
      diet_id: DIET,
    });
    expect('occurred_on' in linha).toBe(false);
    expect(completionDeleteSpy).not.toHaveBeenCalled();
  });

  it('com marcação do dia → desmarca (delete)', async () => {
    getSessionUserMock.mockResolvedValue(ALUNO);
    completionExistente = { id: 'comp-1' };

    const r = await alternarRefeicaoCumprida(MEAL, DIET);

    expect(r.ok).toBe(true);
    expect(completionDeleteSpy).toHaveBeenCalledWith('comp-1');
    expect(completionUpsertSpy).not.toHaveBeenCalled();
  });

  it('ids inválidos são rejeitados', async () => {
    getSessionUserMock.mockResolvedValue(ALUNO);
    const r = await alternarRefeicaoCumprida('nao-uuid', DIET);
    expect(r.ok).toBe(false);
    expect(completionUpsertSpy).not.toHaveBeenCalled();
  });
});

describe('fazerCheckin', () => {
  it('insere com on conflict do nothing (idempotente), sem occurred_on', async () => {
    getSessionUserMock.mockResolvedValue(ALUNO);
    const r = await fazerCheckin();
    expect(r.ok).toBe(true);
    expect(checkinUpsertSpy).toHaveBeenCalledTimes(1);
    const linha = checkinUpsertSpy.mock.calls[0][0];
    expect(linha).toMatchObject({
      user_id: ALUNO.userId,
      tenant_id: ALUNO.tenantId,
    });
    expect('occurred_on' in linha).toBe(false);
    expect(checkinUpsertSpy.mock.calls[0][1]).toMatchObject({
      ignoreDuplicates: true,
    });
  });

  it('trainer professional não faz check-in (não é fluxo do próprio aluno)', async () => {
    getSessionUserMock.mockResolvedValue(PROFISSIONAL);
    const r = await fazerCheckin();
    expect(r.ok).toBe(false);
    expect(checkinUpsertSpy).not.toHaveBeenCalled();
  });
});
