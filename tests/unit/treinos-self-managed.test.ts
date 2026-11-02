import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { FichaInput } from '@/schemas/treino';

/**
 * Testes HEADLESS de `criarFicha`/`editarFicha` com Supabase e auth MOCKADOS
 * (padrão de tests/unit/actions-alunos.test.ts). Foco da adaptação do aluno
 * autônomo (self_managed) — FEAT-002, Parte 3:
 *   - `criarFicha` grava `student_id` = PRÓPRIO userId (ignora o enviado) e
 *     nasce JÁ LIBERADA (`status: 'released'` + `released_at`);
 *   - `editarFicha` força `student_id` = próprio userId;
 *   - o caminho `professional` mantém o `student_id` do form e `status 'draft'`.
 */

const { getSessionUserMock, isSelfManagedMock, insertMock, updateMock } = vi.hoisted(
  () => ({
    getSessionUserMock: vi.fn(),
    isSelfManagedMock: vi.fn(),
    insertMock: vi.fn(),
    updateMock: vi.fn(),
  })
);

vi.mock('@/lib/auth', () => ({
  getSessionUser: getSessionUserMock,
  isSelfManaged: isSelfManagedMock,
}));

// `requireEntitlement` sempre libera nos testes (plano fora de escopo aqui).
vi.mock('@/lib/billing/guard', () => ({
  requireEntitlement: vi.fn(async () => ({ ok: true })),
}));

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

/**
 * Client Supabase mínimo: captura os payloads de `insert`/`update` por tabela.
 * - `workout_plans.insert(...).select('id').single()` devolve um id fixo;
 * - `workout_plan_items.insert(...)` devolve `{ error: null }`;
 * - `workout_plans.update(...).eq(...)` devolve `{ error: null }`.
 */
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    from(tabela: string) {
      return {
        insert(payload: unknown) {
          insertMock(tabela, payload);
          return {
            select: () => ({
              single: async () => ({ data: { id: 'plan-novo' }, error: null }),
            }),
            // workout_plan_items: insert sem select, resolvido direto.
            then: (resolve: (v: { error: null }) => void) => resolve({ error: null }),
          };
        },
        update(payload: unknown) {
          updateMock(tabela, payload);
          return {
            eq: async () => ({ error: null }),
          };
        },
        delete() {
          return {
            eq: async () => ({ error: null }),
          };
        },
      };
    },
  })),
}));

import { criarFicha, editarFicha } from '@/actions/treinos';

const TENANT = 'tenant-1';
const SELF_ID = '00000000-0000-4000-8000-000000000099';
const ALUNO_ID = '11111111-1111-4111-8111-111111111111';
const EXERCICIO_ID = '22222222-2222-4222-8222-222222222222';

const PROFESSIONAL = {
  userId: '00000000-0000-4000-8000-000000000001',
  role: 'trainer' as const,
  tenantId: TENANT,
  email: 'personal@ex.com',
  fullName: 'Personal',
  avatarUrl: null,
  isMaster: true,
  accountType: 'professional' as const,
};

const SELF_MANAGED = {
  ...PROFESSIONAL,
  userId: SELF_ID,
  accountType: 'self_managed' as const,
};

/** Entrada de ficha válida enviada pelo form (aluno "escolhido" = ALUNO_ID). */
function fichaInput(): FichaInput {
  return {
    student_id: ALUNO_ID,
    name: 'Treino A',
    itens: [{ exercise_id: EXERCICIO_ID, order_index: 0 }],
    rotation_steps: null,
  } as FichaInput;
}

/** Último payload capturado para uma dada tabela em `insert`/`update`. */
function ultimoPayload(mock: typeof insertMock, tabela: string): Record<string, unknown> {
  const calls = mock.mock.calls.filter((c) => c[0] === tabela);
  return calls[calls.length - 1][1] as Record<string, unknown>;
}

beforeEach(() => {
  vi.clearAllMocks();
  getSessionUserMock.mockResolvedValue(PROFESSIONAL);
  // isSelfManaged espelha o accountType do usuário mockado.
  isSelfManagedMock.mockImplementation(
    (u: { accountType?: string }) => u?.accountType === 'self_managed'
  );
});

describe('criarFicha — aluno autônomo (self_managed)', () => {
  it('grava student_id = próprio userId e nasce liberada (released + released_at)', async () => {
    getSessionUserMock.mockResolvedValueOnce(SELF_MANAGED);

    const r = await criarFicha(fichaInput());
    expect(r.ok).toBe(true);

    const plan = ultimoPayload(insertMock, 'workout_plans');
    expect(plan.student_id).toBe(SELF_ID);
    expect(plan.student_id).not.toBe(ALUNO_ID);
    expect(plan.status).toBe('released');
    expect(plan.released_at).toEqual(expect.any(String));
    expect(plan.trainer_id).toBe(SELF_ID);
  });
});

describe('criarFicha — professional (B2B)', () => {
  it('mantém o student_id do form e nasce em draft (sem released_at)', async () => {
    const r = await criarFicha(fichaInput());
    expect(r.ok).toBe(true);

    const plan = ultimoPayload(insertMock, 'workout_plans');
    expect(plan.student_id).toBe(ALUNO_ID);
    expect(plan.status).toBe('draft');
    expect(plan.released_at).toBeNull();
  });
});

describe('editarFicha — força student_id do autônomo', () => {
  it('self_managed: atualiza student_id para o próprio userId', async () => {
    getSessionUserMock.mockResolvedValueOnce(SELF_MANAGED);

    const r = await editarFicha('plan-existente', fichaInput());
    expect(r.ok).toBe(true);

    const plan = ultimoPayload(updateMock, 'workout_plans');
    expect(plan.student_id).toBe(SELF_ID);
    // editarFicha NÃO mexe em status/released_at.
    expect(plan.status).toBeUndefined();
    expect(plan.released_at).toBeUndefined();
  });

  it('professional: mantém o student_id do form', async () => {
    const r = await editarFicha('plan-existente', fichaInput());
    expect(r.ok).toBe(true);

    const plan = ultimoPayload(updateMock, 'workout_plans');
    expect(plan.student_id).toBe(ALUNO_ID);
  });
});
