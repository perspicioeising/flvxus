import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  acumuladoEsperadoMl,
  CONFIG_AGUA_PADRAO,
  LEMBRETE_FIM_PADRAO_MIN,
  LEMBRETE_INICIO_PADRAO_MIN,
  LEMBRETE_INTERVALO_PADRAO_MIN,
  porcaoMl,
  projetarAgua,
  quantidadeLembretes,
  resumoAguaPorDia,
  type ConfigAgua,
} from '@/lib/agenda/agua';

const SP = 'America/Sao_Paulo';

describe('constantes × migration (paridade estática)', () => {
  const sql = readFileSync(
    join(process.cwd(), 'supabase/migrations/20261107090100_agenda_core.sql'),
    'utf8'
  );
  const padrao = (coluna: string) =>
    Number(new RegExp(`${coluna}\\s+smallint\\s+not\\s+null\\s+default\\s+(\\d+)`, 'i').exec(sql)?.[1]);

  it('defaults de lembrete iguais ao SQL', () => {
    expect(LEMBRETE_INTERVALO_PADRAO_MIN).toBe(padrao('reminder_interval_min'));
    expect(LEMBRETE_INICIO_PADRAO_MIN).toBe(padrao('reminder_start_min'));
    expect(LEMBRETE_FIM_PADRAO_MIN).toBe(padrao('reminder_end_min'));
    expect([LEMBRETE_INICIO_PADRAO_MIN, LEMBRETE_FIM_PADRAO_MIN, LEMBRETE_INTERVALO_PADRAO_MIN]).toEqual([480, 1320, 60]);
  });
});

describe('N e porção', () => {
  it('padrão: 15 lembretes, 150 ml (2000/15≈133)', () => {
    expect(quantidadeLembretes(CONFIG_AGUA_PADRAO)).toBe(15);
    expect(porcaoMl(CONFIG_AGUA_PADRAO)).toBe(150);
  });

  it('intervalo de 30 min: 29 lembretes, 50 ml', () => {
    const c: ConfigAgua = { ...CONFIG_AGUA_PADRAO, intervaloMin: 30 };
    expect(quantidadeLembretes(c)).toBe(29);
    expect(porcaoMl(c)).toBe(50); // 2000/29≈69 → 50
  });

  it('janela curta: 3 lembretes ⇒ 650 ml; 2 lembretes ⇒ 1000 ml', () => {
    const c: ConfigAgua = { metaMl: 2000, inicioMin: 480, fimMin: 600, intervaloMin: 60 };
    expect(quantidadeLembretes(c)).toBe(3);
    expect(porcaoMl(c)).toBe(650);
    const d: ConfigAgua = { metaMl: 2000, inicioMin: 480, fimMin: 570, intervaloMin: 90 };
    expect(quantidadeLembretes(d)).toBe(2);
    expect(porcaoMl(d)).toBe(1000);
  });

  it('porção mínima de 50 ml e config inválida', () => {
    expect(porcaoMl({ metaMl: 100, inicioMin: 0, fimMin: 1000, intervaloMin: 30 })).toBe(50);
    expect(quantidadeLembretes({ inicioMin: 600, fimMin: 500, intervaloMin: 60 })).toBe(0);
  });

  it('acumulado esperado com teto na meta', () => {
    expect(acumuladoEsperadoMl(CONFIG_AGUA_PADRAO, 0)).toBe(150);
    expect(acumuladoEsperadoMl(CONFIG_AGUA_PADRAO, 12)).toBe(1950);
    expect(acumuladoEsperadoMl(CONFIG_AGUA_PADRAO, 13)).toBe(2000);
    expect(acumuladoEsperadoMl(CONFIG_AGUA_PADRAO, 14)).toBe(2000);
  });
});

describe('projetarAgua', () => {
  const base = {
    config: CONFIG_AGUA_PADRAO,
    registros: [],
    diaInicio: '2024-05-15',
    diaFim: '2024-05-15',
    hoje: '2024-05-15',
    tz: SP,
    agora: new Date('2024-05-15T15:30:00Z'), // 12:30 em SP
  };

  it('gera 08:00…22:00 no fuso local', () => {
    const e = projetarAgua(base);
    expect(e).toHaveLength(15);
    expect(e[0].inicio).toBe('2024-05-15T11:00:00.000Z');
    expect(e[14].inicio).toBe('2024-05-16T01:00:00.000Z');
  });

  it('status cumulativo pelo total do dia; atrasado vs previsto', () => {
    const e = projetarAgua({ ...base, registros: [{ occurred_on: '2024-05-15', amount_ml: 450 }] });
    // 450 ml cobre k=0,1,2 (150/300/450).
    expect(e.slice(0, 3).every((x) => x.status === 'concluido')).toBe(true);
    // k=3 (11:00) e k=4 (12:00) já passaram → atrasado; k=5 (13:00) → previsto.
    expect(e[3].status).toBe('atrasado');
    expect(e[4].status).toBe('atrasado');
    expect(e[5].status).toBe('previsto');
  });

  it('um registro grande conclui vários lembretes (não há vínculo 1:1)', () => {
    const e = projetarAgua({ ...base, registros: [{ occurred_on: '2024-05-15', amount_ml: 2000 }] });
    expect(e.every((x) => x.status === 'concluido')).toBe(true);
  });

  it('soma registros do dia-SP; ignora outros dias', () => {
    const e = projetarAgua({
      ...base,
      registros: [
        { occurred_on: '2024-05-15', amount_ml: 100 },
        { occurred_on: '2024-05-15', amount_ml: 50 },
        { occurred_on: '2024-05-14', amount_ml: 2000 },
      ],
    });
    expect(e[0].status).toBe('concluido');
    expect(e[1].status).not.toBe('concluido');
  });

  it('"Concluir" só no dia atual e só se pendente; registra a porção', () => {
    const e = projetarAgua(base);
    expect(e[0].acao).toEqual({ tipo: 'concluir_agua', ml: 150 });
    const outroDia = projetarAgua({ ...base, diaInicio: '2024-05-16', diaFim: '2024-05-16' });
    expect(outroDia.every((x) => x.acao === null)).toBe(true);
    const feito = projetarAgua({ ...base, registros: [{ occurred_on: '2024-05-15', amount_ml: 2000 }] });
    expect(feito.every((x) => x.acao === null)).toBe(true);
  });

  it('config inválida ⇒ vazio', () => {
    expect(projetarAgua({ ...base, config: { ...CONFIG_AGUA_PADRAO, fimMin: 100, inicioMin: 500 } })).toEqual([]);
  });
});

describe('resumoAguaPorDia', () => {
  it('agrupa para o chip "Água x/N"', () => {
    const e = projetarAgua({
      config: CONFIG_AGUA_PADRAO,
      registros: [{ occurred_on: '2024-05-15', amount_ml: 450 }],
      diaInicio: '2024-05-15',
      diaFim: '2024-05-16',
      hoje: '2024-05-15',
      tz: SP,
      agora: new Date('2024-05-15T15:30:00Z'),
    });
    expect(resumoAguaPorDia(e)).toEqual([
      { dia: '2024-05-15', concluidos: 3, total: 15 },
      { dia: '2024-05-16', concluidos: 0, total: 15 },
    ]);
  });
});
