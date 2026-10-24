import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

/**
 * Assert ESTÁTICO da migration de `terms_acceptances` (CA3). Sem Docker não dá
 * para verificar a imutabilidade/RLS no banco (fica em describe.skip no harness
 * de RLS); esta é a verificação possível por inspeção do SQL de que a tabela foi
 * criada como desenhada: trigger de UPDATE, ausência de DELETE, índice único e
 * RLS habilitado.
 */
const sql = readFileSync(
  resolve(
    __dirname,
    '../../supabase/migrations/20261021120000_terms_acceptances.sql',
  ),
  'utf8',
).toLowerCase();

describe('migration terms_acceptances (assert estático)', () => {
  it('cria o enum legal_document_type', () => {
    expect(sql).toContain("create type public.legal_document_type as enum ('terms', 'privacy')");
  });

  it('cria a tabela com ip_address inet', () => {
    expect(sql).toContain('create table public.terms_acceptances');
    expect(sql).toContain('ip_address       inet');
  });

  it('bloqueia UPDATE via trigger BEFORE UPDATE', () => {
    expect(sql).toContain('create trigger terms_acceptances_no_update');
    expect(sql).toContain('before update on public.terms_acceptances');
  });

  it('NÃO cria trigger de DELETE (DELETE governado só por RLS)', () => {
    expect(sql).not.toContain('before delete');
    expect(sql).not.toContain('after delete');
  });

  it('cria o índice único para idempotência', () => {
    expect(sql).toContain('terms_acceptances_user_doc_version_uniq');
    expect(sql).toContain('(user_id, document_type, document_version)');
  });

  it('habilita RLS e cria policies de SELECT e INSERT, sem UPDATE/DELETE', () => {
    expect(sql).toContain('enable row level security');
    expect(sql).toContain('create policy terms_acceptances_select');
    expect(sql).toContain('create policy terms_acceptances_insert');
    expect(sql).not.toContain('create policy terms_acceptances_update');
    expect(sql).not.toContain('create policy terms_acceptances_delete');
  });
});
