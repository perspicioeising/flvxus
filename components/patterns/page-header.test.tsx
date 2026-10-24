import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import { PageHeader } from './page-header';

afterEach(cleanup);

describe('PageHeader', () => {
  it('expõe exatamente um h1', () => {
    render(<PageHeader title="Treinos" />);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('emphasis="caps" aplica uppercase e escala gigante', () => {
    render(<PageHeader title="Treinos" emphasis="caps" />);
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.className).toContain('uppercase');
    expect(h1.className).toContain('text-4xl');
    expect(h1.className).toContain('font-black');
  });

  it('emphasis padrão não força caixa-alta', () => {
    render(<PageHeader title="Treinos" />);
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.className).not.toContain('uppercase');
  });
});
