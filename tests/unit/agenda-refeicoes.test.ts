import { describe, expect, it } from 'vitest';
import { analisarHorario, projetarRefeicoes, type DietaVigenteAgenda } from '@/lib/agenda/refeicoes';

const SP = 'America/Sao_Paulo';

describe('analisarHorario', () => {
  it('aceita H:mm, HH:mm e HH:mm:ss', () => {
    expect(analisarHorario('8:30')).toBe('08:30');
    expect(analisarHorario('08:30')).toBe('08:30');
    expect(analisarHorario('23:59:59')).toBe('23:59');
    expect(analisarHorario('00:00')).toBe('00:00');
  });

  it('inválido, vazio ou nulo ⇒ null ("Sem horário")', () => {
    for (const v of ['', '  ', '24:00', '12:60', 'abc', '8h30', '12', null, undefined]) {
      expect(analisarHorario(v as string | null)).toBeNull();
    }
  });
});

const dieta: DietaVigenteAgenda = {
  id: 'd1',
  releasedAt: '2024-05-14T13:00:00Z', // dia local 2024-05-14
  meals: [
    { id: 'm2', name: 'Almoço', time: '12:30:00', order_index: 1 },
    { id: 'm1', name: 'Café', time: '08:00', order_index: 0 },
    { id: 'm3', name: 'Lanche', time: null, order_index: 2 },
  ],
};

const base = {
  dieta,
  cumprimentos: [],
  diaInicio: '2024-05-13',
  diaFim: '2024-05-16',
  hoje: '2024-05-15',
  tz: SP,
  agora: new Date('2024-05-15T15:00:00Z'),
};

describe('projetarRefeicoes', () => {
  it('sem dieta vigente ⇒ vazio', () => {
    expect(projetarRefeicoes({ ...base, dieta: null })).toEqual([]);
  });

  it('não projeta dias antes de released_at; ordena por order_index', () => {
    const e = projetarRefeicoes(base);
    expect(e.some((x) => x.dia === '2024-05-13')).toBe(false);
    expect(e.filter((x) => x.dia === '2024-05-14').map((x) => x.titulo)).toEqual(['Café', 'Almoço', 'Lanche']);
  });

  it('horário vira instante no fuso local; sem horário ⇒ inicio null', () => {
    const e = projetarRefeicoes(base).filter((x) => x.dia === '2024-05-15');
    expect(e[0].inicio).toBe('2024-05-15T11:00:00.000Z');
    expect(e[1].inicio).toBe('2024-05-15T15:30:00.000Z');
    expect(e[2].inicio).toBeNull();
    expect(e[2].meta.semHorario).toBe(true);
  });

  it('status: concluído por completions (dia-SP), passado pendente, futuro previsto', () => {
    const e = projetarRefeicoes({
      ...base,
      cumprimentos: [
        { diet_id: 'd1', meal_id: 'm1', occurred_on: '2024-05-15' },
        { diet_id: 'outra', meal_id: 'm2', occurred_on: '2024-05-15' },
      ],
    });
    const st = (dia: string, titulo: string) => e.find((x) => x.dia === dia && x.titulo === titulo)?.status;
    expect(st('2024-05-15', 'Café')).toBe('concluido');
    expect(st('2024-05-15', 'Almoço')).toBe('pendente'); // dieta diferente não conta
    expect(st('2024-05-14', 'Café')).toBe('pendente');
    expect(st('2024-05-16', 'Café')).toBe('previsto');
  });

  it('"Concluir" só no dia atual', () => {
    const e = projetarRefeicoes(base);
    expect(e.find((x) => x.dia === '2024-05-15' && x.titulo === 'Café')?.acao).toEqual({
      tipo: 'concluir_refeicao',
      mealId: 'm1',
      dietId: 'd1',
    });
    expect(e.find((x) => x.dia === '2024-05-16' && x.titulo === 'Café')?.acao).toBeNull();
    expect(e.find((x) => x.dia === '2024-05-14' && x.titulo === 'Café')?.acao).toBeNull();
  });

  it('sem "Concluir" quando o dia-SP do evento difere do dia-SP de agora', () => {
    // Usuário em Tóquio: dia local 15, mas agora ainda é dia 14 em SP.
    const e = projetarRefeicoes({
      ...base,
      tz: 'Asia/Tokyo',
      hoje: '2024-05-15',
      diaInicio: '2024-05-15',
      diaFim: '2024-05-15',
      agora: new Date('2024-05-15T00:00:00Z'), // 09:00 em Tóquio, 21:00 do dia 14 em SP
      dieta: { ...dieta, releasedAt: '2024-05-10T00:00:00Z' },
    });
    expect(e.find((x) => x.titulo === 'Almoço')?.acao).toBeNull();
  });
});
