import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ChevronLeft, LineChart, Pencil } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { signAssessmentPhoto } from '@/lib/storage';
import { uploadFotoAvaliacao, type EstadoAcao } from '@/actions/avaliacoes';
import { formatarData } from '@/lib/datas';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/patterns';
import { AnalisarAvaliacaoIa } from '@/components/professor/ia/analisar-avaliacao';
import { ComposicaoGrafico } from '@/components/professor/avaliacoes/composicao-grafico';
import { MedidasVisual } from '@/components/professor/avaliacoes/medidas-visual';
import { UploadFotos } from '@/components/professor/avaliacoes/upload-fotos';
import { EvolucaoGraficos } from '@/components/professor/avaliacoes/evolucao-graficos';
import { montarSerieEvolucao } from '@/components/professor/avaliacoes/evolucao-series';
import {
  CIRCUNFERENCIA_LABEL,
  DOBRA_LABEL,
  GENERO_LABEL,
  protocoloLabel,
} from '@/components/professor/avaliacoes/labels';
import { CIRCUNFERENCIAS } from '@/schemas/avaliacao';

const DOBRAS_COLUNA = [
  'skf_triceps',
  'skf_subscapular',
  'skf_chest',
  'skf_midaxillary',
  'skf_suprailiac',
  'skf_abdominal',
  'skf_thigh',
] as const;

export default async function DetalheAvaliacaoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Adaptador de upload: injeta o id da rota e reusa a action existente
  // (mesmo padrão de `[id]/editar/page.tsx`).
  async function uploadFoto(formData: FormData): Promise<EstadoAcao> {
    'use server';
    return uploadFotoAvaliacao(id, undefined, formData);
  }

  const { data: avaliacao, error } = await supabase
    .from('physical_assessments')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !avaliacao) {
    notFound();
  }

  // Nome do aluno + série de evolução (todas as avaliações do mesmo aluno).
  const [{ data: aluno }, { data: historico }] = await Promise.all([
    supabase
      .from('profiles')
      .select('user_id, full_name, email')
      .eq('user_id', avaliacao.student_id)
      .maybeSingle(),
    supabase
      .from('physical_assessments')
      .select('assessed_at, weight_kg, body_fat_pct, lean_mass_kg, waist_cm, hip_cm, abdomen_cm')
      .eq('student_id', avaliacao.student_id)
      .order('assessed_at', { ascending: true }),
  ]);

  const nomeAluno = aluno?.full_name ?? aluno?.email ?? 'Aluno';
  const serie = montarSerieEvolucao(historico ?? []);

  // Fotos: paths em `measurements.photos` → URLs assinadas de TTL curto.
  const measurements = (avaliacao.measurements as Record<string, unknown> | null) ?? {};
  const paths = Array.isArray(measurements.photos) ? (measurements.photos as string[]) : [];
  const fotos = (
    await Promise.all(
      paths.map(async (p) => ({ path: p, url: await signAssessmentPhoto(p) }))
    )
  ).filter((f): f is { path: string; url: string } => f.url != null);

  // Análise de IA já aprovada (materializada em physical_assessments), se houver.
  const aiAnalysisObj =
    avaliacao.ai_analysis && typeof avaliacao.ai_analysis === 'object'
      ? (avaliacao.ai_analysis as Record<string, unknown>)
      : null;
  const analiseTexto = typeof aiAnalysisObj?.analysis === 'string' ? aiAnalysisObj.analysis : null;
  const recomendacoes = Array.isArray(avaliacao.ai_recommendations)
    ? (avaliacao.ai_recommendations as Array<{ category?: string; text?: string; priority?: string }>)
    : [];

  const skfBiceps = typeof measurements.skf_biceps === 'number' ? (measurements.skf_biceps as number) : null;
  const anamneseTexto =
    avaliacao.anamnesis && typeof avaliacao.anamnesis === 'object'
      ? (avaliacao.anamnesis as Record<string, unknown>).texto
      : null;

  const dobras = DOBRAS_COLUNA.map((k) => ({
    rotulo: DOBRA_LABEL[k],
    valor: (avaliacao as Record<string, unknown>)[k] as number | null,
  }))
    .concat(skfBiceps != null ? [{ rotulo: DOBRA_LABEL.skf_biceps, valor: skfBiceps }] : [])
    .filter((d): d is { rotulo: string; valor: number } => d.valor != null);

  const circunferencias = CIRCUNFERENCIAS.map((k) => ({
    rotulo: CIRCUNFERENCIA_LABEL[k],
    valor: (avaliacao as Record<string, unknown>)[k] as number | null,
  })).filter((c): c is { rotulo: string; valor: number } => c.valor != null);

  return (
    <section className="mx-auto w-full max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/professor/avaliacoes"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Voltar para avaliações
        </Link>
        <Button asChild variant="outline" className="min-h-11">
          <Link href={`/professor/avaliacoes/${id}/editar`}>
            <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />
            Editar
          </Link>
        </Button>
      </div>

      {/* Resumo */}
      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl">{nomeAluno}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {formatarData(avaliacao.assessed_at)}
              {avaliacao.age != null ? ` · ${avaliacao.age} anos` : ''}
              {avaliacao.gender ? ` · ${GENERO_LABEL[avaliacao.gender as 'male' | 'female'] ?? avaliacao.gender}` : ''}
            </p>
          </div>
          <Badge variant="secondary">{protocoloLabel(avaliacao.protocol)}</Badge>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Dado rotulo="Peso" valor={avaliacao.weight_kg != null ? `${avaliacao.weight_kg} kg` : null} />
            <Dado rotulo="Altura" valor={avaliacao.height_cm != null ? `${avaliacao.height_cm} cm` : null} />
            <Dado rotulo="IMC" valor={avaliacao.bmi != null ? String(avaliacao.bmi) : null} />
            <Dado
              rotulo="% Gordura"
              valor={avaliacao.body_fat_pct != null ? `${avaliacao.body_fat_pct}%` : null}
            />
            <Dado
              rotulo="Massa gorda"
              valor={avaliacao.fat_mass_kg != null ? `${avaliacao.fat_mass_kg} kg` : null}
            />
            <Dado
              rotulo="Massa magra"
              valor={avaliacao.lean_mass_kg != null ? `${avaliacao.lean_mass_kg} kg` : null}
            />
          </dl>

          <div className="mt-6">
            <ComposicaoGrafico
              bmi={avaliacao.bmi}
              bodyFatPct={avaliacao.body_fat_pct}
              fatMassKg={avaliacao.fat_mass_kg}
              leanMassKg={avaliacao.lean_mass_kg}
              weightKg={avaliacao.weight_kg}
              gender={avaliacao.gender as 'male' | 'female' | null}
            />
          </div>

          <div className="mt-4 border-t border-border pt-4">
            <AnalisarAvaliacaoIa assessmentId={id} />
          </div>
        </CardContent>
      </Card>

      {/* Análise de IA aprovada */}
      {analiseTexto ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Análise com IA</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="whitespace-pre-wrap text-sm text-foreground">{analiseTexto}</p>
            {recomendacoes.length > 0 ? (
              <ul className="space-y-1">
                {recomendacoes.map((r, i) => (
                  <li key={`${r.category ?? 'rec'}-${i}`} className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{r.category}</span>
                    {r.priority ? ` (${r.priority})` : ''}: {r.text}
                  </li>
                ))}
              </ul>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {/* Dobras e circunferências */}
      {dobras.length > 0 || circunferencias.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Medidas</CardTitle>
          </CardHeader>
          <CardContent>
            <MedidasVisual dobras={dobras} circunferencias={circunferencias} />
          </CardContent>
        </Card>
      ) : null}

      {/* Anamnese */}
      {typeof anamneseTexto === 'string' && anamneseTexto.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Anamnese</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm text-foreground">{anamneseTexto}</p>
          </CardContent>
        </Card>
      ) : null}

      {/* Fotos (URLs assinadas) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Fotos</CardTitle>
        </CardHeader>
        <CardContent>
          {fotos.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma foto enviada.</p>
          ) : (
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {fotos.map((f) => (
                <li key={f.path} className="overflow-hidden rounded-lg border border-border">
                  <Image
                    src={f.url}
                    alt="Foto da avaliação física"
                    width={400}
                    height={400}
                    className="h-40 w-full object-cover"
                    unoptimized
                  />
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4">
            <UploadFotos onUploadFoto={uploadFoto} />
          </div>
        </CardContent>
      </Card>

      {/* Evolução */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <LineChart className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            Evolução do aluno
          </CardTitle>
        </CardHeader>
        <CardContent>
          {serie.length <= 1 ? (
            <EmptyState
              icon={LineChart}
              title="Evolução indisponível"
              description="Registre mais avaliações deste aluno para visualizar a evolução."
            />
          ) : (
            <EvolucaoGraficos serie={serie} />
          )}
        </CardContent>
      </Card>
    </section>
  );
}

function Dado({ rotulo, valor }: { rotulo: string; valor: string | null | undefined }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{rotulo}</dt>
      <dd className="text-sm font-medium text-foreground">{valor ? valor : '—'}</dd>
    </div>
  );
}
