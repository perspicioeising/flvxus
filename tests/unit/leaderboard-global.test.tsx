import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import { LeaderboardGlobal } from '@/components/aluno/arena/leaderboard-global';
import type { GamificationGlobalLeaderboard } from '@/types/database.types';

/**
 * Testes do ranking global (cross-tenant). Cobrem os estados null/vazio/lista,
 * o cabeçalho de posição ("Você está em #N" / "Sem XP") para me != null e
 * me === null, o caso de `me` fora do top-N e a formatação pt-BR do XP.
 */
afterEach(cleanup);

const EU = 'user-eu';

function rankingBase(
  over: Partial<GamificationGlobalLeaderboard> = {}
): GamificationGlobalLeaderboard {
  return {
    period: 'monthly',
    period_key: '2026-10',
    total: 2,
    me: { posicao: 2, points: 1200, user_id: EU },
    linhas: [
      {
        posicao: 1,
        points: 2500,
        display_name: 'Ana Líder',
        avatar_url: null,
        level: 3,
        user_id: 'user-ana',
      },
      {
        posicao: 2,
        points: 1200,
        display_name: 'Eu Mesmo',
        avatar_url: null,
        level: 2,
        user_id: EU,
      },
    ],
    ...over,
  };
}

describe('LeaderboardGlobal', () => {
  it('estado null: mostra mensagem de erro e não renderiza lista', () => {
    render(<LeaderboardGlobal ranking={null} meuUserId={EU} />);
    expect(
      screen.getByText('Não foi possível carregar o ranking agora.')
    ).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('total === 0: cabeçalho "Sem XP" e estado vazio', () => {
    render(
      <LeaderboardGlobal
        ranking={rankingBase({ total: 0, me: null, linhas: [] })}
        meuUserId={EU}
      />
    );
    expect(screen.getByText('Sem XP nesta temporada ainda')).toBeInTheDocument();
    expect(
      screen.getByText(/Ainda não há pontuação nesta temporada/i)
    ).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('me dentro do top-N: "Você está em #2", nome de display_name e XP pt-BR', () => {
    render(<LeaderboardGlobal ranking={rankingBase()} meuUserId={EU} />);
    expect(screen.getByText('Você está em #2')).toBeInTheDocument();
    // Nome vem direto de display_name (sem fallback próprio).
    expect(screen.getByText('Ana Líder')).toBeInTheDocument();
    expect(screen.getByText('Eu Mesmo')).toBeInTheDocument();
    // XP formatado pt-BR (separador de milhar).
    expect(screen.getByText('2.500 XP')).toBeInTheDocument();
    expect(screen.getByText('1.200 XP')).toBeInTheDocument();
  });

  it('me fora do top-N: "Você está em #N" mesmo sem a própria linha na lista', () => {
    const ranking = rankingBase({
      total: 3,
      me: { posicao: 42, points: 10, user_id: EU },
      linhas: [
        {
          posicao: 1,
          points: 2500,
          display_name: 'Ana Líder',
          avatar_url: null,
          level: 3,
          user_id: 'user-ana',
        },
      ],
    });
    render(<LeaderboardGlobal ranking={ranking} meuUserId={EU} />);
    expect(screen.getByText('Você está em #42')).toBeInTheDocument();
    // Própria linha não está na lista, então o marcador "você" não aparece.
    expect(screen.queryByText('você')).not.toBeInTheDocument();
  });

  it('me === null com lista populada: cabeçalho "Sem XP" mas mostra os líderes', () => {
    const ranking = rankingBase({ me: null });
    render(<LeaderboardGlobal ranking={ranking} meuUserId="outro" />);
    expect(screen.getByText('Sem XP nesta temporada ainda')).toBeInTheDocument();
    expect(screen.getByText('Ana Líder')).toBeInTheDocument();
  });
});
