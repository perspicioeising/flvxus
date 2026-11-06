import { z } from 'zod';
import type { PlanTier } from '@/types/database.types';

/**
 * Schemas Zod do domínio de BILLING. Reusados client+server nas actions de
 * `actions/billing.ts` e na rota `/assinar`.
 */

/** Tiers de plano (enum `plan_tier`). Os 6 valores (legados + novos). */
export const PLAN_TIERS = [
  'individual',
  'personal',
  'assessoria',
  'solo',
  'team',
  'gym',
] as const satisfies readonly PlanTier[];

/** Tiers ofertados no checkout (os legados deixaram de ser aceitos). */
export const TIERS_CHECKOUT = ['individual', 'personal', 'assessoria'] as const;

/** Início de checkout do Stripe para assinar/trocar de plano. */
export const checkoutPlanoSchema = z.object({
  tier: z.enum(TIERS_CHECKOUT, { errorMap: () => ({ message: 'Plano inválido.' }) }),
  cycle: z.enum(['monthly', 'yearly'], { errorMap: () => ({ message: 'Ciclo inválido.' }) }),
});

/** Alias retrocompatível: delega ao schema restrito aos 3 tiers vigentes. */
export const iniciarCheckoutSchema = checkoutPlanoSchema;

export type IniciarCheckoutInput = z.infer<typeof checkoutPlanoSchema>;
