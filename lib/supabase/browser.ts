import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database.types';

/**
 * Cliente Supabase para Client Components (browser).
 *
 * Usa a sessao do navegador (cookies gerenciados pelo @supabase/ssr) com o RLS
 * ativo. Ler/escrever dados sensiveis continua passando por RLS; para leituras
 * de render inicial prefira o cliente de servidor (lib/supabase/server.ts).
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
