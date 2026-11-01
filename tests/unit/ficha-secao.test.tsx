import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import {
  FichaSecao,
  type FichaSecaoDados,
} from '@/components/aluno/treinos/ficha-secao';

/**
 * Testes do `FichaSecao` focados em FEAT-003: com `descansoProximo=true` injeta
 * o card "Hoje é descanso" no topo e nenhum card de divisão recebe "Próximo";
 * com `descansoProximo=false` o comportamento atual é preservado (critérios 9 e
 * 10). Mocka as Server Actions (o card de descanso as importa) e o roteador.
 */

vi.mock('@/hooks/use-toast', () => ({ toast: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock('@/actions/execucao', () => ({
  confirmarDescanso: vi.fn(async () => ({ ok: true })),
}));

afterEach(() => cleanup());

/** Ficha A/B/C liberada, com um exercício por divisão. */
function fichaABC(): FichaSecaoDados {
  return {
    id: 'f1',
    name: 'Ficha ABC',
    released_at: '2024-01-01T00:00:00Z',
    workout_plan_items: [
      {
        id: 'a',
        division: 'A',
        order_index: 0,
        sets: 3,
        reps: '10',
        exercises: { name: 'Supino', muscle_groups: ['Peito'] },
      },
      {
        id: 'b',
        division: 'B',
        order_index: 1,
        sets: 3,
        reps: '10',
        exercises: { name: 'Remada', muscle_groups: ['Costas'] },
      },
      {
        id: 'c',
        division: 'C',
        order_index: 2,
        sets: 3,
        reps: '10',
        exercises: { name: 'Agachamento', muscle_groups: ['Perna'] },
      },
    ],
  };
}

describe('FichaSecao — descansoProximo (FEAT-003)', () => {
  it('descansoProximo=true injeta "Hoje é descanso" e remove o selo "Próximo"', () => {
    render(
      <FichaSecao
        ficha={fichaABC()}
        marcarProximo
        proximaDivisao="C"
        descansoProximo
        restStepIndex={2}
      />
    );

    expect(screen.getByText('Hoje é descanso')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Marcar descanso como cumprido' })
    ).toBeInTheDocument();
    // Nenhum card de divisão recebe o selo "Próximo".
    expect(screen.queryByText('Próximo')).not.toBeInTheDocument();
  });

  it('descansoProximo=false mantém o comportamento atual (selo "Próximo" na divisão-alvo)', () => {
    render(
      <FichaSecao ficha={fichaABC()} marcarProximo proximaDivisao="B" />
    );

    // Sem card de descanso.
    expect(screen.queryByText('Hoje é descanso')).not.toBeInTheDocument();
    // A divisão-alvo recebe o selo "Próximo".
    expect(screen.getByText('Próximo')).toBeInTheDocument();
  });
});
