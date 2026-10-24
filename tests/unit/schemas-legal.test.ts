import { describe, expect, it } from 'vitest';

import {
  documentVersionSchema,
  legalDocumentTypeSchema,
  registrarAceiteSchema,
} from '@/schemas/legal';

describe('documentVersionSchema', () => {
  it('aceita semver curto MAJOR.MINOR', () => {
    expect(documentVersionSchema.safeParse('1.0').success).toBe(true);
    expect(documentVersionSchema.safeParse('2.3').success).toBe(true);
    expect(documentVersionSchema.safeParse('10.42').success).toBe(true);
  });

  it('rejeita formatos fora de MAJOR.MINOR', () => {
    expect(documentVersionSchema.safeParse('1').success).toBe(false);
    expect(documentVersionSchema.safeParse('1.0.0').success).toBe(false);
    expect(documentVersionSchema.safeParse('v1.0').success).toBe(false);
    expect(documentVersionSchema.safeParse('').success).toBe(false);
  });
});

describe('legalDocumentTypeSchema', () => {
  it('aceita terms e privacy', () => {
    expect(legalDocumentTypeSchema.safeParse('terms').success).toBe(true);
    expect(legalDocumentTypeSchema.safeParse('privacy').success).toBe(true);
  });

  it('rejeita tipo desconhecido', () => {
    expect(legalDocumentTypeSchema.safeParse('cookies').success).toBe(false);
  });
});

describe('registrarAceiteSchema', () => {
  it('aceita um e dois documentos válidos', () => {
    expect(
      registrarAceiteSchema.safeParse({
        documents: [{ type: 'terms', version: '1.0' }],
      }).success,
    ).toBe(true);

    expect(
      registrarAceiteSchema.safeParse({
        documents: [
          { type: 'terms', version: '1.0' },
          { type: 'privacy', version: '1.0' },
        ],
      }).success,
    ).toBe(true);
  });

  it('rejeita array vazio', () => {
    expect(registrarAceiteSchema.safeParse({ documents: [] }).success).toBe(false);
  });

  it('rejeita mais de dois documentos', () => {
    const r = registrarAceiteSchema.safeParse({
      documents: [
        { type: 'terms', version: '1.0' },
        { type: 'privacy', version: '1.0' },
        { type: 'terms', version: '2.0' },
      ],
    });
    expect(r.success).toBe(false);
  });

  it('rejeita tipo de documento duplicado', () => {
    const r = registrarAceiteSchema.safeParse({
      documents: [
        { type: 'terms', version: '1.0' },
        { type: 'terms', version: '2.0' },
      ],
    });
    expect(r.success).toBe(false);
  });

  it('rejeita versão malformada', () => {
    const r = registrarAceiteSchema.safeParse({
      documents: [{ type: 'terms', version: 'abc' }],
    });
    expect(r.success).toBe(false);
  });

  it('rejeita type inválido', () => {
    const r = registrarAceiteSchema.safeParse({
      documents: [{ type: 'outro', version: '1.0' }],
    });
    expect(r.success).toBe(false);
  });
});
