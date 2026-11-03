import { createClient } from '@/lib/supabase/server';
import { MAX_AVATAR_BYTES } from '@/lib/image/crop-quadrado';

/**
 * Upload da FOTO DE PERFIL (avatar) no bucket PÚBLICO `avatars`.
 *
 * Diferente da mídia privada de `lib/storage/index.ts` (bucket por tenant +
 * URL assinada), o avatar é PÚBLICO por decisão de produto: os rankings
 * cross-tenant da Arena exibem `profiles.avatar_url` como string crua, sem etapa
 * de assinatura no servidor — uma URL assinada de TTL curto expiraria. Então
 * gravamos a PUBLIC URL em `profiles.avatar_url` e o path é escopado ao dono
 * (`{user_id}.<ext>`), com a policy de escrita restrita ao próprio uid.
 *
 * O upload passa pelo client de SERVIDOR (RLS ativo) — nunca service_role.
 */

/** Nome do bucket PÚBLICO de avatares (criado manualmente no painel). */
export const AVATAR_BUCKET = 'avatars';

/** Extensão raster suportada no path do avatar. */
export type ExtensaoAvatar = 'jpg' | 'png' | 'webp';

/** Content-type coerente com a extensão do avatar. */
const CONTENT_TYPE_POR_EXT: Record<ExtensaoAvatar, string> = {
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

/**
 * Monta o path DETERMINÍSTICO do avatar: `{user_id}.<ext>` (sem subpasta de
 * tenant — o bucket é por-usuário e público). A policy de escrita só libera o
 * dono porque o nome do objeto começa pelo próprio `auth.uid()`.
 */
export function montarPathAvatar(userId: string, ext: ExtensaoAvatar): string {
  return `${userId}.${ext}`;
}

/**
 * Detecta o formato raster real pelos MAGIC BYTES (não confia na extensão nem no
 * MIME declarado). Retorna `null` para qualquer coisa que não seja JPEG/PNG/WEBP
 * — incluindo SVG, que é bloqueado por não ter assinatura raster.
 *
 * - JPEG: `FF D8 FF`
 * - PNG:  `89 50 4E 47 0D 0A 1A 0A`
 * - WEBP: `52 49 46 46` ("RIFF") ... `57 45 42 50` ("WEBP") nos bytes 8–11
 */
export function detectarFormatoRaster(bytes: Uint8Array): ExtensaoAvatar | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return 'jpg';
  }

  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return 'png';
  }

  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return 'webp';
  }

  return null;
}

export interface UploadAvatarArgs {
  userId: string;
  file: Blob;
  /**
   * Versão para CACHE-BUSTING da public URL (parâmetro `?v=`). Default
   * `Date.now()`. Injetável só para tornar o teste determinístico.
   */
  versao?: number;
}

export interface UploadAvatarResultado {
  /** Public URL gravada em `profiles.avatar_url`. */
  publicUrl: string;
  /** Path do objeto no bucket (`{user_id}.<ext>`). */
  path: string;
}

/**
 * Faz upload do avatar no bucket público `avatars`, validando TAMANHO (≤ 2 MB)
 * e FORMATO real por magic bytes antes de enviar. Grava com `upsert: true`
 * (substitui a foto anterior do mesmo formato) e retorna a PUBLIC URL + o path.
 * Lança `Error` em pt-BR em caso de falha, espelhando `lib/storage/index.ts`.
 *
 * CACHE-BUSTING: o path (e, portanto, a public URL crua) é DETERMINÍSTICO
 * (`{user_id}.<ext>`), então o Supabase Storage/CDN e o navegador serviriam a
 * versão ANTIGA em cache após um novo upload do mesmo formato — a URL não muda.
 * Para forçar a busca da versão nova, a public URL retornada recebe um parâmetro
 * de QUERY único por upload (`?v=${versao}`). Como `profiles.avatar_url` guarda
 * essa URL versionada, ela muda a cada upload e os componentes de exibição
 * (que consomem a string crua) buscam a imagem nova sem precisar mudar.
 */
export async function uploadAvatar({
  userId,
  file,
  versao = Date.now(),
}: UploadAvatarArgs): Promise<UploadAvatarResultado> {
  if (file.size > MAX_AVATAR_BYTES) {
    throw new Error('A imagem excede o limite de 2 MB.');
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const ext = detectarFormatoRaster(bytes);
  if (!ext) {
    throw new Error('Formato inválido. Envie uma imagem JPG, PNG ou WEBP.');
  }

  const supabase = await createClient();
  const path = montarPathAvatar(userId, ext);

  const { error } = await supabase.storage.from(AVATAR_BUCKET).upload(path, file, {
    contentType: CONTENT_TYPE_POR_EXT[ext],
    upsert: true,
  });

  if (error) {
    throw new Error(`Falha ao enviar a foto de perfil: ${error.message}`);
  }

  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);

  const separador = data.publicUrl.includes('?') ? '&' : '?';
  const publicUrl = `${data.publicUrl}${separador}v=${versao}`;

  return { publicUrl, path };
}

/**
 * Remove o(s) arquivo(s) de avatar do dono no bucket público. Como o formato
 * pode ter mudado entre uploads, remove todas as extensões possíveis do mesmo
 * `user_id`. É IDEMPOTENTE: `remove` não falha se o objeto não existir. Usa o
 * client de servidor (RLS ativo): a policy de DELETE só libera o dono.
 */
export async function removeAvatar(userId: string): Promise<void> {
  const supabase = await createClient();
  const paths: string[] = (['jpg', 'png', 'webp'] as ExtensaoAvatar[]).map((ext) =>
    montarPathAvatar(userId, ext),
  );

  const { error } = await supabase.storage.from(AVATAR_BUCKET).remove(paths);

  if (error) {
    throw new Error(`Falha ao remover a foto de perfil: ${error.message}`);
  }
}
