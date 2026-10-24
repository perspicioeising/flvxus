import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';

import { AnelProgresso } from './anel-progresso';

afterEach(cleanup);

/** Lê o strokeDashoffset do círculo de progresso (o segundo <circle>). */
function offsetDoProgresso(container: HTMLElement): number {
  const circulos = container.querySelectorAll('circle');
  const progresso = circulos[circulos.length - 1];
  return Number(progresso.getAttribute('stroke-dashoffset'));
}

describe('AnelProgresso', () => {
  it('offset é 0 quando o tempo está cheio (restante = segundos)', () => {
    const { container } = render(
      <AnelProgresso segundos={90} restante={90} size={200} strokeWidth={12} />
    );
    expect(offsetDoProgresso(container)).toBeCloseTo(0, 5);
  });

  it('offset é a circunferência cheia quando restante = 0', () => {
    const { container } = render(
      <AnelProgresso segundos={90} restante={0} size={200} strokeWidth={12} />
    );
    const raio = (200 - 12) / 2;
    const circ = 2 * Math.PI * raio;
    expect(offsetDoProgresso(container)).toBeCloseTo(circ, 5);
  });

  it('offset é proporcional ao restante (metade)', () => {
    const { container } = render(
      <AnelProgresso segundos={90} restante={45} size={200} strokeWidth={12} />
    );
    const raio = (200 - 12) / 2;
    const circ = 2 * Math.PI * raio;
    expect(offsetDoProgresso(container)).toBeCloseTo(circ * 0.5, 5);
  });
});
