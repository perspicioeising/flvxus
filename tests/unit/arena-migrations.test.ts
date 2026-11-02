import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

/**
 * Teste de SANIDADE dos arquivos de migration da Arena G1 (FEAT-001). Como não
 * há Docker neste ambiente, as migrations são aplicadas À MÃO pelo usuário e não
 * podemos exercer o banco. A verificação possível é por inspeção dos arquivos:
 *
 *   (1) cada migration de criação 20261026090xxx_*.sql tem um _rollback.sql par;
 *   (2) os timestamps novos são >= 20261026090000 e não colidem (entre si nem
 *       com os existentes);
 *   (3) idempotência no texto: as de criação de tabela contêm
 *       `create table if not exists`; as de RLS contêm `drop policy if exists`;
 *   (4) toda função do motor é `security definer` + `set search_path = ''`.
 */
const MIGRATIONS_DIR = resolve(__dirname, '../../supabase/migrations');

/** Prefixo de timestamp (YYYYMMDDHHMMSS) de um nome de arquivo de migration. */
function timestampDe(fileName: string): string {
  return fileName.slice(0, 14);
}

const todosArquivos = readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith('.sql'));

const forwards = todosArquivos.filter((f) => !f.endsWith('_rollback.sql'));
const rollbacks = todosArquivos.filter((f) => f.endsWith('_rollback.sql'));

const ARENA_FORWARDS = [
  '20261026090000_gamification_core.sql',
  '20261026090100_gamification_engine.sql',
  '20261026090200_gamification_rls.sql',
  '20261026090300_gamification_leaderboard.sql',
  '20261026090400_gamification_seed_achievements.sql',
];

function ler(fileName: string): string {
  return readFileSync(resolve(MIGRATIONS_DIR, fileName), 'utf8');
}

/** SQL sem linhas de comentário (`-- ...`), em minúsculas — para asserts de
 *  sintaxe que não devem casar com texto de comentário. */
function sqlSemComentarios(fileName: string): string {
  return ler(fileName)
    .split('\n')
    .filter((linha) => !linha.trimStart().startsWith('--'))
    .join('\n')
    .toLowerCase();
}

describe('Arena G1 — sanidade das migrations (assert estático, sem Docker)', () => {
  it('as 5 migrations forward da Arena existem', () => {
    for (const nome of ARENA_FORWARDS) {
      expect(forwards, `faltando ${nome}`).toContain(nome);
    }
  });

  it('cada migration forward da Arena tem um _rollback.sql par', () => {
    for (const nome of ARENA_FORWARDS) {
      const par = nome.replace(/\.sql$/, '_rollback.sql');
      expect(rollbacks, `faltando rollback de ${nome}`).toContain(par);
    }
  });

  it('os timestamps da Arena são >= 20261026090000, distintos entre si e sem colisão com os existentes', () => {
    const tsArena = ARENA_FORWARDS.map(timestampDe);

    // >= 20261026090000 (última existente antes da Arena: 20261025090400).
    for (const t of tsArena) {
      expect(Number(t)).toBeGreaterThanOrEqual(20261026090000);
    }

    // Distintos entre si.
    expect(new Set(tsArena).size).toBe(ARENA_FORWARDS.length);

    // Sem colisão com nenhum timestamp forward pré-existente do repo.
    const tsExistentes = new Set(
      forwards.filter((f) => !ARENA_FORWARDS.includes(f)).map(timestampDe),
    );
    for (const t of tsArena) {
      expect(tsExistentes.has(t), `timestamp ${t} colide com migration existente`).toBe(false);
    }
  });

  it('as migrations de criação de tabela contêm create table if not exists', () => {
    for (const nome of [
      '20261026090000_gamification_core.sql',
      '20261026090100_gamification_engine.sql',
    ]) {
      expect(ler(nome).toLowerCase()).toContain('create table if not exists');
    }
  });

  it('a migration de RLS é idempotente (drop policy if exists + create policy)', () => {
    const sql = ler('20261026090200_gamification_rls.sql').toLowerCase();
    expect(sql).toContain('drop policy if exists');
    expect(sql).toContain('create policy');
    // RLS por comando: nenhuma policy criada com `for all` (ignorando comentários).
    expect(sqlSemComentarios('20261026090200_gamification_rls.sql')).not.toContain('for all');
  });

  it('os rollbacks são reversíveis idempotentes (drop ... if exists ou restauração via create or replace)', () => {
    for (const nome of ARENA_FORWARDS) {
      const par = nome.replace(/\.sql$/, '_rollback.sql');
      const sql = ler(par).toLowerCase();
      // Rollbacks dropam objetos com `if exists`; os que restauram a forma
      // anterior de uma função usam `create or replace`.
      expect(
        sql.includes('if exists') || sql.includes('create or replace'),
        `rollback ${par} não é reversível idempotente`,
      ).toBe(true);
    }
  });

  it('toda função da Arena é SECURITY DEFINER com search_path vazio', () => {
    // Funções SECURITY DEFINER vivem em core (sp_date), engine e leaderboard.
    for (const nome of [
      '20261026090000_gamification_core.sql',
      '20261026090100_gamification_engine.sql',
      '20261026090300_gamification_leaderboard.sql',
      '20261026090400_gamification_seed_achievements.sql',
    ]) {
      const sql = ler(nome).toLowerCase();
      expect(sql, `${nome} sem set search_path`).toContain("set search_path = ''");
    }
    // O motor concentra as funções SECURITY DEFINER do caminho de escrita.
    const engine = ler('20261026090100_gamification_engine.sql').toLowerCase();
    expect(engine).toContain('security definer');
    const leaderboard = ler('20261026090300_gamification_leaderboard.sql').toLowerCase();
    expect(leaderboard).toContain('security definer');
  });

  it('o trigger recriado NÃO soma mais total_points + 10 e emite workout_completed', () => {
    const engine = ler('20261026090100_gamification_engine.sql');
    expect(engine).not.toMatch(/total_points\s*\+\s*10/);
    expect(engine).toContain("'workout_completed'");
    // backfill idempotente na mesma migration.
    expect(engine.toLowerCase()).toContain('on conflict (user_id, event_type, reference_id) do nothing');
  });
});
