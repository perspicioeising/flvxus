import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { ModeloForm } from '@/components/professor/treinos/modelo-form';
import type { ExercicioDisponivel } from '@/components/professor/treinos/exercise-picker';

/**
 * Criação de MODELO de treino. Carrega a biblioteca de exercícios para o
 * seletor do editor de itens. A RLS libera catálogo global (tenant_id IS NULL)
 * + do tenant, mas o seletor deve mostrar só os do tenant (`.not(tenant_id ...)`);
 * os globais chegam pela ação "Importar da biblioteca" (separada). Sem o filtro,
 * cada exercício importado apareceria 2x (global + cópia do tenant via
 * source_exercise_id).
 */
export default async function NovoModeloPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from('exercises')
    .select('id, name, muscle_groups')
    .not('tenant_id', 'is', null)
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
