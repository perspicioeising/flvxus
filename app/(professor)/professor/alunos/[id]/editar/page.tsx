import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { editarAluno, type EstadoAcao } from '@/actions/alunos';
import { AlunoForm } from '@/components/professor/alunos/aluno-form';

/**
 * Edição de aluno. Carrega os dados via RSC (RLS) e submete via Server Action
 * `editarAluno` ligada ao id do aluno.
 */
export default async function EditarAlunoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: aluno, error } = await supabase
    .from('profiles')
    .select('user_id, full_name, email, phone, birth_date, gender, height_cm, experience_level, goal')
    .eq('user_id', id)
    .eq('role', 'student')
    .single();

  if (error || !aluno) {
    notFound();
  }

  async function action(formData: FormData): Promise<EstadoAcao> {
    'use server';
    return editarAluno(id, undefined, formData);
  }

  return (
    <section className="mx-auto w-full max-w-2xl space-y-6">
      <div>
        <Link
          href={`/professor/alunos/${id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Voltar para a ficha
        </Link>
      </div>

      <header className="space-y-1">
        <h1 className="text-3xl font-black uppercase tracking-tight text-foreground md:text-4xl">Editar aluno</h1>
        <p className="text-sm text-muted-foreground">Atualize os dados cadastrais do aluno.</p>
      </header>

      <AlunoForm
        modo="editar"
        onSubmitAction={action}
        redirecionarPara={`/professor/alunos/${id}`}
        valoresIniciais={{
          full_name: aluno.full_name ?? '',
          email: aluno.email ?? '',
          phone: aluno.phone ?? '',
          birth_date: aluno.birth_date ?? '',
          gender: aluno.gender ?? '',
          height_cm: aluno.height_cm != null ? String(aluno.height_cm) : '',
          experience_level: aluno.experience_level ?? '',
          goal: aluno.goal ?? '',
        }}
      />
    </section>
  );
}
