import { Trophy } from 'lucide-react';
import { redirect } from 'next/navigation';

import { getSessionUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import {
  agregarConquistas,
  calcularStreak,
  type ConquistaDisponivel,
  type ConquistaObtida,
} from '@/lib/gamificacao/conquistas';
import { EmptyState, ErrorState, PageHeader } from '@/components/patterns';
import { ResumoProgresso } from '@/components/aluno/conquistas/resumo-progresso';
import { ListaConquistas } from '@/components/aluno/conquistas/lista-conquistas';

/**
 * Tela de conquistas/progresso do aluno. Leitura via RSC sob RLS: o aluno lê o
 * próprio `profiles` (pontos), as conquistas do tenant (`achievements`), as
 * próprias `user_achievements` e as datas de sessões concluídas (para o streak).
 *
 * A concessão de conquistas NÃO acontece aqui — roda no banco via trigger
 * SECURITY DEFINER (ADR 0013). Esta tela apenas resume o estado atual.
 */
export default async function AlunoConquistasPage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    redirect('/login');
  }

  const supabase = await createClient();

  const [perfilRes, achievementsRes, obtidasRes, sessoesRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('total_points')
      .eq('user_id', sessionUser.userId)
      .maybeSingle(),
    supabase
      .from('achievements')
      .select('id, name, description, icon, points')
      .order('created_at', { ascending: true }),
    supabase
      .from('user_achievements')
      .select('achievement_id, earned_at')
      .eq('student_id', sessionUser.userId),
    supabase
      .from('workout_sessions')
      .select('finished_at')
      .not('finished_at', 'is', null),
  ]);

  if (
    perfilRes.error ||
    achievementsRes.error ||
    obtidasRes.error ||
    sessoesRes.error
  ) {
    return (
      <section className="mx-auto w-full max-w-2xl space-y-6">
        <PageHeader emphasis="caps" title="Conquistas" />
        <ErrorState
          title="Não foi possível carregar suas conquistas"
          description="Ocorreu um erro ao buscar seus dados. Atualize a página para tentar novamente."
        />
      </section>
    );
  }

  const pontos = perfilRes.data?.total_points ?? 0;
  const disponiveis: ConquistaDisponivel[] = achievementsRes.data ?? [];
  const obtidas: ConquistaObtida[] = obtidasRes.data ?? [];
  const streak = calcularStreak(
    (sessoesRes.data ?? []).map((s) => s.finished_at)
  );
  const agregado = agregarConquistas(disponiveis, obtidas);

  return (
    <section className="mx-auto w-full max-w-2xl space-y-6">
      <PageHeader
        emphasis="caps"
        title="Conquistas"
        subtitle="Seus pontos, sua sequência de treinos e o que você já desbloqueou."
      />

      <ResumoProgresso
        pontos={pontos}
        streak={streak}
        obtidas={agregado.obtidas}
        total={agregado.total}
      />

      {agregado.total === 0 ? (
        <EmptyState
          icon={Trophy}
          title="Nenhuma conquista disponível"
          description="Quando seu professor configurar as conquistas, elas aparecem aqui conforme você treina."
          className="rounded-3xl"
        />
      ) : (
        <ListaConquistas conquistas={agregado.conquistas} />
      )}
    </section>
  );
}
