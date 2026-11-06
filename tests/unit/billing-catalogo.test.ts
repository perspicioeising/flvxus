import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';
import { CATALOGO } from '@/lib/billing/catalogo';

/**
 * Paridade catálogo (landing) × seed SQL, trial/migrations e varredura de
 * segredos do Stripe no repositório.
 */
const RAIZ = process.cwd();
const MIGRATIONS = join(RAIZ, 'supabase', 'migrations');
const SEED = readFileSync(join(MIGRATIONS, '20261105090100_plans_stripe_price_ids_seed.sql'), 'utf8');
const TRIAL = readFileSync(join(MIGRATIONS, '20261105090000_billing_trial_core.sql'), 'utf8');

const PRICES = {
  individual: ['price_1UYFXIFVM32R4q9lSAvbZEEe', 'price_1UYFXIFVM32R4q9lQJR8i0yZ'],
  personal: ['price_1UYFYqFVM32R4q9lOi2nj7d3', 'price_1UYFa6FVM32R4q9l6qAc3WKe'],
  assessoria: ['price_1UYFcfFVM32R4q9lOZ5d4yoo', 'price_1UYFcfFVM32R4q9lkULnJvme'],
} as const;

describe('catálogo × seed', () => {
  it('os 6 price IDs estão no seed e são distintos', () => {
    const todos = Object.values(PRICES).flat();
    expect(new Set(todos).size).toBe(6);
    for (const id of todos) {
      expect(SEED).toContain(`'${id}'`);
    }
  });

  it('cada tier do catálogo tem centavos e price IDs iguais aos do seed', () => {
    for (const item of CATALOGO) {
      const [mensal, anual] = PRICES[item.tier];
      const linha = SEED.split('\n').find((l) => l.includes(`('${item.tier}'`));
      expect(linha, `linha do seed para ${item.tier}`).toBeDefined();
      expect(linha).toContain(String(item.mensalCentavos));
      expect(linha).toContain(String(item.anualCentavos));
      expect(linha).toContain(`'${mensal}'`);
      expect(linha).toContain(`'${anual}'`);
    }
  });

  it('o seed é idempotente (on conflict) e não sobrescreve franquia/limites', () => {
    expect(SEED).toMatch(/on conflict \(tier\) do update/i);
    const setBlock = SEED.slice(SEED.search(/do update set/i));
    expect(setBlock).not.toMatch(/max_affiliates|ai_quota_monthly|trial_days/);
  });
});

describe('migrations de billing (estático)', () => {
  const todas = readdirSync(MIGRATIONS).filter((f) => f.endsWith('.sql'));
  const novas = [
    '20261105090000_billing_trial_core',
    '20261105090100_plans_stripe_price_ids_seed',
  ];

  it('timestamps novos são únicos e maiores que 20261104090000', () => {
    for (const base of novas) {
      const ts = base.slice(0, 14);
      expect(Number(ts)).toBeGreaterThan(20261104090000);
      const mesmos = todas.filter((f) => f.startsWith(ts) && !f.endsWith('_rollback.sql'));
      expect(mesmos).toHaveLength(1);
      expect(todas).toContain(`${base}.sql`);
      expect(todas).toContain(`${base}_rollback.sql`);
    }
  });

  it('handle_new_user preserva as guardas e cria o trial sem derrubar o cadastro', () => {
    const fn = TRIAL.slice(TRIAL.indexOf('create or replace function public.handle_new_user'));
    const posAfiliado = fn.indexOf("is_affiliate");
    const posAluno = fn.indexOf("v_role = 'student'");
    const posIdemp = fn.indexOf('exists (select 1 from public.profiles');
    const posMaster = fn.indexOf('insert into public.tenants');
    expect(posAfiliado).toBeGreaterThan(-1);
    expect(posAfiliado).toBeLessThan(posAluno);
    expect(posAluno).toBeLessThan(posIdemp);
    expect(posIdemp).toBeLessThan(posMaster);
    expect(fn).toMatch(/insert into public\.subscriptions[\s\S]*'trialing'[\s\S]*trial_ends_at/);
    expect(fn).toMatch(/exception when others then[\s\S]*raise warning/);
    expect(fn).toMatch(/security definer/);
    expect(fn).toMatch(/set search_path = ''/);
  });

  it('can_add_affiliate considera trial_ends_at', () => {
    const fn = TRIAL.slice(TRIAL.indexOf('create or replace function public.can_add_affiliate'));
    expect(fn).toMatch(/trial_ends_at\s*>\s*now\(\)/);
  });

  it('billing_tenant_state é security definer, search_path vazio, sem public e só authenticated', () => {
    const fn = TRIAL.slice(TRIAL.indexOf('create or replace function public.billing_tenant_state'));
    expect(fn).toMatch(/security definer/);
    expect(fn).toMatch(/set search_path = ''/);
    expect(TRIAL).toMatch(/revoke all on function public\.billing_tenant_state\(\) from public/);
    expect(TRIAL).toMatch(/grant execute on function public\.billing_tenant_state\(\) to authenticated/);
    // Nunca expõe IDs da Stripe: só booleanos.
    expect(fn.slice(0, fn.indexOf('$$;', 20))).not.toMatch(/s\.stripe_(customer|subscription)_id,/);
  });

  it('backfill idempotente: guarda por not exists e nunca toca assinatura real', () => {
    expect(TRIAL).toMatch(/not exists \(select 1 from public\.subscriptions/);
    expect(TRIAL).toMatch(/s\.stripe_subscription_id is null/);
    expect(TRIAL).toMatch(/on conflict \(tenant_id\) do nothing/);
  });
});

describe('segredos do Stripe fora do repositório', () => {
  // Regex exige corpo de token real; placeholders (sk_test_..., whsec_...) não casam.
  const SEGREDO = new RegExp(
    ['\\b(sk|rk|pk)_(test|live)_[A-Za-z0-9]{16,}', 'whsec_[A-Za-z0-9]{16,}'].join('|')
  );
  const PASTAS = ['docs', 'lib', 'actions', 'app', 'components', 'supabase/migrations', 'supabase/functions', 'tests'];
  const IGNORAR = new Set(['node_modules', '.next', '.worktrees']);

  function varrer(dir: string, achados: string[]): void {
    for (const nome of readdirSync(dir)) {
      if (IGNORAR.has(nome)) continue;
      const caminho = join(dir, nome);
      const st = statSync(caminho);
      if (st.isDirectory()) {
        varrer(caminho, achados);
      } else if (/\.(ts|tsx|sql|md|json|js|env|example)$/.test(nome) || nome === '.env.example') {
        // Este arquivo monta a regex sem token literal; não precisa de exceção.
        if (SEGREDO.test(readFileSync(caminho, 'utf8'))) {
          achados.push(relative(RAIZ, caminho));
        }
      }
    }
  }

  it('nenhuma chave sk_/rk_/pk_/whsec_ real em código, docs, migrations ou testes', () => {
    const achados: string[] = [];
    for (const pasta of PASTAS) {
      varrer(join(RAIZ, pasta), achados);
    }
    const envExample = join(RAIZ, '.env.example');
    try {
      if (SEGREDO.test(readFileSync(envExample, 'utf8'))) achados.push('.env.example');
    } catch {
      // .env.example ausente: nada a varrer.
    }
    expect(achados).toEqual([]);
  });
});
