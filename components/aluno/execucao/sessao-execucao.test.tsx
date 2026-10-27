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

// Hidratação ao montar: por padrão NÃO há sessão aberta (`data:null`), então o
// componente segue com os defaults da prescrição e cria a sessão no 1º toque.
// Casos específicos sobrescrevem este mock para simular retomada.
const carregarSessaoAberta = vi.fn(async (..._args: unknown[]) => ({
  ok: true,
  data: null as null | { sessionId: string; logs: unknown[] },
}));

vi.mock('@/actions/execucao', () => ({
  registrarSerie: (arg: unknown) => registrarSerie(arg),
  // Repassa TODOS os argumentos: o eixo divisão chama `iniciarSessao(planId,
  // divisao)`, e o caminho legado chama `iniciarSessao(planId)` (um argumento).
  iniciarSessao: (...args: unknown[]) => iniciarSessao(...args),
  finalizarSessao: (arg: unknown) => finalizarSessao(arg),
  carregarSessaoAberta: (...args: unknown[]) => carregarSessaoAberta(...args),
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
  // A hidratação ao montar (carregarSessaoAberta) gate o botão enquanto resolve;
  // aguarda ficar habilitado antes de clicar.
  const botao = screen.getByRole('button', { name: /concluir série/i });
  await waitFor(() => expect(botao).not.toBeDisabled());
  fireEvent.click(botao);
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
      const botaoConcluir = screen.getByRole('button', {
        name: /concluir série/i,
      });
      await waitFor(() => expect(botaoConcluir).not.toBeDisabled());
      fireEvent.click(botaoConcluir);

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
    const botaoUltima = screen.getByRole('button', { name: /concluir série/i });
    await waitFor(() => expect(botaoUltima).not.toBeDisabled());
    fireEvent.click(botaoUltima);

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

describe('SessaoExecucao — permitirTrocaDeGrupo (foco no treino em andamento)', () => {
  it('com permitirTrocaDeGrupo=false NÃO renderiza o seletor de divisão', () => {
    render(
      <SessaoExecucao
        planId="plan-1"
        permitirTrocaDeGrupo={false}
        divisaoInicial="A"
        itens={[
          itemFake({ id: 'a1', nome: 'Supino A', division: 'A', weekday: null }),
          itemFake({ id: 'a2', nome: 'Crucifixo A', division: 'A', weekday: null }),
        ]}
      />
    );

    expect(
      screen.queryByRole('group', { name: 'Escolha a divisão do treino' })
    ).not.toBeInTheDocument();
    // Os itens entregues (só a divisão A, já filtrada pela rota) seguem visíveis.
    expect(screen.getByText('Supino A')).toBeInTheDocument();
  });

  it('com permitirTrocaDeGrupo=false NÃO renderiza o seletor de dia (legado)', () => {
    render(
      <SessaoExecucao
        planId="plan-1"
        permitirTrocaDeGrupo={false}
        diaInicial={1}
        itens={[
          itemFake({ id: 'd1', nome: 'Supino seg', weekday: 1 }),
          itemFake({ id: 'd2', nome: 'Remada seg', weekday: 1 }),
        ]}
      />
    );

    expect(
      screen.queryByRole('group', { name: 'Escolha o dia do treino' })
    ).not.toBeInTheDocument();
  });

  it('por padrão (default true) o seletor de divisão continua renderizado (professor)', () => {
    render(
      <SessaoExecucao
        planId="plan-1"
        itens={[
          itemFake({ id: 'a1', nome: 'Supino A', division: 'A', weekday: null }),
          itemFake({ id: 'b1', nome: 'Agacho B', division: 'B', weekday: null }),
        ]}
      />
    );

    expect(
      screen.getByRole('group', { name: 'Escolha a divisão do treino' })
    ).toBeInTheDocument();
  });
});

describe('SessaoExecucao — botão "Concluir série" em marca d\'água', () => {
  it('após concluir, o botão fica disabled, aria-pressed=true, opacity-50 e texto "Série concluída"', async () => {
    // 1 série: ao concluir, a "série atual" permanece na série 1 concluída,
    // então o botão principal é o estado marca d'água (não avança p/ série 2).
    render(<SessaoExecucao planId="plan-1" itens={[itemFake({ sets: 1 })]} />);

    await concluirSerieAtual('10');

    const botao = screen.getByRole('button', { name: /série concluída/i });
    expect(botao).toBeDisabled();
    expect(botao).toHaveAttribute('aria-pressed', 'true');
    expect(botao.className).toContain('opacity-50');
    expect(botao.className).toContain('pointer-events-none');
  });
});

describe('SessaoExecucao — resumo pós-treino (fluxo do aluno)', () => {
  it('ao finalizar no fluxo do aluno, navega para a rota de resumo da sessão', async () => {
    render(<SessaoExecucao planId="plan-1" itens={[itemFake()]} />);

    await concluirSerieAtual('10');

    const gatilho = screen.getByRole('button', { name: /finalizar treino/i });
    await waitFor(() => expect(gatilho).not.toBeDisabled());

    fireEvent.click(gatilho);
    fireEvent.click(await screen.findByRole('button', { name: /^finalizar$/i }));

    await waitFor(() => {
      expect(finalizarSessao).toHaveBeenCalledTimes(1);
      // sess-1 é o id devolvido pelo mock de iniciarSessao.
      expect(push).toHaveBeenCalledWith(
        '/aluno/execucao/plan-1/resumo/sess-1'
      );
    });
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

  it('ao finalizar, navega para a rota-espelho de resumo do professor (FEAT-003)', async () => {
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

    // finalizarSessao resolve e navega para a MESMA tela de resumo, na rota do
    // professor (contexto do aluno-alvo). sess-1 é o id do mock de iniciarSessao.
    await waitFor(() => {
      expect(finalizarSessao).toHaveBeenCalledTimes(1);
      expect(push).toHaveBeenCalledWith(
        '/professor/alunos/aluno-99/execucao/plan-1/resumo/sess-1'
      );
    });
  });
});

describe('SessaoExecucao — retomada de sessão aberta (hidratação)', () => {
  it('reconstrói o estado a partir dos logs da sessão aberta e NÃO cria segunda sessão', async () => {
    // A sessão aberta tem a série 1 concluída (10 reps · 20 kg). Ao montar, a
    // hidratação deve exibir essa série no resumo somente-leitura e posicionar
    // a "série atual" na 2 — sem criar sessão nova.
    carregarSessaoAberta.mockResolvedValueOnce({
      ok: true,
      data: {
        sessionId: 'sess-aberta',
        logs: [
          {
            set_number: 1,
            reps_done: 10,
            load_done: 20,
            completed: true,
            plan_item_id: 'item-1',
          },
        ],
      },
    });

    render(<SessaoExecucao planId="plan-1" itens={[itemFake({ sets: 2 })]} />);

    // A série 1 reidratada aparece no resumo de séries concluídas.
    const resumo = await screen.findByLabelText('Séries concluídas');
    expect(within(resumo).getByText(/10 reps/)).toBeInTheDocument();
    expect(within(resumo).getByText(/20 kg/)).toBeInTheDocument();

    // Posicionou na série 2 (primeira não concluída do item).
    expect(screen.getByText('Série 2 de 2')).toBeInTheDocument();

    // Conclui a série 2: usa a sessão JÁ aberta, sem chamar iniciarSessao.
    const inputReps = screen.getByLabelText('Reps') as HTMLInputElement;
    fireEvent.change(inputReps, { target: { value: '8' } });
    const botao = screen.getByRole('button', { name: /concluir série/i });
    await waitFor(() => expect(botao).not.toBeDisabled());
    fireEvent.click(botao);

    await waitFor(() =>
      expect(registrarSerie).toHaveBeenCalledWith(
        expect.objectContaining({ session_id: 'sess-aberta', set_number: 2 })
      )
    );
    // Nenhuma sessão nova foi criada — retomou a aberta.
    expect(iniciarSessao).not.toHaveBeenCalled();
  });

  it('descarta logs com plan_item_id null ou fora da divisão visível', async () => {
    carregarSessaoAberta.mockResolvedValueOnce({
      ok: true,
      data: {
        sessionId: 'sess-aberta',
        logs: [
          // Órfão (item removido) — ignorado.
          {
            set_number: 1,
            reps_done: 99,
            load_done: 99,
            completed: true,
            plan_item_id: null,
          },
          // De outro item não visível — ignorado.
          {
            set_number: 1,
            reps_done: 77,
            load_done: 77,
            completed: true,
            plan_item_id: 'outro-item',
          },
        ],
      },
    });

    render(<SessaoExecucao planId="plan-1" itens={[itemFake({ sets: 2 })]} />);

    // Deu tempo da hidratação resolver (sessão foi gravada no mapa).
    await waitFor(() =>
      expect(carregarSessaoAberta).toHaveBeenCalledTimes(1)
    );

    // Nenhuma série concluída foi reidratada (logs descartados) → sem resumo.
    expect(
      screen.queryByLabelText('Séries concluídas')
    ).not.toBeInTheDocument();
    // Segue na série 1 (nada hidratado a posicionou adiante).
    expect(screen.getByText('Série 1 de 2')).toBeInTheDocument();
  });
});
