/**
 * Mapeamento PURO de erros da camada de IA para mensagens pt-BR amigáveis
 * (sem React/Supabase) — testável em `tests/unit/ia/erros.test.ts`.
 *
 * As 3 Edge Functions respondem erro no formato
 * `{ error: { code, message } }` com status HTTP conhecido
 * (401/403/400/429/502/500). Quando a função não está deployada, ou há falha
 * de rede, o `supabase.functions.invoke` devolve um erro de transporte
 * (ex.: `FunctionsFetchError`) SEM status — tratamos como "indisponível".
 *
 * NÃO há checagem de consentimento aqui (decisão de escopo — ver FEAT-003).
 */

/** Mensagem genérica de indisponibilidade (função ausente/rede). */
export const MSG_IA_INDISPONIVEL = 'Recurso de IA indisponível no momento.';

/** Formato do corpo de erro retornado pelas Edge Functions. */
export interface CorpoErroIa {
  error?: { code?: string | null; message?: string | null } | null;
}

/**
 * Dados mínimos de um erro de IA que o mapeamento considera. Modelado para
 * casar tanto com o `FunctionsHttpError` (tem `context.status`/corpo) quanto
 * com o `FunctionsFetchError`/erros de rede (sem status).
 */
export interface EntradaErroIa {
  /** Status HTTP quando a função respondeu (401/403/429/502/...). */
  status?: number | null;
  /** Corpo de erro já desserializado, quando disponível. */
  body?: CorpoErroIa | null;
  /** Nome do erro do supabase-js (ex.: 'FunctionsFetchError'). */
  name?: string | null;
}

/**
 * Converte um erro de IA numa mensagem pt-BR para a UI.
 *
 * Regras (ordem importa):
 * - 401 → não autenticado.
 * - 403 → apenas o professor.
 * - 429 → muitas requisições.
 * - 502 / sem status / erro de transporte → indisponível.
 * - demais (400/500/...) → usa a mensagem do corpo, se houver, senão genérica.
 */
export function mapearErroIa(entrada: EntradaErroIa | null | undefined): string {
  const status = entrada?.status ?? null;
  const nome = entrada?.name ?? null;

  // Erro de transporte do supabase-js (função ausente/não deployada ou rede):
  // não tem status HTTP útil → degrada para "indisponível".
  if (nome === 'FunctionsFetchError' || nome === 'FunctionsRelayError') {
    return MSG_IA_INDISPONIVEL;
  }

  switch (status) {
    case 401:
      return 'Sessão expirada. Entre novamente para usar a IA.';
    case 403:
      return 'Apenas o professor pode usar os recursos de IA.';
    case 429:
      return 'Muitas requisições de IA. Tente novamente em instantes.';
    case 502:
    case 503:
    case 504:
      return MSG_IA_INDISPONIVEL;
    default:
      break;
  }

  // Sem status (ex.: função não encontrada) → indisponível.
  if (status == null) {
    return MSG_IA_INDISPONIVEL;
  }

  // Demais erros: prefere a mensagem pt-BR do corpo da função.
  const doCorpo = entrada?.body?.error?.message;
  if (typeof doCorpo === 'string' && doCorpo.trim().length > 0) {
    return doCorpo;
  }

  return 'Não foi possível concluir a operação de IA. Tente novamente.';
}
