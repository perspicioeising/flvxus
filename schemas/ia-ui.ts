import { z } from 'zod';

/**
 * Schemas Zod de ENTRADA das Server Actions de IA (FEAT-005).
 *
 * Espelham o `inputSchema` de cada Edge Function
 * (`supabase/functions-inline/*`), para validar no servidor Next ANTES de
 * invocar a função — assim erros de formulário são pegos cedo e o corpo
 * enviado à função já está no contrato esperado.
 *
 * PURO: só `zod`.
 */

/** Entrada de `generate-diet`. */
export const gerarDietaInputSchema = z.object({
  student_id: z.string().uuid('Selecione um aluno.'),
  goal: z.string().min(1, 'Informe o objetivo da dieta.'),
  restrictions: z.array(z.string().min(1)).default([]),
  assessment_id: z.string().uuid().optional(),
  target_kcal: z
    .number({ invalid_type_error: 'Meta de kcal deve ser numérica.' })
    .finite()
    .positive('Meta de kcal deve ser positiva.')
    .optional(),
});

/** Entrada de `suggest-workout`. */
export const sugerirTreinoInputSchema = z.object({
  student_id: z.string().uuid('Selecione um aluno.'),
  goal: z.string().min(1, 'Informe o objetivo do treino.'),
  experience_level: z.enum(['beginner', 'intermediate', 'advanced'], {
    errorMap: () => ({ message: 'Selecione o nível de experiência.' }),
  }),
  days_per_week: z
    .number({ invalid_type_error: 'Informe os dias por semana.' })
    .int('Dias por semana deve ser inteiro.')
    .min(1, 'Mínimo de 1 dia por semana.')
    .max(7, 'Máximo de 7 dias por semana.'),
  assessment_id: z.string().uuid().optional(),
});

/** Entrada de `analyze-assessment`. */
export const analisarAvaliacaoInputSchema = z.object({
  assessment_id: z.string().uuid('Avaliação inválida.'),
  previous_assessment_id: z.string().uuid().optional(),
});

export type GerarDietaInput = z.infer<typeof gerarDietaInputSchema>;
export type SugerirTreinoInput = z.infer<typeof sugerirTreinoInputSchema>;
export type AnalisarAvaliacaoInput = z.infer<typeof analisarAvaliacaoInputSchema>;
