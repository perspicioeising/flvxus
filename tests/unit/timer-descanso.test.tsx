import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import { TimerDescanso } from '@/components/aluno/execucao/timer-descanso';

afterEach(() => {
  cleanup();
});

describe('TimerDescanso — callbacks de modal', () => {
  it('chama onPular ao tocar "Pular descanso"', () => {
    const onPular = vi.fn();
    const onConcluir = vi.fn();

    render(
      <TimerDescanso
        segundos={60}
        autoIniciar
        onPular={onPular}
        onConcluir={onConcluir}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /pular descanso/i }));

    expect(onPular).toHaveBeenCalledTimes(1);
    expect(onConcluir).not.toHaveBeenCalled();
  });

  it('chama onConcluir quando o tempo chega a zero', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      const onConcluir = vi.fn();
      const onPular = vi.fn();

      render(
        <TimerDescanso
          segundos={3}
          autoIniciar
          onConcluir={onConcluir}
          onPular={onPular}
        />
      );

      // Começa em 0:03.
      expect(screen.getByText('0:03')).toBeInTheDocument();

      // Avança além do total: o timer zera e avisa o pai.
      await vi.advanceTimersByTimeAsync(3000);

      expect(screen.getByText('0:00')).toBeInTheDocument();
      expect(onConcluir).toHaveBeenCalledTimes(1);
      expect(onPular).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  it('ajusta o tempo exibido com −15s/+15s', () => {
    render(<TimerDescanso segundos={60} />);

    // Sem auto-iniciar, fica parado em 1:00.
    expect(screen.getByText('1:00')).toBeInTheDocument();

    // Os dois botões "15s" (−/+) só se distinguem pela ordem: o primeiro é o
    // −15s e o segundo o +15s.
    const botoes15s = screen.getAllByRole('button', { name: /15s/i });
    expect(botoes15s).toHaveLength(2);
    const [menos15, mais15] = botoes15s;

    fireEvent.click(mais15);
    expect(screen.getByText('1:15')).toBeInTheDocument();

    fireEvent.click(menos15);
    expect(screen.getByText('1:00')).toBeInTheDocument();
  });
});
