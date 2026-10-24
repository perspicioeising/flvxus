import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { ModeloForm } from '@/components/professor/treinos/modelo-form';
import type { ExercicioDisponivel } from '@/components/professor/treinos/exercise-picker';

/**
 * Criação de MODELO de treino. Carrega a biblioteca de exercícios (RLS entrega
 * catálogo global + do tenant) para o seletor do editor de itens.
 */
export default async function NovoModeloPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from('exercises')
    .select('id, name, muscle_groups')
    .order('name', { ascending: true });

  const exercicios: ExercicioDisponivel[] = data ?? [];

  return (
    <section className="mx-auto w-full max-w-2xl space-y-6">
      <div>
        <Link
          href="/professor/modelos-treino"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Voltar para modelos
        </Link>
      </div>

      <header className="space-y-1">
        <h1 className="text-3xl font-black uppercase tracking-tight text-foreground md:text-4xl">Novo modelo</h1>
        <p className="text-sm text-muted-foreground">
          Monte uma rotina reutilizável adicionando exercícios da sua biblioteca.
        </p>
      </header>

      <ModeloForm modo="criar" exercicios={exercicios} />
    </section>
  );
}
