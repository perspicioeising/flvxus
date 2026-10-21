import { describe, expect, it } from 'vitest';

import { SEM_DIVISAO_LABEL, agruparPorDivisao } from '@/lib/divisao';

interface ItemFake {
  id: string;
  division: string | null;
}

const item = (id: string, division: string | null): ItemFake => ({ id, division });

describe('agruparPorDivisao', () => {
  it('agrupa por divisão e ordena rótulos por localeCompare (C,A,B -> A,B,C)', () => {
    const itens = [item('a', 'C'), item('b', 'A'), item('c', 'B')];
    const grupos = agruparPorDivisao(itens, (i) => i.division);

    expect(grupos.map((g) => g.division)).toEqual(['A', 'B', 'C']);
    expect(grupos.map((g) => g.rotulo)).toEqual(['A', 'B', 'C']);
  });

  it('coloca o balde "Divisão única" (division null/undefined) por último', () => {
    const itens = [
      item('a', null),
      item('b', 'A'),
      { id: 'c' } as unknown as ItemFake, // division undefined
    ];
    const grupos = agruparPorDivisao(itens, (i) => i.division ?? null);

    expect(grupos.map((g) => g.division)).toEqual(['A', null]);
    const semDivisao = grupos[grupos.length - 1];
    expect(semDivisao.rotulo).toBe(SEM_DIVISAO_LABEL);
    expect(semDivisao.itens.map((i) => i.id)).toEqual(['a', 'c']);
  });

  it('não cria grupos vazios e preserva a ordem original dentro de cada grupo', () => {
    const itens = [
      item('a', 'A'),
      item('b', 'A'),
      item('c', 'B'),
    ];
    const grupos = agruparPorDivisao(itens, (i) => i.division);

    expect(grupos).toHaveLength(2);
    expect(grupos[0].division).toBe('A');
    expect(grupos[0].itens.map((i) => i.id)).toEqual(['a', 'b']);
    expect(grupos[1].itens.map((i) => i.id)).toEqual(['c']);
  });

  it('retorna lista vazia quando não há itens', () => {
    expect(agruparPorDivisao([] as ItemFake[], (i) => i.division)).toEqual([]);
  });

  it('coexiste itens com e sem divisão (ficha migrada parcialmente)', () => {
    const itens = [
      item('a', 'B'),
      item('b', null),
      item('c', 'A'),
      item('d', null),
    ];
    const grupos = agruparPorDivisao(itens, (i) => i.division);

    expect(grupos.map((g) => g.division)).toEqual(['A', 'B', null]);
    expect(grupos[2].itens.map((i) => i.id)).toEqual(['b', 'd']);
  });
});
