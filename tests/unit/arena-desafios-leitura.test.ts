import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Regressão da LEITURA de desafios da G3 (bug: "cria OK, leitura vazia").
 *
 * Causa raiz do bug em produção: recursão mútua de RLS (Postgres 42P17) entre
 * `gamification_challenges` e `gamification_challenge_members` fazia o SELECT de
 * `gamification_challenges` ERRAR — então o convidado de um duelo (accepted=false)
 * nunca via o convite, e o professor nunca via o desafio coach recém-criado. A
 * correção é a migration 20261031090000 (helpers SECURITY DEFINER nas policies).
 *
 * Estes testes cobrem o que a suíte não cobria: a MONTAGEM dos desafios quando a
 * leitura de `gamification_challenges` FUNCIONA (pós-fix). Com a leitura
 * retornando o desafio, a casca TS tem de (a) montar o convite pendente do
 * convidado não-aceito e (b) listar o desafio coach do criador. O cliente
 * Supabase é mockado por tabela/RPC.
 */

// ---------------------------------------------------------------------------
// Mock configurável do cliente Supabase.
// `.from(tabela)` devolve um builder encadeável que resolve no dataset de
// `fromData[tabela]`; `.rpc(fn, args)` é resolvido por `rpcImpl`.
// ---------------------------------------------------------------------------
let fromData: Record<string, unknown[]>;
let rpcImpl: (fn: string, args: Record<string, unknown>) => { data: unknown; error: unknown };

function builder(tabela: string) {
  const b: Record<string, unknown> = {};
  const chain = () => b;
  for (const m of ['select', 'eq', 'in', 'order']) {
    b[m] = vi.fn(chain);
  }
  b.maybeSingle = vi.fn(async () => ({
    data: (fromData[tabela] ?? [])[0] ?? null,
    error: null,
  }));
  // thenable: `await supabase.from(...).select(...)...` resolve na lista da tabela.
  b.then = (resolve: (v: { data: unknown[]; error: null }) => unknown) =>
    resolve({ data: fromData[tabela] ?? [], error: null });
  return b;
}

const supabaseMock = {
  from: vi.fn((tabela: string) => builder(tabela)),
  rpc: vi.fn((fn: string, args: Record<string, unknown>) => rpcImpl(fn, args)),
};

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => supabaseMock),
}));

import { montarDadosArena } from '@/lib/arena/dados';
import { montarPainelDesafios } from '@/lib/professor/desafios-dados';

const DUELO_ID = 'duel-1';
const EU = 'user-convidado';
const CRIADOR = 'user-criador';

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  fromData = {};
  rpcImpl = () => ({ data: null, error: null });
});

afterEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

describe('montarDadosArena — convite de duelo do convidado não-aceito (G3)', () => {
  it('inclui o duelo active em que o convidado ainda NÃO aceitou (accepted=false)', async () => {
    // Convidado é membro do duelo (RLS: user_id = auth.uid()).
    fromData['gamification_challenge_members'] = [{ challenge_id: DUELO_ID }];
    // Pós-fix: a leitura de challenges retorna o duelo (antes errava com 42P17).
    fromData['gamification_challenges'] = [
      { id: DUELO_ID, status: 'active', ends_on: '2999-01-07', created_at: '2026-11-02' },
    ];

    rpcImpl = (fn, args) => {
      if (fn === 'gamification_challenge_scoreboard' && args.p_challenge_id === DUELO_ID) {
        return {
          data: {
            status: 'ok',
            challenge_id: DUELO_ID,
            kind: 'duel',
            challenge_status: 'active',
            starts_on: '2026-11-02',
            ends_on: '2999-01-07',
            title: null,
            goal_text: null,
            reward_text: null,
            // O placar inclui a linha do PRÓPRIO convidado com accepted=false.
            linhas: [
              { posicao: 1, points: 0, display_name: 'Criador', avatar_url: null, level: 0, user_id: CRIADOR, accepted: true, result: 'pending', final_xp: null },
              { posicao: 2, points: 0, display_name: 'Convidado', avatar_url: null, level: 0, user_id: EU, accepted: false, result: 'pending', final_xp: null },
            ],
          },
          error: null,
        };
      }
      return { data: null, error: null };
    };

    const dados = await montarDadosArena(EU);

    expect(dados.desafios).toHaveLength(1);
    const sb = dados.desafios[0];
    expect(sb.challenge_id).toBe(DUELO_ID);
    expect(sb.challenge_status).toBe('active');

    // A linha do próprio convidado está presente e é um convite pendente: é o
    // que a UI (ehConvitePendente) usa para render o bloco "Convites recebidos".
    const minhaLinha = sb.linhas.find((l) => l.user_id === EU);
    expect(minhaLinha).toBeDefined();
    expect(minhaLinha!.accepted).toBe(false);
    const ehConvitePendente = sb.challenge_status === 'active' && minhaLinha!.accepted === false;
    expect(ehConvitePendente).toBe(true);
  });

  it('quando a leitura de challenges falha (regressão 42P17), a lista cai vazia', async () => {
    // Simula o SINTOMA do bug: challenges sem linhas => nenhum placar montado.
    fromData['gamification_challenge_members'] = [{ challenge_id: DUELO_ID }];
    fromData['gamification_challenges'] = [];

    const dados = await montarDadosArena(EU);

    expect(dados.desafios).toHaveLength(0);
  });
});

describe('montarPainelDesafios — desafio coach recém-criado aparece ao criador (G3)', () => {
  it('lista o desafio coach do professor quando a leitura de challenges funciona', async () => {
    const COACH_ID = 'coach-1';
    // Pós-fix: a leitura de challenges (kind=coach, creator=eu) retorna o desafio.
    fromData['gamification_challenges'] = [
      { id: COACH_ID, status: 'active', ends_on: '2999-01-07', created_at: '2026-11-02' },
    ];

    rpcImpl = (fn, args) => {
      if (fn === 'gamification_challenge_scoreboard' && args.p_challenge_id === COACH_ID) {
        return {
          data: {
            status: 'ok',
            challenge_id: COACH_ID,
            kind: 'coach',
            challenge_status: 'active',
            starts_on: '2026-11-02',
            ends_on: '2999-01-07',
            title: 'Turma A',
            goal_text: null,
            reward_text: null,
            linhas: [
              { posicao: 1, points: 0, display_name: 'Aluno', avatar_url: null, level: 0, user_id: 'aluno-1', accepted: true, result: 'pending', final_xp: null },
            ],
          },
          error: null,
        };
      }
      return { data: null, error: null };
    };

    const painel = await montarPainelDesafios();

    expect(painel.desafios).toHaveLength(1);
    expect(painel.desafios[0].challenge_id).toBe(COACH_ID);
    expect(painel.desafios[0].kind).toBe('coach');
  });

  it('quando a leitura de challenges falha (regressão 42P17), a lista cai vazia', async () => {
    fromData['gamification_challenges'] = [];

    const painel = await montarPainelDesafios();

    expect(painel.desafios).toHaveLength(0);
  });
});
