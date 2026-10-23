import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Cobre a resolução de URL de exibição de mídia de exercício
 * (`lib/storage.signExerciseMedia`):
 * - PATH privado → assina no bucket `exercise-videos` (createSignedUrl mockado).
 * - URL http(s) pública → retorna o valor inalterado, SEM chamar o Storage.
 */

const createSignedUrl = vi.fn(async (path: string) => ({
  data: { signedUrl: `https://signed.example/${path}?token=abc` },
  error: null,
}));

const from = vi.fn(() => ({ createSignedUrl }));

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({ storage: { from } }),
}));

import { signExerciseMedia } from '@/lib/storage';

describe('signExerciseMedia', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('assina PATH privado via createSignedUrl no bucket exercise-videos', async () => {
    const path = 'tenant-1/ex-1/video-demo.mp4';
    const url = await signExerciseMedia(path, 60);

    expect(from).toHaveBeenCalledWith('exercise-videos');
    expect(createSignedUrl).toHaveBeenCalledWith(path, 60);
    expect(url).toBe(`https://signed.example/${path}?token=abc`);
  });

  it('repassa URL https pública inalterada, sem assinar', async () => {
    const publicUrl =
      'https://nltoaiiquuryjlnikyxy.supabase.co/storage/v1/object/public/exercise-gifs/agachamento-livre.gif';
    const url = await signExerciseMedia(publicUrl);

    expect(url).toBe(publicUrl);
    expect(from).not.toHaveBeenCalled();
    expect(createSignedUrl).not.toHaveBeenCalled();
  });

  it('repassa URL http pública inalterada, sem assinar', async () => {
    const publicUrl = 'http://cdn.example.com/demo.gif';
    const url = await signExerciseMedia(publicUrl);

    expect(url).toBe(publicUrl);
    expect(createSignedUrl).not.toHaveBeenCalled();
  });
});
