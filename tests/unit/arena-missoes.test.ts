import { describe, expect, it } from 'vitest';

import {
  montarMissoes,
  type EstadoMissao,
  type MissaoId,
} from '@/lib/arena/missoes';

// Referência: quarta-feira 20/03/2024 12:00Z = dia-SP 2024-03-20.
const REFERENCIA = new Date('2024-03-20T12:00:00Z');

function diaUtc(ymd: string): string {
  return `${ymd}T12:00:00.000Z`;
}

function estadoDe(missoes: ReturnType<typeof montarMissoes>, id: MissaoId): EstadoMissao | undefined {
  return missoes.find((m) => m.id === id)?.estado;
}

describe('montarMissoes — missões sem fonte ficam bloqueadas (RF8.5)', () => {
  it('água, dieta e refeições são sempre bloqueadas', () => {
    const missoes = montarMissoes({ treinos: [], descansos: [] }, REFERENCIA);
    expect(estadoDe(missoes, 'agua_dia')).toBe('bloqueada');
    expect(estadoDe(missoes, 'dieta_dia')).toBe('bloqueada');
    expect(estadoDe(missoes, 'refeicoes_dia')).toBe('bloqueada');
  });
});

describe('montarMissoes — missão do dia por período (RF8.4)', () => {
  it('treino de hoje concluído marca a missão como concluída', () => {
    const missoes = montarMissoes(
      { treinos: [diaUtc('2024-03-20')], descansos: [] },
      REFERENCIA
    );
    expect(estadoDe(missoes, 'treino_dia')).toBe('concluida');
  });

  it('sem treino hoje, a missão do dia fica pendente', () => {
    const missoes = montarMissoes(
      { treinos: [diaUtc('2024-03-19')], descansos: [] },
      REFERENCIA
    );
    expect(estadoDe(missoes, 'treino_dia')).toBe('pendente');
  });
});

describe('montarMissoes — dia de descanso (RF8.3)', () => {
  it('no dia de descanso, a missão do dia é o descanso (não cobra treino)', () => {
    const missoes = montarMissoes(
      { treinos: [], descansos: [diaUtc('2024-03-20')], diaDeDescanso: true },
      REFERENCIA
    );
    expect(estadoDe(missoes, 'treino_dia')).toBeUndefined();
    expect(estadoDe(missoes, 'descanso_dia')).toBe('concluida');
  });

  it('dia de descanso ainda não cumprido fica pendente', () => {
    const missoes = montarMissoes(
      { treinos: [], descansos: [], diaDeDescanso: true },
      REFERENCIA
    );
    expect(estadoDe(missoes, 'descanso_dia')).toBe('pendente');
  });
});

describe('montarMissoes — semanais por período SP (RF8.2)', () => {
  it('3 treinos na semana conclui a missão semanal', () => {
    const missoes = montarMissoes(
      {
        treinos: [diaUtc('2024-03-18'), diaUtc('2024-03-19'), diaUtc('2024-03-20')],
        descansos: [],
      },
      REFERENCIA
    );
    expect(estadoDe(missoes, 'treinos_semana')).toBe('concluida');
  });

  it('menos de 3 treinos na semana deixa a missão pendente', () => {
    const missoes = montarMissoes(
      { treinos: [diaUtc('2024-03-18'), diaUtc('2024-03-19')], descansos: [] },
      REFERENCIA
    );
    expect(estadoDe(missoes, 'treinos_semana')).toBe('pendente');
  });

  it('treinos de semana anterior não contam para a missão semanal', () => {
    // 11/03 é segunda da semana anterior; só 18/03 e 19/03 contam.
    const missoes = montarMissoes(
      {
        treinos: [diaUtc('2024-03-11'), diaUtc('2024-03-18'), diaUtc('2024-03-19')],
        descansos: [],
      },
      REFERENCIA
    );
    expect(estadoDe(missoes, 'treinos_semana')).toBe('pendente');
  });

  it('7 dias de aderência no período conclui a consistência semanal', () => {
    const missoes = montarMissoes(
      {
        treinos: [
          diaUtc('2024-03-14'),
          diaUtc('2024-03-15'),
          diaUtc('2024-03-16'),
          diaUtc('2024-03-17'),
        ],
        descansos: [diaUtc('2024-03-18'), diaUtc('2024-03-19'), diaUtc('2024-03-20')],
      },
      REFERENCIA
    );
    expect(estadoDe(missoes, 'consistencia_semana')).toBe('concluida');
  });
});
