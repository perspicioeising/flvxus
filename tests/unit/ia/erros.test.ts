import { describe, expect, it } from 'vitest';

import { mapearErroIa, MSG_IA_INDISPONIVEL } from '@/lib/ia/erros';

describe('mapearErroIa', () => {
  it('401 → sessão expirada', () => {
    expect(mapearErroIa({ status: 401 })).toMatch(/Sessão expirada/i);
  });

  it('403 → apenas o professor', () => {
    expect(mapearErroIa({ status: 403 })).toMatch(/Apenas o professor/i);
  });

  it('429 → muitas requisições', () => {
    expect(mapearErroIa({ status: 429 })).toMatch(/Muitas requisições/i);
  });

  it('502/503/504 → indisponível', () => {
    expect(mapearErroIa({ status: 502 })).toBe(MSG_IA_INDISPONIVEL);
    expect(mapearErroIa({ status: 503 })).toBe(MSG_IA_INDISPONIVEL);
    expect(mapearErroIa({ status: 504 })).toBe(MSG_IA_INDISPONIVEL);
  });

  it('erro de transporte (FunctionsFetchError) → indisponível', () => {
    expect(mapearErroIa({ name: 'FunctionsFetchError' })).toBe(MSG_IA_INDISPONIVEL);
  });

  it('erro de relay (FunctionsRelayError) → indisponível', () => {
    expect(mapearErroIa({ name: 'FunctionsRelayError' })).toBe(MSG_IA_INDISPONIVEL);
  });

  it('sem status (função não encontrada) → indisponível', () => {
    expect(mapearErroIa({ status: null })).toBe(MSG_IA_INDISPONIVEL);
    expect(mapearErroIa(null)).toBe(MSG_IA_INDISPONIVEL);
    expect(mapearErroIa(undefined)).toBe(MSG_IA_INDISPONIVEL);
  });

  it('400 com mensagem no corpo → usa a mensagem da função', () => {
    const msg = mapearErroIa({
      status: 400,
      body: { error: { code: 'bad_request', message: 'Entrada inválida para geração de dieta.' } },
    });
    expect(msg).toBe('Entrada inválida para geração de dieta.');
  });

  it('400 sem mensagem no corpo → mensagem genérica', () => {
    const msg = mapearErroIa({ status: 400, body: null });
    expect(msg).toMatch(/Não foi possível concluir/i);
  });

  it('500 sem corpo → mensagem genérica', () => {
    const msg = mapearErroIa({ status: 500 });
    expect(msg).toMatch(/Não foi possível concluir/i);
  });
});
