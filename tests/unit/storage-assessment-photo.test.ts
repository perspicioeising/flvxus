import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Cobre `removeAssessmentPhoto` (lib/storage): remove o objeto no bucket privado
 * `assessment-photos` via `storage.from().remove([path])` e propaga erro quando
 * o Storage retorna `{ error }`. Mock do server client (RLS não é exercitada em
 * teste unitário; o isolamento de tenant é garantido pela policy de storage).
 */

type RemoveResult = { data: unknown; error: { message: string } | null };
const remove = vi.fn(async (): Promise<RemoveResult> => ({ data: [], error: null }));
const from = vi.fn(() => ({ remove }));

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({ storage: { from } }),
}));

import { removeAssessmentPhoto } from '@/lib/storage';

describe('removeAssessmentPhoto', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    remove.mockResolvedValue({ data: [], error: null });
  });

  it('remove o path no bucket assessment-photos', async () => {
    const path = 'tenant-1/aluno-1/aval-1/foto.jpg';
    await removeAssessmentPhoto(path);

    expect(from).toHaveBeenCalledWith('assessment-photos');
    expect(remove).toHaveBeenCalledWith([path]);
  });

  it('propaga erro quando o Storage retorna error', async () => {
    remove.mockResolvedValueOnce({ data: null, error: { message: 'boom' } });

    await expect(
      removeAssessmentPhoto('tenant-1/aluno-1/aval-1/foto.jpg')
    ).rejects.toThrow(/boom/);
  });
});
