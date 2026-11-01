import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import { MuscleMap } from '@/components/muscle-map';

/**
 * Testes do componente apresentacional `MuscleMap`: acende as regiões certas
 * para uma lista de grupos, expõe `role="img"` com `aria-label` descritivo e
 * degrada para o rótulo neutro quando não há grupos.
 */
afterEach(cleanup);

/**
 * Músculos acesos, lidos do hook estável `data-active-regions` do wrapper. O
 * SVG anatômico vem da lib `@mjcdev/react-body-highlighter` (carrega só no
 * cliente), mas o wrapper expõe os `slug` ativos de forma síncrona.
 */
function regioesAtivas(container: HTMLElement): string[] {
  const el = container.querySelector('[data-active-regions]');
  const raw = el?.getAttribute('data-active-regions') ?? '';
  return raw.split(' ').filter(Boolean).sort();
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
    // Peito → peitoral; ombros → deltoides; braços → bíceps+tríceps+antebraço.
    expect(new Set(ativas)).toEqual(
      new Set(['chest', 'deltoids', 'biceps', 'triceps', 'forearm'])
    );
    expect(ativas).not.toContain('quadriceps');
    expect(ativas).not.toContain('upper-back');
  });

  it('"Pernas" acende quadríceps, posterior, glúteos e panturrilha', () => {
    const { container } = render(<MuscleMap grupos={['Pernas']} />);
    const ativas = new Set(regioesAtivas(container));
    expect(ativas.has('quadriceps')).toBe(true);
    expect(ativas.has('hamstring')).toBe(true);
    expect(ativas.has('gluteal')).toBe(true);
    expect(ativas.has('calves')).toBe(true);
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
