'use server';

import { revalidatePath } from 'next/cache';

import { getSessionUser, isSelfManaged } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { diaSP } from '@/lib/arena/datas';
import { erroDeCampo, type EstadoAcao } from '@/actions/_estado';
import {
  alternarRefeicaoSchema,
  definirMetaAguaSchema,
  type LembretesAguaInput,
  registrarAguaSchema,
} from '@/schemas/habitos';
import { requireEntitlement } from '@/lib/billing/guard';

/**
 * Server Actions dos HÁBITOS do aluno — hidratação, aderência à dieta e
 * check-in diário (padrão `EstadoAcao`). Mesmo molde de `actions/execucao.ts`:
 * toda leitura/escrita usa `createClient()` (RLS ativo), nunca `service_role`;
 * não refiltramos posse manualmente (as policies garantem). Carimbamos
 * `user_id`/`tenant_id` nos inserts (exigido pelo `with check` das policies) e
 * NUNCA `occurred_on` — o default do banco (`gamification_sp_date(now())`) é a
 * fonte única de fuso.
 *
 * A concessão de XP é dos TRIGGERS do banco (SECURITY DEFINER que chamam
 * `gamification_award`): estas actions só inserem/apagam os registros. Nenhuma
 * escreve em `gamification_*`.
 *
 * O aluno autônomo (trainer self_managed) usa estas actions como o aluno
 * vinculado, sem caso especial — o ramo "próprio aluno" aceita `role==='student'`
 * OU (`role==='trainer'` + self_managed).
 */

/** `true` quando o usuário pode operar os próprios hábitos (aluno ou autônomo). */
function podeOperarProprio(usuario: {
  role: string;
  accountType: 'professional' | 'self_managed';
}): boolean {
  return (
    usuario.role === 'student' ||
    (usuario.role === 'trainer' && isSelfManaged(usuario))
  );
}

/**
 * Registra uma ingestão de água do dia. Carimba `user_id`/`tenant_id`; o
 * `occurred_on` fica a cargo do default do banco. O trigger de água recalcula o
 * total do dia e concede `water_goal` quando a meta é atingida.
 */
export async function registrarAgua(amountMl: number): Promise<EstadoAcao> {
  const usuario = await getSessionUser();
  if (!usuario) {
    return { ok: false, message: 'Sessão expirada.' };
  }
  const direito = await requireEntitlement(null, usuario);
  if (!direito.ok) {
    return { ok: false, message: direito.message ?? 'Assinatura inativa.' };
  }
  if (!podeOperarProprio(usuario)) {
    return { ok: false, message: 'Apenas o aluno pode registrar água.' };
  }

  const parsed = registrarAguaSchema.safeParse({ amount_ml: amountMl });
  if (!parsed.success) {
    return {
      ok: false,
      message: 'Quantidade de água inválida.',
      fieldErrors: erroDeCampo(parsed.error.flatten()),
    };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('water_intake_logs')
    .insert({
      user_id: usuario.userId,
      tenant_id: usuario.tenantId,
      amount_ml: parsed.data.amount_ml,
    })
    .select('id')
    .single();

  if (error || !data) {
    return {
      ok: false,
      message: `Não foi possível registrar a água: ${error?.message ?? 'erro desconhecido'}`,
    };
  }

  revalidatePath('/aluno');
  revalidatePath('/aluno/arena');

  return { ok: true, message: 'Água registrada.', id: data.id };
}

/**
 * Remove um registro de ingestão de água (desfazer). A RLS garante que o aluno
 * só apaga os próprios registros; o trigger de delete recalcula o total do dia.
 */
export async function removerRegistroAgua(id: string): Promise<EstadoAcao> {
  const usuario = await getSessionUser();
  if (!usuario) {
    return { ok: false, message: 'Sessão expirada.' };
  }
  const direito = await requireEntitlement(null, usuario);
  if (!direito.ok) {
    return { ok: false, message: direito.message ?? 'Assinatura inativa.' };
  }
  if (!podeOperarProprio(usuario)) {
    return { ok: false, message: 'Apenas o aluno pode remover registros de água.' };
  }

  const supabase = await createClient();

  const { error } = await supabase.from('water_intake_logs').delete().eq('id', id);

  if (error) {
    return {
      ok: false,
      message: `Não foi possível remover o registro: ${error.message}`,
    };
  }

  revalidatePath('/aluno');
  revalidatePath('/aluno/arena');

  return { ok: true, message: 'Registro removido.', id };
}

/**
 * Define (upsert) a meta de hidratação de um aluno. Sem `alvoUserId`, é o
 * próprio aluno; com `alvoUserId`, é o professor definindo a meta de um aluno
 * (exige `role==='trainer'`; a RLS valida que o alvo é um `student` do tenant).
 * Upsert por `user_id` (PK de `water_goals`).
 */
export async function definirMetaAgua(
  targetMl: number,
  source: 'manual' | 'derived_weight' | 'default',
  alvoUserId?: string,
  lembretes?: LembretesAguaInput
): Promise<EstadoAcao> {
  const usuario = await getSessionUser();
  if (!usuario) {
    return { ok: false, message: 'Sessão expirada.' };
  }
  const direito = await requireEntitlement(null, usuario);
  if (!direito.ok) {
    return { ok: false, message: direito.message ?? 'Assinatura inativa.' };
  }

  const parsed = definirMetaAguaSchema.safeParse({
    target_ml: targetMl,
    source,
    alvo_user_id: alvoUserId,
    lembretes,
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: 'Meta de água inválida.',
      fieldErrors: erroDeCampo(parsed.error.flatten()),
    };
  }

  // Resolve o aluno-alvo e autoriza o papel. Sem alvo = própria meta (aluno ou
  // autônomo). Com alvo = fluxo do professor (exige trainer). A posse real
  // (dono OU trainer do tenant sobre um student) é imposta pela RLS.
  let alvo: string;
  if (parsed.data.alvo_user_id === undefined) {
    if (!podeOperarProprio(usuario)) {
      return { ok: false, message: 'Apenas o aluno pode definir a própria meta.' };
    }
    alvo = usuario.userId;
  } else {
    if (usuario.role !== 'trainer') {
      return {
        ok: false,
        message: 'Apenas o professor pode definir a meta de um aluno.',
      };
    }
    alvo = parsed.data.alvo_user_id;
  }

  const supabase = await createClient();

  const { error } = await supabase.from('water_goals').upsert(
    {
      user_id: alvo,
      tenant_id: usuario.tenantId,
      target_ml: parsed.data.target_ml,
      source: parsed.data.source,
      // Lembretes da Agenda: só entram no upsert quando informados (o PostgREST
      // atualiza apenas as colunas enviadas).
      ...(parsed.data.lembretes
        ? {
            reminder_interval_min: parsed.data.lembretes.intervaloMin,
            reminder_start_min: parsed.data.lembretes.inicioMin,
            reminder_end_min: parsed.data.lembretes.fimMin,
          }
        : {}),
    },
    { onConflict: 'user_id' }
  );

  if (error) {
    return {
      ok: false,
      message: `Não foi possível salvar a meta: ${error.message}`,
    };
  }

  revalidatePath('/aluno');
  revalidatePath('/aluno/agenda');
  if (parsed.data.alvo_user_id !== undefined) {
    revalidatePath(`/professor/alunos/${alvo}`);
  }

  return { ok: true, message: 'Meta de água salva.' };
}

/**
 * Alterna o cumprimento de uma refeição do dia. Se já existe marcação do dia-SP
 * para `(aluno, refeição)`, desmarca (delete); caso contrário, marca (insert).
 * Carimba `user_id`/`tenant_id`/`diet_id`/`meal_id`; o `occurred_on` fica com o
 * default do banco. O `on conflict do nothing` no insert cobre o double-click.
 * Os triggers de dieta concedem `meal_logged`/`diet_day` conforme o estado.
 */
export async function alternarRefeicaoCumprida(
  mealId: string,
  dietId: string
): Promise<EstadoAcao> {
  const usuario = await getSessionUser();
  if (!usuario) {
    return { ok: false, message: 'Sessão expirada.' };
  }
  const direito = await requireEntitlement(null, usuario);
  if (!direito.ok) {
    return { ok: false, message: direito.message ?? 'Assinatura inativa.' };
  }
  if (!podeOperarProprio(usuario)) {
    return { ok: false, message: 'Apenas o aluno pode marcar refeições.' };
  }

  const parsed = alternarRefeicaoSchema.safeParse({
    meal_id: mealId,
    diet_id: dietId,
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: 'Refeição inválida.',
      fieldErrors: erroDeCampo(parsed.error.flatten()),
    };
  }

  const supabase = await createClient();
  const hoje = diaSP(new Date());

  // Há marcação do dia-SP para esta refeição? (SELECT permissivo da RLS).
  let existenteQuery = supabase
    .from('diet_meal_completions')
    .select('id')
    .eq('meal_id', parsed.data.meal_id)
    .eq('user_id', usuario.userId);
  existenteQuery = hoje
    ? existenteQuery.eq('occurred_on', hoje)
    : existenteQuery;

  const { data: existente, error: erroBusca } = await existenteQuery
    .limit(1)
    .maybeSingle();

  if (erroBusca) {
    return {
      ok: false,
      message: `Não foi possível verificar a refeição: ${erroBusca.message}`,
    };
  }

  if (existente) {
    // Desmarcar: remove a marcação do dia (RLS limita ao próprio aluno).
    const { error: erroDelete } = await supabase
      .from('diet_meal_completions')
      .delete()
      .eq('id', existente.id);

    if (erroDelete) {
      return {
        ok: false,
        message: `Não foi possível desmarcar a refeição: ${erroDelete.message}`,
      };
    }

    revalidatePath('/aluno/dieta');
    revalidatePath('/aluno');
    revalidatePath('/aluno/arena');

    return { ok: true, message: 'Refeição desmarcada.', id: existente.id };
  }

  // Marcar: insere (on conflict do nothing cobre a corrida/double-click). Não
  // carimbamos `occurred_on` — default do banco (dia-SP).
  const { error: erroInsert } = await supabase
    .from('diet_meal_completions')
    .upsert(
      {
        user_id: usuario.userId,
        tenant_id: usuario.tenantId,
        diet_id: parsed.data.diet_id,
        meal_id: parsed.data.meal_id,
      },
      { onConflict: 'user_id,meal_id,occurred_on', ignoreDuplicates: true }
    );

  if (erroInsert) {
    return {
      ok: false,
      message: `Não foi possível marcar a refeição: ${erroInsert.message}`,
    };
  }

  revalidatePath('/aluno/dieta');
  revalidatePath('/aluno');
  revalidatePath('/aluno/arena');

  return { ok: true, message: 'Refeição marcada.' };
}

/**
 * Faz o check-in diário do aluno. Insere em `daily_checkins` com
 * `on conflict (user_id, occurred_on) do nothing` — idempotente: um segundo
 * check-in no mesmo dia-SP não duplica nem erra. O trigger concede
 * `daily_checkin`. Não carimbamos `occurred_on` (default do banco).
 */
export async function fazerCheckin(): Promise<EstadoAcao> {
  const usuario = await getSessionUser();
  if (!usuario) {
    return { ok: false, message: 'Sessão expirada.' };
  }
  const direito = await requireEntitlement(null, usuario);
  if (!direito.ok) {
    return { ok: false, message: direito.message ?? 'Assinatura inativa.' };
  }
  if (!podeOperarProprio(usuario)) {
    return { ok: false, message: 'Apenas o aluno pode fazer check-in.' };
  }

  const supabase = await createClient();

  const { error } = await supabase.from('daily_checkins').upsert(
    {
      user_id: usuario.userId,
      tenant_id: usuario.tenantId,
    },
    { onConflict: 'user_id,occurred_on', ignoreDuplicates: true }
  );

  if (error) {
    return {
      ok: false,
      message: `Não foi possível fazer o check-in: ${error.message}`,
    };
  }

  revalidatePath('/aluno');
  revalidatePath('/aluno/arena');

  return { ok: true, message: 'Check-in registrado.' };
}
