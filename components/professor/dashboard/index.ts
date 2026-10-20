export { MetricCard, type MetricCardProps } from './metric-card';
export {
  PendenciasCard,
  type PendenciasCardProps,
  type PendenciaItem,
} from './pendencias-card';
export {
  AtividadeRecenteCard,
  type AtividadeRecenteCardProps,
  type AtividadeItem,
  type AtividadeTipo,
} from './atividade-recente-card';

/**
 * Janela (em dias) após a qual a última avaliação de um aluno é considerada
 * "vencida" no painel do professor. Escolha documentada em
 * docs/decisions/0010-painel-professor-avaliacao-vencida.md.
 */
export const DIAS_AVALIACAO_VENCIDA = 90;
