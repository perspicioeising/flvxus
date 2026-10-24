import type * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import { DialogAvaliacaoTreino } from './dialog-avaliacao-treino';

afterEach(cleanup);

/** Props padrão com spies; cada teste sobrescreve o que precisar. */
function setup(overrides: Partial<React.ComponentProps<typeof DialogAvaliacaoTreino>> = {}) {
  const onIntensidadeChange = vi.fn();
  const onNotaChange = vi.fn();
  const onConfirmar = vi.fn();
  render(
    <DialogAvaliacaoTreino
      seriesFeitas={3}
      seriesTotal={3}
      tudoFeito
      intensidade={null}
      onIntensidadeChange={onIntensidadeChange}
      nota=""
      onNotaChange={onNotaChange}
      onConfirmar={onConfirmar}
      finalizando={false}
      {...overrides}
    />
  );
  return { onIntensidadeChange, onNotaChange, onConfirmar };
}

/** Abre o diálogo clicando no gatilho "Finalizar treino". */
function abrir() {
  fireEvent.click(screen.getByRole('button', { name: /finalizar treino/i }));
}

describe('DialogAvaliacaoTreino', () => {
  it('abre o diálogo com título, escala RPE acessível e observações', async () => {
    setup();
    abrir();

    expect(
      await screen.findByText('Como foi o treino?')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('group', { name: 'Intensidade do treino' })
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Observações (opcional)')).toBeInTheDocument();
  });

  it('marca o RPE ao tocar num valor (chama onIntensidadeChange com o valor)', async () => {
    const { onIntensidadeChange } = setup();
    abrir();

    fireEvent.click(await screen.findByRole('button', { name: 'Intensidade 7' }));
    expect(onIntensidadeChange).toHaveBeenCalledWith(7);
  });

  it('desmarca o RPE ao tocar no valor já ativo (toggle → null)', async () => {
    const { onIntensidadeChange } = setup({ intensidade: 7 });
    abrir();

    const botao = await screen.findByRole('button', { name: 'Intensidade 7' });
    expect(botao).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(botao);
    expect(onIntensidadeChange).toHaveBeenCalledWith(null);
  });

  it('permite finalizar SEM RPE/nota (chama onConfirmar)', async () => {
    const { onConfirmar } = setup({ intensidade: null, nota: '' });
    abrir();

    fireEvent.click(await screen.findByRole('button', { name: /^finalizar$/i }));
    expect(onConfirmar).toHaveBeenCalledTimes(1);
  });

  it('propaga a observação digitada via onNotaChange', async () => {
    const { onNotaChange } = setup();
    abrir();

    const textarea = await screen.findByLabelText('Observações (opcional)');
    fireEvent.change(textarea, { target: { value: 'Treino pesado' } });
    expect(onNotaChange).toHaveBeenCalledWith('Treino pesado');
  });
});
