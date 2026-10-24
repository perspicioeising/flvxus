import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

import { getSessionUser } from '@/lib/auth';
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
 * Converte o searchParam `?divisao` num rótulo de divisão ou `null`. O Next já
 * entrega o valor URL-decodificado, então só fazemos `trim`; vazio vira `null`.
 */
function parseDivisao(valor: string | string[] | undefined): string | null {
  const bruto = Array.isArray(valor) ? valor[0] : valor;
  if (bruto === undefined) return null;
  const limpo = bruto.trim();
  return limpo === '' ? null : limpo;
}

/**
 * Treino PRESENCIAL: o professor opera a MESMA tela de execução do aluno,
 * registrando a sessão EM NOME do aluno. Reaproveita o carregamento da página
 * do aluno (`app/(aluno)/aluno/execucao/[planId]/page.tsx`): monta todos os
 * itens da ficha, assina a mídia no servidor e entrega ao `SessaoExecucao`.
 *
 * A diferença está nas validações server-side e no `studentId` passado ao
 * componente (que ativa o fluxo professor nas Server Actions). A sessão nasce
 * com `student_id` do aluno e `recorded_by` do professor; para o aluno, aparece
 * como execução própria (sem rótulo "preenchido pelo professor"). A autorização
 * de posse é da RLS (trainer do tenant). Qualquer entrada inválida/alheia cai em
 * `notFound()` (dupla defesa: RLS + `.eq(...)` explícito).
 */
export default async function ProfessorTreinarAlunoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; planId: string }>;
  searchParams: Promise<{ dia?: string | string[]; divisao?: string | string[] }>;
}) {
  const { id, planId } = await params;
  const { dia, divisao } = await searchParams;
  const weekday = parseDia(dia);
  const divisaoPedida = parseDivisao(divisao);

  // O layout (professor) já garante trainer; revalidar é defesa em profundidade.
  const professor = await getSessionUser();
  if (!professor || professor.role !== 'trainer') {
    notFound();
  }

  const supabase = await createClient();

  // Aluno é do tenant do professor (RLS de `profiles` restringe ao tenant) e é
  // de fato um student. Vazio → 404.
  const { data: aluno } = await supabase
    .from('profiles')
    .select('user_id, full_name')
    .eq('user_id', id)
    .eq('role', 'student')
    .maybeSingle();

  if (!aluno) {
    notFound();
  }

  // Ficha é DAQUELE aluno e está liberada. A RLS deixa o trainer ver qualquer
  // status do seu tenant, então `status = 'released'` é imposto aqui (regra de
  // produto, igual ao fluxo do aluno). `.eq('student_id', id)` evita treinar
  // ficha de outro aluno via URL forjada. Vazio → 404.
  const { data: ficha } = await supabase
    .from('workout_plans')
    .select('id, name')
    .eq('id', planId)
    .eq('student_id', id)
    .eq('status', 'released')
    .maybeSingle();

  if (!ficha) {
    notFound();
  }

  const { data: itensData } = await supabase
    .from('workout_plan_items')
    .select(
      'id, weekday, division, order_index, sets, reps, rest_seconds, target_load, notes, exercises(name, muscle_groups, equipment, video_url, thumbnail_url, instructions, tips, common_errors)'
    )
    .eq('plan_id', ficha.id)
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
        division: item.division,
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

  const porDivisao = itens.some((item) => (item.division ?? null) !== null);

  const temDivisaoPedida =
    porDivisao &&
    divisaoPedida !== null &&
    itens.some((item) => (item.division ?? null) === divisaoPedida);

  const temDiaPedido =
    !porDivisao &&
    weekday !== null &&
    itens.some((item) => item.weekday === weekday);

  const nomeAluno = aluno.full_name?.trim() || 'aluno';

  const subtitulo = porDivisao
    ? temDivisaoPedida
      ? (divisaoPedida as string)
      : 'Escolha a divisão e comece o treino'
    : temDiaPedido
      ? WEEKDAY_LABEL[weekday as number]
      : 'Escolha o dia e comece o treino';

  return (
    <section className="mx-auto w-full max-w-2xl space-y-6">
      <Link
        href={`/professor/alunos/${id}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Voltar para a ficha do aluno
      </Link>

      <header className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">
          Treinar com {nomeAluno}
        </p>
        <h1 className="text-3xl font-black uppercase tracking-tight text-foreground md:text-4xl">{ficha.name}</h1>
        <p className="text-sm text-muted-foreground">{subtitulo}</p>
      </header>

      {itens.length === 0 ? (
        <EmptyState
          title="Nenhum exercício nesta ficha"
          description="Esta ficha ainda não tem exercícios prescritos."
        />
      ) : (
        <SessaoExecucao
          planId={ficha.id}
          itens={itens}
          diaInicial={porDivisao ? null : weekday}
          divisaoInicial={porDivisao ? divisaoPedida : null}
          studentId={id}
          destinoAoFinalizar={`/professor/alunos/${id}`}
        />
      )}
    </section>
  );
}
