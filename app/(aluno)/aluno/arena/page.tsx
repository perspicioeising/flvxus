import { Trophy } from 'lucide-react';
import { redirect } from 'next/navigation';

import { getSessionUser } from '@/lib/auth';
import { montarDadosArena } from '@/lib/arena/dados';
import { EmptyState, PageHeader } from '@/components/patterns';
import { CartaoNivel } from '@/components/aluno/arena/cartao-nivel';
import { ContadorStreak } from '@/components/aluno/arena/contador-streak';
import { LeaderboardArena } from '@/components/aluno/arena/leaderboard-arena';
import { ListaMissoes } from '@/components/aluno/arena/lista-missoes';
import { ListaConquistas } from '@/components/aluno/conquistas/lista-conquistas';

/**
 * Arena do aluno (RSC): nível/XP com barra de progresso, sequência (streak),
 * ranking da temporada (com estado "ranking em breve" abaixo do mínimo de
 * participantes) e missões do dia/semana. Lê tudo via `montarDadosArena` sob
 * RLS, com degradação por bloco — a tela nunca quebra por um bloco ausente.
 *
 * A concessão de XP/conquistas acontece no banco (triggers SECURITY DEFINER);
 * esta tela apenas resume o estado atual.
 */
export default async function AlunoArenaPage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    redirect('/login');
  }

  const dados = await montarDadosArena(sessionUser.userId);

  return (
    <section className="mx-auto w-full max-w-2xl space-y-6">
      <PageHeader
        emphasis="caps"
        title="Arena"
        subtitle="Seu nível, sua sequência, o ranking da academia e as missões da semana."
      />

      <CartaoNivel nivel={dados.perfil.nivel} />

      <ContadorStreak
        atual={dados.perfil.streakAtual}
        recorde={dados.perfil.streakRecorde}
      />

      <LeaderboardArena ranking={dados.ranking} meuUserId={dados.meuUserId} />

      <ListaMissoes missoes={dados.missoes} />

      <div className="space-y-3">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
          <Trophy className="h-4 w-4" aria-hidden="true" />
          Conquistas
        </p>
        {dados.conquistas.total === 0 ? (
          <EmptyState
            icon={Trophy}
            title="Nenhuma conquista disponível"
            description="Quando seu professor configurar as conquistas, elas aparecem aqui conforme você treina."
            className="rounded-3xl"
          />
        ) : (
          <ListaConquistas conquistas={dados.conquistas.conquistas} />
        )}
      </div>
    </section>
  );
}
