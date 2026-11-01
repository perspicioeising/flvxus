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

/**
 * Músculos acesos no mapa, lidos do hook estável `data-active-regions` do
 * wrapper (o SVG anatômico vem da lib `@mjcdev/react-body-highlighter`, que
 * carrega só no cliente; o wrapper expõe os `slug` ativos de forma síncrona).
 */
function ativas(mapa: HTMLElement): Set<string> {
  const raw = mapa.getAttribute('data-active-regions') ?? '';
  return new Set(raw.split(' ').filter(Boolean));
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
    // Músculos ativos incluem peito e os da perna.
    const acesos = ativas(mapa);
    expect(acesos.has('chest')).toBe(true);
    expect(acesos.has('quadriceps')).toBe(true);
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
    const acesos = ativas(mapa);
    expect(acesos.has('chest')).toBe(true);
    expect(acesos.has('quadriceps')).toBe(false);
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
