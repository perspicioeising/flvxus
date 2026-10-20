import { describe, expect, it } from 'vitest';

import {
  intervaloPagina,
  normalizarPagina,
  normalizarTamanho,
  totalPaginas,
  PAGINA_PADRAO,
  TAMANHO_PADRAO,
} from '@/lib/paginacao';

describe('intervaloPagina', () => {
  it('calcula {from,to} 0-based inclusivo para a primeira página', () => {
    expect(intervaloPagina(1, 10)).toEqual({ from: 0, to: 9 });
  });

  it('avança o offset conforme a página', () => {
    expect(intervaloPagina(2, 10)).toEqual({ from: 10, to: 19 });
    expect(intervaloPagina(3, 25)).toEqual({ from: 50, to: 74 });
  });

  it('protege contra página/tamanho inválidos', () => {
    expect(intervaloPagina(0, 10)).toEqual({ from: 0, to: 9 });
    expect(intervaloPagina(-5, 10)).toEqual({ from: 0, to: 9 });
  });
});

describe('totalPaginas', () => {
  it('arredonda para cima', () => {
    expect(totalPaginas(21, 10)).toBe(3);
    expect(totalPaginas(20, 10)).toBe(2);
  });

  it('retorna no mínimo 1 quando não há registros', () => {
    expect(totalPaginas(0, 10)).toBe(1);
    expect(totalPaginas(null, 10)).toBe(1);
  });
});

describe('normalizarPagina', () => {
  it('converte string válida', () => {
    expect(normalizarPagina('3')).toBe(3);
  });

  it('cai no padrão para valores inválidos', () => {
    expect(normalizarPagina(undefined)).toBe(PAGINA_PADRAO);
    expect(normalizarPagina('abc')).toBe(PAGINA_PADRAO);
    expect(normalizarPagina('0')).toBe(PAGINA_PADRAO);
    expect(normalizarPagina('-2')).toBe(PAGINA_PADRAO);
  });
});

describe('normalizarTamanho', () => {
  it('aceita somente tamanhos permitidos', () => {
    expect(normalizarTamanho('25')).toBe(25);
    expect(normalizarTamanho('50')).toBe(50);
  });

  it('cai no padrão para tamanhos fora da lista', () => {
    expect(normalizarTamanho('99999')).toBe(TAMANHO_PADRAO);
    expect(normalizarTamanho('7')).toBe(TAMANHO_PADRAO);
    expect(normalizarTamanho(undefined)).toBe(TAMANHO_PADRAO);
  });
});
