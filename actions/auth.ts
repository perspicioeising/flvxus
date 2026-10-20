'use server';

import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';

/**
 * Server Actions de autenticação (architecture.md §5).
 *
 * O cadastro de professor e o login rodam no cliente (browser client) porque a
 * UI já é um Client Component com react-hook-form; aqui ficam apenas as ações
 * que precisam do contexto de servidor. O `signOut` encerra a sessão (limpando
 * os cookies via @supabase/ssr) e redireciona para `/login`.
 */
export async function sair(): Promise<never> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
