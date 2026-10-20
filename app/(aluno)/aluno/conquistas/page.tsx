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
import { EmptyState, ErrorState } from '@/components/patterns';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
        <PageHeader />
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
      <PageHeader />

      <ResumoProgresso
        pontos={pontos}
        streak={streak}
        obtidas={agregado.obtidas}
        total={agregado.total}
      />

      <Card>
        <CardHeader className="p-4 pb-0">
          <CardTitle className="text-lg">Conquistas</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {agregado.total === 0 ? (
            <EmptyState
              icon={Trophy}
              title="Nenhuma conquista disponível"
              description="Quando seu professor configurar as conquistas, elas aparecem aqui conforme você treina."
            />
          ) : (
            <ListaConquistas conquistas={agregado.conquistas} />
          )}
        </CardContent>
      </Card>
    </section>
  );
}

/** Cabeçalho da tela de conquistas (reusado no caminho de erro). */
function PageHeader() {
  return (
    <header className="space-y-1">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        Conquistas
      </h1>
      <p className="text-sm text-muted-foreground">
        Seus pontos, sua sequência de treinos e as conquistas que você já
        desbloqueou.
      </p>
    </header>
  );
}
