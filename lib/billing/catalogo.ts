import type { AccountType, BillingCycle, PlanTier } from '@/types/database.types';

/**
 * Catálogo de EXIBIÇÃO dos 3 tiers vigentes (a landing é pública e `plans` só é
 * legível por autenticado). Os valores espelham o seed
 * `20261105090100_plans_stripe_price_ids_seed.sql` (teste garante a paridade).
 * Price IDs NUNCA vão ao cliente: só o servidor os resolve.
 */
export type TierOfertado = 'individual' | 'personal' | 'assessoria';

export interface ItemCatalogo {
  tier: TierOfertado;
  nome: string;
  publico: string;
  mensalCentavos: number;
  anualCentavos: number;
  itens: string[];
}

export const CATALOGO: readonly ItemCatalogo[] = [
  {
    tier: 'individual',
    nome: 'Individual',
    publico: 'Para quem treina por conta própria',
    mensalCentavos: 1990,
    anualCentavos: 11880,
    itens: ['Treinos e dietas próprios', 'Evolução e conquistas', 'Arena e hábitos', 'IA com franquia mensal'],
  },
  {
    tier: 'personal',
    nome: 'Personal',
    publico: 'Para o personal com alunos',
    mensalCentavos: 12990,
    anualCentavos: 118800,
    itens: ['Alunos, treinos e dietas', 'Avaliações físicas', 'Até 5 filiados', 'IA com franquia ampliada'],
  },
  {
    tier: 'assessoria',
    nome: 'Assessoria',
    publico: 'Para academias e equipes',
    mensalCentavos: 24990,
    anualCentavos: 238800,
    itens: ['Tudo do Personal', 'Filiados ilimitados', 'IA ilimitada', 'Gestão da equipe'],
  },
];

/** Tiers que cada tipo de conta pode contratar. */
export const TIERS_POR_CONTA: Record<AccountType, readonly TierOfertado[]> = {
  self_managed: ['individual'],
  professional: ['personal', 'assessoria'],
};

export function tierCompativel(accountType: AccountType, tier: PlanTier): boolean {
  return (TIERS_POR_CONTA[accountType] as readonly PlanTier[]).includes(tier);
}

/** Resolve o price ID do ciclo escolhido (vazio/ausente => null). */
export function priceIdFor(
  plano: { stripe_price_id_monthly: string | null; stripe_price_id_yearly: string | null },
  cycle: BillingCycle
): string | null {
  const id = cycle === 'yearly' ? plano.stripe_price_id_yearly : plano.stripe_price_id_monthly;
  return id ? id : null;
}

export function formatarBRL(centavos: number): string {
  return (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
