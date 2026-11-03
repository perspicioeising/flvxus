import { describe, expect, it } from 'vitest';

import { diaSP, diaSPdeDiaOuInstante, periodoSP } from '@/lib/arena/datas';

describe('diaSP', () => {
  it('converte um instante UTC para o dia no fuso America/Sao_Paulo', () => {
    // 12:00Z = 09:00 SP, mesmo dia de calendário.
    expect(diaSP('2024-03-15T12:00:00Z')).toBe('2024-03-15');
  });

  it('borda 23h30 SP não pula para o dia UTC seguinte (critério 17)', () => {
    // 23h30 de 14/03 em SP (UTC-3) = 02h30Z de 15/03. O dia-SP é 14/03.
    expect(diaSP('2024-03-15T02:30:00Z')).toBe('2024-03-14');
  });

  it('aceita instância Date', () => {
    expect(diaSP(new Date('2024-07-01T15:00:00Z'))).toBe('2024-07-01');
  });

  it('retorna null para datas inválidas', () => {
    expect(diaSP('data-invalida')).toBeNull();
  });
});

describe('periodoSP', () => {
  it('retorna YYYY-MM no fuso SP', () => {
    expect(periodoSP('2024-03-15T12:00:00Z')).toBe('2024-03');
  });

  it('borda de virada de mês respeita o fuso SP', () => {
    // 01/04 02:30Z = 31/03 23h30 SP => período 2024-03.
    expect(periodoSP('2024-04-01T02:30:00Z')).toBe('2024-03');
  });

  it('retorna null para datas inválidas', () => {
    expect(periodoSP('nope')).toBeNull();
  });
});

describe('diaSPdeDiaOuInstante', () => {
  it('dia-SP cru (YYYY-MM-DD) é devolvido como está, sem reconverter por fuso', () => {
    // `diaSP("2024-03-20")` voltaria "2024-03-19" (meia-noite UTC → UTC-3). O
    // normalizador preserva o dia-SP já carimbado pelo banco.
    expect(diaSPdeDiaOuInstante('2024-03-20')).toBe('2024-03-20');
    expect(diaSP('2024-03-20')).toBe('2024-03-19');
  });

  it('instante ISO com horário continua resolvido pelo fuso SP', () => {
    // 21/03 02:30Z = 23h30-SP de 20/03.
    expect(diaSPdeDiaOuInstante('2024-03-21T02:30:00Z')).toBe('2024-03-20');
  });

  it('aceita instância Date (instante) via caminho de fuso', () => {
    expect(diaSPdeDiaOuInstante(new Date('2024-07-01T15:00:00Z'))).toBe('2024-07-01');
  });

  it('rejeita dia-SP cru inválido (mês/dia fora de faixa)', () => {
    expect(diaSPdeDiaOuInstante('2024-13-01')).toBeNull();
    expect(diaSPdeDiaOuInstante('2024-02-30')).toBeNull();
  });

  it('29/02 é válido em ano bissexto e inválido fora dele', () => {
    expect(diaSPdeDiaOuInstante('2024-02-29')).toBe('2024-02-29');
    expect(diaSPdeDiaOuInstante('2023-02-29')).toBeNull();
  });
});
