import { describe, expect, it } from 'vitest';

import { isMainScreen } from './nav-items';

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
  });
});
