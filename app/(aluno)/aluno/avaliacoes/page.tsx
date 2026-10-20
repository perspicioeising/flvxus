import Image from 'next/image';
import { HeartPulse, PersonStanding } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { signAssessmentPhoto } from '@/lib/storage';
import { formatarData } from '@/lib/datas';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { EmptyState, ErrorState } from '@/components/patterns';
import {
  AvaliacaoCard,
  type AvaliacaoResumo,
} from '@/components/aluno/avaliacoes/avaliacao-card';
import type { Tables } from '@/types/database.types';

/**
 * Avaliações do próprio aluno — somente leitura. Leitura via RSC sob RLS (o
 * aluno só vê as próprias linhas). As fotos de avaliação física vêm por URL
 * assinada de TTL curto (`signAssessmentPhoto`, bucket privado). LGPD adiado
 * por decisão de escopo: a exibição não depende mais de `photos_consent`.
 * Nenhum `service_role`.
 */
export default async function AlunoAvaliacoesPage() {
  const supabase = await createClient();

  const [fisicasRes, posturaisRes] = await Promise.all([
    supabase
      .from('physical_assessments')
      .select('*')
      .order('assessed_at', { ascending: false }),
    supabase
      .from('posture_assessments')
      .select('id, assessed_at, front_image_path, side_image_path, back_image_path, notes')
      .order('assessed_at', { ascending: false }),
  ]);

  if (fisicasRes.error || posturaisRes.error) {
    return (
      <section className="mx-auto w-full max-w-4xl space-y-6">
        <PageHeader />
        <ErrorState
          title="Não foi possível carregar suas avaliações"
          description="Ocorreu um erro ao buscar seus dados. Atualize a página para tentar novamente."
        />
      </section>
    );
  }

  const fisicas = fisicasRes.data ?? [];
  const posturais = posturaisRes.data ?? [];

  // Assina as fotos de todas as avaliações (LGPD adiado: sem gate de consentimento).
  const avaliacoes: AvaliacaoResumo[] = await Promise.all(
    fisicas.map(async (a) => {
      const measurements = (a.measurements as Record<string, unknown> | null) ?? {};
      const paths = Array.isArray(measurements.photos)
        ? (measurements.photos as string[])
        : [];
      const fotos = (
        await Promise.all(paths.map(async (p) => ({ path: p, url: await signAssessmentPhoto(p) })))
      ).filter((f): f is { path: string; url: string } => f.url != null);

      return {
        id: a.id,
        assessed_at: a.assessed_at,
        age: a.age,
        gender: a.gender,
        protocol: a.protocol,
        weight_kg: a.weight_kg,
        height_cm: a.height_cm,
        bmi: a.bmi,
        body_fat_pct: a.body_fat_pct,
        fat_mass_kg: a.fat_mass_kg,
        lean_mass_kg: a.lean_mass_kg,
        photos_consent: a.photos_consent,
        medidas: measurements,
        fotos,
      };
    })
  );

  const temConteudo = avaliacoes.length > 0 || posturais.length > 0;

  if (!temConteudo) {
    return (
      <section className="mx-auto w-full max-w-4xl space-y-6">
        <PageHeader />
        <EmptyState
          icon={HeartPulse}
          title="Nenhuma avaliação ainda"
          description="Quando seu professor registrar uma avaliação física ou postural, ela aparece aqui."
        />
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-4xl space-y-6">
      <PageHeader />

      {avaliacoes.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Avaliações físicas</h2>
          {avaliacoes.map((avaliacao) => (
            <AvaliacaoCard key={avaliacao.id} avaliacao={avaliacao} />
          ))}
        </div>
      ) : null}

      {posturais.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Avaliações posturais</h2>
          {posturais.map((p) => (
            <PosturalCard key={p.id} postural={p} />
          ))}
        </div>
      ) : null}
    </section>
  );
}

/** Card de uma avaliação postural: data, observações e fotos assinadas. */
async function PosturalCard({
  postural,
}: {
  postural: Pick<
    Tables<'posture_assessments'>,
    'id' | 'assessed_at' | 'front_image_path' | 'side_image_path' | 'back_image_path' | 'notes'
  >;
}) {
  const vistas: { rotulo: string; path: string }[] = [
    { rotulo: 'Frente', path: postural.front_image_path ?? '' },
    { rotulo: 'Lado', path: postural.side_image_path ?? '' },
    { rotulo: 'Costas', path: postural.back_image_path ?? '' },
  ].filter((v) => v.path.length > 0);

  const fotos = (
    await Promise.all(
      vistas.map(async (v) => ({ ...v, url: await signAssessmentPhoto(v.path) }))
    )
  ).filter((v): v is { rotulo: string; path: string; url: string } => v.url != null);

  return (
    <Card>
      <CardHeader className="p-4 pb-0">
        <CardTitle className="flex items-center gap-2 text-lg">
          <PersonStanding className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          {formatarData(postural.assessed_at)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-4">
        {postural.notes ? (
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">{postural.notes}</p>
        ) : null}
        {fotos.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma foto disponível.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {fotos.map((f) => (
              <li key={f.path} className="space-y-1">
                <div className="overflow-hidden rounded-lg border border-border">
                  <Image
                    src={f.url}
                    alt={`Avaliação postural — ${f.rotulo}`}
                    width={400}
                    height={400}
                    className="h-40 w-full object-cover"
                    unoptimized
                  />
                </div>
                <p className="text-center text-xs text-muted-foreground">{f.rotulo}</p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

/** Cabeçalho da tela de avaliações (reusado nos caminhos de erro/vazio). */
function PageHeader() {
  return (
    <header className="space-y-1">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Avaliações</h1>
      <p className="text-sm text-muted-foreground">
        Suas avaliações físicas e posturais registradas pelo professor.
      </p>
    </header>
  );
}
