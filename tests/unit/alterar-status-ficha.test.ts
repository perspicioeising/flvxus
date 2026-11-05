import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { PlanStatus } from '@/types/database.types';

/**
 * Testes HEADLESS de `alterarStatusFicha` com Supabase e auth MOCKADOS (padrão
 * de tests/unit/treinos-self-managed.test.ts). Foco da frente "desarquivar
 * ficha":
 *   - desarquivar (`archived → draft`) é permitido e o UPDATE zera
 *     `scheduled_release_at` (para o cron `liberar-treinos` não re-liberar a
 *     ficha ao aluno sozinho);
 *   - desarquivar NÃO leva a ficha a `released` — o destino é `draft`, fora do
 *     `status='released'` que a RLS exige para o aluno ver (invariante
 *     preservada por construção);
 *   - qualquer outra saída de `archived` continua rejeitada como transição
 *     inválida.
 */

const { getSessionUserMock, updateMock } = vi.hoisted(() => ({
  getSessionUserMock: vi.fn(),
  updateMock: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  getSessionUser: getSessionUserMock,
}));

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

/** Status atual que o SELECT da ficha devolve; ajustável por teste. */
let statusAtualMock: PlanStatus = 'archived';

/**
 * Client Supabase mínimo para `workout_plans`:
 *   - `select('id, status').eq('id', …).single()` → `{ status: statusAtualMock }`;
 *   - `update(payload).eq('id', …)` → captura o payload e resolve `{ error: null }`.
 */
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    from(_tabela: string) {
      return {
        select() {
          return {
            eq() {
              return {
                single: async () => ({
                  data: { id: 'plan-1', status: statusAtualMock },
                  error: null,
                }),
              };
            },
          };
        },
        update(payload: unknown) {
          updateMock(payload);
          return {
            eq: async () => ({ error: null }),
          };
        },
      };
    },
  })),
}));

import { alterarStatusFicha } from '@/actions/treinos';

const PROFESSOR = {
  userId: '00000000-0000-4000-8000-000000000001',
  role: 'trainer' as const,
  tenantId: 'tenant-1',
  email: 'personal@ex.com',
  fullName: 'Personal',
  avatarUrl: null,
  isMaster: true,
  accountType: 'professional' as const,
};

/** Último payload capturado no `update`. */
function ultimoUpdate(): Record<string, unknown> {
  const calls = updateMock.mock.calls;
  return calls[calls.length - 1][0] as Record<string, unknown>;
}

beforeEach(() => {
  vi.clearAllMocks();
  statusAtualMock = 'archived';
  getSessionUserMock.mockResolvedValue(PROFESSOR);
});

describe('alterarStatusFicha — desarquivar (archived → draft)', () => {
  it('permite a transição e retorna ok', async () => {
    const r = await alterarStatusFicha('plan-1', 'draft');
    expect(r.ok).toBe(true);
    expect(r.id).toBe('plan-1');
  });

  it('grava status=draft e zera scheduled_release_at (não reabre via cron)', async () => {
    await alterarStatusFicha('plan-1', 'draft');

    const patch = ultimoUpdate();
    expect(patch.status).toBe('draft');
    expect(patch.scheduled_release_at).toBeNull();
  });

  it('NÃO leva a ficha a released ao desarquivar (invariante do aluno)', async () => {
    await alterarStatusFicha('plan-1', 'draft');

    const patch = ultimoUpdate();
    // Destino é draft; released_at não é carimbado (fora de status=released da RLS).
    expect(patch.status).not.toBe('released');
    expect(patch.released_at).toBeUndefined();
  });

  it('rejeita desarquivar direto para released (transição inválida)', async () => {
    const r = await alterarStatusFicha('plan-1', 'released');
    expect(r.ok).toBe(false);
    expect(r.message).toBe('Transição de status inválida.');
    expect(updateMock).not.toHaveBeenCalled();
  });

  it('rejeita qualquer outra saída de archived (ex.: approved)', async () => {
    const r = await alterarStatusFicha('plan-1', 'approved');
    expect(r.ok).toBe(false);
    expect(r.message).toBe('Transição de status inválida.');
    expect(updateMock).not.toHaveBeenCalled();
  });
});

describe('alterarStatusFicha — não-archived não zera agendamento', () => {
  it('liberar (approved → released) não inclui scheduled_release_at', async () => {
    statusAtualMock = 'approved';

    const r = await alterarStatusFicha('plan-1', 'released');
    expect(r.ok).toBe(true);

    const patch = ultimoUpdate();
    expect(patch.status).toBe('released');
    expect(patch.released_at).toEqual(expect.any(String));
    // Só o desarquivar zera o agendamento; aqui não deve tocar.
    expect('scheduled_release_at' in patch).toBe(false);
  });
});
