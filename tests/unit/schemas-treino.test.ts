import { describe, expect, it } from 'vitest';

import type { PlanStatus } from '@/types/database.types';
import { TRANSICOES_STATUS_INFO } from '@/components/professor/treinos/status-transicoes';
import {
  SET_KINDS,
  clonarFichaSchema,
  criarFichaMultiModeloSchema,
  divisaoModeloSchema,
  fichaSchema,
  itemFichaSchema,
  itemModeloSchema,
  modeloSchema,
  serieSchema,
  transicaoPermitida,
  transicaoStatusSchema,
} from '@/schemas/treino';
import { valoresDaSerie } from '@/lib/treino/series';

const EX_ID = '11111111-1111-1111-1111-111111111111';
const ALUNO_ID = '22222222-2222-2222-2222-222222222222';
const MODELO_ID = '33333333-3333-3333-3333-333333333333';
const FICHA_ID = '55555555-5555-5555-5555-555555555555';

describe('itemModeloSchema', () => {
  it('aceita um item mínimo (só exercise_id)', () => {
    const r = itemModeloSchema.safeParse({ exercise_id: EX_ID });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.order_index).toBe(0);
      expect(r.data.sets).toBeUndefined();
      expect(r.data.reps).toBeUndefined();
    }
  });

  it('normaliza sets/rest_seconds/target_load vindos como string', () => {
    const r = itemModeloSchema.safeParse({
      exercise_id: EX_ID,
      order_index: '2',
      sets: '4',
      reps: '8-12',
      rest_seconds: '60',
      target_load: '42,5',
      notes: 'cadência lenta',
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.order_index).toBe(2);
      expect(r.data.sets).toBe(4);
      expect(r.data.reps).toBe('8-12');
      expect(r.data.rest_seconds).toBe(60);
      expect(r.data.target_load).toBe(42.5);
    }
  });

  it('trata campos vazios de prescrição como ausentes', () => {
    const r = itemModeloSchema.safeParse({
      exercise_id: EX_ID,
      sets: '',
      reps: '',
      rest_seconds: '',
      target_load: '',
      notes: '',
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.sets).toBeUndefined();
      expect(r.data.target_load).toBeUndefined();
      expect(r.data.notes).toBeUndefined();
    }
  });

  it('rejeita exercise_id que não é uuid', () => {
    const r = itemModeloSchema.safeParse({ exercise_id: 'nao-eh-uuid' });
    expect(r.success).toBe(false);
  });

  it('rejeita sets não positivo', () => {
    const r = itemModeloSchema.safeParse({ exercise_id: EX_ID, sets: '0' });
    expect(r.success).toBe(false);
  });
});

describe('itemFichaSchema', () => {
  it('aceita weekday de 0 a 6', () => {
    for (const weekday of [0, 3, 6]) {
      const r = itemFichaSchema.safeParse({ exercise_id: EX_ID, weekday });
      expect(r.success).toBe(true);
    }
  });

  it('aceita weekday ausente', () => {
    const r = itemFichaSchema.safeParse({ exercise_id: EX_ID });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.weekday).toBeUndefined();
    }
  });

  it('rejeita weekday fora de 0..6', () => {
    expect(itemFichaSchema.safeParse({ exercise_id: EX_ID, weekday: 7 }).success).toBe(false);
    expect(itemFichaSchema.safeParse({ exercise_id: EX_ID, weekday: -1 }).success).toBe(false);
  });

  it('aceita division e normaliza vazio para undefined', () => {
    const comDivisao = itemFichaSchema.safeParse({ exercise_id: EX_ID, division: 'A' });
    expect(comDivisao.success).toBe(true);
    if (comDivisao.success) {
      expect(comDivisao.data.division).toBe('A');
    }
    const vazio = itemFichaSchema.safeParse({ exercise_id: EX_ID, division: '' });
    expect(vazio.success).toBe(true);
    if (vazio.success) {
      expect(vazio.data.division).toBeUndefined();
    }
  });

  it('aceita division no novo limite (120) e rejeita acima com mensagem pt-BR', () => {
    expect(
      itemFichaSchema.safeParse({ exercise_id: EX_ID, division: 'x'.repeat(120) }).success
    ).toBe(true);
    const acima = itemFichaSchema.safeParse({ exercise_id: EX_ID, division: 'x'.repeat(121) });
    expect(acima.success).toBe(false);
    if (!acima.success) {
      expect(
        acima.error.issues.some((i) => i.message.includes('no máximo 120 caracteres'))
      ).toBe(true);
    }
  });
});

describe('séries detalhadas (tipo + observação por série)', () => {
  it('aceita item SEM series (retrocompatibilidade)', () => {
    const modelo = itemModeloSchema.safeParse({ exercise_id: EX_ID });
    expect(modelo.success).toBe(true);
    if (modelo.success) {
      expect(modelo.data.series).toBeUndefined();
    }
    const ficha = itemFichaSchema.safeParse({ exercise_id: EX_ID });
    expect(ficha.success).toBe(true);
  });

  it('aceita series contíguas 1..N (fora de ordem na entrada)', () => {
    const r = itemFichaSchema.safeParse({
      exercise_id: EX_ID,
      series: [
        { set_number: 2, kind: 'work', note: 'série de trabalho' },
        { set_number: 1, kind: 'warmup' },
        { set_number: 3, kind: 'adaptation', note: '' },
      ],
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.series).toHaveLength(3);
      // `kind` default aplicado e `note` vazia normalizada para undefined.
      expect(r.data.series?.[1].kind).toBe('warmup');
    }
  });

  it('aplica o default kind="work" quando ausente', () => {
    const r = serieSchemaDefaultKind();
    expect(r).toBe('work');
  });

  it('rejeita series com buraco (1,3 sem o 2)', () => {
    const r = itemFichaSchema.safeParse({
      exercise_id: EX_ID,
      series: [
        { set_number: 1, kind: 'work' },
        { set_number: 3, kind: 'work' },
      ],
    });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues.some((i) => i.path.includes('series'))).toBe(true);
    }
  });

  it('rejeita series com número repetido (1,1)', () => {
    const r = itemModeloSchema.safeParse({
      exercise_id: EX_ID,
      series: [
        { set_number: 1, kind: 'work' },
        { set_number: 1, kind: 'warmup' },
      ],
    });
    expect(r.success).toBe(false);
  });

  it('item com series vazio é válido (não compara com sets)', () => {
    const r = itemFichaSchema.safeParse({
      exercise_id: EX_ID,
      sets: '3',
      series: [],
    });
    expect(r.success).toBe(true);
  });
});

/** Helper local: confirma o default de `kind` ao parsear uma série sem o campo. */
function serieSchemaDefaultKind(): string {
  const r = itemFichaSchema.safeParse({
    exercise_id: EX_ID,
    series: [{ set_number: 1 }],
  });
  if (!r.success) throw new Error('esperava sucesso');
  return r.data.series?.[0].kind ?? 'erro';
}

describe('serieSchema — reps/descanso/carga por série', () => {
  it('aceita rest_seconds positivo (número e string)', () => {
    const numero = serieSchema.safeParse({ set_number: 1, rest_seconds: 90 });
    expect(numero.success).toBe(true);
    if (numero.success) {
      expect(numero.data.rest_seconds).toBe(90);
    }
    const texto = serieSchema.safeParse({ set_number: 1, rest_seconds: '60' });
    expect(texto.success).toBe(true);
    if (texto.success) {
      expect(texto.data.rest_seconds).toBe(60);
    }
  });

  it('normaliza rest_seconds vazio para undefined (herda do item)', () => {
    const r = serieSchema.safeParse({ set_number: 1, rest_seconds: '' });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.rest_seconds).toBeUndefined();
    }
  });

  it('rejeita rest_seconds 0, negativo ou decimal', () => {
    expect(serieSchema.safeParse({ set_number: 1, rest_seconds: 0 }).success).toBe(false);
    expect(serieSchema.safeParse({ set_number: 1, rest_seconds: -30 }).success).toBe(false);
    expect(serieSchema.safeParse({ set_number: 1, rest_seconds: 1.5 }).success).toBe(false);
  });

  it('aceita todos os 10 tipos de série (kind)', () => {
    for (const kind of SET_KINDS) {
      const r = serieSchema.safeParse({ set_number: 1, kind });
      expect(r.success).toBe(true);
      if (r.success) {
        expect(r.data.kind).toBe(kind);
      }
    }
  });

  it('aceita os novos kinds dentro de series contíguas', () => {
    const r = itemFichaSchema.safeParse({
      exercise_id: EX_ID,
      series: [
        { set_number: 1, kind: 'dropset', rest_seconds: 45 },
        { set_number: 2, kind: 'rest_pause' },
        { set_number: 3, kind: 'failure' },
      ],
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.series?.[0].kind).toBe('dropset');
      expect(r.data.series?.[0].rest_seconds).toBe(45);
    }
  });

  it('rejeita kind fora do enum', () => {
    expect(serieSchema.safeParse({ set_number: 1, kind: 'turbo' }).success).toBe(false);
  });
});

describe('carga 0 na montagem da ficha (peso corporal / sem carga)', () => {
  it('itemModeloSchema aceita target_load = 0 (número e string)', () => {
    const numero = itemModeloSchema.safeParse({ exercise_id: EX_ID, target_load: 0 });
    expect(numero.success).toBe(true);
    if (numero.success) {
      expect(numero.data.target_load).toBe(0);
    }
    const texto = itemModeloSchema.safeParse({ exercise_id: EX_ID, target_load: '0' });
    expect(texto.success).toBe(true);
    if (texto.success) {
      expect(texto.data.target_load).toBe(0);
    }
  });

  it('itemFichaSchema aceita target_load = 0', () => {
    const r = itemFichaSchema.safeParse({ exercise_id: EX_ID, target_load: '0' });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.target_load).toBe(0);
    }
  });

  it('serieSchema aceita target_load = 0 na série individual', () => {
    const r = serieSchema.safeParse({ set_number: 1, target_load: 0 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.target_load).toBe(0);
    }
  });

  it('fichaSchema aceita ficha com carga 0 no item e na série (ponta a ponta)', () => {
    const r = fichaSchema.safeParse({
      student_id: ALUNO_ID,
      name: 'Ficha peso corporal',
      itens: [
        {
          exercise_id: EX_ID,
          order_index: 0,
          sets: '3',
          target_load: '0',
          series: [
            { set_number: 1, kind: 'work', target_load: 0 },
            { set_number: 2, kind: 'work', target_load: '0' },
            { set_number: 3, kind: 'work' },
          ],
        },
      ],
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.itens[0].target_load).toBe(0);
      expect(r.data.itens[0].series?.[0].target_load).toBe(0);
    }
  });

  it('rejeita carga NEGATIVA com mensagem em pt-BR (não a crua do Zod)', () => {
    const item = itemModeloSchema.safeParse({ exercise_id: EX_ID, target_load: '-5' });
    expect(item.success).toBe(false);
    if (!item.success) {
      const msgs = item.error.issues.map((i) => i.message);
      expect(msgs).toContain('A carga não pode ser negativa.');
      expect(msgs.some((m) => /greater than|must be/i.test(m))).toBe(false);
    }

    // No fichaSchema, o erro aninhado borbulha para `fieldErrors.itens`
    // (é dali que o form roteia a mensagem para o toast em pt-BR).
    const ficha = fichaSchema.safeParse({
      student_id: ALUNO_ID,
      name: 'Ficha inválida',
      itens: [{ exercise_id: EX_ID, order_index: 0, target_load: -1 }],
    });
    expect(ficha.success).toBe(false);
    if (!ficha.success) {
      expect(ficha.error.flatten().fieldErrors.itens?.[0]).toBe(
        'A carga não pode ser negativa.'
      );
    }
  });

  it('execução continua íntegra: carga 0 é valor EXPLÍCITO (série vence geral)', () => {
    // Série define 0 explicitamente → prevalece sobre o default do item (20).
    const comZeroNaSerie = valoresDaSerie(
      [
        {
          setNumber: 1,
          kind: 'work',
          note: null,
          targetReps: null,
          restSeconds: null,
          targetLoad: 0,
        },
      ],
      1,
      { reps: '10', restSeconds: 60, cargaAlvo: 20 }
    );
    expect(comZeroNaSerie.cargaAlvo).toBe(0);

    // Série sem carga (null) herda o default do item, que também pode ser 0.
    const herdaZeroDoItem = valoresDaSerie(
      [
        {
          setNumber: 1,
          kind: 'work',
          note: null,
          targetReps: null,
          restSeconds: null,
          targetLoad: null,
        },
      ],
      1,
      { reps: '10', restSeconds: 60, cargaAlvo: 0 }
    );
    expect(herdaZeroDoItem.cargaAlvo).toBe(0);
  });
});

describe('divisaoModeloSchema', () => {
  it('aceita um modelo com rótulo de divisão válido', () => {
    const r = divisaoModeloSchema.safeParse({ source_workout_id: MODELO_ID, division: 'A' });
    expect(r.success).toBe(true);
  });

  it('faz trim do rótulo', () => {
    const r = divisaoModeloSchema.safeParse({ source_workout_id: MODELO_ID, division: '  B  ' });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.division).toBe('B');
    }
  });

  it('rejeita division vazia (min 1)', () => {
    expect(
      divisaoModeloSchema.safeParse({ source_workout_id: MODELO_ID, division: '' }).success
    ).toBe(false);
    expect(
      divisaoModeloSchema.safeParse({ source_workout_id: MODELO_ID, division: '   ' }).success
    ).toBe(false);
  });

  it('aceita division no novo limite (120) e rejeita acima com mensagem pt-BR', () => {
    expect(
      divisaoModeloSchema.safeParse({ source_workout_id: MODELO_ID, division: 'x'.repeat(120) })
        .success
    ).toBe(true);
    // Um rótulo descritivo >40 (como o gerado pela IA v2) agora passa.
    expect(
      divisaoModeloSchema.safeParse({
        source_workout_id: MODELO_ID,
        division: 'Treino A — Peito, Tríceps e Ombros (ênfase em força)',
      }).success
    ).toBe(true);
    const acima = divisaoModeloSchema.safeParse({
      source_workout_id: MODELO_ID,
      division: 'x'.repeat(121),
    });
    expect(acima.success).toBe(false);
    if (!acima.success) {
      expect(
        acima.error.issues.some((i) =>
          i.message.includes('no máximo 120 caracteres')
        )
      ).toBe(true);
    }
  });

  it('rejeita source_workout_id inválido', () => {
    expect(
      divisaoModeloSchema.safeParse({ source_workout_id: 'nope', division: 'A' }).success
    ).toBe(false);
  });
});

describe('criarFichaMultiModeloSchema', () => {
  const MODELO_B = '44444444-4444-4444-4444-444444444444';

  it('aceita uma ficha com múltiplos modelos e rótulos únicos', () => {
    const r = criarFichaMultiModeloSchema.safeParse({
      student_id: ALUNO_ID,
      name: 'Ficha ABC',
      modelos: [
        { source_workout_id: MODELO_ID, division: 'A' },
        { source_workout_id: MODELO_B, division: 'B' },
      ],
    });
    expect(r.success).toBe(true);
  });

  it('rejeita rótulos duplicados case-insensitive (A e a)', () => {
    const r = criarFichaMultiModeloSchema.safeParse({
      student_id: ALUNO_ID,
      name: 'Ficha',
      modelos: [
        { source_workout_id: MODELO_ID, division: 'A' },
        { source_workout_id: MODELO_B, division: 'a' },
      ],
    });
    expect(r.success).toBe(false);
  });

  it('rejeita lista de modelos vazia (min 1)', () => {
    const r = criarFichaMultiModeloSchema.safeParse({
      student_id: ALUNO_ID,
      name: 'Ficha',
      modelos: [],
    });
    expect(r.success).toBe(false);
  });

  it('rejeita nome vazio', () => {
    const r = criarFichaMultiModeloSchema.safeParse({
      student_id: ALUNO_ID,
      name: '   ',
      modelos: [{ source_workout_id: MODELO_ID, division: 'A' }],
    });
    expect(r.success).toBe(false);
  });
});

describe('modeloSchema', () => {
  it('aceita um modelo válido com itens', () => {
    const r = modeloSchema.safeParse({
      name: 'Treino A - Superiores',
      description: 'Peito e costas',
      itens: [
        { exercise_id: EX_ID, order_index: 0, sets: 4, reps: '10' },
        { exercise_id: EX_ID, order_index: 1 },
      ],
    });
    expect(r.success).toBe(true);
  });

  it('rejeita modelo sem itens', () => {
    const r = modeloSchema.safeParse({ name: 'Vazio', itens: [] });
    expect(r.success).toBe(false);
  });

  it('rejeita nome vazio', () => {
    const r = modeloSchema.safeParse({
      name: '',
      itens: [{ exercise_id: EX_ID }],
    });
    expect(r.success).toBe(false);
  });
});

describe('fichaSchema', () => {
  it('aceita uma ficha válida com aluno e itens', () => {
    const r = fichaSchema.safeParse({
      student_id: ALUNO_ID,
      name: 'Ficha de hipertrofia',
      itens: [{ exercise_id: EX_ID, weekday: 1, order_index: 0 }],
    });
    expect(r.success).toBe(true);
  });

  it('aceita source_workout_id (ficha criada a partir de modelo)', () => {
    const r = fichaSchema.safeParse({
      student_id: ALUNO_ID,
      name: 'Ficha do modelo A',
      source_workout_id: MODELO_ID,
      itens: [{ exercise_id: EX_ID }],
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.source_workout_id).toBe(MODELO_ID);
    }
  });

  it('rejeita student_id inválido', () => {
    const r = fichaSchema.safeParse({
      student_id: 'x',
      name: 'Ficha',
      itens: [{ exercise_id: EX_ID }],
    });
    expect(r.success).toBe(false);
  });

  it('rejeita ficha sem itens', () => {
    const r = fichaSchema.safeParse({
      student_id: ALUNO_ID,
      name: 'Ficha',
      itens: [],
    });
    expect(r.success).toBe(false);
  });
});

describe('fichaSchema — rotation_steps (FEAT-003)', () => {
  /** Ficha base por divisão A/B/C (sem item "sem divisão"). */
  function baseABC(rotation_steps?: unknown) {
    return {
      student_id: ALUNO_ID,
      name: 'Ficha ABC',
      itens: [
        { exercise_id: EX_ID, division: 'A', order_index: 0 },
        { exercise_id: EX_ID, division: 'B', order_index: 1 },
        { exercise_id: EX_ID, division: 'C', order_index: 2 },
      ],
      ...(rotation_steps !== undefined ? { rotation_steps } : {}),
    };
  }

  it('aceita ficha sem rotation_steps (retrocompatibilidade)', () => {
    expect(fichaSchema.safeParse(baseABC()).success).toBe(true);
  });

  it('aceita rotation_steps null (rotação automática)', () => {
    expect(fichaSchema.safeParse(baseABC(null)).success).toBe(true);
  });

  it('aceita sequência válida A, B, descanso, C', () => {
    const r = fichaSchema.safeParse(
      baseABC([
        { type: 'division', label: 'A' },
        { type: 'division', label: 'B' },
        { type: 'rest' },
        { type: 'division', label: 'C' },
      ])
    );
    expect(r.success).toBe(true);
  });

  it('R1: rejeita divisão repetida na sequência', () => {
    const r = fichaSchema.safeParse(
      baseABC([
        { type: 'division', label: 'A' },
        { type: 'division', label: 'A' },
        { type: 'division', label: 'B' },
        { type: 'division', label: 'C' },
      ])
    );
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(
        r.error.issues.some((i) =>
          i.message.includes('só pode aparecer uma vez')
        )
      ).toBe(true);
    }
  });

  it('R2 (falta uma): sequência sem a divisão C é rejeitada', () => {
    const r = fichaSchema.safeParse(
      baseABC([
        { type: 'division', label: 'A' },
        { type: 'division', label: 'B' },
      ])
    );
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(
        r.error.issues.some((i) =>
          i.message.includes('todas as divisões da ficha, e só elas')
        )
      ).toBe(true);
    }
  });

  it('R2 (sobra uma): sequência com divisão D inexistente é rejeitada', () => {
    const r = fichaSchema.safeParse(
      baseABC([
        { type: 'division', label: 'A' },
        { type: 'division', label: 'B' },
        { type: 'division', label: 'C' },
        { type: 'division', label: 'D' },
      ])
    );
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(
        r.error.issues.some((i) =>
          i.message.includes('todas as divisões da ficha, e só elas')
        )
      ).toBe(true);
    }
  });

  it('R3: rejeita rotation_steps quando algum item não tem divisão', () => {
    const r = fichaSchema.safeParse({
      student_id: ALUNO_ID,
      name: 'Ficha mista',
      itens: [
        { exercise_id: EX_ID, division: 'A', order_index: 0 },
        { exercise_id: EX_ID, order_index: 1 }, // sem divisão
      ],
      rotation_steps: [{ type: 'division', label: 'A' }],
    });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(
        r.error.issues.some((i) =>
          i.message.includes('fichas organizadas por divisão')
        )
      ).toBe(true);
    }
  });
});

describe('clonarFichaSchema', () => {
  it('aceita clonagem com ficha de origem e novo aluno, sem nome', () => {
    const r = clonarFichaSchema.safeParse({
      source_plan_id: FICHA_ID,
      student_id: ALUNO_ID,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.name).toBeUndefined();
    }
  });

  it('aceita nome opcional e faz trim', () => {
    const r = clonarFichaSchema.safeParse({
      source_plan_id: FICHA_ID,
      student_id: ALUNO_ID,
      name: '  Treino ABC (cópia)  ',
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.name).toBe('Treino ABC (cópia)');
    }
  });

  it('normaliza nome vazio para undefined (usa padrão na action)', () => {
    const r = clonarFichaSchema.safeParse({
      source_plan_id: FICHA_ID,
      student_id: ALUNO_ID,
      name: '',
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.name).toBeUndefined();
    }
  });

  it('rejeita source_plan_id inválido', () => {
    expect(
      clonarFichaSchema.safeParse({ source_plan_id: 'nope', student_id: ALUNO_ID }).success
    ).toBe(false);
  });

  it('rejeita student_id inválido', () => {
    expect(
      clonarFichaSchema.safeParse({ source_plan_id: FICHA_ID, student_id: 'x' }).success
    ).toBe(false);
  });

  it('rejeita nome acima de 120 caracteres', () => {
    expect(
      clonarFichaSchema.safeParse({
        source_plan_id: FICHA_ID,
        student_id: ALUNO_ID,
        name: 'x'.repeat(121),
      }).success
    ).toBe(false);
  });
});

describe('transicaoStatusSchema', () => {
  it('aceita o fluxo normal draft -> pending_review -> approved -> released', () => {
    expect(transicaoStatusSchema.safeParse({ de: 'draft', para: 'pending_review' }).success).toBe(true);
    expect(transicaoStatusSchema.safeParse({ de: 'pending_review', para: 'approved' }).success).toBe(true);
    expect(transicaoStatusSchema.safeParse({ de: 'approved', para: 'released' }).success).toBe(true);
  });

  it('aceita arquivar a partir de qualquer estado ativo', () => {
    for (const de of ['draft', 'pending_review', 'approved', 'released'] as const) {
      expect(transicaoStatusSchema.safeParse({ de, para: 'archived' }).success).toBe(true);
    }
  });

  it('rejeita salto direto de draft para released', () => {
    expect(transicaoStatusSchema.safeParse({ de: 'draft', para: 'released' }).success).toBe(false);
  });

  it('rejeita reabrir uma ficha já liberada (released -> draft)', () => {
    expect(transicaoStatusSchema.safeParse({ de: 'released', para: 'draft' }).success).toBe(false);
  });

  it('aceita desarquivar (archived -> draft)', () => {
    expect(transicaoStatusSchema.safeParse({ de: 'archived', para: 'draft' }).success).toBe(true);
  });

  it('rejeita qualquer saída de archived que não seja draft', () => {
    for (const para of ['pending_review', 'approved', 'released'] as const) {
      expect(transicaoStatusSchema.safeParse({ de: 'archived', para }).success).toBe(false);
    }
  });

  it('rejeita status fora do enum', () => {
    expect(transicaoStatusSchema.safeParse({ de: 'draft', para: 'publicado' }).success).toBe(false);
  });

  it('transicaoPermitida reflete a mesma tabela', () => {
    expect(transicaoPermitida('approved', 'released')).toBe(true);
    expect(transicaoPermitida('draft', 'released')).toBe(false);
  });
});

describe('transicaoPermitida — saída de archived (desarquivar)', () => {
  /** Todos os valores do enum `plan_status`. */
  const TODOS: PlanStatus[] = [
    'draft',
    'pending_review',
    'approved',
    'released',
    'archived',
  ];

  it('archived sai apenas para draft (cardinalidade 1)', () => {
    // Para todo x do enum: transicaoPermitida('archived', x) === (x === 'draft').
    for (const x of TODOS) {
      expect(transicaoPermitida('archived', x)).toBe(x === 'draft');
    }
  });

  it('derivação da UI: archived oferece "Desarquivar" para draft', () => {
    const transicoes = TRANSICOES_STATUS_INFO.archived;
    expect(transicoes).toHaveLength(1);
    expect(transicoes[0].para).toBe('draft');
    expect(transicoes[0].rotulo).toBe('Desarquivar');
    // Não é avanço do fluxo normal → botão secundário.
    expect(transicoes[0].principal).toBe(false);
  });
});
