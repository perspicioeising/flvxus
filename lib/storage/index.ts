import { createClient } from '@/lib/supabase/server';
import {
  montarPathExerciseMedia,
  nomeArquivoSeguro,
  EXERCISE_MEDIA_BUCKET,
  type ExerciseMediaKind,
} from '@/lib/storage/exercise-media';

// Reexporta as primitivas PURAS de mídia de exercício (limites, helpers de
// kind, bucket, builder de path, tipo) para que Client Components possam
// importá-las de `@/lib/storage` sem arrastar este módulo de servidor
// (`next/headers`) para o bundle do cliente — elas vivem em
// `lib/storage/exercise-media.ts`.
export {
  EXERCISE_MEDIA_BUCKET,
  MAX_EXERCISE_VIDEO_BYTES,
  MAX_EXERCISE_THUMBNAIL_BYTES,
  limiteMidiaExercicio,
  prefixoMimePermitido,
  montarPathExerciseMedia,
  type ExerciseMediaKind,
  type MontarPathExerciseMediaArgs,
} from '@/lib/storage/exercise-media';

/**
 * Upload + URLs assinadas para buckets PRIVADOS (architecture.md §7 · ADR 0005).
 *
 * A mídia armazenada em bucket privado é acessada SEMPRE por URL assinada de
 * TTL curto gerada no servidor. NUNCA usar `getPublicUrl` para esses paths. O
 * upload usa o client de servidor (`lib/supabase/server.ts`), portanto passa
 * pelo RLS do bucket
 * (as policies em supabase/migrations/20261020090900_storage.sql exigem que o
 * 1º segmento do path seja o `tenant_id` e, para fotos, restringem a escrita ao
 * trainer do tenant).
 *
 * Exceção para exibição: a mídia de exercício (`video_url`/`thumbnail_url`) pode
 * já estar gravada como URL http(s) ABSOLUTA pública (bucket público
 * `exercise-gifs`, CDN externa, YouTube etc.). Nesse caso `signExerciseMedia`
 * repassa o valor adiante sem assinar; a invariante "PATH privado → assinado"
 * permanece para qualquer valor que não seja uma URL http(s).
 *
 * Convenção de path (§7, 1º segmento sempre `tenant_id`):
 *   assessment-photos : {tenant_id}/{student_id}/{assessment_id}/{arquivo}
 *   exercise-videos   : {tenant_id}/{exercise_id}/{arquivo}
 */

const BUCKET_ASSESSMENT_PHOTOS = 'assessment-photos';
const BUCKET_EXERCISE_VIDEOS = EXERCISE_MEDIA_BUCKET;

/** TTL padrão das URLs assinadas, em segundos. */
export const TTL_ASSESSMENT_PHOTO = 300; // 5 min — dado de saúde (foto de avaliação).
export const TTL_EXERCISE_MEDIA = 36000; // 1 h — mídia de exercício.

/** Extrai o content-type de um `File`, com fallback binário genérico. */
function contentType(file: File): string {
  return file.type && file.type.length > 0 ? file.type : 'application/octet-stream';
}

export interface UploadAssessmentPhotoArgs {
  tenantId: string;
  studentId: string;
  assessmentId: string;
  file: File;
}

/**
 * Faz upload de uma foto de avaliação no bucket privado `assessment-photos`,
 * montando o path `{tenant_id}/{student_id}/{assessment_id}/{arquivo}`.
 * Retorna o `path` gravado (para persistir na linha e assinar depois).
 */
export async function uploadAssessmentPhoto({
  tenantId,
  studentId,
  assessmentId,
  file,
}: UploadAssessmentPhotoArgs): Promise<string> {
  const supabase = await createClient();
  const path = `${tenantId}/${studentId}/${assessmentId}/${nomeArquivoSeguro(file.name)}`;

  const { error } = await supabase.storage
    .from(BUCKET_ASSESSMENT_PHOTOS)
    .upload(path, file, { contentType: contentType(file), upsert: true });

  if (error) {
    throw new Error(`Falha ao enviar foto de avaliação: ${error.message}`);
  }

  return path;
}

/**
 * Remove uma foto de avaliação do bucket privado `assessment-photos`. Usa o
 * client de servidor (RLS ativo): a policy de DELETE exige que o 1º segmento do
 * path seja o `tenant_id` e que o papel seja trainer — path de outro tenant é
 * barrado aqui. Lança `Error` com mensagem em pt-BR em caso de falha, espelhando
 * `uploadAssessmentPhoto`.
 */
export async function removeAssessmentPhoto(path: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.storage
    .from(BUCKET_ASSESSMENT_PHOTOS)
    .remove([path]);

  if (error) {
    throw new Error(`Falha ao excluir foto de avaliação: ${error.message}`);
  }
}

/**
 * Gera uma URL assinada de TTL curto para uma foto de avaliação. NUNCA usa
 * `getPublicUrl` (bucket privado). Retorna `null` se não for possível assinar.
 */
export async function signAssessmentPhoto(
  path: string,
  ttlSegundos: number = TTL_ASSESSMENT_PHOTO
): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(BUCKET_ASSESSMENT_PHOTOS)
    .createSignedUrl(path, ttlSegundos);

  if (error || !data) {
    return null;
  }

  return data.signedUrl;
}

export interface UploadExerciseMediaArgs {
  tenantId: string;
  exerciseId: string;
  file: File;
  kind: ExerciseMediaKind;
}

/**
 * Faz upload de mídia de exercício (vídeo ou thumbnail) no bucket privado
 * `exercise-videos`, montando o path `{tenant_id}/{exercise_id}/{arquivo}`.
 * O `kind` prefixa o nome do arquivo para distinguir vídeo de thumbnail dentro
 * da pasta do exercício. Retorna o `path` gravado.
 */
export async function uploadExerciseMedia({
  tenantId,
  exerciseId,
  file,
  kind,
}: UploadExerciseMediaArgs): Promise<string> {
  const supabase = await createClient();
  const path = montarPathExerciseMedia({ tenantId, exerciseId, kind, fileName: file.name });

  const { error } = await supabase.storage
    .from(BUCKET_EXERCISE_VIDEOS)
    .upload(path, file, { contentType: contentType(file), upsert: true });

  if (error) {
    throw new Error(`Falha ao enviar mídia de exercício: ${error.message}`);
  }

  return path;
}

/**
 * Remove uma mídia de exercício (vídeo/thumbnail) do bucket privado
 * `exercise-videos`. Usa o client de servidor (RLS ativo): a policy de DELETE
 * exige que o 1º segmento do path seja o `tenant_id` e que o papel seja trainer
 * — path de outro tenant é barrado aqui. É IDEMPOTENTE: o `remove` do Storage
 * NÃO falha quando o objeto já não existe, então um path obsoleto não quebra a
 * exclusão. Lança `Error` com mensagem em pt-BR em caso de falha, espelhando
 * `uploadExerciseMedia`/`removeAssessmentPhoto`.
 */
export async function removeExerciseMedia(path: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.storage
    .from(BUCKET_EXERCISE_VIDEOS)
    .remove([path]);

  if (error) {
    throw new Error(`Falha ao excluir mídia de exercício: ${error.message}`);
  }
}

/**
 * Resolve a URL de exibição de uma mídia de exercício.
 *
 * - Se o valor JÁ for uma URL absoluta http(s) (mídia pública: bucket
 *   `exercise-gifs`, CDN, YouTube etc.), retorna o próprio valor SEM assinar.
 * - Caso contrário, trata o valor como PATH do bucket privado `exercise-videos`
 *   e gera uma URL assinada de TTL curto (NUNCA usa `getPublicUrl`). Retorna
 *   `null` se não for possível assinar.
 *
 * Como o valor pode vir de dados do tenant, apenas `http://`/`https://` são
 * considerados URL pública; qualquer outro valor segue o caminho privado.
 */
export async function signExerciseMedia(
  path: string,
  ttlSegundos: number = TTL_EXERCISE_MEDIA
): Promise<string | null> {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(BUCKET_EXERCISE_VIDEOS)
    .createSignedUrl(path, ttlSegundos);

  if (error || !data) {
    return null;
  }

  return data.signedUrl;
}
