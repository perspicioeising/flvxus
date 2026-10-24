import { describe, expect, it } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';

import { faltaAceiteDaVersaoCorrente } from '@/lib/legal/falta-aceite';
import { PRIVACY_VERSION, TERMS_VERSION } from '@/lib/legal/versions';
import type { Database } from '@/types/database.types';

/**
 * Mock mínimo do query builder do Supabase para `terms_acceptances`. Encadeia
 * `.select().eq().eq().eq().limit()` e resolve com as linhas registradas para a
 * combinação (document_type, document_version) pedida.
 */
function mockClient(
  aceitesExistentes: { type: 'terms' | 'privacy'; version: string }[],
): SupabaseClient<Database> {
  const builder = () => {
    const filtros: Record<string, string> = {};
    const chain = {
      select: () => chain,
      eq: (coluna: string, valor: string) => {
        filtros[coluna] = valor;
        return chain;
      },
      limit: () => {
        const existe = aceitesExistentes.some(
          (a) =>
            a.type === filtros.document_type &&
            a.version === filtros.document_version,
        );
        return Promise.resolve({
          data: existe ? [{ id: 'x' }] : [],
          error: null,
        });
      },
    };
    return chain;
  };

  return { from: () => builder() } as unknown as SupabaseClient<Database>;
}

describe('faltaAceiteDaVersaoCorrente', () => {
  it('não falta quando ambos os aceites da versão corrente existem', async () => {
    const client = mockClient([
      { type: 'terms', version: TERMS_VERSION },
      { type: 'privacy', version: PRIVACY_VERSION },
    ]);
    const r = await faltaAceiteDaVersaoCorrente('user-1', client);
    expect(r).toEqual({ terms: false, privacy: false, algumFaltando: false });
  });

  it('falta quando não há nenhum aceite', async () => {
    const client = mockClient([]);
    const r = await faltaAceiteDaVersaoCorrente('user-1', client);
    expect(r).toEqual({ terms: true, privacy: true, algumFaltando: true });
  });

  it('falta quando o aceite existente é de uma versão diferente da corrente', async () => {
    const client = mockClient([
      { type: 'terms', version: '0.9' },
      { type: 'privacy', version: PRIVACY_VERSION },
    ]);
    const r = await faltaAceiteDaVersaoCorrente('user-1', client);
    expect(r).toEqual({ terms: true, privacy: false, algumFaltando: true });
  });
});
