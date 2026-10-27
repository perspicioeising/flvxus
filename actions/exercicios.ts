'use server';

import { revalidatePath } from 'next/cache';

import { getSessionUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import {
  uploadExerciseMedia,
  montarPathExerciseMedia,
  limiteMidiaExercicio,
  prefixoMimePermitido,
  EXERCISE_MEDIA_BUCKET,
  type ExerciseMediaKind,
} from '@/lib/storage';
import {
  criarExercicioSchema,
  editarExercicioSchema,
  importarExerciciosSchema,
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

/**
 * Duplica um exercício do catálogo global (`tenant_id IS NULL`) para o acervo
 * do professor, criando uma cópia editável no próprio tenant. O catálogo global
 * é compartilhado e imutável (RLS); esta action dá ao professor a liberdade de
 * personalizar sem afetar o catálogo de todos. A mídia (video/thumbnail) NÃO é
 * copiada — os arquivos vivem no path do exercício de origem; o professor
 * reenvia a mídia que quiser na cópia.
 */
export async function duplicarExercicioParaTenant(
  exerciseId: string
): Promise<EstadoAcao> {
  const professor = await getSessionUser();
  if (!professor || professor.role !== 'trainer') {
    return { ok: false, message: 'Apenas o professor pode duplicar exercícios.' };
  }

  const supabase = await createClient();

  // Lê o exercício de origem (RLS permite ler o catálogo global e os do tenant).
  const { data: origem, error: erroLeitura } = await supabase
    .from('exercises')
    .select('name, muscle_groups, equipment, instructions, tips, common_errors')
    .eq('id', exerciseId)
    .single();

  if (erroLeitura || !origem) {
    return { ok: false, message: 'Exercício não encontrado.' };
  }

  // Insere a cópia no tenant do professor (a policy exige tenant_id próprio).
  const { data, error } = await supabase
    .from('exercises')
    .insert({
      name: origem.name,
      muscle_groups: origem.muscle_groups,
      equipment: origem.equipment,
      instructions: origem.instructions,
      tips: origem.tips ?? [],
      common_errors: origem.common_errors ?? [],
      video_url: null,
      thumbnail_url: null,
      tenant_id: professor.tenantId,
      created_by: professor.userId,
    })
    .select('id')
    .single();

  if (error || !data) {
    return {
      ok: false,
      message: `Não foi possível duplicar: ${error?.message ?? 'erro desconhecido'}`,
    };
  }

  revalidatePath('/professor/exercicios');

  return {
    ok: true,
    message: 'Exercício duplicado para o seu acervo. Agora você pode editá-lo.',
    id: data.id,
  };
}

export interface ImportarExerciciosResultado extends EstadoAcao {
  importados?: number;
  jaExistiam?: number;
  invalidos?: number;
}

/**
 * Importa em lote exercícios do catálogo global (`tenant_id IS NULL`) para o
 * acervo do professor. A RPC `importar_exercicios_globais` faz a cópia atômica
 * sob RLS (SECURITY INVOKER) e é idempotente — reimportar um global já copiado
 * não cria duplicata (índice único parcial em `source_exercise_id`). Calculamos:
 *   - `importados`: linhas efetivamente inseridas (retorno da RPC);
 *   - `invalidos`: IDs que não são globais legíveis (não existem / já são do
 *     tenant);
 *   - `jaExistiam`: globais legíveis que já haviam sido importados antes.
 */
export async function importarExercicios(
  sourceIds: string[]
): Promise<ImportarExerciciosResultado> {
  const professor = await getSessionUser();
  if (!professor || professor.role !== 'trainer') {
    return { ok: false, message: 'Apenas o professor pode importar exercícios.' };
  }

  const entrada = Array.isArray(sourceIds) ? sourceIds : [];
  const parsed = importarExerciciosSchema.safeParse(entrada);
  if (!parsed.success) {
    return { ok: false, message: 'Seleção inválida.' };
  }
  const ids = parsed.data;

  const supabase = await createClient();

  // Conta quantos dos IDs são globais legíveis (origem válida para importação).
  const { count: origensGlobais } = await supabase
    .from('exercises')
    .select('id', { count: 'exact', head: true })
    .in('id', ids)
    .is('tenant_id', null);

  const { data: importadosRaw, error } = await supabase.rpc(
    'importar_exercicios_globais',
    { p_source_ids: ids }
  );

  if (error) {
    return { ok: false, message: `Não foi possível importar: ${error.message}` };
  }

  const importados = importadosRaw ?? 0;
  const invalidos = ids.length - (origensGlobais ?? 0);
  const jaExistiam = (origensGlobais ?? 0) - importados;

  revalidatePath('/professor/exercicios');

  const partes: string[] = [`${importados} importados`];
  if (jaExistiam > 0) {
    partes.push(`${jaExistiam} já existiam`);
  }
  if (invalidos > 0) {
    partes.push(`${invalidos} inválidos`);
  }

  return {
    ok: true,
    importados,
    jaExistiam,
    invalidos,
    message: `${partes.join(', ')}.`,
  };
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

/** Metadados do arquivo enviados pelo cliente (NUNCA o arquivo em si). */
export interface MidiaExercicioMeta {
  /** Nome original do arquivo (sanitizado no servidor ao montar o path). */
  name: string;
  /** Tamanho em bytes, validado contra o limite do `kind`. */
  size: number;
  /** MIME type, validado contra o prefixo permitido do `kind`. */
  type: string;
}

export interface SignedUploadResultado extends EstadoAcao {
  /** Bucket privado de destino (o cliente faz o upload direto nele). */
  bucket?: string;
  /** URL assinada de upload (válida por tempo curto). */
  url?: string;
  /** Token da signed upload URL, usado por `uploadToSignedUrl`. */
  token?: string;
  /** Path DETERMINÍSTICO derivado no servidor (nunca vindo do cliente). */
  path?: string;
}

/**
 * Formata um limite em bytes como "N MB" para mensagens em pt-BR.
 */
function limiteEmMB(bytes: number): string {
  return `${Math.round(bytes / (1024 * 1024))}MB`;
}

/**
 * Server Action LEVE que emite uma SIGNED UPLOAD URL para a mídia de um
 * exercício do tenant. NÃO recebe o arquivo — só os metadados. O arquivo é
 * enviado DIRETO ao Storage pelo cliente (fora da Server Action), o que remove o
 * gargalo do `bodySizeLimit` e viabiliza vídeos de até 50MB.
 *
 * Guards (iguais ao `uploadMidiaExercicio`): só o trainer; o isolamento de
 * tenant é garantido pela RLS do bucket (a signed upload URL é criada com a
 * sessão do trainer via `createClient`, passando pela policy de insert que exige
 * 1º segmento = `app_tenant_id()` e `app_role() = 'trainer'`).
 *
 * Validação no SERVIDOR: tamanho contra `limiteMidiaExercicio(kind)` e MIME
 * contra `prefixoMimePermitido(kind)`. O `path` é derivado no servidor a partir
 * de `professor.tenantId` + `exerciseId` + nome sanitizado — nunca aceito do
 * cliente.
 */
export async function criarUploadUrlMidiaExercicio(
  exerciseId: string,
  kind: ExerciseMediaKind,
  fileMeta: MidiaExercicioMeta
): Promise<SignedUploadResultado> {
  const professor = await getSessionUser();
  if (!professor || professor.role !== 'trainer') {
    return { ok: false, message: 'Apenas o professor pode enviar mídia.' };
  }

  if (!fileMeta || typeof fileMeta.name !== 'string' || fileMeta.name.length === 0) {
    return { ok: false, message: 'Selecione um arquivo para enviar.' };
  }

  const limite = limiteMidiaExercicio(kind);
  if (!Number.isFinite(fileMeta.size) || fileMeta.size <= 0) {
    return { ok: false, message: 'Selecione um arquivo para enviar.' };
  }
  if (fileMeta.size > limite) {
    const alvo = kind === 'video' ? 'O vídeo' : 'A imagem';
    return { ok: false, message: `${alvo} excede o limite de ${limiteEmMB(limite)}.` };
  }

  const prefixo = prefixoMimePermitido(kind);
  if (typeof fileMeta.type !== 'string' || !fileMeta.type.startsWith(prefixo)) {
    const esperado = kind === 'video' ? 'um vídeo' : 'uma imagem';
    return { ok: false, message: `Envie ${esperado} em um formato válido.` };
  }

  const path = montarPathExerciseMedia({
    tenantId: professor.tenantId,
    exerciseId,
    kind,
    fileName: fileMeta.name,
  });

  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(EXERCISE_MEDIA_BUCKET)
    .createSignedUploadUrl(path, { upsert: true });

  if (error || !data) {
    return {
      ok: false,
      message: `Não foi possível preparar o envio: ${error?.message ?? 'erro desconhecido'}`,
    };
  }

  return {
    ok: true,
    bucket: EXERCISE_MEDIA_BUCKET,
    url: data.signedUrl,
    token: data.token,
    path: data.path,
  };
}

/**
 * Server Action de CONFIRMAÇÃO. Depois que o cliente envia o arquivo DIRETO ao
 * Storage (via signed upload URL), esta action só PERSISTE o `path` em
 * `video_url`/`thumbnail_url` do exercício.
 *
 * Defesa em profundidade: além do guard de trainer, o `path` recebido é
 * revalidado contra o prefixo determinístico esperado
 * (`{tenantId}/{exerciseId}/{kind}-`). Um path arbitrário/cross-tenant é
 * rejeitado aqui antes de qualquer gravação; a RLS do `update` em `exercises`
 * reforça o isolamento.
 */
export async function confirmarMidiaExercicio(
  exerciseId: string,
  kind: ExerciseMediaKind,
  path: string
): Promise<UploadMidiaResultado> {
  const professor = await getSessionUser();
  if (!professor || professor.role !== 'trainer') {
    return { ok: false, message: 'Apenas o professor pode enviar mídia.' };
  }

  if (typeof path !== 'string' || path.length === 0) {
    return { ok: false, message: 'Envio inválido. Tente novamente.' };
  }

  const prefixoEsperado = `${professor.tenantId}/${exerciseId}/${kind}-`;
  if (!path.startsWith(prefixoEsperado)) {
    return { ok: false, message: 'Envio inválido. Tente novamente.' };
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
