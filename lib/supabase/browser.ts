import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database.types';

/**
 * Cliente Supabase para Client Components (browser).
 *
 * Usa a sessao do navegador (cookies gerenciados pelo @supabase/ssr) com o RLS
 * ativo. Ler/escrever dados sensiveis continua passando por RLS; para leituras
 * de render inicial prefira o cliente de servidor (lib/supabase/server.ts).
 *
 * Nota sobre o build: `createBrowserClient` lanca se a URL/anon key vierem vazias.
 * Durante o `next build`, paginas client da v1 sao pre-renderizadas no servidor
 * e instanciam este client pelo SupabaseProvider; num ambiente sem
 * NEXT_PUBLIC_SUPABASE_* (ex.: build/CI sem segredos) isso quebraria a geracao
 * estatica. Por isso, quando as variaveis estao ausentes, caimos em
 * placeholders sinteticos SO para permitir a construcao no prerender — em
 * runtime real (browser/deploy/CI com segredos) os valores reais sao usados e
 * nenhuma requisicao e feita com os placeholders (as paginas so consultam o
 * Supabase apos montar no cliente, ja com o env real).
 */
const FALLBACK_URL = 'http://localhost:54321';
const FALLBACK_ANON_KEY = 'public-anon-key-placeholder';

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_ANON_KEY
  );
}
