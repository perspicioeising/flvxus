import { describe, expect, it } from 'vitest';

import {
  agregarConquistas,
  calcularStreak,
  type ConquistaDisponivel,
  type ConquistaObtida,
} from '@/lib/gamificacao/conquistas';

const REFERENCIA = new Date('2024-03-31T12:00:00Z'); // domingo

function disponivel(
  id: string,
  name: string,
  points = 10
): ConquistaDisponivel {
  return { id, name, description: null, icon: null, points };
}

function obtida(achievement_id: string, earned_at: string): ConquistaObtida {
  return { achievement_id, earned_at };
}

describe('agregarConquistas', () => {
  it('resolve obtida/earnedAt e conta obtidas vs total', () => {
    const resultado = agregarConquistas(
      [disponivel('a', 'Primeiro treino'), disponivel('b', 'Semana cheia'), disponivel('c', '100 pontos')],
      [obtida('a', '2024-03-10T10:00:00Z')]
    );

    expect(resultado.total).toBe(3);
    expect(resultado.obtidas).toBe(1);
    expect(resultado.conquistas[0]).toMatchObject({
      id: 'a',
      obtida: true,
      earnedAt: '2024-03-10T10:00:00Z',
    });
    expect(resultado.conquistas[1]).toMatchObject({ id: 'b', obtida: false, earnedAt: null });
  });

  it('mantém a ordem recebida em disponiveis', () => {
    const resultado = agregarConquistas(
      [disponivel('c', 'C'), disponivel('a', 'A'), disponivel('b', 'B')],
      []
    );
    expect(resultado.conquistas.map((c) => c.id)).toEqual(['c', 'a', 'b']);
  });

  it('ignora obtidas sem conquista disponível correspondente', () => {
    const resultado = agregarConquistas(
      [disponivel('a', 'A')],
      [obtida('x', '2024-03-10T10:00:00Z')]
    );
    expect(resultado.obtidas).toBe(0);
    expect(resultado.total).toBe(1);
  });

  it('retorna vazio para listas vazias', () => {
    const resultado = agregarConquistas([], []);
    expect(resultado).toEqual({ conquistas: [], obtidas: 0, total: 0 });
  });
});

describe('calcularStreak', () => {
  it('conta dias consecutivos terminando hoje', () => {
    const streak = calcularStreak(
      [
        '2024-03-31T08:00:00Z',
        '2024-03-30T08:00:00Z',
        '2024-03-29T08:00:00Z',
      ],
      REFERENCIA
    );
    expect(streak).toBe(3);
  });

  it('aceita sequência que termina ontem', () => {
    const streak = calcularStreak(
      ['2024-03-30T08:00:00Z', '2024-03-29T08:00:00Z'],
      REFERENCIA
    );
    expect(streak).toBe(2);
  });

  it('é 0 quando o último treino foi antes de ontem', () => {
    const streak = calcularStreak(['2024-03-28T08:00:00Z'], REFERENCIA);
    expect(streak).toBe(0);
  });

  it('conta dias repetidos uma única vez', () => {
    const streak = calcularStreak(
      [
        '2024-03-31T08:00:00Z',
        '2024-03-31T20:00:00Z',
        '2024-03-30T08:00:00Z',
      ],
      REFERENCIA
    );
    expect(streak).toBe(2);
  });

  it('para no primeiro buraco da sequência', () => {
    const streak = calcularStreak(
      [
        '2024-03-31T08:00:00Z',
        '2024-03-30T08:00:00Z',
        // falta 2024-03-29
        '2024-03-28T08:00:00Z',
      ],
      REFERENCIA
    );
    expect(streak).toBe(2);
  });

  it('ignora datas inválidas/ausentes', () => {
    const streak = calcularStreak(
      [null, undefined, 'data-invalida', '2024-03-31T08:00:00Z'],
      REFERENCIA
    );
    expect(streak).toBe(1);
  });

  it('retorna 0 para lista vazia', () => {
    expect(calcularStreak([], REFERENCIA)).toBe(0);
  });
});
