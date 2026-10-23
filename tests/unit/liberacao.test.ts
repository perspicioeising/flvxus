import { describe, expect, it } from 'vitest';

import { agendamentoSchema, resolverPrazoParaData } from '@/schemas/treino';
import { agruparPorTenant, elegivelParaLiberar } from '@/lib/treinos/liberacao';
import { formatarDataBr } from '@/components/professor/treinos/labels';

const MS_DIA = 86_400_000;

describe('resolverPrazoParaData', () => {
  it('soma 1 dia ao ms exato', () => {
    const base = new Date('2026-01-01T00:00:00.000Z');
    const r = resolverPrazoParaData(base, 1);
    expect(r.getTime()).toBe(base.getTime() + MS_DIA);
  });

  it('soma 30 dias ao ms exato', () => {
    const base = new Date('2026-01-01T12:34:56.000Z');
    const r = resolverPrazoParaData(base, 30);
    expect(r.getTime()).toBe(base.getTime() + 30 * MS_DIA);
  });

  it('não muta a data base', () => {
    const base = new Date('2026-01-01T00:00:00.000Z');
    const antes = base.getTime();
    resolverPrazoParaData(base, 10);
    expect(base.getTime()).toBe(antes);
  });
});

describe('agendamentoSchema', () => {
  // ISO explícito com meia-noite UTC evita flakiness de fuso no CI (ver §5.2).
  function isoDeOffsetDias(dias: number): string {
    return new Date(Date.now() + dias * MS_DIA).toISOString().slice(0, 10);
  }

  it('aceita modo "agora" sem outros campos', () => {
    expect(agendamentoSchema.safeParse({ modo: 'agora' }).success).toBe(true);
  });

  it('aceita modo "data" com data futura', () => {
    const r = agendamentoSchema.safeParse({ modo: 'data', data: isoDeOffsetDias(2) });
    expect(r.success).toBe(true);
  });

  it('rejeita modo "data" com data passada (mensagem "no futuro")', () => {
    const r = agendamentoSchema.safeParse({ modo: 'data', data: isoDeOffsetDias(-1) });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues.some((i) => i.message.includes('futuro'))).toBe(true);
    }
  });

  it('rejeita modo "data" com tipo inválido', () => {
    const r = agendamentoSchema.safeParse({ modo: 'data', data: 'não é data' });
    expect(r.success).toBe(false);
  });

  it('aceita modo "dias" com inteiro positivo', () => {
    expect(agendamentoSchema.safeParse({ modo: 'dias', dias: 30 }).success).toBe(true);
    expect(agendamentoSchema.safeParse({ modo: 'dias', dias: 1 }).success).toBe(true);
    expect(agendamentoSchema.safeParse({ modo: 'dias', dias: 3650 }).success).toBe(true);
  });

  it('rejeita dias <= 0, decimal ou > 3650', () => {
    expect(agendamentoSchema.safeParse({ modo: 'dias', dias: 0 }).success).toBe(false);
    expect(agendamentoSchema.safeParse({ modo: 'dias', dias: -5 }).success).toBe(false);
    expect(agendamentoSchema.safeParse({ modo: 'dias', dias: 1.5 }).success).toBe(false);
    expect(agendamentoSchema.safeParse({ modo: 'dias', dias: 3651 }).success).toBe(false);
  });

  it('rejeita modo desconhecido (union fechada)', () => {
    expect(agendamentoSchema.safeParse({ modo: 'qualquer' }).success).toBe(false);
  });
});

describe('elegivelParaLiberar', () => {
  const agora = new Date('2026-06-01T06:00:00.000Z');

  it('agendada vencida + draft → elegível', () => {
    expect(
      elegivelParaLiberar(
        { status: 'draft', scheduled_release_at: '2026-05-31T00:00:00.000Z' },
        agora
      )
    ).toBe(true);
  });

  it('agendada no futuro + draft → não elegível', () => {
    expect(
      elegivelParaLiberar(
        { status: 'draft', scheduled_release_at: '2026-06-10T00:00:00.000Z' },
        agora
      )
    ).toBe(false);
  });

  it('sem agendamento (null) + draft → não elegível', () => {
    expect(
      elegivelParaLiberar({ status: 'draft', scheduled_release_at: null }, agora)
    ).toBe(false);
  });

  it('vencida mas status != draft → não elegível', () => {
    for (const status of ['released', 'approved', 'pending_review', 'archived'] as const) {
      expect(
        elegivelParaLiberar(
          { status, scheduled_release_at: '2026-05-31T00:00:00.000Z' },
          agora
        )
      ).toBe(false);
    }
  });
});

describe('agruparPorTenant', () => {
  it('agrupa ids por tenant', () => {
    const mapa = agruparPorTenant([
      { id: 'a', tenant_id: 't1' },
      { id: 'b', tenant_id: 't2' },
      { id: 'c', tenant_id: 't1' },
    ]);
    expect(mapa.get('t1')).toEqual(['a', 'c']);
    expect(mapa.get('t2')).toEqual(['b']);
    expect(mapa.size).toBe(2);
  });

  it('lista vazia → map vazio', () => {
    expect(agruparPorTenant([]).size).toBe(0);
  });
});

describe('formatarDataBr', () => {
  it('formata ISO como DD/MM/AAAA', () => {
    // Meio-dia UTC: o dia do calendário é o mesmo em qualquer fuso realista
    // (±12h), evitando flakiness de fuso no CI.
    expect(formatarDataBr('2026-11-15T12:00:00.000Z')).toBe('15/11/2026');
  });
});
