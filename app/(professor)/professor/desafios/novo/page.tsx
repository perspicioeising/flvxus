import Link from 'next/link';

import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/patterns';
import {
  FormularioDesafio,
  type AlunoDesafioOpcao,
} from '@/components/professor/desafios/formulario-desafio';

/**
 * Criação de um DESAFIO da turma (RSC + formulário client). Carrega os alunos
 * do tenant (role='student') sob RLS para o multi-select e delega a criação à
 * Server Action `criarDesafioTurma` (que recheca o gate e valida no banco).
 *
 * O gate de rota (barrar o autônomo) vive em `layout.tsx` deste subtree.
 */
export default async function NovoDesafioPage() {
  const supabase = await createClient();

  const { data: alunosData } = await supabase
    .from('profiles')
    .select('user_id, full_name')
    .eq('role', 'student')
    .order('full_name', { ascending: true });

  const alunos: AlunoDesafioOpcao[] = (alunosData ?? []).map((a) => ({
    userId: a.user_id,
    nome: a.full_name ?? 'Aluno',
  }));

  return (
    <section className="mx-auto w-full max-w-2xl space-y-6">
      <PageHeader
        title="Novo desafio"
        subtitle="Escolha a duração, os alunos e descreva a meta e a recompensa."
        eyebrow={
          <Link href="/professor/desafios" className="font-medium underline">
            Voltar aos desafios
          </Link>
        }
      />

      <FormularioDesafio alunos={alunos} />
    </section>
  );
}
