import { describe, expect, it } from 'vitest';

import {
  editarPerfilSchema,
  registrarConsentimentoSchema,
  solicitarDadosSchema,
} from '@/schemas/perfil';

describe('editarPerfilSchema', () => {
  it('aceita um perfil válido mínimo (só nome)', () => {
    const r = editarPerfilSchema.safeParse({ full_name: 'Maria Souza' });
    expect(r.success).toBe(true);
  });

  it('aceita campos opcionais e coage/normaliza a altura (vírgula)', () => {
    const r = editarPerfilSchema.safeParse({
      full_name: 'João Lima',
      phone: '11999999999',
      birth_date: '1990-05-01',
      gender: 'masculino',
      height_cm: '180,5',
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.height_cm).toBe(180.5);
    }
  });

  it('trata strings vazias de opcionais como ausentes', () => {
    const r = editarPerfilSchema.safeParse({
      full_name: 'Ana',
      phone: '',
      gender: '',
      birth_date: '',
      height_cm: '',
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.phone).toBeUndefined();
      expect(r.data.height_cm).toBeUndefined();
    }
  });

  it('rejeita nome vazio', () => {
    const r = editarPerfilSchema.safeParse({ full_name: '' });
    expect(r.success).toBe(false);
  });

  it('rejeita altura não positiva', () => {
    expect(editarPerfilSchema.safeParse({ full_name: 'Maria', height_cm: '-10' }).success).toBe(
      false
    );
    expect(editarPerfilSchema.safeParse({ full_name: 'Maria', height_cm: '0' }).success).toBe(
      false
    );
  });

  it('rejeita altura não numérica', () => {
    const r = editarPerfilSchema.safeParse({ full_name: 'Maria', height_cm: 'abc' });
    expect(r.success).toBe(false);
  });
});

describe('registrarConsentimentoSchema', () => {
  it('aceita tipos válidos com granted booleano', () => {
    for (const tipo of ['data_processing', 'health_data', 'ai_processing', 'terms']) {
      expect(
        registrarConsentimentoSchema.safeParse({ consent_type: tipo, granted: true }).success
      ).toBe(true);
    }
    expect(
      registrarConsentimentoSchema.safeParse({ consent_type: 'terms', granted: false }).success
    ).toBe(true);
  });

  it('rejeita tipo de consentimento fora do enum', () => {
    const r = registrarConsentimentoSchema.safeParse({
      consent_type: 'marketing',
      granted: true,
    });
    expect(r.success).toBe(false);
  });

  it('rejeita granted não booleano', () => {
    const r = registrarConsentimentoSchema.safeParse({
      consent_type: 'terms',
      granted: 'sim',
    });
    expect(r.success).toBe(false);
  });
});

describe('solicitarDadosSchema', () => {
  it('aceita export e delete', () => {
    expect(solicitarDadosSchema.safeParse({ request_type: 'export' }).success).toBe(true);
    expect(solicitarDadosSchema.safeParse({ request_type: 'delete' }).success).toBe(true);
  });

  it('rejeita tipo de solicitação fora do enum', () => {
    expect(solicitarDadosSchema.safeParse({ request_type: 'anonymize' }).success).toBe(false);
  });
});
