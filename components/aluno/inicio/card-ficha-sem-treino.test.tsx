import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import { CardFichaSemTreino } from './card-ficha-sem-treino';

afterEach(cleanup);

describe('CardFichaSemTreino', () => {
  it('mostra o nome da ficha e a microcopy de "sem treino para hoje"', () => {
    render(<CardFichaSemTreino fichaNome="Ficha legada" href="/aluno/treinos/f1" />);

    expect(screen.getByText('Ficha legada')).toBeInTheDocument();
    expect(
      screen.getByText('Sem treino para hoje nesta ficha')
    ).toBeInTheDocument();
  });

  it('aponta o link para o detalhe da ficha', () => {
    render(<CardFichaSemTreino fichaNome="Ficha legada" href="/aluno/treinos/f1" />);

    expect(screen.getByRole('link')).toHaveAttribute('href', '/aluno/treinos/f1');
  });
});
