import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import { GerarDietaIa } from './gerar-dieta';

vi.mock('@/hooks/use-toast', () => ({ toast: vi.fn() }));
vi.mock('@/actions/ia', () => ({ gerarDieta: vi.fn() }));

afterEach(cleanup);

const ALUNOS = [{ user_id: 'aluno-1', full_name: 'Ana' }];

describe('GerarDietaIa — seletor de aluno', () => {
  it('mostra o rótulo "Aluno" por padrão (professional)', () => {
    render(<GerarDietaIa alunos={ALUNOS} />);
    expect(screen.getByText('Aluno')).toBeInTheDocument();
  });

  it('esconde o seletor de aluno quando alunoFixo está presente', () => {
    render(<GerarDietaIa alunos={[]} alunoFixo="user-self" />);
    expect(screen.queryByText('Aluno')).not.toBeInTheDocument();
    // E o bloco "cadastre um aluno" NÃO aparece para o autônomo; os campos
    // Objetivo/Restrições seguem renderizados.
    expect(screen.getByText('Objetivo')).toBeInTheDocument();
    expect(screen.queryByText(/cadastre um aluno/i)).not.toBeInTheDocument();
  });
});
