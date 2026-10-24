import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { editarAvaliacao, uploadFotoAvaliacao, type EstadoAcao } from '@/actions/avaliacoes';
import {
  AvaliacaoForm,
  type AvaliacaoFormValues,
} from '@/components/professor/avaliacoes/avaliacao-form';

const CAMPOS_NUMERICOS = [
  'age',
  'weight_kg',
  'height_cm',
  'body_fat_pct',
  'neck_cm',
  'shoulder_cm',
  'chest_cm',
  'waist_cm',
  'abdomen_cm',
  'hip_cm',
  'left_arm_cm',
  'right_arm_cm',
  'left_thigh_cm',
  'right_thigh_cm',
  'left_calf_cm',
  'right_calf_cm',
  'left_flexed_arm_cm',
  'right_flexed_arm_cm',
  'left_forearm_cm',
  'right_forearm_cm',
  'left_mid_thigh_cm',
  'right_mid_thigh_cm',
  'left_distal_thigh_cm',
  'right_distal_thigh_cm',
  'skf_triceps',
  'skf_subscapular',
  'skf_chest',
  'skf_midaxillary',
  'skf_suprailiac',
  'skf_abdominal',
  'skf_thigh',
] as const;

/** Converte um valor numérico/null do banco em string para o form. */
function texto(valor: unknown): string {
  return valor == null ? '' : String(valor);
}

export default async function EditarAvaliacaoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: avaliacao, error } = await supabase
    .from('physical_assessments')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !avaliacao) {
    notFound();
  }

  const { data: alunos } = await supabase
    .from('profiles')
    .select('user_id, full_name, email')
    .eq('role', 'student')
    .order('full_name', { ascending: true });

  const registro = avaliacao as Record<string, unknown>;
  const measurements = (registro.measurements as Record<string, unknown> | null) ?? {};
  const anamnese =
    registro.anamnesis && typeof registro.anamnesis === 'object'
      ? ((registro.anamnesis as Record<string, unknown>).texto as string | undefined)
      : undefined;

  const valoresIniciais: Partial<AvaliacaoFormValues> = {
    student_id: texto(registro.student_id),
    protocol: texto(registro.protocol),
    gender: texto(registro.gender),
    goal: texto(registro.goal),
    anamnesis: anamnese ?? '',
    assessed_at:
      typeof registro.assessed_at === 'string' ? registro.assessed_at.slice(0, 10) : '',
    photos_consent: registro.photos_consent ? 'true' : 'false',
  };
  for (const campo of CAMPOS_NUMERICOS) {
    valoresIniciais[campo] = texto(registro[campo]);
  }
  // Dobra bíceps vive em measurements.
  valoresIniciais.skf_biceps = texto(measurements.skf_biceps);

  async function action(formData: FormData): Promise<EstadoAcao> {
    'use server';
    return editarAvaliacao(id, undefined, formData);
  }

  async function uploadFoto(formData: FormData): Promise<EstadoAcao> {
    'use server';
    return uploadFotoAvaliacao(id, undefined, formData);
  }

  return (
    <section className="mx-auto w-full max-w-3xl space-y-6">
      <div>
        <Link
          href={`/professor/avaliacoes/${id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Voltar para a avaliação
        </Link>
      </div>

      <header className="space-y-1">
        <h1 className="text-3xl font-black uppercase tracking-tight text-foreground md:text-4xl">Editar avaliação</h1>
        <p className="text-sm text-muted-foreground">
          Alterações recalculam os valores derivados no servidor.
        </p>
      </header>

      <AvaliacaoForm
        modo="editar"
        alunos={alunos ?? []}
        valoresIniciais={valoresIniciais}
        onSubmitAction={action}
        onUploadFoto={uploadFoto}
        redirecionarPara={`/professor/avaliacoes/${id}`}
      />
    </section>
  );
}
