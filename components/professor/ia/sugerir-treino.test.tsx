import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import { SugerirTreinoIa } from './sugerir-treino';

vi.mock('@/hooks/use-toast', () => ({ toast: vi.fn() }));
vi.mock('@/actions/ia', () => ({ sugerirTreino: vi.fn() }));

afterEach(cleanup);

describe('SugerirTreinoIa — habilitação do aluno autônomo', () => {
  it('com alunoFixo e sem alunos: botão habilitado e sem Select de aluno', () => {
    render(<SugerirTreinoIa alunos={[]} alunoFixo="user-self" />);

    const botao = screen.getByRole('button', { name: /sugerir treino com ia/i });
    expect(botao).not.toBeDisabled();

    // Abre o diálogo: o Select de aluno (rótulo "Aluno") NÃO deve existir.
    fireEvent.click(botao);
    expect(screen.queryByText('Aluno')).not.toBeInTheDocument();
    // Os demais campos seguem presentes.
    expect(screen.getByText('Objetivo')).toBeInTheDocument();
    // Sem vocabulário de liberação ("liberar para o aluno") para o autônomo.
    expect(screen.queryByText(/liberar para o aluno/i)).not.toBeInTheDocument();
    expect(
      screen.getByText('Gere um rascunho de treino. Você revisa e ajusta antes de salvar.'),
    ).toBeInTheDocument();
  });

  it('sem alunoFixo e sem alunos (professional): botão desabilitado', () => {
    render(<SugerirTreinoIa alunos={[]} />);

    const botao = screen.getByRole('button', { name: /sugerir treino com ia/i });
    expect(botao).toBeDisabled();
  });
});
