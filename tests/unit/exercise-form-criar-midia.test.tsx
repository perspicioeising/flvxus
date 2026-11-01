import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';

import { ExerciseForm } from '@/components/professor/exercicios/exercise-form';

/**
 * Testes do fluxo de CRIAÇÃO com mídia no form (create-then-upload). Mocka as
 * Server Actions, o client de browser do Supabase e o router — nada sobe de
 * verdade. Cobre: (a) selecionar vídeo+thumb cria o exercício e, com o id
 * retornado, roda signed URL → uploadToSignedUrl → confirmação na ordem certa;
 * (b) criar SEM arquivo não chama as actions de upload; (c) falha de upload
 * mostra toast mas ainda redireciona.
 */

const toast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({ toast: (arg: unknown) => toast(arg) }));

const push = vi.fn();
const refresh = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push, refresh }) }));

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

const EXERCISE_ID = 'ex-novo';
const VIDEO_PATH = 'tenant-1/ex-novo/video-demo.mp4';
const THUMB_PATH = 'tenant-1/ex-novo/thumbnail-capa.png';

/** Cria um File com `size` controlado (sem escrever bytes reais). */
function fileComTamanho(name: string, type: string, size: number): File {
  const file = new File(['x'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
}

/** Preenche nome + ao menos um grupo muscular (requisitos do schema). */
function preencherObrigatorios() {
  fireEvent.change(screen.getByLabelText('Nome do exercício'), {
    target: { value: 'Supino reto' },
  });
  // Grupo muscular: clica num chip de sugestão.
  fireEvent.click(screen.getByRole('button', { name: 'Peito', pressed: false }));
}

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  vi.clearAllMocks();
  criarUploadUrlMock.mockImplementation(async (_id: string, kind: string) => ({
    ok: true,
    bucket: 'exercise-videos',
    url: 'https://signed.example/upload',
    token: kind === 'video' ? 'tok-video' : 'tok-thumb',
    path: kind === 'video' ? VIDEO_PATH : THUMB_PATH,
  }));
  uploadToSignedUrlMock.mockResolvedValue({ data: { path: VIDEO_PATH }, error: null });
  confirmarMock.mockResolvedValue({ ok: true, message: 'Mídia enviada.' });
});

describe('ExerciseForm (criar) — mídia no fluxo de criação', () => {
  it('cria o exercício e envia vídeo+thumb pelo pipeline de signed URL', async () => {
    const onSubmitAction = vi.fn().mockResolvedValue({ ok: true, id: EXERCISE_ID });
    render(
      <ExerciseForm
        modo="criar"
        onSubmitAction={onSubmitAction}
        redirecionarPara="/professor/exercicios"
      />
    );

    preencherObrigatorios();

    fireEvent.change(
      screen.getByLabelText('Vídeo demonstrativo (opcional)'),
      { target: { files: [fileComTamanho('demo.mp4', 'video/mp4', 1024)] } }
    );
    fireEvent.change(
      screen.getByLabelText('Imagem (thumbnail) (opcional)'),
      { target: { files: [fileComTamanho('capa.png', 'image/png', 1024)] } }
    );

    fireEvent.click(screen.getByRole('button', { name: /Criar exercício/i }));

    await waitFor(() => {
      expect(onSubmitAction).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(confirmarMock).toHaveBeenCalledTimes(2);
    });

    // Upload acontece DEPOIS da criação, com o id retornado.
    expect(criarUploadUrlMock).toHaveBeenCalledWith(EXERCISE_ID, 'video', {
      name: 'demo.mp4',
      size: 1024,
      type: 'video/mp4',
    });
    expect(criarUploadUrlMock).toHaveBeenCalledWith(EXERCISE_ID, 'thumbnail', {
      name: 'capa.png',
      size: 1024,
      type: 'image/png',
    });
    expect(uploadToSignedUrlMock).toHaveBeenCalledTimes(2);
    expect(confirmarMock).toHaveBeenCalledWith(EXERCISE_ID, 'video', VIDEO_PATH);
    expect(confirmarMock).toHaveBeenCalledWith(EXERCISE_ID, 'thumbnail', THUMB_PATH);
    expect(push).toHaveBeenCalledWith('/professor/exercicios');
  });

  it('cria sem arquivo e NÃO chama as actions de upload', async () => {
    const onSubmitAction = vi.fn().mockResolvedValue({ ok: true, id: EXERCISE_ID });
    render(
      <ExerciseForm
        modo="criar"
        onSubmitAction={onSubmitAction}
        redirecionarPara="/professor/exercicios"
      />
    );

    preencherObrigatorios();
    fireEvent.click(screen.getByRole('button', { name: /Criar exercício/i }));

    await waitFor(() => {
      expect(onSubmitAction).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith('/professor/exercicios');
    });

    expect(criarUploadUrlMock).not.toHaveBeenCalled();
    expect(uploadToSignedUrlMock).not.toHaveBeenCalled();
    expect(confirmarMock).not.toHaveBeenCalled();
  });

  it('falha de upload mostra toast de erro mas ainda redireciona', async () => {
    const onSubmitAction = vi.fn().mockResolvedValue({ ok: true, id: EXERCISE_ID });
    uploadToSignedUrlMock.mockResolvedValueOnce({ data: null, error: { message: 'falhou' } });

    render(
      <ExerciseForm
        modo="criar"
        onSubmitAction={onSubmitAction}
        redirecionarPara="/professor/exercicios"
      />
    );

    preencherObrigatorios();
    fireEvent.change(
      screen.getByLabelText('Vídeo demonstrativo (opcional)'),
      { target: { files: [fileComTamanho('demo.mp4', 'video/mp4', 1024)] } }
    );

    fireEvent.click(screen.getByRole('button', { name: /Criar exercício/i }));

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith('/professor/exercicios');
    });
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ variant: 'destructive' })
    );
  });
});
