import { describe, expect, it } from 'vitest';

// Teste trivial que valida o runner do Vitest (environment jsdom + setup).
describe('smoke', () => {
  it('soma básica funciona', () => {
    expect(1 + 1).toBe(2);
  });
});
