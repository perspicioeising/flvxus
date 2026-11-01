import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import { ExercisePicker, type ExercicioDisponivel } from './exercise-picker';

afterEach(cleanup);

const EXERCICIOS: ExercicioDisponivel[] = [
  { id: 'e1', name: 'Supino reto', muscle_groups: ['Peito'] },
  { id: 'e2', name: 'Agachamento', muscle_groups: ['Pernas'] },
  { id: 'e3', name: 'Remada curvada', muscle_groups: ['Costas'] },
  { id: 'e4', name: 'Rosca direta', muscle_groups: ['Braços'] },
];

/** Abre o diálogo clicando no gatilho. */
function abrir() {
  fireEvent.click(screen.getByRole('button', { name: 'Adicionar exercício' }));
}

/** Checkbox de um exercício pelo nome (o rótulo inclui o nome + badges). */
function checkbox(nome: string) {
  return screen.getByRole('checkbox', { name: new RegExp(nome) });
}

/** Mesma busca, mas devolve null quando o exercício não está na lista. */
function queryCheckbox(nome: string) {
  return screen.queryByRole('checkbox', { name: new RegExp(nome) });
}

describe('ExercisePicker', () => {
  it('marcar 3 exercícios mostra o contador, adiciona na ordem exibida e fecha', () => {
    const onAdicionar = vi.fn();
    render(<ExercisePicker exercicios={EXERCICIOS} onAdicionar={onAdicionar} />);
    abrir();

    // Marca 3 exercícios (ordem de clique diferente da ordem exibida).
    fireEvent.click(checkbox('Remada curvada'));
    fireEvent.click(checkbox('Supino reto'));
    fireEvent.click(checkbox('Rosca direta'));

    // Contador e rótulo do botão refletem N = 3 (critério 7).
    const botao = screen.getByRole('button', { name: 'Adicionar 3 exercícios' });
    expect(botao).toBeEnabled();

    fireEvent.click(botao);

    expect(onAdicionar).toHaveBeenCalledTimes(1);
    const enviados = onAdicionar.mock.calls[0][0] as ExercicioDisponivel[];
    // Ordem = ordem da lista exibida (e1, e3, e4), não a ordem de clique.
    expect(enviados.map((e) => e.id)).toEqual(['e1', 'e3', 'e4']);

    // Diálogo fechou: o botão de confirmar não está mais no documento.
    expect(
      screen.queryByRole('button', { name: /Adicionar 3 exercícios/ })
    ).not.toBeInTheDocument();
  });

  it('com 0 marcados o botão fica desabilitado', () => {
    const onAdicionar = vi.fn();
    render(<ExercisePicker exercicios={EXERCICIOS} onAdicionar={onAdicionar} />);
    abrir();

    expect(
      screen.getByRole('button', { name: 'Adicionar 0 exercícios' })
    ).toBeDisabled();
  });

  it('busca filtra a lista e a seleção persiste ao filtrar (critério 8)', () => {
    const onAdicionar = vi.fn();
    render(<ExercisePicker exercicios={EXERCICIOS} onAdicionar={onAdicionar} />);
    abrir();

    // Marca um exercício e depois filtra escondendo-o da lista.
    fireEvent.click(checkbox('Supino reto'));
    expect(
      screen.getByRole('button', { name: 'Adicionar 1 exercício' })
    ).toBeEnabled();

    const busca = screen.getByPlaceholderText('Nome do exercício');
    fireEvent.change(busca, { target: { value: 'agacha' } });

    // A lista agora só mostra o Agachamento, mas a seleção do Supino persiste.
    expect(queryCheckbox('Supino reto')).not.toBeInTheDocument();
    expect(checkbox('Agachamento')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Adicionar 1 exercício' })
    ).toBeEnabled();

    // Limpa o filtro: o Supino volta e continua marcado.
    fireEvent.change(busca, { target: { value: '' } });
    fireEvent.click(checkbox('Agachamento'));
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar 2 exercícios' }));

    const enviados = onAdicionar.mock.calls[0][0] as ExercicioDisponivel[];
    expect(enviados.map((e) => e.id)).toEqual(['e1', 'e2']);
  });
});
