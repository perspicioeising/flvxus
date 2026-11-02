import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

/**
 * Teste de SANIDADE dos arquivos de migration da Arena G2 (ranking global,
 * FEAT-001). Como não há Docker neste ambiente, as migrations são aplicadas À
 * MÃO pelo usuário e a verificação possível é por inspeção dos arquivos:
 *
 *   (1) os dois forwards G2 existem com par _rollback;
 *   (2) os timestamps são > 20261027090400 (maior existente antes da G2) e
 *       distintos entre si;
 *   (3) a função é `security definer` + `set search_path = ''`;
 *   (4) a migration da função concede com revoke from public + grant execute to
 *       authenticated e NÃO referencia gamification_resolve_season (escreve);
 *   (5) os rollbacks dropam objetos com `drop ... if exists`.
 */
const MIGRATIONS_DIR = resolve(__dirname, '../../supabase/migrations');

/** Prefixo de timestamp (YYYYMMDDHHMMSS) de um nome de arquivo de migration. */
function timestampDe(fileName: string): string {
  return fileName.slice(0, 14);
}

const todosArquivos = readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith('.sql'));

const forwards = todosArquivos.filter((f) => !f.endsWith('_rollback.sql'));
const rollbacks = todosArquivos.filter((f) => f.endsWith('_rollback.sql'));

const INDEXES_FORWARD = '20261028090000_gamification_global_indexes.sql';
const LEADERBOARD_FORWARD = '20261028090100_gamification_global_leaderboard.sql';
const G2_FORWARDS = [INDEXES_FORWARD, LEADERBOARD_FORWARD];

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

describe('Arena G2 — sanidade das migrations do ranking global (assert estático)', () => {
  it('os dois forwards G2 existem com par _rollback', () => {
    for (const nome of G2_FORWARDS) {
      expect(forwards, `faltando ${nome}`).toContain(nome);
      const par = nome.replace(/\.sql$/, '_rollback.sql');
      expect(rollbacks, `faltando rollback de ${nome}`).toContain(par);
    }
  });

  it('os timestamps G2 são > 20261027090400 e distintos entre si', () => {
    const tsG2 = G2_FORWARDS.map(timestampDe);
    for (const t of tsG2) {
      expect(Number(t)).toBeGreaterThan(20261027090400);
    }
    expect(new Set(tsG2).size).toBe(G2_FORWARDS.length);
  });

  it('a função global é SECURITY DEFINER com search_path vazio', () => {
    const sql = ler(LEADERBOARD_FORWARD).toLowerCase();
    expect(sql).toContain('security definer');
    expect(sql).toContain("set search_path = ''");
  });

  it('a migration da função concede com revoke from public + grant to authenticated', () => {
    const sql = ler(LEADERBOARD_FORWARD).toLowerCase();
    expect(sql).toMatch(/revoke\s+all\s+on\s+function[\s\S]*from\s+public/);
    expect(sql).toMatch(/grant\s+execute\s+on\s+function[\s\S]*to\s+authenticated/);
  });

  it('a função global NÃO referencia gamification_resolve_season (caminho de escrita)', () => {
    // Ignora comentários: o cabeçalho MENCIONA a função para documentar que NÃO
    // a chama. O que não pode existir é uma chamada real no corpo.
    expect(sqlSemComentarios(LEADERBOARD_FORWARD)).not.toContain('gamification_resolve_season');
  });

  it('os rollbacks G2 dropam objetos com drop ... if exists', () => {
    for (const nome of G2_FORWARDS) {
      const par = nome.replace(/\.sql$/, '_rollback.sql');
      const sql = ler(par).toLowerCase();
      expect(sql, `rollback ${par} sem drop ... if exists`).toMatch(/drop\s+\w+\s+if\s+exists/);
    }
  });
});
