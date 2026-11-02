import { describe, expect, it } from 'vitest';

import { detectarPR, type SeriePR } from '@/lib/arena/pr';

function serie(load_done: number | null, reps_done: number | null, completed = true): SeriePR {
  return { load_done, reps_done, completed };
}

describe('detectarPR', () => {
  it('maior carga premia (PR de carga)', () => {
    const r = detectarPR([serie(100, 5)], [serie(90, 5)]);
    expect(r.premia).toBe(true);
    expect(r.prCarga).toBe(true);
  });

  it('maior volume (mesma carga, mais reps) premia (PR de volume)', () => {
    const r = detectarPR([serie(80, 10)], [serie(80, 8)]);
    expect(r.premia).toBe(true);
    expect(r.prVolume).toBe(true);
    expect(r.prCarga).toBe(false);
  });

  it('carga/volume menor ou igual NÃO premia', () => {
    expect(detectarPR([serie(80, 8)], [serie(80, 8)]).premia).toBe(false);
    expect(detectarPR([serie(70, 5)], [serie(80, 8)]).premia).toBe(false);
  });

  it('carga implausível (> 3x o recorde anterior) NÃO premia', () => {
    // recorde anterior 100; série de 400 (>300) é descartada por antifraude.
    const r = detectarPR([serie(400, 5)], [serie(100, 5)]);
    expect(r.premia).toBe(false);
  });

  it('carga plausível no limite (exatamente 3x) premia', () => {
    const r = detectarPR([serie(300, 5)], [serie(100, 5)]);
    expect(r.premia).toBe(true);
    expect(r.prCarga).toBe(true);
  });

  it('série não-completed é ignorada na sessão corrente', () => {
    const r = detectarPR([serie(200, 5, false)], [serie(100, 5)]);
    expect(r.premia).toBe(false);
  });

  it('série não-completed é ignorada no histórico', () => {
    // Histórico só tem série não-completed (ignorada) => sem recorde anterior;
    // qualquer série válida da sessão vira PR.
    const r = detectarPR([serie(50, 5)], [serie(500, 5, false)]);
    expect(r.premia).toBe(true);
  });

  it('série com reps fora de 1..100 é ignorada', () => {
    expect(detectarPR([serie(100, 0)], [serie(50, 5)]).premia).toBe(false);
    expect(detectarPR([serie(100, 101)], [serie(50, 5)]).premia).toBe(false);
  });

  it('série com reps não-inteiro é ignorada', () => {
    expect(detectarPR([serie(100, 5.5)], [serie(50, 5)]).premia).toBe(false);
  });

  it('série com load_done <= 0 é ignorada', () => {
    expect(detectarPR([serie(0, 5)], [serie(50, 5)]).premia).toBe(false);
    expect(detectarPR([serie(-10, 5)], [serie(50, 5)]).premia).toBe(false);
  });

  it('primeiro PR do aluno (sem histórico) premia', () => {
    const r = detectarPR([serie(60, 10)], []);
    expect(r.premia).toBe(true);
    expect(r.prCarga).toBe(true);
    expect(r.prVolume).toBe(true);
  });

  it('sessão sem série válida não premia', () => {
    expect(detectarPR([], [serie(50, 5)]).premia).toBe(false);
  });
});
