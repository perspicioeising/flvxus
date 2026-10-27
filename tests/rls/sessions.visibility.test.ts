// =============================================================================
// Flvxus — FEAT-001: RLS do HISTÓRICO (workout_sessions/workout_set_logs)
// ancorada na visibilidade do CADASTRO do aluno (módulo "students") — MANUAL
// =============================================================================
// DECISÃO DO USUÁRIO (mensagem #1): o histórico de treinos fica visível ao
// professor ATRAVÉS do cadastro do aluno; se o cadastro do aluno não estiver
// visível, o professor NÃO tem acesso ao histórico. Logo o ramo trainer do
// SELECT de sessões/logs usa a MESMA regra do módulo "students":
//   app_is_master() OR app_module_is_open('students')
//                   OR (o aluno da sessão é um student cujo trainer_id = ele).
//
// Prova as invariantes (migration 20261022091100_rls_sessions_conditional_visibility):
//   (a) students BLOQUEADO => filiado A NÃO vê sessão de aluno cadastrado por B;
//   (b) students BLOQUEADO => filiado A VÊ sessão do PRÓPRIO aluno dele;
//   (c) MASTER vê TUDO, em qualquer estado;
//   (d) students LIBERADO  => filiado A vê sessões de alunos de B (tenant-wide);
//   (e) o ALUNO vê SÓ as próprias sessões (ramo verbatim preservado);
//   (f) workout_set_logs segue a visibilidade da sessão pai (mesmo predicado);
//   (g) isolamento entre tenants preservado (outro tenant => vazio).
//
// ESTADO: o ambiente atual NÃO tem Docker; a suíte fica em `describe.skip` (ver
// tests/rls/README.md). PASSO MANUAL para rodar de verdade:
//   1. npx supabase start
//   2. npx supabase db reset   (aplica as migrations, incluindo esta FEAT-001)
//   3. export SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY
//      (valores impressos por `supabase status`; NUNCA commitar)
//   4. troque `describe.skip` por `describe` e rode `npm run test:rls`
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
    user_metadata: { role: 'trainer', is_affiliate: 'true', full_name: email },
  });
  if (error || !data.user) throw error ?? new Error('falha ao criar filiado');

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

/** Cria um ALUNO no tenant, com trainer_id = autor do cadastro. Retorna o Actor logado. */
async function createStudent(
  admin: Db,
  tenantId: string,
  trainerId: string,
  email: string,
  password: string,
): Promise<Actor> {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: 'student', full_name: email },
  });
  if (error || !data.user) throw error ?? new Error('falha ao criar aluno');

  const { error: ierr } = await admin.from('profiles').insert({
    user_id: data.user.id,
    tenant_id: tenantId,
    role: 'student',
    trainer_id: trainerId,
    status: 'active',
    full_name: email,
    email,
  });
  if (ierr) throw ierr;

  const client = createClient<Database>(SUPABASE_URL, ANON_KEY);
  await client.auth.signInWithPassword({ email, password });
  return { userId: data.user.id, tenantId, client };
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

/** Cria uma sessão FINALIZADA do aluno (via service_role) e um set log. Retorna ids. */
async function seedSessao(
  admin: Db,
  tenantId: string,
  studentId: string,
): Promise<{ sessionId: string }> {
  const { data: sess, error: serr } = await admin
    .from('workout_sessions')
    .insert({
      tenant_id: tenantId,
      student_id: studentId,
      started_at: new Date(Date.now() - 3600_000).toISOString(),
      finished_at: new Date().toISOString(),
    })
    .select('id')
    .single();
  if (serr || !sess) throw serr ?? new Error('falha ao criar sessão');

  const { error: lerr } = await admin.from('workout_set_logs').insert({
    session_id: sess.id,
    set_number: 1,
    reps_done: 10,
    load_done: 30,
    completed: true,
  });
  if (lerr) throw lerr;

  return { sessionId: sess.id };
}

describe.skip('FEAT-001 — RLS do histórico via cadastro do aluno (requer Supabase local)', () => {
  let admin: Db;
  let master: Actor;
  let filA: Actor;
  let filB: Actor;
  let masterOutro: Actor;
  let alunoDeA: Actor;
  let alunoDeB: Actor;
  let sessaoDeA: { sessionId: string };
  let sessaoDeB: { sessionId: string };
  const suffix = Date.now();

  beforeAll(async () => {
    if (!hasLocalDb) return;
    admin = createClient<Database>(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    master = await createMaster(admin, `s-master-${suffix}@flvxus.test`, 'senha-master-1');
    filA = await createAffiliate(admin, master, `s-fil-a-${suffix}@flvxus.test`, 'senha-fil-a1');
    filB = await createAffiliate(admin, master, `s-fil-b-${suffix}@flvxus.test`, 'senha-fil-b1');
    masterOutro = await createMaster(admin, `s-master2-${suffix}@flvxus.test`, 'senha-master-2');

    alunoDeA = await createStudent(
      admin, master.tenantId, filA.userId, `s-aluno-a-${suffix}@flvxus.test`, 'senha-aluno-a',
    );
    alunoDeB = await createStudent(
      admin, master.tenantId, filB.userId, `s-aluno-b-${suffix}@flvxus.test`, 'senha-aluno-b',
    );
    sessaoDeA = await seedSessao(admin, master.tenantId, alunoDeA.userId);
    sessaoDeB = await seedSessao(admin, master.tenantId, alunoDeB.userId);
  });

  afterAll(async () => {
    if (!hasLocalDb) return;
    for (const a of [alunoDeA, alunoDeB, filA, filB, master, masterOutro]) {
      if (a?.userId) await admin.auth.admin.deleteUser(a.userId);
    }
  });

  it('students BLOQUEADO: filiado A NÃO vê sessão de aluno cadastrado por B', async () => {
    await setVisibility(admin, master.tenantId, 'students', false);
    const { data } = await filA.client
      .from('workout_sessions')
      .select('id')
      .eq('id', sessaoDeB.sessionId);
    expect(data ?? []).toHaveLength(0);
  });

  it('students BLOQUEADO: filiado A VÊ a sessão do PRÓPRIO aluno dele', async () => {
    await setVisibility(admin, master.tenantId, 'students', false);
    const { data } = await filA.client
      .from('workout_sessions')
      .select('id')
      .eq('id', sessaoDeA.sessionId);
    expect(data ?? []).toHaveLength(1);
  });

  it('students BLOQUEADO: master vê a sessão de qualquer aluno do tenant', async () => {
    await setVisibility(admin, master.tenantId, 'students', false);
    const { data } = await master.client
      .from('workout_sessions')
      .select('id')
      .eq('id', sessaoDeB.sessionId);
    expect(data ?? []).toHaveLength(1);
  });

  it('students LIBERADO: filiado A vê a sessão de aluno de B (tenant-wide)', async () => {
    await setVisibility(admin, master.tenantId, 'students', true);
    const { data } = await filA.client
      .from('workout_sessions')
      .select('id')
      .eq('id', sessaoDeB.sessionId);
    expect(data ?? []).toHaveLength(1);
  });

  it('aluno vê SÓ as próprias sessões (ramo verbatim preservado)', async () => {
    await setVisibility(admin, master.tenantId, 'students', false);
    const { data: propria } = await alunoDeA.client
      .from('workout_sessions')
      .select('id')
      .eq('id', sessaoDeA.sessionId);
    expect(propria ?? []).toHaveLength(1);

    const { data: alheia } = await alunoDeA.client
      .from('workout_sessions')
      .select('id')
      .eq('id', sessaoDeB.sessionId);
    expect(alheia ?? []).toHaveLength(0);
  });

  it('workout_set_logs segue a visibilidade da sessão pai', async () => {
    await setVisibility(admin, master.tenantId, 'students', false);
    // Filiado A não vê logs da sessão do aluno de B...
    const { data: bloq } = await filA.client
      .from('workout_set_logs')
      .select('id')
      .eq('session_id', sessaoDeB.sessionId);
    expect(bloq ?? []).toHaveLength(0);

    // ...mas vê os logs da sessão do próprio aluno dele.
    const { data: ok } = await filA.client
      .from('workout_set_logs')
      .select('id')
      .eq('session_id', sessaoDeA.sessionId);
    expect((ok ?? []).length).toBeGreaterThanOrEqual(1);
  });

  it('isolamento entre tenants: master de outro tenant não vê sessões deste tenant', async () => {
    await setVisibility(admin, master.tenantId, 'students', true);
    const { data } = await masterOutro.client
      .from('workout_sessions')
      .select('id')
      .eq('id', sessaoDeA.sessionId);
    expect(data ?? []).toHaveLength(0);
  });
});
