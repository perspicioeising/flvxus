/**
 * Projeção de treinos na Agenda — função PURA (sem I/O). Design: §8.1.
 *
 * - Dias da ficha = união dos `weekday` não nulos dos itens (item sem dia não
 *   marca dia nenhum; `weekday` continua sem efeito na execução).
 * - Ficha SEM divisão: itens cujo `weekday === weekdayDeDia(dia local)`. Este
 *   ramo NÃO chama `proximoTreinoDaFicha` (o ramo legado dele usa o `getDay()`
 *   do servidor e deslocaria o dia à noite).
 * - Ficha COM divisão/rotação: hoje = `proximoTreinoDaFicha` (igual ao cartão
 *   do início); dias futuros = cadeia prevista a partir do estado atual.
 * - Passado: só treinos concluídos (sessão finalizada no dia LOCAL).
 */

import {
  diaLocal,
  diasDoIntervalo,
  weekdayDeDia,
} from '@/lib/agenda/fuso';
import type { EventoAgenda } from '@/lib/agenda/tipos';
import {
  proximoPassoNaRotacao,
  proximoTreinoDaFicha,
  resolverUltimoPasso,
  type FichaInicio,
  type PassoRotacao,
  type ProximoTreino,
  type UltimoEventoRotacao,
} from '@/lib/treino/inicio';

/** Sessão finalizada de uma ficha. */
export interface SessaoConcluidaAgenda {
  id: string;
  planId: string;
  /** Divisão da sessão (`null` = sem divisão). */
  division: string | null;
  /** ISO de `finished_at`. */
  finishedAt: string;
}

/** Estado de rotação lido pela carga (mesmas entradas do `aluno/page.tsx`). */
export interface EstadoRotacaoFicha {
  /** `undefined` = sem histórico; `null` = balde sem divisão; `'A'`… = rótulo. */
  ultimaConcluida?: string | null;
  ultimoEvento?: UltimoEventoRotacao;
}

export interface EntradaTreinoAgenda {
  fichas: FichaInicio[];
  sessoes: SessaoConcluidaAgenda[];
  /** Estado por `ficha.id`. */
  estados: Record<string, EstadoRotacaoFicha | undefined>;
  /** Janela local (inclusiva), `YYYY-MM-DD`. */
  diaInicio: string;
  diaFim: string;
  /** Hoje no fuso do espectador. */
  hoje: string;
  tz: string;
  /** Instante atual (só repassado a `proximoTreinoDaFicha`). */
  agora: Date;
}

export interface SaidaTreinoAgenda {
  eventos: EventoAgenda[];
  /** Fichas liberadas sem nenhum dia marcado (fora da agenda; a página avisa). */
  fichasSemDia: { id: string; name: string }[];
}

const EPOCH = '1970-01-01T00:00:00.000Z';

/** Dias da semana marcados na ficha (união dos `weekday` não nulos). */
export function diasDaFicha(ficha: FichaInicio): Set<number> {
  const dias = new Set<number>();
  for (const item of ficha.workout_plan_items ?? []) {
    if (item.weekday !== null && item.weekday !== undefined) dias.add(item.weekday);
  }
  return dias;
}

function temDivisao(ficha: FichaInicio): boolean {
  return (ficha.workout_plan_items ?? []).some((i) => (i.division ?? null) !== null);
}

function tituloTreino(label: string | null): string {
  return label ? `Treino ${label}` : 'Treino';
}

function eventoDeProximo(
  ficha: FichaInicio,
  pt: ProximoTreino,
  dia: string,
  status: EventoAgenda['status'],
  comAcao: boolean
): EventoAgenda {
  if (pt.descanso) {
    return {
      chave: `treino:${ficha.id}:${dia}`,
      origem: 'treino',
      titulo: 'Descanso',
      dia,
      inicio: null,
      fim: null,
      status,
      acao:
        comAcao && pt.restStepIndex !== null
          ? { tipo: 'confirmar_descanso', planId: ficha.id, restStepIndex: pt.restStepIndex }
          : null,
      meta: { planId: ficha.id, fichaNome: ficha.name, descanso: true, divisao: null },
    };
  }
  return {
    chave: `treino:${ficha.id}:${dia}`,
    origem: 'treino',
    titulo: tituloTreino(pt.divisionLabel),
    dia,
    inicio: null,
    fim: null,
    status,
    acao: comAcao ? { tipo: 'link', href: pt.href, rotulo: 'Treinar' } : null,
    meta: {
      planId: ficha.id,
      fichaNome: ficha.name,
      divisao: pt.divisionLabel,
      grupos: pt.grupos,
      exercicios: pt.exercicios.length,
      prevista: status === 'previsto',
    },
  };
}

function eventoConcluido(ficha: FichaInicio, sessao: SessaoConcluidaAgenda, dia: string, n: number): EventoAgenda {
  return {
    chave: `treino:${ficha.id}:${dia}:${n}`,
    origem: 'treino',
    titulo: tituloTreino(sessao.division),
    dia,
    inicio: null,
    fim: null,
    status: 'concluido',
    acao: null,
    meta: { planId: ficha.id, fichaNome: ficha.name, divisao: sessao.division, sessionId: sessao.id },
  };
}

/** Evento sintético "passo concluído" para reproduzir o display de um passo futuro. */
function eventoDoPasso(steps: PassoRotacao[], idx: number | null): UltimoEventoRotacao | undefined {
  if (idx === null) return undefined;
  const passo = steps[idx];
  if (!passo) return undefined;
  return passo.type === 'division'
    ? { ultimaDivisao: { label: passo.label, finishedAt: EPOCH } }
    : { ultimoDescanso: { restStepIndex: idx, completedAt: EPOCH } };
}

/** Cursor da cadeia prevista: devolve o próximo treino e avança o estado. */
interface Cursor {
  proximo(): ProximoTreino | null;
}

function criarCursor(ficha: FichaInicio, estado: EstadoRotacaoFicha, agora: Date): Cursor {
  const steps = ficha.rotation_steps;
  if (steps && steps.length > 0) {
    // Rotação explícita: índice do último passo concluído + cadeia por índice.
    let ultimo = resolverUltimoPasso(steps, estado.ultimoEvento);
    return {
      proximo() {
        const prox = proximoPassoNaRotacao(steps, ultimo);
        if (!prox) return null;
        const pt = proximoTreinoDaFicha(ficha, agora, undefined, {
          ...(eventoDoPasso(steps, ultimo) ?? {}),
        });
        ultimo = prox.index;
        return pt;
      },
    };
  }
  // Rotação derivada pelos rótulos das divisões.
  let ultima: string | null | undefined = estado.ultimaConcluida;
  return {
    proximo() {
      const pt = proximoTreinoDaFicha(ficha, agora, ultima);
      if (pt) ultima = pt.divisionLabel;
      return pt;
    },
  };
}

/** Projeta os treinos de todas as fichas na janela local. */
export function projetarTreinos(entrada: EntradaTreinoAgenda): SaidaTreinoAgenda {
  const { fichas, sessoes, estados, diaInicio, diaFim, hoje, tz, agora } = entrada;
  const eventos: EventoAgenda[] = [];
  const fichasSemDia: { id: string; name: string }[] = [];
  // Itera desde hoje (se a janela é futura) para a cadeia prevista avançar corretamente.
  const dias = diasDoIntervalo(hoje < diaInicio ? hoje : diaInicio, diaFim);

  for (const ficha of fichas) {
    const marcados = diasDaFicha(ficha);
    if (marcados.size === 0) {
      fichasSemDia.push({ id: ficha.id, name: ficha.name });
      continue;
    }

    const sessoesFicha = sessoes
      .filter((s) => s.planId === ficha.id)
      .map((s) => ({ s, dia: diaLocal(s.finishedAt, tz) }));
    const sessoesNoDia = (dia: string) => sessoesFicha.filter((x) => x.dia === dia).map((x) => x.s);
    const estado = estados[ficha.id] ?? {};
    const comDivisao = temDivisao(ficha);

    // Descanso cumprido hoje (rotação explícita) conta como "hoje concluído".
    const descansoHoje =
      estado.ultimoEvento?.ultimoDescanso != null &&
      diaLocal(estado.ultimoEvento.ultimoDescanso.completedAt, tz) === hoje;

    // Cursor da cadeia prevista (só divisão); consumido na ordem dos dias.
    const cursor = comDivisao ? criarCursor(ficha, estado, agora) : null;
    const inicioEventos = eventos.length;

    for (const dia of dias) {
      const feitas = sessoesNoDia(dia);

      if (dia < hoje) {
        feitas.forEach((s, n) => eventos.push(eventoConcluido(ficha, s, dia, n)));
        continue;
      }

      const marcado = marcados.has(weekdayDeDia(dia));

      if (dia === hoje) {
        if (feitas.length > 0) {
          feitas.forEach((s, n) => eventos.push(eventoConcluido(ficha, s, dia, n)));
          continue;
        }
        if (descansoHoje && comDivisao) {
          eventos.push({
            chave: `treino:${ficha.id}:${dia}`,
            origem: 'treino',
            titulo: 'Descanso',
            dia,
            inicio: null,
            fim: null,
            status: 'concluido',
            acao: null,
            meta: { planId: ficha.id, fichaNome: ficha.name, descanso: true, divisao: null },
          });
          continue;
        }
        if (!marcado) continue;
        if (cursor) {
          // Hoje = exatamente o cartão "treino de hoje" (mesma função/entradas).
          const pt = cursor.proximo();
          if (pt) eventos.push(eventoDeProximo(ficha, pt, dia, 'pendente', true));
        } else {
          const evento = eventoPorDia(ficha, dia, 'pendente');
          if (evento) eventos.push(evento);
        }
        continue;
      }

      // Futuro: apenas dias marcados.
      if (!marcado) continue;
      if (cursor) {
        const pt = cursor.proximo();
        if (pt) eventos.push(eventoDeProximo(ficha, pt, dia, 'previsto', false));
      } else {
        const evento = eventoPorDia(ficha, dia, 'previsto');
        if (evento) eventos.push(evento);
      }
    }

    // Mantém só os eventos dentro da janela pedida (a iteração pode começar antes).
    const dentro = eventos.splice(inicioEventos).filter((e) => e.dia >= diaInicio && e.dia <= diaFim);
    eventos.push(...dentro);
  }

  return { eventos, fichasSemDia };
}

/** Ficha SEM divisão: itens do weekday local de `dia` (nunca usa `proximoTreinoDaFicha`). */
function eventoPorDia(
  ficha: FichaInicio,
  dia: string,
  status: 'pendente' | 'previsto'
): EventoAgenda | null {
  const weekday = weekdayDeDia(dia);
  const itens = (ficha.workout_plan_items ?? []).filter((i) => i.weekday === weekday);
  if (itens.length === 0) return null;
  return {
    chave: `treino:${ficha.id}:${dia}`,
    origem: 'treino',
    titulo: 'Treino',
    dia,
    inicio: null,
    fim: null,
    status,
    acao:
      status === 'pendente'
        ? { tipo: 'link', href: `/aluno/execucao/${ficha.id}?dia=${weekday}`, rotulo: 'Treinar' }
        : null,
    meta: { planId: ficha.id, fichaNome: ficha.name, divisao: null, exercicios: itens.length, prevista: status === 'previsto' },
  };
}
