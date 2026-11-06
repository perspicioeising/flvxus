import { requireMaster } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { getAccess } from '@/lib/billing/access';
import { tierCompativel } from '@/lib/billing/catalogo';
import { resolvePeriodStart } from '@/lib/ia/quota';
import { PlanosGrid, type PlanoCardItem } from '@/components/professor/plano/planos-grid';
import { PortalButton } from '@/components/professor/plano/portal-button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { BillingCycle, PlanTier } from '@/types/database.types';
import type { MotivoAcesso } from '@/lib/billing/acesso';

/**
 * Plano/Assinatura — MASTER-ONLY. Gate server-side `requireMaster()`. O estado
 * (trial/ativo/etc.) vem de `getAccess()` (RPC `billing_tenant_state`), a mesma
 * fonte do gate das Server Actions. Lista só os tiers compatíveis com o tipo de
 * conta e permite escolher mensal/anual.
 */
const AVISO_CHECKOUT: Record<string, string> = {
  sucesso:
    'Pagamento recebido. A confirmação pode levar alguns segundos; atualize a página se o plano ainda não aparecer como ativo.',
  cancelado: 'Checkout cancelado. Nada foi cobrado e seu teste continua como estava.',
  erro: 'Não foi possível iniciar o checkout. Tente novamente.',
  incompativel: 'Este plano não está disponível para o seu tipo de conta.',
  ja_assinante: 'Você já tem uma assinatura. Use "Gerenciar assinatura" para alterá-la.',
};

export default async function ProfessorPlanoPage({
  searchParams,
}: {
  searchParams?: Promise<{ checkout?: string }>;
}) {
  const master = await requireMaster();
  const supabase = await createClient();
  const acesso = await getAccess();
  const sp = (await searchParams) ?? {};
  const avisoCheckout = sp.checkout ? AVISO_CHECKOUT[sp.checkout] : undefined;

  const soloEu = master.accountType === 'self_managed';

  const [{ data: planos }, { data: trainers }] = await Promise.all([
    supabase
      .from('plans')
      .select(
        'id, tier, name, max_affiliates, ai_quota_monthly, price_monthly_cents, price_yearly_cents, stripe_price_id_monthly, stripe_price_id_yearly, trial_days'
      )
      .eq('is_active', true),
    supabase
      .from('profiles')
      .select('deactivated_at')
      .eq('role', 'trainer')
      .eq('is_tenant_master', false),
  ]);

  const usados = (trainers ?? []).filter((t) => t.deactivated_at === null).length;
  const motivo: MotivoAcesso = acesso?.motivo ?? 'sem_assinatura';
  const assinaturaAtiva = motivo === 'assinatura_ativa';
  const planoAtual = (planos ?? []).find((p) => p.tier === acesso?.tier) ?? null;
  const limiteAtual = planoAtual?.max_affiliates ?? null;

  // Uso de franquia de IA do período corrente. O período espelha o contador das
  // Edge Functions: início do período Stripe truncado a date, com fallback no 1º
  // dia do mês. A leitura é via RLS do master (ai_usage_counters).
  const periodoFranquia = resolvePeriodStart(null);
  const franquiaTotal = planoAtual?.ai_quota_monthly ?? null;
  const { data: contador } = await supabase
    .from('ai_usage_counters')
    .select('used')
    .eq('tenant_id', master.tenantId)
    .eq('period_start', periodoFranquia)
    .maybeSingle();
  const franquiaUsada = contador?.used ?? 0;
  const cicloAtual = (acesso?.billingCycle ?? 'monthly') as BillingCycle;

  const ordemTier: Partial<Record<PlanTier, number>> = { individual: 0, personal: 1, assessoria: 2 };
  const cards: PlanoCardItem[] = [...(planos ?? [])]
    .filter((p) => tierCompativel(master.accountType, p.tier as PlanTier))
    .sort((a, b) => (ordemTier[a.tier as PlanTier] ?? 9) - (ordemTier[b.tier as PlanTier] ?? 9))
    .map((p) => ({
      tier: p.tier as PlanTier,
      name: p.name,
      descricao: soloEu
        ? 'Sua conta individual'
        : p.max_affiliates === null
          ? 'Filiados ilimitados'
          : p.max_affiliates === 0
            ? 'Sem filiados (só você)'
            : `Até ${p.max_affiliates} filiados`,
      mensalCentavos: p.price_monthly_cents,
      anualCentavos: p.price_yearly_cents,
      semPriceMensal: !p.stripe_price_id_monthly,
      semPriceAnual: !p.stripe_price_id_yearly,
      atual: assinaturaAtiva && p.tier === acesso?.tier,
    }));

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

      {avisoCheckout ? (
        <div role="status" className="rounded-md border border-border bg-muted p-3 text-sm">
          {avisoCheckout}
        </div>
      ) : null}

      {/* Resumo do plano atual */}
      <Card>
        <CardHeader className="p-4 pb-0">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-base">
              Plano atual: {planoAtual?.name ?? 'Nenhum'}
            </CardTitle>
            <Badge variant={acesso?.podeEscrever ? 'default' : 'secondary'}>
              {rotuloMotivo(motivo)}
            </Badge>
          </div>
          <CardDescription>
            {soloEu
              ? assinaturaAtiva
                ? `Cobrança ${rotuloCiclo(cicloAtual)}.`
                : ''
              : `Filiados em uso: ${usados} de ${
                  limiteAtual === null ? (planoAtual ? 'ilimitado' : '0') : limiteAtual
                }.${assinaturaAtiva ? ` Cobrança ${rotuloCiclo(cicloAtual)}.` : ''}`}
            {acesso?.cancelAtPeriodEnd
              ? ' Assinatura marcada para cancelar no fim do período.'
              : ''}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-1 p-4 text-sm text-muted-foreground">
          {motivo === 'trial_vigente' && acesso?.diasRestantesTrial != null ? (
            <p>
              Teste grátis: {acesso.diasRestantesTrial === 1 ? 'resta 1 dia' : `restam ${acesso.diasRestantesTrial} dias`}.
            </p>
          ) : null}
          {motivo === 'trial_expirado' ? (
            <p>Teste encerrado. Assine para voltar a criar, editar e registrar.</p>
          ) : null}
          {assinaturaAtiva ? (
            <p>
              {acesso?.currentPeriodEnd
                ? `Período atual até ${new Date(acesso.currentPeriodEnd).toLocaleDateString('pt-BR')}.`
                : 'Sem período ativo.'}
            </p>
          ) : null}
          <p>
            {franquiaTotal === null
              ? `Gerações de IA neste período: ${franquiaUsada} (ilimitado).`
              : `${franquiaUsada} de ${franquiaTotal} gerações de IA neste período.`}
          </p>
          {acesso?.hasStripeCustomer && acesso.hasStripeSubscription ? (
            <div className="pt-2">
              <PortalButton />
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Planos disponíveis (só os compatíveis com o tipo de conta) */}
      <PlanosGrid planos={cards} cicloInicial={cicloAtual} emTrial={motivo === 'trial_vigente'} />
    </section>
  );
}

/** Rótulo pt-BR do ciclo de cobrança. */
function rotuloCiclo(cycle: BillingCycle): string {
  return cycle === 'yearly' ? 'anual' : 'mensal';
}

/** Rótulo pt-BR do estado de acesso. */
function rotuloMotivo(motivo: MotivoAcesso): string {
  switch (motivo) {
    case 'assinatura_ativa':
      return 'Ativa';
    case 'trial_vigente':
      return 'Teste grátis';
    case 'trial_expirado':
      return 'Teste encerrado';
    case 'pagamento_pendente':
      return 'Pagamento pendente';
    case 'cancelada':
      return 'Cancelada';
    case 'incompleta':
      return 'Incompleta';
    default:
      return 'Sem assinatura';
  }
}
