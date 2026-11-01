import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Testes da action `cancelarSessao` (abandono do treino), com `getSessionUser`
 * e o server client mockados. Cobre os invariantes do Ajuste 1:
 * - apaga os `workout_set_logs` da sessão E a própria `workout_sessions`;
 * - a sessão só é apagada quando ABERTA (`finished_at is null`) — o filtro
 *   `.is('finished_at', null)` protege sessões já finalizadas;
 * - guard de dono: sem usuário logado retorna `ok:false` e não toca no banco;
 * - idempotente: um erro de limpeza é propagado como `ok:false` sem lançar.
 *
 * Sem Docker: a posse real (aluno dono OU trainer do tenant) é garantida em
 * produção pela RLS; aqui validamos a sequência de deletes e a autorização.
 */

const getSessionUserMock = vi.fn();

// Spies das cadeias de delete, para asserir a ordem e os filtros aplicados.
const logsDeleteEqSpy = vi.fn();
const sessaoDeleteEqSpy = vi.fn();
const sessaoDeleteIsSpy = vi.fn();
const sessaoDeleteSelectSpy = vi.fn();

// Resultados configuráveis por caso.
let logsDeleteResult: { error: unknown } = { error: null };
let sessaoDeleteResult: { data: unknown; error: unknown } = { data: [{ id: 'x' }], error: null };

function makeSupabase() {
  return {
    from: (tabela: string) => {
      if (tabela === 'workout_set_logs') {
        return {
          delete: () => ({
            eq: (col: string, val: string) => {
              logsDeleteEqSpy(col, val);
              return Promise.resolve(logsDeleteResult);
            },
          }),
        };
      }

      if (tabela === 'workout_sessions') {
        return {
          // delete().eq('id', x).is('finished_at', null).select('id')
          delete: () => ({
            eq: (col: string, val: string) => {
              sessaoDeleteEqSpy(col, val);
              return {
                is: (isCol: string, isVal: unknown) => {
                  sessaoDeleteIsSpy(isCol, isVal);
                  return {
                    select: (sel: string) => {
                      sessaoDeleteSelectSpy(sel);
                      return Promise.resolve(sessaoDeleteResult);
                    },
                  };
                },
              };
            },
          }),
        };
      }

      throw new Error(`tabela inesperada: ${tabela}`);
    },
  };
}

vi.mock('@/lib/auth', () => ({
  getSessionUser: () => getSessionUserMock(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => makeSupabase()),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

import { cancelarSessao } from '@/actions/execucao';

const ALUNO = {
  userId: 'aluno-1',
  role: 'student' as const,
  tenantId: 'tenant-1',
  email: null,
  fullName: null,
  avatarUrl: null,
  isMaster: false,
};

const SESSAO = '44444444-4444-4444-4444-444444444444';

beforeEach(() => {
  vi.clearAllMocks();
  logsDeleteResult = { error: null };
  sessaoDeleteResult = { data: [{ id: 'x' }], error: null };
  getSessionUserMock.mockResolvedValue(ALUNO);
});

describe('cancelarSessao — abandono do treino', () => {
  it('apaga os logs da sessão E a sessão aberta, retornando ok', async () => {
    const r = await cancelarSessao({ session_id: SESSAO });

    expect(r.ok).toBe(true);
    // Logs apagados primeiro, por session_id.
    expect(logsDeleteEqSpy).toHaveBeenCalledWith('session_id', SESSAO);
    // Sessão apagada por id, SOMENTE se ainda ABERTA (finished_at is null).
    expect(sessaoDeleteEqSpy).toHaveBeenCalledWith('id', SESSAO);
    expect(sessaoDeleteIsSpy).toHaveBeenCalledWith('finished_at', null);
  });

  it('filtra finished_at is null — nunca apaga sessão já finalizada', async () => {
    await cancelarSessao({ session_id: SESSAO });
    // O guard é o filtro no delete: sem ele uma sessão finalizada sumiria.
    expect(sessaoDeleteIsSpy).toHaveBeenCalledTimes(1);
    expect(sessaoDeleteIsSpy).toHaveBeenCalledWith('finished_at', null);
  });

  it('confirma o descarte efetivo via .select(id) no delete da sessão', async () => {
    await cancelarSessao({ session_id: SESSAO });
    // O delete da sessão pede as linhas removidas para detectar descarte real.
    expect(sessaoDeleteSelectSpy).toHaveBeenCalledWith('id');
  });

  it('idempotente: deletes casando zero linhas (sessão inexistente) → ok', async () => {
    // Supabase não erra quando o delete casa zero linhas; mesmo sem linhas
    // removidas o abandono é idempotente (cobre double-click / sem sessão).
    logsDeleteResult = { error: null };
    sessaoDeleteResult = { data: [], error: null };

    const r = await cancelarSessao({ session_id: SESSAO });

    expect(r.ok).toBe(true);
  });

  it('sessão expirada → ok:false sem tocar no banco', async () => {
    getSessionUserMock.mockResolvedValueOnce(null);

    const r = await cancelarSessao({ session_id: SESSAO });

    expect(r.ok).toBe(false);
    expect(logsDeleteEqSpy).not.toHaveBeenCalled();
    expect(sessaoDeleteEqSpy).not.toHaveBeenCalled();
  });

  it('session_id inválido → ok:false sem tocar no banco', async () => {
    const r = await cancelarSessao({ session_id: 'nao-e-uuid' });

    expect(r.ok).toBe(false);
    expect(logsDeleteEqSpy).not.toHaveBeenCalled();
  });

  it('erro ao apagar logs interrompe e NÃO apaga a sessão', async () => {
    logsDeleteResult = { error: { message: 'falha logs' } };

    const r = await cancelarSessao({ session_id: SESSAO });

    expect(r.ok).toBe(false);
    expect(logsDeleteEqSpy).toHaveBeenCalledWith('session_id', SESSAO);
    expect(sessaoDeleteEqSpy).not.toHaveBeenCalled();
  });

  it('erro ao apagar a sessão → ok:false', async () => {
    sessaoDeleteResult = { data: null, error: { message: 'falha sessao' } };

    const r = await cancelarSessao({ session_id: SESSAO });

    expect(r.ok).toBe(false);
    expect(sessaoDeleteEqSpy).toHaveBeenCalledWith('id', SESSAO);
  });
});
