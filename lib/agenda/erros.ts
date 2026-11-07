/**
 * Erros da Agenda: as funções SQL levantam `P0001` com `message` = código.
 * Mapeia o código para texto pt-BR (puro). Design: §10.
 */

export const MENSAGEM_GENERICA_AGENDA =
  'Não foi possível concluir a operação na agenda. Tente novamente.';

const MENSAGENS: Record<string, string> = {
  agenda_forbidden: 'Você não tem permissão para esta ação na agenda.',
  agenda_student_invalid: 'Aluno inválido ou indisponível para este compromisso.',
  agenda_past: 'Compromissos que já passaram não podem ser alterados.',
  agenda_immutable: 'Este compromisso não pode ser alterado.',
  agenda_invalid_occurrence: 'Essa ocorrência não existe nesta série.',
  agenda_invalid_range: 'Horário ou data inválidos para este compromisso.',
};

/** Código de agenda reconhecido a partir de um erro do Postgres/PostgREST, ou `null`. */
export function codigoErroAgenda(erro: { code?: string | null; message?: string | null } | null | undefined): string | null {
  if (!erro || erro.code !== 'P0001') return null;
  const msg = (erro.message ?? '').trim();
  return msg in MENSAGENS ? msg : null;
}

/** Mensagem pt-BR para um erro de RPC da agenda; genérica quando não reconhecido. */
export function mensagemErroAgenda(
  erro: { code?: string | null; message?: string | null } | null | undefined
): string {
  const codigo = codigoErroAgenda(erro);
  return codigo ? MENSAGENS[codigo] : MENSAGEM_GENERICA_AGENDA;
}
