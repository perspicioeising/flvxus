'use server';

import { assertMaster } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { getStripe } from '@/lib/stripe/server';
import { siteUrl } from '@/lib/site-url';
import { criarSessaoCheckout } from '@/lib/billing/checkout';
import { erroDeCampo } from '@/actions/_estado';
import { iniciarCheckoutSchema } from '@/schemas/billing';
import type { EstadoAcao } from '@/actions/_estado';

/** EstadoAcao de checkout: pode trazer a URL de redirect da sessão do Stripe. */
export interface EstadoCheckout extends EstadoAcao {
  url?: string;
}

/**
 * Inicia um checkout do Stripe para o master assinar. MASTER-ONLY. Casca fina:
 * Zod -> assertMaster -> `criarSessaoCheckout` (lib/billing/checkout.ts).
 * Isenta do gate de somente leitura (é como se sai do bloqueio). As chaves do
 * Stripe vêm de env (server-only); nunca commitadas.
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
  const resultado = await criarSessaoCheckout({
    user: master,
    tier: parsed.data.tier,
    cycle: parsed.data.cycle,
  });
  if (!resultado.ok) {
    return { ok: false, message: resultado.message };
  }
  return { ok: true, url: resultado.url };
}

/**
 * Abre o Customer Portal da Stripe (atualizar pagamento, cancelar, trocar de
 * plano). MASTER-ONLY. Requer o portal configurado no Dashboard da Stripe.
 */
export async function abrirPortal(): Promise<EstadoCheckout> {
  const master = await assertMaster();
  if (!master) {
    return { ok: false, message: 'Acesso negado.' };
  }
  try {
    const supabase = await createClient();
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('tenant_id', master.tenantId)
      .maybeSingle();
    if (!sub?.stripe_customer_id) {
      return { ok: false, message: 'Você ainda não tem assinatura para gerenciar.' };
    }
    const sessao = await getStripe().billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: siteUrl('/professor/plano'),
    });
    return { ok: true, url: sessao.url };
  } catch (erro) {
    console.error(
      '[abrirPortal] Falha no Stripe:',
      erro instanceof Error ? erro.message : 'erro desconhecido'
    );
    return { ok: false, message: 'Não foi possível abrir o portal. Tente novamente.' };
  }
}
