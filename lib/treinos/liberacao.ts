import type { PlanStatus } from '@/types/database.types';

/**
 * Lógica pura da liberação programada, importável pela rota do cron
 * (`app/api/cron/liberar-treinos/route.ts`) e pelos testes unitários. Mantida
 * fora da rota para ser 100% testável sem mockar Supabase (ver design §10/§11).
 */

/** Forma mínima de uma ficha para decidir elegibilidade de liberação. */
export interface FichaElegivel {
  status: PlanStatus;
  scheduled_release_at: string | null;
}

/**
 * Uma ficha é elegível para liberação pelo cron quando está em `draft`, tem
 * `scheduled_release_at` preenchida e essa data já venceu (<= `agora`). O filtro
 * por `draft` garante idempotência: uma ficha já liberada nunca é reprocessada.
 */
export function elegivelParaLiberar(
  plan: FichaElegivel,
  agora: Date
): boolean {
  return (
    plan.status === 'draft' &&
    plan.scheduled_release_at != null &&
    new Date(plan.scheduled_release_at).getTime() <= agora.getTime()
  );
}

/**
 * Agrupa ids por `tenant_id`. Usado pela rota para escrever cada ficha pelo
 * `createAdminClient(tenant_id)` correto (reforço de isolamento — NÃO batching).
 */
export function agruparPorTenant(
  rows: { id: string; tenant_id: string }[]
): Map<string, string[]> {
  const mapa = new Map<string, string[]>();
  for (const { id, tenant_id } of rows) {
    const atual = mapa.get(tenant_id);
    if (atual) {
      atual.push(id);
    } else {
      mapa.set(tenant_id, [id]);
    }
  }
  return mapa;
}
