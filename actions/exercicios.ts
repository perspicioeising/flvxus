'use server';

import { revalidatePath } from 'next/cache';

import { getSessionUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import {
  uploadExerciseMedia,
  type ExerciseMediaKind,
} from '@/lib/storage';
import {
  criarExercicioSchema,
  editarExercicioSchema,
  type CriarExercicioInput,
  type EditarExercicioInput,
} from '@/schemas/exercicio';

/**
 * Server Actions do domínio de exercícios (architecture.md §6.2).
 *
 * TODA leitura/mutação usa `createClient()` (RLS ativo) — nunca filtramos
 * `tenant_id` manualmente. As policies de `exercises`
 * (supabase/migrations/20261020090800_rls_policies.sql) já garantem:
 *   - SELECT: catálogo global (`tenant_id IS NULL`) + exercícios do tenant;
 *   - INSERT/UPDATE/DELETE: apenas o trainer, sempre no próprio tenant
 *     (nunca toca no catálogo global).
 * Por isso o INSERT precisa carimbar `tenant_id = professor.tenantId`
 * (o `with check` da policy exige), diferente das demais tabelas.
 */

/** Estado tipado retornado pelas actions para os forms. */
export interface EstadoAcao {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
  id?: string;
}

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

/** Monta o payload de `exercises` a partir dos dados validados. */
function exercicioDeDados(dados: CriarExercicioInput | EditarExercicioInput) {
  return {
    name: dados.name,
    muscle_groups: dados.muscle_groups,
    equipment: dados.equipment,
    instructions: dados.instructions ?? null,
    tips: dados.tips,
    common_errors: dados.common_errors,
    video_url: dados.video_url ?? null,
    thumbnail_url: dados.thumbnail_url ?? null,
  };
}

/**
 * Cria um exercício do tenant. Mutação via RLS (`createClient`): a policy exige
 * `tenant_id = app_tenant_id()` e `role = 'trainer'`, então carimbamos o
 * `tenant_id`/`created_by` do professor autenticado.
 */
export async function criarExercicio(
  _prev: EstadoAcao | undefined,
  formData: FormData
): Promise<EstadoAcao> {
  const professor = await getSessionUser();
  if (!professor || professor.role !== 'trainer') {
    return { ok: false, message: 'Apenas o professor pode criar exercícios.' };
  }

  const parsed = criarExercicioSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      ok: false,
      message: 'Verifique os campos destacados.',
      fieldErrors: erroDeCampo(parsed.error.flatten()),
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('exercises')
    .insert({
      ...exercicioDeDados(parsed.data),
      tenant_id: professor.tenantId,
      created_by: professor.userId,
    })
    .select('id')
    .single();

  if (error || !data) {
    return {
      ok: false,
      message: `Não foi possível criar o exercício: ${error?.message ?? 'erro desconhecido'}`,
    };
  }

  revalidatePath('/professor/exercicios');

  return { ok: true, message: 'Exercício criado.', id: data.id };
}

/**
 * Edita um exercício do tenant. Mutação via RLS: a policy impede alterar o
 * catálogo global ou exercícios de outro tenant.
 */
export async function editarExercicio(
  exerciseId: string,
  _prev: EstadoAcao | undefined,
  formData: FormData
): Promise<EstadoAcao> {
  const professor = await getSessionUser();
  if (!professor || professor.role !== 'trainer') {
    return { ok: false, message: 'Apenas o professor pode editar exercícios.' };
  }

  const parsed = editarExercicioSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      ok: false,
      message: 'Verifique os campos destacados.',
      fieldErrors: erroDeCampo(parsed.error.flatten()),
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('exercises')
    .update(exercicioDeDados(parsed.data))
    .eq('id', exerciseId);

  if (error) {
    return { ok: false, message: `Não foi possível salvar: ${error.message}` };
  }

  revalidatePath('/professor/exercicios');
  revalidatePath(`/professor/exercicios/${exerciseId}`);

  return { ok: true, message: 'Exercício atualizado.', id: exerciseId };
}

/**
 * Exclui um exercício do tenant. Mutação via RLS (não exclui o global). O banco
 * usa `on delete restrict` nas ligações de treino, então informamos o motivo
 * quando o exercício está em uso.
 */
export async function excluirExercicio(
  exerciseId: string
): Promise<EstadoAcao> {
  const professor = await getSessionUser();
  if (!professor || professor.role !== 'trainer') {
    return { ok: false, message: 'Apenas o professor pode excluir exercícios.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('exercises').delete().eq('id', exerciseId);

  if (error) {
    return {
      ok: false,
      message:
        'Não foi possível excluir. O exercício pode estar vinculado a treinos.',
    };
  }

  revalidatePath('/professor/exercicios');

  return { ok: true, message: 'Exercício excluído.', id: exerciseId };
}

export interface UploadMidiaResultado extends EstadoAcao {
  /** Path gravado no Storage (persistido em video_url/thumbnail_url). */
  path?: string;
}

/**
 * Faz upload de vídeo/thumbnail de um exercício do tenant para o bucket privado
 * `exercise-videos` (via `lib/storage`, sempre URL assinada depois) e grava o
 * `path` resultante em `video_url`/`thumbnail_url`. Recebe o `exerciseId` para
 * montar o path `{tenant_id}/{exercise_id}/...` conforme §7.
 */
export async function uploadMidiaExercicio(
  exerciseId: string,
  kind: ExerciseMediaKind,
  formData: FormData
): Promise<UploadMidiaResultado> {
  const professor = await getSessionUser();
  if (!professor || professor.role !== 'trainer') {
    return { ok: false, message: 'Apenas o professor pode enviar mídia.' };
  }

  const arquivo = formData.get('file');
  if (!(arquivo instanceof File) || arquivo.size === 0) {
    return { ok: false, message: 'Selecione um arquivo para enviar.' };
  }

  let path: string;
  try {
    path = await uploadExerciseMedia({
      tenantId: professor.tenantId,
      exerciseId,
      file: arquivo,
      kind,
    });
  } catch (erro) {
    return {
      ok: false,
      message: erro instanceof Error ? erro.message : 'Falha ao enviar a mídia.',
    };
  }

  const coluna = kind === 'video' ? 'video_url' : 'thumbnail_url';
  const supabase = await createClient();
  const { error } = await supabase
    .from('exercises')
    .update({ [coluna]: path })
    .eq('id', exerciseId);

  if (error) {
    return { ok: false, message: `Mídia enviada, mas falhou ao salvar: ${error.message}` };
  }

  revalidatePath('/professor/exercicios');
  revalidatePath(`/professor/exercicios/${exerciseId}`);

  return { ok: true, message: 'Mídia enviada.', id: exerciseId, path };
}
