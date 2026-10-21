import { describe, expect, it } from 'vitest';

import {
  finalizarSessaoSchema,
  iniciarSessaoSchema,
  registrarSerieSchema,
} from '@/schemas/execucao';

const PLAN_ID = '11111111-1111-1111-1111-111111111111';
const SESSION_ID = '22222222-2222-2222-2222-222222222222';
const ITEM_ID = '33333333-3333-3333-3333-333333333333';

describe('iniciarSessaoSchema', () => {
  it('aceita um plan_id válido', () => {
    expect(iniciarSessaoSchema.safeParse({ plan_id: PLAN_ID }).success).toBe(true);
  });

  it('rejeita plan_id que não é uuid', () => {
    expect(iniciarSessaoSchema.safeParse({ plan_id: 'nao-eh-uuid' }).success).toBe(false);
  });

  it('aceita division válida', () => {
    const r = iniciarSessaoSchema.safeParse({ plan_id: PLAN_ID, division: 'A' });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.division).toBe('A');
    }
  });

  it('trata division ausente como opcional', () => {
    const r = iniciarSessaoSchema.safeParse({ plan_id: PLAN_ID });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.division).toBeUndefined();
    }
  });

  it('rejeita division vazia', () => {
    expect(
      iniciarSessaoSchema.safeParse({ plan_id: PLAN_ID, division: '' }).success
    ).toBe(false);
  });
});

describe('registrarSerieSchema', () => {
  it('aceita uma série mínima válida (completed assume false)', () => {
    const r = registrarSerieSchema.safeParse({
      session_id: SESSION_ID,
      plan_item_id: ITEM_ID,
      set_number: 1,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.completed).toBe(false);
      expect(r.data.reps_done).toBeUndefined();
      expect(r.data.load_done).toBeUndefined();
    }
  });

  it('converte vírgula decimal em load_done para número', () => {
    const r = registrarSerieSchema.safeParse({
      session_id: SESSION_ID,
      plan_item_id: ITEM_ID,
      set_number: '2',
      reps_done: '10',
      load_done: '42,5',
      completed: true,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.set_number).toBe(2);
      expect(r.data.reps_done).toBe(10);
      expect(r.data.load_done).toBe(42.5);
      expect(r.data.completed).toBe(true);
    }
  });

  it('trata reps_done/load_done vazios como ausentes', () => {
    const r = registrarSerieSchema.safeParse({
      session_id: SESSION_ID,
      plan_item_id: ITEM_ID,
      set_number: 1,
      reps_done: '',
      load_done: '',
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.reps_done).toBeUndefined();
      expect(r.data.load_done).toBeUndefined();
    }
  });

  it('rejeita session_id inválido', () => {
    const r = registrarSerieSchema.safeParse({
      session_id: 'x',
      plan_item_id: ITEM_ID,
      set_number: 1,
    });
    expect(r.success).toBe(false);
  });

  it('rejeita set_number menor que 1', () => {
    const r = registrarSerieSchema.safeParse({
      session_id: SESSION_ID,
      plan_item_id: ITEM_ID,
      set_number: 0,
    });
    expect(r.success).toBe(false);
  });

  it('rejeita reps_done negativo', () => {
    const r = registrarSerieSchema.safeParse({
      session_id: SESSION_ID,
      plan_item_id: ITEM_ID,
      set_number: 1,
      reps_done: -1,
    });
    expect(r.success).toBe(false);
  });
});

describe('finalizarSessaoSchema', () => {
  it('aceita só o session_id (notes opcional)', () => {
    const r = finalizarSessaoSchema.safeParse({ session_id: SESSION_ID });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.notes).toBeUndefined();
    }
  });

  it('faz trim das notes e trata vazio como ausente', () => {
    const r = finalizarSessaoSchema.safeParse({
      session_id: SESSION_ID,
      notes: '  treino puxado  ',
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.notes).toBe('treino puxado');
    }

    const vazio = finalizarSessaoSchema.safeParse({ session_id: SESSION_ID, notes: '' });
    expect(vazio.success).toBe(true);
    if (vazio.success) {
      expect(vazio.data.notes).toBeUndefined();
    }
  });

  it('rejeita session_id inválido', () => {
    expect(finalizarSessaoSchema.safeParse({ session_id: 'x' }).success).toBe(false);
  });

  it('aceita perceived_intensity nos limites 1 e 10', () => {
    const um = finalizarSessaoSchema.safeParse({
      session_id: SESSION_ID,
      perceived_intensity: 1,
    });
    expect(um.success).toBe(true);
    if (um.success) {
      expect(um.data.perceived_intensity).toBe(1);
    }

    const dez = finalizarSessaoSchema.safeParse({
      session_id: SESSION_ID,
      perceived_intensity: 10,
    });
    expect(dez.success).toBe(true);
    if (dez.success) {
      expect(dez.data.perceived_intensity).toBe(10);
    }
  });

  it('converte perceived_intensity em string para número', () => {
    const r = finalizarSessaoSchema.safeParse({
      session_id: SESSION_ID,
      perceived_intensity: '7',
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.perceived_intensity).toBe(7);
    }
  });

  it('trata perceived_intensity ausente ou vazio como opcional', () => {
    const ausente = finalizarSessaoSchema.safeParse({ session_id: SESSION_ID });
    expect(ausente.success).toBe(true);
    if (ausente.success) {
      expect(ausente.data.perceived_intensity).toBeUndefined();
    }

    const vazio = finalizarSessaoSchema.safeParse({
      session_id: SESSION_ID,
      perceived_intensity: '',
    });
    expect(vazio.success).toBe(true);
    if (vazio.success) {
      expect(vazio.data.perceived_intensity).toBeUndefined();
    }
  });

  it('rejeita perceived_intensity fora de 1..10 (0 e 11)', () => {
    expect(
      finalizarSessaoSchema.safeParse({
        session_id: SESSION_ID,
        perceived_intensity: 0,
      }).success
    ).toBe(false);
    expect(
      finalizarSessaoSchema.safeParse({
        session_id: SESSION_ID,
        perceived_intensity: 11,
      }).success
    ).toBe(false);
  });

  it('rejeita perceived_intensity não inteiro', () => {
    expect(
      finalizarSessaoSchema.safeParse({
        session_id: SESSION_ID,
        perceived_intensity: 5.5,
      }).success
    ).toBe(false);
  });
});
