import { describe, expect, it } from 'vitest';

import { calcularStreakAderencia } from '@/lib/arena/streak';

// Referência: 20/03/2024 12:00Z = 09:00 SP, dia-SP 2024-03-20.
const REFERENCIA = new Date('2024-03-20T12:00:00Z');

/** Instante ao meio-dia UTC de um dia-SP (mesmo dia de calendário). */
function diaUtc(ymd: string): string {
  return `${ymd}T12:00:00.000Z`;
}

describe('calcularStreakAderencia', () => {
  it('conta dias-SP consecutivos com treino terminando hoje', () => {
    const r = calcularStreakAderencia(
      [diaUtc('2024-03-20'), diaUtc('2024-03-19'), diaUtc('2024-03-18')],
      REFERENCIA
    );
    expect(r.current_streak).toBe(3);
  });

  it('descanso cumprido MANTÉM a streak (RF9.2)', () => {
    // 20 treino, 19 descanso, 18 treino => 3 dias consecutivos.
    const r = calcularStreakAderencia(
      [diaUtc('2024-03-20'), diaUtc('2024-03-19'), diaUtc('2024-03-18')],
      REFERENCIA
    );
    expect(r.current_streak).toBe(3);
  });

  it('faltar a um dia (sem treino e sem descanso) QUEBRA no gap (RF9.3)', () => {
    // 20 e 19 presentes, 18 ausente (gap), 17 presente => streak atual = 2.
    const r = calcularStreakAderencia(
      [diaUtc('2024-03-20'), diaUtc('2024-03-19'), diaUtc('2024-03-17')],
      REFERENCIA
    );
    expect(r.current_streak).toBe(2);
  });

  it('dia corrente sem evento NÃO quebra: conta a partir de ontem', () => {
    // Hoje (20) sem evento; 19 e 18 presentes => streak congela em 2.
    const r = calcularStreakAderencia(
      [diaUtc('2024-03-19'), diaUtc('2024-03-18')],
      REFERENCIA
    );
    expect(r.current_streak).toBe(2);
  });

  it('múltiplas sessões no mesmo dia-SP contam como UM dia', () => {
    const r = calcularStreakAderencia(
      [
        '2024-03-20T11:00:00Z',
        '2024-03-20T23:00:00Z',
        diaUtc('2024-03-19'),
      ],
      REFERENCIA
    );
    expect(r.current_streak).toBe(2);
  });

  it('descanso + sessão no mesmo dia-SP contam como UM dia', () => {
    const r = calcularStreakAderencia(
      [diaUtc('2024-03-20'), diaUtc('2024-03-20'), diaUtc('2024-03-19')],
      REFERENCIA
    );
    expect(r.current_streak).toBe(2);
  });

  it('borda 23h30 SP: evento às 23h30 conta no dia-SP, não no UTC seguinte (critério 17)', () => {
    // 19/03 23h30 SP = 20/03 02h30Z. Referência 20/03 => esse evento é "ontem".
    const r = calcularStreakAderencia(
      ['2024-03-20T02:30:00Z', diaUtc('2024-03-19')],
      REFERENCIA
    );
    // Ambos caem em 2024-03-19 (um dia). Hoje (20) sem evento => congela em 1.
    expect(r.current_streak).toBe(1);
  });

  it('longest_streak reflete a maior sequência histórica', () => {
    const r = calcularStreakAderencia(
      [
        // sequência antiga de 4 dias
        diaUtc('2024-03-01'),
        diaUtc('2024-03-02'),
        diaUtc('2024-03-03'),
        diaUtc('2024-03-04'),
        // sequência atual de 2 dias
        diaUtc('2024-03-19'),
        diaUtc('2024-03-20'),
      ],
      REFERENCIA
    );
    expect(r.current_streak).toBe(2);
    expect(r.longest_streak).toBe(4);
  });

  it('dias inválidos/ausentes são ignorados', () => {
    const r = calcularStreakAderencia(
      [null, undefined, 'data-invalida', diaUtc('2024-03-20')],
      REFERENCIA
    );
    expect(r.current_streak).toBe(1);
  });

  it('lista vazia => streak 0', () => {
    expect(calcularStreakAderencia([], REFERENCIA)).toEqual({
      current_streak: 0,
      longest_streak: 0,
    });
  });
});
