import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Testes do gate de papel de `iniciarSessao` para o ALUNO AUTÔNOMO (FEAT-003):
 * um usuário `role='trainer'` + `accountType='self_managed'`, SEM
 * `target_student_id`, treina a PRÓPRIA ficha 'released' pelas rotas /aluno.
 *
 * Cobre os invariantes:
 * - trainer self_managed sem target → ok, grava `student_id = userId`;
 * - trainer professional sem target → recusado (continua sendo fluxo presencial,
 *   que exige `target_student_id`);
 * - student sem target → continua funcionando.
 *
 * Mesmo molde de `execucao-sessao-aberta.test.ts`: `getSessionUser` e o server
 * client mockados. A posse real (aluno dono OU trainer do tenant) é garantida
 * em produção pela RLS; aqui validamos a lógica de autorização de papel.
 */

const getSessionUserMock = vi.fn();

// `aberta`: id da sessão aberta resolvida por `buscarSessaoAberta` (ou null).
// `insertResult`: resultado do insert de workout_sessions (sessão criada/erro).
let aberta: { id: string } | null = null;
let insertResult: { data: { id: string } | null; error: unknown } = {
  data: { id: 'nova-sess' },
  error: null,
};

const insertSpy = vi.fn();

function makeSupabase() {
  return {
    from: (tabela: string) => {
      if (tabela === 'workout_plans') {
        return {
          select: () => ({
            eq: () => ({
              // fluxo professor encadeia um segundo .eq('student_id', ...)
              eq: () => ({
                maybeSingle: () =>
                  Promise.resolve({
                    data: { id: 'plan-1', status: 'released' },
                    error: null,
                  }),
              }),
              maybeSingle: () =>
                Promise.resolve({
                  data: { id: 'plan-1', status: 'released' },
                  error: null,
                }),
            }),
          }),
        };
      }

      if (tabela === 'workout_sessions') {
        return {
          // Cadeia de leitura de buscarSessaoAberta:
          // select().eq().eq().is().eq|is().order().limit().maybeSingle()
          select: () => {
            const terminal = {
              order: () => ({
                limit: () => ({
                  maybeSingle: () => Promise.resolve({ data: aberta, error: null }),
                }),
              }),
            };
            const comDivision = {
              eq: () => terminal, // .eq('division', x)
              is: () => terminal, // .is('division', null)
            };
            return {
              eq: () => ({
                eq: () => ({
                  is: () => comDivision, // .is('finished_at', null)
                }),
              }),
            };
          },
          insert: (linha: unknown) => {
            insertSpy(linha);
            return {
              select: () => ({
                single: () => Promise.resolve(insertResult),
              }),
            };
          },
        };
      }

      throw new Error(`tabela inesperada: ${tabela}`);
    },
  };
}

vi.mock('@/lib/auth', async () => {
  const atual = await vi.importActual<typeof import('@/lib/auth')>('@/lib/auth');
  return {
    ...atual,
    getSessionUser: () => getSessionUserMock(),
  };
});

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => makeSupabase()),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

import { iniciarSessao } from '@/actions/execucao';

const PLAN = '11111111-1111-1111-1111-111111111111';

const AUTONOMO = {
  userId: 'autonomo-1',
  role: 'trainer' as const,
  tenantId: 'tenant-1',
  email: null,
  fullName: null,
  avatarUrl: null,
  isMaster: true,
  accountType: 'self_managed' as const,
};

const PROFISSIONAL = {
  userId: 'prof-1',
  role: 'trainer' as const,
  tenantId: 'tenant-1',
  email: null,
  fullName: null,
  avatarUrl: null,
  isMaster: true,
  accountType: 'professional' as const,
};

const ALUNO = {
  userId: 'aluno-1',
  role: 'student' as const,
  tenantId: 'tenant-1',
  email: null,
  fullName: null,
  avatarUrl: null,
  isMaster: false,
  accountType: 'professional' as const,
};

beforeEach(() => {
  vi.clearAllMocks();
  aberta = null;
  insertResult = { data: { id: 'nova-sess' }, error: null };
});

describe('iniciarSessao — aluno autônomo (trainer self_managed)', () => {
  it('trainer self_managed SEM target inicia a própria ficha e grava student_id = userId', async () => {
    getSessionUserMock.mockResolvedValue(AUTONOMO);

    const r = await iniciarSessao(PLAN, 'A');

    expect(r.ok).toBe(true);
    expect(r.id).toBe('nova-sess');
    expect(insertSpy).toHaveBeenCalledTimes(1);
    expect(insertSpy).toHaveBeenCalledWith(
      expect.objectContaining({ student_id: AUTONOMO.userId })
    );
  });

  it('trainer professional SEM target continua recusado', async () => {
    getSessionUserMock.mockResolvedValue(PROFISSIONAL);

    const r = await iniciarSessao(PLAN, 'A');

    expect(r.ok).toBe(false);
    expect(r.message).toContain('aluno');
    expect(insertSpy).not.toHaveBeenCalled();
  });

  it('student SEM target continua funcionando', async () => {
    getSessionUserMock.mockResolvedValue(ALUNO);

    const r = await iniciarSessao(PLAN, 'A');

    expect(r.ok).toBe(true);
    expect(r.id).toBe('nova-sess');
    expect(insertSpy).toHaveBeenCalledWith(
      expect.objectContaining({ student_id: ALUNO.userId })
    );
  });
});
