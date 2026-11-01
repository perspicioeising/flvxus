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

// ---------------------------------------------------------------------------
// Ajuste 1 — proximaDivisao sincroniza o selo "Próximo" com a rotação real
// ---------------------------------------------------------------------------
describe('FichaSecao — proximaDivisao (rotação sincronizada)', () => {
  it('ficha nova sem histórico: proximaDivisao="A" marca o card A como Próximo', () => {
    const ficha: FichaSecaoDados = {
      id: 'f1',
      name: 'PPLUL',
      released_at: null,
      workout_plan_items: [
        item('a', 'A', ['Peito']),
        item('b', 'B', ['Costas']),
        item('c', 'C', ['Pernas']),
      ],
    };
    render(<FichaSecao ficha={ficha} marcarProximo proximaDivisao="A" />);

    const links = screen.getAllByRole('link');
    // Apenas o card A recebe o selo.
    expect(within(links[0]).getByText('Próximo')).toBeInTheDocument();
    expect(within(links[1]).queryByText('Próximo')).not.toBeInTheDocument();
    expect(within(links[2]).queryByText('Próximo')).not.toBeInTheDocument();
  });

  it('histórico A→B→C: proximaDivisao="A" marca o card A (rotação reiniciou)', () => {
    const ficha: FichaSecaoDados = {
      id: 'f1',
      name: 'ABC',
      released_at: null,
      workout_plan_items: [
        item('a', 'A', ['Peito']),
        item('b', 'B', ['Costas']),
        item('c', 'C', ['Pernas']),
      ],
    };
    // Após treinar C, a próxima é A novamente.
    render(<FichaSecao ficha={ficha} marcarProximo proximaDivisao="A" />);

    const links = screen.getAllByRole('link');
    expect(within(links[0]).getByText('Próximo')).toBeInTheDocument();
    expect(within(links[1]).queryByText('Próximo')).not.toBeInTheDocument();
    expect(within(links[2]).queryByText('Próximo')).not.toBeInTheDocument();
  });

  it('histórico A: proximaDivisao="B" marca APENAS o card B como Próximo', () => {
    const ficha: FichaSecaoDados = {
      id: 'f1',
      name: 'PPLUL',
      released_at: null,
      workout_plan_items: [
        item('a', 'A', ['Peito']),
        item('b', 'B', ['Costas']),
        item('c', 'C', ['Pernas']),
      ],
    };
    // Último treino foi A, então o próximo é B — não A (que seria o index 0).
    render(<FichaSecao ficha={ficha} marcarProximo proximaDivisao="B" />);

    const links = screen.getAllByRole('link');
    expect(within(links[0]).queryByText('Próximo')).not.toBeInTheDocument();
    expect(within(links[1]).getByText('Próximo')).toBeInTheDocument();
    expect(within(links[2]).queryByText('Próximo')).not.toBeInTheDocument();
  });

  it('ficha legada por dia (proximaDivisao=undefined): o único balde recebe Próximo', () => {
    const ficha: FichaSecaoDados = {
      id: 'f1',
      name: 'Legada',
      released_at: null,
      // Itens sem divisão → todos agrupados num único balde → 1 card.
      workout_plan_items: [
        item('a', null, ['Corpo inteiro']),
        item('b', null, ['Cardio']),
      ],
    };
    // proximaDivisao não passado (undefined) → comportamento legado (index 0).
    render(<FichaSecao ficha={ficha} marcarProximo />);

    // Todos os itens sem divisão são agrupados num único card (balde __sem__).
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(1);
    expect(within(links[0]).getByText('Próximo')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Ajuste 2 — sessoesAbertas: "Em andamento" tem prioridade sobre "Próximo"
// ---------------------------------------------------------------------------
describe('FichaSecao — sessoesAbertas (Em andamento)', () => {
  it('divisão com sessão aberta exibe "Em andamento" em vez de "Próximo"', () => {
    const ficha: FichaSecaoDados = {
      id: 'f1',
      name: 'PPLUL',
      released_at: null,
      workout_plan_items: [
        item('a', 'A', ['Peito']),
        item('b', 'B', ['Costas']),
      ],
    };
    // Divisão A é a próxima E está em andamento: "Em andamento" vence.
    render(
      <FichaSecao
        ficha={ficha}
        marcarProximo
        proximaDivisao="A"
        sessoesAbertas={new Set(['A'])}
      />
    );

    const links = screen.getAllByRole('link');
    // Card A: "Em andamento", NÃO "Próximo".
    expect(within(links[0]).getByText('Em andamento')).toBeInTheDocument();
    expect(within(links[0]).queryByText('Próximo')).not.toBeInTheDocument();
    // Card B: nenhum selo.
    expect(within(links[1]).queryByText('Em andamento')).not.toBeInTheDocument();
    expect(within(links[1]).queryByText('Próximo')).not.toBeInTheDocument();
  });

  it('divisão em andamento mas que não é a próxima: mostra "Em andamento" e outras continuam sem selo', () => {
    const ficha: FichaSecaoDados = {
      id: 'f1',
      name: 'PPLUL',
      released_at: null,
      workout_plan_items: [
        item('a', 'A', ['Peito']),
        item('b', 'B', ['Costas']),
        item('c', 'C', ['Pernas']),
      ],
    };
    // Próximo é C, mas B está em andamento.
    render(
      <FichaSecao
        ficha={ficha}
        marcarProximo
        proximaDivisao="C"
        sessoesAbertas={new Set(['B'])}
      />
    );

    const links = screen.getAllByRole('link');
    expect(within(links[0]).queryByText('Próximo')).not.toBeInTheDocument();
    expect(within(links[0]).queryByText('Em andamento')).not.toBeInTheDocument();
    expect(within(links[1]).getByText('Em andamento')).toBeInTheDocument();
    expect(within(links[2]).getByText('Próximo')).toBeInTheDocument();
  });

  it('sem sessões abertas: nenhum card exibe "Em andamento"', () => {
    const ficha: FichaSecaoDados = {
      id: 'f1',
      name: 'PPLUL',
      released_at: null,
      workout_plan_items: [item('a', 'A', ['Peito'])],
    };
    render(
      <FichaSecao
        ficha={ficha}
        marcarProximo
        proximaDivisao="A"
        sessoesAbertas={new Set()}
      />
    );

    expect(screen.queryByText('Em andamento')).not.toBeInTheDocument();
    expect(screen.getByText('Próximo')).toBeInTheDocument();
  });

  it('CTA "Em andamento" aponta para execução em ficha por divisão', () => {
    const ficha: FichaSecaoDados = {
      id: 'plano-xyz',
      name: 'PPLUL',
      released_at: null,
      workout_plan_items: [item('a', 'A', ['Peito'])],
    };
    render(
      <FichaSecao
        ficha={ficha}
        marcarProximo={false}
        sessoesAbertas={new Set(['A'])}
      />
    );

    // O link deve apontar para a execução com ?divisao=A.
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      '/aluno/execucao/plano-xyz?divisao=A'
    );
  });

  it('CTA "Em andamento" em ficha legada por dia aponta para o detalhe (não para execução)', () => {
    const ficha: FichaSecaoDados = {
      id: 'plano-legado',
      name: 'Legada',
      released_at: null,
      // Nenhum item tem divisão → porDivisao=false.
      workout_plan_items: [item('a', null, ['Corpo inteiro'])],
    };
    render(
      <FichaSecao
        ficha={ficha}
        marcarProximo={false}
        // null = balde sem divisão (ficha legada).
        sessoesAbertas={new Set([null])}
      />
    );

    // Para fichas por dia, o CTA cai no detalhe (sem ?execucao), não na execução direta.
    // O href deve ser o detalhe, não /aluno/execucao/.
    const link = screen.getByRole('link');
    expect(link.getAttribute('href')).toContain('/aluno/treinos/plano-legado');
    expect(link.getAttribute('href')).not.toContain('/aluno/execucao/');
  });
});
