import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowUpRight, BarChart3, Dumbbell, Trophy } from 'lucide-react';

import { getSessionUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { diasDesde } from '@/lib/datas';
import { weekdayAtual, WEEKDAY_LABEL } from '@/lib/semana';
import { agruparPorDivisao } from '@/lib/divisao';
import { EmptyState, ErrorState } from '@/components/patterns';
import {
  CardTreinoHoje,
  type ExercicioHoje,
} from '@/components/aluno/inicio/card-treino-hoje';

/** Extrai o nome do exercício de um join `exercises` (array ou objeto). */
function infoExercicio(exercises: unknown): {
  nome: string;
  grupos: string[];
} {
  const e = Array.isArray(exercises) ? exercises[0] : exercises;
  const nome = (e as { name: string | null } | null)?.name;
  const grupos = (e as { muscle_groups: string[] | null } | null)?.muscle_groups;
  return {
    nome: nome?.trim() || 'Exercício',
    grupos: Array.isArray(grupos) ? grupos : [],
  };
}

/**
 * Tela de início do aluno. Mostra o próximo treino (cartão verde com a letra da
 * divisão ou o treino do dia legado), dois atalhos (Evolução/Conquistas) e o
 * resumo da última avaliação. Leitura via RSC sob RLS; o gate de papel já é
 * feito no layout da área.
 */
export default async function AlunoHomePage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    redirect('/login');
  }

  const supabase = await createClient();
  const weekday = weekdayAtual();

  const [fichaRes, avaliacaoRes] = await Promise.all([
    // Ficha liberada mais recente do aluno + itens (RLS garante posse e released).
    supabase
      .from('workout_plans')
      .select(
        'id, name, status, workout_plan_items(id, weekday, division, order_index, sets, reps, exercises(name, muscle_groups))'
      )
      .eq('status', 'released')
      .order('released_at', { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle(),
    // Última avaliação física (para o resumo "há N dias").
    supabase
      .from('physical_assessments')
      .select('assessed_at')
      .order('assessed_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (fichaRes.error || avaliacaoRes.error) {
    return (
      <section className="mx-auto w-full max-w-2xl space-y-6">
        <Saudacao nome={sessionUser.fullName} weekday={weekday} />
        <ErrorState
          title="Não foi possível carregar seu início"
          description="Ocorreu um erro ao buscar seus dados. Atualize a página para tentar novamente."
        />
      </section>
    );
  }

  const ficha = fichaRes.data;
  const itens = ficha?.workout_plan_items ?? [];
  const porDivisao = itens.some((item) => (item.division ?? null) !== null);

  // Regra do "próximo treino": primeira divisão (pt-BR) quando a ficha é por
  // divisão; senão, os itens do weekday atual (legado por dia).
  let itensTreino: typeof itens = [];
  let divisionLabel: string | null = null;
  if (porDivisao) {
    const grupos = agruparPorDivisao(itens, (item) => item.division ?? null);
    const primeiro = grupos[0];
    if (primeiro) {
      itensTreino = primeiro.itens;
      divisionLabel = primeiro.division;
    }
  } else {
    itensTreino = itens.filter((item) => item.weekday === weekday);
  }

  const itensOrdenados = [...itensTreino].sort(
    (a, b) => a.order_index - b.order_index
  );

  const exerciciosTreino: ExercicioHoje[] = itensOrdenados.map((item) => ({
    id: item.id,
    nome: infoExercicio(item.exercises).nome,
    sets: item.sets,
    reps: item.reps,
  }));

  const gruposTreino = Array.from(
    new Set(itensOrdenados.flatMap((item) => infoExercicio(item.exercises).grupos))
  );

  // Destino do CTA: ?divisao (por divisão), ?dia (legado), /aluno/treinos (vazio).
  let href = '/aluno/treinos';
  if (ficha && exerciciosTreino.length > 0) {
    href = porDivisao && divisionLabel
      ? `/aluno/execucao/${ficha.id}?divisao=${encodeURIComponent(divisionLabel)}`
      : `/aluno/execucao/${ficha.id}?dia=${weekday}`;
  }

  const diasUltimaAvaliacao = diasDesde(avaliacaoRes.data?.assessed_at ?? null);

  return (
    <section className="mx-auto w-full max-w-2xl space-y-6">
      <Saudacao nome={sessionUser.fullName} weekday={weekday} />

      {ficha && exerciciosTreino.length > 0 ? (
        <CardTreinoHoje
          fichaNome={ficha.name}
          planId={ficha.id}
          divisionLabel={divisionLabel}
          grupos={gruposTreino}
          exercicios={exerciciosTreino}
          href={href}
        />
      ) : (
        <EmptyState
          icon={Dumbbell}
          title="Nenhum treino liberado ainda"
          description="Quando seu professor liberar uma ficha, ela aparece aqui com o próximo treino."
          className="rounded-3xl"
        />
      )}

      <nav aria-label="Atalhos" className="grid grid-cols-2 gap-3">
        <Link
          href="/aluno/evolucao"
          className="flex min-h-11 flex-col justify-between rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="flex items-center justify-between">
            <BarChart3 className="h-5 w-5 text-primary" aria-hidden="true" />
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </div>
          <span className="mt-6 text-sm font-bold uppercase tracking-wide">
            Evolução
          </span>
        </Link>
        <Link
          href="/aluno/conquistas"
          className="flex min-h-11 flex-col justify-between rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="flex items-center justify-between">
            <Trophy className="h-5 w-5 text-primary" aria-hidden="true" />
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </div>
          <span className="mt-6 text-sm font-bold uppercase tracking-wide">
            Conquistas
          </span>
        </Link>
      </nav>

      <Link
        href="/aluno/avaliacoes"
        className="flex min-h-11 items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="text-sm text-muted-foreground">
          {diasUltimaAvaliacao === null
            ? 'Você ainda não tem avaliações registradas.'
            : diasUltimaAvaliacao === 0
              ? 'Última avaliação registrada hoje.'
              : `Última avaliação há ${diasUltimaAvaliacao} ${
                  diasUltimaAvaliacao === 1 ? 'dia' : 'dias'
                }.`}
        </span>
        <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      </Link>
    </section>
  );
}

/** Saudação do topo (reusada no caminho de erro). */
function Saudacao({ nome, weekday }: { nome: string | null; weekday: number }) {
  const primeiroNome = nome?.trim().split(/\s+/)[0]?.toUpperCase();
  const dia = WEEKDAY_LABEL[weekday].toUpperCase();
  return (
    <h1 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
      {dia}
      {primeiroNome ? ` · OLÁ, ${primeiroNome}` : ''}
    </h1>
  );
}
