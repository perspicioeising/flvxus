import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Testes HEADLESS de `actions/ia.ts` com Supabase e auth MOCKADOS. Foco da
 * fase Caminho A (aluno autônomo, self_managed):
 *   - `aprovarGeracao` de `generate_diet`  ⇒ `diets` nasce `released` + `released_at`
 *     para self_managed; `draft` + `released_at: null` para professional.
 *   - `aprovarGeracao` de `suggest_workout`⇒ `workout_plans` idem.
 *   - `sugerirTreino` force `student_id` = próprio userId para self_managed
 *     (mesmo com UUID divergente no input); professional preserva o do input.
 *
 * Espelha o esquema de mocks `vi.hoisted` de tests/unit/treinos-self-managed.test.ts.
 */

const {
  getSessionUserMock,
  isSelfManagedMock,
  insertMock,
  invokeMock,
  aiGenerationRef,
} = vi.hoisted(() => ({
  getSessionUserMock: vi.fn(),
  isSelfManagedMock: vi.fn(),
  insertMock: vi.fn(),
  invokeMock: vi.fn(),
  aiGenerationRef: { current: null as Record<string, unknown> | null },
}));

vi.mock('@/lib/auth', () => ({
  getSessionUser: getSessionUserMock,
  isSelfManaged: isSelfManagedMock,
}));

vi.mock('@/lib/billing/guard', () => ({
  requireEntitlement: vi.fn(async () => ({ ok: true })),
}));

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

/**
 * Client Supabase mínimo. Captura `insert` por tabela (via `insertMock`),
 * serve a linha de `ai_generations` (`aiGenerationRef.current`) e o catálogo de
 * `exercises`. Os inserts resolvem como `{ error: null }` e, quando encadeados
 * com `.select().single()`, devolvem um id fixo por tabela.
 */
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    functions: {
      invoke: invokeMock,
    },
    from(tabela: string) {
      return {
        select() {
          return {
            eq: () => ({
              maybeSingle: async () => ({ data: aiGenerationRef.current, error: null }),
              single: async () => ({ data: aiGenerationRef.current, error: null }),
            }),
            // exercises.select('id, name').in('name', [...])
            in: async () => ({ data: [], error: null }),
          };
        },
        insert(payload: unknown) {
          insertMock(tabela, payload);
          const idPorTabela: Record<string, string> = {
            diets: 'diet-nova',
            workout_plans: 'plan-novo',
          };
          const linhaCriada = { id: idPorTabela[tabela] ?? `${tabela}-id`, name: 'Agachamento' };
          return {
            // `.select(...).single()` (diets/workout_plans/diet_meals) e
            // `.select(...)` awaitable (exercises insert → `{ data, error }`).
            select: () => ({
              single: async () => ({ data: linhaCriada, error: null }),
              then: (resolve: (v: { data: unknown[]; error: null }) => void) =>
                resolve({ data: [linhaCriada], error: null }),
            }),
            then: (resolve: (v: { data: unknown[]; error: null }) => void) =>
              resolve({ data: [], error: null }),
          };
        },
        update() {
          return {
            eq: async () => ({ error: null }),
          };
        },
      };
    },
  })),
}));

import { aprovarGeracao, sugerirTreino } from '@/actions/ia';

const TENANT = 'tenant-1';
const SELF_ID = '00000000-0000-4000-8000-000000000099';
const OUTRO_ALUNO = '11111111-1111-4111-8111-111111111111';

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

/** Draft de dieta mínimo válido (generateDietOutputSchema). */
const DRAFT_DIETA = {
  meals: [
    {
      name: 'Café',
      time: '08:00',
      order_index: 0,
      foods: [
        {
          food_name: 'Ovo',
          quantity: 2,
          unit: 'un',
          kcal: 140,
          protein_g: 12,
          carbs_g: 1,
          fat_g: 10,
        },
      ],
    },
  ],
  totals: { target_kcal: 2000, protein_g: 150, carbs_g: 200, fat_g: 60 },
  shopping_list: ['Ovos'],
  disclaimer: 'Rascunho gerado por IA.',
};

/** Draft de treino mínimo válido (suggestWorkoutOutputSchema). */
const DRAFT_TREINO = {
  days: [
    {
      weekday: 1,
      exercises: [{ name: 'Agachamento', sets: 3, reps: '8-12', rest_seconds: 60 }],
    },
  ],
  disclaimer: 'Rascunho gerado por IA.',
};

/** Último payload capturado em `insert` para uma tabela. */
function ultimoInsert(tabela: string): Record<string, unknown> {
  const calls = insertMock.mock.calls.filter((c) => c[0] === tabela);
  return calls[calls.length - 1][1] as Record<string, unknown>;
}

beforeEach(() => {
  vi.clearAllMocks();
  aiGenerationRef.current = null;
  getSessionUserMock.mockResolvedValue(PROFESSIONAL);
  isSelfManagedMock.mockImplementation(
    (u: { accountType?: string }) => u?.accountType === 'self_managed'
  );
});

describe('aprovarGeracao — dieta por IA (materializarDieta)', () => {
  it('self_managed: diets nasce released + released_at', async () => {
    getSessionUserMock.mockResolvedValue(SELF_MANAGED);
    aiGenerationRef.current = {
      id: 'gen-1',
      tenant_id: TENANT,
      job_type: 'generate_diet',
      status: 'draft',
      input: { student_id: SELF_ID, goal: 'muscle_gain', restrictions: [] },
      output: DRAFT_DIETA,
      target_id: null,
    };

    const r = await aprovarGeracao('gen-1');
    expect(r.ok).toBe(true);

    const dieta = ultimoInsert('diets');
    expect(dieta.status).toBe('released');
    expect(dieta.released_at).toEqual(expect.any(String));
  });

  it('professional: diets nasce draft + released_at null', async () => {
    aiGenerationRef.current = {
      id: 'gen-2',
      tenant_id: TENANT,
      job_type: 'generate_diet',
      status: 'draft',
      input: { student_id: OUTRO_ALUNO, goal: 'muscle_gain', restrictions: [] },
      output: DRAFT_DIETA,
      target_id: null,
    };

    const r = await aprovarGeracao('gen-2');
    expect(r.ok).toBe(true);

    const dieta = ultimoInsert('diets');
    expect(dieta.status).toBe('draft');
    expect(dieta.released_at).toBeNull();
  });
});

describe('aprovarGeracao — treino por IA (materializarTreino)', () => {
  it('self_managed: workout_plans nasce released + released_at', async () => {
    getSessionUserMock.mockResolvedValue(SELF_MANAGED);
    aiGenerationRef.current = {
      id: 'gen-3',
      tenant_id: TENANT,
      job_type: 'suggest_workout',
      status: 'draft',
      input: { student_id: SELF_ID },
      output: DRAFT_TREINO,
      target_id: null,
    };

    const r = await aprovarGeracao('gen-3');
    expect(r.ok).toBe(true);

    const plano = ultimoInsert('workout_plans');
    expect(plano.status).toBe('released');
    expect(plano.released_at).toEqual(expect.any(String));
  });

  it('professional: workout_plans nasce draft + released_at null', async () => {
    aiGenerationRef.current = {
      id: 'gen-4',
      tenant_id: TENANT,
      job_type: 'suggest_workout',
      status: 'draft',
      input: { student_id: OUTRO_ALUNO },
      output: DRAFT_TREINO,
      target_id: null,
    };

    const r = await aprovarGeracao('gen-4');
    expect(r.ok).toBe(true);

    const plano = ultimoInsert('workout_plans');
    expect(plano.status).toBe('draft');
    expect(plano.released_at).toBeNull();
  });
});

describe('sugerirTreino — força student_id do autônomo (segurança)', () => {
  it('self_managed: envia student_id = próprio userId mesmo com UUID divergente no input', async () => {
    getSessionUserMock.mockResolvedValue(SELF_MANAGED);
    invokeMock.mockResolvedValue({
      data: { generation_id: 'gen-x', status: 'draft', draft: DRAFT_TREINO },
      error: null,
    });

    const r = await sugerirTreino({
      student_id: OUTRO_ALUNO,
      goal: 'hipertrofia',
      experience_level: 'beginner',
      days_per_week: 3,
    });
    expect(r.ok).toBe(true);

    const [nome, opcoes] = invokeMock.mock.calls[0];
    expect(nome).toBe('suggest-workout');
    const corpo = (opcoes as { body: { student_id: string } }).body;
    expect(corpo.student_id).toBe(SELF_ID);
  });

  it('professional: preserva o student_id do input', async () => {
    invokeMock.mockResolvedValue({
      data: { generation_id: 'gen-y', status: 'draft', draft: DRAFT_TREINO },
      error: null,
    });

    const r = await sugerirTreino({
      student_id: OUTRO_ALUNO,
      goal: 'hipertrofia',
      experience_level: 'beginner',
      days_per_week: 3,
    });
    expect(r.ok).toBe(true);

    const [, opcoes] = invokeMock.mock.calls[0];
    const corpo = (opcoes as { body: { student_id: string } }).body;
    expect(corpo.student_id).toBe(OUTRO_ALUNO);
  });
});
