import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import { AtalhosAluno } from './atalhos-aluno';
import { TreinarAlunoSelector } from './treinar-aluno-selector';

afterEach(cleanup);

const ALUNO_ID = 'aluno-1';

describe('AtalhosAluno — atalho "Treinar com o aluno"', () => {
  it('0 fichas liberadas: botão desabilitado, sem link para a rota presencial', () => {
    const { container } = render(
      <AtalhosAluno alunoId={ALUNO_ID} fichasLiberadas={[]} />
    );

    const botao = screen.getByRole('button', {
      name: /treinar com o aluno/i,
    });
    expect(botao).toBeDisabled();

    expect(container.querySelector('a[href*="/treinar/"]')).toBeNull();
  });

  it('1 ficha liberada: link direto para a rota presencial daquela ficha', () => {
    render(
      <AtalhosAluno
        alunoId={ALUNO_ID}
        fichasLiberadas={[{ id: 'ficha-a', name: 'Ficha A' }]}
      />
    );

    const link = screen.getByRole('link', { name: /treinar com o aluno/i });
    expect(link).toHaveAttribute(
      'href',
      `/professor/alunos/${ALUNO_ID}/treinar/ficha-a`
    );
  });
});

describe('TreinarAlunoSelector — 2+ fichas liberadas', () => {
  it('oferece um link para a rota presencial de CADA ficha liberada', () => {
    const fichas = [
      { id: 'ficha-a', name: 'Ficha A' },
      { id: 'ficha-b', name: 'Ficha B' },
      { id: 'ficha-c', name: 'Ficha C' },
    ];

    render(
      <TreinarAlunoSelector
        alunoId={ALUNO_ID}
        fichasLiberadas={fichas}
        defaultOpen
      />
    );

    // O conteúdo do menu é montado num portal em document.body, então
    // consultamos o documento inteiro. Cada opção é um <a> (Radix aplica
    // role="menuitem" ao asChild), por isso asserimos pelo href + texto.
    for (const ficha of fichas) {
      const href = `/professor/alunos/${ALUNO_ID}/treinar/${ficha.id}`;
      const link = document.querySelector(`a[href="${href}"]`);
      expect(link).not.toBeNull();
      expect(link).toHaveTextContent(ficha.name);
    }

    // Nenhum link deve apontar para a âncora antiga (beco sem saída).
    expect(document.querySelector('a[href="#treinos"]')).toBeNull();
  });
});
