// =============================================================================
// Flvxus v2 — Harness de RLS (invariantes críticas)
// =============================================================================
// Prova que o RLS do banco garante:
//   (a) zero acesso cruzado entre professores (isolamento de tenant);
//   (b) aluno só vê os próprios dados;
//   (c) aluno só vê workout_plans/diets quando status = 'released'.
//
// ESTADO: o ambiente atual NÃO tem Docker, então o Supabase local não sobe e a
// suíte fica em `describe.skip` (ver tests/rls/README.md e docs/pendencias.md).
// O corpo dos testes já está escrito; com Docker, siga o README e troque
// `describe.skip` por `describe` para executá-los contra o banco local.
//
// Convenção de ambiente (nunca commitar valores reais):
//   SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
// =============================================================================

import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../types/database.types';

const SUPABASE_URL = process.env.SUPABASE_URL ?? '';
const ANON_KEY = process.env.SUPABASE_ANON_KEY ?? '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

// Só roda de verdade quando as três variáveis existem (= banco local disponível).
const hasLocalDb = Boolean(SUPABASE_URL && ANON_KEY && SERVICE_ROLE_KEY);

type Db = SupabaseClient<Database>;

interface Actor {
  userId: string;
  tenantId: string;
  client: Db;
}

// Cria um usuário via service_role (admin) e devolve um client autenticado como ele.
async function createTrainer(admin: Db, email: string, password: string): Promise<Actor> {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: email },
  });
  if (error || !data.user) throw error ?? new Error('falha ao criar professor');

  // handle_new_user cria tenant + profile(role=trainer) automaticamente.
  const { data: profile, error: perr } = await admin
    .from('profiles')
    .select('tenant_id')
    .eq('user_id', data.user.id)
    .single();
  if (perr || !profile) throw perr ?? new Error('profile do professor não criado');

  const client = createClient<Database>(SUPABASE_URL, ANON_KEY);
  await client.auth.signInWithPassword({ email, password });
  return { userId: data.user.id, tenantId: profile.tenant_id, client };
}

// Cria um aluno no tenant do professor (simula o fluxo service_role do §4.4).
async function createStudent(
  admin: Db,
  trainer: Actor,
  email: string,
  password: string,
): Promise<Actor> {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error || !data.user) throw error ?? new Error('falha ao criar aluno');

  // O trigger também cria tenant+profile para este usuário; corrigimos o profile
  // para que ele seja ALUNO do tenant do professor (o fluxo real faz isso via
  // service_role carimbando tenant_id/trainer_id).
  const { error: uerr } = await admin
    .from('profiles')
    .update({ role: 'student', tenant_id: trainer.tenantId, trainer_id: trainer.userId, status: 'active' })
    .eq('user_id', data.user.id);
  if (uerr) throw uerr;

  const client = createClient<Database>(SUPABASE_URL, ANON_KEY);
  await client.auth.signInWithPassword({ email, password });
  return { userId: data.user.id, tenantId: trainer.tenantId, client };
}

describe.skip('RLS — invariantes críticas (requer Supabase local)', () => {
  let admin: Db;
  let trainerA: Actor;
  let trainerB: Actor;
  let studentA1: Actor;
  let studentA2: Actor;
  const suffix = Date.now();

  beforeAll(async () => {
    if (!hasLocalDb) return;
    admin = createClient<Database>(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    trainerA = await createTrainer(admin, `trainer-a-${suffix}@flvxus.test`, 'senha-forte-A1');
    trainerB = await createTrainer(admin, `trainer-b-${suffix}@flvxus.test`, 'senha-forte-B1');
    studentA1 = await createStudent(admin, trainerA, `aluno-a1-${suffix}@flvxus.test`, 'senha-aluno-1');
    studentA2 = await createStudent(admin, trainerA, `aluno-a2-${suffix}@flvxus.test`, 'senha-aluno-2');
  });

  afterAll(async () => {
    if (!hasLocalDb) return;
    // Limpeza: remover os usuários criados (tenants/profiles caem por cascade).
    for (const a of [studentA1, studentA2, trainerA, trainerB]) {
      if (a?.userId) await admin.auth.admin.deleteUser(a.userId);
    }
  });

  it('professor B não enxerga alunos do professor A', async () => {
    const { data } = await trainerB.client
      .from('profiles')
      .select('user_id')
      .eq('user_id', studentA1.userId);
    expect(data ?? []).toHaveLength(0);
  });

  it('professor B não enxerga avaliações do tenant de A', async () => {
    // A cria uma avaliação do seu aluno.
    await trainerA.client.from('physical_assessments').insert({
      tenant_id: trainerA.tenantId,
      student_id: studentA1.userId,
      trainer_id: trainerA.userId,
      weight_kg: 80,
    });
    const { data } = await trainerB.client
      .from('physical_assessments')
      .select('id')
      .eq('student_id', studentA1.userId);
    expect(data ?? []).toHaveLength(0);
  });

  it('professor B não consegue alterar dados de alunos de A', async () => {
    const { data } = await trainerB.client
      .from('profiles')
      .update({ status: 'archived' })
      .eq('user_id', studentA1.userId)
      .select('user_id');
    // RLS bloqueia: nenhuma linha afetada.
    expect(data ?? []).toHaveLength(0);
  });

  it('aluno A1 não enxerga dados do aluno A2 (mesmo tenant)', async () => {
    const { data } = await studentA1.client
      .from('physical_assessments')
      .select('id')
      .eq('student_id', studentA2.userId);
    expect(data ?? []).toHaveLength(0);
  });

  it('aluno NÃO vê workout_plan em rascunho', async () => {
    const { data: plan } = await trainerA.client
      .from('workout_plans')
      .insert({
        tenant_id: trainerA.tenantId,
        student_id: studentA1.userId,
        trainer_id: trainerA.userId,
        name: 'Plano rascunho',
        status: 'draft',
      })
      .select('id')
      .single();

    const { data } = await studentA1.client
      .from('workout_plans')
      .select('id')
      .eq('id', plan!.id);
    expect(data ?? []).toHaveLength(0);
  });

  it('aluno VÊ workout_plan quando status = released', async () => {
    const { data: plan } = await trainerA.client
      .from('workout_plans')
      .insert({
        tenant_id: trainerA.tenantId,
        student_id: studentA1.userId,
        trainer_id: trainerA.userId,
        name: 'Plano liberado',
        status: 'released',
        released_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    const { data } = await studentA1.client
      .from('workout_plans')
      .select('id')
      .eq('id', plan!.id);
    expect(data ?? []).toHaveLength(1);
  });

  it('aluno NÃO vê dieta em rascunho, mas VÊ quando liberada', async () => {
    const { data: draft } = await trainerA.client
      .from('diets')
      .insert({
        tenant_id: trainerA.tenantId,
        student_id: studentA1.userId,
        trainer_id: trainerA.userId,
        status: 'draft',
      })
      .select('id')
      .single();

    const { data: released } = await trainerA.client
      .from('diets')
      .insert({
        tenant_id: trainerA.tenantId,
        student_id: studentA1.userId,
        trainer_id: trainerA.userId,
        status: 'released',
        released_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    const { data: hidden } = await studentA1.client.from('diets').select('id').eq('id', draft!.id);
    const { data: visible } = await studentA1.client.from('diets').select('id').eq('id', released!.id);
    expect(hidden ?? []).toHaveLength(0);
    expect(visible ?? []).toHaveLength(1);
  });

  // ---------------------------------------------------------------------------
  // terms_acceptances — imutabilidade + RLS (Fase 2.3, design.md §2.15-B)
  // ---------------------------------------------------------------------------

  it('aceite: usuário grava o próprio e não lê o de outro', async () => {
    await studentA1.client.from('terms_acceptances').insert({
      user_id: studentA1.userId,
      tenant_id: trainerA.tenantId,
      document_type: 'terms',
      document_version: '1.0',
    });

    // O próprio aluno lê o seu aceite.
    const { data: proprios } = await studentA1.client
      .from('terms_acceptances')
      .select('id')
      .eq('user_id', studentA1.userId);
    expect((proprios ?? []).length).toBeGreaterThanOrEqual(1);

    // O aluno A2 (mesmo tenant, não trainer) não lê o aceite de A1.
    const { data: alheios } = await studentA2.client
      .from('terms_acceptances')
      .select('id')
      .eq('user_id', studentA1.userId);
    expect(alheios ?? []).toHaveLength(0);
  });

  it('aceite: trainer lê os aceites dos alunos do próprio tenant', async () => {
    const { data } = await trainerA.client
      .from('terms_acceptances')
      .select('id')
      .eq('user_id', studentA1.userId);
    expect((data ?? []).length).toBeGreaterThanOrEqual(1);

    // Trainer B (outro tenant) não enxerga.
    const { data: outro } = await trainerB.client
      .from('terms_acceptances')
      .select('id')
      .eq('user_id', studentA1.userId);
    expect(outro ?? []).toHaveLength(0);
  });

  it('aceite: INSERT com user_id ≠ auth.uid() é negado', async () => {
    const { error } = await studentA2.client.from('terms_acceptances').insert({
      user_id: studentA1.userId, // forjando outro usuário
      tenant_id: trainerA.tenantId,
      document_type: 'privacy',
      document_version: '1.0',
    });
    expect(error).not.toBeNull();
  });

  it('aceite: UPDATE é bloqueado pelo trigger (append-only), inclusive service_role', async () => {
    const { data: linha } = await admin
      .from('terms_acceptances')
      .select('id')
      .eq('user_id', studentA1.userId)
      .limit(1)
      .single();

    const { error } = await admin
      .from('terms_acceptances')
      .update({ document_version: '9.9' })
      .eq('id', linha!.id);
    expect(error).not.toBeNull();
  });

  it('aceite: reenvio da mesma versão vira no-op pelo índice único', async () => {
    const { error } = await studentA1.client
      .from('terms_acceptances')
      .upsert(
        {
          user_id: studentA1.userId,
          tenant_id: trainerA.tenantId,
          document_type: 'terms',
          document_version: '1.0',
        },
        { onConflict: 'user_id,document_type,document_version', ignoreDuplicates: true },
      );
    expect(error).toBeNull();

    const { data } = await studentA1.client
      .from('terms_acceptances')
      .select('id')
      .eq('user_id', studentA1.userId)
      .eq('document_type', 'terms')
      .eq('document_version', '1.0');
    expect(data ?? []).toHaveLength(1);
  });

  it('aceite: DELETE do titular via service_role/cascade funciona', async () => {
    // Cria um usuário descartável com um aceite e o remove por cascade.
    const { data: criado } = await admin.auth.admin.createUser({
      email: `aceite-del-${suffix}@flvxus.test`,
      password: 'senha-descartavel',
      email_confirm: true,
    });
    const descartavelId = criado.user!.id;
    await admin.from('terms_acceptances').insert({
      user_id: descartavelId,
      document_type: 'terms',
      document_version: '1.0',
    });

    const { error } = await admin.auth.admin.deleteUser(descartavelId);
    expect(error).toBeNull();

    const { data } = await admin
      .from('terms_acceptances')
      .select('id')
      .eq('user_id', descartavelId);
    expect(data ?? []).toHaveLength(0);
  });
});
