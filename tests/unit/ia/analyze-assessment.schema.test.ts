import { describe, expect, it } from 'vitest';

import { analyzeAssessmentOutputSchema } from '@/schemas/ia';

const bom = {
  analysis: 'O aluno apresenta evolução de massa magra e redução de gordura corporal.',
  recommendations: [
    { category: 'treino', text: 'Aumentar volume de membros inferiores.', priority: 'alta' },
    { category: 'dieta', text: 'Ajustar ingestão proteica.', priority: 'media' },
  ],
  disclaimer: 'Rascunho gerado por IA; não substitui avaliação médica/nutricional.',
};

describe('analyzeAssessmentOutputSchema', () => {
  it('valida um exemplo BOM', () => {
    expect(analyzeAssessmentOutputSchema.safeParse(bom).success).toBe(true);
  });

  it('rejeita prioridade inválida', () => {
    const ruim = structuredClone(bom) as unknown as {
      recommendations: { priority: unknown }[];
    };
    ruim.recommendations[0].priority = 'urgentíssima';
    expect(analyzeAssessmentOutputSchema.safeParse(ruim).success).toBe(false);
  });

  it('rejeita análise vazia', () => {
    const ruim = structuredClone(bom);
    ruim.analysis = '';
    expect(analyzeAssessmentOutputSchema.safeParse(ruim).success).toBe(false);
  });

  it('rejeita lista de recomendações vazia', () => {
    const ruim = structuredClone(bom);
    ruim.recommendations = [];
    expect(analyzeAssessmentOutputSchema.safeParse(ruim).success).toBe(false);
  });

  it('rejeita campo faltando (text ausente em recomendação)', () => {
    const ruim = structuredClone(bom) as unknown as {
      recommendations: Record<string, unknown>[];
    };
    delete ruim.recommendations[0].text;
    expect(analyzeAssessmentOutputSchema.safeParse(ruim).success).toBe(false);
  });

  it('rejeita tipo errado (recommendations como string)', () => {
    const ruim = structuredClone(bom) as unknown as { recommendations: unknown };
    ruim.recommendations = 'texto';
    expect(analyzeAssessmentOutputSchema.safeParse(ruim).success).toBe(false);
  });
});
