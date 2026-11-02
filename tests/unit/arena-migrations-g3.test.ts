import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

/**
 * Teste de SANIDADE dos arquivos de migration da Arena G3 (camada SOCIAL,
 * FEAT-001). Como não há Docker neste ambiente, as migrations são aplicadas À
 * MÃO pelo usuário e a verificação possível é por inspeção dos arquivos:
 *
 *   (1) os 5 forwards G3 existem com par _rollback;
 *   (2) os timestamps 20261030090000..090400 são > 20261029090000 e distintos;
 *   (3) as migrations 090200/090300 são `security definer` + search_path vazio;
 *   (4) 090200/090300 concedem revoke from public + grant execute to authenticated;
 *   (5) 090300 contém o ramo in ('season_champion','challenge_winner');
 *   (6) 090400 contém create or replace de seed_achievements_for_tenant + loop
 *       sobre public.tenants;
 *   (7) a RLS 090100 NÃO tem policy de insert/update/delete para authenticated;
 *   (8) os rollbacks dropam objetos com `drop ... if exists`.
 */
const MIGRATIONS_DIR = resolve(__dirname, '../../supabase/migrations');

/** Prefixo de timestamp (YYYYMMDDHHMMSS) de um nome de arquivo de migration. */
function timestampDe(fileName: string): string {
  return fileName.slice(0, 14);
}

const todosArquivos = readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith('.sql'));

const forwards = todosArquivos.filter((f) => !f.endsWith('_rollback.sql'));
const rollbacks = todosArquivos.filter((f) => f.endsWith('_rollback.sql'));

const CORE_FORWARD = '20261030090000_gamification_social_core.sql';
const RLS_FORWARD = '20261030090100_gamification_social_rls.sql';
const SOCIAL_FN_FORWARD = '20261030090200_gamification_social_functions.sql';
const CHALLENGE_FN_FORWARD = '20261030090300_gamification_challenges_functions.sql';
const SEED_FORWARD = '20261030090400_gamification_social_seed.sql';
const G3_FORWARDS = [CORE_FORWARD, RLS_FORWARD, SOCIAL_FN_FORWARD, CHALLENGE_FN_FORWARD, SEED_FORWARD];
const G3_FN_FORWARDS = [SOCIAL_FN_FORWARD, CHALLENGE_FN_FORWARD];

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

describe('Arena G3 — sanidade das migrations sociais (assert estático)', () => {
  it('os 5 forwards G3 existem com par _rollback', () => {
    for (const nome of G3_FORWARDS) {
      expect(forwards, `faltando ${nome}`).toContain(nome);
      const par = nome.replace(/\.sql$/, '_rollback.sql');
      expect(rollbacks, `faltando rollback de ${nome}`).toContain(par);
    }
  });

  it('os timestamps G3 são > 20261029090000 e distintos entre si', () => {
    const tsG3 = G3_FORWARDS.map(timestampDe);
    for (const t of tsG3) {
      expect(Number(t)).toBeGreaterThan(20261029090000);
    }
    expect(new Set(tsG3).size).toBe(G3_FORWARDS.length);
  });

  it('as migrations de função (090200/090300) são SECURITY DEFINER + search_path vazio', () => {
    for (const nome of G3_FN_FORWARDS) {
      const sql = ler(nome).toLowerCase();
      expect(sql, `${nome} sem security definer`).toContain('security definer');
      expect(sql, `${nome} sem search_path vazio`).toContain("set search_path = ''");
    }
  });

  it('as migrations de função concedem revoke from public + grant to authenticated', () => {
    for (const nome of G3_FN_FORWARDS) {
      const sql = ler(nome).toLowerCase();
      expect(sql, `${nome} sem revoke from public`).toMatch(
        /revoke\s+all\s+on\s+function[\s\S]*from\s+public/,
      );
      expect(sql, `${nome} sem grant execute to authenticated`).toMatch(
        /grant\s+execute\s+on\s+function[\s\S]*to\s+authenticated/,
      );
    }
  });

  it('090300 generaliza o ramo de conquista para (season_champion, challenge_winner)', () => {
    const sql = sqlSemComentarios(CHALLENGE_FN_FORWARD);
    expect(sql).toMatch(/in\s*\(\s*'season_champion'\s*,\s*'challenge_winner'\s*\)/);
  });

  it('090400 recria seed_achievements_for_tenant e reaplica em loop sobre public.tenants', () => {
    const sql = sqlSemComentarios(SEED_FORWARD);
    expect(sql).toContain('create or replace function public.seed_achievements_for_tenant');
    expect(sql).toMatch(/for\s+r\s+in\s+select\s+id\s+from\s+public\.tenants/);
  });

  it('a RLS 090100 só tem policy de SELECT para authenticated (nenhuma de write)', () => {
    const sql = sqlSemComentarios(RLS_FORWARD);
    expect(sql).toContain('for select to authenticated');
    // Nenhuma policy de escrita para authenticated.
    expect(sql).not.toMatch(/for\s+insert\s+to\s+authenticated/);
    expect(sql).not.toMatch(/for\s+update\s+to\s+authenticated/);
    expect(sql).not.toMatch(/for\s+delete\s+to\s+authenticated/);
    expect(sql).not.toMatch(/for\s+all\s+to\s+authenticated/);
  });

  it('os rollbacks G3 (exceto o seed) dropam objetos com drop ... if exists', () => {
    // O rollback do seed (090400) reverte por create or replace + delete (volta
    // seed_achievements_for_tenant ao estado G1 e apaga a conquista por code),
    // conforme o design — por isso NÃO usa drop. Os demais dropam objetos.
    const dropForwards = G3_FORWARDS.filter((f) => f !== SEED_FORWARD);
    for (const nome of dropForwards) {
      const par = nome.replace(/\.sql$/, '_rollback.sql');
      const sql = ler(par).toLowerCase();
      expect(sql, `rollback ${par} sem drop ... if exists`).toMatch(/drop\s+\w+\s+if\s+exists/);
    }
    // O rollback do seed reverte sem drop: create or replace + delete.
    const seedRollback = ler(SEED_FORWARD.replace(/\.sql$/, '_rollback.sql')).toLowerCase();
    expect(seedRollback).toContain('create or replace function public.seed_achievements_for_tenant');
    expect(seedRollback).toMatch(/delete\s+from\s+public\.achievements/);
  });
});
