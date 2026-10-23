import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

import { createAdminClient } from '@/lib/supabase/admin';
import {
  agruparPorTenant,
  elegivelParaLiberar,
  type FichaElegivel,
} from '@/lib/treinos/liberacao';
import type { PlanStatus } from '@/types/database.types';

/**
 * Cron diário de liberação programada de treinos (ver design §7).
 *
 * Lê, cross-tenant via `service_role`, as fichas elegíveis
 * (`scheduled_release_at <= now()` e `status='draft'`) e transiciona cada uma
 * para `released` + `released_at`, zerando `scheduled_release_at`. A escrita
 * passa pela API fina de `lib/supabase/admin.ts` (um UPDATE por id, reforçando
 * o `tenant_id`). É um atalho DELIBERADO `draft→released` fora da máquina de
 * transições — NÃO usa `transicaoPermitida` (que recusaria o par). Idempotente:
 * o filtro `status='draft'` garante que fichas já liberadas não são reprocessadas.
 *
 * O `Filterable` de `admin.ts` não expõe `.in`/`.select`/count, então a escrita
 * é por id e a contagem `released` deriva do CONJUNTO LIDO, não de rowcount.
 */

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface LinhaElegivel extends FichaElegivel {
  id: string;
  tenant_id: string;
}

export async function GET(request: Request) {
  // Auth padrão da rota legada, ENDURECIDA: sem CRON_SECRET configurado → 401
  // (nunca "abre" sem segredo). A legada só comparava o header.
  const authHeader = request.headers.get('authorization');
  if (
    !process.env.CRON_SECRET ||
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const agora = new Date();
    const agoraIso = agora.toISOString();

    // Leitura cross-tenant das fichas candidatas (o filtro final de
    // elegibilidade é reaplicado em memória pela função pura).
    const { data, error } = await supabase
      .from('workout_plans')
      .select('id, tenant_id, status, scheduled_release_at')
      .not('scheduled_release_at', 'is', null)
      .lte('scheduled_release_at', agoraIso)
      .eq('status', 'draft');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const candidatas = (data ?? []) as LinhaElegivel[];
    const elegiveis = candidatas.filter((row) =>
      elegivelParaLiberar(
        { status: row.status as PlanStatus, scheduled_release_at: row.scheduled_release_at },
        agora
      )
    );

    const porTenant = agruparPorTenant(elegiveis);

    let released = 0;
    const tenantsAfetados = new Set<string>();
    const falhas: { id: string; erro: string }[] = [];

    for (const [tenantId, ids] of porTenant) {
      const admin = createAdminClient(tenantId);
      for (const id of ids) {
        // Um UPDATE por id — o Filterable não expõe `.in` (admin.ts §4.4). O
        // builder da API fina expõe superfície estrutural mínima; o resultado
        // (com `error`) só existe ao await, então convertemos via `unknown`.
        const { error: erroUpdate } = (await admin
          .update('workout_plans', {
            status: 'released',
            released_at: agoraIso,
            scheduled_release_at: null,
          })
          .eq('id', id)) as unknown as { error: { message: string } | null };

        if (erroUpdate) {
          falhas.push({ id, erro: erroUpdate.message });
        } else {
          released += 1;
          tenantsAfetados.add(tenantId);
        }
      }
    }

    if (falhas.length > 0) {
      return NextResponse.json(
        { ok: false, released, tenants: tenantsAfetados.size, falhas },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, released, tenants: tenantsAfetados.size });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro inesperado.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
