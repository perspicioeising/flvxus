import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { PlanosSection } from '@/components/marketing/planos-section';

/**
 * Seção de planos da landing: 3 cards, alternância mensal/anual, um CTA de
 * cadastro (teste grátis) por plano, sem price ID no HTML e sem link de checkout.
 */
describe('PlanosSection', () => {
  it('renderiza os 3 planos com preço mensal por padrão', () => {
    render(<PlanosSection />);
    expect(screen.getByText('Individual')).toBeInTheDocument();
    expect(screen.getByText('Personal')).toBeInTheDocument();
    expect(screen.getByText('Assessoria')).toBeInTheDocument();
    expect(screen.getByText(/19,90/)).toBeInTheDocument();
    expect(screen.getByText(/129,90/)).toBeInTheDocument();
    expect(screen.getByText(/249,90/)).toBeInTheDocument();
  });

  it('alternar para Anual troca os preços', () => {
    render(<PlanosSection />);
    fireEvent.click(screen.getByRole('radio', { name: 'Anual' }));
    expect(screen.getByRole('radio', { name: 'Anual' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByText(/118,80/)).toBeInTheDocument();
    expect(screen.getByText(/1\.188,00/)).toBeInTheDocument();
    expect(screen.getByText(/2\.388,00/)).toBeInTheDocument();
  });

  it('cada plano tem um único CTA de teste grátis com plano/ciclo na URL', () => {
    render(<PlanosSection />);
    fireEvent.click(screen.getByRole('radio', { name: 'Anual' }));
    // A assinatura paga acontece dentro do app; a landing não leva ao checkout.
    expect(screen.queryAllByRole('link', { name: 'Assinar agora' })).toHaveLength(0);
    const testar = screen.getAllByRole('link', { name: 'Testar 14 dias grátis' });
    expect(testar.map((a) => a.getAttribute('href'))).toEqual([
      '/register?plano=individual&ciclo=yearly',
      '/register?plano=personal&ciclo=yearly',
      '/register?plano=assessoria&ciclo=yearly',
    ]);
  });

  it('não expõe price IDs do Stripe no HTML', () => {
    const { container } = render(<PlanosSection />);
    expect(container.innerHTML).not.toMatch(/price_[A-Za-z0-9]{8,}/);
  });

  it('a seção de planos não aponta para /assinar (checkout só dentro do app)', () => {
    const fonte = readFileSync(
      join(process.cwd(), 'components', 'marketing', 'planos-section.tsx'),
      'utf8'
    );
    expect(fonte).not.toMatch(/href=\{`\/assinar/);
  });
});
