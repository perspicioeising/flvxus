/**
 * Saída estruturada da Anthropic via tool-use forçada (`tool_choice`).
 *
 * Esta é a parte PURA da camada de IA: monta a definição de tool a partir de um
 * JSON Schema, extrai o `input` da tool do corpo de resposta e valida com Zod.
 * NENHUMA API só-Deno (`Deno.*`) e nenhum efeito (sem fetch, sem log) — por isso
 * é importável diretamente pelo Vitest para testar parsing+validação com uma
 * resposta da Anthropic FAKE.
 *
 * `zod` entra por especificador bare: resolve em node_modules no Vitest/Next e
 * via import_map no runtime Deno.
 */

import { z } from 'zod';

/** JSON Schema de entrada da tool (subconjunto suficiente para forçar o formato). */
export type JsonSchema = Record<string, unknown>;

/** Definição de tool no formato aceito pela Messages API da Anthropic. */
export interface AnthropicTool {
  name: string;
  description: string;
  input_schema: JsonSchema;
}

/**
 * Monta uma tool a partir de um JSON Schema. O nome da tool é o canal pelo qual
 * forçamos a saída estruturada (`tool_choice: { type: 'tool', name }`).
 */
export function buildTool(
  name: string,
  description: string,
  inputSchema: JsonSchema,
): AnthropicTool {
  return { name, description, input_schema: inputSchema };
}

/** Bloco de conteúdo de uma resposta da Messages API (forma mínima que usamos). */
interface ContentBlock {
  type: string;
  name?: string;
  input?: unknown;
}

/** Forma mínima da resposta da Messages API que o parser consome. */
export interface AnthropicMessageResponse {
  content?: ContentBlock[];
  stop_reason?: string | null;
}

/**
 * Extrai o `input` do bloco `tool_use` cujo nome bate com `toolName`.
 * Retorna `undefined` se a IA não chamou a tool esperada (saída malformada).
 * PURO: só lê o objeto recebido.
 */
export function extractToolInput(
  response: AnthropicMessageResponse,
  toolName: string,
): unknown {
  const blocks = response.content ?? [];
  const toolBlock = blocks.find(
    (block) => block.type === 'tool_use' && block.name === toolName,
  );
  return toolBlock?.input;
}

/** Resultado de uma validação: sucesso tipado ou erro legível. */
export type ParseResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

/**
 * Pipeline PURO: extrai o input da tool e valida com o schema Zod.
 * Nunca lança por entrada malformada — devolve `{ ok: false }` para o chamador
 * decidir retry/fallback. Garante que nada inválido chegue ao banco.
 */
export function parseToolOutput<T>(
  response: AnthropicMessageResponse,
  toolName: string,
  schema: z.ZodType<T>,
): ParseResult<T> {
  const input = extractToolInput(response, toolName);
  if (input === undefined) {
    return { ok: false, error: 'A IA não retornou a saída estruturada esperada.' };
  }
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: 'A saída da IA não passou na validação de schema.' };
  }
  return { ok: true, data: parsed.data };
}
