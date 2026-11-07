import { describe, expect, it } from 'vitest';
import { getNavItems } from '@/components/navigation/nav-items';

/**
 * Item "Agenda" do menu (Agenda Fase 1): professor (master e filiado) →
 * `/professor/agenda`; aluno vinculado → `/aluno/agenda` na 4ª posição (depois
 * das 3 abas primárias); autônomo → `/aluno/agenda` após "Minha dieta", sem
 * `/professor/agenda`.
 */
const hrefs = (itens: { href: string }[]) => itens.map((i) => i.href);

describe('getNavItems — item "Agenda"', () => {
  it('professor master e filiado veem /professor/agenda', () => {
    expect(hrefs(getNavItems('trainer', true, 'professional'))).toContain('/professor/agenda');
    expect(hrefs(getNavItems('trainer', false, 'professional'))).toContain('/professor/agenda');
  });

  it('professor não vê a agenda do aluno', () => {
    expect(hrefs(getNavItems('trainer', false, 'professional'))).not.toContain('/aluno/agenda');
  });

  it('aluno vinculado vê /aluno/agenda na 4ª posição, sem alterar as 3 primárias', () => {
    const itens = hrefs(getNavItems('student'));
    expect(itens.slice(0, 3)).toEqual(['/aluno', '/aluno/treinos', '/aluno/historico']);
    expect(itens[3]).toBe('/aluno/agenda');
    expect(itens).not.toContain('/professor/agenda');
  });

  it('autônomo vê /aluno/agenda após "Minha dieta" e NÃO vê /professor/agenda', () => {
    for (const master of [true, false]) {
      const itens = hrefs(getNavItems('trainer', master, 'self_managed'));
      expect(itens).not.toContain('/professor/agenda');
      expect(itens.slice(0, 4)).toEqual(['/aluno', '/aluno/execucao', '/aluno/dieta', '/aluno/agenda']);
    }
  });
});
