import { describe, expect, it } from 'vitest';

import { getNavItems } from '@/components/navigation/nav-items';

/**
 * Teste de navegação do painel de desafios do PERSONAL (G3). O item "Desafios"
 * (`/professor/desafios`) deve aparecer para o personal PROFISSIONAL
 * (`trainer` + `professional`) e NÃO para o aluno AUTÔNOMO (`trainer` +
 * `self_managed`), cujo menu reusa o ramo de uso sem a gestão da turma. O gate
 * de rota (`layout.tsx`) é a fronteira real; o item de menu só espelha isso.
 */

const DESAFIOS_HREF = '/professor/desafios';

function temDesafios(role: 'trainer' | 'student', accountType: 'professional' | 'self_managed') {
  return getNavItems(role, false, accountType).some(
    (item) => item.href === DESAFIOS_HREF,
  );
}

describe('getNavItems — item "Desafios" do personal', () => {
  it('aparece para o personal profissional', () => {
    expect(temDesafios('trainer', 'professional')).toBe(true);
  });

  it('NÃO aparece para o aluno autônomo (self_managed)', () => {
    expect(temDesafios('trainer', 'self_managed')).toBe(false);
  });

  it('NÃO aparece para o aluno vinculado (student)', () => {
    expect(temDesafios('student', 'professional')).toBe(false);
  });
});
