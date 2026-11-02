import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

/**
 * Teste de SANIDADE da migration do DUELO-janela-comum (FEAT-001). Sem Docker,
 * as migrations são aplicadas À MÃO e a verificação possível é por inspeção dos
 * arquivos .sql:
 *
 *   (1) o forward 20261101090000 existe com par _rollback;
 *   (2) o timestamp é > 20261031090000 e único no conjunto;
 *   (3) o forward é SECURITY DEFINER + search_path vazio e reafirma
 *       revoke from public + grant execute to authenticated;
 *   (4) o forward torna a janela anulável (alter column starts_on drop not null)
 *       e acrescenta accepted_at (add column if not exists accepted_at);
 *   (5) gamification_respond_duel fixa a janela de forma idempotente
 *       (grava com guard `starts_on is null`);
 *   (6) o rollback usa `if exists` e contém o `do $$` do set not null condicional;
 *   (7) o forward NÃO recria gamification_award.
 */
const MIGRATIONS_DIR = resolve(__dirname, '../../supabase/migrations');

/** Prefixo de timestamp (YYYYMMDDHHMMSS) de um nome de arquivo de migration. */
function timestampDe(fileName: string): string {
  return fileName.slice(0, 14);
}

const todosArquivos = readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith('.sql'));
const forwards = todosArquivos.filter((f) => !f.endsWith('_rollback.sql'));
const rollbacks = todosArquivos.filter((f) => f.endsWith('_rollback.sql'));

const DUELO_FORWARD = '20261101090000_gamification_duel_common_window.sql';
const DUELO_ROLLBACK = '20261101090000_gamification_duel_common_window_rollback.sql';

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

describe('Duelo janela comum — sanidade da migration (assert estático)', () => {
  it('o forward 20261101090000 existe com par _rollback', () => {
    expect(forwards, `faltando ${DUELO_FORWARD}`).toContain(DUELO_FORWARD);
    expect(rollbacks, `faltando ${DUELO_ROLLBACK}`).toContain(DUELO_ROLLBACK);
  });

  it('o timestamp é > 20261031090000 e único no conjunto de forwards', () => {
    const ts = timestampDe(DUELO_FORWARD);
    expect(Number(ts)).toBeGreaterThan(20261031090000);
    const iguais = forwards.filter((f) => timestampDe(f) === ts);
    expect(iguais).toEqual([DUELO_FORWARD]);
  });

  it('o forward é SECURITY DEFINER + search_path vazio com revoke/grant', () => {
    const sql = ler(DUELO_FORWARD).toLowerCase();
    expect(sql, 'sem security definer').toContain('security definer');
    expect(sql, 'sem search_path vazio').toContain("set search_path = ''");
    expect(sql, 'sem revoke from public').toMatch(
      /revoke\s+all\s+on\s+function[\s\S]*from\s+public/,
    );
    expect(sql, 'sem grant execute to authenticated').toMatch(
      /grant\s+execute\s+on\s+function[\s\S]*to\s+authenticated/,
    );
  });

  it('o forward torna a janela anulável e acrescenta accepted_at', () => {
    const sql = sqlSemComentarios(DUELO_FORWARD);
    expect(sql).toContain('alter column starts_on drop not null');
    expect(sql).toContain('add column if not exists accepted_at');
  });

  it('gamification_respond_duel fixa a janela de forma idempotente (starts_on is null)', () => {
    const sql = sqlSemComentarios(DUELO_FORWARD);
    expect(sql).toContain('starts_on is null');
  });

  it('o rollback usa if exists e contém o do $$ do set not null condicional', () => {
    const sql = sqlSemComentarios(DUELO_ROLLBACK);
    expect(sql).toMatch(/drop\s+column\s+if\s+exists\s+accepted_at/);
    expect(sql).toContain('do $$');
    expect(sql).toContain('set not null');
  });

  it('o forward NÃO recria gamification_award', () => {
    const sql = sqlSemComentarios(DUELO_FORWARD);
    expect(sql).not.toContain('create or replace function public.gamification_award');
  });
});
