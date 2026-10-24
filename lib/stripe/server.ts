import Stripe from 'stripe';

/**
 * Cliente Stripe (SO servidor) — Fase 3 / design.md §6, §10.
 *
 * A `STRIPE_SECRET_KEY` é um segredo de servidor (modo TEST): NUNCA vai ao
 * bundle do cliente (sem prefixo NEXT_PUBLIC_) e nunca é commitada. A guarda
 * contra `window` impede que este módulo seja avaliado no browser; `getStripe()`
 * lança um erro claro se a env faltar (em vez de falhar silenciosamente).
 *
 * `apiVersion` é PINADA para estabilidade — a versão default do SDK 17.x
 * (ver node_modules/stripe/types/lib.d.ts LatestApiVersion).
 */

const STRIPE_API_VERSION = '2025-02-24.acacia';

let cached: Stripe | null = null;

/** Instancia (lazy, memoizado) o cliente Stripe server-only. */
export function getStripe(): Stripe {
  if (typeof window !== 'undefined') {
    throw new Error('lib/stripe/server.ts não pode ser usado no browser (segredo de servidor).');
  }

  if (cached) {
    return cached;
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error(
      'STRIPE_SECRET_KEY é obrigatório para o cliente Stripe (defina em .env.local).'
    );
  }

  cached = new Stripe(secretKey, { apiVersion: STRIPE_API_VERSION });
  return cached;
}
