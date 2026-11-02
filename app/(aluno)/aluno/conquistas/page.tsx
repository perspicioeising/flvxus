import { Trophy } from 'lucide-react';
import { redirect } from 'next/navigation';

import { getSessionUser, isSelfManaged } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import {
  agregarConquistas,
  type ConquistaDisponivel,
  type ConquistaObtida,
} from '@/lib/gamificacao/conquistas';
import { EmptyState, ErrorState, PageHeader } from '@/components/patterns';
import { ResumoProgresso } from '@/components/aluno/conquistas/resumo-progresso';
import { ListaConquistas } from '@/components/aluno/conquistas/lista-conquistas';

/**
 * Tela de conquistas/progresso do aluno. Leitura via RSC sob RLS: o aluno lê o
 * próprio perfil da Arena (`gamification_profiles` — XP e streak já calculados
 * no fuso SP pelo motor), as conquistas do tenant (`achievements`) e as próprias
 * `user_achievements`. XP/streak vêm da FONTE ÚNICA da Arena (reconciliação):
 * nada de `profiles.total_points` nem do `calcularStreak` legado (UTC).
 *
 * A concessão de conquistas NÃO acontece aqui — roda no banco via trigger
 * SECURITY DEFINER (ADR 0013). Esta tela apenas resume o estado atual. O perfil
 * é LAZY: a ausência de linha significa zero-default (0 XP / 0 de sequência).
 */
export default async function AlunoConquistasPage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    redirect('/login');
  }

  const supabase = await createClient();

  const [perfilRes, achievementsRes, obtidasRes] = await Promise.all([
    supabase
      .from('gamification_profiles')
      .select('total_xp, current_streak')
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
  ]);

  // A ausência de linha do perfil (lazy) NÃO é erro — cai no zero-default.
  if (achievementsRes.error || obtidasRes.error) {
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

  const pontos = perfilRes.data?.total_xp ?? 0;
  const streak = perfilRes.data?.current_streak ?? 0;
  const disponiveis: ConquistaDisponivel[] = achievementsRes.data ?? [];
  const obtidas: ConquistaObtida[] = obtidasRes.data ?? [];
  const agregado = agregarConquistas(disponiveis, obtidas);

  // Aluno autônomo (self_managed): não há professor terceiro configurando as
  // conquistas — a cópia do empty-state não deve mencionar "seu professor". O
  // aluno VINCULADO (student) mantém o texto atual, sem regressão.
  const soloEu = isSelfManaged(sessionUser);

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
          description={
            soloEu
              ? 'Suas conquistas aparecem aqui conforme você treina.'
              : 'Quando seu professor configurar as conquistas, elas aparecem aqui conforme você treina.'
          }
          className="rounded-3xl"
        />
      ) : (
        <ListaConquistas conquistas={agregado.conquistas} />
      )}
    </section>
  );
}
