import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { PlanosSection } from '@/components/marketing/planos-section';

/**
 * Seção de planos da landing: 3 cards, alternância mensal/anual, links de
 * cadastro e de assinatura (`/assinar`) sem price ID no HTML e sem prefetch.
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

  it('cada plano tem os dois CTAs com plano/ciclo na URL', () => {
    render(<PlanosSection />);
    fireEvent.click(screen.getByRole('radio', { name: 'Anual' }));
    const assinar = screen.getAllByRole('link', { name: 'Assinar agora' });
    const testar = screen.getAllByRole('link', { name: 'Testar 14 dias grátis' });
    expect(assinar.map((a) => a.getAttribute('href'))).toEqual([
      '/assinar?plano=individual&ciclo=yearly',
      '/assinar?plano=personal&ciclo=yearly',
      '/assinar?plano=assessoria&ciclo=yearly',
    ]);
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

  it('todo link para /assinar usa prefetch={false} na fonte do componente', () => {
    const fonte = readFileSync(
      join(process.cwd(), 'components', 'marketing', 'planos-section.tsx'),
      'utf8'
    );
    const links = [...fonte.matchAll(/<Link[^>]*href=\{`\/assinar[^>]*>/g)];
    expect(links.length).toBeGreaterThan(0);
    for (const l of links) {
      expect(l[0]).toContain('prefetch={false}');
    }
  });
});
