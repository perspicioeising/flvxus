import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Testes HEADLESS das Server Actions de texto do exercício (Supabase MOCKADO).
 *
 * Foco no BUG DE PERDA DE MÍDIA: editar (ou criar) um exercício só com os campos
 * de texto NÃO pode tocar `video_url`/`thumbnail_url`. O payload enviado ao
 * `.insert()`/`.update()` NÃO deve conter essas chaves — a mídia é gravada só
 * pelas actions dedicadas. Mocks no padrão de `upload-midia-exercicio.test.ts`.
 */

const {
  getSessionUserMock,
  insertMock,
  selectAfterInsertMock,
  singleMock,
  updateMock,
  eqMock,
  fromTableMock,
} = vi.hoisted(() => ({
  getSessionUserMock: vi.fn(),
  insertMock: vi.fn(),
  selectAfterInsertMock: vi.fn(),
  singleMock: vi.fn(),
  updateMock: vi.fn(),
  eqMock: vi.fn(),
  fromTableMock: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({ getSessionUser: getSessionUserMock }));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({ from: fromTableMock })),
}));

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

import { criarExercicio, editarExercicio } from '@/actions/exercicios';

const TRAINER = {
  userId: 'user-1',
  role: 'trainer' as const,
  tenantId: 'tenant-1',
  email: 'pro@ex.com',
  fullName: 'Pro',
  avatarUrl: null,
  isMaster: true,
};

const EXERCISE_ID = 'ex-1';

/** Monta um FormData só com os campos de TEXTO (como o form de edição envia). */
function formDataTexto(): FormData {
  const fd = new FormData();
  fd.append('name', 'Supino reto');
  fd.append('muscle_groups', JSON.stringify(['Peito']));
  fd.append('equipment', JSON.stringify([]));
  fd.append('tips', JSON.stringify([]));
  fd.append('common_errors', JSON.stringify([]));
  fd.append('instructions', 'Desça a barra até o peito.');
  return fd;
}

beforeEach(() => {
  vi.clearAllMocks();
  getSessionUserMock.mockResolvedValue(TRAINER);

  // from('exercises').update(...).eq('id', ...)
  eqMock.mockResolvedValue({ error: null });
  updateMock.mockReturnValue({ eq: eqMock });

  // from('exercises').insert(...).select('id').single()
  singleMock.mockResolvedValue({ data: { id: EXERCISE_ID }, error: null });
  selectAfterInsertMock.mockReturnValue({ single: singleMock });
  insertMock.mockReturnValue({ select: selectAfterInsertMock });

  fromTableMock.mockReturnValue({ update: updateMock, insert: insertMock });
});

describe('editarExercicio — preservação de mídia (teste crítico)', () => {
  it('NÃO inclui video_url/thumbnail_url no payload do update', async () => {
    const r = await editarExercicio(EXERCISE_ID, undefined, formDataTexto());

    expect(r.ok).toBe(true);
    expect(fromTableMock).toHaveBeenCalledWith('exercises');
    expect(updateMock).toHaveBeenCalledTimes(1);

    const payload = updateMock.mock.calls[0][0];
    // A mídia existente não pode ser sobrescrita: as chaves não vão no update.
    expect(payload).not.toHaveProperty('video_url');
    expect(payload).not.toHaveProperty('thumbnail_url');
    // Mas os campos de texto continuam sendo atualizados.
    expect(payload).toMatchObject({
      name: 'Supino reto',
      muscle_groups: ['Peito'],
      instructions: 'Desça a barra até o peito.',
    });
    expect(eqMock).toHaveBeenCalledWith('id', EXERCISE_ID);
  });

  it('recusa quem não é trainer (guard de autorização)', async () => {
    getSessionUserMock.mockResolvedValueOnce({ ...TRAINER, role: 'student' });
    const r = await editarExercicio(EXERCISE_ID, undefined, formDataTexto());
    expect(r.ok).toBe(false);
    expect(updateMock).not.toHaveBeenCalled();
  });

  it('retorna fieldErrors quando a validação falha (sem nome)', async () => {
    const fd = new FormData();
    fd.append('name', '');
    fd.append('muscle_groups', JSON.stringify([]));
    const r = await editarExercicio(EXERCISE_ID, undefined, fd);
    expect(r.ok).toBe(false);
    expect(r.fieldErrors).toBeTruthy();
    expect(updateMock).not.toHaveBeenCalled();
  });
});

describe('criarExercicio — nasce sem mídia', () => {
  it('NÃO inclui video_url/thumbnail_url no payload do insert', async () => {
    const r = await criarExercicio(undefined, formDataTexto());

    expect(r.ok).toBe(true);
    expect(insertMock).toHaveBeenCalledTimes(1);

    const payload = insertMock.mock.calls[0][0];
    expect(payload).not.toHaveProperty('video_url');
    expect(payload).not.toHaveProperty('thumbnail_url');
    // Carimba tenant/created_by do professor autenticado (exigência da RLS).
    expect(payload).toMatchObject({
      name: 'Supino reto',
      tenant_id: TRAINER.tenantId,
      created_by: TRAINER.userId,
    });
    expect(r.id).toBe(EXERCISE_ID);
  });
});
