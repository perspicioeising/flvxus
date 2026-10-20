import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { FichaForm, type AlunoOpcao } from '@/components/professor/treinos/ficha-form';
import type { ExercicioDisponivel } from '@/components/professor/treinos/exercise-picker';

/**
 * Criação de FICHA do zero. Carrega a lista de alunos (RLS: só os do professor)
 * e a biblioteca de exercícios para o editor de itens.
 */
export default async function NovaFichaPage() {
  const supabase = await createClient();

  const [{ data: alunosData }, { data: exerciciosData }] = await Promise.all([
    supabase
      .from('profiles')
      .select('user_id, full_name')
      .eq('role', 'student')
      .order('full_name', { ascending: true }),
    supabase.from('exercises').select('id, name, muscle_groups').order('name', { ascending: true }),
  ]);

  const alunos: AlunoOpcao[] = alunosData ?? [];
  const exercicios: ExercicioDisponivel[] = exerciciosData ?? [];

  return (
    <section className="mx-auto w-full max-w-2xl space-y-6">
      <div>
        <Link
          href="/professor/treinos"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Voltar para treinos
        </Link>
      </div>

      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Nova ficha</h1>
        <p className="text-sm text-muted-foreground">
          Monte uma ficha de treino para um aluno. Ela nasce como rascunho e só fica
          visível ao aluno quando você a libera.
        </p>
      </header>

      <FichaForm modo="criar" exercicios={exercicios} alunos={alunos} />
    </section>
  );
}
