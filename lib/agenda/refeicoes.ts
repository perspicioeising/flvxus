/**
 * Projeção de refeições na Agenda — funções PURAS (sem I/O). Design: §8.2.
 * A dieta liberada vigente é projetada TODOS os dias a partir do dia local de
 * `released_at`. Status por `diet_meal_completions` (`occurred_on` = dia-SP).
 */

import { diaSP } from '@/lib/arena/datas';
import { diaLocal, diasDoIntervalo, instanteDeLocal } from '@/lib/agenda/fuso';
import type { EventoAgenda } from '@/lib/agenda/tipos';

const HORARIO = /^(\d{1,2}):([0-5]\d)(?::([0-5]\d))?$/;

/**
 * Interpreta `diet_meals.time` (`H:mm`, `HH:mm` ou `HH:mm:ss`, 00–23/00–59).
 * Devolve `HH:mm` ou `null` ("Sem horário": vazio ou fora do padrão).
 */
export function analisarHorario(time: string | null | undefined): string | null {
  if (typeof time !== 'string') return null;
  const m = HORARIO.exec(time.trim());
  if (!m) return null;
  const hora = Number(m[1]);
  if (hora > 23) return null;
  return `${String(hora).padStart(2, '0')}:${m[2]}`;
}

export interface RefeicaoAgenda {
  id: string;
  name: string;
  time: string | null;
  order_index: number;
}

export interface DietaVigenteAgenda {
  id: string;
  /** ISO de `released_at`. */
  releasedAt: string;
  meals: RefeicaoAgenda[];
}

export interface CumprimentoRefeicao {
  diet_id: string;
  meal_id: string;
  /** Dia-SP cru `YYYY-MM-DD`. */
  occurred_on: string;
}

export interface EntradaRefeicoesAgenda {
  dieta: DietaVigenteAgenda | null;
  cumprimentos: CumprimentoRefeicao[];
  diaInicio: string;
  diaFim: string;
  hoje: string;
  tz: string;
  agora: Date;
}

/** Projeta as refeições da dieta vigente na janela local (inclusiva). */
export function projetarRefeicoes(entrada: EntradaRefeicoesAgenda): EventoAgenda[] {
  const { dieta, cumprimentos, diaInicio, diaFim, hoje, tz, agora } = entrada;
  if (!dieta) return [];
  const primeiroDia = diaLocal(dieta.releasedAt, tz);
  const feitos = new Set(
    cumprimentos.filter((c) => c.diet_id === dieta.id).map((c) => `${c.meal_id}|${c.occurred_on}`)
  );
  const refeicoes = [...dieta.meals].sort((a, b) => a.order_index - b.order_index);
  const diaSPAgora = diaSP(agora);
  const eventos: EventoAgenda[] = [];

  for (const dia of diasDoIntervalo(diaInicio < primeiroDia ? primeiroDia : diaInicio, diaFim)) {
    for (const meal of refeicoes) {
      const hora = analisarHorario(meal.time);
      const instante = hora ? instanteDeLocal(dia, hora, tz) : null;
      const referencia = instante ?? instanteDeLocal(dia, '12:00', tz);
      const diaDoEvento = diaSP(referencia);
      const concluida = diaDoEvento !== null && feitos.has(`${meal.id}|${diaDoEvento}`);
      const status: EventoAgenda['status'] = concluida
        ? 'concluido'
        : dia > hoje
          ? 'previsto'
          : 'pendente';
      eventos.push({
        chave: `refeicao:${meal.id}:${dia}`,
        origem: 'refeicao',
        titulo: meal.name,
        dia,
        inicio: instante ? instante.toISOString() : null,
        fim: null,
        status,
        // A action grava no dia-SP de "agora": só habilita quando coincide.
        acao:
          dia === hoje && diaDoEvento !== null && diaDoEvento === diaSPAgora
            ? { tipo: 'concluir_refeicao', mealId: meal.id, dietId: dieta.id }
            : null,
        meta: { mealId: meal.id, dietId: dieta.id, semHorario: hora === null },
      });
    }
  }
  return eventos;
}
