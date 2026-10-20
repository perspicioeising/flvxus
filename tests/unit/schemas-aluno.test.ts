import { describe, expect, it } from 'vitest';

import {
  alterarStatusSchema,
  criarAlunoSchema,
  editarAlunoSchema,
} from '@/schemas/aluno';

describe('criarAlunoSchema', () => {
  it('aceita um aluno válido mínimo', () => {
    const r = criarAlunoSchema.safeParse({
      full_name: 'Maria Souza',
      email: 'maria@exemplo.com',
    });
    expect(r.success).toBe(true);
  });

  it('aceita campos opcionais preenchidos e coage altura', () => {
    const r = criarAlunoSchema.safeParse({
      full_name: 'João Lima',
      email: 'joao@exemplo.com',
      phone: '11999999999',
      height_cm: '180',
      experience_level: 'intermediate',
      goal: 'muscle_gain',
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.height_cm).toBe(180);
    }
  });

  it('trata strings vazias de opcionais como ausentes', () => {
    const r = criarAlunoSchema.safeParse({
      full_name: 'Ana',
      email: 'ana@exemplo.com',
      phone: '',
      gender: '',
      height_cm: '',
      experience_level: '',
      goal: '',
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.phone).toBeUndefined();
      expect(r.data.height_cm).toBeUndefined();
      expect(r.data.experience_level).toBeUndefined();
    }
  });

  it('rejeita e-mail inválido', () => {
    const r = criarAlunoSchema.safeParse({
      full_name: 'Maria',
      email: 'nao-e-email',
    });
    expect(r.success).toBe(false);
  });

  it('rejeita nome vazio', () => {
    const r = criarAlunoSchema.safeParse({
      full_name: '',
      email: 'maria@exemplo.com',
    });
    expect(r.success).toBe(false);
  });

  it('rejeita altura negativa', () => {
    const r = criarAlunoSchema.safeParse({
      full_name: 'Maria',
      email: 'maria@exemplo.com',
      height_cm: '-10',
    });
    expect(r.success).toBe(false);
  });

  it('rejeita nível de experiência fora do enum', () => {
    const r = criarAlunoSchema.safeParse({
      full_name: 'Maria',
      email: 'maria@exemplo.com',
      experience_level: 'expert',
    });
    expect(r.success).toBe(false);
  });
});

describe('editarAlunoSchema', () => {
  it('valida os mesmos campos do criar', () => {
    const r = editarAlunoSchema.safeParse({
      full_name: 'Carlos',
      email: 'carlos@exemplo.com',
    });
    expect(r.success).toBe(true);
  });
});

describe('alterarStatusSchema', () => {
  it('aceita status válidos', () => {
    expect(alterarStatusSchema.safeParse({ status: 'active' }).success).toBe(true);
    expect(alterarStatusSchema.safeParse({ status: 'inactive' }).success).toBe(true);
    expect(alterarStatusSchema.safeParse({ status: 'archived' }).success).toBe(true);
  });

  it('rejeita status fora do enum', () => {
    expect(alterarStatusSchema.safeParse({ status: 'pending' }).success).toBe(false);
    expect(alterarStatusSchema.safeParse({ status: 'qualquer' }).success).toBe(false);
  });
});
