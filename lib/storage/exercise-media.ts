/**
 * Primitivas PURAS de mídia de exercício (sem dependência de servidor).
 *
 * Fica separado de `lib/storage/index.ts` porque este módulo é importado também
 * por Client Components (ex.: `exercise-media-upload.tsx`). O index importa o
 * client de SERVIDOR (`next/headers`), que não pode ser arrastado para o bundle
 * do cliente — por isso as constantes/helpers reutilizados nos dois lados vivem
 * aqui, e o index apenas os reexporta.
 */

/** Tipo de mídia de exercício. */
export type ExerciseMediaKind = 'video' | 'thumbnail';

/**
 * Nome do bucket PRIVADO de mídia de exercício. Exportado para o cliente montar
 * o upload direto (signed upload URL) sem repetir a string literal.
 */
export const EXERCISE_MEDIA_BUCKET = 'exercise-videos';

/**
 * Limites de tamanho por tipo de mídia de exercício, em bytes.
 *
 * - Vídeo: 50 MB. O arquivo sobe DIRETO ao Storage via signed upload URL (não
 *   trafega pela Server Action), então o limite não depende mais do
 *   `bodySizeLimit` do Next — o teto efetivo é o `file_size_limit` do bucket no
 *   Supabase (ver migration `..._exercise_videos_file_size_limit.sql`).
 * - Thumbnail: 5 MB, alinhado ao bucket público `exercise-gifs`.
 *
 * Validados no CLIENTE (antes de pedir a URL) e no SERVIDOR (ao emitir a URL).
 */
export const MAX_EXERCISE_VIDEO_BYTES = 50 * 1024 * 1024; // 50 MB
export const MAX_EXERCISE_THUMBNAIL_BYTES = 5 * 1024 * 1024; // 5 MB

/** Teto de tamanho (bytes) permitido para o `kind` informado. */
export function limiteMidiaExercicio(kind: ExerciseMediaKind): number {
  return kind === 'video' ? MAX_EXERCISE_VIDEO_BYTES : MAX_EXERCISE_THUMBNAIL_BYTES;
}

/** Prefixo de MIME aceito para o `kind` (ex.: `video/mp4` casa `'video/'`). */
export function prefixoMimePermitido(kind: ExerciseMediaKind): string {
  return kind === 'video' ? 'video/' : 'image/';
}

/**
 * Normaliza o nome do arquivo para o path do Storage: remove segmentos de
 * diretório e caracteres inseguros, preservando a extensão. Evita que um
 * `file.name` com barras ou `..` escape da convenção de path.
 */
export function nomeArquivoSeguro(nome: string): string {
  const base = nome.split(/[\\/]/).pop() ?? nome;
  const limpo = base.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/^\.+/, '');
  return limpo.length > 0 ? limpo : `arquivo-${Date.now()}`;
}

export interface MontarPathExerciseMediaArgs {
  tenantId: string;
  exerciseId: string;
  kind: ExerciseMediaKind;
  fileName: string;
}

/**
 * Monta o path DETERMINÍSTICO de uma mídia de exercício no bucket privado:
 * `{tenant_id}/{exercise_id}/{kind}-{nomeArquivoSeguro}`. O 1º segmento é sempre
 * o `tenant_id` (exigido pela policy de insert do Storage) e o nome do arquivo é
 * sanitizado. Usado tanto no upload de servidor quanto na emissão da signed
 * upload URL, garantindo que a leitura (`signExerciseMedia`) assine o MESMO path.
 */
export function montarPathExerciseMedia({
  tenantId,
  exerciseId,
  kind,
  fileName,
}: MontarPathExerciseMediaArgs): string {
  return `${tenantId}/${exerciseId}/${kind}-${nomeArquivoSeguro(fileName)}`;
}
