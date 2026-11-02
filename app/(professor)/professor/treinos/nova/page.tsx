import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

import { getSessionUser, isSelfManaged } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { FichaForm, type AlunoOpcao } from '@/components/professor/treinos/ficha-form';
import type { ExercicioDisponivel } from '@/components/professor/treinos/exercise-picker';

type SearchParams = Record<string, string | string[] | undefined>;

/**
 * Criação de FICHA do zero. Carrega a lista de alunos (RLS: só os do professor)
 * e a biblioteca de exercícios para o editor de itens.
 * Aceita `?aluno={id}` para pré-selecionar o aluno (ex.: criada a partir da
 * ficha do aluno / hub de atalhos).
 */
export default async function NovaFichaPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const alunoFixo = Array.isArray(sp.aluno) ? sp.aluno[0] : sp.aluno;

  // Aluno autônomo (self_managed): a ficha é SEMPRE para si — sem seletor.
  const user = await getSessionUser();
  const soloEu = user ? isSelfManaged(user) : false;

  const supabase = await createClient();

  const [{ data: alunosData }, { data: exerciciosData }] = await Promise.all([
    supabase
      .from('profiles')
      .select('user_id, full_name')
      .eq('role', 'student')
      .order('full_name', { ascending: true }),
    // RLS libera catálogo global (tenant_id IS NULL) + do tenant. O seletor
    // deve mostrar só os do tenant; os globais chegam pela ação "Importar da
    // biblioteca" (separada). Sem o filtro, cada exercício importado apareceria
    // 2x (global + cópia do tenant ligada por source_exercise_id).
    supabase
      .from('exercises')
      .select('id, name, muscle_groups')
      .not('tenant_id', 'is', null)
      .order('name', { ascending: true }),
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
        <h1 className="text-3xl font-black uppercase tracking-tight text-foreground md:text-4xl">
          {soloEu ? 'Novo treino' : 'Nova ficha'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {soloEu
            ? 'Monte seu treino. Assim que salvar, ele já fica pronto para você treinar.'
            : 'Monte uma ficha de treino para um aluno. Ela nasce como rascunho e só fica visível ao aluno quando você a libera.'}
        </p>
      </header>

      <FichaForm
        modo="criar"
        exercicios={exercicios}
        alunos={alunos}
        alunoInicial={
          soloEu
            ? user?.userId
            : alunoFixo && alunos.some((a) => a.user_id === alunoFixo)
              ? alunoFixo
              : undefined
        }
        ocultarSeletorAluno={soloEu}
      />
    </section>
  );
}
