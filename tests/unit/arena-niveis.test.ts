import { describe, expect, it } from 'vitest';

import { nivelPorXp } from '@/lib/arena/niveis';

describe('nivelPorXp — tabela-verdade do critério 4', () => {
  const casos: Array<[number, number, string]> = [
    [0, 0, 'Iniciante'],
    [499, 0, 'Iniciante'],
    [500, 1, 'Aprendiz'],
    [1499, 1, 'Aprendiz'],
    [1500, 2, 'Dedicado'],
    [3000, 3, 'Atleta'],
    [6000, 4, 'Elite'],
    [11999, 4, 'Elite'],
    [12000, 5, 'Lenda'],
  ];

  for (const [xp, nivel, rotulo] of casos) {
    it(`xp ${xp} => nível ${nivel} (${rotulo})`, () => {
      const r = nivelPorXp(xp);
      expect(r.nivel).toBe(nivel);
      expect(r.rotulo).toBe(rotulo);
    });
  }
});

describe('nivelPorXp — progresso para o próximo nível (RF3.3)', () => {
  it('expõe xp que falta e rótulo do próximo nível', () => {
    const r = nivelPorXp(500);
    expect(r.xpInicioNivel).toBe(500);
    expect(r.xpProximoNivel).toBe(1500);
    expect(r.xpParaProximo).toBe(1000);
    expect(r.rotuloProximo).toBe('Dedicado');
  });

  it('no nível máximo, não há próximo nível', () => {
    const r = nivelPorXp(20000);
    expect(r.nivel).toBe(5);
    expect(r.rotulo).toBe('Lenda');
    expect(r.xpProximoNivel).toBeNull();
    expect(r.xpParaProximo).toBe(0);
    expect(r.rotuloProximo).toBeNull();
  });

  it('trata XP negativo/inválido como 0 (Iniciante)', () => {
    expect(nivelPorXp(-100).nivel).toBe(0);
    expect(nivelPorXp(Number.NaN).nivel).toBe(0);
  });

  it('trunca XP fracionário', () => {
    expect(nivelPorXp(499.9).nivel).toBe(0);
    expect(nivelPorXp(500.5).xp).toBe(500);
  });
});
