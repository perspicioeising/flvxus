import type { MotivoAcesso } from '@/lib/billing/acesso';

/**
 * Textos pt-BR do bloqueio de somente leitura, ramificados por perfil.
 * O autônomo nunca fala em "professor"; aluno/filiado não recebem detalhes de
 * cobrança do responsável.
 */
export type PerfilAcesso = 'master' | 'autonomo' | 'filiado' | 'aluno';

export const MSG_INDISPONIVEL = 'Não foi possível verificar sua assinatura agora. Tente novamente em instantes.';

export function mensagemBloqueio(motivo: MotivoAcesso, perfil: PerfilAcesso): string {
  if (perfil === 'filiado') {
    return 'A assinatura desta conta está inativa. Peça ao responsável pela conta para regularizar e liberar a edição.';
  }
  if (perfil === 'aluno') {
    return 'O acesso do seu personal está suspenso no momento. Você continua podendo consultar seus treinos e histórico, mas não registrar novos treinos até ele regularizar.';
  }
  if (perfil === 'autonomo') {
    if (motivo === 'trial_expirado') {
      return 'Seu teste grátis de 14 dias terminou. Você pode consultar seus treinos e seu histórico, mas para registrar, criar ou editar é preciso assinar. Acesse Plano para continuar.';
    }
    if (motivo === 'pagamento_pendente') {
      return 'Não conseguimos confirmar o pagamento da sua assinatura. Atualize a forma de pagamento em Plano para voltar a registrar e criar.';
    }
    return 'Sua assinatura não está ativa. Você pode consultar seus dados; para voltar a registrar e criar, assine em Plano.';
  }
  if (motivo === 'trial_expirado') {
    return 'Seu teste grátis terminou. Seus alunos e treinos continuam disponíveis para consulta, mas criar, editar e executar exige uma assinatura ativa. Assine em Plano.';
  }
  if (motivo === 'pagamento_pendente') {
    return 'Não conseguimos confirmar o pagamento da assinatura. Atualize a forma de pagamento em Plano para voltar a editar.';
  }
  return 'Sua assinatura não está ativa. Os dados seguem disponíveis para consulta; para criar e editar, assine em Plano.';
}
