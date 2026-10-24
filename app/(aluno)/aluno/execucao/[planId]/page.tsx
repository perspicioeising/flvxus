import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { signExerciseMedia } from '@/lib/storage';
import { WEEKDAY_LABEL, parseDia } from '@/lib/semana';
import { parseDivisao } from '@/lib/divisao';
import { EmptyState } from '@/components/patterns';
import {
  SessaoExecucao,
  type ItemExecucao,
} from '@/components/aluno/execucao/sessao-execucao';

/** Shape do join `exercises` que precisamos (array ou objeto, conforme o join). */
interface ExercicioJoin {
  name: string | null;
  muscle_groups: string[] | null;
  equipment: string[] | null;
  video_url: string | null;
  thumbnail_url: string | null;
  instructions: string | null;
  tips: string[] | null;
  common_errors: string[] | null;
}

/** Normaliza o join `exercises` (array ou objeto) para um único registro. */
function exercicioDoJoin(exercises: unknown): ExercicioJoin | null {
  const e = Array.isArray(exercises) ? exercises[0] : exercises;
  return (e as ExercicioJoin | null) ?? null;
}

/**
 * Execução de UMA divisão (ou dia, no legado) por vez. A rota filtra os itens
 * pelo eixo escolhido NO SERVIDOR (`?divisao=`/`?dia=`, parsers de 3 estados) e
 * entrega ao `SessaoExecucao` apenas os itens do grupo-alvo, passando
 * `permitirTrocaDeGrupo={false}` — sem pílulas das outras divisões no header,
 * foco só no treino em andamento (itens 4).
 *
 * Regra render-vs-redirect (única):
 * - ficha inexistente/não-released → `notFound()`;
 * - eixo ausente (`{tipo:'ausente'}`) ou rótulo/dia inexistente → `redirect()`
 *   ao detalhe da ficha (lista as divisões para escolher);
 * - eixo presente e válido (incluindo o balde via sentinela `__sem__`/`none`)
 *   → renderiza só aquele grupo.
 *
 * A sessão NÃO é criada aqui — só ao confirmar o início (primeiro toque). RLS
 * limita a fichas `released` do próprio aluno (vazio → 404). A mídia de cada
 * exercício é assinada AQUI (servidor, bucket privado) e entregue já pronta.
 */
export default async function AlunoExecucaoFichaPage({
  params,
  searchParams,
}: {
  params: Promise<{ planId: string }>;
  searchParams: Promise<{ dia?: string | string[]; divisao?: string | string[] }>;
}) {
  const { planId } = await params;
  const { dia, divisao } = await searchParams;
  const divisaoPedida = parseDivisao(divisao);
  const diaPedido = parseDia(dia);

  const supabase = await createClient();

  const { data: ficha } = await supabase
    .from('workout_plans')
    .select('id, name')
    .eq('id', planId)
    .eq('status', 'released')
    .maybeSingle();

  if (!ficha) {
    // Ficha inexistente/não-released → 404 (não é caso de redirect).
    notFound();
  }

  const { data: itensData } = await supabase
    .from('workout_plan_items')
    .select(
      'id, weekday, division, order_index, sets, reps, rest_seconds, target_load, notes, exercises(name, muscle_groups, equipment, video_url, thumbnail_url, instructions, tips, common_errors)'
    )
    .eq('plan_id', planId)
    .order('order_index', { ascending: true });

  // Assina a mídia de cada item no servidor (bucket privado, nunca URL pública).
  const todosItens: ItemExecucao[] = await Promise.all(
    (itensData ?? []).map(async (item) => {
      const ex = exercicioDoJoin(item.exercises);
      const [videoUrl, thumbnailUrl] = await Promise.all([
        ex?.video_url ? signExerciseMedia(ex.video_url) : Promise.resolve(null),
        ex?.thumbnail_url ? signExerciseMedia(ex.thumbnail_url) : Promise.resolve(null),
      ]);

      return {
        id: item.id,
        nome: ex?.name?.trim() || 'Exercício',
        weekday: item.weekday,
        division: item.division,
        // Sem séries prescritas, assumimos 1 para que haja ao menos uma linha.
        sets: item.sets && item.sets > 0 ? item.sets : 1,
        reps: item.reps,
        cargaAlvo: item.target_load,
        descansoSegundos: item.rest_seconds,
        observacoes: item.notes,
        instrucoes: ex?.instructions ?? null,
        dicas: ex?.tips ?? [],
        errosComuns: ex?.common_errors ?? [],
        gruposMusculares: ex?.muscle_groups ?? [],
        equipamento: ex?.equipment ?? [],
        videoUrl,
        thumbnailUrl,
      } satisfies ItemExecucao;
    })
  );

  // Eixo detectado pelos itens: se algum tem divisão, a ficha é por divisão.
  const porDivisao = todosItens.some((item) => (item.division ?? null) !== null);

  // Resolve o grupo-alvo (render) OU dispara o redirect ao detalhe (eixo
  // ausente/inválido). O balde sem eixo chega com o sentinela (`{tipo:'sem'}`) e
  // RENDERIZA; só `ausente` ou rótulo/dia inexistente redirecionam.
  let itens: ItemExecucao[];
  let subtitulo: string;
  let divisaoInicial: string | null = null;
  let diaInicial: number | null = null;

  if (porDivisao) {
    if (divisaoPedida.tipo === 'rotulo') {
      const alvo = todosItens.filter(
        (item) => (item.division ?? null) === divisaoPedida.valor
      );
      if (alvo.length === 0) redirect(`/aluno/treinos/${ficha.id}`);
      itens = alvo;
      divisaoInicial = divisaoPedida.valor;
      subtitulo = divisaoPedida.valor;
    } else if (divisaoPedida.tipo === 'sem') {
      const alvo = todosItens.filter((item) => (item.division ?? null) === null);
      if (alvo.length === 0) redirect(`/aluno/treinos/${ficha.id}`);
      itens = alvo;
      divisaoInicial = null;
      subtitulo = 'Divisão única';
    } else {
      // Eixo ausente numa ficha por divisão → escolher no detalhe.
      redirect(`/aluno/treinos/${ficha.id}`);
    }
  } else {
    if (diaPedido.tipo === 'dia') {
      const alvo = todosItens.filter((item) => item.weekday === diaPedido.valor);
      if (alvo.length === 0) redirect(`/aluno/treinos/${ficha.id}`);
      itens = alvo;
      diaInicial = diaPedido.valor;
      subtitulo = WEEKDAY_LABEL[diaPedido.valor];
    } else if (diaPedido.tipo === 'sem') {
      const alvo = todosItens.filter((item) => item.weekday === null);
      if (alvo.length === 0) redirect(`/aluno/treinos/${ficha.id}`);
      itens = alvo;
      diaInicial = null;
      subtitulo = 'Sem dia definido';
    } else {
      // Eixo ausente numa ficha legada → escolher no detalhe.
      redirect(`/aluno/treinos/${ficha.id}`);
    }
  }

  return (
    <section className="mx-auto w-full max-w-2xl space-y-6">
      <Link
        href={`/aluno/treinos/${ficha.id}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Voltar para a ficha
      </Link>

      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{ficha.name}</h1>
        <p className="text-sm text-muted-foreground">{subtitulo}</p>
      </header>

      {itens.length === 0 ? (
        <EmptyState
          title="Nenhum exercício nesta ficha"
          description="Esta ficha ainda não tem exercícios prescritos. Fale com seu professor."
        />
      ) : (
        <SessaoExecucao
          planId={ficha.id}
          itens={itens}
          diaInicial={diaInicial}
          divisaoInicial={divisaoInicial}
          permitirTrocaDeGrupo={false}
        />
      )}
    </section>
  );
}
