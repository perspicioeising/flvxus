import { z } from 'zod';

/**
 * Intenção de assinatura vinda da landing (plano + ciclo). Validada por Zod;
 * NUNCA aceita um `next`/URL livre (sem open redirect).
 */
export const intencaoSchema = z.object({
  plano: z.enum(['individual', 'personal', 'assessoria']),
  ciclo: z.enum(['monthly', 'yearly']).default('monthly'),
  acao: z.literal('assinar').optional(),
});

export type Intencao = z.infer<typeof intencaoSchema>;

type Params = URLSearchParams | Record<string, string | string[] | undefined>;

function pegar(params: Params, chave: string): string | undefined {
  if (params instanceof URLSearchParams) {
    return params.get(chave) ?? undefined;
  }
  const v = params[chave];
  return Array.isArray(v) ? v[0] : v;
}

/** Lê e valida a intenção; `null` quando ausente/inválida. */
export function lerIntencao(params: Params): Intencao | null {
  const parsed = intencaoSchema.safeParse({
    plano: pegar(params, 'plano'),
    ciclo: pegar(params, 'ciclo') ?? undefined,
    acao: pegar(params, 'acao') ?? undefined,
  });
  return parsed.success ? parsed.data : null;
}

/** Querystring (sem `?`) a partir de uma intenção validada. */
export function queryIntencao(i: Pick<Intencao, 'plano' | 'ciclo'>, comAcao = false): string {
  const q = new URLSearchParams({ plano: i.plano, ciclo: i.ciclo });
  if (comAcao) {
    q.set('acao', 'assinar');
  }
  return q.toString();
}
