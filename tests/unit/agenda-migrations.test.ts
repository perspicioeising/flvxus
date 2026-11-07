import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

/**
 * Teste ESTÁTICO das migrations da Agenda Fase 1 (sem Docker: as migrations
 * são aplicadas à mão). Verifica por inspeção dos arquivos:
 *   - 3 migrations novas, timestamps > 20261105090100, únicos e com rollback pareado;
 *   - arquivo do enum contém só o `alter type`;
 *   - backfill (student_id nulo -> block) antes do primeiro CHECK de participantes;
 *   - RLS: só SELECT em appointments; escrita só via funções SECURITY DEFINER;
 *   - idempotência e aviso de rollback destrutivo.
 */
const MIGRATIONS_DIR = resolve(__dirname, '../../supabase/migrations');
const ULTIMA_ANTERIOR = '20261105090100';

const ENUM_FILE = '20261107090000_visibility_module_agenda.sql';
const CORE_FILE = '20261107090100_agenda_core.sql';
const FN_FILE = '20261107090200_agenda_functions.sql';
const AGENDA_FORWARDS = [ENUM_FILE, CORE_FILE, FN_FILE];

const ler = (f: string) => readFileSync(resolve(MIGRATIONS_DIR, f), 'utf8');
const rollbackDe = (f: string) => f.replace(/\.sql$/, '_rollback.sql');
const todos = readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith('.sql'));
const forwards = todos.filter((f) => !f.endsWith('_rollback.sql'));

describe('Agenda — migrations (estático)', () => {
  it('as 3 migrations existem com rollback pareado', () => {
    for (const f of AGENDA_FORWARDS) {
      expect(todos).toContain(f);
      expect(todos).toContain(rollbackDe(f));
    }
  });

  it('timestamps > 20261105090100 e únicos entre todas as migrations', () => {
    for (const f of AGENDA_FORWARDS) {
      expect(f.slice(0, 14) > ULTIMA_ANTERIOR).toBe(true);
    }
    // histórico anterior já tem timestamps repetidos (inofensivos); exige-se unicidade dos novos.
    const stamps = forwards.map((f) => f.slice(0, 14)).filter((t) => t > ULTIMA_ANTERIOR);
    expect(new Set(stamps).size).toBe(stamps.length);
    // ordem preservada: enum < core < functions
    expect(ENUM_FILE < CORE_FILE && CORE_FILE < FN_FILE).toBe(true);
  });

  it('o arquivo do enum contém SÓ o alter type ... add value if not exists', () => {
    const sql = ler(ENUM_FILE).trim();
    expect(sql).toBe("alter type public.visibility_module add value if not exists 'agenda';");
  });

  it('o rollback do enum é no-op documentado', () => {
    const sql = ler(rollbackDe(ENUM_FILE));
    expect(sql).toMatch(/select 1;/);
    expect(sql).toMatch(/NAO permite remover/i);
  });

  describe('agenda_core', () => {
    const sql = ler(CORE_FILE);

    it('converte student_id nulo em block ANTES do primeiro add constraint de participantes', () => {
      const conversao = sql.indexOf("set kind = 'block'");
      const check = sql.indexOf('add constraint appointments_kind_participants_chk');
      expect(conversao).toBeGreaterThan(-1);
      expect(check).toBeGreaterThan(-1);
      expect(conversao).toBeLessThan(check);
      // e o backfill de owner_id/kind também vem antes
      expect(sql.indexOf('set owner_id = trainer_id')).toBeLessThan(check);
      expect(sql.indexOf("set kind = 'in_person'")).toBeLessThan(check);
      expect(sql).not.toMatch(/not valid/i);
    });

    it('trainer_id perde NOT NULL antes de ser zerado na conversão', () => {
      expect(sql.indexOf('alter column trainer_id drop not null')).toBeLessThan(
        sql.indexOf("set kind = 'block'"),
      );
    });

    it('tem CHECKs de tamanho de notes/location e demais constraints', () => {
      expect(sql).toMatch(/appointments_notes_len_chk[\s\S]*length\(notes\) <= 1000/);
      expect(sql).toMatch(/appointments_location_len_chk[\s\S]*length\(location\) <= 200/);
      for (const c of [
        'appointments_ends_after_starts_chk',
        'appointments_recur_chk',
        'appointments_override_chk',
        'appointments_title_chk',
      ]) {
        expect(sql).toContain(c);
      }
      expect(sql).toMatch(/create unique index if not exists appointments_series_original_uidx/);
    });

    it('FK de student_id vira on delete cascade por nome', () => {
      expect(sql).toMatch(
        /add constraint appointments_student_id_fkey[\s\S]*on delete cascade/,
      );
    });

    it('profiles.timezone com trigger de validação e water_goals com lembretes', () => {
      expect(sql).toMatch(/add column if not exists timezone text not null default 'America\/Sao_Paulo'/);
      expect(sql).toMatch(/profiles_validate_timezone/);
      for (const c of ['reminder_interval_min', 'reminder_start_min', 'reminder_end_min']) {
        expect(sql).toContain(c);
      }
    });

    it('seed idempotente de tenant_module_visibility agenda', () => {
      expect(sql).toMatch(/'agenda'::public\.visibility_module/);
      expect(sql).toMatch(/on conflict \(tenant_id, module\) do nothing/);
    });

    it('appointments só tem policy SELECT (sem insert/update/delete) e revoga escrita', () => {
      const policies = [...sql.matchAll(/create policy (\w+) on public\.appointments\s+for (\w+)/g)];
      expect(policies).toHaveLength(1);
      expect(policies[0][1]).toBe('appointments_select');
      expect(policies[0][2]).toBe('select');
      expect(sql).toMatch(
        /revoke insert, update, delete on public\.appointments from authenticated, anon;/,
      );
      // personal/block nunca saem do dono
      expect(sql).toMatch(/kind in \('in_person', 'online', 'assessment'\)/);
    });

    it('é idempotente (drop policy if exists, if not exists, drop constraint if exists)', () => {
      expect(sql).toMatch(/drop policy if exists appointments_select/);
      expect(sql).toMatch(/drop policy if exists appointments_insert/);
      expect(sql).toMatch(/drop policy if exists appointments_update/);
      expect(sql).toMatch(/drop policy if exists appointments_delete/);
      expect(sql).toMatch(/add column if not exists owner_id/);
      expect(sql).toMatch(/drop constraint if exists appointments_kind_participants_chk/);
      expect(sql).toMatch(/drop trigger if exists appointments_validate_tz/);
      expect(sql).toMatch(/if not exists \(\s*select 1 from pg_type/);
    });

    it('rollback é destrutivo e avisa no cabeçalho; restaura policies originais', () => {
      const rb = ler(rollbackDe(CORE_FILE));
      const cabecalho = rb.split('\n').slice(0, 20).join('\n');
      expect(cabecalho).toMatch(/ROLLBACK DESTRUTIVO/);
      expect(cabecalho).toMatch(/personal.*block/);
      expect(rb).toMatch(/delete from public\.appointments\s+where kind in \('personal', 'block'\) or trainer_id is null/);
      for (const p of ['select', 'insert', 'update', 'delete']) {
        expect(rb).toMatch(new RegExp(`create policy appointments_${p} on public\\.appointments`));
      }
      expect(rb).toMatch(/alter column trainer_id set not null/);
      expect(rb).toMatch(/on delete set null/);
      expect(rb).toMatch(/drop type if exists public\.appointment_kind/);
      expect(rb).toMatch(/delete from public\.tenant_module_visibility where module = 'agenda'/);
      // apaga os dados ANTES de restaurar NOT NULL
      expect(rb.indexOf('delete from public.appointments')).toBeLessThan(
        rb.indexOf('alter column trainer_id set not null'),
      );
    });
  });

  describe('agenda_functions', () => {
    const sql = ler(FN_FILE);
    const corpos = sql.split(/create or replace function /).slice(1);

    it('define as funções públicas e auxiliares esperadas', () => {
      for (const fn of [
        'agenda_create',
        'agenda_update',
        'agenda_cancel',
        'agenda_next_occurrence',
        'agenda_occurrence_on',
        'agenda_is_occurrence',
        'agenda_on_student_unlink',
      ]) {
        expect(sql).toMatch(new RegExp(`create or replace function public\\.${fn}\\(`));
      }
      expect(sql).toMatch(/create trigger profiles_agenda_on_student_unlink/);
      expect(sql).toMatch(/drop trigger if exists profiles_agenda_on_student_unlink/);
    });

    it('toda função SECURITY DEFINER usa search_path vazio', () => {
      const definers = corpos.filter((c) => /security definer/.test(c.split('$$')[0]));
      expect(definers.length).toBeGreaterThanOrEqual(7);
      for (const c of definers) {
        expect(c.split('$$')[0]).toMatch(/set search_path = ''/);
      }
    });

    it('revoke from public em todas e grant a authenticated nas 3 de escrita', () => {
      const nomes = [
        'agenda_caller',
        'agenda_check_fields',
        'agenda_can_manage',
        'agenda_occurrence_on',
        'agenda_is_occurrence',
        'agenda_next_occurrence',
        'agenda_on_student_unlink',
        'agenda_create',
        'agenda_update',
        'agenda_cancel',
      ];
      for (const n of nomes) {
        expect(sql).toMatch(new RegExp(`revoke all on function public\\.${n}\\([^;]*from public`));
      }
      for (const n of ['agenda_create', 'agenda_update', 'agenda_cancel']) {
        expect(sql).toMatch(new RegExp(`grant execute on function public\\.${n}\\([^;]*to authenticated;`));
      }
      // auxiliares internos NÃO são concedidos a authenticated
      expect(sql).not.toMatch(/grant execute on function public\.agenda_(next_occurrence|occurrence_on|is_occurrence|caller)/);
    });

    it('M2/M3: following/all rejeitam data diferente de D; terceiros só master ou trainer do atendimento', () => {
      expect(sql).toMatch(/\(p_starts_at at time zone m\.tz\)::date <> v_d/);
      expect(sql).toMatch(/is_tenant_master, false\) or p_row\.trainer_id = p_me\.user_id/);
      expect(sql).toContain("'agenda_past'");
      expect(sql).toContain("'agenda_invalid_range'");
    });

    it('não expõe DELETE nem escreve fora de appointments/profiles', () => {
      expect(sql).not.toMatch(/delete from/i);
      expect(sql).not.toMatch(/drop table/i);
    });

    it('cálculos de série usam appointments.tz da linha, não profiles.timezone do editor', () => {
      const upd = corpos.find((c) => c.startsWith('public.agenda_update'))!;
      const cnl = corpos.find((c) => c.startsWith('public.agenda_cancel'))!;
      expect(upd).not.toMatch(/timezone/);
      expect(cnl).not.toMatch(/timezone/);
      expect(upd).toMatch(/at time zone m\.tz/);
    });

    it('rollback pareado remove trigger e funções', () => {
      const rb = ler(rollbackDe(FN_FILE));
      expect(rb).toMatch(/drop trigger if exists profiles_agenda_on_student_unlink/);
      for (const fn of ['agenda_create', 'agenda_update', 'agenda_cancel', 'agenda_next_occurrence', 'agenda_on_student_unlink']) {
        expect(rb).toMatch(new RegExp(`drop function if exists public\\.${fn}\\(`));
      }
    });
  });
});
