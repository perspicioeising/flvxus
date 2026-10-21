import type { AssessmentProtocol } from '@/types/database.types';

/**
 * Rótulos pt-BR dos enums de avaliação, compartilhados entre listagem, formulário,
 * detalhe e gráficos. Mantém a tradução num só lugar.
 */

export const PROTOCOLO_LABEL: Record<AssessmentProtocol, string> = {
  pollock_3: 'Pollock 3 dobras',
  pollock_7: 'Pollock 7 dobras',
  guedes: 'Guedes',
  durnin: 'Durnin & Womersley',
  manual: 'Manual (%gordura informado)',
};

export const GENERO_LABEL: Record<'male' | 'female', string> = {
  male: 'Masculino',
  female: 'Feminino',
};

export function protocoloLabel(protocol: AssessmentProtocol | null): string {
  return protocol ? PROTOCOLO_LABEL[protocol] : '—';
}

/** Rótulos das circunferências (colunas `*_cm`). */
export const CIRCUNFERENCIA_LABEL: Record<string, string> = {
  neck_cm: 'Pescoço',
  shoulder_cm: 'Ombro',
  chest_cm: 'Tórax',
  waist_cm: 'Cintura',
  abdomen_cm: 'Abdômen',
  hip_cm: 'Quadril',
  left_arm_cm: 'Braço esq.',
  right_arm_cm: 'Braço dir.',
  left_thigh_cm: 'Coxa esq.',
  right_thigh_cm: 'Coxa dir.',
  left_calf_cm: 'Panturrilha esq.',
  right_calf_cm: 'Panturrilha dir.',
  left_flexed_arm_cm: 'Braço contraído esq.',
  right_flexed_arm_cm: 'Braço contraído dir.',
  left_forearm_cm: 'Antebraço esq.',
  right_forearm_cm: 'Antebraço dir.',
  left_mid_thigh_cm: 'Coxa medial esq.',
  right_mid_thigh_cm: 'Coxa medial dir.',
  left_distal_thigh_cm: 'Coxa distal esq.',
  right_distal_thigh_cm: 'Coxa distal dir.',
};

/** Rótulos das dobras cutâneas (colunas `skf_*` + bíceps em measurements). */
export const DOBRA_LABEL: Record<string, string> = {
  skf_triceps: 'Tríceps',
  skf_subscapular: 'Subescapular',
  skf_chest: 'Peitoral',
  skf_midaxillary: 'Axilar média',
  skf_suprailiac: 'Suprailíaca',
  skf_abdominal: 'Abdominal',
  skf_thigh: 'Coxa',
  skf_biceps: 'Bíceps',
};
