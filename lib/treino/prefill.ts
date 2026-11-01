/**
 * Pré-preenchimento da execução a partir do ÚLTIMO realizado (sem UI, sem
 * Supabase). Puro e testável.
 *
 * Regra de produto (FEAT-001): o placeholder do input continua sendo o ALVO
 * prescrito (faixa de reps / carga-alvo), mas o VALOR inicial pré-preenchido de
 * cada série passa a ser o que o aluno realmente REALIZOU na última sessão
 * finalizada daquele exercício (casado por `exercise_id`, herdado entre fichas).
 * Reduz atrito: o aluno costuma repetir carga/reps semana a semana e só ajusta
 * quando progride.
 *
 * Hierarquia garantida PELO CHAMADOR (ver `sessao-execucao.tsx`): a retomada de
 * sessão ABERTA e a edição do aluno sempre vencem o pré-preenchimento; este
 * helper só decide o valor inicial de uma série AINDA intocada.
 */

/** Último realizado de um exercício (reps/carga), como lido de workout_set_logs. */
export interface UltimoRealizado {
  reps: number | null;
  load: number | null;
}

/** Valores iniciais (strings do input) de UMA série. */
export interface ValorInicialSerie {
  reps: string;
  carga: string;
}

/**
 * Valor inicial (reps/carga) de UMA série na execução.
 *
 * - Havendo `ultimo` realizado, retorna os valores que o aluno realmente fez,
 *   coagidos para a string que a UI exibe EXATAMENTE como em `hidratarSerie`
 *   (lib/treino/progresso.ts): `reps = String(reps_done)` e
 *   `carga = String(Number(load_done))`. O `Number(...)` descarta zeros de
 *   escala do `numeric(6,2)` (`"30.00" → "30"`, `"27.50" → "27.5"`), ficando
 *   compatível com o default da prescrição e com `passoCarga`. Campos nulos do
 *   último caem no default correspondente (ponto único de coerção).
 * - Sem `ultimo`, cai nos `defaults` da prescrição (reps `''` + carga default).
 */
export function valorInicialDaSerie(
  ultimo: UltimoRealizado | undefined,
  defaults: { reps: string | ''; carga: string }
): ValorInicialSerie {
  if (!ultimo) {
    return { reps: defaults.reps, carga: defaults.carga };
  }
  return {
    reps: ultimo.reps == null ? defaults.reps : String(ultimo.reps),
    carga: ultimo.load == null ? defaults.carga : String(Number(ultimo.load)),
  };
}
