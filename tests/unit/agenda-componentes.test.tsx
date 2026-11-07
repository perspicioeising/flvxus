import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

const push = vi.fn();
const refresh = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, refresh }),
}));
vi.mock('@/actions/agenda', () => ({
  criarCompromisso: vi.fn(),
  editarCompromisso: vi.fn(),
  cancelarCompromisso: vi.fn(),
  atualizarFusoHorario: vi.fn(),
}));
vi.mock('@/actions/habitos', () => ({
  registrarAgua: vi.fn(),
  alternarRefeicaoCumprida: vi.fn(),
}));
vi.mock('@/actions/execucao', () => ({ confirmarDescanso: vi.fn() }));

import { AgendaView } from '@/components/agenda/agenda-view';
import { AvisoFichasSemDia } from '@/components/agenda/aviso-fichas-sem-dia';
import { EscopoRecorrenciaDialog } from '@/components/agenda/escopo-recorrencia-dialog';
import type { EventoAgenda } from '@/lib/agenda/tipos';

afterEach(() => {
  cleanup();
  push.mockClear();
});

const evento: EventoAgenda = {
  chave: 'compromisso:c1:2026-11-10',
  origem: 'compromisso',
  titulo: 'Corrida no parque',
  dia: '2026-11-10',
  inicio: '2026-11-10T11:00:00.000Z',
  fim: '2026-11-10T12:00:00.000Z',
  status: 'previsto',
  acao: null,
  meta: {
    compromissoId: 'c1',
    serieId: null,
    dataOriginal: '2026-11-10',
    tzSerie: 'America/Sao_Paulo',
    kind: 'personal',
    podeEditar: true,
    recorrente: false,
  },
};

function montar(visao: 'dia' | 'semana' | 'mes' = 'dia') {
  return render(
    <AgendaView
      basePath="/aluno/agenda"
      visao={visao}
      dia="2026-11-10"
      diaInicio={visao === 'dia' ? '2026-11-10' : visao === 'semana' ? '2026-11-08' : '2026-11-01'}
      diaFim={visao === 'dia' ? '2026-11-10' : visao === 'semana' ? '2026-11-14' : '2026-11-30'}
      hoje="2026-11-10"
      tz="America/Sao_Paulo"
      agoraIso="2026-11-10T09:00:00.000Z"
      perfil="aluno"
      eventos={[evento]}
      fichasSemDia={[]}
      alunos={[]}
      fusoHref="/aluno/perfil"
    />
  );
}

describe('AgendaView', () => {
  it('mostra o compromisso do dia e o fuso atual com link para alterar', () => {
    montar('dia');
    expect(screen.getByText('Corrida no parque')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Alterar' })).toHaveAttribute('href', '/aluno/perfil');
  });

  it('troca de visão navega por ?visao=&data=', () => {
    montar('dia');
    const aba = screen.getByRole('tab', { name: 'Semana' });
    fireEvent.mouseDown(aba);
    fireEvent.click(aba);
    expect(push).toHaveBeenCalledWith('/aluno/agenda?visao=semana&data=2026-11-10');
  });

  it('anterior, próximo e Hoje navegam pela janela atual', () => {
    montar('semana');
    fireEvent.click(screen.getByRole('button', { name: 'Período anterior' }));
    expect(push).toHaveBeenLastCalledWith('/aluno/agenda?visao=semana&data=2026-11-07');
    fireEvent.click(screen.getByRole('button', { name: 'Próximo período' }));
    expect(push).toHaveBeenLastCalledWith('/aluno/agenda?visao=semana&data=2026-11-15');
    fireEvent.click(screen.getByRole('button', { name: 'Hoje' }));
    expect(push).toHaveBeenLastCalledWith('/aluno/agenda?visao=semana&data=2026-11-10');
  });
});

describe('EscopoRecorrenciaDialog', () => {
  it('oferece as 3 opções e devolve o escopo escolhido', () => {
    const onConfirmar = vi.fn();
    render(
      <EscopoRecorrenciaDialog open onOpenChange={() => {}} acao="editar" onConfirmar={onConfirmar} />
    );
    expect(screen.getByLabelText('Somente este evento')).toBeInTheDocument();
    expect(screen.getByLabelText('Este e os seguintes')).toBeInTheDocument();
    expect(screen.getByLabelText('Todos os eventos')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Este e os seguintes'));
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }));
    expect(onConfirmar).toHaveBeenCalledWith('seguintes');
  });

  it('o padrão é somente a ocorrência', () => {
    const onConfirmar = vi.fn();
    render(
      <EscopoRecorrenciaDialog open onOpenChange={() => {}} acao="cancelar" onConfirmar={onConfirmar} />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }));
    expect(onConfirmar).toHaveBeenCalledWith('ocorrencia');
  });
});

describe('AvisoFichasSemDia', () => {
  const fichas = [{ id: 'f1', name: 'Hipertrofia' }];

  it('não renderiza sem fichas', () => {
    const { container } = render(<AvisoFichasSemDia fichas={[]} autonomo />);
    expect(container).toBeEmptyDOMElement();
  });

  it('autônomo recebe o link de edição da ficha', () => {
    render(<AvisoFichasSemDia fichas={fichas} autonomo />);
    expect(screen.getByText(/Hipertrofia/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Editar ficha' })).toHaveAttribute(
      'href',
      '/professor/treinos/f1'
    );
  });

  it('aluno vinculado é orientado a pedir ao professor, sem link', () => {
    render(<AvisoFichasSemDia fichas={fichas} autonomo={false} />);
    expect(screen.getByText(/Peça ao seu professor/)).toBeInTheDocument();
    expect(screen.queryByRole('link')).toBeNull();
  });
});
