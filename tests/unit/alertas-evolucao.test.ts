import { describe, expect, it } from 'vitest';

import { montarAlertasEvolucao } from '@/lib/treino/alertas-evolucao';
import type { ResumoFrequencia, SerieCarga } from '@/lib/treino/evolucao-carga';

function ponto(parcial: Partial<SerieCarga['pontos'][number]> & { data: string }) {
  return {
    rotulo: parcial.data.slice(8, 10) + '/' + parcial.data.slice(5, 7),
    cargaMax: 50,
    cargaMedia: 50,
    volume: 500,
    seriesFeitas: 3,
    seriesTotais: 3,
    ...parcial,
  };
}

function freq(parcial: Partial<ResumoFrequencia> = {}): ResumoFrequencia {
  return {
    concluidasPeriodo: 10,
    concluidasTotal: 10,
    dias: 30,
    porSemana: [],
    semanasComTreino: 4,
    ...parcial,
  };
}

describe('montarAlertasEvolucao', () => {
  it('sinaliza estagnação de carga por exercício', () => {
    const serie: SerieCarga = {
      exercicio: 'Supino',
      pontos: [
        ponto({ data: '2024-03-01T10:00:00Z', cargaMax: 50 }),
        ponto({ data: '2024-03-08T10:00:00Z', cargaMax: 50 }),
        ponto({ data: '2024-03-15T10:00:00Z', cargaMax: 50 }),
      ],
    };
    const alertas = montarAlertasEvolucao([serie], freq());
    expect(alertas).toContain('Supino: carga estagnada nas últimas 3 sessões.');
  });

  it('não sinaliza estagnação quando a carga sobe', () => {
    const serie: SerieCarga = {
      exercicio: 'Supino',
      pontos: [
        ponto({ data: '2024-03-01T10:00:00Z', cargaMax: 50 }),
        ponto({ data: '2024-03-08T10:00:00Z', cargaMax: 55 }),
        ponto({ data: '2024-03-15T10:00:00Z', cargaMax: 60 }),
      ],
    };
    const alertas = montarAlertasEvolucao([serie], freq());
    expect(alertas.some((a) => a.startsWith('Supino'))).toBe(false);
  });

  it('sinaliza baixa frequência (≤ 1 treino na janela)', () => {
    const alertas = montarAlertasEvolucao([], freq({ concluidasPeriodo: 1 }));
    expect(alertas).toContain('Apenas 1 treino concluído nos últimos 30 dias.');
  });

  it('usa plural quando zero treinos na janela', () => {
    const alertas = montarAlertasEvolucao([], freq({ concluidasPeriodo: 0 }));
    expect(alertas).toContain('Apenas 0 treinos concluídos nos últimos 30 dias.');
  });

  it('sinaliza muitas séries não concluídas recentemente', () => {
    const serie: SerieCarga = {
      exercicio: 'Supino',
      pontos: [
        ponto({ data: '2024-03-01T10:00:00Z', cargaMax: 55, seriesFeitas: 1, seriesTotais: 4 }),
        ponto({ data: '2024-03-08T10:00:00Z', cargaMax: 60, seriesFeitas: 1, seriesTotais: 4 }),
      ],
    };
    const alertas = montarAlertasEvolucao([serie], freq());
    expect(alertas).toContain('Muitas séries não concluídas nas sessões recentes.');
  });

  it('não gera alertas quando tudo está bem', () => {
    const serie: SerieCarga = {
      exercicio: 'Supino',
      pontos: [
        ponto({ data: '2024-03-01T10:00:00Z', cargaMax: 50, seriesFeitas: 3, seriesTotais: 3 }),
        ponto({ data: '2024-03-08T10:00:00Z', cargaMax: 55, seriesFeitas: 3, seriesTotais: 3 }),
        ponto({ data: '2024-03-15T10:00:00Z', cargaMax: 60, seriesFeitas: 3, seriesTotais: 3 }),
      ],
    };
    const alertas = montarAlertasEvolucao([serie], freq({ concluidasPeriodo: 8 }));
    expect(alertas).toEqual([]);
  });
});
