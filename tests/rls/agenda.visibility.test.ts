// =============================================================================
// Flvxus — Agenda Fase 1: RLS de appointments + funções agenda_* — MANUAL
// =============================================================================
// Migrations: 20261107090000 (enum), 20261107090100 (core + RLS), 20261107090200
// (funções SECURITY DEFINER + trigger de desvínculo).
//
// Invariantes provadas:
//   (a) aluno A não vê atendimento do aluno B;
//   (b) aluno não vê bloqueio nem compromisso pessoal do professor;
//   (c) professor e master não veem o pessoal do aluno;
//   (d) master não vê o bloqueio de um filiado;
//   (e) isolamento entre tenants;
//   (f) módulo 'agenda' aberto: filiado vê atendimentos do tenant; fechado: só os seus;
//   (g) M3 — agenda aberto + students fechado: filiado LÊ atendimento de terceiro,
//       mas NÃO edita/cancela (só master ou trainer_id do atendimento);
//   (h) insert/update/delete direto são negados (RLS só tem SELECT);
//   (i) agenda_create nega: tipo indevido, aluno de outro tenant, aluno arquivado,
//       aluno invisível ao filiado;
//   (j) passado é imutável (agenda_past);
//   (k) escopos occurrence | following | all (M2: data diferente de D é recusada);
//   (l) trigger de desvínculo cancela atendimentos futuros do aluno arquivado;
//   (m) filiado desativado: master vê e cancela os atendimentos futuros dele.
//
// ESTADO: sem Docker no ambiente atual, a suíte fica em `describe.skip` (ver
// tests/rls/README.md). PASSO MANUAL:
//   1. npx supabase start
//   2. npx supabase db reset   (aplica as migrations)
//   3. export SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY
//      (valores impressos por `supabase status`; NUNCA commitar)
//   4. troque `describe.skip` por `describe` e rode `npm run test:rls`
// =============================================================================
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { AppointmentKind, Database, VisibilityModule } from '../../types/database.types';

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

const HORA = 3600_000;
/** Instante futuro (daqui a `h` horas) em ISO. */
const emHoras = (h: number) => new Date(Date.now() + h * HORA).toISOString();

async function signIn(email: string, password: string): Promise<Db> {
  const client = createClient<Database>(SUPABASE_URL, ANON_KEY);
  await client.auth.signInWithPassword({ email, password });
  return client;
}

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
  return { userId: data.user.id, tenantId: profile.tenant_id, client: await signIn(email, password) };
}

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
  return { userId: data.user.id, tenantId: master.tenantId, client: await signIn(email, password) };
}

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
  return { userId: data.user.id, tenantId, client: await signIn(email, password) };
}

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

/** Chama agenda_create e devolve { id, error }. */
async function criar(
  actor: Actor,
  args: {
    kind: AppointmentKind;
    studentId?: string | null;
    title?: string | null;
    start?: string;
    end?: string;
    freq?: 'daily' | 'weekly' | 'monthly' | null;
    weekdays?: number[] | null;
    until?: string | null;
  },
) {
  const start = args.start ?? emHoras(24);
  const end = args.end ?? new Date(new Date(start).getTime() + HORA).toISOString();
  const { data, error } = await actor.client.rpc('agenda_create', {
    p_kind: args.kind,
    p_student_id: args.studentId ?? null,
    p_title: args.title ?? null,
    p_notes: null,
    p_location: null,
    p_starts_at: start,
    p_ends_at: end,
    p_recur_freq: args.freq ?? null,
    p_recur_weekdays: args.weekdays ?? null,
    p_recur_until: args.until ?? null,
  });
  return { id: (data as string | null) ?? null, error };
}

describe.skip('Agenda Fase 1 — RLS e funções agenda_* (requer Supabase local)', () => {
  let admin: Db;
  let master: Actor;
  let filA: Actor;
  let filB: Actor;
  let masterOutro: Actor;
  let alunoDeA: Actor;
  let alunoDeB: Actor;
  let alunoOutroTenant: Actor;
  const suffix = Date.now();

  beforeAll(async () => {
    if (!hasLocalDb) return;
    admin = createClient<Database>(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    master = await createMaster(admin, `ag-master-${suffix}@flvxus.test`, 'senha-master-1');
    filA = await createAffiliate(admin, master, `ag-fil-a-${suffix}@flvxus.test`, 'senha-fil-a1');
    filB = await createAffiliate(admin, master, `ag-fil-b-${suffix}@flvxus.test`, 'senha-fil-b1');
    masterOutro = await createMaster(admin, `ag-master2-${suffix}@flvxus.test`, 'senha-master-2');
    alunoDeA = await createStudent(
      admin, master.tenantId, filA.userId, `ag-aluno-a-${suffix}@flvxus.test`, 'senha-aluno-a',
    );
    alunoDeB = await createStudent(
      admin, master.tenantId, filB.userId, `ag-aluno-b-${suffix}@flvxus.test`, 'senha-aluno-b',
    );
    alunoOutroTenant = await createStudent(
      admin, masterOutro.tenantId, masterOutro.userId, `ag-aluno-x-${suffix}@flvxus.test`, 'senha-aluno-x',
    );
  });

  afterAll(async () => {
    if (!hasLocalDb) return;
    for (const a of [alunoDeA, alunoDeB, alunoOutroTenant, filA, filB, master, masterOutro]) {
      if (a?.userId) await admin.auth.admin.deleteUser(a.userId);
    }
  });

  // ---------------------------------------------------------------- leitura
  it('aluno A NÃO vê atendimento do aluno B; vê o próprio', async () => {
    const b = await criar(filB, { kind: 'in_person', studentId: alunoDeB.userId });
    const a = await criar(filA, { kind: 'online', studentId: alunoDeA.userId });
    expect(b.error).toBeNull();
    expect(a.error).toBeNull();
    const { data: vistoPorA } = await alunoDeA.client.from('appointments').select('id');
    const ids = (vistoPorA ?? []).map((r) => r.id);
    expect(ids).toContain(a.id);
    expect(ids).not.toContain(b.id);
  });

  it('aluno NÃO vê bloqueio nem compromisso pessoal do professor', async () => {
    const bloq = await criar(filA, { kind: 'block', title: 'Almoço' });
    const pess = await criar(filA, { kind: 'personal', title: 'Médico' });
    const { data } = await alunoDeA.client.from('appointments').select('id');
    const ids = (data ?? []).map((r) => r.id);
    expect(ids).not.toContain(bloq.id);
    expect(ids).not.toContain(pess.id);
  });

  it('professor e master NÃO veem o compromisso pessoal do aluno', async () => {
    const pess = await criar(alunoDeA, { kind: 'personal', title: 'Dentista' });
    expect(pess.error).toBeNull();
    for (const ator of [filA, master]) {
      const { data } = await ator.client.from('appointments').select('id').eq('id', pess.id!);
      expect(data ?? []).toHaveLength(0);
    }
    const { data: dono } = await alunoDeA.client.from('appointments').select('id').eq('id', pess.id!);
    expect(dono ?? []).toHaveLength(1);
  });

  it('master NÃO vê o bloqueio de um filiado', async () => {
    const bloq = await criar(filA, { kind: 'block', title: 'Folga' });
    const { data } = await master.client.from('appointments').select('id').eq('id', bloq.id!);
    expect(data ?? []).toHaveLength(0);
  });

  it('isolamento entre tenants: outro master não vê nada deste tenant', async () => {
    const at = await criar(filA, { kind: 'in_person', studentId: alunoDeA.userId });
    const { data } = await masterOutro.client.from('appointments').select('id').eq('id', at.id!);
    expect(data ?? []).toHaveLength(0);
    const { data: aluno } = await alunoOutroTenant.client.from('appointments').select('id').eq('id', at.id!);
    expect(aluno ?? []).toHaveLength(0);
  });

  it("módulo 'agenda' ABERTO: filiado B vê atendimento do filiado A; FECHADO: só os seus", async () => {
    const at = await criar(filA, { kind: 'in_person', studentId: alunoDeA.userId });
    await setVisibility(admin, master.tenantId, 'agenda', true);
    const { data: aberto } = await filB.client.from('appointments').select('id').eq('id', at.id!);
    expect(aberto ?? []).toHaveLength(1);

    await setVisibility(admin, master.tenantId, 'agenda', false);
    const { data: fechado } = await filB.client.from('appointments').select('id').eq('id', at.id!);
    expect(fechado ?? []).toHaveLength(0);
    const { data: dono } = await filA.client.from('appointments').select('id').eq('id', at.id!);
    expect(dono ?? []).toHaveLength(1);
    const { data: m } = await master.client.from('appointments').select('id').eq('id', at.id!);
    expect(m ?? []).toHaveLength(1);
  });

  it('M3: agenda ABERTO + students FECHADO: filiado B LÊ o atendimento, mas NÃO edita nem cancela', async () => {
    await setVisibility(admin, master.tenantId, 'agenda', true);
    await setVisibility(admin, master.tenantId, 'students', false);
    const at = await criar(filA, { kind: 'in_person', studentId: alunoDeA.userId });
    const { data } = await filB.client.from('appointments').select('id').eq('id', at.id!);
    expect(data ?? []).toHaveLength(1);

    const { error: eUpd } = await filB.client.rpc('agenda_update', {
      p_id: at.id!, p_scope: 'occurrence', p_original_date: null, p_title: 'x', p_notes: null,
      p_location: null, p_starts_at: emHoras(30), p_ends_at: emHoras(31),
      p_recur_freq: null, p_recur_weekdays: null, p_recur_until: null,
    });
    expect(eUpd?.message).toMatch(/agenda_forbidden/);
    const { error: eCan } = await filB.client.rpc('agenda_cancel', {
      p_id: at.id!, p_scope: 'occurrence', p_original_date: null,
    });
    expect(eCan?.message).toMatch(/agenda_forbidden/);

    // master pode cancelar atendimento de terceiro
    const { error: eMaster } = await master.client.rpc('agenda_cancel', {
      p_id: at.id!, p_scope: 'occurrence', p_original_date: null,
    });
    expect(eMaster).toBeNull();
    await setVisibility(admin, master.tenantId, 'students', true);
  });

  // ---------------------------------------------------------------- escrita direta
  it('insert/update/delete DIRETOS em appointments são negados', async () => {
    const at = await criar(filA, { kind: 'in_person', studentId: alunoDeA.userId });
    const { error: eIns } = await filA.client.from('appointments').insert({
      tenant_id: master.tenantId, owner_id: filA.userId, kind: 'block', title: 'x',
      starts_at: emHoras(2), ends_at: emHoras(3),
    });
    expect(eIns).not.toBeNull();
    const { error: eUpd } = await filA.client.from('appointments').update({ notes: 'x' }).eq('id', at.id!);
    expect(eUpd).not.toBeNull();
    const { error: eDel } = await filA.client.from('appointments').delete().eq('id', at.id!);
    expect(eDel).not.toBeNull();
    const { data } = await admin.from('appointments').select('id').eq('id', at.id!);
    expect(data ?? []).toHaveLength(1);
  });

  // ---------------------------------------------------------------- agenda_create
  it('agenda_create NEGA: aluno criando atendimento/bloqueio (tipo indevido)', async () => {
    const r1 = await criar(alunoDeA, { kind: 'in_person', studentId: alunoDeA.userId });
    expect(r1.error?.message).toMatch(/agenda_forbidden/);
    const r2 = await criar(alunoDeA, { kind: 'block', title: 'x' });
    expect(r2.error?.message).toMatch(/agenda_forbidden/);
  });

  it('agenda_create NEGA: aluno de outro tenant', async () => {
    const r = await criar(filA, { kind: 'in_person', studentId: alunoOutroTenant.userId });
    expect(r.error?.message).toMatch(/agenda_student_invalid/);
  });

  it('agenda_create NEGA: aluno arquivado', async () => {
    const { data: tmp } = await admin.auth.admin.createUser({
      email: `ag-arq-${suffix}@flvxus.test`, password: 'senha-arq-1', email_confirm: true,
      user_metadata: { role: 'student', full_name: 'arq' },
    });
    await admin.from('profiles').insert({
      user_id: tmp.user!.id, tenant_id: master.tenantId, role: 'student',
      trainer_id: filA.userId, status: 'archived', full_name: 'arq', email: `ag-arq-${suffix}@flvxus.test`,
    });
    const r = await criar(filA, { kind: 'in_person', studentId: tmp.user!.id });
    expect(r.error?.message).toMatch(/agenda_student_invalid/);
    await admin.auth.admin.deleteUser(tmp.user!.id);
  });

  it('agenda_create NEGA: aluno invisível ao filiado (students fechado, aluno de B)', async () => {
    await setVisibility(admin, master.tenantId, 'students', false);
    const r = await criar(filA, { kind: 'in_person', studentId: alunoDeB.userId });
    expect(r.error?.message).toMatch(/agenda_student_invalid/);
    await setVisibility(admin, master.tenantId, 'students', true);
  });

  // ---------------------------------------------------------------- passado
  it('passado é imutável: editar/cancelar compromisso já terminado => agenda_past', async () => {
    const { data, error } = await admin
      .from('appointments')
      .insert({
        tenant_id: master.tenantId, owner_id: filA.userId, kind: 'in_person',
        trainer_id: filA.userId, student_id: alunoDeA.userId,
        starts_at: emHoras(-5), ends_at: emHoras(-4),
      })
      .select('id')
      .single();
    expect(error).toBeNull();
    const { error: eCan } = await filA.client.rpc('agenda_cancel', {
      p_id: data!.id, p_scope: 'occurrence', p_original_date: null,
    });
    expect(eCan?.message).toMatch(/agenda_past/);
    const { error: eUpd } = await filA.client.rpc('agenda_update', {
      p_id: data!.id, p_scope: 'occurrence', p_original_date: null, p_title: null, p_notes: null,
      p_location: null, p_starts_at: emHoras(1), p_ends_at: emHoras(2),
      p_recur_freq: null, p_recur_weekdays: null, p_recur_until: null,
    });
    expect(eUpd?.message).toMatch(/agenda_past/);
  });

  // ---------------------------------------------------------------- escopos
  it('escopos: occurrence cria override; following faz split; all cancela série; M2 recusa data diferente', async () => {
    const inicio = emHoras(48);
    const serie = await criar(filA, {
      kind: 'in_person', studentId: alunoDeA.userId, start: inicio, freq: 'daily',
    });
    expect(serie.error).toBeNull();
    const { data: mestre } = await admin.from('appointments').select('starts_at, tz').eq('id', serie.id!).single();
    const dia = (iso: string) =>
      new Intl.DateTimeFormat('en-CA', { timeZone: mestre!.tz }).format(new Date(iso));
    const d1 = dia(mestre!.starts_at);
    const d2 = dia(new Date(new Date(mestre!.starts_at).getTime() + 24 * HORA).toISOString());

    // occurrence: cancela só d1 (cria override cancelado)
    const { error: eOcc } = await filA.client.rpc('agenda_cancel', {
      p_id: serie.id!, p_scope: 'occurrence', p_original_date: d1,
    });
    expect(eOcc).toBeNull();
    const { data: ovr } = await admin
      .from('appointments').select('id, status').eq('series_id', serie.id!).eq('original_date', d1);
    expect(ovr ?? []).toHaveLength(1);
    expect(ovr![0].status).toBe('canceled');

    // M2: following com data local diferente de D => agenda_invalid_range
    const { error: eM2 } = await filA.client.rpc('agenda_update', {
      p_id: serie.id!, p_scope: 'following', p_original_date: d2, p_title: null, p_notes: null,
      p_location: null, p_starts_at: emHoras(100), p_ends_at: emHoras(101),
      p_recur_freq: null, p_recur_weekdays: null, p_recur_until: null,
    });
    expect(eM2?.message).toMatch(/agenda_invalid_range/);

    // following a partir de d2: split (mestre antigo termina em d1; novo mestre a partir de d2)
    const novoInicio = new Date(new Date(mestre!.starts_at).getTime() + 24 * HORA + HORA).toISOString();
    const { data: novoId, error: eFol } = await filA.client.rpc('agenda_update', {
      p_id: serie.id!, p_scope: 'following', p_original_date: d2, p_title: null, p_notes: 'novo',
      p_location: null, p_starts_at: novoInicio,
      p_ends_at: new Date(new Date(novoInicio).getTime() + HORA).toISOString(),
      p_recur_freq: null, p_recur_weekdays: null, p_recur_until: null,
    });
    expect(eFol).toBeNull();
    expect(novoId).not.toBe(serie.id);
    const { data: antigo } = await admin.from('appointments').select('recur_until').eq('id', serie.id!).single();
    expect(antigo!.recur_until).toBe(d1);

    // all: cancela a série corrente (futura)
    const { error: eAll } = await filA.client.rpc('agenda_cancel', {
      p_id: novoId as string, p_scope: 'all', p_original_date: d2,
    });
    expect(eAll).toBeNull();
    const { data: fim } = await admin.from('appointments').select('status').eq('id', novoId as string).single();
    expect(fim!.status).toBe('canceled');
  });

  // ---------------------------------------------------------------- desvínculo
  it('trigger de desvínculo: arquivar o aluno cancela atendimentos FUTUROS; personal intacto', async () => {
    const { data: tmp } = await admin.auth.admin.createUser({
      email: `ag-unl-${suffix}@flvxus.test`, password: 'senha-unl-1', email_confirm: true,
      user_metadata: { role: 'student', full_name: 'unl' },
    });
    const sid = tmp.user!.id;
    await admin.from('profiles').insert({
      user_id: sid, tenant_id: master.tenantId, role: 'student', trainer_id: filA.userId,
      status: 'active', full_name: 'unl', email: `ag-unl-${suffix}@flvxus.test`,
    });
    const futuro = await criar(filA, { kind: 'in_person', studentId: sid });
    const serie = await criar(filA, { kind: 'in_person', studentId: sid, freq: 'daily' });
    const clientAluno = await signIn(`ag-unl-${suffix}@flvxus.test`, 'senha-unl-1');
    const { data: pessoal } = await clientAluno.rpc('agenda_create', {
      p_kind: 'personal', p_student_id: null, p_title: 'meu', p_notes: null, p_location: null,
      p_starts_at: emHoras(10), p_ends_at: emHoras(11), p_recur_freq: null,
      p_recur_weekdays: null, p_recur_until: null,
    });

    await admin.from('profiles').update({ status: 'archived' }).eq('user_id', sid);

    const { data: f } = await admin.from('appointments').select('status, canceled_reason').eq('id', futuro.id!).single();
    expect(f!.status).toBe('canceled');
    expect(f!.canceled_reason).toBe('student_archived');
    const { data: s } = await admin.from('appointments').select('status').eq('id', serie.id!).single();
    expect(s!.status).toBe('canceled'); // série sem passado: cancelada inteira
    const { data: p } = await admin.from('appointments').select('status').eq('id', pessoal as string).single();
    expect(p!.status).toBe('scheduled');
    await admin.auth.admin.deleteUser(sid);
  });

  // ---------------------------------------------------------------- filiado desativado
  it('filiado desativado: master vê e cancela os atendimentos futuros dele', async () => {
    await setVisibility(admin, master.tenantId, 'agenda', false);
    const at = await criar(filB, { kind: 'in_person', studentId: alunoDeB.userId });
    await admin.from('profiles').update({ deactivated_at: new Date().toISOString() }).eq('user_id', filB.userId);

    const { data } = await master.client.from('appointments').select('id, status').eq('id', at.id!);
    expect(data ?? []).toHaveLength(1);
    const { error } = await master.client.rpc('agenda_cancel', {
      p_id: at.id!, p_scope: 'occurrence', p_original_date: null,
    });
    expect(error).toBeNull();
    const { data: depois } = await admin.from('appointments').select('status').eq('id', at.id!).single();
    expect(depois!.status).toBe('canceled');

    // o desativado perde acesso às funções
    const { error: eFil } = await filB.client.rpc('agenda_cancel', {
      p_id: at.id!, p_scope: 'occurrence', p_original_date: null,
    });
    expect(eFil?.message).toMatch(/agenda_forbidden/);
    await admin.from('profiles').update({ deactivated_at: null }).eq('user_id', filB.userId);
    await setVisibility(admin, master.tenantId, 'agenda', true);
  });
});
