import { requireMaster } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { statusComDireito } from '@/lib/billing/entitlement';
import { CheckoutButton } from '@/components/professor/plano/checkout-button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { BillingCycle, PlanTier, SubscriptionStatus } from '@/types/database.types';

/**
 * Plano/Assinatura — MASTER-ONLY (Fase 3). Gate server-side `requireMaster()`:
 * o filiado é redirecionado para /professor (não basta esconder o menu). Mostra
 * o plano atual, filiados usados/total, status da assinatura e os planos
 * disponíveis com botão de assinar/trocar via checkout do Stripe.
 */
export default async function ProfessorPlanoPage() {
  const master = await requireMaster();
  const supabase = await createClient();

  const soloEu = master.accountType === 'self_managed';

  const [{ data: planos }, { data: sub }, { data: trainers }] = await Promise.all([
    supabase
      .from('plans')
      .select(
        'id, tier, name, max_affiliates, price_monthly_cents, price_yearly_cents, stripe_price_id_monthly, stripe_price_id_yearly, trial_days'
      )
      .eq('is_active', true),
    supabase
      .from('subscriptions')
      .select('status, plan_id, current_period_end, cancel_at_period_end, billing_cycle')
      .eq('tenant_id', master.tenantId)
      .maybeSingle(),
    supabase
      .from('profiles')
      .select('deactivated_at')
      .eq('role', 'trainer')
      .eq('is_tenant_master', false),
  ]);

  const usados = (trainers ?? []).filter((t) => t.deactivated_at === null).length;
  const status = (sub?.status ?? null) as SubscriptionStatus | null;
  const planoAtual = (planos ?? []).find((p) => p.id === sub?.plan_id) ?? null;
  const limiteAtual = planoAtual?.max_affiliates ?? null;
  // Ciclo vigente (default mensal) para rotular o resumo e os botões.
  const cicloAtual = (sub?.billing_cycle ?? 'monthly') as BillingCycle;

  // Ordem canônica dos 6 tiers: Fase B primeiro, legados por último.
  const ordemTier: Record<PlanTier, number> = {
    individual: 0,
    personal: 1,
    assessoria: 2,
    solo: 3,
    team: 4,
    gym: 5,
  };
  const planosOrdenados = [...(planos ?? [])].sort(
    (a, b) => ordemTier[a.tier as PlanTier] - ordemTier[b.tier as PlanTier]
  );

  return (
    <section className="mx-auto w-full max-w-3xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-4xl font-black uppercase leading-[0.95] tracking-tight text-foreground md:text-5xl">
          Plano
        </h1>
        <p className="text-sm text-muted-foreground">
          {soloEu
            ? 'Sua assinatura individual. A cobrança é feita no seu plano.'
            : 'Sua assinatura e o limite de filiados. A cobrança é feita no seu plano.'}
        </p>
      </header>

      {/* Resumo do plano atual */}
      <Card>
        <CardHeader className="p-4 pb-0">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-base">
              Plano atual: {planoAtual?.name ?? 'Nenhum'}
            </CardTitle>
            <Badge variant={statusComDireito(status) ? 'default' : 'secondary'}>
              {rotuloStatus(status)}
            </Badge>
          </div>
          <CardDescription>
            {soloEu
              ? `Cobrança ${rotuloCiclo(cicloAtual)}.`
              : `Filiados em uso: ${usados} de ${
                  limiteAtual === null ? (planoAtual ? 'ilimitado' : '0') : limiteAtual
                }. Cobrança ${rotuloCiclo(cicloAtual)}.`}
            {sub?.cancel_at_period_end
              ? ' Assinatura marcada para cancelar no fim do período.'
              : ''}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 text-sm text-muted-foreground">
          {sub?.current_period_end
            ? `Período atual até ${new Date(sub.current_period_end).toLocaleDateString('pt-BR')}.`
            : 'Sem período ativo.'}
        </CardContent>
      </Card>

      {/* Planos disponíveis */}
      <div className="grid gap-4 sm:grid-cols-3">
        {planosOrdenados.map((plano) => {
          const atual = plano.id === sub?.plan_id && statusComDireito(status);
          // Price e valor do CICLO vigente. Sem price configurado => desabilita.
          const priceId =
            cicloAtual === 'yearly'
              ? plano.stripe_price_id_yearly
              : plano.stripe_price_id_monthly;
          const centavos =
            cicloAtual === 'yearly' ? plano.price_yearly_cents : plano.price_monthly_cents;
          const semPrice = !priceId;
          return (
            <Card key={plano.id} className="flex flex-col">
              <CardHeader className="p-4 pb-0">
                <CardTitle className="text-base">{plano.name}</CardTitle>
                <CardDescription>
                  {soloEu
                    ? 'Sua conta individual'
                    : plano.max_affiliates === null
                      ? 'Filiados ilimitados'
                      : plano.max_affiliates === 0
                        ? 'Sem filiados (só você)'
                        : `Até ${plano.max_affiliates} filiados`}
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto space-y-2 p-4">
                {centavos != null ? (
                  <p className="text-sm font-semibold text-foreground">
                    {formatarPreco(centavos)}
                    <span className="text-xs font-normal text-muted-foreground">
                      {' '}
                      /{cicloAtual === 'yearly' ? 'ano' : 'mês'}
                    </span>
                  </p>
                ) : null}
                {semPrice ? (
                  <p className="text-xs text-muted-foreground">
                    Preço ainda não configurado.
                  </p>
                ) : null}
                <CheckoutButton
                  tier={plano.tier}
                  cycle={cicloAtual}
                  label={atual ? 'Plano atual' : 'Assinar / trocar'}
                  disabled={atual || semPrice}
                  variant={atual ? 'outline' : 'default'}
                />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

/** Rótulo pt-BR do ciclo de cobrança. */
function rotuloCiclo(cycle: BillingCycle): string {
  return cycle === 'yearly' ? 'anual' : 'mensal';
}

/** Formata centavos em BRL (ex.: 1990 => "R$ 19,90"). */
function formatarPreco(centavos: number): string {
  return (centavos / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

/** Rótulo pt-BR do status da assinatura. */
function rotuloStatus(status: SubscriptionStatus | null): string {
  switch (status) {
    case 'active':
      return 'Ativa';
    case 'trialing':
      return 'Em teste';
    case 'past_due':
      return 'Pagamento atrasado';
    case 'unpaid':
      return 'Não paga';
    case 'canceled':
      return 'Cancelada';
    case 'incomplete':
    case 'incomplete_expired':
      return 'Incompleta';
    default:
      return 'Sem assinatura';
  }
}
