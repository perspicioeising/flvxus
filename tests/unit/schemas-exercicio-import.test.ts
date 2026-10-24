import { describe, expect, it } from 'vitest';

import { importarExerciciosSchema } from '@/schemas/exercicio';

const UUID_A = '11111111-1111-4111-8111-111111111111';
const UUID_B = '22222222-2222-4222-8222-222222222222';

describe('importarExerciciosSchema', () => {
  it('rejeita array vazio (min 1)', () => {
    const r = importarExerciciosSchema.safeParse([]);
    expect(r.success).toBe(false);
  });

  it('rejeita id que não é UUID', () => {
    const r = importarExerciciosSchema.safeParse([UUID_A, 'não-é-uuid']);
    expect(r.success).toBe(false);
  });

  it('rejeita array com mais de 200 itens', () => {
    const ids = Array.from({ length: 201 }, () => UUID_A);
    const r = importarExerciciosSchema.safeParse(ids);
    expect(r.success).toBe(false);
  });

  it('aceita uuids válidos e deduplica repetidos', () => {
    const r = importarExerciciosSchema.safeParse([UUID_A, UUID_B, UUID_A]);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data).toEqual([UUID_A, UUID_B]);
    }
  });

  it('reprova entrada não-array normalizada pela action', () => {
    // A action faz: Array.isArray(x) ? x : [] antes do safeParse.
    const indefinido = Array.isArray(undefined) ? undefined : [];
    const objeto = Array.isArray({ a: 1 } as unknown) ? ({ a: 1 } as unknown) : [];

    expect(importarExerciciosSchema.safeParse(indefinido).success).toBe(false);
    expect(importarExerciciosSchema.safeParse(objeto).success).toBe(false);
  });
});
