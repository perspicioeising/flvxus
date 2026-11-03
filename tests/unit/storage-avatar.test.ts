import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Cobre o CACHE-BUSTING da public URL do avatar (`lib/storage/avatar.uploadAvatar`):
 * - A public URL retornada (e gravada em `profiles.avatar_url`) recebe `?v=`
 *   único por upload, mesmo com path DETERMINÍSTICO `{user_id}.<ext>`.
 * - Dois uploads do mesmo formato geram URLs DIFERENTES (cache invalidado),
 *   o que corrige o bug de "remover + adicionar nova foto volta à antiga".
 */

const upload = vi.fn(async () => ({ error: null }));
const getPublicUrl = vi.fn((path: string) => ({
  data: {
    publicUrl: `https://proj.supabase.co/storage/v1/object/public/avatars/${path}`,
  },
}));

const from = vi.fn(() => ({ upload, getPublicUrl }));

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({ storage: { from } }),
}));

import { uploadAvatar, AVATAR_BUCKET } from '@/lib/storage/avatar';

/**
 * PNG mínimo válido (magic bytes `89 50 4E 47 0D 0A 1A 0A`). Expõe
 * `arrayBuffer()`/`size` explicitamente porque o Blob do jsdom não implementa
 * `arrayBuffer` no ambiente de teste.
 */
function pngBlob(): Blob {
  const bytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  return {
    size: bytes.byteLength,
    type: 'image/png',
    arrayBuffer: async () => bytes.buffer,
  } as unknown as Blob;
}

describe('uploadAvatar — cache-busting da public URL', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('anexa ?v=<versao> à public URL gravada, sem mudar o path no bucket', async () => {
    const { publicUrl, path } = await uploadAvatar({
      userId: 'user-1',
      file: pngBlob(),
      versao: 1730000000000,
    });

    expect(from).toHaveBeenCalledWith(AVATAR_BUCKET);
    // Path físico permanece DETERMINÍSTICO (sem query string).
    expect(path).toBe('user-1.png');
    expect(upload).toHaveBeenCalledWith('user-1.png', expect.anything(), {
      contentType: 'image/png',
      upsert: true,
    });
    // A URL gravada carrega o cache-bust.
    expect(publicUrl).toBe(
      'https://proj.supabase.co/storage/v1/object/public/avatars/user-1.png?v=1730000000000',
    );
  });

  it('dois uploads do mesmo formato geram URLs com versões DIFERENTES', async () => {
    const primeiro = await uploadAvatar({
      userId: 'user-1',
      file: pngBlob(),
      versao: 1730000000000,
    });
    const segundo = await uploadAvatar({
      userId: 'user-1',
      file: pngBlob(),
      versao: 1730000009999,
    });

    // Mesmo path físico...
    expect(primeiro.path).toBe(segundo.path);
    // ...mas URLs distintas: cache de CDN/navegador é invalidado.
    expect(primeiro.publicUrl).not.toBe(segundo.publicUrl);
    expect(segundo.publicUrl).toContain('?v=1730000009999');
  });
});
