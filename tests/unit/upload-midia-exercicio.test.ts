import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Testes HEADLESS das Server Actions de upload DIRETO de mídia de exercício
 * (Supabase Storage MOCKADO — nunca chama a API real):
 *
 * - `criarUploadUrlMidiaExercicio`: guard de trainer, validação de tamanho/tipo,
 *   e caminho feliz (path determinístico + retorno da signed upload URL).
 * - `confirmarMidiaExercicio`: guard, rejeição de path fora do prefixo esperado
 *   (cross-tenant/arbitrário), e persistência na coluna correta.
 */

const {
  getSessionUserMock,
  createSignedUploadUrlMock,
  updateMock,
  eqMock,
  fromTableMock,
  storageFromMock,
} = vi.hoisted(() => ({
  getSessionUserMock: vi.fn(),
  createSignedUploadUrlMock: vi.fn(),
  updateMock: vi.fn(),
  eqMock: vi.fn(),
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

import {
  criarUploadUrlMidiaExercicio,
  confirmarMidiaExercicio,
} from '@/actions/exercicios';

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

beforeEach(() => {
  vi.clearAllMocks();
  getSessionUserMock.mockResolvedValue(TRAINER);
  // storage.from('exercise-videos').createSignedUploadUrl(path, opts)
  storageFromMock.mockReturnValue({ createSignedUploadUrl: createSignedUploadUrlMock });
  createSignedUploadUrlMock.mockResolvedValue({
    data: {
      signedUrl: 'https://signed.example/upload?token=abc',
      token: 'tok-123',
      path: `${TRAINER.tenantId}/${EXERCISE_ID}/video-demo.mp4`,
    },
    error: null,
  });
  // from('exercises').update(...).eq('id', ...)
  eqMock.mockResolvedValue({ error: null });
  updateMock.mockReturnValue({ eq: eqMock });
  fromTableMock.mockReturnValue({ update: updateMock });
});

describe('criarUploadUrlMidiaExercicio', () => {
  it('recusa quem não é trainer', async () => {
    getSessionUserMock.mockResolvedValueOnce(null);
    const r = await criarUploadUrlMidiaExercicio(EXERCISE_ID, 'video', {
      name: 'demo.mp4',
      size: 1024,
      type: 'video/mp4',
    });
    expect(r.ok).toBe(false);
    expect(createSignedUploadUrlMock).not.toHaveBeenCalled();
  });

  it('recusa aluno (role !== trainer)', async () => {
    getSessionUserMock.mockResolvedValueOnce({ ...TRAINER, role: 'student' });
    const r = await criarUploadUrlMidiaExercicio(EXERCISE_ID, 'video', {
      name: 'demo.mp4',
      size: 1024,
      type: 'video/mp4',
    });
    expect(r.ok).toBe(false);
    expect(createSignedUploadUrlMock).not.toHaveBeenCalled();
  });

  it('rejeita vídeo acima de 50 MB', async () => {
    const r = await criarUploadUrlMidiaExercicio(EXERCISE_ID, 'video', {
      name: 'grande.mp4',
      size: 50 * 1024 * 1024 + 1,
      type: 'video/mp4',
    });
    expect(r.ok).toBe(false);
    expect(r.message).toMatch(/50MB/);
    expect(createSignedUploadUrlMock).not.toHaveBeenCalled();
  });

  it('rejeita thumbnail acima de 5 MB', async () => {
    const r = await criarUploadUrlMidiaExercicio(EXERCISE_ID, 'thumbnail', {
      name: 'grande.png',
      size: 5 * 1024 * 1024 + 1,
      type: 'image/png',
    });
    expect(r.ok).toBe(false);
    expect(r.message).toMatch(/5MB/);
    expect(createSignedUploadUrlMock).not.toHaveBeenCalled();
  });

  it('rejeita tipo incompatível com o kind (imagem no slot de vídeo)', async () => {
    const r = await criarUploadUrlMidiaExercicio(EXERCISE_ID, 'video', {
      name: 'foto.png',
      size: 1024,
      type: 'image/png',
    });
    expect(r.ok).toBe(false);
    expect(createSignedUploadUrlMock).not.toHaveBeenCalled();
  });

  it('emite a signed upload URL com o path determinístico (vídeo)', async () => {
    const r = await criarUploadUrlMidiaExercicio(EXERCISE_ID, 'video', {
      name: 'demo.mp4',
      size: 10 * 1024 * 1024,
      type: 'video/mp4',
    });

    expect(storageFromMock).toHaveBeenCalledWith('exercise-videos');
    expect(createSignedUploadUrlMock).toHaveBeenCalledWith(
      `${TRAINER.tenantId}/${EXERCISE_ID}/video-demo.mp4`,
      { upsert: true }
    );
    expect(r.ok).toBe(true);
    expect(r.url).toBe('https://signed.example/upload?token=abc');
    expect(r.token).toBe('tok-123');
    expect(r.path).toBe(`${TRAINER.tenantId}/${EXERCISE_ID}/video-demo.mp4`);
  });

  it('sanitiza o nome do arquivo ao montar o path (sem barras)', async () => {
    await criarUploadUrlMidiaExercicio(EXERCISE_ID, 'video', {
      name: '../../hack/demo final.mp4',
      size: 1024,
      type: 'video/mp4',
    });
    const [pathUsado] = createSignedUploadUrlMock.mock.calls[0];
    expect(pathUsado).toBe(`${TRAINER.tenantId}/${EXERCISE_ID}/video-demo_final.mp4`);
  });
});

describe('confirmarMidiaExercicio', () => {
  it('recusa quem não é trainer', async () => {
    getSessionUserMock.mockResolvedValueOnce(null);
    const r = await confirmarMidiaExercicio(
      EXERCISE_ID,
      'video',
      `${TRAINER.tenantId}/${EXERCISE_ID}/video-demo.mp4`
    );
    expect(r.ok).toBe(false);
    expect(updateMock).not.toHaveBeenCalled();
  });

  it('rejeita path fora do prefixo esperado (cross-tenant)', async () => {
    const r = await confirmarMidiaExercicio(
      EXERCISE_ID,
      'video',
      `outro-tenant/${EXERCISE_ID}/video-demo.mp4`
    );
    expect(r.ok).toBe(false);
    expect(updateMock).not.toHaveBeenCalled();
  });

  it('rejeita path de kind divergente do esperado', async () => {
    const r = await confirmarMidiaExercicio(
      EXERCISE_ID,
      'video',
      `${TRAINER.tenantId}/${EXERCISE_ID}/thumbnail-demo.png`
    );
    expect(r.ok).toBe(false);
    expect(updateMock).not.toHaveBeenCalled();
  });

  it('persiste o path em video_url (kind video)', async () => {
    const path = `${TRAINER.tenantId}/${EXERCISE_ID}/video-demo.mp4`;
    const r = await confirmarMidiaExercicio(EXERCISE_ID, 'video', path);

    expect(fromTableMock).toHaveBeenCalledWith('exercises');
    expect(updateMock).toHaveBeenCalledWith({ video_url: path });
    expect(eqMock).toHaveBeenCalledWith('id', EXERCISE_ID);
    expect(r.ok).toBe(true);
    expect(r.path).toBe(path);
  });

  it('persiste o path em thumbnail_url (kind thumbnail)', async () => {
    const path = `${TRAINER.tenantId}/${EXERCISE_ID}/thumbnail-capa.png`;
    const r = await confirmarMidiaExercicio(EXERCISE_ID, 'thumbnail', path);

    expect(updateMock).toHaveBeenCalledWith({ thumbnail_url: path });
    expect(eqMock).toHaveBeenCalledWith('id', EXERCISE_ID);
    expect(r.ok).toBe(true);
  });

  it('retorna erro quando o update falha', async () => {
    eqMock.mockResolvedValueOnce({ error: { message: 'boom' } });
    const path = `${TRAINER.tenantId}/${EXERCISE_ID}/video-demo.mp4`;
    const r = await confirmarMidiaExercicio(EXERCISE_ID, 'video', path);
    expect(r.ok).toBe(false);
  });
});
