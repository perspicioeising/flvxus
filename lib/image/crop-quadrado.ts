/**
 * Crop quadrado central + resize para avatar, em canvas puro (sem dependência).
 *
 * O escopo é determinístico: a partir de uma imagem de qualquer proporção,
 * recortamos o MAIOR quadrado central e redimensionamos para 512×512, exportando
 * um `Blob` raster re-encodado (webp, com fallback jpeg) via `canvas.toBlob`.
 * Re-encodar no cliente já neutraliza payloads embutidos no arquivo original; o
 * servidor revalida os magic bytes como defesa em profundidade.
 *
 * As partes que dependem do DOM (`createImageBitmap`/`<canvas>`) ficam em
 * funções de browser; a geometria do recorte e as constantes/validação de MIME
 * são puras e testáveis em jsdom.
 */

/** Lado (px) do avatar final, quadrado. */
export const TAMANHO_AVATAR_PX = 512;

/** Tamanho máximo aceito para o arquivo de avatar, em bytes (~2 MB). */
export const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

/** MIME types raster aceitos para avatar (SVG e não-raster são rejeitados). */
export const MIME_AVATAR_PERMITIDOS = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export type MimeAvatarPermitido = (typeof MIME_AVATAR_PERMITIDOS)[number];

/** Verdadeiro se o MIME informado está na allowlist raster do avatar. */
export function ehMimeAvatarPermitido(mime: string | null | undefined): mime is MimeAvatarPermitido {
  return (
    typeof mime === 'string' &&
    (MIME_AVATAR_PERMITIDOS as readonly string[]).includes(mime)
  );
}

/** Retângulo de origem (em px) do recorte quadrado dentro da imagem. */
export interface RecorteQuadrado {
  x: number;
  y: number;
  lado: number;
}

/**
 * Calcula o MAIOR quadrado central que cabe numa imagem `larguraxaltura`.
 * Puro e determinístico: o lado é o menor eixo e o offset centraliza o recorte
 * no eixo maior. Clampa dimensões inválidas (<=0) para 0.
 */
export function calcularRecorteQuadradoCentral(
  largura: number,
  altura: number,
): RecorteQuadrado {
  const l = Math.max(0, Math.floor(largura));
  const a = Math.max(0, Math.floor(altura));
  const lado = Math.min(l, a);
  return {
    x: Math.floor((l - lado) / 2),
    y: Math.floor((a - lado) / 2),
    lado,
  };
}

/** Resultado do crop: o blob final e a extensão coerente com o MIME de saída. */
export interface AvatarProcessado {
  blob: Blob;
  ext: 'webp' | 'jpg';
  mime: 'image/webp' | 'image/jpeg';
}

/**
 * Processa um `File`/`Blob` de imagem no browser: decodifica, recorta o quadrado
 * central (via {@link calcularRecorteQuadradoCentral}), desenha em canvas
 * {@link TAMANHO_AVATAR_PX}² e exporta webp (fallback jpeg se o navegador não
 * suportar webp no `toBlob`). Lança `Error` em pt-BR se a imagem não decodificar
 * ou o canvas não estiver disponível. Depende do DOM — não é coberto por jsdom.
 */
export async function processarAvatar(arquivo: Blob): Promise<AvatarProcessado> {
  const bitmap = await decodificarImagem(arquivo);

  try {
    const { x, y, lado } = calcularRecorteQuadradoCentral(
      bitmap.width,
      bitmap.height,
    );
    if (lado <= 0) {
      throw new Error('Imagem inválida: não foi possível ler as dimensões.');
    }

    const canvas = document.createElement('canvas');
    canvas.width = TAMANHO_AVATAR_PX;
    canvas.height = TAMANHO_AVATAR_PX;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Seu navegador não suporta o recorte da imagem.');
    }

    ctx.drawImage(
      bitmap,
      x,
      y,
      lado,
      lado,
      0,
      0,
      TAMANHO_AVATAR_PX,
      TAMANHO_AVATAR_PX,
    );

    const webp = await exportarCanvas(canvas, 'image/webp');
    if (webp) {
      return { blob: webp, ext: 'webp', mime: 'image/webp' };
    }

    const jpeg = await exportarCanvas(canvas, 'image/jpeg');
    if (jpeg) {
      return { blob: jpeg, ext: 'jpg', mime: 'image/jpeg' };
    }

    throw new Error('Não foi possível processar a imagem. Tente outro arquivo.');
  } finally {
    if ('close' in bitmap && typeof bitmap.close === 'function') {
      bitmap.close();
    }
  }
}

/** Decodifica o blob em algo desenhável no canvas. */
async function decodificarImagem(arquivo: Blob): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(arquivo);
  } catch {
    throw new Error('Não foi possível ler a imagem. Tente outro arquivo.');
  }
}

/** Promisifica `canvas.toBlob`, resolvendo `null` quando o MIME não é suportado. */
function exportarCanvas(
  canvas: HTMLCanvasElement,
  mime: 'image/webp' | 'image/jpeg',
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), mime, 0.9);
  });
}
