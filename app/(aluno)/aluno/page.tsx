import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowUpRight, BarChart3, Dumbbell, Trophy } from 'lucide-react';

import { getSessionUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { diasDesde } from '@/lib/datas';
import { weekdayAtual, WEEKDAY_LABEL } from '@/lib/semana';
import {
  proximoTreinoDaFicha,
  type FichaInicio,
} from '@/lib/treino/inicio';
import { EmptyState, ErrorState } from '@/components/patterns';
import { CardTreinoHoje } from '@/components/aluno/inicio/card-treino-hoje';
import { CardFichaSemTreino } from '@/components/aluno/inicio/card-ficha-sem-treino';

/**
 * Tela de início do aluno. Lê TODAS as fichas liberadas (o aluno Bruno tem
 * duas) com desempate determinístico (released_at desc, id desc) e mostra o
 * "próximo treino" de cada uma — um cartão por ficha. Com 1 ficha, o resultado
 * é equivalente em conteúdo e layout ao cartão único anterior. Fichas legadas
 * sem treino para hoje aparecem como cartão "sem treino para hoje" (nunca
 * ocultadas). Leitura via RSC sob RLS; o gate de papel é do layout da área.
 */
export default async function AlunoHomePage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    redirect('/login');
  }

  const supabase = await createClient();
  const weekday = weekdayAtual();

  const [fichasRes, avaliacaoRes] = await Promise.all([
    // TODAS as fichas liberadas do aluno + itens (RLS garante posse e released).
    // Desempate determinístico: released_at desc, id desc (nunca some ficha).
    supabase
      .from('workout_plans')
      .select(
        'id, name, status, workout_plan_items(id, weekday, division, order_index, sets, reps, exercises(name, muscle_groups))'
      )
      .eq('status', 'released')
      .order('released_at', { ascending: false, nullsFirst: false })
      .order('id', { ascending: false }),
    // Última avaliação física (para o resumo "há N dias"). Mantida no Promise.all.
    supabase
      .from('physical_assessments')
      .select('assessed_at')
      .order('assessed_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (fichasRes.error || avaliacaoRes.error) {
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

  const fichas = (fichasRes.data ?? []) as FichaInicio[];
  const diasUltimaAvaliacao = diasDesde(avaliacaoRes.data?.assessed_at ?? null);

  return (
    <section className="mx-auto w-full max-w-2xl space-y-6">
      <Saudacao nome={sessionUser.fullName} weekday={weekday} />

      {fichas.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title="Nenhum treino liberado ainda"
          description="Quando seu professor liberar uma ficha, ela aparece aqui com o próximo treino."
          className="rounded-3xl"
        />
      ) : (
        <div className="space-y-4">
          {fichas.map((ficha) => {
            const proximo = proximoTreinoDaFicha(ficha);
            if (proximo === null) {
              // Ficha legada sem treino para hoje: mostra o cartão dedicado.
              return (
                <CardFichaSemTreino
                  key={ficha.id}
                  fichaNome={ficha.name}
                  href={`/aluno/treinos/${ficha.id}`}
                />
              );
            }
            return (
              <CardTreinoHoje
                key={ficha.id}
                fichaNome={ficha.name}
                planId={ficha.id}
                divisionLabel={proximo.divisionLabel}
                grupos={proximo.grupos}
                exercicios={proximo.exercicios}
                href={proximo.href}
              />
            );
          })}
        </div>
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
