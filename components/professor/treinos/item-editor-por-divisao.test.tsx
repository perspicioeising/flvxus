import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import {
  ItemEditorPorDivisao,
  reconstruirComFatia,
} from './item-editor-por-divisao';
import type { ItemEditavel } from './item-editor';

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

/** Item editável mínimo com chave, nome e divisão. */
function item(
  key: string,
  division: string | null,
  extra: Partial<ItemEditavel> = {}
): ItemEditavel {
  return {
    key,
    exercise_id: `ex-${key}`,
    exercise_name: `Exercício ${key}`,
    sets: '',
    reps: '',
    rest_seconds: '',
    target_load: '',
    notes: '',
    weekday: null,
    division,
    ...extra,
  };
}

describe('reconstruirComFatia — preserva a ordem global dos demais grupos', () => {
  it('substituição 1:1 (mesmo tamanho) mantém posições globais dos outros grupos', () => {
    // Global: A, B, A, C (entrelaçado). Grupo A ocupa posições [0, 2].
    const itens = [item('a1', 'A'), item('b1', 'B'), item('a2', 'A'), item('c1', 'C')];
    // Edita a fatia de A (dois itens) sem mudar tamanho.
    const novaFatia = [
      item('a1', 'A', { sets: '4' }),
      item('a2', 'A', { sets: '3' }),
    ];
    const r = reconstruirComFatia(itens, [0, 2], novaFatia);
    expect(r.map((i) => i.key)).toEqual(['a1', 'b1', 'a2', 'c1']);
    expect(r[0].sets).toBe('4');
    expect(r[2].sets).toBe('3');
    // B e C intactos nas posições originais.
    expect(r[1].key).toBe('b1');
    expect(r[3].key).toBe('c1');
  });

  it('add em grupo entrelaçado insere o item novo logo após a última posição do grupo', () => {
    // A em [0,2], B em [1]. Adiciona X ao fim da fatia de A.
    const itens = [item('a1', 'A'), item('b1', 'B'), item('a2', 'A')];
    const novaFatia = [item('a1', 'A'), item('a2', 'A'), item('x', null)];
    const r = reconstruirComFatia(itens, [0, 2], novaFatia);
    // X entra logo após a posição global 2 (última de A) → posição global 3.
    expect(r.map((i) => i.key)).toEqual(['a1', 'b1', 'a2', 'x']);
    // B intacto na posição 1.
    expect(r[1].key).toBe('b1');
  });

  it('remoção parcial encurta a fatia sem mexer na ordem global dos demais', () => {
    const itens = [item('a1', 'A'), item('b1', 'B'), item('a2', 'A'), item('c1', 'C')];
    const novaFatia = [item('a1', 'A')]; // remove a2
    const r = reconstruirComFatia(itens, [0, 2], novaFatia);
    expect(r.map((i) => i.key)).toEqual(['a1', 'b1', 'c1']);
  });

  it('remoção total de um grupo de 1 item remove exatamente aquela posição', () => {
    const itens = [item('a1', 'A'), item('b1', 'B'), item('c1', 'C')];
    const r = reconstruirComFatia(itens, [1], []); // remove B inteiro
    expect(r.map((i) => i.key)).toEqual(['a1', 'c1']);
  });
});

describe('ItemEditorPorDivisao — agrupamento por divisão', () => {
  const noop = () => {};

  /** Rótulos das seções do accordion (gatilhos), não os itens do Select. */
  function rotulosDeSecoes(): string[] {
    return screen
      .getAllByRole('button')
      .map((b) => b.getAttribute('data-radix-collection-item') === '' ? b.textContent ?? '' : '')
      .filter((t) => t.length > 0);
  }

  it('agrupa itens A/B/C em 3 seções com a contagem correta', () => {
    const itens = [
      item('a1', 'A'),
      item('a2', 'A'),
      item('b1', 'B'),
      item('c1', 'C'),
    ];
    render(
      <ItemEditorPorDivisao itens={itens} onChange={noop} exercicios={[]} />
    );
    // 3 seções (gatilhos do accordion), cada uma com rótulo + contagem.
    const secoes = rotulosDeSecoes();
    expect(secoes).toHaveLength(3);
    expect(secoes.some((t) => t.includes('Divisão A') && t.includes('2'))).toBe(true);
    expect(secoes.some((t) => t.includes('Divisão B') && t.includes('1'))).toBe(true);
    expect(secoes.some((t) => t.includes('Divisão C') && t.includes('1'))).toBe(true);
    // Grupo "Sem divisão" não aparece quando todos têm divisão.
    expect(secoes.some((t) => t.includes('Sem divisão'))).toBe(false);
  });

  it('mostra o grupo "Sem divisão" só quando há item sem divisão', () => {
    const itens = [item('a1', 'A'), item('s1', null)];
    render(
      <ItemEditorPorDivisao itens={itens} onChange={noop} exercicios={[]} />
    );
    const secoes = rotulosDeSecoes();
    expect(secoes).toHaveLength(2);
    expect(secoes.some((t) => t.includes('Divisão A'))).toBe(true);
    expect(secoes.some((t) => t.includes('Sem divisão'))).toBe(true);
  });
});
