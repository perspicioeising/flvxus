import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';

import { TrocarExercicioDialog } from './trocar-exercicio-dialog';
import type { ExercicioDisponivel } from '@/components/professor/treinos/exercise-picker';

const EXERCICIOS: ExercicioDisponivel[] = [
  { id: 'ex-1', name: 'Supino reto', muscle_groups: ['Peito'] },
  { id: 'ex-2', name: 'Crucifixo', muscle_groups: ['Peito'] },
  { id: 'ex-3', name: 'Agachamento', muscle_groups: ['Pernas'] },
];

/** Abre o diálogo e devolve o nó do dialog para consultas localizadas. */
async function abrirDialogo() {
  fireEvent.click(screen.getByRole('button', { name: /trocar exercício/i }));
  return screen.findByRole('dialog', { name: /trocar exercício/i });
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe('TrocarExercicioDialog', () => {
  it('abre o diálogo ao clicar no gatilho', async () => {
    render(
      <TrocarExercicioDialog exercicios={EXERCICIOS} onTrocar={vi.fn()} />
    );

    const dialog = await abrirDialogo();
    // Lista acessível de opções de troca presente.
    expect(
      within(dialog).getByRole('list', { name: /exercícios para troca/i })
    ).toBeInTheDocument();
  });

  it('a busca por nome filtra a lista', async () => {
    render(
      <TrocarExercicioDialog exercicios={EXERCICIOS} onTrocar={vi.fn()} />
    );

    const dialog = await abrirDialogo();
    const busca = within(dialog).getByLabelText('Buscar exercício');
    fireEvent.change(busca, { target: { value: 'cruc' } });

    expect(within(dialog).getByText('Crucifixo')).toBeInTheDocument();
    expect(within(dialog).queryByText('Supino reto')).not.toBeInTheDocument();
    expect(within(dialog).queryByText('Agachamento')).not.toBeInTheDocument();
  });

  it('pré-filtra pelo grupo do exercício atual ao abrir', async () => {
    render(
      <TrocarExercicioDialog
        exercicios={EXERCICIOS}
        grupoAtual="Peito"
        exercicioAtualId="ex-1"
        onTrocar={vi.fn()}
      />
    );

    const dialog = await abrirDialogo();
    // Grupo "Peito" ativo + exercício atual (ex-1) escondido: só Crucifixo.
    await waitFor(() =>
      expect(within(dialog).getByText('Crucifixo')).toBeInTheDocument()
    );
    expect(within(dialog).queryByText('Agachamento')).not.toBeInTheDocument();
    // O próprio exercício atual não é opção de troca.
    expect(within(dialog).queryByText('Supino reto')).not.toBeInTheDocument();
  });

  it('escolher um exercício chama onTrocar com o item certo e fecha o diálogo', async () => {
    const onTrocar = vi.fn();
    render(
      <TrocarExercicioDialog exercicios={EXERCICIOS} onTrocar={onTrocar} />
    );

    const dialog = await abrirDialogo();
    fireEvent.click(within(dialog).getByText('Agachamento'));

    expect(onTrocar).toHaveBeenCalledTimes(1);
    expect(onTrocar).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'ex-3', name: 'Agachamento' })
    );
    // Fecha após a escolha (seleção única).
    await waitFor(() =>
      expect(
        screen.queryByRole('dialog', { name: /trocar exercício/i })
      ).not.toBeInTheDocument()
    );
  });
});
