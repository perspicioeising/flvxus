import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';

import { FichaSecao, type FichaSecaoDados } from './ficha-secao';

afterEach(cleanup);

/** Monta um item de ficha mínimo para a seção. */
function item(
  id: string,
  division: string | null,
  grupos: string[]
): NonNullable<FichaSecaoDados['workout_plan_items']>[number] {
  return {
    id,
    division,
    order_index: 0,
    sets: 3,
    reps: '10',
    exercises: { name: `Ex ${id}`, muscle_groups: grupos },
  };
}

describe('FichaSecao', () => {
  it('renderiza cabeçalho com nome, data e contagem de exercícios', () => {
    const ficha: FichaSecaoDados = {
      id: 'f1',
      name: 'PPLUL',
      released_at: '2024-01-10T00:00:00Z',
      workout_plan_items: [
        item('a', 'A', ['Peito']),
        item('b', 'B', ['Costas']),
      ],
    };
    render(<FichaSecao ficha={ficha} marcarProximo />);

    expect(screen.getByText('PPLUL')).toBeInTheDocument();
    expect(screen.getByText(/2 exercícios/)).toBeInTheDocument();
  });

  it('cria um card por divisão com href filtrando pela divisão (?divisao=)', () => {
    const ficha: FichaSecaoDados = {
      id: 'f1',
      name: 'PPLUL',
      released_at: null,
      workout_plan_items: [
        item('a', 'A', ['Peito']),
        item('b', 'B', ['Costas']),
      ],
    };
    render(<FichaSecao ficha={ficha} marcarProximo={false} />);

    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute('href', '/aluno/treinos/f1?divisao=A');
    expect(links[1]).toHaveAttribute('href', '/aluno/treinos/f1?divisao=B');
  });

  it('usa o sentinela __sem__ no href do balde "Divisão única"', () => {
    const ficha: FichaSecaoDados = {
      id: 'f1',
      name: 'Ficha legada',
      released_at: null,
      workout_plan_items: [item('a', null, ['Corpo inteiro'])],
    };
    render(<FichaSecao ficha={ficha} marcarProximo={false} />);

    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      '/aluno/treinos/f1?divisao=__sem__'
    );
  });

  it('mostra o selo "Próximo" só na 1ª divisão quando marcarProximo=true', () => {
    const ficha: FichaSecaoDados = {
      id: 'f1',
      name: 'PPLUL',
      released_at: null,
      workout_plan_items: [
        item('a', 'A', ['Peito']),
        item('b', 'B', ['Costas']),
      ],
    };
    render(<FichaSecao ficha={ficha} marcarProximo />);

    const links = screen.getAllByRole('link');
    expect(within(links[0]).getByText('Próximo')).toBeInTheDocument();
    expect(within(links[1]).queryByText('Próximo')).not.toBeInTheDocument();
  });

  it('não mostra selo "Próximo" em nenhuma divisão quando marcarProximo=false', () => {
    const ficha: FichaSecaoDados = {
      id: 'f1',
      name: 'Ficha 2',
      released_at: null,
      workout_plan_items: [item('a', 'A', ['Peito'])],
    };
    render(<FichaSecao ficha={ficha} marcarProximo={false} />);

    expect(screen.queryByText('Próximo')).not.toBeInTheDocument();
  });
});
