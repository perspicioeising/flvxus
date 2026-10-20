import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Activity, BarChart3, Dumbbell, Trophy, Utensils } from 'lucide-react';

import { getSessionUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { diasDesde } from '@/lib/datas';
import { weekdayAtual, WEEKDAY_LABEL } from '@/lib/semana';
import { EmptyState, ErrorState } from '@/components/patterns';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  CardTreinoHoje,
  type ExercicioHoje,
} from '@/components/aluno/inicio/card-treino-hoje';

/** Atalho de navegação exibido na tela de início. */
interface Atalho {
  href: string;
  label: string;
  icon: typeof Dumbbell;
}

const ATALHOS: Atalho[] = [
  { href: '/aluno/treinos', label: 'Treinos', icon: Activity },
  { href: '/aluno/dieta', label: 'Dieta', icon: Utensils },
  { href: '/aluno/evolucao', label: 'Evolução', icon: BarChart3 },
  { href: '/aluno/conquistas', label: 'Conquistas', icon: Trophy },
];

/** Extrai o nome do exercício de um join `exercises` (array ou objeto). */
function nomeExercicio(exercises: unknown): string {
  const e = Array.isArray(exercises) ? exercises[0] : exercises;
  const nome = (e as { name: string | null } | null)?.name;
  return nome?.trim() || 'Exercício';
}

/**
 * Tela de início do aluno. Mostra o treino do dia (ficha liberada + itens do
 * weekday atual), atalhos para treinos/dieta/evolução e um resumo rápido da
 * última avaliação. Leitura via RSC sob RLS; o gate de papel já é feito no
 * layout da área (não repetir aqui).
 */
export default async function AlunoHomePage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    redirect('/login');
  }

  const supabase = await createClient();
  const weekday = weekdayAtual();

  const [fichaRes, avaliacaoRes] = await Promise.all([
    // Ficha liberada mais recente do aluno + itens (RLS garante posse e released).
    supabase
      .from('workout_plans')
      .select(
        'id, name, status, workout_plan_items(id, weekday, order_index, sets, reps, exercises(name))'
      )
      .eq('status', 'released')
      .order('released_at', { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle(),
    // Última avaliação física (para o resumo "há N dias").
    supabase
      .from('physical_assessments')
      .select('assessed_at')
      .order('assessed_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (fichaRes.error || avaliacaoRes.error) {
    return (
      <section className="mx-auto w-full max-w-2xl space-y-6">
        <PageHeader nome={sessionUser.fullName} />
        <ErrorState
          title="Não foi possível carregar seu início"
          description="Ocorreu um erro ao buscar seus dados. Atualize a página para tentar novamente."
        />
      </section>
    );
  }

  const ficha = fichaRes.data;
  const itens = ficha?.workout_plan_items ?? [];
  const exerciciosHoje: ExercicioHoje[] = itens
    .filter((item) => item.weekday === weekday)
    .sort((a, b) => a.order_index - b.order_index)
    .map((item) => ({
      id: item.id,
      nome: nomeExercicio(item.exercises),
      sets: item.sets,
      reps: item.reps,
    }));

  const diasUltimaAvaliacao = diasDesde(avaliacaoRes.data?.assessed_at ?? null);

  return (
    <section className="mx-auto w-full max-w-2xl space-y-6">
      <PageHeader nome={sessionUser.fullName} />

      {ficha ? (
        <CardTreinoHoje
          fichaNome={ficha.name}
          diaLabel={WEEKDAY_LABEL[weekday]}
          exercicios={exerciciosHoje}
        />
      ) : (
        <EmptyState
          icon={Dumbbell}
          title="Nenhum treino liberado ainda"
          description="Quando seu professor liberar uma ficha, ela aparece aqui com o treino do dia."
        />
      )}

      <nav aria-label="Atalhos" className="grid grid-cols-2 gap-3">
        {ATALHOS.map(({ href, label, icon: Icon }) => (
          <Button
            key={href}
            asChild
            variant="outline"
            className="min-h-11 h-auto flex-col gap-2 py-4"
          >
            <Link href={href}>
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span className="text-sm">{label}</span>
            </Link>
          </Button>
        ))}
      </nav>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Resumo rápido</CardTitle>
          <CardDescription>Sua avaliação física mais recente.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {diasUltimaAvaliacao === null
              ? 'Você ainda não tem avaliações registradas.'
              : diasUltimaAvaliacao === 0
                ? 'Última avaliação registrada hoje.'
                : `Última avaliação há ${diasUltimaAvaliacao} ${
                    diasUltimaAvaliacao === 1 ? 'dia' : 'dias'
                  }.`}
          </p>
          <Button asChild variant="outline" className="min-h-11 w-full">
            <Link href="/aluno/avaliacoes">Ver avaliações</Link>
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}

/** Cabeçalho da tela de início (reusado no caminho de erro). */
function PageHeader({ nome }: { nome: string | null }) {
  const primeiroNome = nome?.trim().split(/\s+/)[0];
  return (
    <header className="space-y-1">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        {primeiroNome ? `Olá, ${primeiroNome}` : 'Olá'}
      </h1>
      <p className="text-sm text-muted-foreground">
        Seu treino de hoje, atalhos e o resumo da sua evolução.
      </p>
    </header>
  );
}
