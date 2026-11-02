import { describe, expect, it } from 'vitest';

import { isSelfManaged } from '@/lib/auth';

/**
 * `isSelfManaged` centraliza a ramificação do aluno autônomo (self_managed):
 * TRUE apenas para a conta autônoma; FALSE para o personal profissional.
 */
describe('isSelfManaged', () => {
  it('é true para a conta self_managed', () => {
    expect(isSelfManaged({ accountType: 'self_managed' })).toBe(true);
  });

  it('é false para a conta professional', () => {
    expect(isSelfManaged({ accountType: 'professional' })).toBe(false);
  });
});
