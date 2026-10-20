import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database.types';

/**
 * Cliente Supabase para o servidor (RSC, Server Actions e Route Handlers).
 *
 * Opera com a sessao do usuario autenticado (cookies) e, portanto, com o RLS
 * ativo. No Next 15 `cookies()` e assincrono, por isso a funcao e `async`.
 *
 * Em contexto somente-leitura (Server Component), chamar `cookies().set(...)`
 * lanca; por isso o `setAll` e envolvido em try/catch. A renovacao de sessao
 * que depende de escrever cookies e feita no middleware (lib/supabase/middleware.ts).
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // `setAll` foi chamado a partir de um Server Component (contexto
            // somente-leitura). Pode ser ignorado com seguranca quando ha um
            // middleware renovando as sessoes do usuario.
          }
        },
      },
    }
  );
}
