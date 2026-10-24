import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';

import { ConfirmDialog } from './confirm-dialog';

afterEach(cleanup);

describe('ConfirmDialog', () => {
  it('não fecha quando onConfirm rejeita (chamador controla)', async () => {
    const onOpenChange = vi.fn();
    const onConfirm = vi.fn(async () => {
      throw new Error('falha');
    });

    render(
      <ConfirmDialog
        open
        onOpenChange={onOpenChange}
        title="Excluir?"
        onConfirm={onConfirm}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));

    await waitFor(() => expect(onConfirm).toHaveBeenCalled());
    // Em erro, o diálogo não aciona o fechamento por conta própria.
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });

  it('cancelar pede fechamento ao chamador', () => {
    const onOpenChange = vi.fn();
    render(
      <ConfirmDialog
        open
        onOpenChange={onOpenChange}
        title="Excluir?"
        onConfirm={vi.fn()}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
