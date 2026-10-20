/**
 * Erros e respostas utilitárias da camada de IA (Edge Functions Deno).
 *
 * Mantém PURO o bastante para ser importável por Vitest: nenhuma API só-Deno
 * aqui (sem `Deno.*`). Depende apenas de `Response`/`Headers`, que existem tanto
 * no runtime Deno quanto no Node/jsdom usado nos testes.
 *
 * Os textos ao usuário são amigáveis (pt-BR) e NUNCA vazam detalhes internos
 * (nem chave, nem stack, nem corpo bruto da Anthropic).
 */

import { corsHeaders } from './cors.ts';

/** Classe de erro conhecida da camada de IA, com status HTTP associado. */
export class AiError extends Error {
  readonly status: number;
  /** Código estável para o cliente (ex.: 'unauthorized', 'rate_limited'). */
  readonly code: string;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = 'AiError';
    this.code = code;
    this.status = status;
  }
}

/** 401 — JWT ausente/ inválido. */
export const unauthorized = (message = 'Não autenticado.') =>
  new AiError('unauthorized', message, 401);

/** 403 — papel insuficiente (ex.: não é trainer). */
export const forbidden = (message = 'Acesso negado.') =>
  new AiError('forbidden', message, 403);

/** 400 — entrada inválida. */
export const badRequest = (message = 'Requisição inválida.') =>
  new AiError('bad_request', message, 400);

/** 429 — rate limit estourado. */
export const rateLimited = (message = 'Muitas requisições. Tente novamente em instantes.') =>
  new AiError('rate_limited', message, 429);

/** 502 — falha ao gerar/validar a saída da IA. */
export const aiFailure = (
  message = 'Não foi possível gerar o conteúdo agora. Tente novamente.',
) => new AiError('ai_failure', message, 502);

/** Monta uma resposta JSON com CORS. */
export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

/**
 * Converte um erro qualquer numa Response segura. Erros desconhecidos viram
 * 500 genérico — nunca expõem a mensagem bruta ao cliente.
 */
export function errorResponse(err: unknown): Response {
  if (err instanceof AiError) {
    return jsonResponse({ error: { code: err.code, message: err.message } }, err.status);
  }
  return jsonResponse(
    { error: { code: 'internal_error', message: 'Erro interno. Tente novamente.' } },
    500,
  );
}
