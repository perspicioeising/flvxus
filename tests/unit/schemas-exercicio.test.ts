import { describe, expect, it } from 'vitest';

import {
  criarExercicioSchema,
  editarExercicioSchema,
} from '@/schemas/exercicio';

describe('criarExercicioSchema', () => {
  it('aceita um exercício válido mínimo', () => {
    const r = criarExercicioSchema.safeParse({
      name: 'Supino reto',
      muscle_groups: ['Peito'],
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.muscle_groups).toEqual(['Peito']);
      expect(r.data.equipment).toEqual([]);
      expect(r.data.tips).toEqual([]);
      expect(r.data.common_errors).toEqual([]);
    }
  });

  it('aceita listas como string JSON (como chega no FormData)', () => {
    const r = criarExercicioSchema.safeParse({
      name: 'Agachamento',
      muscle_groups: JSON.stringify(['Pernas', 'Core']),
      equipment: JSON.stringify(['Peso Livre']),
      tips: JSON.stringify(['Mantenha a coluna neutra']),
      common_errors: JSON.stringify(['Joelho para dentro']),
      instructions: 'Desça até 90 graus.',
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.muscle_groups).toEqual(['Pernas', 'Core']);
      expect(r.data.equipment).toEqual(['Peso Livre']);
      expect(r.data.tips).toEqual(['Mantenha a coluna neutra']);
    }
  });

  it('remove itens vazios e duplicados das listas', () => {
    const r = criarExercicioSchema.safeParse({
      name: 'Remada',
      muscle_groups: ['Costas', '', 'Costas', 'Braços'],
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.muscle_groups).toEqual(['Costas', 'Braços']);
    }
  });

  it('trata strings vazias de opcionais como ausentes', () => {
    const r = criarExercicioSchema.safeParse({
      name: 'Rosca direta',
      muscle_groups: ['Braços'],
      instructions: '',
      video_url: '',
      thumbnail_url: '',
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.instructions).toBeUndefined();
      expect(r.data.video_url).toBeUndefined();
      expect(r.data.thumbnail_url).toBeUndefined();
    }
  });

  it('rejeita nome vazio', () => {
    const r = criarExercicioSchema.safeParse({
      name: '',
      muscle_groups: ['Peito'],
    });
    expect(r.success).toBe(false);
  });

  it('rejeita muscle_groups vazio', () => {
    const r = criarExercicioSchema.safeParse({
      name: 'Supino',
      muscle_groups: [],
    });
    expect(r.success).toBe(false);
  });

  it('rejeita muscle_groups ausente', () => {
    const r = criarExercicioSchema.safeParse({
      name: 'Supino',
    });
    expect(r.success).toBe(false);
  });
});

describe('editarExercicioSchema', () => {
  it('valida os mesmos campos do criar', () => {
    const r = editarExercicioSchema.safeParse({
      name: 'Leg press',
      muscle_groups: ['Pernas'],
    });
    expect(r.success).toBe(true);
  });
});
