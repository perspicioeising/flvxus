import { z } from 'zod';

/**
 * Schema de saída da IA para `analyze_assessment` (Edge Function `analyze-assessment`).
 *
 * PURO: só `zod`. Nenhuma API só-Deno.
 *
 * Campos alinhados a architecture.md §6.2:
 * - `physical_assessments.ai_analysis` (jsonb) -> `analysis`
 * - `physical_assessments.ai_recommendations` (jsonb) -> `recommendations`
 */

// Prioridade da recomendação (ajuda a UI a ordenar/realçar).
const recommendationPriority = z.enum(['alta', 'media', 'baixa']);

/** Uma recomendação estruturada. */
export const assessmentRecommendationSchema = z.object({
  // Eixo da recomendação (ex.: "treino", "dieta", "recuperação").
  category: z.string().min(1, 'Categoria da recomendação é obrigatória.'),
  text: z.string().min(1, 'Texto da recomendação é obrigatório.'),
  priority: recommendationPriority,
});

/** Saída completa da análise de avaliação. */
export const analyzeAssessmentOutputSchema = z.object({
  // Texto corrido da análise -> `ai_analysis`.
  analysis: z.string().min(1, 'A análise textual é obrigatória.'),
  // Recomendações estruturadas -> `ai_recommendations`.
  recommendations: z
    .array(assessmentRecommendationSchema)
    .min(1, 'Inclua ao menos uma recomendação.'),
  // Aviso de rascunho / não substitui médico-nutricionista (ADR 0001 §6).
  disclaimer: z.string().min(1, 'O aviso é obrigatório.'),
});

export type AssessmentRecommendation = z.infer<typeof assessmentRecommendationSchema>;
export type AnalyzeAssessmentOutput = z.infer<typeof analyzeAssessmentOutputSchema>;
