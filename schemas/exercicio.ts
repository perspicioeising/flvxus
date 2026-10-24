import { z } from 'zod';

/**
 * Schemas Zod do domínio de exercícios (architecture.md §6.2).
 *
 * O MESMO schema valida no cliente (UX via react-hook-form + zodResolver) e no
 * servidor (segurança, nas Server Actions de `actions/exercicios.ts`). As
 * colunas espelham `exercises` em `types/database.types.ts`.
 *
 * `muscle_groups`/`equipment`/`tips`/`common_errors` são `text[]` no banco.
 * Os formulários enviam esses campos como JSON (string) num único campo do
 * FormData; `listaDeTexto` normaliza tanto arrays nativos quanto a string JSON.
 */

/** Sugestões de grupo muscular (reaproveitadas da UX v1). Lista é livre. */
export const GRUPOS_MUSCULARES = [
  'Peito',
  'Costas',
  'Pernas',
  'Ombros',
  'Braços',
  'Core',
  'Corpo Inteiro',
  'Cardio',
] as const;

/** Sugestões de equipamento (reaproveitadas da UX v1). Lista é livre. */
export const EQUIPAMENTOS = [
  'Peso Livre',
  'Máquina',
  'Cabo',
  'Peso Corporal',
  'Elástico',
  'Kettlebell',
  'TRX',
  'Outros',
] as const;

/** Transforma string vazia em `undefined` para campos de texto opcionais. */
const opcionalVazio = (schema: z.ZodTypeAny) =>
  z.preprocess(
    (valor) => (valor === '' || valor === null ? undefined : valor),
    schema.optional()
  );

/**
 * Normaliza a entrada de uma lista de textos. Aceita:
 * - array de strings (uso direto no cliente);
 * - string JSON de array (como chega no FormData da Server Action);
 * - `undefined`/`''` → `[]`.
 * Remove itens vazios e duplicados preservando a ordem.
 */
const listaDeTexto = z.preprocess((valor) => {
  let bruto: unknown = valor;

  if (valor === undefined || valor === null || valor === '') {
    bruto = [];
  } else if (typeof valor === 'string') {
    try {
      bruto = JSON.parse(valor);
    } catch {
      // Fallback: string única separada por vírgulas.
      bruto = valor.split(',');
    }
  }

  if (!Array.isArray(bruto)) {
    return [];
  }

  const itens = bruto
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter((item) => item.length > 0);

  return Array.from(new Set(itens));
}, z.array(z.string().min(1)));

/** Campos comuns a criar/editar exercício. */
const camposBaseExercicio = {
  name: z
    .string({ required_error: 'Informe o nome do exercício.' })
    .trim()
    .min(1, 'Informe o nome do exercício.'),
  muscle_groups: listaDeTexto.refine((lista) => lista.length > 0, {
    message: 'Selecione ao menos um grupo muscular.',
  }),
  equipment: listaDeTexto,
  instructions: opcionalVazio(z.string().trim().min(1)),
  tips: listaDeTexto,
  common_errors: listaDeTexto,
  video_url: opcionalVazio(z.string().trim().min(1)),
  thumbnail_url: opcionalVazio(z.string().trim().min(1)),
};

/** Criação de exercício do tenant. */
export const criarExercicioSchema = z.object(camposBaseExercicio);

/** Edição de exercício do tenant (mesmos campos). */
export const editarExercicioSchema = z.object(camposBaseExercicio);

export type CriarExercicioInput = z.infer<typeof criarExercicioSchema>;
export type EditarExercicioInput = z.infer<typeof editarExercicioSchema>;

/**
 * Importação em lote de exercícios do catálogo global. Recebe os IDs dos
 * globais selecionados, exige ao menos um e no máximo 200 por vez, e deduplica
 * repetidos preservando a ordem.
 */
export const importarExerciciosSchema = z
  .array(z.string().uuid({ message: 'Identificador inválido.' }))
  .min(1, 'Selecione ao menos um exercício.')
  .max(200, 'Importe no máximo 200 exercícios por vez.')
  .transform((ids) => Array.from(new Set(ids)));

export type ImportarExerciciosInput = z.infer<typeof importarExerciciosSchema>;
