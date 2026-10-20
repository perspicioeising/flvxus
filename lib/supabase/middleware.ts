import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { User } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

/**
 * Helper de sessao para o middleware (padrao oficial do @supabase/ssr).
 *
 * Instancia o cliente de middleware, renova a sessao via `supabase.auth.getUser()`
 * e devolve a `response` (com os cookies de sessao sincronizados) junto do `user`
 * resolvido. O `middleware.ts` da raiz usa esse resultado para barrar/redirecionar,
 * sem decidir papel (o gate por papel fica nos layouts server-side — architecture.md §5.2).
 *
 * IMPORTANTE: nao insira logica entre `createServerClient` e `getUser()`. Isso pode
 * causar logout aleatorio dos usuarios por dessincronizacao de cookies.
 */
export async function updateSession(
  request: NextRequest
): Promise<{ response: NextResponse; user: User | null }> {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user };
}
