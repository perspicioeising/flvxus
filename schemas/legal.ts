import { z } from 'zod';

/**
 * Schemas Zod do aceite legal (design.md §2.14).
 *
 * Validam a entrada da Server Action `registrarAceiteLegal`. IP e user-agent
 * NÃO estão no schema de propósito: são derivados no servidor a partir dos
 * headers (RNF1), nunca enviados pelo cliente.
 */

/**
 * Formato de versão: semver curto MAJOR.MINOR (ex.: '1.0', '2.3'). É a
 * documentação executável do formato das constantes em lib/legal/versions.ts;
 * ponto único a atualizar se o esquema de versionamento mudar.
 */
export const documentVersionSchema = z
  .string()
  .regex(/^\d+\.\d+$/, 'versão inválida');

export const legalDocumentTypeSchema = z.enum(['terms', 'privacy']);

/**
 * Entrada de `registrarAceiteLegal`: a lista de documentos que o usuário está
 * aceitando (tipo + versão vista). O `.refine` garante que não há `type`
 * duplicado no array (NIT 8).
 */
export const registrarAceiteSchema = z.object({
  documents: z
    .array(
      z.object({
        type: legalDocumentTypeSchema,
        version: documentVersionSchema,
      }),
    )
    .min(1, 'informe ao menos um documento')
    .max(2, 'no máximo dois documentos')
    .refine(
      (docs) => new Set(docs.map((d) => d.type)).size === docs.length,
      { message: 'tipos de documento duplicados' },
    ),
});

export type RegistrarAceiteInput = z.infer<typeof registrarAceiteSchema>;
