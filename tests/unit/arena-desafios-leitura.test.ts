import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import type { ChallengeScoreboard } from '@/types/database.types';

/**
 * Testes de LEITURA/UX do duelo-janela-comum (FEAT-002):
 *
 *   (a) o guard de liquidação oportunística (aluno e professor) NÃO dispara com
 *       `ends_on = null` — réplica pura da condição `ends_on != null`;
 *   (b) a classificação `ehConvitePendente` só é verdadeira com
 *       `window_state === 'pending'` E a minha linha `accepted === false`;
 *   (c) asserto ESTÁTICO de que `lista-desafios.tsx` não importa nem instancia
 *       `ResultadoDesafio` (a sede única de render passou a ser `PlacarDesafio`).
 */

/** Réplica pura do guard de liquidação (aluno `lib/arena/dados.ts`). */
function devoLiquidar(
  status: string,
  endsOn: string | null,
  hoje: string
): boolean {
  return status === 'active' && endsOn != null && endsOn < hoje;
}

/** Réplica pura de `ehConvitePendente` (components/.../lista-desafios.tsx). */
function ehConvitePendente(sb: ChallengeScoreboard, meuUserId: string): boolean {
  if (sb.window_state !== 'pending') {
    return false;
  }
  const minhaLinha = sb.linhas.find((l) => l.user_id === meuUserId);
  return minhaLinha ? minhaLinha.accepted === false : false;
}

/** Monta um scoreboard mínimo para os asserts de classificação. */
function placar(
  windowState: ChallengeScoreboard['window_state'],
  minhaLinhaAccepted: boolean
): ChallengeScoreboard {
  return {
    status: 'ok',
    challenge_id: 'c1',
    kind: 'duel',
    challenge_status: windowState === 'finished' ? 'finished' : 'active',
    window_state: windowState,
    starts_on: windowState === 'pending' ? null : '2024-03-10',
    ends_on: windowState === 'pending' ? null : '2024-03-16',
    title: null,
    goal_text: null,
    reward_text: null,
    linhas: [
      {
        posicao: 1,
        points: 0,
        display_name: 'Eu',
        avatar_url: null,
        level: 1,
        user_id: 'me',
        accepted: minhaLinhaAccepted,
        accepted_at: minhaLinhaAccepted ? '2024-03-10' : null,
        result: 'pending',
        final_xp: null,
      },
      {
        posicao: 2,
        points: 0,
        display_name: 'Rival',
        avatar_url: null,
        level: 1,
        user_id: 'other',
        accepted: true,
        accepted_at: '2024-03-10',
        result: 'pending',
        final_xp: null,
      },
    ],
  };
}

describe('guard de liquidação oportunística', () => {
  it('não dispara com ends_on = null (janela ainda não aberta)', () => {
    expect(devoLiquidar('active', null, '2024-03-20')).toBe(false);
  });

  it('dispara para active com ends_on no passado', () => {
    expect(devoLiquidar('active', '2024-03-16', '2024-03-20')).toBe(true);
  });

  it('não dispara para ends_on no futuro nem para status != active', () => {
    expect(devoLiquidar('active', '2024-03-30', '2024-03-20')).toBe(false);
    expect(devoLiquidar('finished', '2024-03-16', '2024-03-20')).toBe(false);
  });
});

describe('ehConvitePendente', () => {
  it('true só com window_state pending + minha linha accepted === false', () => {
    expect(ehConvitePendente(placar('pending', false), 'me')).toBe(true);
  });

  it('false para pending já aceito por mim', () => {
    expect(ehConvitePendente(placar('pending', true), 'me')).toBe(false);
  });

  it('false para active e finished', () => {
    expect(ehConvitePendente(placar('active', false), 'me')).toBe(false);
    expect(ehConvitePendente(placar('finished', false), 'me')).toBe(false);
  });
});

describe('lista-desafios.tsx (asserto estático)', () => {
  const fonte = readFileSync(
    resolve(
      __dirname,
      '../../components/aluno/arena/social/lista-desafios.tsx'
    ),
    'utf8'
  );

  it('não importa ResultadoDesafio', () => {
    expect(fonte).not.toContain('resultado-desafio');
    expect(fonte).not.toContain('ResultadoDesafio');
  });

  it('usa PlacarDesafio como sede de render', () => {
    expect(fonte).toContain('PlacarDesafio');
  });
});
