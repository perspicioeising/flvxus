import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Teste HEADLESS de `criarAvaliacao` com Supabase e auth MOCKADOS. Foco da
 * adaptação do aluno autônomo (self_managed) — FEAT-002, Parte 3: a avaliação é
 * SEMPRE para si, então `student_id` gravado é o PRÓPRIO userId (ignora o
 * enviado no form). O caminho `professional` mantém o aluno escolhido.
 */

const { getSessionUserMock, isSelfManagedMock, insertMock } = vi.hoisted(() => ({
  getSessionUserMock: vi.fn(),
  isSelfManagedMock: vi.fn(),
  insertMock: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  getSessionUser: getSessionUserMock,
  isSelfManaged: isSelfManagedMock,
}));

vi.mock('@/lib/billing/guard', () => ({
  requireEntitlement: vi.fn(async () => ({ ok: true })),
}));

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

// Storage só é usado nas actions de foto — stub vazio aqui.
vi.mock('@/lib/storage', () => ({
  uploadAssessmentPhoto: vi.fn(),
  removeAssessmentPhoto: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    from() {
      return {
        insert(payload: unknown) {
          insertMock(payload);
          return {
            select: () => ({
              single: async () => ({ data: { id: 'aval-1' }, error: null }),
            }),
          };
        },
      };
    },
  })),
}));

import { criarAvaliacao } from '@/actions/avaliacoes';

const TENANT = 'tenant-1';
const SELF_ID = '00000000-0000-4000-8000-000000000099';
const ALUNO_ID = '11111111-1111-4111-8111-111111111111';

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

/** FormData mínima aceita por `criarAvaliacaoSchema` (protocolo manual). */
function formAvaliacao(studentId: string): FormData {
  const fd = new FormData();
  fd.append('student_id', studentId);
  fd.append('protocol', 'manual');
  fd.append('body_fat_pct', '18');
  fd.append('photos_consent', 'false');
  return fd;
}

beforeEach(() => {
  vi.clearAllMocks();
  getSessionUserMock.mockResolvedValue(PROFESSIONAL);
  isSelfManagedMock.mockImplementation(
    (u: { accountType?: string }) => u?.accountType === 'self_managed'
  );
});

describe('criarAvaliacao — aluno autônomo (self_managed)', () => {
  it('grava student_id = próprio userId (ignora o enviado)', async () => {
    getSessionUserMock.mockResolvedValueOnce(SELF_MANAGED);

    const r = await criarAvaliacao(undefined, formAvaliacao(ALUNO_ID));
    expect(r.ok).toBe(true);

    const linha = insertMock.mock.calls[0][0] as Record<string, unknown>;
    expect(linha.student_id).toBe(SELF_ID);
    expect(linha.student_id).not.toBe(ALUNO_ID);
    expect(linha.trainer_id).toBe(SELF_ID);
  });
});

describe('criarAvaliacao — professional (B2B)', () => {
  it('mantém o student_id do form', async () => {
    const r = await criarAvaliacao(undefined, formAvaliacao(ALUNO_ID));
    expect(r.ok).toBe(true);

    const linha = insertMock.mock.calls[0][0] as Record<string, unknown>;
    expect(linha.student_id).toBe(ALUNO_ID);
  });
});
