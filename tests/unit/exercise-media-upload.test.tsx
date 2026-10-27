import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';

import { ExerciseMediaUpload } from '@/components/professor/exercicios/exercise-media-upload';

/**
 * Testes do componente de upload DIRETO (signed upload URL). Mocka as Server
 * Actions e o client de browser do Supabase — o arquivo NUNCA sobe de verdade.
 * Cobre: bloqueio no cliente para arquivo acima do limite (não chama a action) e
 * o caminho feliz na ordem pedir-URL → uploadToSignedUrl → confirmar.
 */

const toast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({ toast: (arg: unknown) => toast(arg) }));

const refresh = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh }) }));

const criarUploadUrlMock = vi.fn();
const confirmarMock = vi.fn();
vi.mock('@/actions/exercicios', () => ({
  criarUploadUrlMidiaExercicio: (...args: unknown[]) => criarUploadUrlMock(...args),
  confirmarMidiaExercicio: (...args: unknown[]) => confirmarMock(...args),
}));

const uploadToSignedUrlMock = vi.fn();
const storageFromMock = vi.fn(() => ({ uploadToSignedUrl: uploadToSignedUrlMock }));
vi.mock('@/lib/supabase/browser', () => ({
  createClient: () => ({ storage: { from: storageFromMock } }),
}));

const EXERCISE_ID = 'ex-1';
const PATH = 'tenant-1/ex-1/video-demo.mp4';

/** Cria um File com um `size` controlado (não escreve bytes reais). */
function fileComTamanho(name: string, type: string, size: number): File {
  const file = new File(['x'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
}

function selecionarArquivo(file: File) {
  const input = screen.getByLabelText('Enviar vídeo') as HTMLInputElement;
  fireEvent.change(input, { target: { files: [file] } });
}

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  vi.clearAllMocks();
  criarUploadUrlMock.mockResolvedValue({
    ok: true,
    bucket: 'exercise-videos',
    url: 'https://signed.example/upload',
    token: 'tok-123',
    path: PATH,
  });
  uploadToSignedUrlMock.mockResolvedValue({ data: { path: PATH }, error: null });
  confirmarMock.mockResolvedValue({ ok: true, message: 'Mídia enviada.' });
});

describe('ExerciseMediaUpload', () => {
  it('bloqueia vídeo acima de 50 MB antes de pedir a URL', async () => {
    render(<ExerciseMediaUpload exerciseId={EXERCISE_ID} kind="video" />);
    selecionarArquivo(fileComTamanho('grande.mp4', 'video/mp4', 50 * 1024 * 1024 + 1));

    fireEvent.click(screen.getByRole('button', { name: /Enviar/i }));

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({ variant: 'destructive' })
      );
    });
    expect(criarUploadUrlMock).not.toHaveBeenCalled();
    expect(uploadToSignedUrlMock).not.toHaveBeenCalled();
  });

  it('bloqueia tipo incompatível com o kind antes de pedir a URL', async () => {
    render(<ExerciseMediaUpload exerciseId={EXERCISE_ID} kind="video" />);
    selecionarArquivo(fileComTamanho('foto.png', 'image/png', 1024));

    fireEvent.click(screen.getByRole('button', { name: /Enviar/i }));

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({ variant: 'destructive' })
      );
    });
    expect(criarUploadUrlMock).not.toHaveBeenCalled();
  });

  it('caminho feliz: pede URL, envia direto ao Storage e confirma, em ordem', async () => {
    render(<ExerciseMediaUpload exerciseId={EXERCISE_ID} kind="video" />);
    const arquivo = fileComTamanho('demo.mp4', 'video/mp4', 10 * 1024 * 1024);
    selecionarArquivo(arquivo);

    fireEvent.click(screen.getByRole('button', { name: /Enviar/i }));

    await waitFor(() => {
      expect(confirmarMock).toHaveBeenCalled();
    });

    expect(criarUploadUrlMock).toHaveBeenCalledWith(EXERCISE_ID, 'video', {
      name: 'demo.mp4',
      size: 10 * 1024 * 1024,
      type: 'video/mp4',
    });
    expect(storageFromMock).toHaveBeenCalledWith('exercise-videos');
    expect(uploadToSignedUrlMock).toHaveBeenCalledWith(PATH, 'tok-123', arquivo, {
      contentType: 'video/mp4',
    });
    expect(confirmarMock).toHaveBeenCalledWith(EXERCISE_ID, 'video', PATH);
    expect(refresh).toHaveBeenCalled();
  });

  it('se o upload direto falha, não chama a confirmação', async () => {
    uploadToSignedUrlMock.mockResolvedValueOnce({ data: null, error: { message: 'falhou' } });
    render(<ExerciseMediaUpload exerciseId={EXERCISE_ID} kind="video" />);
    selecionarArquivo(fileComTamanho('demo.mp4', 'video/mp4', 1024));

    fireEvent.click(screen.getByRole('button', { name: /Enviar/i }));

    await waitFor(() => {
      expect(uploadToSignedUrlMock).toHaveBeenCalled();
    });
    expect(confirmarMock).not.toHaveBeenCalled();
  });
});
