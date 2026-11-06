import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { criarSessaoCheckout } from '@/lib/billing/checkout';
import { lerIntencao, queryIntencao } from '@/lib/billing/intencao';

/**
 * `GET /assinar?plano=...&ciclo=...` — porta de entrada da landing para o
 * checkout. Mantém a landing estática (ela não sabe se há sessão):
 *  - sem sessão => cadastro com a intenção (plano/ciclo) preservada;
 *  - logado master => cria a sessão do Stripe e redireciona para ela;
 *  - demais => home do papel. Nenhum destino vem de input (sem open redirect).
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function ehPrefetch(req: Request): boolean {
  const h = req.headers;
  return (
    h.has('next-router-prefetch') ||
    h.has('next-router-state-tree') ||
    h.get('rsc') === '1' ||
    h.get('purpose') === 'prefetch' ||
    h.get('sec-purpose')?.includes('prefetch') === true
  );
}

function ir(req: Request, caminho: string): Response {
  const res = NextResponse.redirect(new URL(caminho, req.url), 303);
  res.headers.set('Cache-Control', 'no-store');
  return res;
}

export async function GET(req: Request): Promise<Response> {
  // Prefetch do Next não pode criar customer/sessão: responde 204 sem efeito.
  if (ehPrefetch(req)) {
    return new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
  }

  const intencao = lerIntencao(new URL(req.url).searchParams);
  if (!intencao) {
    return ir(req, '/#planos');
  }

  const user = await getSessionUser();
  if (!user) {
    return ir(req, `/register?${queryIntencao(intencao, true)}`);
  }
  if (user.role !== 'trainer' || !user.isMaster) {
    return ir(req, user.role === 'student' ? '/aluno' : '/professor');
  }

  const resultado = await criarSessaoCheckout({
    user,
    tier: intencao.plano,
    cycle: intencao.ciclo,
  });
  if (resultado.ok) {
    const res = NextResponse.redirect(resultado.url, 303);
    res.headers.set('Cache-Control', 'no-store');
    return res;
  }
  if (resultado.reason === 'conta_incompativel') {
    return ir(req, '/professor/plano?checkout=incompativel');
  }
  if (resultado.reason === 'ja_assinante') {
    return ir(req, '/professor/plano?checkout=ja_assinante');
  }
  return ir(req, '/professor/plano?checkout=erro');
}
