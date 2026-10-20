import { describe, expect, it } from 'vitest';

import { cadastroProfessorSchema, definirSenhaSchema, loginSchema } from '@/schemas/auth';

const cadastroValido = {
  name: 'Bruno Santos',
  businessName: 'Studio Flvxus',
  email: 'bruno@exemplo.com',
  password: 'senha1234',
  confirmPassword: 'senha1234',
};

describe('cadastroProfessorSchema', () => {
  it('aceita um cadastro válido', () => {
    expect(cadastroProfessorSchema.safeParse(cadastroValido).success).toBe(true);
  });

  it('rejeita e-mail inválido', () => {
    const r = cadastroProfessorSchema.safeParse({
      ...cadastroValido,
      email: 'nao-e-email',
    });
    expect(r.success).toBe(false);
  });

  it('rejeita senha com menos de 8 caracteres', () => {
    const r = cadastroProfessorSchema.safeParse({
      ...cadastroValido,
      password: 'curta',
      confirmPassword: 'curta',
    });
    expect(r.success).toBe(false);
  });

  it('rejeita quando a confirmação não bate com a senha', () => {
    const r = cadastroProfessorSchema.safeParse({
      ...cadastroValido,
      confirmPassword: 'outra1234',
    });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(
        r.error.issues.some((i) => i.path.includes('confirmPassword'))
      ).toBe(true);
    }
  });

  it('rejeita nome com menos de 2 caracteres', () => {
    const r = cadastroProfessorSchema.safeParse({ ...cadastroValido, name: 'A' });
    expect(r.success).toBe(false);
  });

  it('rejeita nome da empresa vazio', () => {
    const r = cadastroProfessorSchema.safeParse({
      ...cadastroValido,
      businessName: '',
    });
    expect(r.success).toBe(false);
  });
});

describe('definirSenhaSchema', () => {
  it('aceita uma senha válida confirmada', () => {
    const r = definirSenhaSchema.safeParse({
      password: 'senha1234',
      confirmPassword: 'senha1234',
    });
    expect(r.success).toBe(true);
  });

  it('usa a mesma regra do cadastro: rejeita menos de 8 caracteres', () => {
    const r = definirSenhaSchema.safeParse({
      password: 'curta',
      confirmPassword: 'curta',
    });
    expect(r.success).toBe(false);
  });

  it('rejeita quando a confirmação não bate', () => {
    const r = definirSenhaSchema.safeParse({
      password: 'senha1234',
      confirmPassword: 'outra1234',
    });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues.some((i) => i.path.includes('confirmPassword'))).toBe(true);
    }
  });
});

describe('loginSchema', () => {
  it('aceita credenciais válidas', () => {
    const r = loginSchema.safeParse({
      email: 'bruno@exemplo.com',
      password: 'qualquer',
    });
    expect(r.success).toBe(true);
  });

  it('rejeita e-mail inválido', () => {
    const r = loginSchema.safeParse({ email: 'x', password: 'qualquer' });
    expect(r.success).toBe(false);
  });

  it('rejeita senha vazia', () => {
    const r = loginSchema.safeParse({ email: 'bruno@exemplo.com', password: '' });
    expect(r.success).toBe(false);
  });
});
