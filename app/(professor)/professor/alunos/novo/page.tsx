import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

import { convidarAluno, type EstadoAcao } from '@/actions/alunos';
import { AlunoForm } from '@/components/professor/alunos/aluno-form';

/**
 * Convite de aluno. O form client valida com `criarAlunoSchema` e chama a
 * Server Action `convidarAluno` (service_role, §4.4) via wrapper abaixo.
 */
export default function NovoAlunoPage() {
  async function action(formData: FormData): Promise<EstadoAcao> {
    'use server';
    return convidarAluno(undefined, formData);
  }

  return (
    <section className="mx-auto w-full max-w-2xl space-y-6">
      <div>
        <Link
          href="/professor/alunos"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Voltar para alunos
        </Link>
      </div>

      <header className="space-y-1">
        <h1 className="text-3xl font-black uppercase tracking-tight text-foreground md:text-4xl">Convidar aluno</h1>
        <p className="text-sm text-muted-foreground">
          Enviaremos um convite por e-mail. O aluno aparece como pendente até aceitar.
        </p>
      </header>

      <AlunoForm
        modo="criar"
        onSubmitAction={action}
        redirecionarPara="/professor/alunos"
      />
    </section>
  );
}
