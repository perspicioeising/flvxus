/**
 * Camada PURA de apresentação da UX social da Arena (G3). Sem I/O — testável
 * isolada em `tests/unit/arena-social.test.ts` (molde de `lib/arena/{niveis,datas}`).
 *
 * Cobre:
 * - normalização/validação do `@handle` social (regex `^[a-z0-9_]{3,30}$`,
 *   `trim`/`lower` ANTES de validar) — espelha a constraint de formato de
 *   `profiles.social_handle` da migration G3;
 * - countdown de dias restantes de um desafio a partir de `ends_on` e do
 *   dia-SP de "agora" (reusa `diaSP` de `lib/arena/datas.ts`; período encerrado
 *   → 0);
 * - rótulo pt-BR do resultado de um membro de desafio.
 */

import { diaSP } from '@/lib/arena/datas';
import type { ChallengeMemberResult } from '@/types/database.types';

/** Formato canônico do handle social (mesma regex da constraint do banco). */
const HANDLE_REGEX = /^[a-z0-9_]{3,30}$/;

/**
 * Normaliza um input de handle para a forma canônica: remove espaços nas bordas
 * e um eventual `@` inicial, e passa para minúsculas. Retorna o handle
 * normalizado quando ele é válido (`^[a-z0-9_]{3,30}$`), ou `null` caso
 * contrário (vazio, curto/longo demais, símbolos inválidos, `null`/`undefined`).
 */
export function normalizarHandle(input: string | null | undefined): string | null {
  if (typeof input !== 'string') {
    return null;
  }
  const normalizado = input.trim().replace(/^@/, '').toLowerCase();
  return HANDLE_REGEX.test(normalizado) ? normalizado : null;
}

/** `true` quando o input, depois de normalizado, é um handle válido. */
export function handleValido(input: string | null | undefined): boolean {
  return normalizarHandle(input) !== null;
}

/**
 * Converte um dia-SP (`YYYY-MM-DD`) em um número de dias desde a época (UTC),
 * para subtração segura sem fuso. Retorna `null` quando a string não é uma data
 * válida no formato esperado.
 */
function diasDesdeEpoca(dia: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dia);
  if (!m) {
    return null;
  }
  const ts = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  if (Number.isNaN(ts)) {
    return null;
  }
  return Math.floor(ts / 86_400_000);
}

/**
 * Dias restantes de um desafio até o seu `ends_on` (inclusive), medidos pelo
 * dia-SP de `agora`. `ends_on` é a data final do desafio (`YYYY-MM-DD`). Já
 * encerrado (ou `ends_on` igual ao dia atual passado) → `0`; nunca negativo.
 * Retorna `0` para entradas inválidas (degradação segura na UI).
 */
export function diasRestantes(endsOn: string, agora: Date | string): number {
  const diaAgora = diaSP(agora);
  if (!diaAgora) {
    return 0;
  }
  const fim = diasDesdeEpoca(endsOn);
  const hoje = diasDesdeEpoca(diaAgora);
  if (fim === null || hoje === null) {
    return 0;
  }
  const restam = fim - hoje;
  return restam > 0 ? restam : 0;
}

/** Rótulo pt-BR do resultado de um membro de desafio. */
export function rotuloResultado(result: ChallengeMemberResult): string {
  switch (result) {
    case 'won':
      return 'Vitória';
    case 'lost':
      return 'Derrota';
    case 'tie':
      return 'Empate';
    case 'pending':
    default:
      return 'Em andamento';
  }
}
