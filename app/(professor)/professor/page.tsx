import {
  Users,
  UserCheck,
  CalendarClock,
  ClipboardCheck,
} from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { diasDesde, dataVencida, formatarData } from '@/lib/datas';
import { ErrorState, PageHeader, StatCard } from '@/components/patterns';
import {
  PendenciasCard,
  AtividadeRecenteCard,
  DIAS_AVALIACAO_VENCIDA,
  type PendenciaItem,
  type AtividadeItem,
} from '@/components/professor/dashboard';
import { STATUS_LABEL as STATUS_FICHA_LABEL, STATUS_VARIANTE } from '@/components/professor/treinos/labels';
import type { StudentStatus, PlanStatus } from '@/types/database.types';

/** Status de ficha que ainda não chegaram ao aluno (aguardando liberação). */
const STATUS_AGUARDANDO: PlanStatus[] = ['draft', 'pending_review', 'approved'];

/** Quantos itens mostrar em cada bloco de pendências/atividade. */
const LIMITE_LISTA = 5;

/** Extrai o nome do aluno de um join `profiles` (array ou objeto). */
function nomeAluno(profiles: unknown): string {
  const p = Array.isArray(profiles) ? profiles[0] : profiles;
  const nome = (p as { full_name: string | null } | null)?.full_name;
  return nome?.trim() || 'Aluno sem nome';
}

export default async function ProfessorHomePage() {
  const supabase = await createClient();

  // Todas as leituras sob RLS (tenant/papel resolvidos pelas policies).
  const [
    alunosRes,
    avaliacoesRes,
    fichasAguardandoRes,
    avaliacoesRecentesRes,
    fichasRecentesRes,
  ] = await Promise.all([
    // Alunos do professor com status (para contadores e nome em pendências).
    supabase
      .from('profiles')
      .select('user_id, full_name, status')
      .eq('role', 'student'),
    // Avaliações (só precisamos de aluno + data para achar a última de cada um).
    supabase
      .from('physical_assessments')
      .select('student_id, assessed_at')
      .order('assessed_at', { ascending: false }),
    // Fichas aguardando liberação.
    supabase
      .from('workout_plans')
      .select('id, name, status, profiles!workout_plans_student_id_fkey(full_name)')
      .in('status', STATUS_AGUARDANDO)
      .order('created_at', { ascending: false }),
    // Atividade recente: últimas avaliações criadas.
    supabase
      .from('physical_assessments')
      .select('id, created_at, profiles!physical_assessments_student_id_fkey(full_name)')
      .order('created_at', { ascending: false })
      .limit(LIMITE_LISTA),
    // Atividade recente: últimas fichas criadas.
    supabase
      .from('workout_plans')
      .select('id, name, created_at, profiles!workout_plans_student_id_fkey(full_name)')
      .order('created_at', { ascending: false })
      .limit(LIMITE_LISTA),
  ]);

  const erro =
    alunosRes.error ||
    avaliacoesRes.error ||
    fichasAguardandoRes.error ||
    avaliacoesRecentesRes.error ||
    fichasRecentesRes.error;

  if (erro) {
    return (
      <section className="mx-auto w-full max-w-5xl space-y-6">
        <PageHeader emphasis="caps" title="Visão geral" />
        <ErrorState
          title="Não foi possível carregar o painel"
          description="Ocorreu um erro ao buscar seus dados. Atualize a página para tentar novamente."
        />
      </section>
    );
  }

  const alunos = alunosRes.data ?? [];

  // Contadores por status.
  const porStatus = alunos.reduce<Record<StudentStatus, number>>(
    (acc, a) => {
      const s = (a.status ?? 'pending') as StudentStatus;
      acc[s] = (acc[s] ?? 0) + 1;
      return acc;
    },
    { active: 0, inactive: 0, pending: 0, archived: 0 }
  );
  const totalAlunos = alunos.length;
  const ativos = porStatus.active;
  const inativos = porStatus.inactive + porStatus.archived;

  // Última avaliação de cada aluno (a lista já vem ordenada desc por data).
  const ultimaAvaliacaoPorAluno = new Map<string, string>();
  for (const av of avaliacoesRes.data ?? []) {
    if (!ultimaAvaliacaoPorAluno.has(av.student_id)) {
      ultimaAvaliacaoPorAluno.set(av.student_id, av.assessed_at);
    }
  }

  // Avaliações vencidas: alunos ativos cuja última avaliação passou do limite
  // (ou que nunca foram avaliados). Arquivados/pendentes não entram.
  const avaliacoesVencidas: PendenciaItem[] = alunos
    .filter((a) => a.status === 'active')
    .map((a) => {
      const ultima = ultimaAvaliacaoPorAluno.get(a.user_id) ?? null;
      return { aluno: a, ultima };
    })
    .filter(({ ultima }) => dataVencida(ultima, DIAS_AVALIACAO_VENCIDA))
    .sort((x, y) => {
      // Mais atrasados primeiro; "nunca avaliado" no topo.
      const dx = diasDesde(x.ultima) ?? Number.POSITIVE_INFINITY;
      const dy = diasDesde(y.ultima) ?? Number.POSITIVE_INFINITY;
      return dy - dx;
    })
    .slice(0, LIMITE_LISTA)
    .map(({ aluno, ultima }) => {
      const dias = diasDesde(ultima);
      return {
        id: aluno.user_id,
        titulo: aluno.full_name?.trim() || 'Aluno sem nome',
        descricao:
          dias === null
            ? 'Nunca avaliado'
            : `Última avaliação há ${dias} ${dias === 1 ? 'dia' : 'dias'}`,
        href: `/professor/alunos/${aluno.user_id}`,
      } satisfies PendenciaItem;
    });

  const totalVencidas = alunos
    .filter((a) => a.status === 'active')
    .filter((a) => dataVencida(ultimaAvaliacaoPorAluno.get(a.user_id) ?? null, DIAS_AVALIACAO_VENCIDA))
    .length;

  // Fichas aguardando liberação.
  const fichasAguardando = fichasAguardandoRes.data ?? [];
  const fichasPendencias: PendenciaItem[] = fichasAguardando
    .slice(0, LIMITE_LISTA)
    .map((f) => {
      const status = f.status as PlanStatus;
      return {
        id: f.id,
        titulo: f.name,
        descricao: nomeAluno(f.profiles),
        href: `/professor/treinos/${f.id}`,
        badge: { label: STATUS_FICHA_LABEL[status], variant: STATUS_VARIANTE[status] },
      } satisfies PendenciaItem;
    });

  // Atividade recente: combina avaliações e fichas, ordena por created_at desc.
  const atividades: (AtividadeItem & { createdAt: string })[] = [
    ...(avaliacoesRecentesRes.data ?? []).map((a) => ({
      id: a.id,
      tipo: 'avaliacao' as const,
      texto: `Avaliação de ${nomeAluno(a.profiles)}`,
      data: formatarData(a.created_at),
      href: `/professor/avaliacoes/${a.id}`,
      createdAt: a.created_at,
    })),
    ...(fichasRecentesRes.data ?? []).map((f) => ({
      id: f.id,
      tipo: 'ficha' as const,
      texto: `Ficha "${f.name}" para ${nomeAluno(f.profiles)}`,
      data: formatarData(f.created_at),
      href: `/professor/treinos/${f.id}`,
      createdAt: f.created_at,
    })),
  ]
    .sort((x, y) => y.createdAt.localeCompare(x.createdAt))
    .slice(0, LIMITE_LISTA);

  return (
    <section className="mx-auto w-full max-w-5xl space-y-6">
      <PageHeader
        emphasis="caps"
        title="Visão geral"
        subtitle="Acompanhe seus alunos, avaliações vencidas e fichas aguardando liberação."
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label="Total de alunos" value={totalAlunos} icon={Users} tone="emphasis" radius="2xl" />
        <StatCard label="Alunos ativos" value={ativos} icon={UserCheck} tone="emphasis" radius="2xl" />
        <StatCard
          label="Alunos inativos"
          value={inativos}
          icon={Users}
          hint="Inativos e arquivados"
          radius="2xl"
        />
        <StatCard
          label="Avaliações vencidas"
          value={totalVencidas}
          icon={CalendarClock}
          hint={`Sem avaliação há mais de ${DIAS_AVALIACAO_VENCIDA} dias`}
          radius="2xl"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <PendenciasCard
          titulo="Avaliações vencidas"
          descricao={`Alunos ativos sem avaliação há mais de ${DIAS_AVALIACAO_VENCIDA} dias.`}
          icon={CalendarClock}
          itens={avaliacoesVencidas}
          vazioTitulo="Nenhuma avaliação vencida"
          vazioDescricao="Todos os alunos ativos estão com a avaliação em dia."
          verTodos={{ label: 'Ver avaliações', href: '/professor/avaliacoes' }}
        />

        <PendenciasCard
          titulo="Fichas aguardando liberação"
          descricao="Fichas em rascunho, revisão ou aprovadas que o aluno ainda não vê."
          icon={ClipboardCheck}
          itens={fichasPendencias}
          vazioTitulo="Nenhuma ficha pendente"
          vazioDescricao="Não há fichas aguardando liberação no momento."
          verTodos={{ label: 'Ver fichas', href: '/professor/treinos' }}
        />
      </div>

      <AtividadeRecenteCard itens={atividades} />
    </section>
  );
}
