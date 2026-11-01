import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

/**
 * Assert ESTÁTICO (FEAT-005 / FR-B4.2): billing/downgrade/cancelamento NÃO pode
 * deletar linha de domínio. Sem Docker não dá para exercer o banco, então esta é
 * a verificação possível por inspeção do SQL das migrations:
 *
 *   (1) `subscriptions.plan_id` é `on delete restrict` — apagar um plano não
 *       propaga para subscriptions (e, por tabela, nunca para conteúdo).
 *   (2) NENHUMA tabela de domínio tem FK que REFERENCIA `public.subscriptions`
 *       (logo não existe cascade a partir de subscriptions para conteúdo).
 *
 * O cascade de `subscriptions.tenant_id` (on delete cascade a partir de
 * `tenants`) é esperado e correto: ele apaga a própria linha de assinatura
 * quando o tenant some, nunca histórico — e não parte de subscriptions.
 */
const MIGRATIONS_DIR = resolve(__dirname, '../../supabase/migrations');

const subscriptionsSql = readFileSync(
  resolve(MIGRATIONS_DIR, '20261022090500_billing_plans_subscriptions.sql'),
  'utf8',
).toLowerCase();

/** Concatena o SQL de todas as migrations (ignora os _rollback.sql). */
function allMigrationsSql(): string {
  return readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql') && !f.endsWith('_rollback.sql'))
    .map((f) => readFileSync(resolve(MIGRATIONS_DIR, f), 'utf8'))
    .join('\n')
    .toLowerCase();
}

describe('billing — preservação de histórico: sem cascade de domínio (assert estático)', () => {
  it('subscriptions.plan_id referencia plans com ON DELETE RESTRICT', () => {
    expect(subscriptionsSql).toContain('references public.plans (id) on delete restrict');
  });

  it('subscriptions.tenant_id referencia tenants com cascade (apaga só a assinatura)', () => {
    expect(subscriptionsSql).toContain('references public.tenants (id) on delete cascade');
  });

  it('NENHUMA migration cria FK que referencia public.subscriptions (sem cascade de conteúdo)', () => {
    const sql = allMigrationsSql();
    expect(sql).not.toContain('references public.subscriptions');
  });
});
