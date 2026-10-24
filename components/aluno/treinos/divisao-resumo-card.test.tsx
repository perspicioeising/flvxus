import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import { DivisaoResumoCard } from './divisao-resumo-card';

afterEach(cleanup);

describe('DivisaoResumoCard', () => {
  it('renderiza letra, nome e grupos informados', () => {
    render(
      <DivisaoResumoCard
        letra="A"
        nome="Peito e tríceps"
        grupos={['Peito', 'Tríceps']}
        proximo={false}
        href="/aluno/treinos/abc"
      />
    );
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('Peito e tríceps')).toBeInTheDocument();
    expect(screen.getByText('Peito · Tríceps')).toBeInTheDocument();
  });

  it('mostra placeholders quando nome e grupos estão vazios', () => {
    render(
      <DivisaoResumoCard
        letra={null}
        nome=""
        grupos={[]}
        proximo={false}
        href="/aluno/treinos/abc"
      />
    );
    expect(screen.getByText('[Nome do treino]')).toBeInTheDocument();
    expect(screen.getByText('[Grupos musculares]')).toBeInTheDocument();
  });

  it('mostra "Próximo" quando proximo=true', () => {
    render(
      <DivisaoResumoCard
        letra="A"
        nome="Peito"
        grupos={['Peito']}
        proximo
        href="/aluno/treinos/abc"
      />
    );
    expect(screen.getByText('Próximo')).toBeInTheDocument();
  });

  it('não mostra "Próximo" quando proximo=false', () => {
    render(
      <DivisaoResumoCard
        letra="B"
        nome="Costas"
        grupos={['Costas']}
        proximo={false}
        href="/aluno/treinos/abc"
      />
    );
    expect(screen.queryByText('Próximo')).not.toBeInTheDocument();
  });

  it('aponta o link para o href passado', () => {
    render(
      <DivisaoResumoCard
        letra="A"
        nome="Peito"
        grupos={['Peito']}
        proximo={false}
        href="/aluno/treinos/xyz-123"
      />
    );
    expect(screen.getByRole('link')).toHaveAttribute('href', '/aluno/treinos/xyz-123');
  });
});
