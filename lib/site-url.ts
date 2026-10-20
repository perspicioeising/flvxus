/**
 * Resolve a URL base pública do site (sem barra final).
 *
 * Fonte de verdade: `NEXT_PUBLIC_SITE_URL` (ex.: https://flvxus.vercel.app em
 * produção). Em desenvolvimento, quando a variável não está definida, cai em
 * `http://localhost:3000`. O domínio de produção NUNCA é hardcodado aqui — ele
 * vem exclusivamente do ambiente.
 *
 * Usado para montar `redirectTo` de convites/magic link do Supabase Auth, de
 * forma que o link do e-mail aponte para a rota de callback do app
 * (`${siteUrl}/callback`). A Redirect URL configurada no painel do Supabase
 * (Authentication > URL Configuration) precisa casar com esse valor —
 * ver docs/pendencias.md.
 */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  // Remove barras finais para evitar `//callback` ao concatenar caminhos.
  return raw.replace(/\/+$/, '');
}

/**
 * Monta uma URL absoluta a partir da URL base do site e um caminho relativo.
 * Ex.: `siteUrl('/callback?next=/set-password')`.
 */
export function siteUrl(path: string): string {
  const base = getSiteUrl();
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}
