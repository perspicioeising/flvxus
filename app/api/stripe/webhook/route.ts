import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type Stripe from 'stripe';

import { getStripe } from '@/lib/stripe/server';
import {
  deveAplicarEvento,
  mapWebhookEvent,
  type FamiliaEvento,
  type LinhaOrdenacao,
  type SubscriptionPatch,
} from '@/lib/stripe/webhook-map';
import type { Database } from '@/types/database.types';

/**
 * Webhook do Stripe (Fase 3 / design §6e). Route handler Next (Node runtime — o
 * SDK e a verificação de assinatura exigem Node). Valida a assinatura com
 * STRIPE_WEBHOOK_SECRET (FR6.4), mapeia o evento (função pura) e grava em
 * `subscriptions` via service_role (ignora RLS), idempotente por
 * stripe_subscription_id / tenant. Responde 400 em assinatura inválida, 200 OK,
 * 500 em erro de processamento (o Stripe re-tenta — upserts são idempotentes).
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Cliente service_role cru (sem escopo de tenant): o webhook resolve o tenant
 * a partir do evento e grava escopado por tenant_id / stripe_subscription_id. */
function serviceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios.');
  }
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

type Db = ReturnType<typeof serviceRoleClient>;

/** Lê a linha atual (campos de ordenação) — sempre filtrada por tenant_id. */
async function lerLinha(db: Db, tenantId: string): Promise<LinhaOrdenacao | null> {
  const { data } = await db
    .from('subscriptions')
    .select('status, stripe_subscription_id, stripe_event_at, stripe_event_kind')
    .eq('tenant_id', tenantId)
    .maybeSingle();
  return (data as LinhaOrdenacao | null) ?? null;
}

/** Monta o UPDATE (resolvendo plan_id/billing_cycle pelo price). */
async function montarUpdate(db: Db, patch: SubscriptionPatch): Promise<Record<string, unknown>> {
  const { stripePriceId, ...campos } = patch;
  const update: Record<string, unknown> = { ...campos };
  // Resolve plan_id pelo price, cobrindo as colunas mensal/anual e o legado
  // (stripe_price_id). Price desconhecido => mantém o plan_id atual (não derruba
  // o webhook). O ciclo é derivado da coluna que casou.
  if (stripePriceId) {
    // Valida o formato do price antes de montar o filtro `.or` (evita injeção
    // de operadores PostgREST via string do evento). Price malformado => não
    // altera plan_id/billing_cycle.
    if (!/^price_[A-Za-z0-9]+$/.test(stripePriceId)) {
      console.warn('[stripe webhook] price com formato inesperado, ignorado:', stripePriceId);
    } else {
      const { data: plano } = await db
        .from('plans')
        .select('id, stripe_price_id_monthly, stripe_price_id_yearly')
        .or(
          `stripe_price_id_monthly.eq.${stripePriceId},stripe_price_id_yearly.eq.${stripePriceId},stripe_price_id.eq.${stripePriceId}`
        )
        .maybeSingle();
      if (plano?.id) {
        update.plan_id = plano.id;
        update.billing_cycle = plano.stripe_price_id_yearly === stripePriceId ? 'yearly' : 'monthly';
      }
    }
  }
  return update;
}

/**
 * Aplica o patch com ORDEM/IDEMPOTÊNCIA (`deveAplicarEvento`) e UPDATE otimista
 * por `stripe_event_at` (protege contra duas entregas concorrentes). Evento
 * descartado => resolve sem escrever (200). Conflito persistente => lança (500,
 * a Stripe re-tenta). Toda escrita é filtrada por tenant_id.
 */
async function aplicarEvento(
  db: Db,
  tenantId: string,
  patch: SubscriptionPatch,
  ev: { kind: FamiliaEvento; subscriptionId?: string; created: number }
): Promise<void> {
  const update = await montarUpdate(db, patch);
  for (let tentativa = 0; tentativa < 2; tentativa += 1) {
    const linha = await lerLinha(db, tenantId);
    if (!deveAplicarEvento(linha, ev)) {
      console.warn('[stripe webhook] evento descartado (ordem/terminal) para o tenant.');
      return;
    }
    if (!linha) {
      // Sem linha: cria (PK tenant_id).
      await db
        .from('subscriptions')
        .upsert({ tenant_id: tenantId, ...update }, { onConflict: 'tenant_id' });
      return;
    }
    let q = db.from('subscriptions').update(update).eq('tenant_id', tenantId);
    q = linha.stripe_event_at == null ? q.is('stripe_event_at', null) : q.eq('stripe_event_at', linha.stripe_event_at);
    const { data: afetadas } = await q.select('tenant_id');
    if (afetadas && afetadas.length > 0) {
      return;
    }
  }
  throw new Error('conflito de escrita concorrente em subscriptions');
}

/** Resolve o tenant a partir das pistas do evento (metadata ou customer). */
async function resolverTenant(
  db: ReturnType<typeof serviceRoleClient>,
  hint: { tenantId?: string; stripeCustomerId?: string }
): Promise<string | null> {
  if (hint.tenantId) {
    return hint.tenantId;
  }
  if (hint.stripeCustomerId) {
    const { data } = await db
      .from('subscriptions')
      .select('tenant_id')
      .eq('stripe_customer_id', hint.stripeCustomerId)
      .maybeSingle();
    return data?.tenant_id ?? null;
  }
  return null;
}

export async function POST(req: Request): Promise<Response> {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error('[stripe webhook] STRIPE_WEBHOOK_SECRET ausente.');
    return NextResponse.json({ error: 'webhook não configurado' }, { status: 500 });
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'assinatura ausente' }, { status: 400 });
  }

  const raw = await req.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(raw, signature, secret);
  } catch {
    // Assinatura inválida — NÃO logar o corpo. Responde 400 (FR6.4).
    return NextResponse.json({ error: 'assinatura inválida' }, { status: 400 });
  }

  try {
    const mapped = mapWebhookEvent(event);
    if (mapped.ignored) {
      return NextResponse.json({ received: true });
    }

    const db = serviceRoleClient();
    const tenantId = await resolverTenant(db, mapped.tenant);

    if (!tenantId) {
      // Sem tenant resolvido: não há o que gravar. 200 para não gerar re-tentativa
      // infinita de um evento que não mapeia a nenhum tenant conhecido.
      console.warn('[stripe webhook] tenant não resolvido para', event.type);
      return NextResponse.json({ received: true });
    }

    await aplicarEvento(db, tenantId, mapped.patch, {
      kind: mapped.kind ?? 'subscription',
      subscriptionId: mapped.subscriptionId,
      created: mapped.created,
    });
    return NextResponse.json({ received: true });
  } catch (erro) {
    console.error(
      '[stripe webhook] erro de processamento:',
      erro instanceof Error ? erro.message : 'desconhecido'
    );
    // 500 => Stripe re-tenta; upserts são idempotentes, re-entrega é segura.
    return NextResponse.json({ error: 'erro de processamento' }, { status: 500 });
  }
}
