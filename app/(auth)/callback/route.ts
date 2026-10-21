import { NextResponse, type NextRequest } from 'next/server';

import { createClient } from '@/lib/supabase/server';

/**
 * Callback de autenticação (padrão oficial @supabase/ssr, fluxo PKCE).
 *
 * É um ROUTE HANDLER server-side: roda ANTES de renderizar qualquer página.
 * Os links de convite / magic link do Supabase chegam aqui com `?code=...`.
 * Trocamos esse `code` por uma sessão (cookies HttpOnly) via
 * `exchangeCodeForSession` e só então redirecionamos:
 *
 * - Convite de aluno (`?next=/set-password`): o aluno ainda não tem senha, então
 *   vai para `/set-password`, onde a sessão já existe e ele só precisa definir a
 *   senha (`updateUser`).
 * - Login por magic link de um usuário já ativo: encaminhamos para a área do
 *   papel (`/professor` ou `/aluno`) lido de `profiles.role`.
 *
 * Se a troca falhar (link inválido/expirado), voltamos para `/login` com um erro.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // Fluxo "verify" (token_hash): formato robusto entre dispositivos usado pelos
  // e-mails de convite/magic link/recovery quando o template aponta para
  // `/callback?token_hash=...&type=...`. Coexiste com o PKCE (`?code=`).
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const next = searchParams.get('next') ?? searchParams.get('redirect_to');

  // Precisa de UM dos dois: `code` (PKCE) ou `token_hash` (verify). Sem nenhum,
  // o link é inválido/incompleto.
  if (!code && !tokenHash) {
    return NextResponse.redirect(`${origin}/login?error=invalid_link`);
  }

  const supabase = await createClient();

  let userId: string | null = null;

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error || !data.user) {
      return NextResponse.redirect(`${origin}/login?error=invalid_link`);
    }
    userId = data.user.id;
  } else if (tokenHash) {
    // `verifyOtp` troca o token_hash por sessão (grava cookies). `type` vem do
    // template (ex.: 'invite', 'magiclink', 'recovery', 'signup', 'email').
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: (type ?? 'invite') as 'invite' | 'magiclink' | 'recovery' | 'signup' | 'email',
    });
    if (error || !data.user) {
      return NextResponse.redirect(`${origin}/login?error=invalid_link`);
    }
    userId = data.user.id;
  }

  if (!userId) {
    return NextResponse.redirect(`${origin}/login?error=invalid_link`);
  }

  // Convite para definir senha: encaminha direto para a tela de senha. A sessão
  // já foi criada acima (cookies), então /set-password apenas exibe o form.
  // Um convite (type=invite) sempre leva o aluno a definir a senha, mesmo que o
  // `next` não tenha sido propagado pelo provedor de e-mail.
  if ((next && next.includes('set-password')) || type === 'invite') {
    return NextResponse.redirect(`${origin}/set-password`);
  }

  // Caso geral: usuário já ativo logando por magic link → manda para a área
  // conforme o papel. Sem perfil/erro volta ao login.
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', userId)
    .single();

  if (!profile) {
    return NextResponse.redirect(`${origin}/login?error=no_profile`);
  }

  const destino = profile.role === 'student' ? '/aluno' : '/professor';
  return NextResponse.redirect(`${origin}${destino}`);
}
