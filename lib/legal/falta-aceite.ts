import type { SupabaseClient } from '@supabase/supabase-js';

import { createClient } from '@/lib/supabase/server';
import { PRIVACY_VERSION, TERMS_VERSION } from '@/lib/legal/versions';
import type { Database, LegalDocumentType } from '@/types/database.types';

/**
 * Gancho de re-aceite de versão (design.md §2.9). Para cada documento legal,
 * verifica se o usuário JÁ aceitou a VERSÃO CORRENTE. Reusado pelo gancho
 * idempotente de materialização do aceite (layout/guard de /professor e
 * /callback) — curto-circuita e NÃO insere quando o aceite já existe.
 *
 * Hoje o único consumo é materializar silenciosamente o aceite pendente do
 * onboarding. Quando `TERMS_VERSION`/`PRIVACY_VERSION` subirem, esta função
 * passa a retornar "falta" automaticamente — o ponto único a evoluir depois é
 * O QUE FAZER quando falta (tela de re-consentimento), hoje fora de escopo.
 */

/** Versão corrente por tipo de documento. */
const VERSAO_CORRENTE: Record<LegalDocumentType, string> = {
  terms: TERMS_VERSION,
  privacy: PRIVACY_VERSION,
};

/** Resultado da checagem: quais documentos ainda faltam na versão corrente. */
export interface FaltaAceiteResultado {
  terms: boolean;
  privacy: boolean;
  /** Verdadeiro quando falta aceite de PELO MENOS um documento. */
  algumFaltando: boolean;
}

/**
 * Retorna quais documentos ainda não têm aceite da versão corrente para o
 * usuário. Aceita um client Supabase por parâmetro (mockável nos testes); se
 * omitido, cria um server client (RLS ativo). Best-effort: em erro de leitura,
 * assume que falta (deixa o gancho tentar gravar — o índice único evita
 * duplicata).
 */
export async function faltaAceiteDaVersaoCorrente(
  userId: string,
  supabase?: SupabaseClient<Database>,
): Promise<FaltaAceiteResultado> {
  const client = supabase ?? (await createClient());

  const faltaDe = async (tipo: LegalDocumentType): Promise<boolean> => {
    const { data, error } = await client
      .from('terms_acceptances')
      .select('id')
      .eq('user_id', userId)
      .eq('document_type', tipo)
      .eq('document_version', VERSAO_CORRENTE[tipo])
      .limit(1);

    if (error) {
      // Leitura falhou: assume que falta para não bloquear a materialização.
      return true;
    }
    return !data || data.length === 0;
  };

  const terms = await faltaDe('terms');
  const privacy = await faltaDe('privacy');

  return { terms, privacy, algumFaltando: terms || privacy };
}
