import { describe, expect, it } from 'vitest';

import { criarAvaliacaoSchema } from '@/schemas/avaliacao';

const STUDENT = '11111111-1111-1111-1111-111111111111';

/** Extrai o conjunto de `path[0]` dos erros, para asserts legíveis. */
function camposComErro(resultado: ReturnType<typeof criarAvaliacaoSchema.safeParse>): string[] {
  if (resultado.success) return [];
  return resultado.error.issues.map((i) => String(i.path[0]));
}

describe('criarAvaliacaoSchema — validações básicas', () => {
  it('rejeita student_id não-uuid', () => {
    const r = criarAvaliacaoSchema.safeParse({
      student_id: 'nao-uuid',
      protocol: 'manual',
      body_fat_pct: 20,
      photos_consent: false,
    });
    expect(r.success).toBe(false);
    expect(camposComErro(r)).toContain('student_id');
  });

  it('rejeita protocolo fora do enum', () => {
    const r = criarAvaliacaoSchema.safeParse({
      student_id: STUDENT,
      protocol: 'bioimpedancia',
      photos_consent: false,
    });
    expect(r.success).toBe(false);
    expect(camposComErro(r)).toContain('protocol');
  });

  it('coage photos_consent de "on"/"true" para boolean', () => {
    const r = criarAvaliacaoSchema.safeParse({
      student_id: STUDENT,
      protocol: 'manual',
      body_fat_pct: 18,
      photos_consent: 'on',
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.photos_consent).toBe(true);
  });
});

describe('protocolo manual', () => {
  it('exige body_fat_pct', () => {
    const r = criarAvaliacaoSchema.safeParse({
      student_id: STUDENT,
      protocol: 'manual',
      photos_consent: false,
    });
    expect(r.success).toBe(false);
    expect(camposComErro(r)).toContain('body_fat_pct');
  });

  it('aceita quando body_fat_pct é informado (sem dobras)', () => {
    const r = criarAvaliacaoSchema.safeParse({
      student_id: STUDENT,
      protocol: 'manual',
      body_fat_pct: 22,
      weight_kg: 70,
      height_cm: 170,
      photos_consent: false,
    });
    expect(r.success).toBe(true);
  });
});

describe('Pollock 3 — exige dobras por gênero', () => {
  it('homem exige peitoral, abdominal e coxa', () => {
    const r = criarAvaliacaoSchema.safeParse({
      student_id: STUDENT,
      protocol: 'pollock_3',
      gender: 'male',
      age: 30,
      photos_consent: false,
      // faltam skf_chest, skf_abdominal, skf_thigh
    });
    expect(r.success).toBe(false);
    const campos = camposComErro(r);
    expect(campos).toEqual(expect.arrayContaining(['skf_chest', 'skf_abdominal', 'skf_thigh']));
  });

  it('homem aceita quando as 3 dobras estão presentes', () => {
    const r = criarAvaliacaoSchema.safeParse({
      student_id: STUDENT,
      protocol: 'pollock_3',
      gender: 'male',
      age: 30,
      skf_chest: 10,
      skf_abdominal: 20,
      skf_thigh: 15,
      photos_consent: false,
    });
    expect(r.success).toBe(true);
  });

  it('mulher exige dobras diferentes (tríceps, suprailíaca, coxa)', () => {
    const r = criarAvaliacaoSchema.safeParse({
      student_id: STUDENT,
      protocol: 'pollock_3',
      gender: 'female',
      age: 28,
      // dobras masculinas não satisfazem o protocolo feminino
      skf_chest: 10,
      skf_abdominal: 20,
      photos_consent: false,
    });
    expect(r.success).toBe(false);
    const campos = camposComErro(r);
    expect(campos).toEqual(expect.arrayContaining(['skf_triceps', 'skf_suprailiac', 'skf_thigh']));
  });

  it('exige idade para Pollock', () => {
    const r = criarAvaliacaoSchema.safeParse({
      student_id: STUDENT,
      protocol: 'pollock_3',
      gender: 'male',
      skf_chest: 10,
      skf_abdominal: 20,
      skf_thigh: 15,
      photos_consent: false,
    });
    expect(r.success).toBe(false);
    expect(camposComErro(r)).toContain('age');
  });

  it('exige gênero para protocolos de dobras', () => {
    const r = criarAvaliacaoSchema.safeParse({
      student_id: STUDENT,
      protocol: 'pollock_3',
      age: 30,
      skf_chest: 10,
      skf_abdominal: 20,
      skf_thigh: 15,
      photos_consent: false,
    });
    expect(r.success).toBe(false);
    expect(camposComErro(r)).toContain('gender');
  });
});

describe('Pollock 7 — exige as 7 dobras', () => {
  it('aceita avaliação completa', () => {
    const r = criarAvaliacaoSchema.safeParse({
      student_id: STUDENT,
      protocol: 'pollock_7',
      gender: 'female',
      age: 40,
      skf_chest: 12,
      skf_midaxillary: 10,
      skf_triceps: 18,
      skf_subscapular: 14,
      skf_abdominal: 20,
      skf_suprailiac: 16,
      skf_thigh: 22,
      weight_kg: 65,
      height_cm: 165,
      photos_consent: true,
    });
    expect(r.success).toBe(true);
  });

  it('rejeita quando falta uma dobra', () => {
    const r = criarAvaliacaoSchema.safeParse({
      student_id: STUDENT,
      protocol: 'pollock_7',
      gender: 'male',
      age: 35,
      skf_chest: 12,
      skf_midaxillary: 10,
      skf_triceps: 18,
      skf_subscapular: 14,
      skf_abdominal: 20,
      skf_suprailiac: 16,
      // falta skf_thigh
      photos_consent: false,
    });
    expect(r.success).toBe(false);
    expect(camposComErro(r)).toContain('skf_thigh');
  });
});

describe('Guedes — 3 dobras, sem idade obrigatória', () => {
  it('homem aceita sem idade (log10 não usa idade)', () => {
    const r = criarAvaliacaoSchema.safeParse({
      student_id: STUDENT,
      protocol: 'guedes',
      gender: 'male',
      skf_triceps: 10,
      skf_suprailiac: 12,
      skf_abdominal: 18,
      photos_consent: false,
    });
    expect(r.success).toBe(true);
  });

  it('mulher exige coxa, suprailíaca e subescapular', () => {
    const r = criarAvaliacaoSchema.safeParse({
      student_id: STUDENT,
      protocol: 'guedes',
      gender: 'female',
      skf_triceps: 10,
      skf_abdominal: 18,
      photos_consent: false,
    });
    expect(r.success).toBe(false);
    const campos = camposComErro(r);
    expect(campos).toEqual(expect.arrayContaining(['skf_thigh', 'skf_suprailiac', 'skf_subscapular']));
  });
});

describe('Durnin — 4 dobras incluindo bíceps', () => {
  it('aceita com biceps/triceps/subescapular/suprailíaca e idade', () => {
    const r = criarAvaliacaoSchema.safeParse({
      student_id: STUDENT,
      protocol: 'durnin',
      gender: 'male',
      age: 25,
      skf_biceps: 5,
      skf_triceps: 10,
      skf_subscapular: 12,
      skf_suprailiac: 13,
      photos_consent: false,
    });
    expect(r.success).toBe(true);
  });

  it('exige skf_biceps', () => {
    const r = criarAvaliacaoSchema.safeParse({
      student_id: STUDENT,
      protocol: 'durnin',
      gender: 'female',
      age: 35,
      skf_triceps: 10,
      skf_subscapular: 12,
      skf_suprailiac: 13,
      photos_consent: false,
    });
    expect(r.success).toBe(false);
    expect(camposComErro(r)).toContain('skf_biceps');
  });
});
