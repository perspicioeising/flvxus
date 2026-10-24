import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { Activity } from 'lucide-react';

import { StatCard } from './stat-card';

afterEach(cleanup);

describe('StatCard', () => {
  it('tone="default" usa valor neutro forte', () => {
    render(<StatCard label="Treinos" value={12} />);
    const value = screen.getByText('12');
    expect(value.className).toContain('text-2xl');
    expect(value.className).toContain('font-bold');
    expect(value.className).not.toContain('text-primary');
  });

  it('tone="emphasis" usa número verde gigante', () => {
    render(<StatCard label="Pontos" value={320} tone="emphasis" />);
    const value = screen.getByText('320');
    expect(value.className).toContain('font-black');
    expect(value.className).toContain('text-primary');
    expect(value.className).toContain('tabular-nums');
  });

  it('não renderiza wrapper de ícone quando ausente', () => {
    const { container } = render(<StatCard label="Treinos" value={1} />);
    expect(container.querySelector('svg')).toBeNull();
  });

  it('renderiza o ícone quando fornecido', () => {
    const { container } = render(
      <StatCard label="Treinos" value={1} icon={Activity} />
    );
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('radius="2xl" adiciona cantos arredondados', () => {
    const { container } = render(
      <StatCard label="Treinos" value={1} radius="2xl" />
    );
    expect(container.firstElementChild?.className).toContain('rounded-2xl');
  });
});
