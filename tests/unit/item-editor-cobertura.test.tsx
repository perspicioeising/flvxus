import * as React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';

import {
  ItemEditor,
  type ItemEditavel,
} from '@/components/professor/treinos/item-editor';

/**
 * Testes da COBERTURA MUSCULAR no editor de itens (ficha/modelo): o mapa reflete
 * a união dos `muscle_groups` dos itens adicionados e ATUALIZA ao remover um
 * exercício (reatividade ao estado do editor).
 */
afterEach(cleanup);

/** Item mínimo para o editor, com os grupos usados pela cobertura. */
function item(
  key: string,
  nome: string,
  grupos: string[]
): ItemEditavel {
  return {
    key,
    exercise_id: key,
    exercise_name: nome,
    sets: '',
    reps: '',
    rest_seconds: '',
    target_load: '',
    notes: '',
    weekday: null,
    division: null,
    muscle_groups: grupos,
  };
}

/** Wrapper controlado: mantém os itens em estado para refletir add/remove. */
function EditorControlado({ iniciais }: { iniciais: ItemEditavel[] }) {
  const [itens, setItens] = React.useState<ItemEditavel[]>(iniciais);
  return <ItemEditor itens={itens} onChange={setItens} exercicios={[]} />;
}

/** Mapa muscular de cobertura (o primeiro `role="img"` renderizado). */
function mapaCobertura(): HTMLElement {
  return screen.getByRole('img', { name: /Músculos trabalhados/ });
}

describe('ItemEditor — cobertura muscular', () => {
  it('mostra a cobertura com a união dos grupos dos itens', () => {
    render(
      <EditorControlado
        iniciais={[
          item('a', 'Supino', ['Peito']),
          item('b', 'Agachamento', ['Pernas']),
        ]}
      />
    );

    const mapa = mapaCobertura();
    expect(mapa).toHaveAttribute(
      'aria-label',
      'Músculos trabalhados: Peito, Pernas'
    );
    // Regiões ativas incluem peito e as da perna.
    const ativas = new Set(
      Array.from(mapa.querySelectorAll('[data-region][data-active="true"]')).map(
        (el) => el.getAttribute('data-region')
      )
    );
    expect(ativas.has('chest')).toBe(true);
    expect(ativas.has('quads')).toBe(true);
  });

  it('atualiza a cobertura ao remover um exercício', () => {
    render(
      <EditorControlado
        iniciais={[
          item('a', 'Supino', ['Peito']),
          item('b', 'Agachamento', ['Pernas']),
        ]}
      />
    );

    // Remove o item de Pernas.
    fireEvent.click(
      screen.getByRole('button', { name: 'Remover Agachamento' })
    );

    const mapa = mapaCobertura();
    expect(mapa).toHaveAttribute('aria-label', 'Músculos trabalhados: Peito');
    const ativas = new Set(
      Array.from(mapa.querySelectorAll('[data-region][data-active="true"]')).map(
        (el) => el.getAttribute('data-region')
      )
    );
    expect(ativas.has('chest')).toBe(true);
    expect(ativas.has('quads')).toBe(false);
  });

  it('não mostra cobertura quando não há itens', () => {
    render(<EditorControlado iniciais={[]} />);
    expect(
      screen.queryByRole('img', { name: /Músculos trabalhados/ })
    ).not.toBeInTheDocument();
    // Garante que o estado vazio do editor continua intacto.
    expect(
      within(document.body).getByText('Nenhum exercício adicionado')
    ).toBeInTheDocument();
  });
});
