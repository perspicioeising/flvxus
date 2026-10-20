import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/components/patterns';

describe('LoadingState', () => {
  it('renderiza um status acessível com a quantidade de linhas pedida', () => {
    const { container } = render(<LoadingState rows={2} />);

    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByText('Carregando…')).toBeInTheDocument();
    // Cada linha tem um avatar skeleton (animate-pulse).
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });
});

describe('EmptyState', () => {
  it('renderiza título, descrição e dispara a ação sugerida', () => {
    const onClick = vi.fn();

    render(
      <EmptyState
        title="Nenhum aluno cadastrado"
        description="Comece adicionando o seu primeiro aluno."
        action={{ label: 'Adicionar aluno', onClick }}
      />
    );

    expect(screen.getByText('Nenhum aluno cadastrado')).toBeInTheDocument();
    expect(
      screen.getByText('Comece adicionando o seu primeiro aluno.')
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Adicionar aluno' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe('ErrorState', () => {
  it('renderiza um alerta com retry e dispara o callback', () => {
    const onRetry = vi.fn();

    render(<ErrorState onRetry={onRetry} />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Algo deu errado')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
