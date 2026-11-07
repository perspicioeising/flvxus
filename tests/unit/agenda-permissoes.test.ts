import { describe, expect, it } from 'vitest';
import { mensagemErroAgenda, MENSAGEM_GENERICA_AGENDA } from '@/lib/agenda/erros';
import {
  ehAtendimento,
  perfilAgenda,
  podeAgenda,
  TIPOS_AGENDA,
  tiposCriaveis,
} from '@/lib/agenda/permissoes';

describe('perfilAgenda', () => {
  it('mapeia papel × tipo de conta', () => {
    expect(perfilAgenda('trainer', 'professional')).toBe('professor');
    expect(perfilAgenda('trainer', 'self_managed')).toBe('autonomo');
    expect(perfilAgenda('student', 'professional')).toBe('aluno');
  });
});

describe('criar', () => {
  it('professor cria os 5 tipos; aluno e autônomo só pessoal', () => {
    expect(tiposCriaveis('professor')).toEqual([...TIPOS_AGENDA]);
    expect(tiposCriaveis('aluno')).toEqual(['personal']);
    expect(tiposCriaveis('autonomo')).toEqual(['personal']);
    for (const k of TIPOS_AGENDA) {
      expect(podeAgenda('professor', k, 'criar')).toBe(true);
      expect(podeAgenda('aluno', k, 'criar')).toBe(k === 'personal');
      expect(podeAgenda('autonomo', k, 'criar')).toBe(k === 'personal');
    }
  });

  it('autônomo não cria bloqueio nem atendimento', () => {
    expect(podeAgenda('autonomo', 'block', 'criar')).toBe(false);
    expect(podeAgenda('autonomo', 'in_person', 'criar')).toBe(false);
  });
});

describe('editar / cancelar', () => {
  it('aluno e autônomo: só o próprio compromisso pessoal', () => {
    for (const perfil of ['aluno', 'autonomo'] as const) {
      for (const acao of ['editar', 'cancelar'] as const) {
        expect(podeAgenda(perfil, 'personal', acao, { ehDono: true })).toBe(true);
        expect(podeAgenda(perfil, 'personal', acao, { ehDono: false })).toBe(false);
        expect(podeAgenda(perfil, 'in_person', acao, { ehDono: true })).toBe(false);
        expect(podeAgenda(perfil, 'online', acao, { ehDono: true })).toBe(false);
        expect(podeAgenda(perfil, 'assessment', acao, { ehDono: true })).toBe(false);
      }
    }
  });

  it('professor: pessoal e bloqueio só do dono', () => {
    for (const k of ['personal', 'block'] as const) {
      expect(podeAgenda('professor', k, 'editar', { ehDono: true })).toBe(true);
      expect(podeAgenda('professor', k, 'cancelar', { ehDono: false, ehMaster: true })).toBe(false);
    }
  });

  it('professor: atendimento do dono; de terceiro só master ou trainer_id (M3)', () => {
    for (const k of ['in_person', 'online', 'assessment'] as const) {
      expect(ehAtendimento(k)).toBe(true);
      expect(podeAgenda('professor', k, 'editar', { ehDono: true })).toBe(true);
      expect(podeAgenda('professor', k, 'cancelar', { ehMaster: true })).toBe(true);
      expect(podeAgenda('professor', k, 'editar', { ehTrainerDoAtendimento: true })).toBe(true);
      // módulo agenda aberto dá só visibilidade
      expect(podeAgenda('professor', k, 'editar', {})).toBe(false);
      expect(podeAgenda('professor', k, 'cancelar', { ehDono: false })).toBe(false);
    }
    expect(ehAtendimento('personal')).toBe(false);
    expect(ehAtendimento('block')).toBe(false);
  });
});

describe('mensagemErroAgenda', () => {
  it('mapeia P0001 conhecido para pt-BR', () => {
    expect(mensagemErroAgenda({ code: 'P0001', message: 'agenda_past' })).toMatch(/passaram/);
    expect(mensagemErroAgenda({ code: 'P0001', message: 'agenda_forbidden' })).toMatch(/permissão/);
    for (const c of ['agenda_student_invalid', 'agenda_immutable', 'agenda_invalid_occurrence', 'agenda_invalid_range']) {
      expect(mensagemErroAgenda({ code: 'P0001', message: c })).not.toBe(MENSAGEM_GENERICA_AGENDA);
    }
  });

  it('genérica para desconhecido, outro code ou nulo', () => {
    expect(mensagemErroAgenda({ code: 'P0001', message: 'outra' })).toBe(MENSAGEM_GENERICA_AGENDA);
    expect(mensagemErroAgenda({ code: '42501', message: 'agenda_past' })).toBe(MENSAGEM_GENERICA_AGENDA);
    expect(mensagemErroAgenda(null)).toBe(MENSAGEM_GENERICA_AGENDA);
  });
});
