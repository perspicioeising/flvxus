'use server';

import { revalidatePath } from 'next/cache';

import { getSessionUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { uploadAssessmentPhoto } from '@/lib/storage';
import { calcularComposicao, type ProtocoloCalculo } from '@/lib/assessment';
import {
  criarAvaliacaoSchema,
  editarAvaliacaoSchema,
  CIRCUNFERENCIAS,
  DOBRAS_COM_COLUNA,
  type CriarAvaliacaoInput,
} from '@/schemas/avaliacao';
import type { EstadoAcao } from '@/actions/alunos';

/**
 * Server Actions do domínio de avaliação física (architecture.md §4).
 *
 * MUTAÇÃO NORMAL via `createClient()` (RLS ativo): nunca filtramos `tenant_id`
 * manualmente. Os CÁLCULOS (bmi/%gordura/massas) são feitos NO SERVIDOR via
 * `lib/assessment` — o cliente nunca grava esses valores derivados. Fotos vão
 * para o bucket PRIVADO `assessment-photos` e só se `photos_consent=true`
 * (LGPD, ADR 0005).
 */

export type { EstadoAcao } from '@/actions/alunos';

/** Converte os erros do Zod num mapa `campo -> primeira mensagem`. */
function erroDeCampo(flatten: {
  fieldErrors: Record<string, string[] | undefined>;
}): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [campo, mensagens] of Object.entries(flatten.fieldErrors)) {
    if (mensagens && mensagens.length > 0) {
      out[campo] = mensagens[0];
    }
  }
  return out;
}

/**
 * Monta a linha de `physical_assessments` a partir dos dados validados, já com
 * os cálculos derivados feitos no servidor. `skf_biceps` não tem coluna própria
 * no schema v2 (ver docs/pendencias.md): é preservada em `measurements` jsonb.
 */
function linhaAvaliacao(
  dados: CriarAvaliacaoInput,
  professor: { userId: string; tenantId: string },
  measurementsExistentes?: Record<string, unknown> | null
) {
  const composicao = calcularComposicao({
    protocol: dados.protocol as ProtocoloCalculo,
    genero: (dados.gender ?? 'male') as 'male' | 'female',
    idade: dados.age ?? null,
    pesoKg: dados.weight_kg ?? null,
    alturaCm: dados.height_cm ?? null,
    bodyFatPctManual: dados.body_fat_pct ?? null,
    dobras: {
      chest: dados.skf_chest ?? null,
      midaxillary: dados.skf_midaxillary ?? null,
      triceps: dados.skf_triceps ?? null,
      subscapular: dados.skf_subscapular ?? null,
      abdominal: dados.skf_abdominal ?? null,
      suprailiac: dados.skf_suprailiac ?? null,
      thigh: dados.skf_thigh ?? null,
      biceps: dados.skf_biceps ?? null,
    },
  });

  const linha: Record<string, unknown> = {
    student_id: dados.student_id,
    trainer_id: professor.userId,
    tenant_id: professor.tenantId,
    protocol: dados.protocol,
    age: dados.age ?? null,
    gender: dados.gender ?? null,
    weight_kg: dados.weight_kg ?? null,
    height_cm: dados.height_cm ?? null,
    goal: dados.goal ?? null,
    photos_consent: dados.photos_consent,
    bmi: arredonda(composicao.bmi, 2),
    body_fat_pct: arredonda(composicao.bodyFatPct, 2),
    fat_mass_kg: arredonda(composicao.fatMassKg, 2),
    lean_mass_kg: arredonda(composicao.leanMassKg, 2),
    // O produto trata massa magra como massa muscular estimada; persistimos o
    // mesmo valor em `muscle_mass_kg` para que a coluna não fique sempre nula
    // (nenhum protocolo atual estima massa muscular separada).
    muscle_mass_kg: arredonda(composicao.leanMassKg, 2),
  };

  if (dados.assessed_at) {
    linha.assessed_at = dados.assessed_at;
  }
  if (dados.anamnesis) {
    linha.anamnesis = { texto: dados.anamnesis };
  }

  // Circunferências com coluna dedicada.
  for (const campo of CIRCUNFERENCIAS) {
    linha[campo] = (dados[campo] as number | undefined) ?? null;
  }
  // Dobras com coluna dedicada.
  for (const campo of DOBRAS_COM_COLUNA) {
    linha[campo] = (dados[campo] as number | undefined) ?? null;
  }

  // `measurements` jsonb guarda o que não tem coluna: dobra bíceps (Durnin).
  // Mesclamos com o measurements existente (na edição) para PRESERVAR as fotos
  // gravadas em `measurements.photos` — antes a edição sobrescrevia o objeto e
  // apagava as fotos.
  const extras: Record<string, unknown> = { ...(measurementsExistentes ?? {}) };
  if (typeof dados.skf_biceps === 'number') {
    extras.skf_biceps = dados.skf_biceps;
  } else {
    // Protocolo sem bíceps: remove uma dobra residual de uma edição anterior.
    delete extras.skf_biceps;
  }
  linha.measurements = extras;

  return linha;
}

/** Arredonda mantendo `null`; evita gravar dízimas longas. */
function arredonda(valor: number | null, casas: number): number | null {
  if (valor == null) return null;
  const f = 10 ** casas;
  return Math.round(valor * f) / f;
}

/**
 * Cria uma avaliação física. Valida com `criarAvaliacaoSchema`, calcula a
 * composição corporal no servidor e grava via RLS. Retorna o id criado.
 */
export async function criarAvaliacao(
  _prev: EstadoAcao | undefined,
  formData: FormData
): Promise<EstadoAcao> {
  const professor = await getSessionUser();
  if (!professor || professor.role !== 'trainer') {
    return { ok: false, message: 'Apenas o professor pode registrar avaliações.' };
  }

  const parsed = criarAvaliacaoSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      ok: false,
      message: 'Verifique os campos destacados.',
      fieldErrors: erroDeCampo(parsed.error.flatten()),
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('physical_assessments')
    .insert(linhaAvaliacao(parsed.data, professor))
    .select('id')
    .single();

  if (error || !data) {
    return {
      ok: false,
      message: `Não foi possível salvar a avaliação: ${error?.message ?? 'erro desconhecido'}`,
    };
  }

  revalidatePath('/professor/avaliacoes');
  revalidatePath(`/professor/alunos/${parsed.data.student_id}`);

  return { ok: true, message: 'Avaliação registrada.', id: data.id };
}

/**
 * Edita uma avaliação existente. Recalcula a composição no servidor e atualiza
 * via RLS (o professor só altera avaliações do próprio tenant).
 */
export async function editarAvaliacao(
  assessmentId: string,
  _prev: EstadoAcao | undefined,
  formData: FormData
): Promise<EstadoAcao> {
  const professor = await getSessionUser();
  if (!professor || professor.role !== 'trainer') {
    return { ok: false, message: 'Apenas o professor pode editar avaliações.' };
  }

  const parsed = editarAvaliacaoSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      ok: false,
      message: 'Verifique os campos destacados.',
      fieldErrors: erroDeCampo(parsed.error.flatten()),
    };
  }

  const supabase = await createClient();

  // Lê o measurements atual (via RLS) para preservar o que não vem do form —
  // especialmente `measurements.photos`.
  const { data: atual } = await supabase
    .from('physical_assessments')
    .select('measurements')
    .eq('id', assessmentId)
    .maybeSingle();

  const linha = linhaAvaliacao(
    parsed.data,
    professor,
    (atual?.measurements as Record<string, unknown> | null) ?? null
  );
  // Não reescrevemos trainer_id/tenant_id na edição (RLS garante a posse).
  delete linha.trainer_id;
  delete linha.tenant_id;

  const { error } = await supabase
    .from('physical_assessments')
    .update(linha)
    .eq('id', assessmentId);

  if (error) {
    return { ok: false, message: `Não foi possível salvar: ${error.message}` };
  }

  revalidatePath('/professor/avaliacoes');
  revalidatePath(`/professor/avaliacoes/${assessmentId}`);
  revalidatePath(`/professor/alunos/${parsed.data.student_id}`);

  return { ok: true, message: 'Avaliação atualizada.', id: assessmentId };
}

/**
 * Faz upload de uma foto de avaliação no bucket privado. SÓ é permitido quando
 * a avaliação tem `photos_consent=true` (LGPD). Os paths são gravados em
 * `measurements.photos` para posterior assinatura (URL de TTL curto).
 */
export async function uploadFotoAvaliacao(
  assessmentId: string,
  _prev: EstadoAcao | undefined,
  formData: FormData
): Promise<EstadoAcao> {
  const professor = await getSessionUser();
  if (!professor || professor.role !== 'trainer') {
    return { ok: false, message: 'Apenas o professor pode enviar fotos.' };
  }

  const file = formData.get('foto');
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: 'Selecione um arquivo de imagem.' };
  }

  const supabase = await createClient();

  // Confere o consentimento e recupera o student_id (via RLS).
  const { data: avaliacao, error: erroLeitura } = await supabase
    .from('physical_assessments')
    .select('id, student_id, photos_consent, measurements')
    .eq('id', assessmentId)
    .single();

  if (erroLeitura || !avaliacao) {
    return { ok: false, message: 'Avaliação não encontrada.' };
  }

  if (!avaliacao.photos_consent) {
    return {
      ok: false,
      message: 'Upload recusado: o aluno não consentiu o armazenamento de fotos (LGPD).',
    };
  }

  let path: string;
  try {
    path = await uploadAssessmentPhoto({
      tenantId: professor.tenantId,
      studentId: avaliacao.student_id,
      assessmentId: avaliacao.id,
      file,
    });
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : 'Falha ao enviar a foto.',
    };
  }

  // Acrescenta o path à lista de fotos em `measurements` jsonb.
  const measurements =
    (avaliacao.measurements as Record<string, unknown> | null) ?? {};
  const fotosAtuais = Array.isArray(measurements.photos)
    ? (measurements.photos as string[])
    : [];
  const novasFotos = Array.from(new Set([...fotosAtuais, path]));

  const { error: erroUpdate } = await supabase
    .from('physical_assessments')
    .update({ measurements: { ...measurements, photos: novasFotos } })
    .eq('id', assessmentId);

  if (erroUpdate) {
    return { ok: false, message: `Foto enviada, mas falhou ao registrar: ${erroUpdate.message}` };
  }

  revalidatePath(`/professor/avaliacoes/${assessmentId}`);

  return { ok: true, message: 'Foto enviada.', id: path };
}
