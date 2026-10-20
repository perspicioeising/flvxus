import { describe, expect, it } from 'vitest';

import { suggestWorkoutOutputSchema } from '@/schemas/ia';

const bom = {
  days: [
    {
      weekday: 1,
      label: 'Treino A — Peito e Tríceps',
      exercises: [
        {
          name: 'Supino reto',
          sets: 4,
          reps: '8-12',
          rest_seconds: 90,
          notes: 'Controlar a fase excêntrica.',
        },
      ],
    },
  ],
  disclaimer: 'Rascunho gerado por IA; não substitui profissional de educação física/médico.',
};

describe('suggestWorkoutOutputSchema', () => {
  it('valida um exemplo BOM', () => {
    expect(suggestWorkoutOutputSchema.safeParse(bom).success).toBe(true);
  });

  it('aceita notes nulo/ausente e label ausente', () => {
    const ok = structuredClone(bom) as unknown as {
      days: { label?: unknown; exercises: { notes?: unknown }[] }[];
    };
    delete ok.days[0].label;
    ok.days[0].exercises[0].notes = null;
    expect(suggestWorkoutOutputSchema.safeParse(ok).success).toBe(true);
  });

  it('rejeita weekday fora do intervalo 0..6', () => {
    const ruim = structuredClone(bom);
    ruim.days[0].weekday = 7;
    expect(suggestWorkoutOutputSchema.safeParse(ruim).success).toBe(false);
  });

  it('rejeita sets não-positivo', () => {
    const ruim = structuredClone(bom);
    ruim.days[0].exercises[0].sets = 0;
    expect(suggestWorkoutOutputSchema.safeParse(ruim).success).toBe(false);
  });

  it('rejeita tipo errado (reps numérico)', () => {
    const ruim = structuredClone(bom) as unknown as {
      days: { exercises: { reps: unknown }[] }[];
    };
    ruim.days[0].exercises[0].reps = 10;
    expect(suggestWorkoutOutputSchema.safeParse(ruim).success).toBe(false);
  });

  it('rejeita dia sem exercícios', () => {
    const ruim = structuredClone(bom);
    ruim.days[0].exercises = [];
    expect(suggestWorkoutOutputSchema.safeParse(ruim).success).toBe(false);
  });

  it('rejeita campo faltando (disclaimer ausente)', () => {
    const { disclaimer: _omitido, ...semDisclaimer } = bom;
    expect(suggestWorkoutOutputSchema.safeParse(semDisclaimer).success).toBe(false);
  });
});
