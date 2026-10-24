import { describe, expect, it } from 'vitest';

import {
  DIVISAO_SEM,
  SEM_DIVISAO_LABEL,
  agruparPorDivisao,
  parseDivisao,
} from '@/lib/divisao';

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

describe('parseDivisao', () => {
  it('ausente quando undefined ou string vazia/espacos', () => {
    expect(parseDivisao(undefined)).toEqual({ tipo: 'ausente' });
    expect(parseDivisao('')).toEqual({ tipo: 'ausente' });
    expect(parseDivisao('   ')).toEqual({ tipo: 'ausente' });
  });

  it('sem quando o valor é o sentinela __sem__', () => {
    expect(parseDivisao(DIVISAO_SEM)).toEqual({ tipo: 'sem' });
    expect(parseDivisao('__sem__')).toEqual({ tipo: 'sem' });
  });

  it('rotulo (com trim) para qualquer outra divisão nomeada', () => {
    expect(parseDivisao('A')).toEqual({ tipo: 'rotulo', valor: 'A' });
    expect(parseDivisao('  B  ')).toEqual({ tipo: 'rotulo', valor: 'B' });
    expect(parseDivisao('Peito e tríceps')).toEqual({
      tipo: 'rotulo',
      valor: 'Peito e tríceps',
    });
  });

  it('usa o primeiro valor quando o searchParam vem como array', () => {
    expect(parseDivisao(['A', 'B'])).toEqual({ tipo: 'rotulo', valor: 'A' });
  });
});
