import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';

import { SessaoExecucao, type ItemExecucao } from './sessao-execucao';

// Mock das Server Actions: o teste foca no fluxo de UI de edição, não no banco.
const registrarSerie = vi.fn(async (_arg: unknown) => ({ ok: true, id: 'log-1' }));
const iniciarSessao = vi.fn(async (_arg: unknown) => ({ ok: true, id: 'sess-1' }));
const finalizarSessao = vi.fn(async (_arg: unknown) => ({ ok: true, id: 'sess-1' }));

vi.mock('@/actions/execucao', () => ({
  registrarSerie: (arg: unknown) => registrarSerie(arg),
  iniciarSessao: (arg: unknown) => iniciarSessao(arg),
  finalizarSessao: (arg: unknown) => finalizarSessao(arg),
}));

const toast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  toast: (arg: unknown) => toast(arg),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

/** Item mínimo de 2 séries, sem descanso prescrito (evita o timer no DOM). */
function itemFake(overrides: Partial<ItemExecucao> = {}): ItemExecucao {
  return {
    id: 'item-1',
    nome: 'Supino reto',
    weekday: null,
    sets: 2,
    reps: '10',
    cargaAlvo: 20,
    descansoSegundos: null,
    observacoes: null,
    instrucoes: null,
    dicas: [],
    errosComuns: [],
    gruposMusculares: [],
    equipamento: [],
    videoUrl: null,
    thumbnailUrl: null,
    ...overrides,
  };
}

/** Conclui a série atual preenchendo reps e clicando em "Concluir série". */
async function concluirSerieAtual(reps: string) {
  const inputReps = screen.getByLabelText('Reps') as HTMLInputElement;
  fireEvent.change(inputReps, { target: { value: reps } });
  fireEvent.click(screen.getByRole('button', { name: /concluir série/i }));
  // Aguarda a transição (registrarSerie) resolver e o estado atualizar.
  await screen.findByLabelText('Editar série 1');
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe('SessaoExecucao — editar série já concluída', () => {
  it('conclui a série 1 e a exibe no resumo somente-leitura', async () => {
    render(<SessaoExecucao planId="plan-1" itens={[itemFake()]} />);

    await concluirSerieAtual('10');

    const resumo = screen.getByLabelText('Séries concluídas');
    expect(within(resumo).getByText(/10 reps/)).toBeInTheDocument();
    expect(within(resumo).getByText(/20 kg/)).toBeInTheDocument();
    // Botão de editar disponível na série concluída.
    expect(
      screen.getByRole('button', { name: 'Editar série 1' })
    ).toBeInTheDocument();
  });

  it('reabre a série concluída com os inputs pré-preenchidos ao clicar em Editar', async () => {
    render(<SessaoExecucao planId="plan-1" itens={[itemFake()]} />);

    await concluirSerieAtual('10');

    fireEvent.click(screen.getByRole('button', { name: 'Editar série 1' }));

    // O input de reps da série 1 reabre com o valor atual (10).
    const inputRepsEdicao = document.getElementById(
      'item-1:1-reps'
    ) as HTMLInputElement;
    expect(inputRepsEdicao).toBeTruthy();
    expect(inputRepsEdicao.value).toBe('10');
    const inputCargaEdicao = document.getElementById(
      'item-1:1-carga'
    ) as HTMLInputElement;
    expect(inputCargaEdicao.value).toBe('20');

    expect(
      screen.getByRole('button', { name: 'Salvar série 1' })
    ).toBeInTheDocument();
  });

  it('salva a edição via registrarSerie com completed:true e volta ao resumo corrigido', async () => {
    render(<SessaoExecucao planId="plan-1" itens={[itemFake()]} />);

    await concluirSerieAtual('10');
    registrarSerie.mockClear();

    fireEvent.click(screen.getByRole('button', { name: 'Editar série 1' }));

    const inputRepsEdicao = document.getElementById(
      'item-1:1-reps'
    ) as HTMLInputElement;
    fireEvent.change(inputRepsEdicao, { target: { value: '12' } });

    fireEvent.click(screen.getByRole('button', { name: 'Salvar série 1' }));

    // Volta ao resumo (botão Editar reaparece) com o valor corrigido.
    await screen.findByRole('button', { name: 'Editar série 1' });

    expect(registrarSerie).toHaveBeenCalledTimes(1);
    expect(registrarSerie).toHaveBeenCalledWith(
      expect.objectContaining({
        plan_item_id: 'item-1',
        set_number: 1,
        reps_done: '12',
        completed: true,
      })
    );

    const resumo = screen.getByLabelText('Séries concluídas');
    expect(within(resumo).getByText(/12 reps/)).toBeInTheDocument();
  });

  it('não reinicia o timer de descanso ao apenas editar uma série antiga', async () => {
    // Item COM descanso prescrito: concluir a série dispara o timer (60s). Ao
    // editar uma série JÁ concluída, o timer não deve remontar/reiniciar — isso
    // é reservado à conclusão de uma série nova.
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      const view = render(
        <SessaoExecucao
          planId="plan-1"
          itens={[itemFake({ descansoSegundos: 60 })]}
        />
      );

      await concluirSerieAtual('10');

      // O timer de descanso aparece e conta a partir de 1:00.
      expect(screen.getByText('1:00')).toBeInTheDocument();

      // Deixa o timer contar 3 segundos → 0:57.
      await vi.advanceTimersByTimeAsync(3000);
      expect(screen.getByText('0:57')).toBeInTheDocument();

      // Edita a série 1 (já concluída) e salva: o timer NÃO deve voltar a 1:00.
      fireEvent.click(screen.getByRole('button', { name: 'Editar série 1' }));
      fireEvent.click(screen.getByRole('button', { name: 'Salvar série 1' }));
      await screen.findByRole('button', { name: 'Editar série 1' });

      expect(screen.queryByText('1:00')).not.toBeInTheDocument();
      // Segue contando do ponto anterior (≈0:57 ou menos), nunca reiniciado.
      expect(screen.getByText(/0:5[0-9]/)).toBeInTheDocument();

      // Desmonta antes de restaurar os timers reais: evita que o intervalo do
      // TimerDescanso dispare fora de act() após o fim do teste.
      view.unmount();
    } finally {
      vi.useRealTimers();
    }
  });
});
