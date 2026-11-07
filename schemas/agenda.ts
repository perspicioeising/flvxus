import { z } from 'zod';

import { diaValido as diaCruValido, somarDias, weekdayDeDia } from '@/lib/agenda/fuso';

/**
 * Schemas Zod da AGENDA (Fase 1). O MESMO schema valida no cliente (UX) e no
 * servidor (`actions/agenda.ts`). Datas são `YYYY-MM-DD` cruas (nunca
 * reconvertidas com `new Date()`) e horas `HH:mm` de relógio de parede, no
 * fuso da série. Design: §10.
 */

export const TIPOS_COMPROMISSO = ['in_person', 'online', 'assessment', 'personal', 'block'] as const;
export const REPETICOES = ['nenhuma', 'diaria', 'semanal', 'mensal'] as const;
export const ESCOPOS = ['ocorrencia', 'seguintes', 'todos'] as const;

export type TipoCompromisso = (typeof TIPOS_COMPROMISSO)[number];
export type Repeticao = (typeof REPETICOES)[number];
export type EscopoAgenda = (typeof ESCOPOS)[number];

const HORA = /^([01]\d|2[0-3]):[0-5]\d$/;
/** Limite da recorrência: 5 anos (com folga de 2 dias bissextos). */
const LIMITE_RECORRENCIA_DIAS = 365 * 5 + 2;

const diaSchema = (mensagem: string) =>
  z.string({ required_error: mensagem }).refine((v) => diaCruValido(v), mensagem);

const horaSchema = (mensagem: string) =>
  z.string({ required_error: mensagem }).regex(HORA, mensagem);

/** Texto opcional: vazio vira `undefined`. */
const textoOpcional = (max: number, mensagem: string) =>
  z.preprocess(
    (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
    z.string().trim().max(max, mensagem).optional()
  );

const camposComuns = {
  titulo: textoOpcional(120, 'O título deve ter no máximo 120 caracteres.'),
  notas: textoOpcional(1000, 'As notas devem ter no máximo 1000 caracteres.'),
  local: textoOpcional(200, 'O local deve ter no máximo 200 caracteres.'),
  data: diaSchema('Data inválida.'),
  inicio: horaSchema('Horário de início inválido.'),
  fim: horaSchema('Horário de término inválido.'),
};

const camposRepeticao = {
  repeticao: z.enum(REPETICOES, { errorMap: () => ({ message: 'Repetição inválida.' }) }),
  /** Dias da semana (0 = domingo … 6 = sábado), só para `semanal`. */
  diasSemana: z.array(z.number().int().min(0).max(6)).max(7).optional(),
  /** Último dia da série (inclusivo), `YYYY-MM-DD`. */
  ate: z.preprocess(
    (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
    diaSchema('Data final da repetição inválida.').optional()
  ),
};

type CamposHorario = { data: string; inicio: string; fim: string };
type CamposRepeticaoTipo = {
  repeticao?: Repeticao;
  diasSemana?: number[];
  ate?: string;
};

/** Valida `fim > inicio` no mesmo dia. */
function validarHorario(v: CamposHorario, ctx: z.RefinementCtx): void {
  if (HORA.test(v.inicio) && HORA.test(v.fim) && v.fim <= v.inicio) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['fim'],
      message: 'O término deve ser depois do início, no mesmo dia (não atravesse a meia-noite).',
    });
  }
}

/** Valida a regra de repetição contra a data de início. */
function validarRepeticao(v: CamposHorario & CamposRepeticaoTipo, ctx: z.RefinementCtx): void {
  const rep = v.repeticao ?? 'nenhuma';
  if (rep === 'nenhuma') return;
  if (!diaCruValido(v.data)) return;
  if (rep === 'semanal') {
    const dias = v.diasSemana ?? [];
    if (dias.length === 0 || new Set(dias).size !== dias.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['diasSemana'],
        message: 'Escolha os dias da semana (sem repetir).',
      });
    } else if (!dias.includes(weekdayDeDia(v.data))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['diasSemana'],
        message: 'Inclua o dia da semana da data de início.',
      });
    }
  } else if (v.diasSemana && v.diasSemana.length > 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['diasSemana'],
      message: 'Dias da semana só valem para repetição semanal.',
    });
  }
  if (v.ate !== undefined && diaCruValido(v.ate)) {
    if (v.ate < v.data) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['ate'],
        message: 'A data final deve ser igual ou posterior à data de início.',
      });
    } else if (v.ate > somarDias(v.data, LIMITE_RECORRENCIA_DIAS)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['ate'],
        message: 'A repetição pode durar no máximo 5 anos.',
      });
    }
  }
}

const ATENDIMENTOS: readonly TipoCompromisso[] = ['in_person', 'online', 'assessment'];

/** Criação de compromisso. */
export const criarCompromissoSchema = z
  .object({
    tipo: z.enum(TIPOS_COMPROMISSO, { errorMap: () => ({ message: 'Tipo inválido.' }) }),
    alunoId: z.preprocess(
      (v) => (v === '' || v === null ? undefined : v),
      z.string().uuid('Aluno inválido.').optional()
    ),
    ...camposComuns,
    ...camposRepeticao,
  })
  .superRefine((v, ctx) => {
    const atendimento = ATENDIMENTOS.includes(v.tipo);
    if (atendimento && !v.alunoId) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['alunoId'], message: 'Escolha o aluno.' });
    }
    if (!atendimento && v.alunoId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['alunoId'],
        message: 'Este tipo de compromisso não tem aluno.',
      });
    }
    if (!atendimento && !v.titulo) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['titulo'], message: 'Informe o título.' });
    }
    validarHorario(v, ctx);
    validarRepeticao(v, ctx);
  });

/** Edição de compromisso (avulso, ocorrência ou série). */
export const editarCompromissoSchema = z
  .object({
    id: z.string().uuid('Compromisso inválido.'),
    escopo: z.enum(ESCOPOS, { errorMap: () => ({ message: 'Escopo inválido.' }) }),
    /** Ocorrência D (= `meta.dataOriginal`, no fuso da série). */
    dataOcorrencia: diaSchema('Data da ocorrência inválida.'),
    ...camposComuns,
    repeticao: camposRepeticao.repeticao.optional(),
    diasSemana: camposRepeticao.diasSemana,
    ate: camposRepeticao.ate,
  })
  .superRefine((v, ctx) => {
    validarHorario(v, ctx);
    validarRepeticao(v, ctx);
  });

/** Cancelamento de compromisso. */
export const cancelarCompromissoSchema = z.object({
  id: z.string().uuid('Compromisso inválido.'),
  escopo: z.enum(ESCOPOS, { errorMap: () => ({ message: 'Escopo inválido.' }) }),
  dataOcorrencia: diaSchema('Data da ocorrência inválida.'),
});

/** Fuso horário do perfil (nome IANA; a validação real é do runtime/trigger). */
export const atualizarFusoSchema = z.object({
  timezone: z
    .string({ required_error: 'Informe o fuso horário.' })
    .trim()
    .min(1, 'Informe o fuso horário.')
    .max(64, 'Fuso horário inválido.'),
});

export type CriarCompromissoInput = z.input<typeof criarCompromissoSchema>;
export type EditarCompromissoInput = z.input<typeof editarCompromissoSchema>;
export type CancelarCompromissoInput = z.input<typeof cancelarCompromissoSchema>;
