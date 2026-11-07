import { describe, expect, it } from 'vitest';
import {
  diaLocal,
  diaValido,
  diasDoIntervalo,
  diasNoMes,
  horaLocal,
  instanteDeLocal,
  intervaloDoDia,
  janelaDaVisao,
  somarDias,
  validarTz,
  weekdayDeDia,
} from '@/lib/agenda/fuso';

const SP = 'America/Sao_Paulo';

describe('instanteDeLocal', () => {
  it('converte hora de parede de São Paulo (UTC−3)', () => {
    expect(instanteDeLocal('2024-05-10', '23:30', SP).toISOString()).toBe('2024-05-11T02:30:00.000Z');
    expect(instanteDeLocal('2024-05-10', '08:00', SP).toISOString()).toBe('2024-05-10T11:00:00.000Z');
  });

  it('Lisboa: lacuna do horário de verão avança para a primeira hora válida', () => {
    // 2024-03-31 01:30 não existe em Lisboa (01:00 WET → 02:00 WEST).
    const i = instanteDeLocal('2024-03-31', '01:30', 'Europe/Lisbon');
    expect(i.toISOString()).toBe('2024-03-31T01:30:00.000Z');
    expect(horaLocal(i, 'Europe/Lisbon')).toBe('02:30');
  });

  it('Lisboa: hora repetida usa a primeira ocorrência', () => {
    // 2024-10-27 01:30 ocorre duas vezes (WEST e depois WET).
    const i = instanteDeLocal('2024-10-27', '01:30', 'Europe/Lisbon');
    expect(i.toISOString()).toBe('2024-10-27T00:30:00.000Z');
  });

  it('Nova York: horário normal e lacuna', () => {
    expect(instanteDeLocal('2024-01-15', '09:00', 'America/New_York').toISOString()).toBe('2024-01-15T14:00:00.000Z');
    expect(instanteDeLocal('2024-07-15', '09:00', 'America/New_York').toISOString()).toBe('2024-07-15T13:00:00.000Z');
    const gap = instanteDeLocal('2024-03-10', '02:30', 'America/New_York');
    expect(horaLocal(gap, 'America/New_York')).toBe('03:30');
  });

  it('independe do fuso da máquina (resultado fixo)', () => {
    const a = instanteDeLocal('2024-06-01', '12:00', SP).getTime();
    expect(a).toBe(Date.UTC(2024, 5, 1, 15, 0));
  });

  it('rejeita dia/hora inválidos', () => {
    expect(() => instanteDeLocal('2024-02-30', '10:00', SP)).toThrow();
    expect(() => instanteDeLocal('2024-02-10', '25:00', SP)).toThrow();
  });
});

describe('diaLocal / horaLocal', () => {
  it('23:30 local não desloca o dia (dia UTC já é o seguinte)', () => {
    const i = new Date('2024-05-11T02:30:00.000Z');
    expect(diaLocal(i, SP)).toBe('2024-05-10');
    expect(horaLocal(i, SP)).toBe('23:30');
    expect(i.toISOString().slice(0, 10)).toBe('2024-05-11');
  });

  it('aceita ISO string e ida-e-volta com instanteDeLocal', () => {
    const i = instanteDeLocal('2024-12-31', '23:59', SP);
    expect(diaLocal(i.toISOString(), SP)).toBe('2024-12-31');
    expect(horaLocal(i, SP)).toBe('23:59');
  });
});

describe('dia cru (YYYY-MM-DD) nunca é reconvertido por fuso', () => {
  it('somarDias / weekdayDeDia usam só aritmética de calendário', () => {
    expect(somarDias('2024-02-28', 1)).toBe('2024-02-29');
    expect(somarDias('2024-03-01', -1)).toBe('2024-02-29');
    expect(somarDias('2023-12-31', 1)).toBe('2024-01-01');
    expect(weekdayDeDia('2024-05-12')).toBe(0); // domingo
    expect(weekdayDeDia('2024-05-15')).toBe(3); // quarta
    expect(weekdayDeDia('2024-05-18')).toBe(6); // sábado
  });

  it('diaValido / diasNoMes', () => {
    expect(diaValido('2024-02-29')).toBe(true);
    expect(diaValido('2023-02-29')).toBe(false);
    expect(diaValido('2024-13-01')).toBe(false);
    expect(diaValido('2024-5-1')).toBe(false);
    expect(diasNoMes(2024, 2)).toBe(29);
    expect(diasNoMes(2023, 2)).toBe(28);
    expect(diasNoMes(2024, 4)).toBe(30);
  });

  it('diasDoIntervalo é inclusivo', () => {
    expect(diasDoIntervalo('2024-05-30', '2024-06-02')).toEqual([
      '2024-05-30',
      '2024-05-31',
      '2024-06-01',
      '2024-06-02',
    ]);
  });
});

describe('intervaloDoDia / janelaDaVisao', () => {
  it('intervalo do dia em SP tem 24h', () => {
    const { inicio, fim } = intervaloDoDia('2024-05-10', SP);
    expect(inicio.toISOString()).toBe('2024-05-10T03:00:00.000Z');
    expect(fim.getTime() - inicio.getTime()).toBe(24 * 3600_000);
  });

  it('dia de DST em Nova York tem 23h', () => {
    const { inicio, fim } = intervaloDoDia('2024-03-10', 'America/New_York');
    expect(fim.getTime() - inicio.getTime()).toBe(23 * 3600_000);
  });

  it('semana é domingo–sábado', () => {
    const j = janelaDaVisao('semana', '2024-05-15', SP);
    expect(j.diaInicio).toBe('2024-05-12');
    expect(j.diaFim).toBe('2024-05-18');
    expect(j.fim.getTime() - j.inicio.getTime()).toBe(7 * 24 * 3600_000);
  });

  it('semana começando num domingo e terminando num sábado', () => {
    expect(janelaDaVisao('semana', '2024-05-12', SP).diaInicio).toBe('2024-05-12');
    expect(janelaDaVisao('semana', '2024-05-18', SP).diaInicio).toBe('2024-05-12');
  });

  it('mês cobre do dia 1 ao último', () => {
    const j = janelaDaVisao('mes', '2024-02-15', SP);
    expect(j.diaInicio).toBe('2024-02-01');
    expect(j.diaFim).toBe('2024-02-29');
  });

  it('dia', () => {
    const j = janelaDaVisao('dia', '2024-05-10', SP);
    expect(j.diaInicio).toBe('2024-05-10');
    expect(j.diaFim).toBe('2024-05-10');
  });
});

describe('validarTz', () => {
  it('aceita nomes IANA e rejeita inválidos', () => {
    expect(validarTz('America/Sao_Paulo')).toBe(true);
    expect(validarTz('UTC')).toBe(true);
    expect(validarTz('Nao/Existe')).toBe(false);
    expect(validarTz('')).toBe(false);
  });
});
