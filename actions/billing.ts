'use server';

import { assertMaster } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getStripe } from '@/lib/stripe/server';
import { siteUrl } from '@/lib/site-url';
import { erroDeCampo } from '@/actions/_estado';
import { iniciarCheckoutSchema } from '@/schemas/billing';

import type { EstadoAcao } from '@/actions/_estado';

/** EstadoAcao de checkout: pode trazer a URL de redirect da sessão do Stripe. */
export interface EstadoCheckout extends EstadoAcao {
  url?: string;
}

/**
 * Inicia um checkout do Stripe (modo TEST) para o master assinar/trocar de plano.
 * MASTER-ONLY. Resolve o plano pelo tier, garante o customer do tenant e cria a
 * checkout session com `metadata.tenant_id` (o elo que o webhook usa). As chaves
 * do Stripe vêm de env (server-only); nunca commitadas.
 */
export async function iniciarCheckout(
  _prev: EstadoCheckout | undefined,
  formData: FormData
): Promise<EstadoCheckout> {
  const master = await assertMaster();
  if (!master) {
    return { ok: false, message: 'Acesso negado.' };
  }

  const parsed = iniciarCheckoutSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      ok: false,
      message: 'Plano inválido.',
      fieldErrors: erroDeCampo(parsed.error.flatten()),
    };
  }

  const supabase = await createClient();

  // 1) Resolve o plano pelo tier; recusa price não configurado (placeholder).
  const { data: plano, error: erroPlano } = await supabase
    .from('plans')
    .select('id, stripe_price_id')
    .eq('tier', parsed.data.tier)
    .single();

  if (erroPlano || !plano) {
    return { ok: false, message: 'Plano não encontrado.' };
  }
  if (!plano.stripe_price_id) {
    return {
      ok: false,
      message:
        'Este plano ainda não foi configurado (price ID do Stripe ausente). ' +
        'Defina o price em plans.stripe_price_id antes de assinar.',
    };
  }

  try {
    const stripe = getStripe();

    // 2) Garante o stripe_customer_id do tenant (lê subscriptions; cria se faltar).
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('tenant_id', master.tenantId)
      .maybeSingle();

    let customerId = sub?.stripe_customer_id ?? null;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: master.email ?? undefined,
        name: master.fullName ?? undefined,
        metadata: { tenant_id: master.tenantId },
      });
      customerId = customer.id;

      // Persiste o customer via service_role (escopado ao tenant). Se já existe
      // uma linha (criada por um webhook), o INSERT (PK=tenant_id) conflita; nesse
      // caso caímos no UPDATE. Ambos escopados ao tenant pela API fina.
      const admin = createAdminClient(master.tenantId);
      const { error: erroInsert } = (await admin.insert('subscriptions', {
        stripe_customer_id: customerId,
      })) as unknown as { error: { message: string } | null };

      if (erroInsert) {
        await admin.update('subscriptions', { stripe_customer_id: customerId });
      }
    }

    // 3) Cria a checkout session. metadata.tenant_id é o elo p/ o webhook.
    const checkout = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: plano.stripe_price_id, quantity: 1 }],
      success_url: siteUrl('/professor/plano?checkout=sucesso'),
      cancel_url: siteUrl('/professor/plano?checkout=cancelado'),
      metadata: { tenant_id: master.tenantId },
      subscription_data: { metadata: { tenant_id: master.tenantId } },
    });

    if (!checkout.url) {
      return { ok: false, message: 'Não foi possível iniciar o checkout. Tente novamente.' };
    }

    return { ok: true, url: checkout.url };
  } catch (erro) {
    // Sem logar segredos; mensagem recuperável em pt-BR.
    console.error(
      '[iniciarCheckout] Falha no Stripe:',
      erro instanceof Error ? erro.message : 'erro desconhecido'
    );
    return { ok: false, message: 'Não foi possível iniciar o checkout. Tente novamente.' };
  }
}
