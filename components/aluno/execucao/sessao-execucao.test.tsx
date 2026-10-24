import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';

import { SessaoExecucao, type ItemExecucao } from './sessao-execucao';

// Mock das Server Actions: o teste foca no fluxo de UI de edição, não no banco.
const registrarSerie = vi.fn(async (_arg: unknown) => ({ ok: true, id: 'log-1' }));
const iniciarSessao = vi.fn(async (..._args: unknown[]) => ({
  ok: true,
  id: 'sess-1',
}));
const finalizarSessao = vi.fn(async (_arg: unknown) => ({ ok: true, id: 'sess-1' }));

vi.mock('@/actions/execucao', () => ({
  registrarSerie: (arg: unknown) => registrarSerie(arg),
  // Repassa TODOS os argumentos: o eixo divisão chama `iniciarSessao(planId,
  // divisao)`, e o caminho legado chama `iniciarSessao(planId)` (um argumento).
  iniciarSessao: (...args: unknown[]) => iniciarSessao(...args),
  finalizarSessao: (arg: unknown) => finalizarSessao(arg),
}));

const toast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  toast: (arg: unknown) => toast(arg),
}));

// `push` inspecionável para checar o destino de navegação (fluxo professor usa
// `destinoAoFinalizar`). `vi.clearAllMocks()` no beforeEach zera entre casos.
const push = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, refresh: vi.fn() }),
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

  it('não reabre o modal de descanso ao apenas editar uma série antiga', async () => {
    // Item COM descanso prescrito e 2 séries: concluir a série 1 (que NÃO é a
    // última) abre o modal de descanso auto-iniciado (60s). Fechar o modal e
    // depois editar uma série JÁ concluída não deve reabrir o modal — isso é
    // reservado à conclusão de uma série nova.
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      const view = render(
        <SessaoExecucao
          planId="plan-1"
          itens={[itemFake({ descansoSegundos: 60 })]}
        />
      );

      // Conclui a série 1 (o resumo somente-leitura aparece atrás do modal).
      const inputReps = screen.getByLabelText('Reps') as HTMLInputElement;
      fireEvent.change(inputReps, { target: { value: '10' } });
      fireEvent.click(screen.getByRole('button', { name: /concluir série/i }));

      // O modal de descanso abre com o anel/timer a partir de 1:00.
      const modal = await screen.findByRole('dialog', { name: /descanso/i });
      expect(within(modal).getByText('1:00')).toBeInTheDocument();

      // Deixa o timer contar 3 segundos → 0:57 (reset por série preservado).
      await vi.advanceTimersByTimeAsync(3000);
      expect(within(modal).getByText('0:57')).toBeInTheDocument();

      // Pular descanso fecha o modal e volta o fluxo para a próxima série.
      fireEvent.click(
        within(modal).getByRole('button', { name: /pular descanso/i })
      );
      await waitFor(() =>
        expect(
          screen.queryByRole('dialog', { name: /descanso/i })
        ).not.toBeInTheDocument()
      );

      // Edita a série 1 (já concluída) e salva: o modal NÃO deve reabrir.
      fireEvent.click(screen.getByRole('button', { name: 'Editar série 1' }));
      fireEvent.click(screen.getByRole('button', { name: 'Salvar série 1' }));
      await screen.findByRole('button', { name: 'Editar série 1' });

      expect(
        screen.queryByRole('dialog', { name: /descanso/i })
      ).not.toBeInTheDocument();

      // Desmonta antes de restaurar os timers reais: evita que o intervalo do
      // TimerDescanso dispare fora de act() após o fim do teste.
      view.unmount();
    } finally {
      vi.useRealTimers();
    }
  });

  it('não abre o modal de descanso na última série do único exercício', async () => {
    // Exercício único com descanso prescrito: concluir a ÚLTIMA série (sem
    // próxima série nem próximo exercício) NÃO deve abrir o modal — segue o
    // fluxo de finalizar. Usamos 1 série para isolar essa borda.
    render(
      <SessaoExecucao
        planId="plan-1"
        itens={[itemFake({ sets: 1, descansoSegundos: 60 })]}
      />
    );

    const inputReps = screen.getByLabelText('Reps') as HTMLInputElement;
    fireEvent.change(inputReps, { target: { value: '10' } });
    fireEvent.click(screen.getByRole('button', { name: /concluir série/i }));

    // A série entra no resumo (confirma que a conclusão ocorreu)…
    await screen.findByRole('button', { name: 'Editar série 1' });
    // …e o modal de descanso NÃO abre (é a última série do último exercício).
    expect(
      screen.queryByRole('dialog', { name: /descanso/i })
    ).not.toBeInTheDocument();
  });
});

describe('SessaoExecucao — eixo de agrupamento (divisão vs. dia)', () => {
  it('ficha por divisão mostra o SeletorDivisao e filtra os itens da divisão ativa', () => {
    render(
      <SessaoExecucao
        planId="plan-1"
        itens={[
          itemFake({ id: 'a1', nome: 'Supino A', division: 'A', weekday: null }),
          itemFake({ id: 'b1', nome: 'Agacho B', division: 'B', weekday: null }),
        ]}
      />
    );

    // Seletor de DIVISÃO presente (e não o de dia).
    expect(
      screen.getByRole('group', { name: 'Escolha a divisão do treino' })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('group', { name: 'Escolha o dia do treino' })
    ).not.toBeInTheDocument();

    // Abre na primeira divisão ('A'): só o item da divisão A está visível.
    expect(screen.getByText('Supino A')).toBeInTheDocument();
    expect(screen.queryByText('Agacho B')).not.toBeInTheDocument();
  });

  it('ficha por divisão carimba a divisão ativa ao concluir a primeira série', async () => {
    render(
      <SessaoExecucao
        planId="plan-1"
        itens={[
          itemFake({ id: 'a1', nome: 'Supino A', division: 'A', weekday: null }),
          itemFake({ id: 'b1', nome: 'Agacho B', division: 'B', weekday: null }),
        ]}
      />
    );

    await concluirSerieAtual('10');

    expect(iniciarSessao).toHaveBeenCalledWith('plan-1', 'A');
  });

  it('ao trocar de divisão, mostra os itens da nova divisão', () => {
    render(
      <SessaoExecucao
        planId="plan-1"
        itens={[
          itemFake({ id: 'a1', nome: 'Supino A', division: 'A', weekday: null }),
          itemFake({ id: 'b1', nome: 'Agacho B', division: 'B', weekday: null }),
        ]}
      />
    );

    const seletor = screen.getByRole('group', {
      name: 'Escolha a divisão do treino',
    });
    fireEvent.click(within(seletor).getByText(/^B/));

    expect(screen.getByText('Agacho B')).toBeInTheDocument();
    expect(screen.queryByText('Supino A')).not.toBeInTheDocument();
  });

  it('ficha legada por dia chama iniciarSessao com UM argumento (regressão)', async () => {
    // Dois dias para garantir que o SeletorDia aparece (auto-esconde com ≤ 1).
    render(
      <SessaoExecucao
        planId="plan-1"
        itens={[
          itemFake({ id: 'd1', nome: 'Supino seg', weekday: 1 }),
          itemFake({ id: 'd2', nome: 'Agacho ter', weekday: 2 }),
        ]}
      />
    );

    // Seletor de DIA presente (e não o de divisão).
    expect(
      screen.getByRole('group', { name: 'Escolha o dia do treino' })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('group', { name: 'Escolha a divisão do treino' })
    ).not.toBeInTheDocument();

    await concluirSerieAtual('10');

    // UM único argumento — fichas legadas não carimbam divisão.
    expect(iniciarSessao).toHaveBeenCalledWith('plan-1');
  });
});

describe('SessaoExecucao — executado pelo professor (treino presencial)', () => {
  it('ficha por divisão carimba o aluno-alvo (3º arg) no iniciarSessao', async () => {
    render(
      <SessaoExecucao
        planId="plan-1"
        studentId="aluno-99"
        itens={[
          itemFake({ id: 'a1', nome: 'Supino A', division: 'A', weekday: null }),
          itemFake({ id: 'b1', nome: 'Agacho B', division: 'B', weekday: null }),
        ]}
      />
    );

    await concluirSerieAtual('10');

    // 3º argumento = user_id do ALUNO em cujo nome o professor registra.
    expect(iniciarSessao).toHaveBeenCalledWith('plan-1', 'A', 'aluno-99');
  });

  it('ficha legada por dia carimba o aluno-alvo com division undefined', async () => {
    render(
      <SessaoExecucao
        planId="plan-1"
        studentId="aluno-99"
        itens={[
          itemFake({ id: 'd1', nome: 'Supino seg', weekday: 1 }),
          itemFake({ id: 'd2', nome: 'Agacho ter', weekday: 2 }),
        ]}
      />
    );

    await concluirSerieAtual('10');

    // Fichas legadas não carimbam divisão, mas ainda passam o aluno-alvo.
    expect(iniciarSessao).toHaveBeenCalledWith('plan-1', undefined, 'aluno-99');
  });

  it('ao finalizar, navega para destinoAoFinalizar (ficha do aluno no professor)', async () => {
    render(
      <SessaoExecucao
        planId="plan-1"
        studentId="aluno-99"
        destinoAoFinalizar="/professor/alunos/aluno-99"
        itens={[itemFake()]}
      />
    );

    // Cria a sessão concluindo uma série (senão o finalizar é no-op sem id).
    await concluirSerieAtual('10');

    // Aguarda a transição de `registrarSerie` encerrar: enquanto `pendente`
    // (useTransition) é true, o gatilho "Finalizar treino" fica disabled e o
    // Radix não abre o diálogo.
    const gatilho = screen.getByRole('button', { name: /finalizar treino/i });
    await waitFor(() => expect(gatilho).not.toBeDisabled());

    // Abre o diálogo de finalização e confirma.
    fireEvent.click(gatilho);
    fireEvent.click(await screen.findByRole('button', { name: /^finalizar$/i }));

    // finalizarSessao resolve e navega para o destino do professor.
    await waitFor(() => {
      expect(finalizarSessao).toHaveBeenCalledTimes(1);
      expect(push).toHaveBeenCalledWith('/professor/alunos/aluno-99');
    });
  });
});
