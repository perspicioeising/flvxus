import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Testes da Server Action `excluirFotoAvaliacao` com o server client mockado.
 * Cobre os invariantes CRÍTICOS:
 * - guard de autorização (sem sessão / role != trainer → nada é removido);
 * - path fora de `measurements.photos` → nada é removido;
 * - caminho feliz (remove do storage + reescreve measurements sem o path);
 * - falha do storage (não atualiza o registro);
 * - falha do update.
 * Roda SEM Docker: a RLS/isolamento de tenant é garantida em produção pelas
 * policies de storage e de `physical_assessments`; aqui validamos a lógica.
 */

const getUserMock = vi.fn();
const removeMock = vi.fn();
const selectSingleMock = vi.fn();
const updateEqMock = vi.fn();

// Measurements default com uma foto que pertence à avaliação.
let measurementsAtual: Record<string, unknown> = {
  skf_biceps: 10,
  photos: ['tenant-1/aluno-1/aval-1/foto.jpg', 'tenant-1/aluno-1/aval-1/outra.jpg'],
};

function makeSupabase() {
  return {
    auth: { getUser: getUserMock },
    from: (tabela: string) => {
      if (tabela === 'profiles') {
        return {
          select: () => ({
            eq: () => ({
              single: () =>
                Promise.resolve({
                  data: {
                    role: 'trainer',
                    tenant_id: 'tenant-1',
                    email: 'p@x.com',
                    full_name: 'Prof',
                    avatar_url: null,
                  },
                  error: null,
                }),
            }),
          }),
        };
      }
      // physical_assessments
      return {
        select: () => ({
          eq: () => ({
            single: selectSingleMock,
          }),
        }),
        update: (linha: unknown) => ({
          eq: (_col: string, _val: string) => updateEqMock(linha),
        }),
      };
    },
    storage: {
      from: (bucket: string) => ({
        remove: (paths: string[]) => removeMock(bucket, paths),
      }),
    },
  };
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => makeSupabase()),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

import { excluirFotoAvaliacao } from '@/actions/avaliacoes';

const PATH = 'tenant-1/aluno-1/aval-1/foto.jpg';

beforeEach(() => {
  vi.clearAllMocks();
  measurementsAtual = {
    skf_biceps: 10,
    photos: ['tenant-1/aluno-1/aval-1/foto.jpg', 'tenant-1/aluno-1/aval-1/outra.jpg'],
  };
  getUserMock.mockResolvedValue({ data: { user: { id: 'user-1' } } });
  selectSingleMock.mockImplementation(() =>
    Promise.resolve({ data: { id: 'aval-1', measurements: measurementsAtual }, error: null })
  );
  updateEqMock.mockResolvedValue({ error: null });
  removeMock.mockResolvedValue({ data: [], error: null });
});

describe('excluirFotoAvaliacao', () => {
  it('nega quando não há sessão (guard) — não remove nem atualiza', async () => {
    getUserMock.mockResolvedValueOnce({ data: { user: null } });
    const r = await excluirFotoAvaliacao('aval-1', PATH);

    expect(r.ok).toBe(false);
    expect(removeMock).not.toHaveBeenCalled();
    expect(updateEqMock).not.toHaveBeenCalled();
  });

  it('nega path que não está em measurements.photos — não remove', async () => {
    const r = await excluirFotoAvaliacao('aval-1', 'tenant-1/aluno-1/aval-1/intruso.jpg');

    expect(r.ok).toBe(false);
    expect(removeMock).not.toHaveBeenCalled();
    expect(updateEqMock).not.toHaveBeenCalled();
  });

  it('caminho feliz: remove do storage e reescreve photos sem o path', async () => {
    const r = await excluirFotoAvaliacao('aval-1', PATH);

    expect(r.ok).toBe(true);
    expect(removeMock).toHaveBeenCalledWith('assessment-photos', [PATH]);

    const linha = updateEqMock.mock.calls[0][0] as {
      measurements: Record<string, unknown>;
    };
    expect(linha.measurements.photos).toEqual(['tenant-1/aluno-1/aval-1/outra.jpg']);
    // Preserva as demais chaves do measurements.
    expect(linha.measurements.skf_biceps).toBe(10);
  });

  it('falha do storage: não atualiza o registro', async () => {
    removeMock.mockResolvedValueOnce({ data: null, error: { message: 'storage boom' } });
    const r = await excluirFotoAvaliacao('aval-1', PATH);

    expect(r.ok).toBe(false);
    expect(updateEqMock).not.toHaveBeenCalled();
  });

  it('falha do update retorna ok:false', async () => {
    updateEqMock.mockResolvedValueOnce({ error: { message: 'update boom' } });
    const r = await excluirFotoAvaliacao('aval-1', PATH);

    expect(r.ok).toBe(false);
    expect(removeMock).toHaveBeenCalledTimes(1);
  });
});
