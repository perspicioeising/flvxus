import { describe, expect, it } from 'vitest';

import { valorInicialDaSerie } from '@/lib/treino/prefill';

describe('valorInicialDaSerie', () => {
  it('com último realizado, preenche reps e carga com o que o aluno fez', () => {
    const r = valorInicialDaSerie(
      { reps: 12, load: 40 },
      { reps: '', carga: '35' }
    );
    expect(r).toEqual({ reps: '12', carga: '40' });
  });

  it('sem último realizado, cai nos defaults da prescrição', () => {
    const r = valorInicialDaSerie(undefined, { reps: '', carga: '35' });
    expect(r).toEqual({ reps: '', carga: '35' });
  });

  it('normaliza a carga numeric descartando zeros de escala', () => {
    // `load_done` é numeric(6,2) e pode chegar como STRING em runtime; a coerção
    // é idêntica a `hidratarSerie` (String(Number(x))): "30.00" → "30", etc.
    expect(
      valorInicialDaSerie(
        { reps: 10, load: '30.00' as unknown as number },
        { reps: '', carga: '' }
      ).carga
    ).toBe('30');
    expect(
      valorInicialDaSerie(
        { reps: 10, load: '27.50' as unknown as number },
        { reps: '', carga: '' }
      ).carga
    ).toBe('27.5');
  });

  it('campos nulos do último caem no default correspondente', () => {
    // reps nulo herda o default (vazio); carga realizada ainda prevalece.
    const r = valorInicialDaSerie(
      { reps: null, load: 50 },
      { reps: '', carga: '35' }
    );
    expect(r).toEqual({ reps: '', carga: '50' });
  });
});
