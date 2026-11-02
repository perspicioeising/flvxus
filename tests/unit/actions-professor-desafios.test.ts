import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Testes da Server Action do painel de desafios do personal
 * (`actions/professor-desafios.ts`). Molde de `actions-arena-social.test.ts`:
 * `getSessionUser` e o server client mockados. A posse/gate real é da função
 * `SECURITY DEFINER` em produção; aqui validamos (1) a DEFESA EM PROFUNDIDADE
 * (o autônomo é recusado ANTES de qualquer RPC) e (2) o repasse do `{status}`
 * devolvido pelo RPC ao personal profissional.
 */

const getSessionUserMock = vi.fn();

// Estado controlável do RPC mockado.
let rpcResult: { data: unknown; error: unknown } = {
  data: { status: 'created', challenge_id: 'challenge-1' },
  error: null,
};

const rpcSpy = vi.fn();

function makeSupabase() {
  return {
    rpc: (fn: string, args: unknown) => {
      rpcSpy(fn, args);
      return Promise.resolve(rpcResult);
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

import { criarDesafioTurma } from '@/actions/professor-desafios';

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

const MEMBRO = '11111111-1111-1111-1111-111111111111';

const INPUT_VALIDO = {
  title: 'Desafio de outubro',
  dias: 7 as const,
  memberIds: [MEMBRO],
  goalText: 'treinar 4x por semana',
  rewardText: 'aula grátis',
};

beforeEach(() => {
  vi.clearAllMocks();
  rpcResult = {
    data: { status: 'created', challenge_id: 'challenge-1' },
    error: null,
  };
});

describe('criarDesafioTurma', () => {
  it('recusa o aluno autônomo (self_managed) ANTES de qualquer RPC', async () => {
    getSessionUserMock.mockResolvedValue(AUTONOMO);

    const r = await criarDesafioTurma(INPUT_VALIDO);

    expect(r.ok).toBe(false);
    expect(r.status).toBe('forbidden');
    expect(rpcSpy).not.toHaveBeenCalled();
  });

  it('o profissional cria e recebe {status, challengeId} do RPC', async () => {
    getSessionUserMock.mockResolvedValue(PROFISSIONAL);

    const r = await criarDesafioTurma(INPUT_VALIDO);

    expect(r.ok).toBe(true);
    expect(r.status).toBe('created');
    expect(r.challengeId).toBe('challenge-1');
    expect(rpcSpy).toHaveBeenCalledTimes(1);
    expect(rpcSpy).toHaveBeenCalledWith(
      'gamification_create_coach_challenge',
      expect.objectContaining({
        p_member_ids: [MEMBRO],
        p_duration_days: 7,
        p_title: 'Desafio de outubro',
        p_goal_text: 'treinar 4x por semana',
        p_reward_text: 'aula grátis',
      }),
    );
  });

  it('repassa um {status} de recusa do RPC (ex.: member_outside_tenant)', async () => {
    getSessionUserMock.mockResolvedValue(PROFISSIONAL);
    rpcResult = { data: { status: 'member_outside_tenant' }, error: null };

    const r = await criarDesafioTurma(INPUT_VALIDO);

    expect(r.ok).toBe(false);
    expect(r.status).toBe('member_outside_tenant');
    expect(rpcSpy).toHaveBeenCalledTimes(1);
  });

  it('sem sessão retorna erro sem chamar o RPC', async () => {
    getSessionUserMock.mockResolvedValue(null);

    const r = await criarDesafioTurma(INPUT_VALIDO);

    expect(r.ok).toBe(false);
    expect(rpcSpy).not.toHaveBeenCalled();
  });

  it('rejeita input sem alunos na BORDA (zod) antes do RPC', async () => {
    getSessionUserMock.mockResolvedValue(PROFISSIONAL);

    const r = await criarDesafioTurma({ ...INPUT_VALIDO, memberIds: [] });

    expect(r.ok).toBe(false);
    expect(r.status).toBe('invalido');
    expect(rpcSpy).not.toHaveBeenCalled();
  });
});
