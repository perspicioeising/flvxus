import Link from 'next/link';
import { Utensils } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { EmptyState, ErrorState } from '@/components/patterns';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatarData } from '@/lib/datas';
import { GerarDietaIa, type AlunoOpcao } from '@/components/professor/ia/gerar-dieta';
import { DietaStatusControl } from '@/components/professor/dietas/status-control';
import { STATUS_LABEL, STATUS_VARIANTE } from '@/components/professor/treinos/labels';
import type { PlanStatus } from '@/types/database.types';

/**
 * Tela de DIETAS do professor. Oferece a geração de dieta com IA
 * (rascunho → revisão → aprovação) e lista as dietas já materializadas do
 * tenant. Leitura via RSC sob RLS (só o tenant do professor).
 */
export default async function ProfessorDietasPage() {
  const supabase = await createClient();

  const [{ data: alunosData }, { data: dietasData, error }] = await Promise.all([
    supabase
      .from('profiles')
      .select('user_id, full_name')
      .eq('role', 'student')
      .order('full_name', { ascending: true }),
    supabase
      .from('diets')
      .select('id, status, target_kcal, created_at, profiles!diets_student_id_fkey(full_name)')
      .order('created_at', { ascending: false }),
  ]);

  const alunos: AlunoOpcao[] = alunosData ?? [];
  const dietas = (dietasData ?? []).map((d) => ({
    id: d.id,
    status: d.status as PlanStatus,
    targetKcal: d.target_kcal,
    createdAt: d.created_at,
    alunoNome:
      (d.profiles as unknown as { full_name: string | null } | null)?.full_name ?? null,
  }));

  return (
    <section className="mx-auto w-full max-w-4xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-4xl font-black uppercase leading-[0.95] tracking-tight text-foreground md:text-5xl">Dietas</h1>
        <p className="text-sm text-muted-foreground">
          Gere dietas com IA. Todo rascunho passa pela sua revisão e aprovação antes de
          virar uma dieta do aluno.
        </p>
      </header>

      <GerarDietaIa alunos={alunos} />

      <div className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">Dietas criadas</h2>
        {error ? (
          <ErrorState
            title="Não foi possível carregar as dietas"
            description="Ocorreu um erro ao buscar as dietas. Tente novamente."
          />
        ) : dietas.length === 0 ? (
          <EmptyState
            icon={Utensils}
            title="Nenhuma dieta ainda"
            description="Use a geração com IA acima para criar a primeira dieta de um aluno."
          />
        ) : (
          <ul className="space-y-3">
            {dietas.map((d) => (
              <li key={d.id}>
                <Card>
                  <CardContent className="space-y-4 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">
                          {d.alunoNome ?? 'Aluno'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatarData(d.createdAt)}
                          {d.targetKcal != null ? ` · ${d.targetKcal} kcal` : ''}
                        </p>
                      </div>
                      <Badge variant={STATUS_VARIANTE[d.status]}>{STATUS_LABEL[d.status]}</Badge>
                    </div>
                    <Link
                      href={`/professor/dietas/${d.id}`}
                      className="inline-flex min-h-11 items-center text-sm font-medium text-foreground underline"
                    >
                      Ver detalhes
                    </Link>
                    <DietaStatusControl dietId={d.id} statusAtual={d.status} />
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Precisa de um aluno?{' '}
        <Link href="/professor/alunos/novo" className="font-medium text-foreground underline">
          Cadastre um aluno
        </Link>
        .
      </p>
    </section>
  );
}
