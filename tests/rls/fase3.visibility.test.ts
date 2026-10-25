// =============================================================================
// Flvxus — Fase 3: RLS condicional por módulo (master/filiado) — AUTORADO/MANUAL
// =============================================================================
// Prova as invariantes da visibilidade por módulo:
//   (a) LIBERADO  => filiado A enxerga os registros do filiado B (visão geral);
//   (b) BLOQUEADO => filiado A enxerga apenas os registros que ELE cadastrou;
//   (c) o MASTER sempre enxerga TUDO, irrestrito;
//   (d) UPDATE/DELETE também respeitam a autoria no BLOQUEADO (opção b, MED #4);
//   (e) o ALUNO mantém acesso aos exercícios do tenant (MED #3);
//   (f) o filiado NÃO lê tenant_module_visibility nem subscriptions;
//   (g) isolamento entre tenants preservado.
//
// ESTADO: o ambiente atual NÃO tem Docker; a suíte fica em `describe.skip` (ver
// tests/rls/README.md e docs/pendencias.md). O corpo já está escrito: com banco
// local, siga o README e troque `describe.skip` por `describe`.
//
// Convenção de ambiente (nunca commitar valores reais):
//   SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
// =============================================================================

import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database, VisibilityModule } from '../../types/database.types';

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

/** Cria um trainer master (handle_new_user cria tenant + profile master). */
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

/** Cria um FILIADO (trainer não-master) no tenant do master (fluxo service_role). */
async function createAffiliate(
  admin: Db,
  master: Actor,
  email: string,
  password: string,
): Promise<Actor> {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    // is_affiliate='true' faz handle_new_user NÃO criar tenant próprio.
    user_metadata: { role: 'trainer', is_affiliate: 'true', full_name: email },
  });
  if (error || !data.user) throw error ?? new Error('falha ao criar filiado');

  // O profile do filiado é inserido pela action (service_role) no tenant do master.
  const { error: ierr } = await admin.from('profiles').insert({
    user_id: data.user.id,
    tenant_id: master.tenantId,
    role: 'trainer',
    is_tenant_master: false,
    full_name: email,
    email,
  });
  if (ierr) throw ierr;

  const client = createClient<Database>(SUPABASE_URL, ANON_KEY);
  await client.auth.signInWithPassword({ email, password });
  return { userId: data.user.id, tenantId: master.tenantId, client };
}

/** Define o estado de visibilidade de um módulo do tenant (service_role). */
async function setVisibility(
  admin: Db,
  tenantId: string,
  module: VisibilityModule,
  isOpen: boolean,
): Promise<void> {
  const { error } = await admin
    .from('tenant_module_visibility')
    .upsert({ tenant_id: tenantId, module, is_open: isOpen }, { onConflict: 'tenant_id,module' });
  if (error) throw error;
}

describe.skip('Fase 3 — RLS condicional por módulo (requer Supabase local)', () => {
  let admin: Db;
  let master: Actor;
  let filA: Actor;
  let filB: Actor;
  let masterOutro: Actor;
  const suffix = Date.now();

  beforeAll(async () => {
    if (!hasLocalDb) return;
    admin = createClient<Database>(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    master = await createMaster(admin, `master-${suffix}@flvxus.test`, 'senha-master-1');
    filA = await createAffiliate(admin, master, `fil-a-${suffix}@flvxus.test`, 'senha-fil-a1');
    filB = await createAffiliate(admin, master, `fil-b-${suffix}@flvxus.test`, 'senha-fil-b1');
    masterOutro = await createMaster(admin, `master2-${suffix}@flvxus.test`, 'senha-master-2');
  });

  afterAll(async () => {
    if (!hasLocalDb) return;
    for (const a of [filA, filB, master, masterOutro]) {
      if (a?.userId) await admin.auth.admin.deleteUser(a.userId);
    }
  });

  // --- workouts: LIBERADO vs BLOQUEADO + master irrestrito ------------------
  it('workouts LIBERADO: filiado A vê o treino criado pelo filiado B', async () => {
    await setVisibility(admin, master.tenantId, 'workouts', true);
    const { data: wk } = await filB.client
      .from('workouts')
      .insert({ tenant_id: filB.tenantId, name: 'Treino do B', created_by: filB.userId })
      .select('id')
      .single();

    const { data } = await filA.client.from('workouts').select('id').eq('id', wk!.id);
    expect(data ?? []).toHaveLength(1);
  });

  it('workouts BLOQUEADO: filiado A NÃO vê treino do B; master vê', async () => {
    await setVisibility(admin, master.tenantId, 'workouts', false);
    const { data: wk } = await filB.client
      .from('workouts')
      .insert({ tenant_id: filB.tenantId, name: 'Treino privado do B', created_by: filB.userId })
      .select('id')
      .single();

    const { data: visToA } = await filA.client.from('workouts').select('id').eq('id', wk!.id);
    expect(visToA ?? []).toHaveLength(0);

    const { data: visToMaster } = await master.client.from('workouts').select('id').eq('id', wk!.id);
    expect(visToMaster ?? []).toHaveLength(1);

    // O próprio autor (B) continua vendo o seu.
    const { data: visToB } = await filB.client.from('workouts').select('id').eq('id', wk!.id);
    expect(visToB ?? []).toHaveLength(1);
  });

  // --- UPDATE/DELETE também por autoria no BLOQUEADO (MED #4, opção b) -------
  it('workouts BLOQUEADO: filiado A NÃO consegue UPDATE/DELETE de treino do B; master sim', async () => {
    await setVisibility(admin, master.tenantId, 'workouts', false);
    const { data: wk } = await filB.client
      .from('workouts')
      .insert({ tenant_id: filB.tenantId, name: 'Alvo', created_by: filB.userId })
      .select('id')
      .single();

    const { data: upd } = await filA.client
      .from('workouts')
      .update({ name: 'Hackeado' })
      .eq('id', wk!.id)
      .select('id');
    expect(upd ?? []).toHaveLength(0); // RLS barra o UPDATE

    const { data: del } = await filA.client
      .from('workouts')
      .delete()
      .eq('id', wk!.id)
      .select('id');
    expect(del ?? []).toHaveLength(0); // RLS barra o DELETE

    // Master edita irrestrito.
    const { data: updMaster } = await master.client
      .from('workouts')
      .update({ name: 'Ajustado pelo master' })
      .eq('id', wk!.id)
      .select('id');
    expect(updMaster ?? []).toHaveLength(1);
  });

  // --- alunos (profiles) ----------------------------------------------------
  it('students BLOQUEADO: filiado A não vê aluno cadastrado por B; LIBERADO sim', async () => {
    // Aluno cujo autor (trainer_id) é o filiado B.
    const { data: aluno } = await admin.auth.admin.createUser({
      email: `aluno-b-${suffix}@flvxus.test`,
      password: 'senha-aluno-b',
      email_confirm: true,
      user_metadata: { role: 'student' },
    });
    await admin.from('profiles').insert({
      user_id: aluno.user!.id,
      tenant_id: master.tenantId,
      role: 'student',
      trainer_id: filB.userId,
      status: 'active',
    });

    await setVisibility(admin, master.tenantId, 'students', false);
    const { data: bloq } = await filA.client
      .from('profiles')
      .select('user_id')
      .eq('user_id', aluno.user!.id);
    expect(bloq ?? []).toHaveLength(0);

    await setVisibility(admin, master.tenantId, 'students', true);
    const { data: lib } = await filA.client
      .from('profiles')
      .select('user_id')
      .eq('user_id', aluno.user!.id);
    expect(lib ?? []).toHaveLength(1);

    await admin.auth.admin.deleteUser(aluno.user!.id);
  });

  // --- exercises: ALUNO mantém acesso (MED #3) ------------------------------
  it('exercises: aluno do tenant lê exercício do tenant mesmo com módulo BLOQUEADO', async () => {
    await setVisibility(admin, master.tenantId, 'exercises', false);

    const { data: ex } = await master.client
      .from('exercises')
      .insert({ tenant_id: master.tenantId, name: 'Supino', created_by: master.userId })
      .select('id')
      .single();

    // Cria um aluno no tenant.
    const { data: aluno } = await admin.auth.admin.createUser({
      email: `aluno-ex-${suffix}@flvxus.test`,
      password: 'senha-aluno-ex',
      email_confirm: true,
      user_metadata: { role: 'student' },
    });
    await admin.from('profiles').insert({
      user_id: aluno.user!.id,
      tenant_id: master.tenantId,
      role: 'student',
      trainer_id: master.userId,
      status: 'active',
    });
    const alunoClient = createClient<Database>(SUPABASE_URL, ANON_KEY);
    await alunoClient.auth.signInWithPassword({
      email: `aluno-ex-${suffix}@flvxus.test`,
      password: 'senha-aluno-ex',
    });

    const { data } = await alunoClient.from('exercises').select('id').eq('id', ex!.id);
    expect(data ?? []).toHaveLength(1); // aluno NÃO é regredido (MED #3)

    await admin.auth.admin.deleteUser(aluno.user!.id);
  });

  // --- config/billing não legíveis pelo filiado -----------------------------
  it('filiado NÃO lê tenant_module_visibility nem subscriptions; master lê', async () => {
    const { data: visFil } = await filA.client.from('tenant_module_visibility').select('module');
    expect(visFil ?? []).toHaveLength(0);

    const { data: visMaster } = await master.client
      .from('tenant_module_visibility')
      .select('module');
    expect((visMaster ?? []).length).toBeGreaterThanOrEqual(5);

    const { data: subFil } = await filA.client.from('subscriptions').select('tenant_id');
    expect(subFil ?? []).toHaveLength(0);
  });

  // --- isolamento entre tenants ---------------------------------------------
  it('master de outro tenant não vê treinos deste tenant', async () => {
    await setVisibility(admin, master.tenantId, 'workouts', true);
    const { data: wk } = await master.client
      .from('workouts')
      .insert({ tenant_id: master.tenantId, name: 'Treino do tenant 1', created_by: master.userId })
      .select('id')
      .single();

    const { data } = await masterOutro.client.from('workouts').select('id').eq('id', wk!.id);
    expect(data ?? []).toHaveLength(0);
  });

  // --- enforcement de limite no banco (can_add_affiliate) -------------------
  it('can_add_affiliate: Solo (0) sempre bloqueia; Equipe ativo libera até o limite', async () => {
    const { data: planSolo } = await admin.from('plans').select('id').eq('tier', 'solo').single();
    const { data: planTeam } = await admin
      .from('plans')
      .select('id, max_affiliates')
      .eq('tier', 'team')
      .single();

    // Solo ATIVO => RPC retorna false mesmo com assinatura válida.
    await admin.from('subscriptions').upsert(
      { tenant_id: master.tenantId, plan_id: planSolo!.id, status: 'active' },
      { onConflict: 'tenant_id' },
    );
    const { data: solo } = await master.client.rpc('can_add_affiliate');
    expect(solo).toBe(false);

    // Equipe ATIVO (limite > 0). Com filA e filB ativos (2 usados), a RPC
    // deve respeitar o limite do plano Equipe (true enquanto usados < max).
    await admin.from('subscriptions').upsert(
      { tenant_id: master.tenantId, plan_id: planTeam!.id, status: 'active' },
      { onConflict: 'tenant_id' },
    );
    const { data: team } = await master.client.rpc('can_add_affiliate');
    const max = planTeam!.max_affiliates;
    if (max === null) {
      expect(team).toBe(true); // ilimitado
    } else {
      expect(team).toBe(2 < max);
    }

    // Sem assinatura ativa => false.
    await admin.from('subscriptions').upsert(
      { tenant_id: master.tenantId, plan_id: planTeam!.id, status: 'canceled' },
      { onConflict: 'tenant_id' },
    );
    const { data: cancelado } = await master.client.rpc('can_add_affiliate');
    expect(cancelado).toBe(false);
  });
});
