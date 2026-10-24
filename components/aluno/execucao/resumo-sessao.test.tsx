import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import {
  ResumoSessao,
  type ResumoSessaoProps,
} from './resumo-sessao';

afterEach(cleanup);

/** Props base: sessão de 30min, 1200kg, 12 séries, 1 exercício. */
function baseProps(overrides: Partial<ResumoSessaoProps> = {}): ResumoSessaoProps {
  return {
    fichaNome: 'PPLUL',
    grupoLabel: 'A',
    inicioISO: '2024-01-01T10:00:00Z',
    fimISO: '2024-01-01T10:30:00Z',
    volumeKg: 1200,
    seriesConcluidas: 12,
    exercicios: [{ id: 'i1', nome: 'Supino', seriesConcluidas: 4 }],
    comparacao: { tipo: 'primeira' },
    conquistas: [],
    href: '/aluno/treinos',
    ...overrides,
  };
}

describe('ResumoSessao', () => {
  it('mostra a duração em destaque e o volume formatado pt-BR', () => {
    render(<ResumoSessao {...baseProps()} />);
    expect(screen.getByText('30:00')).toBeInTheDocument();
    expect(screen.getByText('1.200 kg')).toBeInTheDocument();
  });

  it('lista os exercícios executados com a contagem de séries', () => {
    render(
      <ResumoSessao
        {...baseProps({
          exercicios: [
            { id: 'i1', nome: 'Supino', seriesConcluidas: 4 },
            { id: 'i2', nome: 'Crucifixo', seriesConcluidas: 1 },
          ],
        })}
      />
    );
    expect(screen.getByText('Supino')).toBeInTheDocument();
    expect(screen.getByText('4 séries')).toBeInTheDocument();
    expect(screen.getByText('Crucifixo')).toBeInTheDocument();
    expect(screen.getByText('1 série')).toBeInTheDocument();
  });

  it('mostra "primeira sessão" quando não há comparação', () => {
    render(<ResumoSessao {...baseProps({ comparacao: { tipo: 'primeira' } })} />);
    expect(
      screen.getByText(/primeira sessão deste treino/i)
    ).toBeInTheDocument();
  });

  it('mostra "sem sessão recente comparável" quando há anteriores sem séries', () => {
    render(
      <ResumoSessao {...baseProps({ comparacao: { tipo: 'sem-comparavel' } })} />
    );
    expect(
      screen.getByText(/sem sessão recente comparável/i)
    ).toBeInTheDocument();
  });

  it('renderiza deltas positivos, negativos e com percentual de volume', () => {
    render(
      <ResumoSessao
        {...baseProps({
          comparacao: {
            tipo: 'comparavel',
            deltas: {
              duracaoSegundos: 120,
              volumeKg: 200,
              seriesConcluidas: -2,
              volumePercentual: 20,
            },
          },
        })}
      />
    );
    // Delta de duração positivo.
    expect(screen.getByText(/\+120s/)).toBeInTheDocument();
    // Volume positivo com percentual.
    expect(screen.getByText(/\+200 kg \(\+20%\)/)).toBeInTheDocument();
    // Séries negativo (sinal − unicode).
    expect(screen.getByText(/−2/)).toBeInTheDocument();
  });

  it('omite o percentual de volume quando é null (base anterior 0)', () => {
    render(
      <ResumoSessao
        {...baseProps({
          comparacao: {
            tipo: 'comparavel',
            deltas: {
              duracaoSegundos: 0,
              volumeKg: 300,
              seriesConcluidas: 0,
              volumePercentual: null,
            },
          },
        })}
      />
    );
    expect(screen.getByText('+300 kg')).toBeInTheDocument();
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
  });

  it('mostra a seção de conquistas quando há conquistas', () => {
    render(
      <ResumoSessao
        {...baseProps({
          conquistas: [
            {
              id: 'c1',
              name: 'Primeiro treino',
              description: 'Conclua sua primeira sessão.',
              icon: 'Trophy',
              points: 20,
            },
          ],
        })}
      />
    );
    expect(screen.getByText('Conquistas desbloqueadas')).toBeInTheDocument();
    expect(screen.getByText('Primeiro treino')).toBeInTheDocument();
    expect(screen.getByText('+20')).toBeInTheDocument();
  });

  it('omite a seção de conquistas quando não há nenhuma', () => {
    render(<ResumoSessao {...baseProps({ conquistas: [] })} />);
    expect(
      screen.queryByText('Conquistas desbloqueadas')
    ).not.toBeInTheDocument();
  });
});
