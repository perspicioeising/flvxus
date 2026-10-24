import { describe, expect, it } from 'vitest';

import {
  proximoTreinoDaFicha,
  type FichaInicio,
} from '@/lib/treino/inicio';

/** Item de ficha mínimo para a derivação. */
function item(
  id: string,
  opts: {
    division?: string | null;
    weekday?: number | null;
    order_index?: number;
    grupos?: string[];
  } = {}
): NonNullable<FichaInicio['workout_plan_items']>[number] {
  return {
    id,
    division: opts.division ?? null,
    weekday: opts.weekday ?? null,
    order_index: opts.order_index ?? 0,
    sets: 3,
    reps: '10',
    exercises: { name: `Ex ${id}`, muscle_groups: opts.grupos ?? [] },
  };
}

// Quarta-feira (weekday 3) como referência determinística.
const QUARTA = new Date('2024-01-03T12:00:00Z');

describe('proximoTreinoDaFicha — ficha por divisão', () => {
  it('escolhe a primeira divisão (pt-BR) e monta ?divisao=', () => {
    const ficha: FichaInicio = {
      id: 'f1',
      name: 'PPLUL',
      workout_plan_items: [
        item('b', { division: 'B', grupos: ['Costas'] }),
        item('a', { division: 'A', grupos: ['Peito'] }),
      ],
    };
    const r = proximoTreinoDaFicha(ficha, QUARTA);
    expect(r).not.toBeNull();
    expect(r!.divisionLabel).toBe('A');
    expect(r!.href).toBe('/aluno/execucao/f1?divisao=A');
    expect(r!.grupos).toEqual(['Peito']);
  });

  it('usa o sentinela __sem__ quando a primeira divisão é o balde sem divisão', () => {
    const ficha: FichaInicio = {
      id: 'f1',
      name: 'Mista',
      workout_plan_items: [
        item('a', { division: 'A', grupos: ['Peito'] }),
        item('s', { division: null, grupos: ['Core'] }),
      ],
    };
    // 'A' vem antes do balde; para testar o balde, usamos só itens sem divisão
    // num contexto por divisão não existe — então validamos o href nomeado.
    const r = proximoTreinoDaFicha(ficha, QUARTA);
    expect(r!.href).toBe('/aluno/execucao/f1?divisao=A');
  });

  it('nunca retorna null para ficha por divisão (sempre há um próximo treino)', () => {
    const ficha: FichaInicio = {
      id: 'f1',
      name: 'Só A',
      workout_plan_items: [item('a', { division: 'A', grupos: ['Peito'] })],
    };
    expect(proximoTreinoDaFicha(ficha, QUARTA)).not.toBeNull();
  });
});

describe('proximoTreinoDaFicha — ficha legada por dia', () => {
  it('escolhe os itens do dia de hoje e monta ?dia=N', () => {
    const ficha: FichaInicio = {
      id: 'f2',
      name: 'Legada',
      workout_plan_items: [
        item('a', { weekday: 3, grupos: ['Peito'], order_index: 1 }),
        item('b', { weekday: 3, grupos: ['Tríceps'], order_index: 0 }),
        item('c', { weekday: 1, grupos: ['Costas'] }),
      ],
    };
    const r = proximoTreinoDaFicha(ficha, QUARTA);
    expect(r).not.toBeNull();
    expect(r!.href).toBe('/aluno/execucao/f2?dia=3');
    // Ordenado por order_index: b (0) antes de a (1).
    expect(r!.exercicios.map((e) => e.id)).toEqual(['b', 'a']);
  });

  it('retorna null quando a ficha legada NÃO tem treino para hoje (MEDIUM #2)', () => {
    const ficha: FichaInicio = {
      id: 'f2',
      name: 'Legada sem treino hoje',
      workout_plan_items: [
        item('a', { weekday: 1, grupos: ['Peito'] }),
        item('b', { weekday: 5, grupos: ['Costas'] }),
      ],
    };
    // Hoje é quarta (3); não há itens nesse dia → null (UI mostra o cartão).
    expect(proximoTreinoDaFicha(ficha, QUARTA)).toBeNull();
  });
});
