import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Testes HEADLESS da Server Action `excluirMidiaExercicio` (Supabase Storage
 * MOCKADO — nunca chama a API real):
 *
 * - Guard: recusa quem não é trainer do tenant dono (sem remover nem atualizar).
 * - Caminho feliz: remove do bucket privado + zera a coluna correta.
 * - Idempotência: coluna já vazia -> não remove; arquivo inexistente no Storage
 *   -> ainda zera a coluna.
 * - Mídia pública legada (http/https): pula o Storage e só zera a coluna.
 * - Exercício não encontrado / falha de Storage: retornam erro sem atualizar.
 */

const {
  getSessionUserMock,
  removeMock,
  selectMock,
  eqSelectMock,
  singleMock,
  updateMock,
  eqUpdateMock,
  fromTableMock,
  storageFromMock,
} = vi.hoisted(() => ({
  getSessionUserMock: vi.fn(),
  removeMock: vi.fn(),
  selectMock: vi.fn(),
  eqSelectMock: vi.fn(),
  singleMock: vi.fn(),
  updateMock: vi.fn(),
  eqUpdateMock: vi.fn(),
  fromTableMock: vi.fn(),
  storageFromMock: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({ getSessionUser: getSessionUserMock }));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    storage: { from: storageFromMock },
    from: fromTableMock,
  })),
}));

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

import { excluirMidiaExercicio } from '@/actions/exercicios';

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

/** Configura o retorno do SELECT `exercises` por id (`.single()`). */
function mockSelect(row: Record<string, unknown> | null, error: unknown = null) {
  singleMock.mockResolvedValue({ data: row, error });
}

beforeEach(() => {
  vi.clearAllMocks();
  getSessionUserMock.mockResolvedValue(TRAINER);

  // storage.from('exercise-videos').remove([path])
  storageFromMock.mockReturnValue({ remove: removeMock });
  removeMock.mockResolvedValue({ data: [{}], error: null });

  // from('exercises') encadeia select->eq->single e update->eq.
  singleMock.mockResolvedValue({ data: null, error: null });
  eqSelectMock.mockReturnValue({ single: singleMock });
  selectMock.mockReturnValue({ eq: eqSelectMock });
  eqUpdateMock.mockResolvedValue({ error: null });
  updateMock.mockReturnValue({ eq: eqUpdateMock });
  fromTableMock.mockReturnValue({ select: selectMock, update: updateMock });
});

describe('excluirMidiaExercicio', () => {
  it('recusa quem não está autenticado (sem remover nem atualizar)', async () => {
    getSessionUserMock.mockResolvedValueOnce(null);
    const r = await excluirMidiaExercicio(EXERCISE_ID, 'video');
    expect(r.ok).toBe(false);
    expect(removeMock).not.toHaveBeenCalled();
    expect(updateMock).not.toHaveBeenCalled();
  });

  it('recusa aluno (role !== trainer)', async () => {
    getSessionUserMock.mockResolvedValueOnce({ ...TRAINER, role: 'student' });
    const r = await excluirMidiaExercicio(EXERCISE_ID, 'video');
    expect(r.ok).toBe(false);
    expect(removeMock).not.toHaveBeenCalled();
    expect(updateMock).not.toHaveBeenCalled();
  });

  it('remove o vídeo do bucket privado e zera video_url', async () => {
    const path = `${TRAINER.tenantId}/${EXERCISE_ID}/video-demo.mp4`;
    mockSelect({ id: EXERCISE_ID, video_url: path, thumbnail_url: null });

    const r = await excluirMidiaExercicio(EXERCISE_ID, 'video');

    expect(storageFromMock).toHaveBeenCalledWith('exercise-videos');
    expect(removeMock).toHaveBeenCalledWith([path]);
    expect(updateMock).toHaveBeenCalledWith({ video_url: null });
    expect(eqUpdateMock).toHaveBeenCalledWith('id', EXERCISE_ID);
    expect(r.ok).toBe(true);
  });

  it('remove a thumbnail e zera thumbnail_url', async () => {
    const path = `${TRAINER.tenantId}/${EXERCISE_ID}/thumbnail-capa.png`;
    mockSelect({ id: EXERCISE_ID, video_url: null, thumbnail_url: path });

    const r = await excluirMidiaExercicio(EXERCISE_ID, 'thumbnail');

    expect(removeMock).toHaveBeenCalledWith([path]);
    expect(updateMock).toHaveBeenCalledWith({ thumbnail_url: null });
    expect(eqUpdateMock).toHaveBeenCalledWith('id', EXERCISE_ID);
    expect(r.ok).toBe(true);
  });

  it('é idempotente quando a coluna já está vazia (não remove nem atualiza)', async () => {
    mockSelect({ id: EXERCISE_ID, video_url: null, thumbnail_url: null });

    const r = await excluirMidiaExercicio(EXERCISE_ID, 'video');

    expect(r.ok).toBe(true);
    expect(removeMock).not.toHaveBeenCalled();
    expect(updateMock).not.toHaveBeenCalled();
  });

  it('é idempotente quando o arquivo não existe mais no Storage (ainda zera a coluna)', async () => {
    const path = `${TRAINER.tenantId}/${EXERCISE_ID}/video-demo.mp4`;
    mockSelect({ id: EXERCISE_ID, video_url: path, thumbnail_url: null });
    // remove() do Supabase não falha para objeto inexistente: data vazio, sem erro.
    removeMock.mockResolvedValueOnce({ data: [], error: null });

    const r = await excluirMidiaExercicio(EXERCISE_ID, 'video');

    expect(removeMock).toHaveBeenCalledWith([path]);
    expect(updateMock).toHaveBeenCalledWith({ video_url: null });
    expect(r.ok).toBe(true);
  });

  it('pula o Storage para mídia pública legada (http/https) e só zera a coluna', async () => {
    mockSelect({
      id: EXERCISE_ID,
      video_url: 'https://cdn.example/x.gif',
      thumbnail_url: null,
    });

    const r = await excluirMidiaExercicio(EXERCISE_ID, 'video');

    expect(removeMock).not.toHaveBeenCalled();
    expect(updateMock).toHaveBeenCalledWith({ video_url: null });
    expect(r.ok).toBe(true);
  });

  it('retorna erro quando o exercício não é encontrado (RLS/ausente)', async () => {
    mockSelect(null, { message: 'not found' });

    const r = await excluirMidiaExercicio(EXERCISE_ID, 'video');

    expect(r.ok).toBe(false);
    expect(removeMock).not.toHaveBeenCalled();
    expect(updateMock).not.toHaveBeenCalled();
  });

  it('retorna erro quando a remoção no Storage falha (sem atualizar)', async () => {
    const path = `${TRAINER.tenantId}/${EXERCISE_ID}/video-demo.mp4`;
    mockSelect({ id: EXERCISE_ID, video_url: path, thumbnail_url: null });
    removeMock.mockResolvedValueOnce({ data: null, error: { message: 'boom' } });

    const r = await excluirMidiaExercicio(EXERCISE_ID, 'video');

    expect(r.ok).toBe(false);
    expect(updateMock).not.toHaveBeenCalled();
  });
});
