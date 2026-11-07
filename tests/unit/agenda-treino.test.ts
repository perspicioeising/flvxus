import { describe, expect, it } from 'vitest';
import { diasDaFicha, projetarTreinos, type EntradaTreinoAgenda } from '@/lib/agenda/treino';
import { proximoTreinoDaFicha, type FichaInicio, type PassoRotacao } from '@/lib/treino/inicio';

const SP = 'America/Sao_Paulo';

function item(id: string, o: { division?: string | null; weekday?: number | null; order?: number } = {}) {
  return {
    id,
    division: o.division ?? null,
    weekday: o.weekday ?? null,
    order_index: o.order ?? 0,
    sets: 3,
    reps: '10',
    exercises: { name: `Ex ${id}`, muscle_groups: ['peito'] },
  };
}

function ficha(id: string, itens: ReturnType<typeof item>[], steps?: PassoRotacao[]): FichaInicio {
  return { id, name: `Ficha ${id}`, workout_plan_items: itens, rotation_steps: steps ?? null };
}

// Semana 2024-05-12 (dom) … 2024-05-18 (sáb). 13 = seg, 15 = qua, 17 = sex.
function entrada(p: Partial<EntradaTreinoAgenda> & { fichas: FichaInicio[] }): EntradaTreinoAgenda {
  return {
    sessoes: [],
    estados: {},
    diaInicio: '2024-05-12',
    diaFim: '2024-05-18',
    hoje: '2024-05-13',
    tz: SP,
    agora: new Date('2024-05-13T15:00:00Z'),
    ...p,
  };
}

const resumo = (e: ReturnType<typeof projetarTreinos>['eventos']) =>
  e.map((x) => `${x.dia}:${x.titulo}:${x.status}`);

describe('diasDaFicha', () => {
  it('união dos weekday não nulos (item sem dia é ignorado)', () => {
    const f = ficha('f', [item('1', { weekday: 1 }), item('2', { weekday: 1 }), item('3', { weekday: 4 }), item('4')]);
    expect([...diasDaFicha(f)].sort()).toEqual([1, 4]);
  });
});

describe('ficha por dia (sem divisão)', () => {
  const f = ficha('f', [item('a', { weekday: 1 }), item('b', { weekday: 3 }), item('c')]);

  it('projeta no weekday local; hoje pendente com link ?dia=', () => {
    const { eventos } = projetarTreinos(entrada({ fichas: [f] }));
    expect(resumo(eventos)).toEqual([
      '2024-05-13:Treino:pendente',
      '2024-05-15:Treino:previsto',
    ]);
    expect(eventos[0].acao).toEqual({ tipo: 'link', href: '/aluno/execucao/f?dia=1', rotulo: 'Treinar' });
    expect(eventos[1].acao).toBeNull();
  });

  it('usa o weekday LOCAL do espectador, não o do servidor (usuário SP às 22h, servidor em UTC)', () => {
    // 2024-05-15 22:00 em SP = 2024-05-16 01:00Z (quinta no servidor UTC).
    const agora = new Date('2024-05-16T01:00:00Z');
    expect(agora.getUTCDay()).toBe(4);
    const { eventos } = projetarTreinos(entrada({ fichas: [f], hoje: '2024-05-15', agora }));
    const hoje = eventos.find((e) => e.dia === '2024-05-15');
    expect(hoje).toMatchObject({ titulo: 'Treino', status: 'pendente' });
    expect(hoje?.acao).toEqual({ tipo: 'link', href: '/aluno/execucao/f?dia=3', rotulo: 'Treinar' });
    expect(eventos.some((e) => e.dia === '2024-05-16')).toBe(false);
  });

  it('passado só aparece concluído (finished_at no dia local)', () => {
    // 2024-05-14 02:00Z = 2024-05-13 23:00 em SP → dia local 13.
    const { eventos } = projetarTreinos(
      entrada({
        fichas: [f],
        hoje: '2024-05-15',
        agora: new Date('2024-05-15T15:00:00Z'),
        sessoes: [{ id: 's1', planId: 'f', division: null, finishedAt: '2024-05-14T02:00:00Z' }],
      })
    );
    expect(resumo(eventos)).toEqual(['2024-05-13:Treino:concluido', '2024-05-15:Treino:pendente']);
  });

  it('hoje concluído substitui o pendente', () => {
    const { eventos } = projetarTreinos(
      entrada({ fichas: [f], sessoes: [{ id: 's1', planId: 'f', division: null, finishedAt: '2024-05-13T14:00:00Z' }] })
    );
    expect(resumo(eventos)).toEqual(['2024-05-13:Treino:concluido', '2024-05-15:Treino:previsto']);
  });
});

describe('ficha sem dia', () => {
  it('fica fora da agenda e entra na lista de aviso', () => {
    const semDia = ficha('sd', [item('a', { division: 'A' }), item('b', { division: 'B' })]);
    const out = projetarTreinos(entrada({ fichas: [semDia] }));
    expect(out.eventos).toEqual([]);
    expect(out.fichasSemDia).toEqual([{ id: 'sd', name: 'Ficha sd' }]);
  });
});

describe('ficha com divisão (rotação derivada)', () => {
  const f = ficha('f', [
    item('a', { division: 'A', weekday: 1 }),
    item('b', { division: 'B', weekday: 3 }),
    item('c', { division: 'C', weekday: 5 }),
  ]);

  it('hoje = proximoTreinoDaFicha; futuros em cadeia (previsto)', () => {
    const { eventos } = projetarTreinos(entrada({ fichas: [f], diaFim: '2024-05-25' }));
    expect(resumo(eventos)).toEqual([
      '2024-05-13:Treino A:pendente',
      '2024-05-15:Treino B:previsto',
      '2024-05-17:Treino C:previsto',
      '2024-05-20:Treino A:previsto',
      '2024-05-22:Treino B:previsto',
      '2024-05-24:Treino C:previsto',
    ]);
    const esperado = proximoTreinoDaFicha(f, new Date('2024-05-13T15:00:00Z'), undefined);
    expect(eventos[0].acao).toEqual({ tipo: 'link', href: esperado!.href, rotulo: 'Treinar' });
    expect(eventos[1].acao).toBeNull();
  });

  it('o dia marcado não decide a divisão (a rotação decide)', () => {
    // Última concluída = A → mesmo com hoje (seg) marcado, hoje mostra B.
    const { eventos } = projetarTreinos(entrada({ fichas: [f], estados: { f: { ultimaConcluida: 'A' } } }));
    expect(eventos[0]).toMatchObject({ dia: '2024-05-13', titulo: 'Treino B', status: 'pendente' });
  });

  it('recalcula após sessão concluída: hoje concluído e cursor avança', () => {
    const { eventos } = projetarTreinos(
      entrada({
        fichas: [f],
        sessoes: [{ id: 's1', planId: 'f', division: 'A', finishedAt: '2024-05-13T14:00:00Z' }],
        estados: { f: { ultimaConcluida: 'A' } },
      })
    );
    expect(resumo(eventos)).toEqual([
      '2024-05-13:Treino A:concluido',
      '2024-05-15:Treino B:previsto',
      '2024-05-17:Treino C:previsto',
    ]);
  });

  it('janela futura: a cadeia avança desde hoje', () => {
    const { eventos } = projetarTreinos(
      entrada({ fichas: [f], diaInicio: '2024-05-19', diaFim: '2024-05-25' })
    );
    // hoje (A) e 15 (B) e 17 (C) são consumidos antes da janela → 20 = A.
    expect(resumo(eventos)).toEqual([
      '2024-05-20:Treino A:previsto',
      '2024-05-22:Treino B:previsto',
      '2024-05-24:Treino C:previsto',
    ]);
  });

  it('mesma divisão em dias distintos continua marcando ambos os dias', () => {
    const g = ficha('g', [item('a', { division: 'A', weekday: 1 }), item('a2', { division: 'A', weekday: 4 })]);
    const { eventos } = projetarTreinos(entrada({ fichas: [g] }));
    expect(resumo(eventos)).toEqual(['2024-05-13:Treino A:pendente', '2024-05-16:Treino A:previsto']);
  });
});

describe('ficha com rotation_steps', () => {
  const steps: PassoRotacao[] = [{ type: 'division', label: 'A' }, { type: 'rest' }, { type: 'division', label: 'B' }];
  const f = ficha('f', [item('a', { division: 'A', weekday: 1 }), item('b', { division: 'B', weekday: 3 })], steps);

  it('inclui descanso na cadeia; hoje A com ação de treino', () => {
    const { eventos } = projetarTreinos(entrada({ fichas: [f] }));
    expect(resumo(eventos)).toEqual(['2024-05-13:Treino A:pendente', '2024-05-15:Descanso:previsto']);
  });

  it('hoje descanso: ação confirmar_descanso com o índice do passo', () => {
    const { eventos } = projetarTreinos(
      entrada({
        fichas: [f],
        estados: {
          f: { ultimoEvento: { ultimaDivisao: { label: 'A', finishedAt: '2024-05-12T12:00:00Z' } } },
        },
      })
    );
    expect(eventos[0]).toMatchObject({ titulo: 'Descanso', status: 'pendente' });
    expect(eventos[0].acao).toEqual({ tipo: 'confirmar_descanso', planId: 'f', restStepIndex: 1 });
    expect(eventos[1]).toMatchObject({ dia: '2024-05-15', titulo: 'Treino B', status: 'previsto' });
  });

  it('descanso cumprido hoje aparece concluído e a cadeia segue', () => {
    const { eventos } = projetarTreinos(
      entrada({
        fichas: [f],
        estados: { f: { ultimoEvento: { ultimoDescanso: { restStepIndex: 1, completedAt: '2024-05-13T12:00:00Z' } } } },
      })
    );
    expect(resumo(eventos)).toEqual(['2024-05-13:Descanso:concluido', '2024-05-15:Treino B:previsto']);
  });
});

describe('várias fichas', () => {
  it('um evento por ficha elegível no dia', () => {
    const f1 = ficha('f1', [item('a', { weekday: 1 })]);
    const f2 = ficha('f2', [item('b', { weekday: 1 })]);
    const { eventos } = projetarTreinos(entrada({ fichas: [f1, f2] }));
    expect(eventos.filter((e) => e.dia === '2024-05-13').map((e) => e.meta.planId)).toEqual(['f1', 'f2']);
    expect(new Set(eventos.map((e) => e.chave)).size).toBe(eventos.length);
  });
});
