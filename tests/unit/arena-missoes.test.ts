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

describe('montarMissoes — hábitos ausentes ficam bloqueados (retrocompat G1)', () => {
  it('sem `habitos`, água/dieta/refeições são bloqueadas', () => {
    const missoes = montarMissoes({ treinos: [], descansos: [] }, REFERENCIA);
    expect(estadoDe(missoes, 'agua_dia')).toBe('bloqueada');
    expect(estadoDe(missoes, 'dieta_dia')).toBe('bloqueada');
    expect(estadoDe(missoes, 'refeicoes_dia')).toBe('bloqueada');
  });
});

describe('montarMissoes — hábitos presentes resolvem concluída/pendente (G2)', () => {
  it('flags true marcam as três missões como concluídas', () => {
    const missoes = montarMissoes(
      {
        treinos: [],
        descansos: [],
        habitos: {
          aguaMetaAtingida: true,
          dietaCumprida: true,
          refeicoesRegistradas: true,
        },
      },
      REFERENCIA
    );
    expect(estadoDe(missoes, 'agua_dia')).toBe('concluida');
    expect(estadoDe(missoes, 'dieta_dia')).toBe('concluida');
    expect(estadoDe(missoes, 'refeicoes_dia')).toBe('concluida');
  });

  it('`habitos` presente com flags ausentes/false → pendente (não bloqueada)', () => {
    const missoes = montarMissoes(
      { treinos: [], descansos: [], habitos: {} },
      REFERENCIA
    );
    expect(estadoDe(missoes, 'agua_dia')).toBe('pendente');
    expect(estadoDe(missoes, 'dieta_dia')).toBe('pendente');
    expect(estadoDe(missoes, 'refeicoes_dia')).toBe('pendente');
  });

  it('resolve cada missão de hábito pelo seu próprio flag', () => {
    const missoes = montarMissoes(
      {
        treinos: [],
        descansos: [],
        habitos: { aguaMetaAtingida: true, refeicoesRegistradas: true },
      },
      REFERENCIA
    );
    expect(estadoDe(missoes, 'agua_dia')).toBe('concluida');
    expect(estadoDe(missoes, 'refeicoes_dia')).toBe('concluida');
    expect(estadoDe(missoes, 'dieta_dia')).toBe('pendente');
  });
});

describe('montarMissoes — rótulo de refeicoes_dia (G2)', () => {
  it('o título de refeicoes_dia é "Registrar uma refeição"', () => {
    const missoes = montarMissoes({ treinos: [], descansos: [] }, REFERENCIA);
    expect(missoes.find((m) => m.id === 'refeicoes_dia')?.titulo).toBe(
      'Registrar uma refeição'
    );
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

describe('montarMissoes — borda de fuso: occurred_on dia-SP cru (Parte 1)', () => {
  it('treino com occurred_on dia-SP cru de hoje marca concluída (regressão −1 dia)', () => {
    // `occurred_on` chega do banco como dia-SP cru (`YYYY-MM-DD`), já carimbado
    // por `gamification_sp_date`. Antes do fix, `diaSP("2024-03-20")` voltava um
    // dia ("2024-03-19") e a missão nunca batia com `hoje`.
    const missoes = montarMissoes(
      { treinos: ['2024-03-20'], descansos: [] },
      '2024-03-20'
    );
    expect(estadoDe(missoes, 'treino_dia')).toBe('concluida');
  });

  it('treino às 23h30-SP (servidor-UTC já no dia seguinte) marca concluída no dia-SP', () => {
    // Treino do dia-SP 20/03 (occurred_on cru), com o "agora" do servidor em UTC
    // já em 21/03 02:30Z — que é 23h30-SP de 20/03. Mesmo dia-SP → concluída.
    const refServidorUtc = new Date('2024-03-21T02:30:00Z');
    const missoes = montarMissoes(
      { treinos: ['2024-03-20'], descansos: [] },
      refServidorUtc
    );
    expect(estadoDe(missoes, 'treino_dia')).toBe('concluida');
  });

  it('treino de ontem-SP não marca a missão do dia de hoje', () => {
    const missoes = montarMissoes(
      { treinos: ['2024-03-19'], descansos: [] },
      '2024-03-20'
    );
    expect(estadoDe(missoes, 'treino_dia')).toBe('pendente');
  });

  it('descanso com occurred_on dia-SP cru de hoje marca concluída', () => {
    const missoes = montarMissoes(
      { treinos: [], descansos: ['2024-03-20'], diaDeDescanso: true },
      '2024-03-20'
    );
    expect(estadoDe(missoes, 'descanso_dia')).toBe('concluida');
  });

  it('descanso de ontem-SP não cumpre o descanso de hoje', () => {
    const missoes = montarMissoes(
      { treinos: [], descansos: ['2024-03-19'], diaDeDescanso: true },
      '2024-03-20'
    );
    expect(estadoDe(missoes, 'descanso_dia')).toBe('pendente');
  });
});

describe('montarMissoes — progresso X/Y nas metas múltiplas (Parte 2)', () => {
  function missaoDe(missoes: ReturnType<typeof montarMissoes>, id: MissaoId) {
    return missoes.find((m) => m.id === id);
  }

  it('treinos_semana expõe atual/meta e fica pendente com 2 de 3', () => {
    const missoes = montarMissoes(
      { treinos: [diaUtc('2024-03-18'), diaUtc('2024-03-19')], descansos: [] },
      REFERENCIA
    );
    const m = missaoDe(missoes, 'treinos_semana');
    expect(m?.atual).toBe(2);
    expect(m?.meta).toBe(3);
    expect(m?.estado).toBe('pendente');
  });

  it('treinos_semana conclui com 3 treinos (atual: 3, meta: 3)', () => {
    const missoes = montarMissoes(
      {
        treinos: [diaUtc('2024-03-18'), diaUtc('2024-03-19'), diaUtc('2024-03-20')],
        descansos: [],
      },
      REFERENCIA
    );
    const m = missaoDe(missoes, 'treinos_semana');
    expect(m?.atual).toBe(3);
    expect(m?.meta).toBe(3);
    expect(m?.estado).toBe('concluida');
  });

  it('consistencia_semana expõe atual (nº de dias de aderência) e meta 7', () => {
    const missoes = montarMissoes(
      {
        treinos: [diaUtc('2024-03-18'), diaUtc('2024-03-19')],
        descansos: [diaUtc('2024-03-20')],
      },
      REFERENCIA
    );
    const m = missaoDe(missoes, 'consistencia_semana');
    expect(m?.atual).toBe(3);
    expect(m?.meta).toBe(7);
    expect(m?.estado).toBe('pendente');
  });

  it('missões binárias não expõem atual/meta', () => {
    const missoes = montarMissoes(
      {
        treinos: [],
        descansos: [],
        habitos: {},
      },
      REFERENCIA
    );
    for (const id of ['treino_dia', 'agua_dia', 'dieta_dia', 'refeicoes_dia'] as const) {
      const m = missaoDe(missoes, id);
      expect(m?.atual).toBeUndefined();
      expect(m?.meta).toBeUndefined();
    }
  });
});
