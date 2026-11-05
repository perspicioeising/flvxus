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

  it('descanso da série preenchido vence com o geral em branco (bug relatado)', () => {
    // Config geral sem descanso/reps/carga; a série individual os informa.
    // A execução deve disparar o timer/modal de descanso pela série (90s),
    // não ignorá-lo por falta do geral.
    const defaultsVazios: ItemDefaults = { reps: null, restSeconds: null, cargaAlvo: null };
    const series: SerieValores[] = [
      {
        setNumber: 1,
        kind: 'work',
        note: null,
        targetReps: null,
        restSeconds: 90,
        targetLoad: null,
      },
    ];
    expect(valoresDaSerie(series, 1, defaultsVazios).restSeconds).toBe(90);
  });

  it('reps da série preenchidas vencem com o geral em branco (sugestão de série)', () => {
    const defaultsVazios: ItemDefaults = { reps: null, restSeconds: null, cargaAlvo: null };
    const series: SerieValores[] = [
      {
        setNumber: 1,
        kind: 'work',
        note: null,
        targetReps: '12',
        restSeconds: null,
        targetLoad: null,
      },
    ];
    expect(valoresDaSerie(series, 1, defaultsVazios).reps).toBe('12');
  });

  it('carga da série preenchida vence com o geral em branco', () => {
    const defaultsVazios: ItemDefaults = { reps: null, restSeconds: null, cargaAlvo: null };
    const series: SerieValores[] = [
      {
        setNumber: 1,
        kind: 'work',
        note: null,
        targetReps: null,
        restSeconds: null,
        targetLoad: 30,
      },
    ];
    expect(valoresDaSerie(series, 1, defaultsVazios).cargaAlvo).toBe(30);
  });

  it('campo NULL na série herda do geral nos três campos (reps/descanso/carga)', () => {
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
    const resolvido = valoresDaSerie(series, 1, DEFAULTS);
    expect(resolvido.reps).toBe('10-12');
    expect(resolvido.restSeconds).toBe(60);
    expect(resolvido.cargaAlvo).toBe(40);
  });

  it('valor 0 na série é explícito e NÃO herda o geral (caso raro)', () => {
    // Semântica: só NULL herda; 0 preenchido é respeitado. Trocar ?? por ||
    // quebraria este caso — o teste trava a regressão.
    const series: SerieValores[] = [
      {
        setNumber: 1,
        kind: 'work',
        note: null,
        targetReps: null,
        restSeconds: 0,
        targetLoad: 0,
      },
    ];
    const resolvido = valoresDaSerie(series, 1, DEFAULTS);
    expect(resolvido.restSeconds).toBe(0);
    expect(resolvido.cargaAlvo).toBe(0);
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
