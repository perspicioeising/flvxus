import { readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { suggestWorkoutOutputSchema } from '@/schemas/ia';
import { SUGGEST_WORKOUT_SYSTEM } from '@/supabase/functions/_prompts/suggest-workout';
import {
  parseStructuredOutput,
  type AnthropicMessageResponse,
} from '@/supabase/functions/_shared/structured-output';

const UUID_A = '11111111-1111-1111-1111-111111111111';
const UUID_B = '22222222-2222-2222-2222-222222222222';

/** Uma série válida (contígua a partir de 1). */
function serie(set_number: number) {
  return {
    set_number,
    kind: 'work',
    target_reps: '8-12',
    rest_seconds: 90,
    target_load: null,
    note: null,
  };
}

/** Um exercício válido com N séries contíguas. */
function exercicio(exercise_id: string, order_index: number, nSeries = 2) {
  return {
    exercise_id,
    exercise_name: 'Supino reto',
    order_index,
    sets: nSeries,
    reps: '8-12',
    rest_seconds: 90,
    target_load: null,
    notes: null,
    series: Array.from({ length: nSeries }, (_, i) => serie(i + 1)),
  };
}

/** Plano BOM no modo POR DIA (weekday em cada divisão, sem rotation_steps). */
function planoPorDia() {
  return {
    divisions: [
      {
        label: 'Treino A — Peito e Tríceps',
        weekday: 1,
        exercises: [exercicio(UUID_A, 0)],
      },
      {
        label: 'Treino B — Costas e Bíceps',
        weekday: 3,
        exercises: [exercicio(UUID_B, 0)],
      },
    ],
    disclaimer: 'Rascunho gerado por IA; não substitui profissional de educação física/médico.',
  };
}

/** Plano BOM no modo POR DIVISÃO (weekday null, rotation_steps presente). */
function planoPorDivisao() {
  return {
    divisions: [
      { label: 'A', weekday: null, exercises: [exercicio(UUID_A, 0)] },
      { label: 'B', weekday: null, exercises: [exercicio(UUID_B, 0)] },
    ],
    rotation_steps: [
      { type: 'division', label: 'A' },
      { type: 'division', label: 'B' },
      { type: 'rest' },
    ],
    rest_days: [0],
    disclaimer: 'Rascunho gerado por IA; não substitui profissional de educação física/médico.',
  };
}

describe('suggestWorkoutOutputSchema (v2)', () => {
  it('valida um plano BOM por dia', () => {
    expect(suggestWorkoutOutputSchema.safeParse(planoPorDia()).success).toBe(true);
  });

  it('valida um plano BOM por divisão (com rotation_steps)', () => {
    expect(suggestWorkoutOutputSchema.safeParse(planoPorDivisao()).success).toBe(true);
  });

  it('aceita campos opcionais nulos/ausentes (notes, target_load, exercise_name)', () => {
    const plano = planoPorDia();
    delete (plano.divisions[0].exercises[0] as { exercise_name?: unknown }).exercise_name;
    plano.divisions[0].exercises[0].notes = null;
    plano.divisions[0].exercises[0].target_load = null;
    expect(suggestWorkoutOutputSchema.safeParse(plano).success).toBe(true);
  });

  it('rebaixa kind desconhecido/amplo para "work"', () => {
    const plano = planoPorDia() as unknown as {
      divisions: { exercises: { series: { kind: unknown }[] }[] }[];
    };
    plano.divisions[0].exercises[0].series[0].kind = 'dropset';
    plano.divisions[0].exercises[0].series[1].kind = 'algo-invalido';
    const parsed = suggestWorkoutOutputSchema.safeParse(plano);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.divisions[0].exercises[0].series[0].kind).toBe('work');
      expect(parsed.data.divisions[0].exercises[0].series[1].kind).toBe('work');
    }
  });

  it('rejeita weekday fora de 0..6', () => {
    const plano = planoPorDia();
    plano.divisions[0].weekday = 7;
    expect(suggestWorkoutOutputSchema.safeParse(plano).success).toBe(false);
  });

  it('rejeita exercise_id que não é uuid', () => {
    const plano = planoPorDia() as unknown as {
      divisions: { exercises: { exercise_id: string }[] }[];
    };
    plano.divisions[0].exercises[0].exercise_id = 'supino-reto';
    expect(suggestWorkoutOutputSchema.safeParse(plano).success).toBe(false);
  });

  it('rejeita set_number com buraco (não contíguo)', () => {
    const plano = planoPorDia();
    plano.divisions[0].exercises[0].series[1].set_number = 3;
    expect(suggestWorkoutOutputSchema.safeParse(plano).success).toBe(false);
  });

  it('rejeita divisão sem exercícios', () => {
    const plano = planoPorDia();
    plano.divisions[0].exercises = [];
    expect(suggestWorkoutOutputSchema.safeParse(plano).success).toBe(false);
  });

  it('rejeita exercício sem séries', () => {
    const plano = planoPorDia();
    plano.divisions[0].exercises[0].series = [];
    expect(suggestWorkoutOutputSchema.safeParse(plano).success).toBe(false);
  });

  it('aceita exercício com N séries individuais (4) e set_number 1..4 contíguo', () => {
    const plano = planoPorDia();
    plano.divisions[0].exercises = [exercicio(UUID_A, 0, 4)];
    const parsed = suggestWorkoutOutputSchema.safeParse(plano);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      const series = parsed.data.divisions[0].exercises[0].series;
      expect(series).toHaveLength(4);
      expect(series.map((s) => s.set_number)).toEqual([1, 2, 3, 4]);
    }
  });

  it('coerência sets↔series: rejeita sets:4 com 1 série (o bug reproduzido)', () => {
    const ex = exercicio(UUID_A, 0, 1); // sets:1, series.length:1
    ex.sets = 4; // agora sets:4 ≠ series.length:1
    const plano = planoPorDia();
    plano.divisions[0].exercises = [ex];
    expect(suggestWorkoutOutputSchema.safeParse(plano).success).toBe(false);
  });

  it('coerência sets↔series: aceita série única quando sets ausente/null', () => {
    const ex = exercicio(UUID_A, 0, 1); // sets:1, series.length:1
    delete (ex as { sets?: unknown }).sets; // ramo typeof sets !== 'number'
    const plano = planoPorDia();
    plano.divisions[0].exercises = [ex];
    expect(suggestWorkoutOutputSchema.safeParse(plano).success).toBe(true);
  });

  it('rejeita plano sem divisões', () => {
    const plano = planoPorDia();
    plano.divisions = [];
    expect(suggestWorkoutOutputSchema.safeParse(plano).success).toBe(false);
  });

  it('rejeita disclaimer ausente', () => {
    const { disclaimer: _omitido, ...semDisclaimer } = planoPorDia();
    expect(suggestWorkoutOutputSchema.safeParse(semDisclaimer).success).toBe(false);
  });

  it('rejeita mistura de modos: algumas divisões com weekday, outras null', () => {
    const plano = planoPorDia() as unknown as {
      divisions: { weekday: number | null }[];
      disclaimer: string;
    };
    plano.divisions[1].weekday = null;
    expect(suggestWorkoutOutputSchema.safeParse(plano).success).toBe(false);
  });

  it('rejeita weekday junto com rotation_steps (modo por dia com rotação)', () => {
    const plano = planoPorDia() as unknown as Record<string, unknown>;
    plano.rotation_steps = [
      { type: 'division', label: 'Treino A — Peito e Tríceps' },
      { type: 'division', label: 'Treino B — Costas e Bíceps' },
    ];
    expect(suggestWorkoutOutputSchema.safeParse(plano).success).toBe(false);
  });

  it('rejeita modo por divisão sem rotation_steps', () => {
    const plano = planoPorDivisao() as unknown as { rotation_steps?: unknown };
    delete plano.rotation_steps;
    expect(suggestWorkoutOutputSchema.safeParse(plano).success).toBe(false);
  });

  it('rejeita rotation_steps com label inexistente', () => {
    const plano = planoPorDivisao();
    plano.rotation_steps[0] = { type: 'division', label: 'C' };
    expect(suggestWorkoutOutputSchema.safeParse(plano).success).toBe(false);
  });

  it('rejeita rotation_steps com divisão faltando', () => {
    const plano = planoPorDivisao();
    plano.rotation_steps = [
      { type: 'division', label: 'A' },
      { type: 'rest' },
    ];
    expect(suggestWorkoutOutputSchema.safeParse(plano).success).toBe(false);
  });

  it('rejeita labels de divisão repetidos', () => {
    const plano = planoPorDia();
    plano.divisions[1].label = plano.divisions[0].label;
    expect(suggestWorkoutOutputSchema.safeParse(plano).success).toBe(false);
  });
});

/**
 * Paridade de TRANSPORTE inline <-> canônica: a mesma resposta FAKE da Anthropic
 * (JSON v2 em bloco de texto, como `output_config.format` devolve) deve ser
 * aceita/rejeitada do mesmo jeito ao passar por `parseStructuredOutput` +
 * `suggestWorkoutOutputSchema` (o caminho canônico) e pelo `safeParse` direto
 * sobre o objeto (o caminho inline usa o MESMO Zod embutido, cópia literal).
 */
function fakeResponse(input: unknown): AnthropicMessageResponse {
  return { stop_reason: 'end_turn', content: [{ type: 'text', text: JSON.stringify(input) }] };
}

describe('suggest-workout: paridade de transporte (parseStructuredOutput v2)', () => {
  it('aceita a MESMA resposta FAKE v2 que o safeParse direto aceita', () => {
    const plano = planoPorDivisao();
    const viaTransporte = parseStructuredOutput(fakeResponse(plano), suggestWorkoutOutputSchema);
    expect(viaTransporte.ok).toBe(true);
    expect(suggestWorkoutOutputSchema.safeParse(plano).success).toBe(true);
    if (viaTransporte.ok) {
      expect(viaTransporte.data.divisions[0].exercises[0].exercise_id).toBe(UUID_A);
    }
  });

  it('rejeita a MESMA resposta FAKE v2 inválida que o safeParse direto rejeita', () => {
    const plano = planoPorDia();
    (plano.divisions[0].exercises[0] as { exercise_id: string }).exercise_id = 'nao-e-uuid';
    const viaTransporte = parseStructuredOutput(fakeResponse(plano), suggestWorkoutOutputSchema);
    expect(viaTransporte.ok).toBe(false);
    expect(suggestWorkoutOutputSchema.safeParse(plano).success).toBe(false);
  });

  it('aceita via transporte uma resposta FAKE com 4 séries coerentes', () => {
    const plano = planoPorDivisao();
    plano.divisions[0].exercises = [exercicio(UUID_A, 0, 4)];
    const viaTransporte = parseStructuredOutput(fakeResponse(plano), suggestWorkoutOutputSchema);
    expect(viaTransporte.ok).toBe(true);
    if (viaTransporte.ok) {
      expect(viaTransporte.data.divisions[0].exercises[0].series).toHaveLength(4);
    }
  });
});

/**
 * Prova de EQUIVALÊNCIA do prompt canônico (.ts) ↔ inline (.txt). Como chamar a
 * Anthropic real é impossível aqui, esta é a garantia determinística de que a
 * instrução corrigida existe e que os dois blocos de prompt não divergiram.
 */
describe('suggest-workout: paridade do system prompt (canônico ↔ inline)', () => {
  const inlineTxt = readFileSync(
    path.resolve(__dirname, '../../../supabase/functions-inline/suggest-workout.txt'),
    'utf8',
  );

  it('o corpo de SYSTEM_PROMPT (inline) é idêntico a SUGGEST_WORKOUT_SYSTEM (canônico)', () => {
    const match = inlineTxt.match(/const SYSTEM_PROMPT = `([\s\S]*?)`;/);
    expect(match).not.toBeNull();
    // Normaliza fim de linha (CRLF/LF): a diferença só reflete o artefato de
    // checkout no Windows, não o conteúdo do prompt.
    const normalizar = (s: string) => s.replace(/\r\n/g, '\n');
    const systemPromptInline = normalizar(match![1]);
    expect(systemPromptInline).toBe(normalizar(SUGGEST_WORKOUT_SYSTEM));
  });

  it('o prompt exige N séries individuais (um objeto por série) e ancora 3–4 de trabalho', () => {
    expect(SUGGEST_WORKOUT_SYSTEM).toMatch(/um objeto para CADA série/i);
    expect(SUGGEST_WORKOUT_SYSTEM).toMatch(/3 a 4 séries de trabalho/i);
  });
});
