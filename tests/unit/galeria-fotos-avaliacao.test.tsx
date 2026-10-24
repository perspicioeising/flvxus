import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';

import { GaleriaFotosAvaliacao } from '@/components/professor/avaliacoes/galeria-fotos-avaliacao';

// Mock de toast e router (refresh após excluir), como nos demais testes de UI.
const toast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  toast: (arg: unknown) => toast(arg),
}));

const refresh = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh }),
}));

const FOTOS = [
  { path: 'tenant-1/aluno-1/aval-1/foto-a.jpg', url: 'https://signed.example/a' },
  { path: 'tenant-1/aluno-1/aval-1/foto-b.jpg', url: 'https://signed.example/b' },
];

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GaleriaFotosAvaliacao', () => {
  it('renderiza uma miniatura acessível por foto', () => {
    render(<GaleriaFotosAvaliacao fotos={FOTOS} />);
    const ampliar = screen.getAllByRole('button', { name: 'Ampliar foto da avaliação' });
    expect(ampliar).toHaveLength(2);
  });

  it('clicar na miniatura abre o lightbox com a imagem ampliada', async () => {
    render(<GaleriaFotosAvaliacao fotos={FOTOS} />);
    fireEvent.click(screen.getAllByRole('button', { name: 'Ampliar foto da avaliação' })[0]);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    expect(screen.getByAltText('Foto da avaliação física ampliada')).toBeInTheDocument();
  });

  it('sem onExcluir, nenhum controle de excluir é renderizado', () => {
    render(<GaleriaFotosAvaliacao fotos={FOTOS} />);
    expect(
      screen.queryByRole('button', { name: 'Excluir foto da avaliação' })
    ).not.toBeInTheDocument();
  });

  it('com onExcluir, confirmar chama onExcluir uma vez com o path certo', async () => {
    const onExcluir = vi.fn(async () => ({ ok: true as const, message: 'Foto excluída.' }));
    render(<GaleriaFotosAvaliacao fotos={FOTOS} onExcluir={onExcluir} />);

    fireEvent.click(screen.getAllByRole('button', { name: 'Excluir foto da avaliação' })[0]);

    // Botão de confirmação do ConfirmDialog (rótulo "Excluir").
    const confirmar = await screen.findByRole('button', { name: 'Excluir' });
    fireEvent.click(confirmar);

    await waitFor(() => {
      expect(onExcluir).toHaveBeenCalledTimes(1);
    });
    expect(onExcluir).toHaveBeenCalledWith(FOTOS[0].path);
    expect(refresh).toHaveBeenCalled();
  });
});
