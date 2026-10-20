'use server';

import { revalidatePath } from 'next/cache';

import { getSessionUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { siteUrl } from '@/lib/site-url';
import {
  alterarStatusSchema,
  criarAlunoSchema,
  editarAlunoSchema,
  type AlterarStatusInput,
  type CriarAlunoInput,
  type EditarAlunoInput,
} from '@/schemas/aluno';

/**
 * Server Actions do domínio de alunos (architecture.md §4 / §4.4).
 *
 * LEITURA/MUTAÇÃO NORMAL: `createClient()` (RLS ativo) — nunca filtramos
 * `tenant_id` manualmente. ÚNICA exceção service_role nesta fase: `convidarAluno`,
 * que cria `auth.users` + `profiles` via `createAdminClient(tenantId)` carimbando
 * `tenant_id`/`trainer_id` do professor autenticado.
 */

/** Estado tipado retornado pelas actions para as Server Actions/forms. */
export interface EstadoAcao {
  ok: boolean;
  /** Mensagem geral (erro ou sucesso) em pt-BR. */
  message?: string;
  /** Erros por campo (para exibir junto ao input). */
  fieldErrors?: Record<string, string>;
  /** Id do recurso afetado (ex.: aluno criado). */
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

/** Monta o payload de `profiles` a partir dos dados validados. */
function perfilDeAluno(dados: CriarAlunoInput | EditarAlunoInput) {
  return {
    full_name: dados.full_name,
    email: dados.email,
    phone: dados.phone ?? null,
    birth_date: dados.birth_date ?? null,
    gender: dados.gender ?? null,
    height_cm: dados.height_cm ?? null,
    experience_level: dados.experience_level ?? null,
    goal: dados.goal ?? null,
  };
}

/**
 * Convida um aluno: cria o usuário em `auth.users` (envio de convite por e-mail)
 * e o `profiles` role='student', status='pending', vinculado ao professor
 * autenticado. Único caminho service_role (§4.4).
 */
export async function convidarAluno(
  _prev: EstadoAcao | undefined,
  formData: FormData
): Promise<EstadoAcao> {
  const professor = await getSessionUser();
  if (!professor || professor.role !== 'trainer') {
    return { ok: false, message: 'Apenas o professor pode convidar alunos.' };
  }

  const parsed = criarAlunoSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      ok: false,
      message: 'Verifique os campos destacados.',
      fieldErrors: erroDeCampo(parsed.error.flatten()),
    };
  }

  const dados = parsed.data;
  const admin = createAdminClient(professor.tenantId);

  // 1) Cria o usuário de auth e dispara o convite por e-mail.
  //
  // `redirectTo` é OBRIGATÓRIO para o onboarding funcionar: sem ele o Supabase
  // manda o aluno para a Site URL raiz (e ele fica preso sem definir senha).
  // Apontamos para a rota de callback server-side (`/callback`) com o destino
  // `next=/set-password`; o callback troca o `code` por sessão (cookies) e
  // encaminha para a tela de definir senha. A URL base vem de NEXT_PUBLIC_SITE_URL
  // (lib/site-url.ts) — o domínio de produção nunca é hardcodado aqui. O valor
  // de `${siteUrl}/callback` precisa estar na lista de Redirect URLs do painel
  // do Supabase (ver docs/pendencias.md).
  const { data: convite, error: erroConvite } =
    await admin.authAdmin.inviteUserByEmail(dados.email, {
      data: { full_name: dados.full_name, role: 'student' },
      redirectTo: siteUrl('/callback?next=/set-password'),
    });

  if (erroConvite || !convite?.user) {
    return {
      ok: false,
      message:
        erroConvite?.message ??
        'Não foi possível convidar o aluno. Verifique o e-mail e tente novamente.',
      fieldErrors: { email: 'Não foi possível convidar este e-mail.' },
    };
  }

  // 2) Insere o perfil do aluno; a API fina carimba `tenant_id`. O builder da
  // API fina expõe superfície estrutural mínima; o resultado (com `error`) só
  // existe ao await, então convertemos via `unknown`.
  const { error: erroPerfil } = (await admin.insert('profiles', {
    user_id: convite.user.id,
    role: 'student',
    status: 'pending',
    trainer_id: professor.userId,
    ...perfilDeAluno(dados),
  })) as unknown as { error: { message: string } | null };

  if (erroPerfil) {
    return {
      ok: false,
      message: `Convite enviado, mas falhou ao criar o perfil: ${erroPerfil.message}`,
    };
  }

  revalidatePath('/professor/alunos');

  return { ok: true, message: 'Convite enviado ao aluno.', id: convite.user.id };
}

/**
 * Reenvia o convite a um aluno que ainda não ativou a conta (status 'pending').
 * Confirma, via RLS (`createClient`), que o aluno pertence ao professor e está
 * pendente; então reenvia o e-mail de convite com o mesmo `redirectTo`.
 */
export async function reenviarConvite(userId: string): Promise<EstadoAcao> {
  const professor = await getSessionUser();
  if (!professor || professor.role !== 'trainer') {
    return { ok: false, message: 'Apenas o professor pode reenviar convites.' };
  }

  // Lê o aluno sob RLS: garante que é do tenant do professor e está pendente.
  const supabase = await createClient();
  const { data: aluno, error: erroLeitura } = await supabase
    .from('profiles')
    .select('email, status, role')
    .eq('user_id', userId)
    .eq('role', 'student')
    .single();

  if (erroLeitura || !aluno) {
    return { ok: false, message: 'Aluno não encontrado.' };
  }
  if (!aluno.email) {
    return { ok: false, message: 'Este aluno não tem e-mail cadastrado.' };
  }
  if (aluno.status !== 'pending') {
    return { ok: false, message: 'Este aluno já ativou a conta; não há convite a reenviar.' };
  }

  // Reenvia o convite (mesmo redirectTo do convite original).
  const admin = createAdminClient(professor.tenantId);
  const { error: erroConvite } = await admin.authAdmin.inviteUserByEmail(aluno.email, {
    data: { role: 'student' },
    redirectTo: siteUrl('/callback?next=/set-password'),
  });

  if (erroConvite) {
    return {
      ok: false,
      message: `Não foi possível reenviar o convite: ${erroConvite.message}`,
    };
  }

  revalidatePath(`/professor/alunos/${userId}`);
  revalidatePath('/professor/alunos');

  return { ok: true, message: 'Convite reenviado ao aluno.', id: userId };
}

/**
 * Edita os dados cadastrais de um aluno. Mutação normal via RLS (`createClient`):
 * o RLS garante que o professor só altera alunos do próprio tenant.
 */
export async function editarAluno(
  userId: string,
  _prev: EstadoAcao | undefined,
  formData: FormData
): Promise<EstadoAcao> {
  const professor = await getSessionUser();
  if (!professor || professor.role !== 'trainer') {
    return { ok: false, message: 'Apenas o professor pode editar alunos.' };
  }

  const parsed = editarAlunoSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      ok: false,
      message: 'Verifique os campos destacados.',
      fieldErrors: erroDeCampo(parsed.error.flatten()),
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('profiles')
    .update(perfilDeAluno(parsed.data))
    .eq('user_id', userId)
    .eq('role', 'student');

  if (error) {
    return { ok: false, message: `Não foi possível salvar: ${error.message}` };
  }

  revalidatePath('/professor/alunos');
  revalidatePath(`/professor/alunos/${userId}`);

  return { ok: true, message: 'Dados do aluno atualizados.', id: userId };
}

/**
 * Altera o status do aluno (active/inactive/archived). Mutação normal via RLS.
 */
export async function alterarStatusAluno(
  userId: string,
  status: AlterarStatusInput['status']
): Promise<EstadoAcao> {
  const professor = await getSessionUser();
  if (!professor || professor.role !== 'trainer') {
    return { ok: false, message: 'Apenas o professor pode alterar o status.' };
  }

  const parsed = alterarStatusSchema.safeParse({ status });
  if (!parsed.success) {
    return { ok: false, message: 'Status inválido.' };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('profiles')
    .update({ status: parsed.data.status })
    .eq('user_id', userId)
    .eq('role', 'student');

  if (error) {
    return { ok: false, message: `Não foi possível alterar o status: ${error.message}` };
  }

  revalidatePath('/professor/alunos');
  revalidatePath(`/professor/alunos/${userId}`);

  return { ok: true, message: 'Status atualizado.', id: userId };
}
