import { describe, expect, it } from 'vitest';
import {
  ehOcorrencia,
  expandir,
  planejarEscopo,
  proximaOcorrencia,
  type JanelaInstantes,
} from '@/lib/agenda/recorrencia';
import { instanteDeLocal, janelaDaVisao } from '@/lib/agenda/fuso';
import type { CompromissoRow } from '@/lib/agenda/tipos';

const SP = 'America/Sao_Paulo';

function linha(p: Partial<CompromissoRow> & { id: string }): CompromissoRow {
  return {
    owner_id: 'prof',
    kind: 'in_person',
    trainer_id: 'prof',
    student_id: 'aluno',
    title: 'Aula',
    location: 'Sala 1',
    notes: null,
    starts_at: instanteDeLocal('2024-05-06', '09:00', SP).toISOString(),
    ends_at: instanteDeLocal('2024-05-06', '10:00', SP).toISOString(),
    status: 'scheduled',
    tz: SP,
    recur_freq: null,
    recur_weekdays: null,
    recur_until: null,
    series_id: null,
    original_date: null,
    ...p,
  };
}

function janela(diaInicio: string, diaFim: string, tz = SP): JanelaInstantes {
  return {
    inicio: instanteDeLocal(diaInicio, '00:00', tz),
    fim: instanteDeLocal(diaFim, '23:59', tz),
  };
}

const datas = (r: ReturnType<typeof expandir>) => r.map((o) => o.dataOriginal);

describe('expandir', () => {
  it('diária', () => {
    const m = linha({ id: 'm', recur_freq: 'daily' });
    const r = expandir(janela('2024-05-06', '2024-05-10'), [m], []);
    expect(datas(r)).toEqual(['2024-05-06', '2024-05-07', '2024-05-08', '2024-05-09', '2024-05-10']);
  });

  it('semanal seg/qua/sex a partir da primeira data', () => {
    const m = linha({ id: 'm', recur_freq: 'weekly', recur_weekdays: [1, 3, 5] });
    const r = expandir(janela('2024-05-05', '2024-05-18'), [m], []);
    expect(datas(r)).toEqual([
      '2024-05-06', '2024-05-08', '2024-05-10', '2024-05-13', '2024-05-15', '2024-05-17',
    ]);
  });

  it('não gera ocorrências antes da primeira data', () => {
    const m = linha({ id: 'm', recur_freq: 'daily' });
    expect(datas(expandir(janela('2024-05-01', '2024-05-07'), [m], []))).toEqual(['2024-05-06', '2024-05-07']);
  });

  it('mensal dia 31 pula meses curtos', () => {
    const m = linha({
      id: 'm',
      recur_freq: 'monthly',
      starts_at: instanteDeLocal('2024-01-31', '09:00', SP).toISOString(),
      ends_at: instanteDeLocal('2024-01-31', '10:00', SP).toISOString(),
    });
    const r = expandir(janela('2024-01-01', '2024-08-31'), [m], []);
    expect(datas(r)).toEqual(['2024-01-31', '2024-03-31', '2024-05-31', '2024-07-31', '2024-08-31']);
  });

  it('recur_until é inclusivo', () => {
    const m = linha({ id: 'm', recur_freq: 'daily', recur_until: '2024-05-08' });
    expect(datas(expandir(janela('2024-05-06', '2024-05-12'), [m], []))).toEqual([
      '2024-05-06', '2024-05-07', '2024-05-08',
    ]);
  });

  it('janela cortando a série e mantendo a hora de parede', () => {
    const m = linha({ id: 'm', recur_freq: 'daily' });
    const r = expandir(janela('2024-05-20', '2024-05-20'), [m], []);
    expect(r).toHaveLength(1);
    expect(r[0].inicio.toISOString()).toBe('2024-05-20T12:00:00.000Z');
    expect(r[0].fim.toISOString()).toBe('2024-05-20T13:00:00.000Z');
  });

  it('override substitui a ocorrência (horário próprio)', () => {
    const m = linha({ id: 'm', recur_freq: 'daily' });
    const o = linha({
      id: 'o',
      series_id: 'm',
      original_date: '2024-05-07',
      title: 'Aula movida',
      starts_at: instanteDeLocal('2024-05-07', '15:00', SP).toISOString(),
      ends_at: instanteDeLocal('2024-05-07', '16:00', SP).toISOString(),
    });
    const r = expandir(janela('2024-05-06', '2024-05-08'), [m], [o]);
    expect(r).toHaveLength(3);
    const movida = r.find((x) => x.dataOriginal === '2024-05-07')!;
    expect(movida.ehOverride).toBe(true);
    expect(movida.linha.title).toBe('Aula movida');
    expect(movida.inicio.toISOString()).toBe('2024-05-07T18:00:00.000Z');
  });

  it('override copiando campos do mestre (kind/owner/trainer/student/tz)', () => {
    const m = linha({ id: 'm', recur_freq: 'daily' });
    const o = linha({
      id: 'o',
      series_id: 'm',
      original_date: '2024-05-07',
      starts_at: instanteDeLocal('2024-05-07', '09:00', SP).toISOString(),
      ends_at: instanteDeLocal('2024-05-07', '10:00', SP).toISOString(),
    });
    const r = expandir(janela('2024-05-07', '2024-05-07'), [m], [o]);
    expect(r[0].linha).toMatchObject({ kind: 'in_person', owner_id: 'prof', trainer_id: 'prof', student_id: 'aluno', tz: SP });
  });

  it('override cancelado some', () => {
    const m = linha({ id: 'm', recur_freq: 'daily' });
    const o = linha({ id: 'o', series_id: 'm', original_date: '2024-05-07', status: 'canceled' });
    expect(datas(expandir(janela('2024-05-06', '2024-05-08'), [m], [o]))).toEqual(['2024-05-06', '2024-05-08']);
  });

  it('override movido para dentro da janela (original_date fora) aparece', () => {
    const m = linha({ id: 'm', recur_freq: 'daily' });
    const o = linha({
      id: 'o',
      series_id: 'm',
      original_date: '2024-05-06',
      starts_at: instanteDeLocal('2024-05-20', '09:00', SP).toISOString(),
      ends_at: instanteDeLocal('2024-05-20', '10:00', SP).toISOString(),
    });
    const r = expandir(janela('2024-05-20', '2024-05-20'), [m], [o]);
    expect(r.map((x) => x.linha.id).sort()).toEqual(['m', 'o']);
  });

  it('override movido para fora da janela some da janela original', () => {
    const m = linha({ id: 'm', recur_freq: 'daily' });
    const o = linha({
      id: 'o',
      series_id: 'm',
      original_date: '2024-05-07',
      starts_at: instanteDeLocal('2024-06-20', '09:00', SP).toISOString(),
      ends_at: instanteDeLocal('2024-06-20', '10:00', SP).toISOString(),
    });
    expect(datas(expandir(janela('2024-05-06', '2024-05-08'), [m], [o]))).toEqual(['2024-05-06', '2024-05-08']);
  });

  it('mestre cancelado ignora mestre e todos os overrides', () => {
    const m = linha({ id: 'm', recur_freq: 'daily', status: 'canceled' });
    const o = linha({ id: 'o', series_id: 'm', original_date: '2024-05-07' });
    expect(expandir(janela('2024-05-06', '2024-05-10'), [m], [o])).toEqual([]);
  });

  it('espectador em outro fuso: dataOriginal no tz da série, dia no do espectador', () => {
    // Série em SP às 22:00 → em Lisboa (UTC+1) já é o dia seguinte (02:00).
    const m = linha({
      id: 'm',
      recur_freq: 'daily',
      starts_at: instanteDeLocal('2024-05-06', '22:00', SP).toISOString(),
      ends_at: instanteDeLocal('2024-05-06', '23:00', SP).toISOString(),
    });
    const r = expandir(janela('2024-05-07', '2024-05-07'), [m], [], 'Europe/Lisbon');
    expect(r).toHaveLength(1);
    expect(r[0].dataOriginal).toBe('2024-05-07');
    expect(r[0].tzSerie).toBe(SP);
    expect(r[0].dia).toBe('2024-05-08');
  });

  it('ocorrência que atravessa DST mantém a hora de parede', () => {
    const tz = 'Europe/Lisbon';
    const m = linha({
      id: 'm',
      tz,
      recur_freq: 'daily',
      starts_at: instanteDeLocal('2024-03-29', '09:00', tz).toISOString(),
      ends_at: instanteDeLocal('2024-03-29', '10:00', tz).toISOString(),
    });
    const r = expandir(janela('2024-03-30', '2024-04-01', tz), [m], []);
    expect(r.map((o) => o.inicio.toISOString())).toEqual([
      '2024-03-30T09:00:00.000Z',
      '2024-03-31T08:00:00.000Z',
      '2024-04-01T08:00:00.000Z',
    ]);
  });
});

describe('ehOcorrencia / proximaOcorrencia', () => {
  it('semanal e mensal', () => {
    const w = linha({ id: 'w', recur_freq: 'weekly', recur_weekdays: [1] });
    expect(ehOcorrencia(w, '2024-05-13')).toBe(true);
    expect(ehOcorrencia(w, '2024-05-14')).toBe(false);
    expect(ehOcorrencia(w, '2024-04-29')).toBe(false);
    expect(proximaOcorrencia(w, '2024-05-07')).toBe('2024-05-13');
    expect(proximaOcorrencia({ ...w, recur_until: '2024-05-10' }, '2024-05-07')).toBeNull();
  });
});

describe('planejarEscopo', () => {
  const HOJE = '2024-05-10';
  const mestre = linha({
    id: 'm',
    recur_freq: 'weekly',
    recur_weekdays: [1, 3, 5],
    starts_at: instanteDeLocal('2024-05-01', '09:00', SP).toISOString(),
    ends_at: instanteDeLocal('2024-05-01', '10:00', SP).toISOString(),
  }); // primeira = 2024-05-01 (qua)
  const base = { mestre, hojeLocal: HOJE, overrides: [] as CompromissoRow[] };

  it('D passada é rejeitada em qualquer escopo', () => {
    for (const escopo of ['occurrence', 'following', 'all'] as const) {
      expect(planejarEscopo({ ...base, escopo, acao: 'cancelar', dataOcorrencia: '2024-05-08' })).toEqual({
        ok: false,
        erro: 'agenda_past',
      });
    }
  });

  it('D que não é ocorrência é rejeitada', () => {
    expect(planejarEscopo({ ...base, escopo: 'occurrence', acao: 'cancelar', dataOcorrencia: '2024-05-14' })).toEqual({
      ok: false,
      erro: 'agenda_invalid_occurrence',
    });
  });

  it('occurrence: cancelar e editar geram override', () => {
    expect(planejarEscopo({ ...base, escopo: 'occurrence', acao: 'cancelar', dataOcorrencia: '2024-05-13' })).toEqual({
      ok: true,
      alteracoes: [{ tipo: 'cancelar_ocorrencia', serieId: 'm', dataOriginal: '2024-05-13' }],
    });
    const p = planejarEscopo({
      ...base,
      escopo: 'occurrence',
      acao: 'editar',
      dataOcorrencia: '2024-05-13',
      edicao: { data: '2024-05-14', horaInicio: '11:00', horaFim: '12:00', titulo: 'Novo' },
    });
    expect(p).toMatchObject({
      ok: true,
      alteracoes: [
        {
          tipo: 'upsert_override',
          serieId: 'm',
          dataOriginal: '2024-05-13',
          campos: { dia: '2024-05-14', horaInicio: '11:00', horaFim: '12:00', titulo: 'Novo', localizacao: 'Sala 1' },
        },
      ],
    });
  });

  it('following editar: encerra mestre em D−1, cria novo e reaponta overrides futuros (passado intacto)', () => {
    const futuro = linha({ id: 'o1', series_id: 'm', original_date: '2024-05-15' });
    const passado = linha({ id: 'o0', series_id: 'm', original_date: '2024-05-08' });
    const p = planejarEscopo({
      ...base,
      overrides: [passado, futuro],
      escopo: 'following',
      acao: 'editar',
      dataOcorrencia: '2024-05-13',
      edicao: { horaInicio: '18:00', horaFim: '19:00' },
    });
    expect(p).toMatchObject({ ok: true });
    if (!p.ok) return;
    expect(p.alteracoes[0]).toEqual({ tipo: 'encerrar_mestre', id: 'm', recurUntil: '2024-05-12' });
    expect(p.alteracoes[1]).toMatchObject({
      tipo: 'criar_mestre',
      campos: { dia: '2024-05-13', horaInicio: '18:00', horaFim: '19:00' },
    });
    expect(p.alteracoes[2]).toEqual({ tipo: 'reapontar_overrides', ids: ['o1'], deId: 'm' });
  });

  it('following em D = primeira data (sem passado): atualiza no lugar', () => {
    const futuroM = { ...mestre, starts_at: instanteDeLocal('2024-05-13', '09:00', SP).toISOString(), ends_at: instanteDeLocal('2024-05-13', '10:00', SP).toISOString() };
    const p = planejarEscopo({
      ...base,
      mestre: futuroM,
      escopo: 'following',
      acao: 'editar',
      dataOcorrencia: '2024-05-13',
      edicao: { titulo: 'X' },
    });
    expect(p).toMatchObject({ ok: true, alteracoes: [{ tipo: 'atualizar_mestre', id: 'm' }] });
  });

  it('following cancelar: encerra em D−1 e cancela overrides futuros', () => {
    const futuro = linha({ id: 'o1', series_id: 'm', original_date: '2024-05-15' });
    const p = planejarEscopo({
      ...base,
      overrides: [futuro],
      escopo: 'following',
      acao: 'cancelar',
      dataOcorrencia: '2024-05-13',
    });
    expect(p).toEqual({
      ok: true,
      alteracoes: [
        { tipo: 'encerrar_mestre', id: 'm', recurUntil: '2024-05-12' },
        { tipo: 'cancelar_overrides', ids: ['o1'] },
      ],
    });
  });

  it('all: parte da primeira ocorrência futura; passado nunca muda', () => {
    const p = planejarEscopo({
      ...base,
      escopo: 'all',
      acao: 'editar',
      dataOcorrencia: '2024-05-15',
      edicao: { horaInicio: '07:00', horaFim: '08:00' },
    });
    expect(p).toMatchObject({ ok: true });
    if (!p.ok) return;
    // hoje = 2024-05-10 (sex) é ocorrência → recomeça em hoje.
    expect(p.alteracoes[0]).toEqual({ tipo: 'encerrar_mestre', id: 'm', recurUntil: '2024-05-09' });
    expect(p.alteracoes[1]).toMatchObject({ tipo: 'criar_mestre', campos: { dia: '2024-05-10', horaInicio: '07:00' } });
  });

  it('all cancelar: encerra em hoje−1; sem passado cancela o mestre', () => {
    const p = planejarEscopo({ ...base, escopo: 'all', acao: 'cancelar', dataOcorrencia: '2024-05-13' });
    expect(p).toEqual({ ok: true, alteracoes: [{ tipo: 'encerrar_mestre', id: 'm', recurUntil: '2024-05-09' }] });
    const semPassado = { ...mestre, starts_at: instanteDeLocal('2024-05-13', '09:00', SP).toISOString(), ends_at: instanteDeLocal('2024-05-13', '10:00', SP).toISOString() };
    expect(
      planejarEscopo({ ...base, mestre: semPassado, escopo: 'all', acao: 'cancelar', dataOcorrencia: '2024-05-13' })
    ).toEqual({ ok: true, alteracoes: [{ tipo: 'cancelar_mestre', id: 'm' }] });
  });

  describe('M2: following/all mudam só hora de parede e texto', () => {
    it('data diferente de D é rejeitada', () => {
      for (const escopo of ['following', 'all'] as const) {
        expect(
          planejarEscopo({ ...base, escopo, acao: 'editar', dataOcorrencia: '2024-05-13', edicao: { data: '2024-05-14' } })
        ).toEqual({ ok: false, erro: 'agenda_invalid_range' });
      }
    });

    it('data igual a D é aceita', () => {
      const p = planejarEscopo({ ...base, escopo: 'following', acao: 'editar', dataOcorrencia: '2024-05-13', edicao: { data: '2024-05-13', titulo: 'Y' } });
      expect(p.ok).toBe(true);
    });

    it('alterar recorrência exige o weekday de D em recur_weekdays', () => {
      const ruim = planejarEscopo({
        ...base,
        escopo: 'following',
        acao: 'editar',
        dataOcorrencia: '2024-05-13', // segunda
        edicao: { recorrencia: { freq: 'weekly', weekdays: [2, 4], until: null } },
      });
      expect(ruim).toEqual({ ok: false, erro: 'agenda_invalid_range' });
      const bom = planejarEscopo({
        ...base,
        escopo: 'following',
        acao: 'editar',
        dataOcorrencia: '2024-05-13',
        edicao: { recorrencia: { freq: 'weekly', weekdays: [1, 2], until: null } },
      });
      expect(bom.ok).toBe(true);
    });

    it('occurrence não aceita mudar a regra', () => {
      expect(
        planejarEscopo({
          ...base,
          escopo: 'occurrence',
          acao: 'editar',
          dataOcorrencia: '2024-05-13',
          edicao: { recorrencia: { freq: 'daily', weekdays: null, until: null } },
        })
      ).toEqual({ ok: false, erro: 'agenda_invalid_range' });
    });
  });

  it('avulso: qualquer escopo atualiza/cancela a linha', () => {
    const avulso = linha({ id: 'a' });
    expect(planejarEscopo({ mestre: avulso, hojeLocal: '2024-05-01', overrides: [], escopo: 'all', acao: 'cancelar', dataOcorrencia: '2024-05-06' })).toEqual({
      ok: true,
      alteracoes: [{ tipo: 'cancelar_avulso', id: 'a' }],
    });
  });
});

describe('janelaDaVisao + expandir (integração)', () => {
  it('semana domingo–sábado', () => {
    const m = linha({ id: 'm', recur_freq: 'daily' });
    const j = janelaDaVisao('semana', '2024-05-15', SP);
    expect(expandir(j, [m], [])).toHaveLength(7);
  });
});
