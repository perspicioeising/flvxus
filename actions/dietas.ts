'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { getSessionUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { transicaoPermitida } from '@/schemas/treino';
import type { PlanStatus } from '@/types/database.types';
import { requireEntitlement } from '@/lib/billing/guard';

/**
 * Server Actions do domínio de dietas.
 *
 * Espelha `actions/treinos.ts` → `alterarStatusFicha`: a leitura/mutação usa
 * `createClient()` (RLS ativo) — nunca filtramos `tenant_id`/posse à mão. A
 * policy `diets_update` já isola por tenant + trainer, e a invariante "aluno só
 * vê dietas `released`" é garantida por `diets_select`. Aqui apenas controlamos
 * o fluxo de trabalho do professor (`plan_status`).
 */

/** Estado tipado retornado pelas actions (mesmo molde de `actions/treinos.ts`). */
export interface EstadoAcao {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
  id?: string;
}

/**
 * Altera o `status` de uma dieta respeitando as transições válidas
 * (`schemas/treino.ts`, mesmo enum `plan_status`). Quando entra em `released`,
 * carimba `released_at` — é o passo que torna a dieta visível ao aluno.
 */
export async function alterarStatusDieta(
  dietId: string,
  novoStatus: PlanStatus
): Promise<EstadoAcao> {
  const professor = await getSessionUser();
  if (!professor || professor.role !== 'trainer') {
    return { ok: false, message: 'Apenas o professor pode mudar o status.' };
  }
  const direito = await requireEntitlement(null, professor);
  if (!direito.ok) return direito;

  const supabase = await createClient();

  const { data: dieta, error: erroLeitura } = await supabase
    .from('diets')
    .select('id, status')
    .eq('id', dietId)
    .single();

  if (erroLeitura || !dieta) {
    return { ok: false, message: 'Dieta não encontrada.' };
  }

  const atual = dieta.status as PlanStatus;

  if (atual === novoStatus) {
    return { ok: true, message: 'O status já é esse.', id: dietId };
  }

  if (!transicaoPermitida(atual, novoStatus)) {
    return { ok: false, message: 'Transição de status inválida.' };
  }

  const patch: { status: PlanStatus; released_at?: string } = { status: novoStatus };
  if (novoStatus === 'released') {
    patch.released_at = new Date().toISOString();
  }

  const { error } = await supabase.from('diets').update(patch).eq('id', dietId);

  if (error) {
    return { ok: false, message: `Não foi possível atualizar o status: ${error.message}` };
  }

  revalidatePath('/professor/dietas');
  revalidatePath(`/professor/dietas/${dietId}`);

  return { ok: true, message: 'Status atualizado.', id: dietId };
}

/** Horário de refeição `HH:mm` (00:00–23:59). */
const HORARIO_REFEICAO = /^([01]\d|2[0-3]):[0-5]\d$/;
const mealIdSchema = z.string().uuid();

/**
 * Define (ou limpa, com `null`) o horário de uma refeição (`diet_meals.time`),
 * que alimenta a Agenda. Update via RLS (policy de `diet_meals` isola por
 * tenant/dono da dieta). Grava `HH:mm`.
 */
export async function definirHorarioRefeicao(
  mealId: string,
  hora: string | null
): Promise<EstadoAcao> {
  const usuario = await getSessionUser();
  if (!usuario) {
    return { ok: false, message: 'Sessão expirada.' };
  }
  const direito = await requireEntitlement('diets', usuario);
  if (!direito.ok) {
    return { ok: false, message: direito.message ?? 'Assinatura inativa.' };
  }
  if (!mealIdSchema.safeParse(mealId).success) {
    return { ok: false, message: 'Refeição inválida.' };
  }
  if (hora !== null && !HORARIO_REFEICAO.test(hora)) {
    return {
      ok: false,
      message: 'Horário inválido.',
      fieldErrors: { hora: 'Use o formato HH:mm.' },
    };
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('diet_meals')
    .update({ time: hora })
    .eq('id', mealId)
    .select('diet_id')
    .maybeSingle();
  if (error) {
    return { ok: false, message: `Não foi possível salvar o horário: ${error.message}` };
  }
  if (!data) {
    return { ok: false, message: 'Refeição não encontrada.' };
  }
  revalidatePath(`/professor/dietas/${data.diet_id}`);
  revalidatePath('/professor/dietas');
  revalidatePath('/aluno/dieta');
  revalidatePath('/aluno/agenda');
  return { ok: true, message: hora ? 'Horário salvo.' : 'Horário removido.', id: mealId };
}
