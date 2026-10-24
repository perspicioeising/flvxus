import { headers } from 'next/headers';

/**
 * Resolução server-side de IP e user-agent para a prova de aceite legal
 * (design.md §2.8). O cliente NUNCA envia esses valores — eles vêm dos headers
 * da request no servidor (RNF1).
 *
 * As funções de parse são PURAS e separadas da leitura de `headers()` para
 * serem testáveis sem mock do Next (tests/unit/request-meta.test.ts).
 */

/** Metadados da request relevantes ao aceite. */
export interface RequestMeta {
  ipAddress: string | null;
  userAgent: string | null;
}

/** Tamanho máximo gravado de user-agent (coluna text; defensivo). */
const MAX_UA_LENGTH = 1000;

/**
 * Valida um IP (IPv4 ou IPv6) de forma simples. A coluna é `inet`, então um
 * valor malformado faria o INSERT falhar — por isso validamos antes e, se
 * inválido, devolvemos `null` (o aceite não deve falhar por um header ruim).
 * Checagem deliberadamente simples (não cobre todas as formas canônicas de
 * IPv6), suficiente para o que `x-forwarded-for` costuma trazer.
 */
export function ehIpValido(valor: string): boolean {
  const ipv4 =
    /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;
  if (ipv4.test(valor)) {
    return true;
  }
  // IPv6: hextetos e a forma comprimida `::`. Checagem simples e tolerante.
  const ipv6 = /^[0-9a-fA-F:]+$/;
  return valor.includes(':') && ipv6.test(valor) && valor.length <= 45;
}

/**
 * Extrai o IP do cliente a partir dos valores de `x-forwarded-for` (primeiro da
 * lista — o IP do cliente atrás da Vercel/proxy) com fallback para `x-real-ip`.
 * Retorna `null` quando ausente ou malformado — nunca lança.
 */
export function parseIp(
  forwardedFor: string | null,
  realIp: string | null,
): string | null {
  const candidatos: string[] = [];

  if (forwardedFor) {
    candidatos.push(...forwardedFor.split(',').map((parte) => parte.trim()));
  }
  if (realIp) {
    candidatos.push(realIp.trim());
  }

  for (const candidato of candidatos) {
    if (candidato && ehIpValido(candidato)) {
      return candidato;
    }
  }

  return null;
}

/** Normaliza o user-agent: trunca em 1000 chars ou devolve `null`. */
export function parseUserAgent(userAgent: string | null): string | null {
  if (!userAgent) {
    return null;
  }
  const limpo = userAgent.trim();
  if (!limpo) {
    return null;
  }
  return limpo.length > MAX_UA_LENGTH ? limpo.slice(0, MAX_UA_LENGTH) : limpo;
}

/**
 * Lê os headers da request atual (Next) e resolve IP/UA. Usada pela Server
 * Action `registrarAceiteLegal`.
 */
export async function resolverRequestMeta(): Promise<RequestMeta> {
  const h = await headers();
  return {
    ipAddress: parseIp(h.get('x-forwarded-for'), h.get('x-real-ip')),
    userAgent: parseUserAgent(h.get('user-agent')),
  };
}
