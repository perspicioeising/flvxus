import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { agruparPorDia, parseDia } from '@/lib/semana';
import { agruparPorDivisao, parseDivisao } from '@/lib/divisao';
import { formatarData } from '@/lib/datas';
import { DiaLista, type ItemDia } from '@/components/aluno/treinos/dia-lista';
import { DivisaoLista } from '@/components/aluno/treinos/divisao-lista';

/** Extrai nome e grupos musculares de um join `exercises` (array ou objeto). */
function dadosExercicio(exercises: unknown): { nome: string; grupos: string[] } {
  const e = Array.isArray(exercises) ? exercises[0] : exercises;
  const registro = e as { name: string | null; muscle_groups: string[] | null } | null;
  return {
    nome: registro?.name?.trim() || 'Exercício',
    grupos: registro?.muscle_groups ?? [],
  };
}

/** Forma mínima de um item de ficha vinda do `select` (dia ou divisão). */
interface ItemFicha {
  id: string;
  sets: number | null;
  reps: string | null;
  target_load: number | null;
  rest_seconds: number | null;
  notes: string | null;
  exercises: unknown;
}

/** Normaliza um item do banco para o shape exibível `ItemDia`. */
function mapearItemDia(item: ItemFicha): ItemDia {
  const { nome, grupos: gruposMusculares } = dadosExercicio(item.exercises);
  return {
    id: item.id,
    nome,
    gruposMusculares,
    sets: item.sets,
    reps: item.reps,
    cargaAlvo: item.target_load,
    descansoSegundos: item.rest_seconds,
    observacoes: item.notes,
  };
}

/**
 * Detalhe de uma ficha liberada. Ao clicar numa divisão em `/aluno/treinos`, o
 * link traz o eixo escolhido (`?divisao=`/`?dia=`) e aqui exibimos APENAS aquele
 * grupo (ex.: só o treino A), com o botão "Iniciar treino {letra}". Sem eixo na
 * URL (acesso direto à ficha), lista todas as divisões/dias (retrocompatível).
 *
 * Regra de 404 (única): só ficha inexistente/não-released cai em `notFound()`.
 * Um eixo ausente ou com rótulo/dia inexistente NÃO dá 404 aqui — degrada
 * listando todas as divisões/dias (o 404 de "eixo inválido" é só na execução,
 * que redireciona ao detalhe). O RLS limita a fichas `released` do próprio
 * aluno — vazio vira 404.
 */
export default async function AlunoFichaDetalhePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ dia?: string | string[]; divisao?: string | string[] }>;
}) {
  const { id } = await params;
  const { dia, divisao } = await searchParams;
  const divisaoPedida = parseDivisao(divisao);
  const diaPedido = parseDia(dia);
  const supabase = await createClient();

  const { data: ficha } = await supabase
    .from('workout_plans')
    .select('id, name, released_at')
    .eq('id', id)
    .eq('status', 'released')
    .maybeSingle();

  if (!ficha) {
    notFound();
  }

  const { data: itensData } = await supabase
    .from('workout_plan_items')
    .select(
      'id, weekday, division, order_index, sets, reps, rest_seconds, target_load, notes, exercises(name, muscle_groups)'
    )
    .eq('plan_id', id)
    .order('order_index', { ascending: true });

  const itens = itensData ?? [];

  // Eixo detectado pelos itens: se algum tem divisão, agrupa por divisão
  // (A/B/C/…); senão, mantém o agrupamento legado por dia da semana.
  const porDivisao = itens.some((item) => (item.division ?? null) !== null);

  const gruposDiaTodos = porDivisao
    ? []
    : agruparPorDia(itens, (item) => item.weekday);
  const gruposDivisaoTodos = porDivisao
    ? agruparPorDivisao(itens, (item) => item.division ?? null)
    : [];

  // Filtro por eixo: `rotulo`/`dia` existente ou `sem` com balde existente →
  // isola só aquele grupo; `ausente` → lista todos; rótulo/dia inexistente →
  // degrada listando todos (sem 404). Simétrico entre divisão e dia.
  const gruposDivisao = (() => {
    if (!porDivisao) return [];
    if (divisaoPedida.tipo === 'rotulo') {
      const alvo = gruposDivisaoTodos.filter(
        (g) => g.division === divisaoPedida.valor
      );
      return alvo.length > 0 ? alvo : gruposDivisaoTodos;
    }
    if (divisaoPedida.tipo === 'sem') {
      const alvo = gruposDivisaoTodos.filter((g) => g.division === null);
      return alvo.length > 0 ? alvo : gruposDivisaoTodos;
    }
    return gruposDivisaoTodos;
  })();

  const gruposDia = (() => {
    if (porDivisao) return [];
    if (diaPedido.tipo === 'dia') {
      const alvo = gruposDiaTodos.filter((g) => g.weekday === diaPedido.valor);
      return alvo.length > 0 ? alvo : gruposDiaTodos;
    }
    if (diaPedido.tipo === 'sem') {
      const alvo = gruposDiaTodos.filter((g) => g.weekday === null);
      return alvo.length > 0 ? alvo : gruposDiaTodos;
    }
    return gruposDiaTodos;
  })();

  const vazio = porDivisao ? gruposDivisao.length === 0 : gruposDia.length === 0;

  return (
    <section className="mx-auto w-full max-w-2xl space-y-6">
      <Link
        href="/aluno/treinos"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Voltar para treinos
      </Link>

      <header className="space-y-1">
        <h1 className="text-3xl font-black uppercase leading-[0.95] tracking-tight text-foreground md:text-4xl">
          {ficha.name}
        </h1>
        <p className="text-sm text-muted-foreground">
          Liberada em {formatarData(ficha.released_at)}
        </p>
      </header>

      {vazio ? (
        <p className="text-sm text-muted-foreground">
          Esta ficha ainda não tem exercícios cadastrados.
        </p>
      ) : porDivisao ? (
        <div className="space-y-4">
          {gruposDivisao.map((grupo) => {
            const itensDivisao: ItemDia[] = grupo.itens.map(mapearItemDia);
            return (
              <DivisaoLista
                key={grupo.division ?? 'sem-divisao'}
                rotulo={grupo.rotulo}
                division={grupo.division}
                planId={ficha.id}
                itens={itensDivisao}
              />
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          {gruposDia.map((grupo) => {
            const itensDia: ItemDia[] = grupo.itens.map(mapearItemDia);
            return (
              <DiaLista
                key={grupo.weekday ?? 'sem-dia'}
                rotulo={grupo.rotulo}
                weekday={grupo.weekday}
                planId={ficha.id}
                itens={itensDia}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
