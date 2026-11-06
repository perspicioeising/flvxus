import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Comportamento do gate de somente leitura nas Server Actions: com o guard
 * devolvendo `{ ok:false }` a ação responde com a mensagem pt-BR do guard e NÃO
 * escreve (nenhum insert/update/delete/upsert/rpc/storage); com direito, o fluxo
 * segue (smoke). Supabase e guard MOCKADOS.
 */
const MSG = 'Seu teste grátis terminou. Assine em Plano.';

const { guardMock, getSessionUserMock, escritas } = vi.hoisted(() => ({
  guardMock: vi.fn(),
  getSessionUserMock: vi.fn(),
  escritas: [] as string[],
}));

// O guard é mockado globalmente em vitest.setup.ts; aqui sobrescrevemos.
vi.mock('@/lib/billing/guard', () => ({ requireEntitlement: guardMock }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn() }));
vi.mock('@/lib/auth', () => ({
  getSessionUser: getSessionUserMock,
  assertMaster: vi.fn(async () => getSessionUserMock()),
  isSelfManaged: () => false,
}));

const GEN = {
  id: 'g1',
  tenant_id: 't1',
  job_type: 'suggest_workout',
  status: 'pending_review',
  input: { student_id: 's1' },
  output: {},
  target_id: null,
};

function builder(): unknown {
  const handler: ProxyHandler<object> = {
    get(_t, prop: string) {
      if (prop === 'then') {
        return (resolve: (v: unknown) => void) => resolve({ data: null, error: null });
      }
      if (['insert', 'update', 'delete', 'upsert', 'rpc'].includes(prop)) {
        return (..._a: unknown[]) => {
          escritas.push(prop);
          return proxy;
        };
      }
      if (prop === 'maybeSingle' || prop === 'single') {
        return async () => ({ data: GEN, error: null });
      }
      return (..._a: unknown[]) => proxy;
    },
  };
  const proxy: unknown = new Proxy({}, handler);
  return proxy;
}

vi.mock('@/lib/supabase/server', () => ({
  // Cliente simples (não thenable): `from()` devolve o builder que registra escritas.
  createClient: vi.fn(async () => ({
    from: () => builder(),
    rpc: () => {
      escritas.push('rpc');
      return builder();
    },
    get storage() {
      escritas.push('storage');
      return {};
    },
    get functions() {
      escritas.push('functions');
      return {};
    },
  })),
}));
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => {
    escritas.push('admin');
    return {};
  }),
}));

import { aprovarGeracao } from '@/actions/ia';
import { registrarSerie, iniciarSessao, finalizarSessao } from '@/actions/execucao';
import { alterarStatusDieta } from '@/actions/dietas';
import { registrarAgua, fazerCheckin } from '@/actions/habitos';
import { editarFicha, excluirFicha, alterarStatusFicha } from '@/actions/treinos';
import { criarExercicio, excluirExercicio } from '@/actions/exercicios';
import { convidarAluno, editarAluno } from '@/actions/alunos';
import { criarDuelo } from '@/actions/arena-social';

const PROF = {
  userId: 'u1',
  role: 'trainer',
  tenantId: 't1',
  email: 'p@x.com',
  fullName: 'P',
  avatarUrl: null,
  isMaster: true,
  accountType: 'professional',
};
const UUID = '11111111-1111-4111-8111-111111111111';

const casos: Array<[string, () => Promise<{ ok: boolean; message?: string }>]> = [
  ['aprovarGeracao (suggest_workout, feature null)', () => aprovarGeracao('g1')],
  ['registrarSerie', () => registrarSerie({ session_id: UUID } as never)],
  ['iniciarSessao', () => iniciarSessao(UUID)],
  ['finalizarSessao', () => finalizarSessao({ session_id: UUID } as never)],
  ['alterarStatusDieta', () => alterarStatusDieta(UUID, 'released')],
  ['registrarAgua', () => registrarAgua(250)],
  ['fazerCheckin', () => fazerCheckin()],
  ['editarFicha', () => editarFicha(UUID, {} as never)],
  ['excluirFicha', () => excluirFicha(UUID)],
  ['alterarStatusFicha', () => alterarStatusFicha(UUID, 'released')],
  ['criarExercicio', () => criarExercicio(undefined, new FormData())],
  ['excluirExercicio', () => excluirExercicio(UUID)],
  ['convidarAluno', () => convidarAluno(undefined, new FormData())],
  ['editarAluno', () => editarAluno(UUID, undefined, new FormData())],
  ['criarDuelo', () => criarDuelo(UUID, 7) as never],
];

beforeEach(() => {
  vi.clearAllMocks();
  escritas.length = 0;
  getSessionUserMock.mockResolvedValue(PROF);
});

describe('Server Actions bloqueiam em somente leitura', () => {
  it.each(casos)('%s: sem direito devolve a mensagem e não escreve', async (_nome, chamar) => {
    guardMock.mockResolvedValue({ ok: false, message: MSG });
    const r = await chamar();
    expect(r.ok).toBe(false);
    expect(r.message).toBe(MSG);
    expect(escritas).toEqual([]);
    expect(guardMock).toHaveBeenCalled();
  });

  it('aprovarGeracao chama o guard com feature null para suggest_workout (incondicional)', async () => {
    guardMock.mockResolvedValue({ ok: false, message: MSG });
    await aprovarGeracao('g1');
    expect(guardMock).toHaveBeenCalledWith(null);
  });

  it('com direito o guard não bloqueia (smoke: registrarAgua segue para a validação)', async () => {
    guardMock.mockResolvedValue({ ok: true });
    const r = await registrarAgua(-5);
    // Passou do guard e caiu na validação/escrita da própria ação.
    expect(r.message).not.toBe(MSG);
  });
});
