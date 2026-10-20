import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { signExerciseMedia } from '@/lib/storage';
import { WEEKDAY_LABEL } from '@/lib/semana';
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

/** Converte o searchParam `?dia` num weekday válido (0..6) ou `null`. */
function parseDia(valor: string | string[] | undefined): number | null {
  const bruto = Array.isArray(valor) ? valor[0] : valor;
  if (bruto === undefined) return null;
  const n = Number(bruto);
  return Number.isInteger(n) && n >= 0 && n <= 6 ? n : null;
}

/**
 * Execução de uma ficha liberada. Carrega SEMPRE todos os itens da ficha e
 * entrega ao Client Component, que mostra um seletor dos dias/divisões com
 * exercícios (incluindo o balde "Sem dia definido") e filtra os itens do dia
 * escolhido — sem forçar o dia de hoje. Quando `?dia` vem na URL (atalho a
 * partir da ficha), já começa naquele dia, mas o aluno ainda pode trocar.
 *
 * A sessão NÃO é criada aqui — só ao confirmar o início (primeiro toque), para
 * não gravar sessão vazia ao abrir a tela. RLS limita a fichas `released` do
 * próprio aluno (vazio → 404). A mídia de cada exercício é assinada AQUI (no
 * servidor, bucket privado) e entregue já pronta; o Client nunca assina URL.
 */
export default async function AlunoExecucaoFichaPage({
  params,
  searchParams,
}: {
  params: Promise<{ planId: string }>;
  searchParams: Promise<{ dia?: string | string[] }>;
}) {
  const { planId } = await params;
  const { dia } = await searchParams;
  const weekday = parseDia(dia);

  const supabase = await createClient();

  const { data: ficha } = await supabase
    .from('workout_plans')
    .select('id, name')
    .eq('id', planId)
    .eq('status', 'released')
    .maybeSingle();

  if (!ficha) {
    notFound();
  }

  const { data: itensData } = await supabase
    .from('workout_plan_items')
    .select(
      'id, weekday, order_index, sets, reps, rest_seconds, target_load, notes, exercises(name, muscle_groups, equipment, video_url, thumbnail_url, instructions, tips, common_errors)'
    )
    .eq('plan_id', planId)
    .order('order_index', { ascending: true });

  // Assina a mídia de cada item no servidor (bucket privado, nunca URL pública).
  const itens: ItemExecucao[] = await Promise.all(
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

  // O Client recebe SEMPRE todos os itens e monta o seletor de dias; o `?dia`
  // (deep-link a partir da ficha) só define o dia inicial, sem travar a troca.
  const temDiaPedido =
    weekday !== null && itens.some((item) => item.weekday === weekday);

  const subtitulo = temDiaPedido
    ? WEEKDAY_LABEL[weekday as number]
    : 'Escolha o dia e comece o treino';

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
        <SessaoExecucao planId={ficha.id} itens={itens} diaInicial={weekday} />
      )}
    </section>
  );
}
