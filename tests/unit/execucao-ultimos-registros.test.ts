import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Testes da action `carregarUltimosRegistros` (pré-preenchimento FEAT-001), com
 * `getSessionUser` e o server client mockados (molde de
 * `execucao-sessao-aberta.test.ts`). Cobre:
 * - sessão expirada → ok:false;
 * - aluno passando target (papel errado) → ok:false com 'professor';
 * - mapa planItemId -> {reps, load} casando por exercício (histórico herdado
 *   entre fichas);
 * - exercício sem histórico não aparece no mapa.
 *
 * Sem Docker: a posse (aluno dono OU trainer do tenant) é da RLS em produção;
 * aqui validamos a resolução/autorização e o mapeamento por exercício.
 */

const getSessionUserMock = vi.fn();

// Linhas devolvidas pelo `select` aninhado em workout_set_logs (já na ORDEM que
// o `.order('finished_at', desc)` produziria — o mais recente primeiro).
let registros: unknown[] = [];
let erro: unknown = null;

const selectSpy = vi.fn();

function makeSupabase() {
  return {
    from: (tabela: string) => {
      if (tabela === 'workout_set_logs') {
        // Cadeia: select().eq().not().eq().in().order()  → thenable {data,error}
        const terminal = {
          order: () => Promise.resolve({ data: registros, error: erro }),
        };
        return {
          select: (cols: string) => {
            selectSpy(cols);
            return {
              eq: () => ({
                not: () => ({
                  eq: () => ({
                    in: () => terminal,
                  }),
                }),
              }),
            };
          },
        };
      }
      throw new Error(`tabela inesperada: ${tabela}`);
    },
  };
}

vi.mock('@/lib/auth', () => ({
  getSessionUser: () => getSessionUserMock(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => makeSupabase()),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

import { carregarUltimosRegistros } from '@/actions/execucao';

const ALUNO = {
  userId: 'aluno-1',
  role: 'student' as const,
  tenantId: 'tenant-1',
  email: null,
  fullName: null,
  avatarUrl: null,
  isMaster: false,
};

const ITEM_A = { planItemId: 'item-a', exerciseId: 'ex-1' };
const ITEM_B = { planItemId: 'item-b', exerciseId: 'ex-2' };

beforeEach(() => {
  vi.clearAllMocks();
  registros = [];
  erro = null;
  getSessionUserMock.mockResolvedValue(ALUNO);
});

describe('carregarUltimosRegistros', () => {
  it('sessão expirada → ok:false sem data', async () => {
    getSessionUserMock.mockResolvedValueOnce(null);
    const r = await carregarUltimosRegistros([ITEM_A]);
    expect(r.ok).toBe(false);
    expect(r.data).toBeUndefined();
  });

  it('aluno passando target (papel errado) → ok:false com "professor"', async () => {
    const r = await carregarUltimosRegistros(
      [ITEM_A],
      '33333333-3333-3333-3333-333333333333'
    );
    expect(r.ok).toBe(false);
    expect(r.message).toContain('professor');
  });

  it('sem itens com exercício → data vazio sem consultar', async () => {
    const r = await carregarUltimosRegistros([]);
    expect(r.ok).toBe(true);
    expect(r.data).toEqual({});
    expect(selectSpy).not.toHaveBeenCalled();
  });

  it('retorna o mapa planItemId -> {reps, load} casando por exercício', async () => {
    registros = [
      {
        reps_done: 12,
        load_done: 40,
        plan_item: { exercise_id: 'ex-1' },
        workout_sessions: { finished_at: '2024-02-01T00:00:00Z' },
      },
      // Registro mais ANTIGO do mesmo exercício: deve ser ignorado (já vem
      // depois na ordem desc; o primeiro visto por exercício vence).
      {
        reps_done: 8,
        load_done: 30,
        plan_item: { exercise_id: 'ex-1' },
        workout_sessions: { finished_at: '2024-01-01T00:00:00Z' },
      },
    ];

    const r = await carregarUltimosRegistros([ITEM_A]);

    expect(r.ok).toBe(true);
    expect(r.data).toEqual({ 'item-a': { reps: 12, load: 40 } });
  });

  it('exercício sem histórico não aparece no mapa', async () => {
    // Só ex-1 tem registro; ITEM_B (ex-2) fica de fora.
    registros = [
      {
        reps_done: 10,
        load_done: 50,
        plan_item: { exercise_id: 'ex-1' },
        workout_sessions: { finished_at: '2024-02-01T00:00:00Z' },
      },
    ];

    const r = await carregarUltimosRegistros([ITEM_A, ITEM_B]);

    expect(r.ok).toBe(true);
    expect(r.data).toEqual({ 'item-a': { reps: 10, load: 50 } });
    expect(r.data?.['item-b']).toBeUndefined();
  });

  it('erro na consulta → ok:false com message', async () => {
    erro = { message: 'boom' };
    const r = await carregarUltimosRegistros([ITEM_A]);
    expect(r.ok).toBe(false);
    expect(r.message).toContain('boom');
  });
});
