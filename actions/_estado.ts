/**
 * Shape comum retornado pelas Server Actions para forms (padrão EstadoAcao).
 * Extraído para ser reusado por múltiplos domínios (alunos, filiados, billing)
 * sem duplicação. `actions/alunos.ts` reexporta este tipo (retrocompat de imports).
 */
export interface EstadoAcao {
  ok: boolean;
  /** Mensagem geral (erro ou sucesso) em pt-BR. */
  message?: string;
  /** Erros por campo (para exibir junto ao input). */
  fieldErrors?: Record<string, string>;
  /** Id do recurso afetado (ex.: aluno/filiado criado). */
  id?: string;
}

/** Converte os erros do Zod num mapa `campo -> primeira mensagem`. */
export function erroDeCampo(flatten: {
  fieldErrors: Record<string, string[] | undefined>;
}): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [campo, mensagens] of Object.entries(flatten.fieldErrors)) {
    if (mensagens && mensagens.length > 0) {
      out[campo] = mensagens[0];
    }
  }
  return out;
}
