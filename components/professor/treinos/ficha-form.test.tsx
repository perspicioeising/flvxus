import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import { FichaForm } from './ficha-form';
import { toast } from '@/hooks/use-toast';
import { criarFicha } from '@/actions/treinos';
import type { ItemEditavel } from './item-editor';

// Dependências externas do form que não interessam ao teste de render.
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));
vi.mock('@/hooks/use-toast', () => ({ toast: vi.fn() }));
vi.mock('@/actions/treinos', () => ({
  criarFicha: vi.fn(),
  editarFicha: vi.fn(),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

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

const EX_ID = '11111111-1111-1111-1111-111111111111';

/** Item editável mínimo com um rótulo de divisão específico. */
function itemComDivisao(division: string) {
  return {
    key: 'k1',
    exercise_id: EX_ID,
    exercise_name: 'Supino',
    sets: '',
    reps: '',
    rest_seconds: '',
    target_load: '',
    notes: '',
    weekday: null,
    division,
  };
}

describe('FichaForm — erro de divisão vai para toast pt-BR (não cru em inglês)', () => {
  it('dispara toast pt-BR e não renderiza texto em inglês quando o rótulo estoura o limite', () => {
    const toastMock = vi.mocked(toast);

    const { container } = render(
      <FichaForm
        modo="criar"
        exercicios={[]}
        alunos={ALUNOS}
        valoresIniciais={{
          student_id: 'aluno-1',
          name: 'Ficha',
          source_workout_id: null,
          itens: [itemComDivisao('x'.repeat(121))],
        }}
      />
    );

    const form = container.querySelector('form');
    expect(form).not.toBeNull();
    fireEvent.submit(form as HTMLFormElement);

    // O server action não deve ser chamado — a validação client-side barra.
    expect(vi.mocked(criarFicha)).not.toHaveBeenCalled();

    // Toast disparado com a mensagem pt-BR específica do rótulo de divisão.
    // O motivo vai na descrição (title fixo), roteando o primeiro erro de
    // validação para o mesmo canal de feedback do resto do fluxo.
    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({
        description: 'O rótulo da divisão deve ter no máximo 120 caracteres.',
        variant: 'destructive',
      })
    );

    // Nenhuma string crua do Zod em inglês vaza para a tela.
    expect(container.textContent ?? '').not.toContain('String must contain');
  });
});

/** Item editável completo e válido numa divisão. */
function itemValido(key: string, division: string): ItemEditavel {
  return {
    key,
    exercise_id: EX_ID,
    exercise_name: `Exercício ${key}`,
    sets: '3',
    reps: '10',
    rest_seconds: '60',
    target_load: '40',
    notes: '',
    weekday: null,
    division,
  };
}

describe('FichaForm — agrupamento é só apresentação (ordem preservada no submit)', () => {
  it('submeter ficha entrelaçada sem interação preserva o order_index de entrada', async () => {
    const criarMock = vi.mocked(criarFicha);
    criarMock.mockResolvedValue({ ok: true, id: 'ficha-1' });

    // Itens entrelaçados: A, B, A, C — a ordem global deve ser preservada.
    const itens = [
      itemValido('a1', 'A'),
      itemValido('b1', 'B'),
      itemValido('a2', 'A'),
      itemValido('c1', 'C'),
    ];

    const { container } = render(
      <FichaForm
        modo="criar"
        exercicios={[]}
        alunos={ALUNOS}
        valoresIniciais={{
          student_id: '22222222-2222-2222-2222-222222222222',
          name: 'Ficha',
          source_workout_id: null,
          itens,
        }}
      />
    );

    const form = container.querySelector('form');
    fireEvent.submit(form as HTMLFormElement);

    // Aguarda a resolução do submit assíncrono.
    await vi.waitFor(() => expect(criarMock).toHaveBeenCalledTimes(1));

    const payload = criarMock.mock.calls[0][0] as {
      itens: Array<{ exercise_id: string; order_index: number; division?: string }>;
    };
    // order_index sequencial e na ordem de entrada; divisões intactas.
    expect(payload.itens.map((i) => i.order_index)).toEqual([0, 1, 2, 3]);
    expect(payload.itens.map((i) => i.division)).toEqual(['A', 'B', 'A', 'C']);
  });

  it('a barra de ações usa sticky bottom-0 para ficar sempre visível', () => {
    const { container } = render(
      <FichaForm modo="criar" exercicios={[]} alunos={ALUNOS} />
    );
    const barra = container.querySelector('.sticky.bottom-0');
    expect(barra).not.toBeNull();
    // Contém o submit (Criar ficha).
    expect(barra?.textContent ?? '').toContain('Criar ficha');
  });
});
