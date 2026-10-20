import { describe, expect, it } from 'vitest';

import {
  classificarGordura,
  classificarImc,
  faixasGordura,
  faixasImc,
} from '@/lib/assessment';

/**
 * Testes das faixas de classificação (pt-BR). As cores são verificadas como
 * strings `hsl(var(--token))` e as bordas seguem a convenção documentada em
 * `lib/assessment/classificacao.ts` (OMS para IMC, ACE para %gordura).
 */

describe('classificarGordura', () => {
  it('homem 34% → Obesidade', () => {
    const f = classificarGordura(34, 'male');
    expect(f.rotulo).toBe('Obesidade');
    expect(f.cor).toBe('hsl(var(--destructive))');
  });

  it('mulher 34% → Obesidade', () => {
    expect(classificarGordura(34, 'female').rotulo).toBe('Obesidade');
  });

  it('homem 15% → Bom (fitness)', () => {
    const f = classificarGordura(15, 'male');
    expect(f.rotulo).toBe('Bom (fitness)');
    expect(f.cor).toBe('hsl(var(--success))');
  });

  it('mulher 12% → Gordura essencial', () => {
    expect(classificarGordura(12, 'female').rotulo).toBe('Gordura essencial');
  });

  it('faixasGordura(male) devolve as 5 faixas na ordem esperada', () => {
    expect(faixasGordura('male').map((f) => f.rotulo)).toEqual([
      'Gordura essencial',
      'Atleta',
      'Bom (fitness)',
      'Aceitável',
      'Obesidade',
    ]);
  });

  it('faixasGordura(female) devolve as 5 faixas na ordem esperada', () => {
    expect(faixasGordura('female').map((f) => f.rotulo)).toEqual([
      'Gordura essencial',
      'Atleta',
      'Bom (fitness)',
      'Aceitável',
      'Obesidade',
    ]);
  });
});

describe('classificarImc', () => {
  it('24.31 → Peso normal', () => {
    const f = classificarImc(24.31);
    expect(f.rotulo).toBe('Peso normal');
    expect(f.cor).toBe('hsl(var(--success))');
  });

  it('18.4 → Abaixo do peso', () => {
    expect(classificarImc(18.4).rotulo).toBe('Abaixo do peso');
  });

  it('borda 25 → Sobrepeso (inclusiva)', () => {
    expect(classificarImc(25).rotulo).toBe('Sobrepeso');
  });

  it('32 → Obesidade grau I', () => {
    expect(classificarImc(32).rotulo).toBe('Obesidade grau I');
  });

  it('41 → Obesidade grau III', () => {
    expect(classificarImc(41).rotulo).toBe('Obesidade grau III');
  });

  it('faixasImc() devolve as 6 faixas na ordem esperada', () => {
    expect(faixasImc().map((f) => f.rotulo)).toEqual([
      'Abaixo do peso',
      'Peso normal',
      'Sobrepeso',
      'Obesidade grau I',
      'Obesidade grau II',
      'Obesidade grau III',
    ]);
  });
});
