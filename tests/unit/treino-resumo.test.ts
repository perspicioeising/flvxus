import { describe, expect, it } from 'vitest';

import {
  compararSessoes,
  formatarDuracao,
  formatarVolumeKg,
  type MetricasSessao,
} from '@/lib/treino/resumo';

describe('formatarDuracao', () => {
  it('formata < 1h como mm:ss com zero-pad', () => {
    // 7min 5s
    expect(
      formatarDuracao('2024-01-01T10:00:00Z', '2024-01-01T10:07:05Z')
    ).toBe('07:05');
  });

  it('formata exatamente 0s como 00:00', () => {
    expect(
      formatarDuracao('2024-01-01T10:00:00Z', '2024-01-01T10:00:00Z')
    ).toBe('00:00');
  });

  it('formata >= 1h como "{h}h {mm}min" com minutos zero-pad', () => {
    // 1h 5min
    expect(
      formatarDuracao('2024-01-01T10:00:00Z', '2024-01-01T11:05:30Z')
    ).toBe('1h 05min');
  });

  it('faz floor dos segundos (ignora milissegundos)', () => {
    expect(
      formatarDuracao('2024-01-01T10:00:00.000Z', '2024-01-01T10:00:59.999Z')
    ).toBe('00:59');
  });

  it('retorna "—" para entrada nula/ausente', () => {
    expect(formatarDuracao(null, '2024-01-01T10:00:00Z')).toBe('—');
    expect(formatarDuracao('2024-01-01T10:00:00Z', null)).toBe('—');
    expect(formatarDuracao(undefined, undefined)).toBe('—');
  });

  it('retorna "—" para data inválida', () => {
    expect(formatarDuracao('não-é-data', '2024-01-01T10:00:00Z')).toBe('—');
  });

  it('retorna "—" para duração negativa (fim antes do início)', () => {
    expect(
      formatarDuracao('2024-01-01T10:10:00Z', '2024-01-01T10:00:00Z')
    ).toBe('—');
  });
});

describe('formatarVolumeKg', () => {
  it('formata inteiro sem casas decimais', () => {
    expect(formatarVolumeKg(30)).toBe('30 kg');
  });

  it('usa separador pt-BR de milhar e 1 casa decimal', () => {
    expect(formatarVolumeKg(1250.5)).toBe('1.250,5 kg');
  });

  it('arredonda a 1 casa decimal com a regra única do Intl (27.45 -> 27,5)', () => {
    // Intl arredonda meio-para-cima no desempate decimal.
    expect(formatarVolumeKg(27.45)).toBe('27,5 kg');
  });

  it('trunca a 1 casa para mais de 1 decimal (27.44 -> 27,4)', () => {
    expect(formatarVolumeKg(27.44)).toBe('27,4 kg');
  });

  it('formata 0 como "0 kg"', () => {
    expect(formatarVolumeKg(0)).toBe('0 kg');
  });
});

describe('compararSessoes', () => {
  const atual: MetricasSessao = {
    duracaoSegundos: 1800,
    volumeKg: 1200,
    seriesConcluidas: 12,
  };

  it('calcula deltas positivos (atual > anterior)', () => {
    const anterior: MetricasSessao = {
      duracaoSegundos: 1500,
      volumeKg: 1000,
      seriesConcluidas: 10,
    };
    const c = compararSessoes(atual, anterior);
    expect(c.duracaoSegundos).toBe(300);
    expect(c.volumeKg).toBe(200);
    expect(c.seriesConcluidas).toBe(2);
    expect(c.volumePercentual).toBe(20);
  });

  it('calcula deltas negativos (atual < anterior)', () => {
    const anterior: MetricasSessao = {
      duracaoSegundos: 2400,
      volumeKg: 1600,
      seriesConcluidas: 16,
    };
    const c = compararSessoes(atual, anterior);
    expect(c.duracaoSegundos).toBe(-600);
    expect(c.volumeKg).toBe(-400);
    expect(c.seriesConcluidas).toBe(-4);
    expect(c.volumePercentual).toBe(-25);
  });

  it('deltas zero quando as métricas são iguais', () => {
    const c = compararSessoes(atual, atual);
    expect(c).toEqual({
      duracaoSegundos: 0,
      volumeKg: 0,
      seriesConcluidas: 0,
      volumePercentual: 0,
    });
  });

  it('percentual null quando a base anterior de volume é 0', () => {
    const anterior: MetricasSessao = {
      duracaoSegundos: 1500,
      volumeKg: 0,
      seriesConcluidas: 10,
    };
    const c = compararSessoes(atual, anterior);
    expect(c.volumePercentual).toBeNull();
    // deltas absolutos seguem definidos
    expect(c.volumeKg).toBe(1200);
  });
});
