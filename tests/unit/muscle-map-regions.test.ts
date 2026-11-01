import { describe, expect, it } from 'vitest';

import {
  ALL_REGIONS,
  accessibleGroupsLabel,
  normalizeGroup,
  regionsForGroups,
} from '@/lib/muscle-map/regions';

/**
 * Testes do de-para PURO `grupo → região` do mapa muscular: normalização de
 * acentos/caixa, mapeamento dos 8 grupos canônicos, fallback seguro para
 * valores desconhecidos e o rótulo acessível.
 */
describe('normalizeGroup', () => {
  it('remove acentos, baixa a caixa e apara espaços', () => {
    expect(normalizeGroup('  Braços ')).toBe('bracos');
    expect(normalizeGroup('CORPO INTEIRO')).toBe('corpo inteiro');
    expect(normalizeGroup('Pernas')).toBe('pernas');
  });
});

describe('regionsForGroups', () => {
  it('mapeia cada grupo canônico amplo para suas regiões', () => {
    expect([...regionsForGroups(['Peito'])]).toEqual(['chest']);
    expect([...regionsForGroups(['Costas'])]).toEqual(['upperBack']);
    expect([...regionsForGroups(['Ombros'])]).toEqual(['shoulders']);
    expect([...regionsForGroups(['Braços'])]).toEqual(['arms']);
    expect([...regionsForGroups(['Core'])]).toEqual(['core']);
  });

  it('acende frente e costas das pernas (quadríceps + posterior + glúteos)', () => {
    const r = regionsForGroups(['Pernas']);
    expect(r.has('quads')).toBe(true);
    expect(r.has('hamstrings')).toBe(true);
    expect(r.has('glutes')).toBe(true);
  });

  it('"Corpo Inteiro" acende todas as regiões', () => {
    const r = regionsForGroups(['Corpo Inteiro']);
    expect(r.size).toBe(ALL_REGIONS.length);
    for (const reg of ALL_REGIONS) expect(r.has(reg)).toBe(true);
  });

  it('normaliza variações de acento/caixa antes do mapeamento', () => {
    expect([...regionsForGroups(['braços'])]).toEqual(['arms']);
    expect([...regionsForGroups(['BRACOS'])]).toEqual(['arms']);
    expect([...regionsForGroups(['  peito '])]).toEqual(['chest']);
  });

  it('faz a união deduplicada de vários grupos', () => {
    const r = regionsForGroups(['Peito', 'Ombros', 'Braços', 'Peito']);
    expect([...r].sort()).toEqual(['arms', 'chest', 'shoulders']);
  });

  it('ignora com segurança valores desconhecidos (fallback) sem quebrar', () => {
    expect([...regionsForGroups(['Flexibilidade'])]).toEqual([]);
    const r = regionsForGroups(['Peito', 'Mobilidade', 'Ombros']);
    expect([...r].sort()).toEqual(['chest', 'shoulders']);
  });

  it('"Cardio" não acende nenhuma região (não é grupo localizado)', () => {
    expect([...regionsForGroups(['Cardio'])]).toEqual([]);
  });

  it('lista vazia → nenhuma região', () => {
    expect(regionsForGroups([]).size).toBe(0);
  });
});

describe('accessibleGroupsLabel', () => {
  it('junta os grupos preservando a ordem, deduplicando por normalização', () => {
    expect(accessibleGroupsLabel(['Peito', 'Ombros', 'Braços'])).toBe(
      'Peito, Ombros, Braços'
    );
    expect(accessibleGroupsLabel(['Peito', 'peito'])).toBe('Peito');
  });

  it('ignora vazios e devolve null quando não há nada', () => {
    expect(accessibleGroupsLabel([])).toBeNull();
    expect(accessibleGroupsLabel(['   ', ''])).toBeNull();
  });
});
