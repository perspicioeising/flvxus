import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Testes das actions de RETOMADA de sessão (`iniciarSessao` resolver-antes-de-
 * inserir + `carregarSessaoAberta`), com `getSessionUser` e o server client
 * mockados. Cobre os invariantes de FEAT-002:
 * - `iniciarSessao` com uma sessão ABERTA já existente retorna o id existente e
 *   NÃO chama `insert` (não duplica sessão ao voltar);
 * - `carregarSessaoAberta` retorna `data:null` sem aberta e `{ sessionId, logs }`
 *   quando há;
 * - sessão expirada e papel errado retornam `ok:false`.
 *
 * Sem Docker: a posse real (aluno dono OU trainer do tenant) é garantida em
 * produção pela RLS; aqui validamos a lógica de resolução/autorização.
 */

const getSessionUserMock = vi.fn();

// ---- Mock configurável do server client ----
// `aberta`: id da sessão aberta que `buscarSessaoAberta` deve resolver (ou null).
// `logs`: logs devolvidos por `select` em workout_set_logs.
// `insertResult`: resultado do insert de workout_sessions (sessão criada/erro).
// `planoStatus`: status da ficha retornada por workout_plans.
let aberta: { id: string } | null = null;
let logs: unknown[] = [];
let insertResult: { data: { id: string } | null; error: unknown } = {
  data: { id: 'nova-sess' },
  error: null,
};
let planoStatus = 'released';

const insertSpy = vi.fn();
const logsSelectSpy = vi.fn();

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
                    data: { id: 'plan-1', status: planoStatus },
                    error: null,
                  }),
              }),
              maybeSingle: () =>
                Promise.resolve({
                  data: { id: 'plan-1', status: planoStatus },
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

      if (tabela === 'workout_set_logs') {
        return {
          select: (cols: string) => {
            logsSelectSpy(cols);
            return {
              eq: () => Promise.resolve({ data: logs, error: null }),
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

import { carregarSessaoAberta, iniciarSessao } from '@/actions/execucao';

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
const ITEM = '22222222-2222-2222-2222-222222222222';

beforeEach(() => {
  vi.clearAllMocks();
  aberta = null;
  logs = [];
  insertResult = { data: { id: 'nova-sess' }, error: null };
  planoStatus = 'released';
  getSessionUserMock.mockResolvedValue(ALUNO);
});

describe('iniciarSessao — resolver-antes-de-inserir', () => {
  it('com sessão ABERTA existente retorna o id existente e NÃO chama insert', async () => {
    aberta = { id: 'sess-aberta' };

    const r = await iniciarSessao(PLAN, 'A');

    expect(r.ok).toBe(true);
    expect(r.id).toBe('sess-aberta');
    expect(insertSpy).not.toHaveBeenCalled();
  });

  it('sem sessão aberta cria uma nova (insert chamado)', async () => {
    aberta = null;

    const r = await iniciarSessao(PLAN, 'A');

    expect(r.ok).toBe(true);
    expect(r.id).toBe('nova-sess');
    expect(insertSpy).toHaveBeenCalledTimes(1);
  });

  it('colisão 23505 no insert re-resolve a aberta e retorna seu id', async () => {
    aberta = null;
    insertResult = { data: null, error: { code: '23505', message: 'dup' } };
    // Na re-resolução pós-23505, a aberta vencedora já existe.
    insertSpy.mockImplementation(() => {
      aberta = { id: 'sess-vencedora' };
    });

    const r = await iniciarSessao(PLAN, 'A');

    expect(r.ok).toBe(true);
    expect(r.id).toBe('sess-vencedora');
  });

  it('sessão expirada → ok:false', async () => {
    getSessionUserMock.mockResolvedValueOnce(null);
    const r = await iniciarSessao(PLAN, 'A');
    expect(r.ok).toBe(false);
    expect(insertSpy).not.toHaveBeenCalled();
  });
});

describe('carregarSessaoAberta', () => {
  it('retorna data:null quando não há sessão aberta', async () => {
    aberta = null;

    const r = await carregarSessaoAberta(PLAN, 'A');

    expect(r.ok).toBe(true);
    expect(r.data).toBeNull();
  });

  it('retorna { sessionId, logs } quando há aberta', async () => {
    aberta = { id: 'sess-aberta' };
    logs = [
      {
        set_number: 1,
        reps_done: 10,
        load_done: 20,
        completed: true,
        plan_item_id: ITEM,
      },
    ];

    const r = await carregarSessaoAberta(PLAN, 'A');

    expect(r.ok).toBe(true);
    expect(r.data).not.toBeNull();
    expect(r.data?.sessionId).toBe('sess-aberta');
    expect(r.data?.logs).toHaveLength(1);
    expect(r.data?.logs[0]).toMatchObject({ plan_item_id: ITEM, set_number: 1 });
  });

  it('sessão expirada → ok:false sem data', async () => {
    getSessionUserMock.mockResolvedValueOnce(null);
    const r = await carregarSessaoAberta(PLAN, 'A');
    expect(r.ok).toBe(false);
    expect(r.data).toBeUndefined();
  });

  it('aluno tentando carregar com target (papel errado) → ok:false', async () => {
    // Aluno (role student) passando target_student_id (fluxo de professor):
    // UUID válido para passar do schema e exercitar a GUARDA de papel.
    const r = await carregarSessaoAberta(
      PLAN,
      'A',
      '33333333-3333-3333-3333-333333333333'
    );
    expect(r.ok).toBe(false);
    expect(r.message).toContain('professor');
  });
});
