import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Testes das Server Actions da Agenda (`actions/agenda.ts`), de
 * `definirHorarioRefeicao` (`actions/dietas.ts`) e da extensão de
 * `definirMetaAgua` (lembretes). Molde de `actions-habitos.test.ts`:
 * `getSessionUser` e o server client mockados; o gate de billing é o mock
 * global de `vitest.setup.ts` (sobrescrito por teste quando preciso).
 */

const getSessionUserMock = vi.fn();
const rpcSpy = vi.fn();
const perfilUpdateSpy = vi.fn();
const metaUpsertSpy = vi.fn();
const mealUpdateSpy = vi.fn();

let rpcResult: { data: unknown; error: unknown } = { data: 'novo-id', error: null };
let perfilUpdateResult: { error: unknown } = { error: null };
let linhaAppointment: Record<string, unknown> | null = null;
let mealResult: { data: { diet_id: string } | null; error: unknown } = {
  data: { diet_id: 'dieta-1' },
  error: null,
};

function makeSupabase() {
  return {
    rpc: (nome: string, args: unknown) => {
      rpcSpy(nome, args);
      return Promise.resolve(rpcResult);
    },
    from: (tabela: string) => {
      if (tabela === 'profiles') {
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: { timezone: 'America/Sao_Paulo' }, error: null }),
            }),
          }),
          update: (patch: unknown) => ({
            eq: (_c: string, id: string) => {
              perfilUpdateSpy(patch, id);
              return Promise.resolve(perfilUpdateResult);
            },
          }),
        };
      }
      if (tabela === 'appointments') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () => Promise.resolve({ data: linhaAppointment, error: null }),
            }),
          }),
        };
      }
      if (tabela === 'water_goals') {
        return {
          upsert: (linha: unknown, opts: unknown) => {
            metaUpsertSpy(linha, opts);
            return Promise.resolve({ error: null });
          },
        };
      }
      if (tabela === 'diet_meals') {
        return {
          update: (patch: unknown) => ({
            eq: (_c: string, id: string) => {
              mealUpdateSpy(patch, id);
              return {
                select: () => ({ maybeSingle: () => Promise.resolve(mealResult) }),
              };
            },
          }),
        };
      }
      throw new Error(`tabela inesperada: ${tabela}`);
    },
  };
}

vi.mock('@/lib/auth', async () => {
  const atual = await vi.importActual<typeof import('@/lib/auth')>('@/lib/auth');
  return { ...atual, getSessionUser: () => getSessionUserMock() };
});
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => makeSupabase()),
}));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

import { requireEntitlement } from '@/lib/billing/guard';
import {
  atualizarFusoHorario,
  cancelarCompromisso,
  criarCompromisso,
  editarCompromisso,
} from '@/actions/agenda';
import { definirHorarioRefeicao } from '@/actions/dietas';
import { definirMetaAgua } from '@/actions/habitos';
import { MODULOS_VISIBILIDADE } from '@/schemas/filiado';

const base = {
  userId: 'u-1',
  tenantId: 'tenant-1',
  email: null,
  fullName: null,
  avatarUrl: null,
};
const PROFESSOR = { ...base, userId: 'prof-1', role: 'trainer' as const, isMaster: false, accountType: 'professional' as const };
const MASTER = { ...PROFESSOR, isMaster: true };
const ALUNO = { ...base, userId: 'aluno-1', role: 'student' as const, isMaster: false, accountType: 'professional' as const };
const AUTONOMO = { ...base, userId: 'auto-1', role: 'trainer' as const, isMaster: true, accountType: 'self_managed' as const };

const ALUNO_UUID = '33333333-3333-3333-3333-333333333333';
const COMP_UUID = '44444444-4444-4444-4444-444444444444';
const MEAL_UUID = '11111111-1111-1111-1111-111111111111';

const pessoal = { tipo: 'personal', titulo: 'Corrida', data: '2030-03-04', inicio: '07:00', fim: '08:00', repeticao: 'nenhuma' };
const atendimento = { tipo: 'in_person', alunoId: ALUNO_UUID, data: '2030-03-04', inicio: '09:00', fim: '10:00', repeticao: 'nenhuma' };

beforeEach(() => {
  vi.clearAllMocks();
  rpcResult = { data: 'novo-id', error: null };
  perfilUpdateResult = { error: null };
  linhaAppointment = null;
  mealResult = { data: { diet_id: 'dieta-1' }, error: null };
  vi.mocked(requireEntitlement).mockResolvedValue({ ok: true });
});

describe('criarCompromisso', () => {
  it('sem sessão: "Sessão expirada." e não chama rpc', async () => {
    getSessionUserMock.mockResolvedValue(null);
    const r = await criarCompromisso(pessoal);
    expect(r).toEqual({ ok: false, message: 'Sessão expirada.' });
    expect(rpcSpy).not.toHaveBeenCalled();
  });

  it('somente leitura bloqueia sem chamar rpc e repassa a mensagem do guard', async () => {
    getSessionUserMock.mockResolvedValue(PROFESSOR);
    vi.mocked(requireEntitlement).mockResolvedValue({ ok: false, message: 'Somente leitura.' });
    const r = await criarCompromisso(atendimento);
    expect(r).toEqual({ ok: false, message: 'Somente leitura.' });
    expect(requireEntitlement).toHaveBeenCalledWith(null, PROFESSOR);
    expect(rpcSpy).not.toHaveBeenCalled();
  });

  it('guard sem mensagem usa "Assinatura inativa."', async () => {
    getSessionUserMock.mockResolvedValue(PROFESSOR);
    vi.mocked(requireEntitlement).mockResolvedValue({ ok: false });
    const r = await criarCompromisso(atendimento);
    expect(r.message).toBe('Assinatura inativa.');
  });

  it('Zod inválido (fim <= início) devolve fieldErrors sem rpc', async () => {
    getSessionUserMock.mockResolvedValue(PROFESSOR);
    const r = await criarCompromisso({ ...atendimento, inicio: '10:00', fim: '09:00' });
    expect(r.ok).toBe(false);
    expect(r.fieldErrors?.fim).toBeTruthy();
    expect(rpcSpy).not.toHaveBeenCalled();
  });

  it('atendimento sem aluno é inválido; pessoal com aluno também', async () => {
    getSessionUserMock.mockResolvedValue(PROFESSOR);
    const a = await criarCompromisso({ ...atendimento, alunoId: undefined });
    expect(a.fieldErrors?.alunoId).toBeTruthy();
    const b = await criarCompromisso({ ...pessoal, alunoId: ALUNO_UUID });
    expect(b.fieldErrors?.alunoId).toBeTruthy();
    expect(rpcSpy).not.toHaveBeenCalled();
  });

  it('semanal exige incluir o dia da data (2030-03-04 é segunda = 1)', async () => {
    getSessionUserMock.mockResolvedValue(PROFESSOR);
    const ruim = await criarCompromisso({ ...atendimento, repeticao: 'semanal', diasSemana: [3, 5] });
    expect(ruim.fieldErrors?.diasSemana).toBeTruthy();
    const ok = await criarCompromisso({ ...atendimento, repeticao: 'semanal', diasSemana: [5, 1] });
    expect(ok.ok).toBe(true);
    expect(rpcSpy.mock.calls[0][1]).toMatchObject({
      p_recur_freq: 'weekly',
      p_recur_weekdays: [1, 5],
    });
  });

  it('professor cria atendimento: converte horários no fuso do perfil', async () => {
    getSessionUserMock.mockResolvedValue(PROFESSOR);
    const r = await criarCompromisso(atendimento);
    expect(r).toMatchObject({ ok: true, id: 'novo-id' });
    expect(rpcSpy).toHaveBeenCalledWith(
      'agenda_create',
      expect.objectContaining({
        p_kind: 'in_person',
        p_student_id: ALUNO_UUID,
        // 09:00 em America/Sao_Paulo (UTC-3) em março de 2030.
        p_starts_at: '2030-03-04T12:00:00.000Z',
        p_ends_at: '2030-03-04T13:00:00.000Z',
        p_recur_freq: null,
      })
    );
  });

  it('aluno e autônomo só criam kind personal', async () => {
    for (const usuario of [ALUNO, AUTONOMO]) {
      getSessionUserMock.mockResolvedValue(usuario);
      const negado = await criarCompromisso(atendimento);
      expect(negado.ok).toBe(false);
      const bloqueio = await criarCompromisso({ ...pessoal, tipo: 'block' });
      expect(bloqueio.ok).toBe(false);
    }
    expect(rpcSpy).not.toHaveBeenCalled();
    getSessionUserMock.mockResolvedValue(ALUNO);
    expect((await criarCompromisso(pessoal)).ok).toBe(true);
    getSessionUserMock.mockResolvedValue(AUTONOMO);
    expect((await criarCompromisso(pessoal)).ok).toBe(true);
    expect(rpcSpy).toHaveBeenCalledTimes(2);
  });

  it('mapeia P0001 conhecido para pt-BR sem logar', async () => {
    getSessionUserMock.mockResolvedValue(PROFESSOR);
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    rpcResult = { data: null, error: { code: 'P0001', message: 'agenda_student_invalid' } };
    const r = await criarCompromisso(atendimento);
    expect(r.ok).toBe(false);
    expect(r.message).toMatch(/Aluno inválido/);
    expect(log).not.toHaveBeenCalled();
    log.mockRestore();
  });

  it('erro inesperado: mensagem genérica e console.error só com o código', async () => {
    getSessionUserMock.mockResolvedValue(PROFESSOR);
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    rpcResult = { data: null, error: { code: '23505', message: 'duplicate key ... dados' } };
    const r = await criarCompromisso(atendimento);
    expect(r).toEqual({ ok: false, message: 'Não foi possível salvar o compromisso.' });
    expect(log).toHaveBeenCalledWith('[agenda]', '23505');
    log.mockRestore();
  });
});

describe('editarCompromisso / cancelarCompromisso', () => {
  const edicao = {
    id: COMP_UUID,
    escopo: 'seguintes',
    dataOcorrencia: '2030-03-04',
    titulo: 'Novo',
    data: '2030-03-04',
    inicio: '10:00',
    fim: '11:00',
  };

  it('somente leitura bloqueia as duas sem rpc', async () => {
    getSessionUserMock.mockResolvedValue(PROFESSOR);
    vi.mocked(requireEntitlement).mockResolvedValue({ ok: false, message: 'Somente leitura.' });
    expect((await editarCompromisso(edicao)).message).toBe('Somente leitura.');
    expect((await cancelarCompromisso({ id: COMP_UUID, escopo: 'todos', dataOcorrencia: '2030-03-04' })).message).toBe(
      'Somente leitura.'
    );
    expect(rpcSpy).not.toHaveBeenCalled();
  });

  it('repassa o escopo e usa o tz DA SÉRIE (não o do editor)', async () => {
    getSessionUserMock.mockResolvedValue(PROFESSOR);
    linhaAppointment = { kind: 'in_person', owner_id: PROFESSOR.userId, trainer_id: PROFESSOR.userId, tz: 'America/New_York' };
    const r = await editarCompromisso(edicao);
    expect(r.ok).toBe(true);
    expect(rpcSpy).toHaveBeenCalledWith(
      'agenda_update',
      expect.objectContaining({
        p_scope: 'following',
        p_original_date: '2030-03-04',
        // 10:00 em Nova York (UTC-5 em 4/mar/2030).
        p_starts_at: '2030-03-04T15:00:00.000Z',
      })
    );
  });

  it('escopo ocorrencia não repassa regra de recorrência', async () => {
    getSessionUserMock.mockResolvedValue(PROFESSOR);
    linhaAppointment = { kind: 'in_person', owner_id: PROFESSOR.userId, trainer_id: PROFESSOR.userId, tz: 'America/Sao_Paulo' };
    await editarCompromisso({ ...edicao, escopo: 'ocorrencia', repeticao: 'diaria' });
    expect(rpcSpy.mock.calls[0][1]).toMatchObject({
      p_scope: 'occurrence',
      p_recur_freq: null,
      p_recur_weekdays: null,
      p_recur_until: null,
    });
  });

  it('cancelar repassa o escopo', async () => {
    getSessionUserMock.mockResolvedValue(PROFESSOR);
    linhaAppointment = { kind: 'online', owner_id: PROFESSOR.userId, trainer_id: PROFESSOR.userId, tz: 'America/Sao_Paulo' };
    const r = await cancelarCompromisso({ id: COMP_UUID, escopo: 'todos', dataOcorrencia: '2030-03-04' });
    expect(r.ok).toBe(true);
    expect(rpcSpy).toHaveBeenCalledWith('agenda_cancel', {
      p_id: COMP_UUID,
      p_scope: 'all',
      p_original_date: '2030-03-04',
    });
  });

  it('personal/block de outro profissional não é editável nem pelo master (M3)', async () => {
    getSessionUserMock.mockResolvedValue(MASTER);
    linhaAppointment = { kind: 'block', owner_id: 'outro', trainer_id: null, tz: 'America/Sao_Paulo' };
    expect((await editarCompromisso(edicao)).ok).toBe(false);
    expect(rpcSpy).not.toHaveBeenCalled();
  });

  it('atendimento de terceiro: filiado sem vínculo é negado; master e trainer_id passam', async () => {
    linhaAppointment = { kind: 'in_person', owner_id: 'outro', trainer_id: 'outro', tz: 'America/Sao_Paulo' };
    getSessionUserMock.mockResolvedValue(PROFESSOR);
    expect((await editarCompromisso(edicao)).ok).toBe(false);
    expect(rpcSpy).not.toHaveBeenCalled();
    getSessionUserMock.mockResolvedValue(MASTER);
    expect((await editarCompromisso(edicao)).ok).toBe(true);
  });

  it('aluno não edita nem cancela atendimento', async () => {
    getSessionUserMock.mockResolvedValue(ALUNO);
    linhaAppointment = { kind: 'in_person', owner_id: 'prof-1', trainer_id: 'prof-1', tz: 'America/Sao_Paulo' };
    expect((await editarCompromisso(edicao)).ok).toBe(false);
    expect((await cancelarCompromisso({ id: COMP_UUID, escopo: 'ocorrencia', dataOcorrencia: '2030-03-04' })).ok).toBe(false);
    expect(rpcSpy).not.toHaveBeenCalled();
  });

  it('compromisso inexistente (fora da RLS) => não encontrado', async () => {
    getSessionUserMock.mockResolvedValue(PROFESSOR);
    linhaAppointment = null;
    const r = await cancelarCompromisso({ id: COMP_UUID, escopo: 'ocorrencia', dataOcorrencia: '2030-03-04' });
    expect(r).toEqual({ ok: false, message: 'Compromisso não encontrado.' });
  });

  it('agenda_past do banco vira mensagem pt-BR', async () => {
    getSessionUserMock.mockResolvedValue(PROFESSOR);
    linhaAppointment = { kind: 'in_person', owner_id: PROFESSOR.userId, trainer_id: PROFESSOR.userId, tz: 'America/Sao_Paulo' };
    rpcResult = { data: null, error: { code: 'P0001', message: 'agenda_past' } };
    const r = await cancelarCompromisso({ id: COMP_UUID, escopo: 'ocorrencia', dataOcorrencia: '2030-03-04' });
    expect(r.message).toMatch(/já passaram/);
  });
});

describe('atualizarFusoHorario (N6)', () => {
  it('fuso inválido devolve fieldErrors.timezone e não atualiza', async () => {
    getSessionUserMock.mockResolvedValue(ALUNO);
    const r = await atualizarFusoHorario('Mars/Olympus');
    expect(r.ok).toBe(false);
    expect(r.fieldErrors?.timezone).toBe('Fuso não suportado.');
    expect(perfilUpdateSpy).not.toHaveBeenCalled();
  });

  it('erro do trigger do banco vira fieldErrors.timezone', async () => {
    getSessionUserMock.mockResolvedValue(ALUNO);
    perfilUpdateResult = { error: { code: '22023', message: 'time zone "X" not recognized' } };
    const r = await atualizarFusoHorario('America/Sao_Paulo');
    expect(r.ok).toBe(false);
    expect(r.fieldErrors?.timezone).toBe('Fuso não suportado.');
  });

  it('fuso válido atualiza o próprio perfil (isento do gate: mesmo em somente leitura)', async () => {
    getSessionUserMock.mockResolvedValue(ALUNO);
    vi.mocked(requireEntitlement).mockResolvedValue({ ok: false, message: 'Somente leitura.' });
    const r = await atualizarFusoHorario('America/Manaus');
    expect(r.ok).toBe(true);
    expect(perfilUpdateSpy).toHaveBeenCalledWith({ timezone: 'America/Manaus' }, ALUNO.userId);
    expect(requireEntitlement).not.toHaveBeenCalled();
  });

  it('sem sessão: "Sessão expirada."', async () => {
    getSessionUserMock.mockResolvedValue(null);
    expect(await atualizarFusoHorario('America/Manaus')).toEqual({ ok: false, message: 'Sessão expirada.' });
  });
});

describe('definirMetaAgua com lembretes', () => {
  it('sem lembretes mantém o upsert antigo (sem colunas reminder_*)', async () => {
    getSessionUserMock.mockResolvedValue(ALUNO);
    await definirMetaAgua(2800, 'manual');
    const linha = metaUpsertSpy.mock.calls[0][0];
    expect(Object.keys(linha).sort()).toEqual(['source', 'target_ml', 'tenant_id', 'user_id']);
  });

  it('com lembretes inclui as três colunas', async () => {
    getSessionUserMock.mockResolvedValue(ALUNO);
    const r = await definirMetaAgua(2800, 'manual', undefined, { intervaloMin: 90, inicioMin: 420, fimMin: 1200 });
    expect(r.ok).toBe(true);
    expect(metaUpsertSpy.mock.calls[0][0]).toMatchObject({
      reminder_interval_min: 90,
      reminder_start_min: 420,
      reminder_end_min: 1200,
    });
  });

  it('rejeita intervalo fora do conjunto e início >= fim', async () => {
    getSessionUserMock.mockResolvedValue(ALUNO);
    expect((await definirMetaAgua(2800, 'manual', undefined, { intervaloMin: 45, inicioMin: 420, fimMin: 1200 })).ok).toBe(false);
    expect((await definirMetaAgua(2800, 'manual', undefined, { intervaloMin: 60, inicioMin: 600, fimMin: 600 })).ok).toBe(false);
    expect((await definirMetaAgua(2800, 'manual', undefined, { intervaloMin: 60, inicioMin: 0, fimMin: 1440 })).ok).toBe(false);
    expect(metaUpsertSpy).not.toHaveBeenCalled();
  });
});

describe('definirHorarioRefeicao', () => {
  it('chama o gate com a feature diets antes de qualquer escrita', async () => {
    getSessionUserMock.mockResolvedValue(PROFESSOR);
    vi.mocked(requireEntitlement).mockResolvedValue({ ok: false, message: 'Seu plano atual não inclui este recurso.' });
    const r = await definirHorarioRefeicao(MEAL_UUID, '08:30');
    expect(requireEntitlement).toHaveBeenCalledWith('diets', PROFESSOR);
    expect(r.ok).toBe(false);
    expect(mealUpdateSpy).not.toHaveBeenCalled();
  });

  it('valida HH:mm e aceita null para limpar', async () => {
    getSessionUserMock.mockResolvedValue(PROFESSOR);
    expect((await definirHorarioRefeicao(MEAL_UUID, '25:00')).ok).toBe(false);
    expect((await definirHorarioRefeicao(MEAL_UUID, '8:30')).ok).toBe(false);
    expect((await definirHorarioRefeicao('nao-uuid', '08:30')).ok).toBe(false);
    expect(mealUpdateSpy).not.toHaveBeenCalled();
    expect((await definirHorarioRefeicao(MEAL_UUID, '08:30')).ok).toBe(true);
    expect(mealUpdateSpy).toHaveBeenLastCalledWith({ time: '08:30' }, MEAL_UUID);
    expect((await definirHorarioRefeicao(MEAL_UUID, null)).ok).toBe(true);
    expect(mealUpdateSpy).toHaveBeenLastCalledWith({ time: null }, MEAL_UUID);
  });

  it('refeição fora da RLS => não encontrada', async () => {
    getSessionUserMock.mockResolvedValue(PROFESSOR);
    mealResult = { data: null, error: null };
    expect(await definirHorarioRefeicao(MEAL_UUID, '08:30')).toEqual({ ok: false, message: 'Refeição não encontrada.' });
  });
});

describe('MODULOS_VISIBILIDADE', () => {
  it('inclui o módulo agenda', () => {
    expect(MODULOS_VISIBILIDADE).toContain('agenda');
    expect(MODULOS_VISIBILIDADE).toHaveLength(6);
  });
});
