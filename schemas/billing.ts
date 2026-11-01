import { z } from 'zod';

import type { PlanTier } from '@/types/database.types';

/**
 * Schemas Zod do domínio de BILLING (Fase 3). Reusados client+server nas actions
 * de `actions/billing.ts`.
 */

/** Tiers de plano (enum `plan_tier`). Os 6 valores da Fase B (legados + novos). */
export const PLAN_TIERS = [
  'individual',
  'personal',
  'assessoria',
  'solo',
  'team',
  'gym',
] as const satisfies readonly PlanTier[];

/** Início de checkout do Stripe para assinar/trocar de plano. */
export const iniciarCheckoutSchema = z.object({
  tier: z.enum(PLAN_TIERS, { errorMap: () => ({ message: 'Plano inválido.' }) }),
  cycle: z.enum(['monthly', 'yearly']),
});

export type IniciarCheckoutInput = z.infer<typeof iniciarCheckoutSchema>;
