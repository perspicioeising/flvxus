import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  HeartPulse,
  Pencil,
  Utensils,
} from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { diasDesde, formatarData } from '@/lib/datas';
import { normalizarPagina, normalizarTamanho } from '@/lib/paginacao';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { EmptyState, PageContainer, StatusBadge } from '@/components/patterns';
import type { StatusTone } from '@/components/patterns';
import {
  EXPERIENCIA_LABEL,
  OBJETIVO_LABEL,
  statusLabel,
} from '@/components/professor/alunos/labels';
import { StudentStatusActions } from '@/components/professor/alunos/student-status-actions';
import { ResendInviteButton } from '@/components/professor/alunos/resend-invite-button';
import { SecaoEvolucao } from '@/components/professor/alunos/secao-evolucao';
import { SecaoHistorico } from '@/components/professor/alunos/secao-historico';
import { AtalhosAluno } from '@/components/professor/alunos/atalhos-aluno';
import type {
  ExperienceLevel,
  GoalType,
  PlanStatus,
  StudentStatus,
} from '@/types/database.types';

/** Rótulos pt-BR do status de plano (treino/dieta). */
const PLAN_STATUS_LABEL: Record<PlanStatus, string> = {
  draft: 'Rascunho',
  pending_review: 'Em revisão',
  approved: 'Aprovado',
  released: 'Liberado',
  archived: 'Arquivado',
};

/** Tom do selo de status do aluno no novo padrão visual. */
function statusTone(status: StudentStatus | null): StatusTone {
  switch (status) {
    case 'active':
      return 'brand';
    case 'pending':
      return 'warning';
    case 'inactive':
    case 'archived':
      return 'neutral';
    default:
      return 'neutral';
  }
}

/** Tom do selo de status de plano (treino/dieta). */
function planTone(status: PlanStatus): StatusTone {
  return status === 'released' ? 'brand' : 'neutral';
}

function iniciais(nome: string | null, email: string | null): string {
  const base = (nome ?? email ?? '?').trim();
  const partes = base.split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '?';
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

export default async function FichaAlunoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  // Paginação DEDICADA do histórico (prefixo `hist_`), isolada dos demais
  // paginadores da página.
  const histPage = normalizarPagina(
    Array.isArray(sp.hist_page) ? sp.hist_page[0] : sp.hist_page
  );
  const histSize = normalizarTamanho(
    Array.isArray(sp.hist_size) ? sp.hist_size[0] : sp.hist_size
  );
  const supabase = await createClient();

  const { data: aluno, error } = await supabase
    .from('profiles')
    .select(
      'user_id, full_name, email, phone, avatar_url, birth_date, gender, height_cm, status, experience_level, goal'
    )
    .eq('user_id', id)
    .eq('role', 'student')
    .single();

  if (error || !aluno) {
    notFound();
  }

  // Seções da ficha 360 — consultas via RLS (paralelas).
  const [avaliacaoRes, treinosRes, dietasRes] = await Promise.all([
    supabase
      .from('physical_assessments')
      .select('id, assessed_at, weight_kg, bmi, body_fat_pct')
      .eq('student_id', id)
      .order('assessed_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('workout_plans')
      .select('id, name, status, released_at')
      .eq('student_id', id)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('diets')
      .select('id, status, target_kcal, goal')
      .eq('student_id', id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const avaliacao = avaliacaoRes.data;
  const treinos = treinosRes.data ?? [];
  const dieta = dietasRes.data;
  const nome = aluno.full_name ?? 'Aluno sem nome';
  const dias = diasDesde(avaliacao?.assessed_at);

  return (
    <PageContainer width="wide">
      <div>
        <Link
          href="/professor/alunos"
          className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Voltar para alunos
        </Link>
      </div>

      {/* Cabeçalho com dados do aluno */}
      <Card className="rounded-2xl">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 ring-2 ring-primary/20">
              {aluno.avatar_url ? <AvatarImage src={aluno.avatar_url} alt="" /> : null}
              <AvatarFallback className="text-lg font-bold">
                {iniciais(aluno.full_name, aluno.email)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 space-y-2">
              <h1 className="text-3xl font-black uppercase leading-[0.95] tracking-tight text-foreground md:text-4xl">
                {nome}
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge tone={statusTone(aluno.status)}>
                  {statusLabel(aluno.status)}
                </StatusBadge>
                {aluno.email ? (
                  <span className="truncate text-sm text-muted-foreground">{aluno.email}</span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
            {aluno.status === 'pending' ? <ResendInviteButton userId={id} /> : null}
            <Button asChild variant="outline" className="min-h-11">
              <Link href={`/professor/alunos/${id}/editar`}>
                <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />
                Editar
              </Link>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {aluno.status === 'pending' ? (
            <p className="rounded-xl border border-border bg-muted/50 p-3 text-sm text-muted-foreground">
              Convite enviado. Este aluno ainda não definiu a senha nem ativou a conta.
              Use <span className="font-medium text-foreground">Reenviar convite</span> se ele
              não recebeu ou o link expirou.
            </p>
          ) : null}
          <div>
            <p className="mb-2 text-sm font-semibold text-foreground">Alterar status</p>
            <StudentStatusActions userId={id} statusAtual={aluno.status} />
          </div>
        </CardContent>
      </Card>

      {/* Hub de atalhos — navegação rápida para as funcionalidades do aluno */}
      <AtalhosAluno
        alunoId={id}
        fichasLiberadas={treinos
          .filter((t) => t.status === 'released')
          .map((t) => ({ id: t.id, name: t.name }))}
      />

      {/* Treinos */}
      <Card id="treinos" className="scroll-mt-20 rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-extrabold">
            <Dumbbell className="h-5 w-5 text-primary" aria-hidden="true" />
            Treinos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {treinos.length > 0 ? (
            <ul className="space-y-2">
              {treinos.map((plano) => (
                <li key={plano.id}>
                  <Link
                    href={`/professor/treinos/${plano.id}`}
                    className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="min-w-0 flex-1 truncate font-semibold text-foreground">
                      {plano.name}
                    </span>
                    <StatusBadge tone={planTone(plano.status as PlanStatus)}>
                      {PLAN_STATUS_LABEL[plano.status as PlanStatus]}
                    </StatusBadge>
                    <ChevronRight
                      className="h-5 w-5 shrink-0 text-muted-foreground"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={Dumbbell}
              title="Sem fichas de treino"
              description="As fichas montadas para este aluno aparecerão aqui."
            />
          )}
        </CardContent>
      </Card>

      {/* Evolução (progressão de carga, volume, frequência, alertas e composição) */}
      <div id="evolucao" className="scroll-mt-20">
        <SecaoEvolucao studentId={id} />
      </div>

      {/* Histórico de sessões concluídas (visibilidade herdada do cadastro) */}
      <SecaoHistorico studentId={id} page={histPage} pageSize={histSize} />

      {/* Demais informações do aluno — recolhíveis num acordeon */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg font-extrabold">Demais informações</CardTitle>
          <CardDescription>
            Dados cadastrais, última avaliação e dieta do aluno.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full">
            {/* Dados cadastrais */}
            <AccordionItem value="cadastrais">
              <AccordionTrigger>Dados cadastrais</AccordionTrigger>
              <AccordionContent>
                <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <Dado rotulo="Telefone" valor={aluno.phone} />
                  <Dado rotulo="Nascimento" valor={formatarData(aluno.birth_date)} />
                  <Dado rotulo="Gênero" valor={aluno.gender} />
                  <Dado
                    rotulo="Altura"
                    valor={aluno.height_cm != null ? `${aluno.height_cm} cm` : null}
                  />
                  <Dado
                    rotulo="Experiência"
                    valor={
                      aluno.experience_level
                        ? EXPERIENCIA_LABEL[aluno.experience_level as ExperienceLevel]
                        : null
                    }
                  />
                  <Dado
                    rotulo="Objetivo"
                    valor={aluno.goal ? OBJETIVO_LABEL[aluno.goal as GoalType] : null}
                  />
                </dl>
              </AccordionContent>
            </AccordionItem>

            {/* Última avaliação */}
            <AccordionItem value="avaliacao">
              <AccordionTrigger>
                <span className="flex items-center gap-2">
                  <HeartPulse
                    className="h-5 w-5 text-muted-foreground"
                    aria-hidden="true"
                  />
                  Última avaliação
                </span>
              </AccordionTrigger>
              <AccordionContent>
                {avaliacao ? (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Realizada em {formatarData(avaliacao.assessed_at)}
                      {dias != null ? ` · há ${dias} dia(s)` : ''}
                    </p>
                    <dl className="grid grid-cols-3 gap-4">
                      <Dado
                        rotulo="Peso"
                        valor={
                          avaliacao.weight_kg != null ? `${avaliacao.weight_kg} kg` : null
                        }
                      />
                      <Dado
                        rotulo="IMC"
                        valor={avaliacao.bmi != null ? String(avaliacao.bmi) : null}
                      />
                      <Dado
                        rotulo="% Gordura"
                        valor={
                          avaliacao.body_fat_pct != null
                            ? `${avaliacao.body_fat_pct}%`
                            : null
                        }
                      />
                    </dl>
                  </div>
                ) : (
                  <EmptyState
                    icon={HeartPulse}
                    title="Sem avaliações ainda"
                    description="As avaliações físicas deste aluno aparecerão aqui."
                  />
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Dieta */}
            <AccordionItem value="dieta">
              <AccordionTrigger>
                <span className="flex items-center gap-2">
                  <Utensils
                    className="h-5 w-5 text-muted-foreground"
                    aria-hidden="true"
                  />
                  Dieta
                </span>
              </AccordionTrigger>
              <AccordionContent>
                {dieta ? (
                  <dl className="grid grid-cols-3 gap-4">
                    <Dado
                      rotulo="Status"
                      valor={PLAN_STATUS_LABEL[dieta.status as PlanStatus]}
                    />
                    <Dado
                      rotulo="Meta calórica"
                      valor={dieta.target_kcal != null ? `${dieta.target_kcal} kcal` : null}
                    />
                    <Dado
                      rotulo="Objetivo"
                      valor={dieta.goal ? OBJETIVO_LABEL[dieta.goal as GoalType] : null}
                    />
                  </dl>
                ) : (
                  <EmptyState
                    icon={Utensils}
                    title="Sem dieta cadastrada"
                    description="O plano alimentar deste aluno aparecerá aqui."
                  />
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </PageContainer>
  );
}

/** Par rótulo/valor da ficha, com fallback '—'. */
function Dado({ rotulo, valor }: { rotulo: string; valor: string | null | undefined }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{rotulo}</dt>
      <dd className="text-sm font-semibold text-foreground">{valor ? valor : '—'}</dd>
    </div>
  );
}
