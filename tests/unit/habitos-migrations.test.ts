import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

/**
 * Teste de SANIDADE dos arquivos de migration dos Hábitos G2 (FEAT-001). Como
 * não há Docker neste ambiente, as migrations são aplicadas À MÃO pelo usuário e
 * não podemos exercer o banco. A verificação possível é por inspeção dos arquivos
 * (mesmo molde de tests/unit/arena-migrations.test.ts):
 *
 *   (1) cada migration forward 20261027090xxx_*.sql tem um _rollback.sql par;
 *   (2) os timestamps novos são >= 20261027090000, distintos entre si e sem
 *       colisão com os existentes (maior anterior: 20261026090400);
 *   (3) idempotência no texto: as de criação de tabela contêm
 *       `create table if not exists`; a de RLS contém `drop policy if exists` e
 *       NÃO usa `for all` (RLS por comando, ignorando comentários);
 *   (4) toda função nova é `security definer` + `set search_path = ''`;
 *   (5) as funções de sync CHAMAM public.gamification_award (consumo do motor),
 *       não o redefinem.
 */
const MIGRATIONS_DIR = resolve(__dirname, '../../supabase/migrations');

/** Prefixo de timestamp (YYYYMMDDHHMMSS) de um nome de arquivo de migration. */
function timestampDe(fileName: string): string {
  return fileName.slice(0, 14);
}

const todosArquivos = readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith('.sql'));

const forwards = todosArquivos.filter((f) => !f.endsWith('_rollback.sql'));
const rollbacks = todosArquivos.filter((f) => f.endsWith('_rollback.sql'));

const HABITOS_FORWARDS = [
  '20261027090000_habit_event_types.sql',
  '20261027090100_water_goals_and_intake.sql',
  '20261027090200_diet_meal_completions.sql',
  '20261027090300_daily_checkins.sql',
  '20261027090400_habits_rls.sql',
];

// Migrations de hábito que criam tabela(s).
const HABITOS_TABELAS = [
  '20261027090100_water_goals_and_intake.sql',
  '20261027090200_diet_meal_completions.sql',
  '20261027090300_daily_checkins.sql',
];

// Migrations de hábito que definem função(ões) nova(s) SECURITY DEFINER.
const HABITOS_FUNCOES = [
  '20261027090100_water_goals_and_intake.sql',
  '20261027090200_diet_meal_completions.sql',
  '20261027090300_daily_checkins.sql',
];

// Migrations cujas funções de sync devem CHAMAR gamification_award (consumo).
const HABITOS_SYNC = [
  '20261027090100_water_goals_and_intake.sql',
  '20261027090200_diet_meal_completions.sql',
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

describe('Hábitos G2 — sanidade das migrations (assert estático, sem Docker)', () => {
  it('as 5 migrations forward dos hábitos existem', () => {
    for (const nome of HABITOS_FORWARDS) {
      expect(forwards, `faltando ${nome}`).toContain(nome);
    }
  });

  it('cada migration forward dos hábitos tem um _rollback.sql par', () => {
    for (const nome of HABITOS_FORWARDS) {
      const par = nome.replace(/\.sql$/, '_rollback.sql');
      expect(rollbacks, `faltando rollback de ${nome}`).toContain(par);
    }
  });

  it('os timestamps dos hábitos são >= 20261027090000, distintos entre si e sem colisão com os existentes', () => {
    const tsHabitos = HABITOS_FORWARDS.map(timestampDe);

    // >= 20261027090000 (maior existente antes dos hábitos: 20261026090400).
    for (const t of tsHabitos) {
      expect(Number(t)).toBeGreaterThanOrEqual(20261027090000);
    }

    // Distintos entre si.
    expect(new Set(tsHabitos).size).toBe(HABITOS_FORWARDS.length);

    // Sem colisão com nenhum timestamp forward pré-existente do repo.
    const tsExistentes = new Set(
      forwards.filter((f) => !HABITOS_FORWARDS.includes(f)).map(timestampDe),
    );
    for (const t of tsHabitos) {
      expect(tsExistentes.has(t), `timestamp ${t} colide com migration existente`).toBe(false);
    }
  });

  it('as migrations de criação de tabela contêm create table if not exists', () => {
    for (const nome of HABITOS_TABELAS) {
      expect(ler(nome).toLowerCase(), `${nome} sem create table if not exists`).toContain(
        'create table if not exists',
      );
    }
  });

  it('a migration de RLS é idempotente (drop policy if exists + create policy) e por comando (sem for all)', () => {
    const sql = ler('20261027090400_habits_rls.sql').toLowerCase();
    expect(sql).toContain('drop policy if exists');
    expect(sql).toContain('create policy');
    // RLS por comando: nenhuma policy criada com `for all` (ignorando comentários).
    expect(sqlSemComentarios('20261027090400_habits_rls.sql')).not.toContain('for all');
  });

  it('os rollbacks são reversíveis idempotentes (drop ... if exists ou create or replace)', () => {
    for (const nome of HABITOS_FORWARDS) {
      const par = nome.replace(/\.sql$/, '_rollback.sql');
      const sql = ler(par).toLowerCase();
      expect(
        sql.includes('if exists') || sql.includes('create or replace'),
        `rollback ${par} não é reversível idempotente`,
      ).toBe(true);
    }
  });

  it('toda função nova dos hábitos é SECURITY DEFINER com search_path vazio', () => {
    for (const nome of HABITOS_FUNCOES) {
      const sql = ler(nome).toLowerCase();
      expect(sql, `${nome} sem security definer`).toContain('security definer');
      expect(sql, `${nome} sem set search_path`).toContain("set search_path = ''");
    }
  });

  it('as funções de sync CHAMAM public.gamification_award (consumo do motor, não redefinição)', () => {
    for (const nome of HABITOS_SYNC) {
      const sql = ler(nome).toLowerCase();
      // Consumo do motor: a função realiza `perform public.gamification_award(...)`.
      expect(sql, `${nome} não chama gamification_award`).toContain(
        'perform public.gamification_award',
      );
      // Não redefine o motor: nenhuma migration de hábito recria gamification_award.
      expect(
        sql.includes('function public.gamification_award'),
        `${nome} redefine gamification_award (deve apenas consumir)`,
      ).toBe(false);
    }
  });
});
