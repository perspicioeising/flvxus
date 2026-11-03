import { describe, expect, it } from 'vitest';

import {
  MAX_AVATAR_BYTES,
  MIME_AVATAR_PERMITIDOS,
  TAMANHO_AVATAR_PX,
  calcularRecorteQuadradoCentral,
  ehMimeAvatarPermitido,
} from './crop-quadrado';

describe('calcularRecorteQuadradoCentral', () => {
  it('retorna a própria imagem quando já é quadrada', () => {
    expect(calcularRecorteQuadradoCentral(600, 600)).toEqual({ x: 0, y: 0, lado: 600 });
  });

  it('recorta o quadrado central de uma paisagem (largura > altura)', () => {
    // 1000x400 -> lado 400, centralizado no eixo x: (1000-400)/2 = 300.
    expect(calcularRecorteQuadradoCentral(1000, 400)).toEqual({ x: 300, y: 0, lado: 400 });
  });

  it('recorta o quadrado central de um retrato (altura > largura)', () => {
    // 400x1000 -> lado 400, centralizado no eixo y: (1000-400)/2 = 300.
    expect(calcularRecorteQuadradoCentral(400, 1000)).toEqual({ x: 0, y: 300, lado: 400 });
  });

  it('usa piso inteiro no offset de dimensões ímpares', () => {
    // 101x50 -> lado 50, offset x = floor((101-50)/2) = 25.
    expect(calcularRecorteQuadradoCentral(101, 50)).toEqual({ x: 25, y: 0, lado: 50 });
  });

  it('clampa dimensões inválidas para lado 0', () => {
    expect(calcularRecorteQuadradoCentral(0, 100)).toEqual({ x: 0, y: 50, lado: 0 });
    expect(calcularRecorteQuadradoCentral(-10, -10)).toEqual({ x: 0, y: 0, lado: 0 });
  });
});

describe('ehMimeAvatarPermitido', () => {
  it('aceita jpeg, png e webp', () => {
    expect(ehMimeAvatarPermitido('image/jpeg')).toBe(true);
    expect(ehMimeAvatarPermitido('image/png')).toBe(true);
    expect(ehMimeAvatarPermitido('image/webp')).toBe(true);
  });

  it('rejeita SVG, gif e valores vazios/nulos', () => {
    expect(ehMimeAvatarPermitido('image/svg+xml')).toBe(false);
    expect(ehMimeAvatarPermitido('image/gif')).toBe(false);
    expect(ehMimeAvatarPermitido('application/octet-stream')).toBe(false);
    expect(ehMimeAvatarPermitido('')).toBe(false);
    expect(ehMimeAvatarPermitido(null)).toBe(false);
    expect(ehMimeAvatarPermitido(undefined)).toBe(false);
  });
});

describe('constantes de avatar', () => {
  it('fixa o lado em 512px e o limite em 2 MB', () => {
    expect(TAMANHO_AVATAR_PX).toBe(512);
    expect(MAX_AVATAR_BYTES).toBe(2 * 1024 * 1024);
  });

  it('allowlist contém exatamente os três formatos raster', () => {
    expect([...MIME_AVATAR_PERMITIDOS]).toEqual(['image/jpeg', 'image/png', 'image/webp']);
  });
});
