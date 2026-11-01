import { describe, expect, it } from 'vitest';

import {
  proximaDivisaoNaRotacao,
  proximoPassoNaRotacao,
  proximoTreinoDaFicha,
  type FichaInicio,
  type PassoRotacao,
} from '@/lib/treino/inicio';

/** Item de ficha mínimo para a derivação. */
function item(
  id: string,
  opts: {
    division?: string | null;
    weekday?: number | null;
    order_index?: number;
    grupos?: string[];
  } = {}
): NonNullable<FichaInicio['workout_plan_items']>[number] {
  return {
    id,
    division: opts.division ?? null,
    weekday: opts.weekday ?? null,
    order_index: opts.order_index ?? 0,
    sets: 3,
    reps: '10',
    exercises: { name: `Ex ${id}`, muscle_groups: opts.grupos ?? [] },
  };
}

// Quarta-feira (weekday 3) como referência determinística.
const QUARTA = new Date('2024-01-03T12:00:00Z');

/** Ficha A/B/C fora de ordem (valida que a ordenação pt-BR é aplicada). */
function fichaABC(): FichaInicio {
  return {
    id: 'f1',
    name: 'ABC',
    workout_plan_items: [
      item('b', { division: 'B', grupos: ['Costas'] }),
      item('a', { division: 'A', grupos: ['Peito'] }),
      item('c', { division: 'C', grupos: ['Perna'] }),
    ],
  };
}

describe('proximaDivisaoNaRotacao — lógica pura de rotação', () => {
  it('lista vazia → null', () => {
    expect(proximaDivisaoNaRotacao([], null)).toBeNull();
  });

  it('sem histórico → primeira divisão', () => {
    expect(proximaDivisaoNaRotacao(['A', 'B', 'C'], null)).toBe('A');
  });

  it('após A → B; após B → C', () => {
    expect(proximaDivisaoNaRotacao(['A', 'B', 'C'], 'A')).toBe('B');
    expect(proximaDivisaoNaRotacao(['A', 'B', 'C'], 'B')).toBe('C');
  });

  it('após a última (C) → wrap para a primeira (A)', () => {
    expect(proximaDivisaoNaRotacao(['A', 'B', 'C'], 'C')).toBe('A');
  });

  it('divisão única → sempre ela mesma', () => {
    expect(proximaDivisaoNaRotacao(['A'], null)).toBe('A');
    expect(proximaDivisaoNaRotacao(['A'], 'A')).toBe('A');
  });

  it('última divisão inexistente na ficha → fallback na primeira', () => {
    expect(proximaDivisaoNaRotacao(['A', 'B'], 'Z')).toBe('A');
  });

  it('não assume alfabeto fixo: segue a ordem real dos rótulos', () => {
    // Rótulos arbitrários; rotação segue o índice, não o alfabeto A/B/C.
    expect(proximaDivisaoNaRotacao(['Push', 'Pull', 'Legs'], 'Pull')).toBe(
      'Legs'
    );
    expect(proximaDivisaoNaRotacao(['Push', 'Pull', 'Legs'], 'Legs')).toBe(
      'Push'
    );
  });
});

describe('proximoTreinoDaFicha — ficha por divisão (rotação)', () => {
  it('sem histórico → primeira divisão (A) e monta ?divisao=A', () => {
    const r = proximoTreinoDaFicha(fichaABC(), QUARTA);
    expect(r).not.toBeNull();
    expect(r!.divisionLabel).toBe('A');
    expect(r!.href).toBe('/aluno/execucao/f1?divisao=A');
    expect(r!.grupos).toEqual(['Peito']);
  });

  it('após concluir A → próximo é B', () => {
    const r = proximoTreinoDaFicha(fichaABC(), QUARTA, 'A');
    expect(r!.divisionLabel).toBe('B');
    expect(r!.href).toBe('/aluno/execucao/f1?divisao=B');
    expect(r!.grupos).toEqual(['Costas']);
  });

  it('após concluir C (última) → wrap de volta para A', () => {
    const r = proximoTreinoDaFicha(fichaABC(), QUARTA, 'C');
    expect(r!.divisionLabel).toBe('A');
    expect(r!.href).toBe('/aluno/execucao/f1?divisao=A');
  });

  it('ficha com uma única divisão → sempre ela mesma', () => {
    const ficha: FichaInicio = {
      id: 'f1',
      name: 'Só A',
      workout_plan_items: [item('a', { division: 'A', grupos: ['Peito'] })],
    };
    // Sem histórico e após concluir A, o próximo continua sendo A.
    expect(proximoTreinoDaFicha(ficha, QUARTA)!.divisionLabel).toBe('A');
    expect(proximoTreinoDaFicha(ficha, QUARTA, 'A')!.divisionLabel).toBe('A');
  });

  it('última divisão não existe mais na ficha (reeditada) → fallback em A', () => {
    // A última concluída foi 'D', mas a ficha agora só tem A/B/C.
    const r = proximoTreinoDaFicha(fichaABC(), QUARTA, 'D');
    expect(r!.divisionLabel).toBe('A');
    expect(r!.href).toBe('/aluno/execucao/f1?divisao=A');
  });

  it('nunca retorna null para ficha por divisão (sempre há um próximo treino)', () => {
    const ficha: FichaInicio = {
      id: 'f1',
      name: 'Só A',
      workout_plan_items: [item('a', { division: 'A', grupos: ['Peito'] })],
    };
    expect(proximoTreinoDaFicha(ficha, QUARTA)).not.toBeNull();
  });
});

describe('proximoTreinoDaFicha — ficha legada por dia', () => {
  it('escolhe os itens do dia de hoje e monta ?dia=N', () => {
    const ficha: FichaInicio = {
      id: 'f2',
      name: 'Legada',
      workout_plan_items: [
        item('a', { weekday: 3, grupos: ['Peito'], order_index: 1 }),
        item('b', { weekday: 3, grupos: ['Tríceps'], order_index: 0 }),
        item('c', { weekday: 1, grupos: ['Costas'] }),
      ],
    };
    const r = proximoTreinoDaFicha(ficha, QUARTA);
    expect(r).not.toBeNull();
    expect(r!.href).toBe('/aluno/execucao/f2?dia=3');
    // Ordenado por order_index: b (0) antes de a (1).
    expect(r!.exercicios.map((e) => e.id)).toEqual(['b', 'a']);
  });

  it('retorna null quando a ficha legada NÃO tem treino para hoje (MEDIUM #2)', () => {
    const ficha: FichaInicio = {
      id: 'f2',
      name: 'Legada sem treino hoje',
      workout_plan_items: [
        item('a', { weekday: 1, grupos: ['Peito'] }),
        item('b', { weekday: 5, grupos: ['Costas'] }),
      ],
    };
    // Hoje é quarta (3); não há itens nesse dia → null (UI mostra o cartão).
    expect(proximoTreinoDaFicha(ficha, QUARTA)).toBeNull();
  });

  it('ignora o histórico de rotação: segue sempre pelo dia (sem regressão)', () => {
    const ficha: FichaInicio = {
      id: 'f2',
      name: 'Legada',
      workout_plan_items: [
        item('a', { weekday: 3, grupos: ['Peito'], order_index: 1 }),
        item('b', { weekday: 3, grupos: ['Tríceps'], order_index: 0 }),
        item('c', { weekday: 1, grupos: ['Costas'] }),
      ],
    };
    // Mesmo passando uma "última divisão concluída", o ramo por dia a ignora:
    // o resultado é idêntico ao do caso sem histórico (itens do weekday atual).
    const comHistorico = proximoTreinoDaFicha(ficha, QUARTA, 'A');
    expect(comHistorico).not.toBeNull();
    expect(comHistorico!.href).toBe('/aluno/execucao/f2?dia=3');
    expect(comHistorico!.exercicios.map((e) => e.id)).toEqual(['b', 'a']);
  });
});

// =============================================================================
// FEAT-003 — rotação EXPLÍCITA com dias de descanso
// =============================================================================

describe('proximoPassoNaRotacao — lógica pura de passos (divisão/descanso)', () => {
  const passos: PassoRotacao[] = [
    { type: 'division', label: 'A' },
    { type: 'division', label: 'B' },
    { type: 'rest' },
    { type: 'division', label: 'C' },
  ];

  it('lista vazia → null', () => {
    expect(proximoPassoNaRotacao([], null)).toBeNull();
  });

  it('sem último passo → primeiro passo (índice 0)', () => {
    expect(proximoPassoNaRotacao(passos, null)).toEqual({
      step: { type: 'division', label: 'A' },
      index: 0,
    });
  });

  it('após A (0) → B (1); após B (1) → descanso (2); após descanso (2) → C (3)', () => {
    expect(proximoPassoNaRotacao(passos, 0)).toEqual({
      step: { type: 'division', label: 'B' },
      index: 1,
    });
    expect(proximoPassoNaRotacao(passos, 1)).toEqual({
      step: { type: 'rest' },
      index: 2,
    });
    expect(proximoPassoNaRotacao(passos, 2)).toEqual({
      step: { type: 'division', label: 'C' },
      index: 3,
    });
  });

  it('após o último passo (3) → wrap para o primeiro (0)', () => {
    expect(proximoPassoNaRotacao(passos, 3)).toEqual({
      step: { type: 'division', label: 'A' },
      index: 0,
    });
  });

  it('índice fora de faixa → fallback no primeiro passo', () => {
    expect(proximoPassoNaRotacao(passos, 99)).toEqual({
      step: { type: 'division', label: 'A' },
      index: 0,
    });
    expect(proximoPassoNaRotacao(passos, -1)).toEqual({
      step: { type: 'division', label: 'A' },
      index: 0,
    });
  });
});

describe('proximoTreinoDaFicha — ficha com rotation_steps (descanso)', () => {
  /** Ficha A/B/C com descanso entre B e C: A, B, descanso, C. */
  function fichaComDescanso(): FichaInicio {
    return {
      id: 'f3',
      name: 'ABC + descanso',
      rotation_steps: [
        { type: 'division', label: 'A' },
        { type: 'division', label: 'B' },
        { type: 'rest' },
        { type: 'division', label: 'C' },
      ],
      workout_plan_items: [
        item('b', { division: 'B', grupos: ['Costas'] }),
        item('a', { division: 'A', grupos: ['Peito'] }),
        item('c', { division: 'C', grupos: ['Perna'] }),
      ],
    };
  }

  it('sem histórico → primeira divisão (A), não é descanso', () => {
    const r = proximoTreinoDaFicha(fichaComDescanso(), QUARTA);
    expect(r).not.toBeNull();
    expect(r!.descanso).toBe(false);
    expect(r!.divisionLabel).toBe('A');
    expect(r!.href).toBe('/aluno/execucao/f3?divisao=A');
  });

  it('após concluir B → o próximo passo é DESCANSO', () => {
    const r = proximoTreinoDaFicha(fichaComDescanso(), QUARTA, undefined, {
      ultimaDivisao: { label: 'B', finishedAt: '2024-01-01T10:00:00Z' },
    });
    expect(r!.descanso).toBe(true);
    expect(r!.restStepIndex).toBe(2);
    expect(r!.divisionLabel).toBeNull();
    expect(r!.exercicios).toHaveLength(0);
  });

  it('último evento = descanso cumprido → o próximo é a divisão C', () => {
    const r = proximoTreinoDaFicha(fichaComDescanso(), QUARTA, undefined, {
      ultimoDescanso: { restStepIndex: 2, completedAt: '2024-01-02T10:00:00Z' },
    });
    expect(r!.descanso).toBe(false);
    expect(r!.divisionLabel).toBe('C');
    expect(r!.href).toBe('/aluno/execucao/f3?divisao=C');
  });

  it('desempate por timestamp: descanso mais recente que a divisão → avança para C', () => {
    const r = proximoTreinoDaFicha(fichaComDescanso(), QUARTA, undefined, {
      // Divisão B concluída ANTES; descanso cumprido DEPOIS → vence o descanso.
      ultimaDivisao: { label: 'B', finishedAt: '2024-01-01T10:00:00Z' },
      ultimoDescanso: { restStepIndex: 2, completedAt: '2024-01-02T10:00:00Z' },
    });
    expect(r!.descanso).toBe(false);
    expect(r!.divisionLabel).toBe('C');
  });

  it('desempate por timestamp: divisão mais recente que o descanso → próximo é descanso', () => {
    const r = proximoTreinoDaFicha(fichaComDescanso(), QUARTA, undefined, {
      // Descanso cumprido ANTES; divisão B concluída DEPOIS → vence a divisão B,
      // cujo passo seguinte é o descanso (índice 2).
      ultimaDivisao: { label: 'B', finishedAt: '2024-01-03T10:00:00Z' },
      ultimoDescanso: { restStepIndex: 2, completedAt: '2024-01-02T10:00:00Z' },
    });
    expect(r!.descanso).toBe(true);
    expect(r!.restStepIndex).toBe(2);
  });

  it('retrocompatibilidade: rotation_steps null NÃO entra no ramo de descanso', () => {
    const ficha: FichaInicio = { ...fichaComDescanso(), rotation_steps: null };
    // Mesmo com a última divisão sendo B, sem rotation_steps a rotação derivada
    // segue (B → C) e NUNCA retorna descanso.
    const r = proximoTreinoDaFicha(ficha, QUARTA, 'B');
    expect(r!.descanso).toBe(false);
    expect(r!.divisionLabel).toBe('C');
  });
});
