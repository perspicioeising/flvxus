// =============================================================================
// Flvxus — Fase B: RLS do ALUNO AUTÔNOMO (self_managed) + preservação de
// histórico na troca de vínculo (cenário 8) — AUTORADO/MANUAL
// =============================================================================
// Prova as invariantes da Fase B que SÓ podem ser verificadas contra um banco
// real (RLS + triggers):
//   (1) ALUNO AUTÔNOMO: um master trainer com account_type='self_managed'
//       (is_tenant_master=true) cria e LÊ a própria ficha (workout_plan) SEM
//       precisar de status='released' — ele a enxerga pelo ramo TRAINER do
//       SELECT (autor/master do tenant), não pelo ramo do aluno;
//   (2) ISOLAMENTO: o autônomo NÃO enxerga conteúdo de outro tenant;
//   (3) CENÁRIO 8 (FR-B4.2/DA-7): partindo de um profile COM histórico
//       (workout_sessions, physical_assessments, user_achievements) no tenant A,
//       alterar role/tenant_id/trainer_id do profile (autônomo->vinculado e o
//       inverso) NÃO remove NENHUMA linha de histórico — nem em A nem em B;
//   (4) BACKSTOP: inserir um profile role='student' num tenant cujo MASTER é
//       self_managed FALHA (trigger BEFORE INSERT enforce_self_managed_no_students).
//
// ESTADO: o ambiente atual NÃO tem Docker; a suíte fica em `describe.skip` (ver
// tests/rls/README.md). PASSO MANUAL para rodar de verdade:
//   1. npx supabase start
//   2. npx supabase db reset   (aplica as migrations, incluindo as da Fase B)
//   3. export SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY
//      (valores impressos por `supabase status`; NUNCA commitar)
//   4. troque `describe.skip` por `describe` e rode `npm run test:rls`
//
// A verificação de que billing/downgrade/cancelamento NÃO deleta linha de
// domínio (nenhuma FK de conteúdo com cascade a partir de subscriptions;
// subscriptions.plan_id on delete restrict) é feita por assert ESTÁTICO do SQL
// em tests/unit/billing-no-cascade-migration.test.ts (roda sem Docker).
// =============================================================================

import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../types/database.types';

const SUPABASE_URL = process.env.SUPABASE_URL ?? '';
const ANON_KEY = process.env.SUPABASE_ANON_KEY ?? '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

const hasLocalDb = Boolean(SUPABASE_URL && ANON_KEY && SERVICE_ROLE_KEY);

type Db = SupabaseClient<Database>;

interface Actor {
  userId: string;
  tenantId: string;
  client: Db;
}

/**
 * Cria um master trainer AUTÔNOMO (account_type='self_managed'). handle_new_user
 * lê account_type do user_metadata e propaga ao profile master; o tenant é criado
 * pelo próprio fluxo. Retorna o Actor já logado.
 */
async function createAutonomo(admin: Db, email: string, password: string): Promise<Actor> {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: email, account_type: 'self_managed' },
  });
  if (error || !data.user) throw error ?? new Error('falha ao criar autônomo');

  const { data: profile, error: perr } = await admin
    .from('profiles')
    .select('tenant_id, account_type')
    .eq('user_id', data.user.id)
    .single();
  if (perr || !profile) throw perr ?? new Error('profile do autônomo não criado');
  if (profile.account_type !== 'self_managed') {
    throw new Error('account_type não propagado pelo handle_new_user');
  }

  const client = createClient<Database>(SUPABASE_URL, ANON_KEY);
  await client.auth.signInWithPassword({ email, password });
  return { userId: data.user.id, tenantId: profile.tenant_id, client };
}

/** Cria um master trainer PROFESSIONAL (conta B2B normal). Retorna o Actor logado. */
async function createMaster(admin: Db, email: string, password: string): Promise<Actor> {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: email },
  });
  if (error || !data.user) throw error ?? new Error('falha ao criar master');

  const { data: profile, error: perr } = await admin
    .from('profiles')
    .select('tenant_id')
    .eq('user_id', data.user.id)
    .single();
  if (perr || !profile) throw perr ?? new Error('profile do master não criado');

  const client = createClient<Database>(SUPABASE_URL, ANON_KEY);
  await client.auth.signInWithPassword({ email, password });
  return { userId: data.user.id, tenantId: profile.tenant_id, client };
}

describe.skip('Fase B — RLS do aluno autônomo + preservação de histórico (requer Supabase local)', () => {
  let admin: Db;
  let autonomo: Actor;
  let outroTenant: Actor;
  const suffix = Date.now();

  beforeAll(async () => {
    if (!hasLocalDb) return;
    admin = createClient<Database>(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    autonomo = await createAutonomo(admin, `b-auto-${suffix}@flvxus.test`, 'senha-auto-1');
    outroTenant = await createMaster(admin, `b-outro-${suffix}@flvxus.test`, 'senha-outro-1');
  });

  afterAll(async () => {
    if (!hasLocalDb) return;
    for (const a of [autonomo, outroTenant]) {
      if (a?.userId) await admin.auth.admin.deleteUser(a.userId);
    }
  });

  // --- (1) autônomo cria e lê a própria ficha SEM 'released' (ramo trainer) ---
  it('autônomo cria e LÊ o próprio workout_plan sem status released (ramo trainer)', async () => {
    const { data: plan, error } = await autonomo.client
      .from('workout_plans')
      .insert({
        tenant_id: autonomo.tenantId,
        student_id: autonomo.userId, // o autônomo é o próprio "aluno" da ficha
        trainer_id: autonomo.userId,
        name: 'Minha rotina',
        status: 'draft', // NÃO released
      })
      .select('id, status')
      .single();
    expect(error).toBeNull();
    expect(plan?.status).toBe('draft');

    // Ele enxerga a ficha mesmo em draft, pelo ramo trainer/master do SELECT.
    const { data } = await autonomo.client
      .from('workout_plans')
      .select('id')
      .eq('id', plan!.id);
    expect(data ?? []).toHaveLength(1);
  });

  // --- (2) isolamento cross-tenant ------------------------------------------
  it('autônomo NÃO enxerga conteúdo de outro tenant', async () => {
    const { data: planOutro } = await outroTenant.client
      .from('workout_plans')
      .insert({
        tenant_id: outroTenant.tenantId,
        student_id: outroTenant.userId,
        trainer_id: outroTenant.userId,
        name: 'Ficha de outro tenant',
        status: 'released',
      })
      .select('id')
      .single();

    const { data } = await autonomo.client
      .from('workout_plans')
      .select('id')
      .eq('id', planOutro!.id);
    expect(data ?? []).toHaveLength(0);
  });

  // --- (3) cenário 8: troca de vínculo NÃO remove histórico (FR-B4.2/DA-7) ---
  it('cenário 8: mudar role/tenant_id/trainer_id do profile NÃO remove histórico em A nem em B', async () => {
    // Profile com histórico no tenant A (um aluno vinculado ao master de A).
    const masterA = await createMaster(admin, `b-mA-${suffix}@flvxus.test`, 'senha-mA-1');
    const masterB = await createMaster(admin, `b-mB-${suffix}@flvxus.test`, 'senha-mB-1');

    const { data: sujeito } = await admin.auth.admin.createUser({
      email: `b-sujeito-${suffix}@flvxus.test`,
      password: 'senha-sujeito',
      email_confirm: true,
      user_metadata: { role: 'student', full_name: 'Sujeito' },
    });
    const sujeitoId = sujeito.user!.id;
    await admin.from('profiles').insert({
      user_id: sujeitoId,
      tenant_id: masterA.tenantId,
      role: 'student',
      trainer_id: masterA.userId,
      status: 'active',
      full_name: 'Sujeito',
      email: `b-sujeito-${suffix}@flvxus.test`,
    });

    // Semeia histórico no tenant A.
    const { data: sess } = await admin
      .from('workout_sessions')
      .insert({
        tenant_id: masterA.tenantId,
        student_id: sujeitoId,
        started_at: new Date(Date.now() - 3600_000).toISOString(),
        finished_at: new Date().toISOString(),
      })
      .select('id')
      .single();
    const { data: assess } = await admin
      .from('physical_assessments')
      .insert({
        tenant_id: masterA.tenantId,
        student_id: sujeitoId,
        trainer_id: masterA.userId,
        weight_kg: 80,
      })
      .select('id')
      .single();
    const { data: ach } = await admin
      .from('achievements')
      .select('id')
      .eq('tenant_id', masterA.tenantId)
      .limit(1)
      .single();
    const { data: ua } = await admin
      .from('user_achievements')
      .insert({
        tenant_id: masterA.tenantId,
        student_id: sujeitoId,
        achievement_id: ach!.id,
      })
      .select('id')
      .single();

    const sessId = sess!.id;
    const assessId = assess!.id;
    const uaId = ua!.id;

    // Conta inicial de histórico no tenant A.
    const countA = async () => {
      const [s, a, u] = await Promise.all([
        admin.from('workout_sessions').select('id').eq('id', sessId),
        admin.from('physical_assessments').select('id').eq('id', assessId),
        admin.from('user_achievements').select('id').eq('id', uaId),
      ]);
      return (s.data ?? []).length + (a.data ?? []).length + (u.data ?? []).length;
    };
    expect(await countA()).toBe(3);

    // Troca de vínculo: autônomo->vinculado e o inverso, via UPDATE do profile.
    // (a) vira AUTÔNOMO (sai do vínculo com o master de A).
    await admin
      .from('profiles')
      .update({ role: 'trainer', is_tenant_master: true, account_type: 'self_managed', trainer_id: null })
      .eq('user_id', sujeitoId);
    expect(await countA()).toBe(3); // nada removido em A

    // (b) vira VINCULADO ao tenant B (muda tenant_id e trainer_id).
    await admin
      .from('profiles')
      .update({ role: 'student', is_tenant_master: false, account_type: 'professional', tenant_id: masterB.tenantId, trainer_id: masterB.userId })
      .eq('user_id', sujeitoId);
    expect(await countA()).toBe(3); // histórico de A permanece intacto

    // Nenhum histórico foi criado espúrio no tenant B pela troca.
    const { data: histB } = await admin
      .from('workout_sessions')
      .select('id')
      .eq('tenant_id', masterB.tenantId)
      .eq('student_id', sujeitoId);
    expect(histB ?? []).toHaveLength(0);

    // Cleanup.
    await admin.auth.admin.deleteUser(sujeitoId);
    await admin.auth.admin.deleteUser(masterA.userId);
    await admin.auth.admin.deleteUser(masterB.userId);
  });

  // --- (4) backstop: student em tenant self_managed é recusado pelo trigger --
  it('backstop: inserir role=student em tenant cujo master é self_managed FALHA', async () => {
    const { data: vitima } = await admin.auth.admin.createUser({
      email: `b-vitima-${suffix}@flvxus.test`,
      password: 'senha-vitima',
      email_confirm: true,
      user_metadata: { role: 'student', full_name: 'Vítima' },
    });
    const vitimaId = vitima.user!.id;

    const { error } = await admin.from('profiles').insert({
      user_id: vitimaId,
      tenant_id: autonomo.tenantId, // tenant cujo master é self_managed
      role: 'student',
      trainer_id: autonomo.userId,
      status: 'active',
      full_name: 'Vítima',
      email: `b-vitima-${suffix}@flvxus.test`,
    });
    expect(error).not.toBeNull(); // trigger enforce_self_managed_no_students barra

    await admin.auth.admin.deleteUser(vitimaId);
  });
});
