/**
 * Saída estruturada da Anthropic via `output_config.format` (json_schema).
 *
 * Esta é a parte PURA da camada de IA: concatena os blocos de texto da resposta,
 * faz `JSON.parse` e valida com Zod. NENHUMA API só-Deno (`Deno.*`) e nenhum
 * efeito (sem fetch, sem log) — por isso é importável diretamente pelo Vitest
 * para testar parsing+validação com uma resposta da Anthropic FAKE.
 *
 * `zod` entra por especificador bare: resolve em node_modules no Vitest/Next e
 * via import_map no runtime Deno.
 */

import { z } from 'zod';

/** JSON Schema de saída (subconjunto suficiente para forçar o formato). */
export type JsonSchema = Record<string, unknown>;

/** Bloco de conteúdo de uma resposta da Messages API (forma mínima que usamos). */
interface ContentBlock {
  type: string;
  text?: string;
}

/** Forma mínima da resposta da Messages API que o parser consome. */
export interface AnthropicMessageResponse {
  content?: ContentBlock[];
  stop_reason?: string | null;
}

/** Resultado de uma validação: sucesso tipado ou erro legível. */
export type ParseResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

/**
 * Concatena os blocos `type === 'text'` da resposta (campo `.text`).
 * Retorna string vazia se não houver nenhum bloco de texto. PURO.
 */
function extractText(response: AnthropicMessageResponse): string {
  const blocks = response.content ?? [];
  return blocks
    .filter((block) => block.type === 'text' && typeof block.text === 'string')
    .map((block) => block.text as string)
    .join('');
}

/**
 * Pipeline PURO: concatena os blocos de texto da resposta (o JSON vem como
 * texto quando se usa `output_config.format`), faz `JSON.parse` e valida com o
 * schema Zod. Nunca lança por entrada malformada — devolve `{ ok: false }` para
 * o chamador decidir retry/fallback. Garante que nada inválido chegue ao banco.
 */
export function parseStructuredOutput<T>(
  response: AnthropicMessageResponse,
  schema: z.ZodType<T>,
): ParseResult<T> {
  const texto = extractText(response);
  if (!texto) {
    return { ok: false, error: 'A IA não retornou a saída estruturada esperada.' };
  }
  let input: unknown;
  try {
    input = JSON.parse(texto);
  } catch {
    return { ok: false, error: 'A saída da IA não é um JSON válido.' };
  }
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: 'A saída da IA não passou na validação de schema.' };
  }
  return { ok: true, data: parsed.data };
}
