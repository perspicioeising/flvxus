import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import { MuscleMap } from '@/components/muscle-map';

/**
 * Testes do componente apresentacional `MuscleMap`: acende as regiões certas
 * para uma lista de grupos, expõe `role="img"` com `aria-label` descritivo e
 * degrada para o rótulo neutro quando não há grupos.
 */
afterEach(cleanup);

/** Regiões marcadas como ativas (`data-active="true"`), ordenadas. */
function regioesAtivas(container: HTMLElement): string[] {
  return Array.from(container.querySelectorAll('[data-region][data-active="true"]'))
    .map((el) => el.getAttribute('data-region') ?? '')
    .sort();
}

describe('MuscleMap', () => {
  it('expõe role="img" e aria-label com os grupos trabalhados', () => {
    render(<MuscleMap grupos={['Peito', 'Ombros', 'Braços']} />);
    expect(
      screen.getByRole('img', {
        name: 'Músculos trabalhados: Peito, Ombros, Braços',
      })
    ).toBeInTheDocument();
  });

  it('acende as regiões de peito, ombros e braços (frente e costas)', () => {
    const { container } = render(<MuscleMap grupos={['Peito', 'Ombros', 'Braços']} />);
    const ativas = regioesAtivas(container);
    // Duplicatas frente/costas: cada região pode aparecer 2x no SVG.
    expect(new Set(ativas)).toEqual(new Set(['chest', 'shoulders', 'arms']));
    expect(ativas).not.toContain('quads');
    expect(ativas).not.toContain('upperBack');
  });

  it('"Pernas" acende quadríceps, posterior e glúteos', () => {
    const { container } = render(<MuscleMap grupos={['Pernas']} />);
    const ativas = new Set(regioesAtivas(container));
    expect(ativas.has('quads')).toBe(true);
    expect(ativas.has('hamstrings')).toBe(true);
    expect(ativas.has('glutes')).toBe(true);
    expect(ativas.has('chest')).toBe(false);
  });

  it('não acende região alguma para grupo desconhecido (fallback seguro)', () => {
    const { container } = render(<MuscleMap grupos={['Mobilidade']} />);
    expect(regioesAtivas(container)).toEqual([]);
    // Ainda assim renderiza com aria-label descritivo do valor recebido.
    expect(
      screen.getByRole('img', { name: 'Músculos trabalhados: Mobilidade' })
    ).toBeInTheDocument();
  });

  it('usa o rótulo neutro no aria-label quando não há grupos', () => {
    render(<MuscleMap grupos={[]} rotuloVazio="Dia de descanso" />);
    expect(
      screen.getByRole('img', { name: 'Dia de descanso' })
    ).toBeInTheDocument();
  });
});
