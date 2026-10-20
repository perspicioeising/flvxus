/**
 * Cabeçalhos e preflight de CORS para as Edge Functions de IA.
 *
 * PURO o bastante para Vitest (sem `Deno.*`). O front chama estas funções via
 * fetch autenticado; o `Authorization` precisa ser permitido no preflight.
 */

export const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

/** Responde ao preflight `OPTIONS`; retorna `null` se não for preflight. */
export function handlePreflight(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  return null;
}
