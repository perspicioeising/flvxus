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
import type { PlanTier, SubscriptionStatus } from '@/types/database.types';

/**
 * Plano/Assinatura — MASTER-ONLY (Fase 3). Gate server-side `requireMaster()`:
 * o filiado é redirecionado para /professor (não basta esconder o menu). Mostra
 * o plano atual, filiados usados/total, status da assinatura e os planos
 * disponíveis com botão de assinar/trocar via checkout do Stripe.
 */
export default async function ProfessorPlanoPage() {
  const master = await requireMaster();
  const supabase = await createClient();

  const [{ data: planos }, { data: sub }, { data: trainers }] = await Promise.all([
    supabase
      .from('plans')
      .select('id, tier, name, max_affiliates, stripe_price_id')
      .eq('is_active', true),
    supabase
      .from('subscriptions')
      .select('status, plan_id, current_period_end, cancel_at_period_end')
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

  // Ordena por tier (solo, team, gym).
  const ordemTier: Record<PlanTier, number> = { solo: 0, team: 1, gym: 2 };
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
          Sua assinatura e o limite de filiados. A cobrança é feita no seu plano.
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
            Filiados em uso: {usados} de {limiteAtual === null ? (planoAtual ? 'ilimitado' : '0') : limiteAtual}.
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
          const semPrice = !plano.stripe_price_id;
          return (
            <Card key={plano.id} className="flex flex-col">
              <CardHeader className="p-4 pb-0">
                <CardTitle className="text-base">{plano.name}</CardTitle>
                <CardDescription>
                  {plano.max_affiliates === null
                    ? 'Filiados ilimitados'
                    : plano.max_affiliates === 0
                      ? 'Sem filiados (só você)'
                      : `Até ${plano.max_affiliates} filiados`}
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto space-y-2 p-4">
                {semPrice ? (
                  <p className="text-xs text-muted-foreground">
                    Preço ainda não configurado.
                  </p>
                ) : null}
                <CheckoutButton
                  tier={plano.tier}
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
