import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

import { criarExercicio, type EstadoAcao } from '@/actions/exercicios';
import { ExerciseForm } from '@/components/professor/exercicios/exercise-form';

/**
 * Criação de exercício do tenant. O form client valida com `criarExercicioSchema`
 * e chama a Server Action `criarExercicio` via wrapper abaixo.
 */
export default function NovoExercicioPage() {
  async function action(formData: FormData): Promise<EstadoAcao> {
    'use server';
    return criarExercicio(undefined, formData);
  }

  return (
    <section className="mx-auto w-full max-w-2xl space-y-6">
      <div>
        <Link
          href="/professor/exercicios"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Voltar para exercícios
        </Link>
      </div>

      <header className="space-y-1">
        <h1 className="text-3xl font-black uppercase tracking-tight text-foreground md:text-4xl">Novo exercício</h1>
        <p className="text-sm text-muted-foreground">
          Cadastre um exercício da sua biblioteca. Vídeo e thumbnail são enviados depois.
        </p>
      </header>

      <ExerciseForm modo="criar" onSubmitAction={action} redirecionarPara="/professor/exercicios" />
    </section>
  );
}
