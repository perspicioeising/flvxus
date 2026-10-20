/**
 * Cliente fino da Anthropic Messages API para as Edge Functions de IA.
 *
 * Decisões (ADR 0001 / architecture §8):
 * - `fetch` é INJETÁVEL (default: `globalThis.fetch`) para testar a lógica sem rede.
 * - Lê `ANTHROPIC_API_KEY` e `ANTHROPIC_MODEL` do ambiente; NUNCA loga a chave e
 *   NUNCA usa string de modelo fixa.
 * - Tool-use forçada via `tool_choice` (saída estruturada padrão).
 * - SEMPRE passa o `signal` do AbortController ao `fetch` (corrige o bug da v1,
 *   que não passava o signal e o timeout não cancelava a requisição).
 * - Retry limitado (2 tentativas extras) com backoff e fallback amigável.
 *
 * O parsing/validação da saída fica em `structured-output.ts` (parte PURA).
 */

import { aiFailure } from './errors.ts';
import type { AnthropicMessageResponse, AnthropicTool } from './structured-output.ts';

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';

/** Função de fetch injetável (mesma assinatura da global). */
export type FetchFn = typeof globalThis.fetch;

/** Leitor de variável de ambiente injetável (default: Deno.env). */
export type EnvReader = (name: string) => string | undefined;

const defaultEnvReader: EnvReader = (name) => {
  // `Deno` existe no runtime das Edge Functions; o guard evita quebrar fora dele.
  const denoEnv = (globalThis as { Deno?: { env: { get(k: string): string | undefined } } })
    .Deno?.env;
  return denoEnv?.get(name);
};

export interface AnthropicClientOptions {
  fetchFn?: FetchFn;
  env?: EnvReader;
  /** Tentativas extras após a primeira (ADR 0001: 2). */
  maxRetries?: number;
  /** Timeout real por requisição, em ms. */
  timeoutMs?: number;
}

export interface MessagesRequest {
  system: string;
  userContent: string;
  tool: AnthropicTool;
  /** Teto de tokens de saída (guarda-corpo de custo). */
  maxTokens: number;
}

export interface MessagesResult {
  response: AnthropicMessageResponse;
  inputTokens: number | null;
  outputTokens: number | null;
  model: string;
}

/** Erro que pode ser tentado de novo (rede / 5xx / 429). */
function isRetryable(status: number): boolean {
  return status === 429 || status >= 500;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class AnthropicClient {
  readonly #fetch: FetchFn;
  readonly #env: EnvReader;
  readonly #maxRetries: number;
  readonly #timeoutMs: number;

  constructor(opts: AnthropicClientOptions = {}) {
    this.#fetch = opts.fetchFn ?? globalThis.fetch.bind(globalThis);
    this.#env = opts.env ?? defaultEnvReader;
    this.#maxRetries = opts.maxRetries ?? 2;
    this.#timeoutMs = opts.timeoutMs ?? 60_000;
  }

  /** Modelo configurado; nunca uma string fixa (ADR 0001 §1). */
  #model(): string {
    const model = this.#env('ANTHROPIC_MODEL');
    if (!model) {
      throw aiFailure('ANTHROPIC_MODEL não configurado no ambiente da função.');
    }
    return model;
  }

  #apiKey(): string {
    const key = this.#env('ANTHROPIC_API_KEY');
    if (!key) {
      throw aiFailure('ANTHROPIC_API_KEY não configurado no ambiente da função.');
    }
    return key;
  }

  /**
   * Chama a Messages API com tool-use forçada. SEMPRE passa o signal do
   * AbortController. Retry limitado + fallback amigável. NUNCA loga a chave.
   */
  async createMessage(req: MessagesRequest): Promise<MessagesResult> {
    const model = this.#model();
    const apiKey = this.#apiKey();

    const body = JSON.stringify({
      model,
      max_tokens: req.maxTokens,
      system: req.system,
      // Dados do aluno entram como DADOS numa mensagem de user (anti-injection).
      messages: [{ role: 'user', content: req.userContent }],
      tools: [req.tool],
      // Força a saída estruturada pela tool.
      tool_choice: { type: 'tool', name: req.tool.name },
    });

    let lastError: unknown;
    for (let attempt = 0; attempt <= this.#maxRetries; attempt++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.#timeoutMs);
      try {
        const res = await this.#fetch(ANTHROPIC_URL, {
          method: 'POST',
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': ANTHROPIC_VERSION,
            'content-type': 'application/json',
          },
          body,
          // Correção do bug da v1: o signal é SEMPRE passado ao fetch.
          signal: controller.signal,
        });

        if (!res.ok) {
          if (isRetryable(res.status) && attempt < this.#maxRetries) {
            lastError = new Error(`status ${res.status}`);
            await sleep(250 * (attempt + 1));
            continue;
          }
          // Falha não-recuperável: consome o corpo sem logar a chave.
          throw aiFailure();
        }

        const json = (await res.json()) as AnthropicMessageResponse & {
          model?: string;
          usage?: { input_tokens?: number; output_tokens?: number };
        };

        return {
          response: json,
          inputTokens: json.usage?.input_tokens ?? null,
          outputTokens: json.usage?.output_tokens ?? null,
          model: json.model ?? model,
        };
      } catch (err) {
        lastError = err;
        // Timeout/rede: tenta de novo se ainda há tentativas.
        if (attempt < this.#maxRetries) {
          await sleep(250 * (attempt + 1));
          continue;
        }
      } finally {
        clearTimeout(timer);
      }
    }

    // Fallback amigável; não vaza detalhe interno nem a chave.
    void lastError;
    throw aiFailure();
  }
}
