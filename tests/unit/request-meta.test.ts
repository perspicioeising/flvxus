import { describe, expect, it } from 'vitest';

import { ehIpValido, parseIp, parseUserAgent } from '@/lib/legal/request-meta';

describe('parseIp', () => {
  it('pega o primeiro IP de x-forwarded-for com múltiplos IPs', () => {
    expect(parseIp('203.0.113.7, 70.41.3.18, 150.172.238.178', null)).toBe(
      '203.0.113.7',
    );
  });

  it('aceita IPv6', () => {
    expect(parseIp('2001:db8:85a3::8a2e:370:7334', null)).toBe(
      '2001:db8:85a3::8a2e:370:7334',
    );
  });

  it('retorna null quando ambos os headers estão ausentes', () => {
    expect(parseIp(null, null)).toBeNull();
  });

  it('retorna null (sem lançar) para IP malformado', () => {
    expect(parseIp('nao-e-ip', null)).toBeNull();
    expect(parseIp('999.999.999.999', null)).toBeNull();
  });

  it('usa o fallback x-real-ip quando x-forwarded-for está ausente', () => {
    expect(parseIp(null, '198.51.100.5')).toBe('198.51.100.5');
  });

  it('usa o fallback x-real-ip quando o forwarded só tem lixo', () => {
    expect(parseIp('lixo', '198.51.100.5')).toBe('198.51.100.5');
  });
});

describe('ehIpValido', () => {
  it('valida IPv4 e IPv6; rejeita o resto', () => {
    expect(ehIpValido('10.0.0.1')).toBe(true);
    expect(ehIpValido('::1')).toBe(true);
    expect(ehIpValido('256.0.0.1')).toBe(false);
    expect(ehIpValido('texto')).toBe(false);
  });
});

describe('parseUserAgent', () => {
  it('retorna null quando ausente ou vazio', () => {
    expect(parseUserAgent(null)).toBeNull();
    expect(parseUserAgent('   ')).toBeNull();
  });

  it('preserva um user-agent normal', () => {
    const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';
    expect(parseUserAgent(ua)).toBe(ua);
  });

  it('trunca user-agent com mais de 1000 caracteres', () => {
    const ua = 'a'.repeat(1500);
    const resultado = parseUserAgent(ua);
    expect(resultado).not.toBeNull();
    expect(resultado).toHaveLength(1000);
  });
});
