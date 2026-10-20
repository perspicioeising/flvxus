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
  const next = searchParams.get('next') ?? searchParams.get('redirect_to');

  // Sem `code` não há o que trocar: link inválido/incompleto.
  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=invalid_link`);
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/login?error=invalid_link`);
  }

  // Convite para definir senha: encaminha direto para a tela de senha. A sessão
  // já foi criada acima (cookies), então /set-password apenas exibe o form.
  if (next && next.includes('set-password')) {
    return NextResponse.redirect(`${origin}/set-password`);
  }

  // Caso geral: usuário já ativo logando por magic link → manda para a área
  // conforme o papel. Sem perfil/erro volta ao login.
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', data.user.id)
    .single();

  if (!profile) {
    return NextResponse.redirect(`${origin}/login?error=no_profile`);
  }

  const destino = profile.role === 'student' ? '/aluno' : '/professor';
  return NextResponse.redirect(`${origin}${destino}`);
}
