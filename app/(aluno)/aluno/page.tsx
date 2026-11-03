import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowUpRight, BarChart3, Dumbbell, Sparkles } from 'lucide-react';

import { getSessionUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { diasDesde } from '@/lib/datas';
import { weekdayAtual, WEEKDAY_LABEL } from '@/lib/semana';
import { diaSP } from '@/lib/arena/datas';
import { progressoAgua } from '@/lib/habitos/agua';
import { metaSugeridaMl } from '@/lib/habitos/meta-agua';
import {
  proximoTreinoDaFicha,
  type FichaInicio,
} from '@/lib/treino/inicio';
import { EmptyState, ErrorState } from '@/components/patterns';
import { CardTreinoHoje } from '@/components/aluno/inicio/card-treino-hoje';
import { CardFichaSemTreino } from '@/components/aluno/inicio/card-ficha-sem-treino';
import { DescansoResumoCard } from '@/components/aluno/treinos/descanso-resumo-card';
import { CardAgua } from '@/components/aluno/habitos/card-agua';
import { BotaoCheckin } from '@/components/aluno/habitos/botao-checkin';

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
  const hoje = diaSP(new Date()) ?? '';

  const [
    fichasRes,
    avaliacaoRes,
    sessoesRes,
    descansosRes,
    aguaRes,
    checkinRes,
    metaRes,
  ] = await Promise.all([
    // TODAS as fichas liberadas do aluno + itens (RLS garante posse e released).
    // Desempate determinístico: released_at desc, id desc (nunca some ficha).
    supabase
      .from('workout_plans')
      .select(
        'id, name, status, rotation_steps, workout_plan_items(id, weekday, division, order_index, sets, reps, exercises(name, muscle_groups))'
      )
      .eq('status', 'released')
      .order('released_at', { ascending: false, nullsFirst: false })
      .order('id', { ascending: false }),
    // Última avaliação física (para o resumo "há N dias" e a meta de água
    // sugerida pelo peso quando não há meta salva). Mantida no Promise.all.
    supabase
      .from('physical_assessments')
      .select('assessed_at, weight_kg')
      .order('assessed_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    // Sessões CONCLUÍDAS do aluno (RLS: só as próprias), mais recente primeiro.
    // Usa o índice (plan_id, division, finished_at desc). Desempate por id desc
    // espelha o desempate de fichas. A primeira linha de cada plan_id é a última
    // divisão concluída daquela ficha (mapa montado abaixo).
    supabase
      .from('workout_sessions')
      .select('plan_id, division, finished_at')
      .not('finished_at', 'is', null)
      .order('finished_at', { ascending: false })
      .order('id', { ascending: false }),
    // Descansos CUMPRIDOS (FEAT-003): mais recente primeiro por plano.
    supabase
      .from('workout_plan_rest_completions')
      .select('plan_id, rest_step_index, completed_at')
      .order('completed_at', { ascending: false }),
    // Hábitos G2 — registros de água do dia-SP (RLS: só os próprios).
    supabase
      .from('water_intake_logs')
      .select('amount_ml, occurred_on')
      .eq('occurred_on', hoje),
    // Hábitos G2 — check-in do dia-SP (único por aluno/dia).
    supabase
      .from('daily_checkins')
      .select('id')
      .eq('occurred_on', hoje)
      .maybeSingle(),
    // Hábitos G2 — meta de água salva (1 linha/aluno). Sem linha → derivamos do
    // peso da última avaliação (ou default) via `metaSugeridaMl`.
    supabase.from('water_goals').select('target_ml').maybeSingle(),
  ]);

  // Os hábitos degradam POR BLOCO: um erro aqui não derruba o início (o bloco de
  // hábitos cai no seu estado zero/não-feito); o caminho de erro geral cobre só
  // as leituras essenciais de treino/avaliação.
  if (fichasRes.error || avaliacaoRes.error || sessoesRes.error || descansosRes.error) {
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

  // --- Hábitos do dia (degradação por bloco) ---------------------------------
  // Meta: a salva em `water_goals` prevalece; senão sugerimos pela última
  // avaliação (`metaSugeridaMl` já cobre o default quando não há peso).
  const metaAguaMl =
    metaRes.data?.target_ml ?? metaSugeridaMl(avaliacaoRes.data?.weight_kg ?? null);
  const aguaLogs = aguaRes.error ? [] : aguaRes.data ?? [];
  const progresso = progressoAgua(aguaLogs, metaAguaMl, hoje);
  const jaFezCheckin = !checkinRes.error && checkinRes.data != null;

  // Mapa plan_id → última divisão CONCLUÍDA (ordenado por finished_at desc, id
  // desc). Como as sessões já vêm da mais recente para a mais antiga, a PRIMEIRA
  // ocorrência de cada plan_id é a última divisão concluída daquela ficha.
  // `has(planId)` distingue "sem histórico" (ausente) de "última foi o balde sem
  // divisão" (presente com valor `null`). Alimenta a rotação do próximo treino.
  const ultimaDivisaoPorPlano = new Map<string, string | null>();
  const ultimaSessaoPorPlano = new Map<
    string,
    { label: string | null; finishedAt: string }
  >();
  for (const sessao of sessoesRes.data ?? []) {
    if (sessao.plan_id === null) continue;
    if (!ultimaDivisaoPorPlano.has(sessao.plan_id)) {
      ultimaDivisaoPorPlano.set(sessao.plan_id, sessao.division ?? null);
      if (sessao.finished_at) {
        ultimaSessaoPorPlano.set(sessao.plan_id, {
          label: sessao.division ?? null,
          finishedAt: sessao.finished_at,
        });
      }
    }
  }

  // Mapa plan_id → último DESCANSO cumprido (FEAT-003), já ordenado desc.
  const ultimoDescansoPorPlano = new Map<
    string,
    { restStepIndex: number; completedAt: string }
  >();
  for (const descanso of descansosRes.data ?? []) {
    if (descanso.plan_id === null) continue;
    if (!ultimoDescansoPorPlano.has(descanso.plan_id)) {
      ultimoDescansoPorPlano.set(descanso.plan_id, {
        restStepIndex: descanso.rest_step_index,
        completedAt: descanso.completed_at,
      });
    }
  }

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
            // `undefined` quando a ficha não tem histórico (nunca concluída) →
            // a rotação começa na primeira divisão. Fichas por dia ignoram isto.
            const ultimaConcluida = ultimaDivisaoPorPlano.has(ficha.id)
              ? ultimaDivisaoPorPlano.get(ficha.id)
              : undefined;
            const proximo = proximoTreinoDaFicha(
              ficha,
              undefined,
              ultimaConcluida,
              {
                ultimaDivisao: ultimaSessaoPorPlano.get(ficha.id) ?? null,
                ultimoDescanso: ultimoDescansoPorPlano.get(ficha.id) ?? null,
              }
            );
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
            if (proximo.descanso && proximo.restStepIndex !== null) {
              // Próximo passo da rotação é descanso (FEAT-003).
              return (
                <DescansoResumoCard
                  key={ficha.id}
                  planId={ficha.id}
                  restStepIndex={proximo.restStepIndex}
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

      {/* Hábitos do dia: hidratação + check-in (G2). O editar da PRÓPRIA meta
          vive DENTRO do card de hidratação (ícone discreto de lápis) — a action
          resolve o alvo para auth.uid() (sem alvoUserId). A leitura de meta
          salva degrada por bloco: erro vira "sem meta salva" (null). */}
      <div className="space-y-3">
        <CardAgua
          consumidoMl={progresso.consumidoMl}
          targetMl={progresso.targetMl}
          pct={progresso.pct}
          metaAtingida={progresso.metaAtingida}
          metaAtualMl={metaRes.error ? null : metaRes.data?.target_ml ?? null}
          pesoKg={avaliacaoRes.data?.weight_kg ?? null}
        />
        <BotaoCheckin jaFezHoje={jaFezCheckin} />
      </div>

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
          href="/aluno/arena"
          className="flex min-h-11 flex-col justify-between rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="flex items-center justify-between">
            <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </div>
          <span className="mt-6 text-sm font-bold uppercase tracking-wide">
            Arena
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
