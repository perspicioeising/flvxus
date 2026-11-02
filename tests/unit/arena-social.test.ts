import { describe, expect, it } from 'vitest';

import {
  diasRestantes,
  handleValido,
  normalizarHandle,
  rotuloResultado,
} from '@/lib/arena/social';

describe('normalizarHandle', () => {
  it('normaliza trim + lower + @ inicial para a forma canônica', () => {
    expect(normalizarHandle('  @JoaoFit  ')).toBe('joaofit');
    expect(normalizarHandle('Maria_01')).toBe('maria_01');
  });

  it('aceita o mínimo (3) e o máximo (30) caracteres', () => {
    expect(normalizarHandle('abc')).toBe('abc');
    expect(normalizarHandle('a'.repeat(30))).toBe('a'.repeat(30));
  });

  it('rejeita menos de 3 e mais de 30 caracteres', () => {
    expect(normalizarHandle('ab')).toBeNull();
    expect(normalizarHandle('a'.repeat(31))).toBeNull();
  });

  it('rejeita símbolos fora de [a-z0-9_]', () => {
    expect(normalizarHandle('joao fit')).toBeNull();
    expect(normalizarHandle('joão')).toBeNull();
    expect(normalizarHandle('joao-fit')).toBeNull();
    expect(normalizarHandle('joao.fit')).toBeNull();
  });

  it('rejeita vazio, null e undefined', () => {
    expect(normalizarHandle('')).toBeNull();
    expect(normalizarHandle('   ')).toBeNull();
    expect(normalizarHandle(null)).toBeNull();
    expect(normalizarHandle(undefined)).toBeNull();
  });
});

describe('handleValido', () => {
  it('reflete a normalização (maiúsculas válidas, símbolos inválidos)', () => {
    expect(handleValido('JoaoFit')).toBe(true);
    expect(handleValido('@abc')).toBe(true);
    expect(handleValido('ab')).toBe(false);
    expect(handleValido('joão')).toBe(false);
    expect(handleValido(null)).toBe(false);
  });
});

describe('diasRestantes', () => {
  it('período futuro conta os dias até o fim (inclusive)', () => {
    // dia-SP de 2024-03-10T12:00:00Z = 2024-03-10; fim 2024-03-17 => 7 dias.
    expect(diasRestantes('2024-03-17', '2024-03-10T12:00:00Z')).toBe(7);
  });

  it('fim hoje (dia-SP) → 0', () => {
    expect(diasRestantes('2024-03-10', '2024-03-10T12:00:00Z')).toBe(0);
  });

  it('período já encerrado → 0 (nunca negativo)', () => {
    expect(diasRestantes('2024-03-01', '2024-03-10T12:00:00Z')).toBe(0);
  });

  it('respeita a borda de fuso SP (23h30 não vira o dia seguinte)', () => {
    // 2024-03-15T02:30:00Z = 23h30 SP de 14/03 => dia-SP 2024-03-14;
    // fim 2024-03-15 => ainda resta 1 dia.
    expect(diasRestantes('2024-03-15', '2024-03-15T02:30:00Z')).toBe(1);
  });

  it('ends_on null (janela ainda não aberta) → 0', () => {
    expect(diasRestantes(null, '2024-03-10T12:00:00Z')).toBe(0);
  });

  it('janela recém-aberta (hoje + duração 7) → 6 dias restantes', () => {
    // starts_on = hoje (2024-03-10); ends_on = starts_on + (7 - 1) = 2024-03-16.
    // dia-SP de 2024-03-10T12:00:00Z = 2024-03-10 => restam 6 dias.
    expect(diasRestantes('2024-03-16', '2024-03-10T12:00:00Z')).toBe(6);
  });

  it('degrada para 0 com entradas inválidas', () => {
    expect(diasRestantes('data-ruim', '2024-03-10T12:00:00Z')).toBe(0);
    expect(diasRestantes('2024-03-17', 'nope')).toBe(0);
  });
});

describe('rotuloResultado', () => {
  it('mapeia cada resultado para o rótulo pt-BR', () => {
    expect(rotuloResultado('won')).toBe('Vitória');
    expect(rotuloResultado('lost')).toBe('Derrota');
    expect(rotuloResultado('tie')).toBe('Empate');
    expect(rotuloResultado('pending')).toBe('Em andamento');
  });
});
