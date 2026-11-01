import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Testes da action `confirmarDescanso` (FEAT-003), com `getSessionUser` e o
 * server client mockados. Cobre:
 * - grava o descanso quando `restStepIndex` É o próximo passo resolvido;
 * - IDEMPOTÊNCIA: não grava (retorna ok) quando o passo pedido não é o próximo;
 * - `restStepIndex` fora da faixa / não-descanso → ok:false;
 * - ficha sem rotation_steps → ok:false;
 * - sessão expirada / papel errado → ok:false.
 *
 * Sem Docker: a posse real é da RLS; aqui validamos a lógica de resolução.
 */

const getSessionUserMock = vi.fn();

// Estado configurável do mock do banco.
let planoRow: {
  id: string;
  status: string;
  rotation_steps: unknown;
  workout_plan_items: unknown[];
} | null;
let ultimaSessao: { division: string | null; finished_at: string } | null;
let ultimoDescanso: { rest_step_index: number; completed_at: string } | null;
let insertError: unknown = null;

const insertSpy = vi.fn();

/** Terminal de leitura "order().[order()].limit().maybeSingle()". */
function leituraTerminal(data: unknown) {
  const terminal = {
    limit: () => ({ maybeSingle: () => Promise.resolve({ data, error: null }) }),
    order: () => terminal,
    maybeSingle: () => Promise.resolve({ data, error: null }),
  };
  return terminal;
}

function makeSupabase() {
  return {
    from: (tabela: string) => {
      if (tabela === 'workout_plans') {
        // select().eq('id').maybeSingle()  (aluno)
        // select().eq('id').eq('student_id').maybeSingle()  (professor)
        const afterId = {
          eq: () => ({
            maybeSingle: () => Promise.resolve({ data: planoRow, error: null }),
          }),
          maybeSingle: () => Promise.resolve({ data: planoRow, error: null }),
        };
        return { select: () => ({ eq: () => afterId }) };
      }

      if (tabela === 'workout_sessions') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                not: () => leituraTerminal(ultimaSessao),
              }),
            }),
          }),
        };
      }

      if (tabela === 'workout_plan_rest_completions') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => leituraTerminal(ultimoDescanso),
            }),
          }),
          insert: (linha: unknown) => {
            insertSpy(linha);
            return Promise.resolve({ error: insertError });
          },
        };
      }

      throw new Error(`tabela inesperada: ${tabela}`);
    },
  };
}

vi.mock('@/lib/auth', () => ({ getSessionUser: () => getSessionUserMock() }));
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => makeSupabase()),
}));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

import { confirmarDescanso } from '@/actions/execucao';

const ALUNO = {
  userId: 'aluno-1',
  role: 'student' as const,
  tenantId: 'tenant-1',
  email: null,
  fullName: null,
  avatarUrl: null,
  isMaster: false,
};

const PLAN = '11111111-1111-1111-1111-111111111111';

/** rotation_steps A, B, descanso(2), C — e itens A/B/C. */
const ROTATION = [
  { type: 'division', label: 'A' },
  { type: 'division', label: 'B' },
  { type: 'rest' },
  { type: 'division', label: 'C' },
];
const ITENS = [
  { id: 'a', weekday: null, division: 'A', order_index: 0, sets: 3, reps: '10', exercises: { name: 'A', muscle_groups: [] } },
  { id: 'b', weekday: null, division: 'B', order_index: 1, sets: 3, reps: '10', exercises: { name: 'B', muscle_groups: [] } },
  { id: 'c', weekday: null, division: 'C', order_index: 2, sets: 3, reps: '10', exercises: { name: 'C', muscle_groups: [] } },
];

beforeEach(() => {
  vi.clearAllMocks();
  planoRow = {
    id: 'plan-1',
    status: 'released',
    rotation_steps: ROTATION,
    workout_plan_items: ITENS,
  };
  ultimaSessao = null;
  ultimoDescanso = null;
  insertError = null;
  getSessionUserMock.mockResolvedValue(ALUNO);
});

describe('confirmarDescanso', () => {
  it('grava quando restStepIndex é o próximo passo (após concluir B)', async () => {
    // Última divisão concluída = B → próximo passo é o descanso (índice 2).
    ultimaSessao = { division: 'B', finished_at: '2024-01-01T10:00:00Z' };

    const r = await confirmarDescanso(PLAN, 2);

    expect(r.ok).toBe(true);
    expect(insertSpy).toHaveBeenCalledTimes(1);
    expect(insertSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        plan_id: PLAN,
        student_id: 'aluno-1',
        rest_step_index: 2,
      })
    );
  });

  it('idempotente: NÃO grava quando o descanso não é o próximo passo agora', async () => {
    // Sem histórico → próximo passo é a divisão A (índice 0), não o descanso.
    ultimaSessao = null;

    const r = await confirmarDescanso(PLAN, 2);

    expect(r.ok).toBe(true);
    expect(insertSpy).not.toHaveBeenCalled();
  });

  it('idempotente: toque repetido após já ter cumprido o descanso NÃO grava de novo', async () => {
    // Descanso já cumprido (índice 2) → próximo passo é a divisão C.
    ultimoDescanso = { rest_step_index: 2, completed_at: '2024-01-02T10:00:00Z' };

    const r = await confirmarDescanso(PLAN, 2);

    expect(r.ok).toBe(true);
    expect(insertSpy).not.toHaveBeenCalled();
  });

  it('restStepIndex fora da faixa → ok:false', async () => {
    const r = await confirmarDescanso(PLAN, 99);
    expect(r.ok).toBe(false);
    expect(insertSpy).not.toHaveBeenCalled();
  });

  it('restStepIndex aponta para uma divisão (não descanso) → ok:false', async () => {
    const r = await confirmarDescanso(PLAN, 0); // índice 0 é a divisão A
    expect(r.ok).toBe(false);
    expect(insertSpy).not.toHaveBeenCalled();
  });

  it('ficha sem rotation_steps → ok:false', async () => {
    planoRow = { ...planoRow!, rotation_steps: null };
    const r = await confirmarDescanso(PLAN, 2);
    expect(r.ok).toBe(false);
    expect(insertSpy).not.toHaveBeenCalled();
  });

  it('ficha não liberada → ok:false', async () => {
    planoRow = { ...planoRow!, status: 'draft' };
    const r = await confirmarDescanso(PLAN, 2);
    expect(r.ok).toBe(false);
  });

  it('sessão expirada → ok:false', async () => {
    getSessionUserMock.mockResolvedValueOnce(null);
    const r = await confirmarDescanso(PLAN, 2);
    expect(r.ok).toBe(false);
    expect(insertSpy).not.toHaveBeenCalled();
  });

  it('aluno passando targetStudentId (papel errado) → ok:false', async () => {
    const r = await confirmarDescanso(
      PLAN,
      2,
      '33333333-3333-3333-3333-333333333333'
    );
    expect(r.ok).toBe(false);
    expect(insertSpy).not.toHaveBeenCalled();
  });
});
