import { beforeAll, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { MedidasVisual } from '@/components/professor/avaliacoes/medidas-visual';

// jsdom não implementa ResizeObserver, exigido pelo ResponsiveContainer do
// recharts. Stub mínimo só para o ambiente de teste (o gráfico renderiza vazio
// em jsdom; as asserções miram texto/resumo sr-only, não o SVG).
beforeAll(() => {
  if (!('ResizeObserver' in globalThis)) {
    (globalThis as { ResizeObserver?: unknown }).ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
});

describe('MedidasVisual', () => {
  it('renderiza os valores de dobras e circunferências a partir das props', () => {
    render(
      <MedidasVisual
        dobras={[{ rotulo: 'Tríceps', valor: 60 }]}
        circunferencias={[{ rotulo: 'Cintura', valor: 80 }]}
      />
    );

    expect(screen.getByText('Dobras cutâneas (mm)')).toBeInTheDocument();
    expect(screen.getByText('Circunferências (cm)')).toBeInTheDocument();
    expect(screen.getByText('Tríceps')).toBeInTheDocument();
    expect(screen.getByText('Cintura')).toBeInTheDocument();
    expect(screen.getByText('60')).toBeInTheDocument();
    expect(screen.getByText('80')).toBeInTheDocument();
  });

  it('agrupa um par simétrico e expõe a assimetria no resumo acessível', () => {
    render(
      <MedidasVisual
        dobras={[]}
        circunferencias={[
          { rotulo: 'Braço esq.', valor: 40 },
          { rotulo: 'Braço dir.', valor: 41 },
        ]}
      />
    );

    // Rótulo-base do par (sem o sufixo de lado).
    expect(screen.getByText('Braço')).toBeInTheDocument();
    // Diferença absoluta exibida como destaque de assimetria.
    expect(screen.getByText('Δ 1 cm')).toBeInTheDocument();
    // Resumo sr-only descreve a diferença entre os lados.
    expect(
      screen.getByText(/diferença de 1 cm/i)
    ).toBeInTheDocument();
  });

  it('não renderiza a seção de dobras quando não há dobras', () => {
    render(
      <MedidasVisual
        dobras={[]}
        circunferencias={[{ rotulo: 'Cintura', valor: 80 }]}
      />
    );

    expect(screen.queryByText('Dobras cutâneas (mm)')).not.toBeInTheDocument();
    expect(screen.getByText('Circunferências (cm)')).toBeInTheDocument();
  });

  it('não renderiza a seção de circunferências quando não há circunferências', () => {
    render(
      <MedidasVisual
        dobras={[{ rotulo: 'Tríceps', valor: 60 }]}
        circunferencias={[]}
      />
    );

    expect(screen.queryByText('Circunferências (cm)')).not.toBeInTheDocument();
    expect(screen.getByText('Dobras cutâneas (mm)')).toBeInTheDocument();
  });

  it('não renderiza nada quando ambos estão vazios', () => {
    const { container } = render(<MedidasVisual dobras={[]} circunferencias={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('inclui um resumo sr-only com os valores', () => {
    render(
      <MedidasVisual
        dobras={[{ rotulo: 'Tríceps', valor: 60 }]}
        circunferencias={[{ rotulo: 'Cintura', valor: 80 }]}
      />
    );

    expect(screen.getByText(/Circunferências em centímetros: Cintura 80/)).toBeInTheDocument();
    expect(screen.getByText(/Dobras cutâneas em milímetros: Tríceps 60/)).toBeInTheDocument();
  });
});
