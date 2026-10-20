import { describe, expect, it } from 'vitest';

import { SEM_DIA_LABEL, WEEKDAY_LABEL, agruparPorDia } from '@/lib/semana';

interface ItemFake {
  id: string;
  weekday: number | null;
}

const item = (id: string, weekday: number | null): ItemFake => ({ id, weekday });

describe('agruparPorDia', () => {
  it('ordena os dias de domingo a sábado, independentemente da ordem de entrada', () => {
    const itens = [item('a', 3), item('b', 1), item('c', 3)];
    const grupos = agruparPorDia(itens, (i) => i.weekday);

    expect(grupos.map((g) => g.weekday)).toEqual([1, 3]);
    expect(grupos[0].rotulo).toBe(WEEKDAY_LABEL[1]);
    expect(grupos[1].itens.map((i) => i.id)).toEqual(['a', 'c']);
  });

  it('inclui o balde "Sem dia definido" por último', () => {
    const itens = [item('a', null), item('b', 2), item('c', null)];
    const grupos = agruparPorDia(itens, (i) => i.weekday);

    expect(grupos.map((g) => g.weekday)).toEqual([2, null]);
    const semDia = grupos[grupos.length - 1];
    expect(semDia.rotulo).toBe(SEM_DIA_LABEL);
    expect(semDia.itens).toHaveLength(2);
  });

  it('não cria grupos para dias sem itens', () => {
    const itens = [item('a', 5)];
    const grupos = agruparPorDia(itens, (i) => i.weekday);

    expect(grupos).toHaveLength(1);
    expect(grupos[0].weekday).toBe(5);
  });

  it('retorna lista vazia quando não há itens', () => {
    expect(agruparPorDia([] as ItemFake[], (i) => i.weekday)).toEqual([]);
  });
});
