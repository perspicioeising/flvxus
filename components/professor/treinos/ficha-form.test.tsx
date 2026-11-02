import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import { FichaForm } from './ficha-form';

// Dependências externas do form que não interessam ao teste de render.
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('@/hooks/use-toast', () => ({ toast: vi.fn() }));
vi.mock('@/actions/treinos', () => ({
  criarFicha: vi.fn(),
  editarFicha: vi.fn(),
}));

afterEach(cleanup);

const ALUNOS = [{ user_id: 'aluno-1', full_name: 'Ana' }];

describe('FichaForm — seletor de aluno', () => {
  it('mostra o rótulo "Aluno" por padrão (professional)', () => {
    render(<FichaForm modo="criar" exercicios={[]} alunos={ALUNOS} />);
    expect(screen.getByText('Aluno')).toBeInTheDocument();
  });

  it('esconde o seletor de aluno quando ocultarSeletorAluno', () => {
    render(
      <FichaForm
        modo="criar"
        exercicios={[]}
        alunos={ALUNOS}
        alunoInicial="aluno-1"
        ocultarSeletorAluno
      />
    );
    expect(screen.queryByText('Aluno')).not.toBeInTheDocument();
    // O resto do form continua: campo "Nome da ficha" presente.
    expect(screen.getByText('Nome da ficha')).toBeInTheDocument();
  });
});
