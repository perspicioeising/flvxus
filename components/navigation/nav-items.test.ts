import { describe, expect, it } from 'vitest';

import { getNavItems, isMainScreen } from './nav-items';

/**
 * Testes de `isMainScreen` (Ajuste 2): a logo no header mobile só aparece nas
 * telas PRINCIPAIS (nível de aba do menu). Uma tela é principal quando o
 * pathname casa EXATAMENTE o href de um nav item do papel; subrotas
 * (detalhe/execução/criação) não são principais.
 */
describe('isMainScreen — telas principais por papel', () => {
  describe('aluno', () => {
    it('raiz e abas do menu são telas principais', () => {
      expect(isMainScreen('/aluno', 'student')).toBe(true);
      expect(isMainScreen('/aluno/treinos', 'student')).toBe(true);
      expect(isMainScreen('/aluno/dieta', 'student')).toBe(true);
      expect(isMainScreen('/aluno/evolucao', 'student')).toBe(true);
      expect(isMainScreen('/aluno/historico', 'student')).toBe(true);
    });

    it('inclui o item "Arena" logo antes de "Perfil", com href/label/ícone', () => {
      const itens = getNavItems('student');
      const arena = itens.find((i) => i.href === '/aluno/arena');
      expect(arena).toBeDefined();
      expect(arena?.label).toBe('Arena');
      // Ordem: "Arena" imediatamente antes de "Perfil".
      const idxArena = itens.findIndex((i) => i.href === '/aluno/arena');
      const idxPerfil = itens.findIndex((i) => i.href === '/aluno/perfil');
      expect(idxArena).toBeGreaterThanOrEqual(0);
      expect(idxPerfil).toBe(idxArena + 1);
    });

    it('a tela "/aluno/arena" é principal', () => {
      expect(isMainScreen('/aluno/arena', 'student')).toBe(true);
    });

    it('subrotas (detalhe/execução) NÃO são telas principais', () => {
      expect(isMainScreen('/aluno/treinos/123', 'student')).toBe(false);
      expect(isMainScreen('/aluno/execucao', 'student')).toBe(false);
      expect(isMainScreen('/aluno/execucao/plan-1', 'student')).toBe(false);
      expect(
        isMainScreen('/aluno/execucao/plan-1/resumo/sess-1', 'student')
      ).toBe(false);
    });
  });

  describe('professor', () => {
    it('raiz e abas do menu são telas principais', () => {
      expect(isMainScreen('/professor', 'trainer')).toBe(true);
      expect(isMainScreen('/professor/alunos', 'trainer')).toBe(true);
      expect(isMainScreen('/professor/treinos', 'trainer')).toBe(true);
      expect(isMainScreen('/professor/exercicios', 'trainer')).toBe(true);
    });

    it('subrotas (detalhe/criação/treinar) NÃO são telas principais', () => {
      expect(isMainScreen('/professor/alunos/42', 'trainer')).toBe(false);
      expect(
        isMainScreen('/professor/alunos/42/treinar/plan-1', 'trainer')
      ).toBe(false);
      expect(isMainScreen('/professor/treinos/nova', 'trainer')).toBe(false);
    });

    it('item "Plano" só conta como principal para o master', () => {
      expect(isMainScreen('/professor/plano', 'trainer', false)).toBe(false);
      expect(isMainScreen('/professor/plano', 'trainer', true)).toBe(true);
    });

    it('aba de uso do autônomo é principal (self_managed)', () => {
      expect(isMainScreen('/aluno/evolucao', 'trainer', true, 'self_managed')).toBe(
        true,
      );
    });
  });
});

/**
 * Testes de `getNavItems`: a nav do aluno autônomo (trainer + self_managed)
 * oculta a gestão de terceiros e adiciona as telas de USO (rotas /aluno),
 * enquanto a nav do professional e a do student permanecem inalteradas.
 */
describe('getNavItems — nav por account_type', () => {
  it('autônomo (trainer, self_managed) oculta gestão e lista telas de uso', () => {
    const hrefs = getNavItems('trainer', true, 'self_managed').map((i) => i.href);

    expect(hrefs).not.toContain('/professor/alunos');
    expect(hrefs).not.toContain('/professor/modelos-treino');
    expect(hrefs).toContain('/aluno/execucao');
    expect(hrefs).toContain('/aluno/evolucao');
    expect(hrefs).toContain('/aluno/conquistas');
    expect(hrefs).toContain('/professor/plano');
  });

  it('professional (trainer) mantém o menu B2B atual', () => {
    const hrefs = getNavItems('trainer', true, 'professional').map((i) => i.href);

    expect(hrefs).toContain('/professor/alunos');
    expect(hrefs).toContain('/professor/modelos-treino');
    expect(hrefs).not.toContain('/aluno/execucao');
    expect(hrefs).not.toContain('/aluno/evolucao');
    expect(hrefs).not.toContain('/aluno/conquistas');
  });

  it('student permanece inalterado', () => {
    const studentHrefs = getNavItems('student').map((i) => i.href);

    expect(studentHrefs).toEqual([
      '/aluno',
      '/aluno/treinos',
      '/aluno/historico',
      '/aluno/dieta',
      '/aluno/evolucao',
      '/aluno/avaliacoes',
      '/aluno/conquistas',
      '/aluno/perfil',
      '/aluno/ajuda',
    ]);
  });
});
