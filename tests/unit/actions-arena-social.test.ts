import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Testes das Server Actions sociais da Arena (`actions/arena-social.ts`). Molde
 * de `actions-habitos.test.ts`: `getSessionUser` e o server client mockados. A
 * posse real é da RLS/funções em produção; aqui validamos (1) o gate negado
 * para o personal profissional, (2) o handle inválido barrado na BORDA antes do
 * RPC, e (3) o repasse do `{status}` devolvido pelo RPC.
 */

const getSessionUserMock = vi.fn();

// Estado controlável do client mockado.
let rpcResult: { data: unknown; error: unknown } = { data: { status: 'sent' }, error: null };
let profilesUpdateResult: { error: unknown } = { error: null };

const rpcSpy = vi.fn();
const profilesUpdateSpy = vi.fn();

function makeSupabase() {
  return {
    rpc: (fn: string, args: unknown) => {
      rpcSpy(fn, args);
      return Promise.resolve(rpcResult);
    },
    from: (tabela: string) => {
      if (tabela === 'profiles') {
        return {
          update: (linha: unknown) => {
            profilesUpdateSpy(linha);
            return {
              eq: () => Promise.resolve(profilesUpdateResult),
            };
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
  criarDuelo,
  definirHandle,
  enviarSolicitacaoPorHandle,
  responderDuelo,
  responderSolicitacao,
} from '@/actions/arena-social';

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

const FRIEND = '11111111-1111-1111-1111-111111111111';
const REQ = '22222222-2222-2222-2222-222222222222';
const CHALLENGE = '33333333-3333-3333-3333-333333333333';

beforeEach(() => {
  vi.clearAllMocks();
  rpcResult = { data: { status: 'sent' }, error: null };
  profilesUpdateResult = { error: null };
});

describe('gate por account_type (o personal profissional é barrado)', () => {
  it('enviarSolicitacaoPorHandle: profissional não opera e não chama RPC', async () => {
    getSessionUserMock.mockResolvedValue(PROFISSIONAL);
    const r = await enviarSolicitacaoPorHandle('joaofit');
    expect(r.ok).toBe(false);
    expect(r.status).toBe('forbidden');
    expect(rpcSpy).not.toHaveBeenCalled();
  });

  it('criarDuelo: profissional barrado', async () => {
    getSessionUserMock.mockResolvedValue(PROFISSIONAL);
    const r = await criarDuelo(FRIEND, 7);
    expect(r.ok).toBe(false);
    expect(r.status).toBe('forbidden');
    expect(rpcSpy).not.toHaveBeenCalled();
  });

  it('definirHandle: profissional barrado (sem update em profiles)', async () => {
    getSessionUserMock.mockResolvedValue(PROFISSIONAL);
    const r = await definirHandle('joaofit');
    expect(r.ok).toBe(false);
    expect(r.status).toBe('forbidden');
    expect(profilesUpdateSpy).not.toHaveBeenCalled();
  });
});

describe('handle inválido barrado na borda (antes do RPC)', () => {
  it('enviarSolicitacaoPorHandle rejeita símbolos inválidos', async () => {
    getSessionUserMock.mockResolvedValue(ALUNO);
    const r = await enviarSolicitacaoPorHandle('jo');
    expect(r.ok).toBe(false);
    expect(r.status).toBe('handle_invalido');
    expect(rpcSpy).not.toHaveBeenCalled();
  });

  it('definirHandle rejeita handle fora do formato antes do update', async () => {
    getSessionUserMock.mockResolvedValue(ALUNO);
    const r = await definirHandle('x');
    expect(r.ok).toBe(false);
    expect(r.status).toBe('handle_invalido');
    expect(profilesUpdateSpy).not.toHaveBeenCalled();
  });
});

describe('repasse do {status} do RPC', () => {
  it('enviarSolicitacaoPorHandle normaliza o handle e repassa o status', async () => {
    getSessionUserMock.mockResolvedValue(ALUNO);
    rpcResult = { data: { status: 'already', state: 'pending' }, error: null };

    const r = await enviarSolicitacaoPorHandle('@JoaoFit');

    expect(r.status).toBe('already');
    expect(r.ok).toBe(true);
    expect(rpcSpy).toHaveBeenCalledWith('gamification_friend_request_by_handle', {
      p_handle: 'joaofit',
    });
  });

  it('enviarSolicitacaoPorHandle repassa not_found como ok:false', async () => {
    getSessionUserMock.mockResolvedValue(ALUNO);
    rpcResult = { data: { status: 'not_found' }, error: null };
    const r = await enviarSolicitacaoPorHandle('alguem_inexistente');
    expect(r.status).toBe('not_found');
    expect(r.ok).toBe(false);
  });

  it('responderSolicitacao repassa o status do RPC', async () => {
    getSessionUserMock.mockResolvedValue(AUTONOMO);
    rpcResult = { data: { status: 'accepted' }, error: null };
    const r = await responderSolicitacao(REQ, 'accept');
    expect(r.status).toBe('accepted');
    expect(r.ok).toBe(true);
    expect(rpcSpy).toHaveBeenCalledWith('gamification_respond_friend_request', {
      p_request_id: REQ,
      p_action: 'accept',
    });
  });

  it('responderSolicitacao com acão inválida é barrada na borda', async () => {
    getSessionUserMock.mockResolvedValue(ALUNO);
    // @ts-expect-error — valor fora do enum, simulando chamada malformada.
    const r = await responderSolicitacao(REQ, 'explodir');
    expect(r.ok).toBe(false);
    expect(r.status).toBe('invalido');
    expect(rpcSpy).not.toHaveBeenCalled();
  });

  it('criarDuelo repassa created e envia a duração', async () => {
    getSessionUserMock.mockResolvedValue(ALUNO);
    rpcResult = { data: { status: 'created', challenge_id: CHALLENGE }, error: null };
    const r = await criarDuelo(FRIEND, 15);
    expect(r.status).toBe('created');
    expect(r.ok).toBe(true);
    expect(rpcSpy).toHaveBeenCalledWith('gamification_create_duel', {
      p_friend_id: FRIEND,
      p_duration_days: 15,
    });
  });

  it('criarDuelo com duração inválida é barrado na borda', async () => {
    getSessionUserMock.mockResolvedValue(ALUNO);
    // @ts-expect-error — 10 não é 7/15/30.
    const r = await criarDuelo(FRIEND, 10);
    expect(r.ok).toBe(false);
    expect(r.status).toBe('invalido');
    expect(rpcSpy).not.toHaveBeenCalled();
  });

  it('responderDuelo repassa accepted e envia o booleano', async () => {
    getSessionUserMock.mockResolvedValue(ALUNO);
    rpcResult = { data: { status: 'accepted' }, error: null };
    const r = await responderDuelo(CHALLENGE, true);
    expect(r.status).toBe('accepted');
    expect(r.ok).toBe(true);
    expect(rpcSpy).toHaveBeenCalledWith('gamification_respond_duel', {
      p_challenge_id: CHALLENGE,
      p_accept: true,
    });
  });

  it('definirHandle grava em profiles e normaliza o handle', async () => {
    getSessionUserMock.mockResolvedValue(ALUNO);
    const r = await definirHandle('  @JoaoFit ');
    expect(r.ok).toBe(true);
    expect(r.status).toBe('saved');
    expect(profilesUpdateSpy).toHaveBeenCalledWith({ social_handle: 'joaofit' });
  });

  it('definirHandle mapeia unique_violation (23505) para em_uso', async () => {
    getSessionUserMock.mockResolvedValue(ALUNO);
    profilesUpdateResult = { error: { code: '23505', message: 'dup' } };
    const r = await definirHandle('joaofit');
    expect(r.ok).toBe(false);
    expect(r.status).toBe('em_uso');
  });
});
