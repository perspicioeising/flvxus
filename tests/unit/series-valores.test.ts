import { describe, expect, it } from 'vitest';

import {
  valoresDaSerie,
  type ItemDefaults,
  type SerieValores,
} from '@/lib/treino/series';

const DEFAULTS: ItemDefaults = {
  reps: '10-12',
  restSeconds: 60,
  cargaAlvo: 40,
};

describe('valoresDaSerie', () => {
  it('a série com valores próprios vence os defaults do item', () => {
    const series: SerieValores[] = [
      {
        setNumber: 1,
        kind: 'warmup',
        note: 'leve',
        targetReps: '15',
        restSeconds: 30,
        targetLoad: 20,
      },
    ];

    expect(valoresDaSerie(series, 1, DEFAULTS)).toEqual({
      kind: 'warmup',
      note: 'leve',
      reps: '15',
      restSeconds: 30,
      cargaAlvo: 20,
    });
  });

  it('sem séries (undefined) cai inteiramente nos defaults do item', () => {
    expect(valoresDaSerie(undefined, 1, DEFAULTS)).toEqual({
      kind: 'work',
      note: null,
      reps: '10-12',
      restSeconds: 60,
      cargaAlvo: 40,
    });
  });

  it('série presente com coluna NULL e item também NULL resulta em NULL', () => {
    const series: SerieValores[] = [
      {
        setNumber: 1,
        kind: 'work',
        note: null,
        targetReps: null,
        restSeconds: null,
        targetLoad: null,
      },
    ];
    const defaultsNulos: ItemDefaults = {
      reps: null,
      restSeconds: null,
      cargaAlvo: null,
    };

    expect(valoresDaSerie(series, 1, defaultsNulos)).toEqual({
      kind: 'work',
      note: null,
      reps: null,
      restSeconds: null,
      cargaAlvo: null,
    });
  });

  it('kind/note caem em work/null quando não há série para o setNumber', () => {
    const series: SerieValores[] = [
      {
        setNumber: 1,
        kind: 'dropset',
        note: 'até a falha',
        targetReps: '8',
        restSeconds: 90,
        targetLoad: 50,
      },
    ];

    // setNumber 2 não está na lista -> fallback de kind/note e herda defaults.
    expect(valoresDaSerie(series, 2, DEFAULTS)).toEqual({
      kind: 'work',
      note: null,
      reps: '10-12',
      restSeconds: 60,
      cargaAlvo: 40,
    });
  });
});
