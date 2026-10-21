'use server';

import { revalidatePath } from 'next/cache';

import { getSessionUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { transicaoPermitida } from '@/schemas/treino';
import type { PlanStatus } from '@/types/database.types';

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
