import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { criarAvaliacao, uploadFotoAvaliacao, type EstadoAcao } from '@/actions/avaliacoes';
import { AvaliacaoForm } from '@/components/professor/avaliacoes/avaliacao-form';

type SearchParams = Record<string, string | string[] | undefined>;

/**
 * Nova avaliação física (form multi-etapa). Carrega os alunos para o seletor.
 * Aceita `?aluno={id}` para pré-selecionar (ex.: criada a partir da ficha).
 */
export default async function NovaAvaliacaoPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const alunoFixo = Array.isArray(sp.aluno) ? sp.aluno[0] : sp.aluno;

  const supabase = await createClient();
  const { data: alunos } = await supabase
    .from('profiles')
    .select('user_id, full_name, email')
    .eq('role', 'student')
    .order('full_name', { ascending: true });

  async function action(formData: FormData): Promise<EstadoAcao> {
    'use server';
    return criarAvaliacao(undefined, formData);
  }

  // O id da avaliação recém-criada chega via FormData (`__assessmentId`),
  // preenchido pelo form após o submit que cria a avaliação.
  async function uploadFoto(formData: FormData): Promise<EstadoAcao> {
    'use server';
    const assessmentId = String(formData.get('__assessmentId') ?? '');
    return uploadFotoAvaliacao(assessmentId, undefined, formData);
  }

  return (
    <section className="mx-auto w-full max-w-3xl space-y-6">
      <div>
        <Link
          href="/professor/avaliacoes"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Voltar para avaliações
        </Link>
      </div>

      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Nova avaliação</h1>
        <p className="text-sm text-muted-foreground">
          Os cálculos de IMC, %gordura e massas são feitos no servidor conforme o protocolo.
        </p>
      </header>

      <AvaliacaoForm
        modo="criar"
        alunos={alunos ?? []}
        alunoFixo={alunoFixo}
        onSubmitAction={action}
        onUploadFoto={uploadFoto}
        redirecionarPara="/professor/avaliacoes"
      />
    </section>
  );
}
