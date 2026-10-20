import { describe, expect, it } from 'vitest';

import { criarAvaliacaoSchema, type CriarAvaliacaoInput } from '@/schemas/avaliacao';
import { calcularComposicao, type ProtocoloCalculo } from '@/lib/assessment';

/**
 * Teste de LIGAÇÃO (binding) do fluxo form -> action da avaliação física.
 *
 * O objetivo NÃO é reconferir as fórmulas (já cobertas em assessment.test.ts),
 * e sim provar que o caminho ponta a ponta funciona:
 *   1. o FormData montado pelo form é aceito por `criarAvaliacaoSchema`;
 *   2. os dados validados, passados a `calcularComposicao`, devolvem
 *      bmi/bodyFatPct/fatMassKg/leanMassKg NÃO-NULOS.
 *
 * Se esse teste falha no passo (1), a quebra está no schema (parse silencioso);
 * se falha no passo (2), a quebra está na montagem da entrada do cálculo.
 */

const STUDENT = '11111111-1111-1111-1111-111111111111';

/**
 * Reproduz a montagem de FormData do `avaliacao-form.tsx`: todo valor é string,
 * campos vazios não são anexados e `photos_consent` vira 'true'/'false'. Depois
 * aplicamos `Object.fromEntries`, exatamente como a Server Action faz.
 */
function entradaDoForm(valores: Record<string, string>): Record<string, FormDataEntryValue> {
  const fd = new FormData();
  for (const [chave, valor] of Object.entries(valores)) {
    if (chave === 'photos_consent') {
      fd.append('photos_consent', valor === 'true' ? 'true' : 'false');
    } else if (valor !== '' && valor != null) {
      fd.append(chave, valor);
    }
  }
  return Object.fromEntries(fd);
}

/** Monta a entrada de `calcularComposicao` a partir dos dados já validados. */
function entradaComposicao(dados: CriarAvaliacaoInput) {
  return {
    protocol: dados.protocol as ProtocoloCalculo,
    genero: (dados.gender ?? 'male') as 'male' | 'female',
    idade: dados.age ?? null,
    pesoKg: dados.weight_kg ?? null,
    alturaCm: dados.height_cm ?? null,
    bodyFatPctManual: dados.body_fat_pct ?? null,
    dobras: {
      chest: dados.skf_chest ?? null,
      midaxillary: dados.skf_midaxillary ?? null,
      triceps: dados.skf_triceps ?? null,
      subscapular: dados.skf_subscapular ?? null,
      abdominal: dados.skf_abdominal ?? null,
      suprailiac: dados.skf_suprailiac ?? null,
      thigh: dados.skf_thigh ?? null,
      biceps: dados.skf_biceps ?? null,
    },
  };
}

describe('fluxo form -> action: Pollock 3 (dobras) calcula composição', () => {
  it('aceita o FormData do form e devolve bmi/%gordura/massas não-nulos', () => {
    const entrada = entradaDoForm({
      student_id: STUDENT,
      protocol: 'pollock_3',
      gender: 'male',
      age: '30',
      weight_kg: '80',
      height_cm: '180',
      skf_chest: '10',
      skf_abdominal: '20',
      skf_thigh: '15',
      photos_consent: 'false',
    });

    const parsed = criarAvaliacaoSchema.safeParse(entrada);
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;

    const r = calcularComposicao(entradaComposicao(parsed.data));
    expect(r.bmi).not.toBeNull();
    expect(r.bodyFatPct).not.toBeNull();
    expect(r.fatMassKg).not.toBeNull();
    expect(r.leanMassKg).not.toBeNull();
    expect(r.bmi as number).toBeCloseTo(24.69, 1);
    expect(r.bodyFatPct as number).toBeCloseTo(13.61, 1);
  });

  it('aceita números decimais com vírgula (pt-BR) vindos do input', () => {
    const entrada = entradaDoForm({
      student_id: STUDENT,
      protocol: 'pollock_3',
      gender: 'male',
      age: '30',
      weight_kg: '80,5',
      height_cm: '180,2',
      skf_chest: '10,5',
      skf_abdominal: '20',
      skf_thigh: '15',
      photos_consent: 'false',
    });

    const parsed = criarAvaliacaoSchema.safeParse(entrada);
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;

    expect(parsed.data.weight_kg).toBeCloseTo(80.5, 2);
    expect(parsed.data.skf_chest).toBeCloseTo(10.5, 2);

    const r = calcularComposicao(entradaComposicao(parsed.data));
    expect(r.bmi).not.toBeNull();
    expect(r.bodyFatPct).not.toBeNull();
    expect(r.fatMassKg).not.toBeNull();
    expect(r.leanMassKg).not.toBeNull();
  });
});

describe('fluxo form -> action: Durnin (bíceps em measurements)', () => {
  it('aceita o FormData e calcula %gordura com as 4 dobras + idade', () => {
    const entrada = entradaDoForm({
      student_id: STUDENT,
      protocol: 'durnin',
      gender: 'male',
      age: '25',
      weight_kg: '75',
      height_cm: '178',
      skf_biceps: '5',
      skf_triceps: '10',
      skf_subscapular: '12',
      skf_suprailiac: '13',
      photos_consent: 'false',
    });

    const parsed = criarAvaliacaoSchema.safeParse(entrada);
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;

    const r = calcularComposicao(entradaComposicao(parsed.data));
    expect(r.bodyFatPct).not.toBeNull();
    expect(r.fatMassKg).not.toBeNull();
    expect(r.leanMassKg).not.toBeNull();
  });
});
