/**
 * Cálculos puros de avaliação física (sem dependência de UI nem de Supabase).
 *
 * Todas as dobras cutâneas (skinfolds) são informadas em MILÍMETROS (mm) e as
 * circunferências/peso/altura em cm/kg. A conversão densidade→%gordura usa a
 * equação de Siri. As funções são determinísticas e testadas em
 * `tests/unit/assessment.test.ts`.
 *
 * Fontes das fórmulas (densidade corporal `Db` em g/cm³; `log` = log base 10):
 *
 * - IMC: peso(kg) / altura(m)². (OMS)
 * - Siri (1961): %gordura = (495 / Db) − 450.
 * - Pollock 3 dobras (Jackson & Pollock, 1978 / Jackson, Pollock & Ward, 1980):
 *     Homem  (peitoral, abdominal, coxa):
 *       Db = 1.10938 − 0.0008267·Σ + 0.0000016·Σ² − 0.0002574·idade
 *     Mulher (tríceps, suprailíaca, coxa):
 *       Db = 1.0994921 − 0.0009929·Σ + 0.0000023·Σ² − 0.0001392·idade
 * - Pollock 7 dobras (peitoral, axilar média, tríceps, subescapular, abdominal,
 *   suprailíaca, coxa):
 *     Homem:  Db = 1.112 − 0.00043499·Σ + 0.00000055·Σ² − 0.00028826·idade
 *     Mulher: Db = 1.097 − 0.00046971·Σ + 0.00000056·Σ² − 0.00012828·idade
 * - Guedes (protocolo brasileiro, 3 dobras, log base 10):
 *     Homem  (tríceps + suprailíaca + abdominal):
 *       Db = 1.17136 − 0.06706·log(Σ)
 *     Mulher (coxa + suprailíaca + subescapular):
 *       Db = 1.16650 − 0.07063·log(Σ)
 * - Durnin & Womersley (1974, 4 dobras: bíceps, tríceps, subescapular,
 *   suprailíaca; log base 10; coeficientes C e M por faixa etária e gênero):
 *       Db = C − M·log(Σ)
 */

/** Gêneros aceitos pelos cálculos. Demais valores recaem em 'male'/'female' explícito. */
export type GeneroCalculo = 'male' | 'female';

/** Converte densidade corporal (g/cm³) em percentual de gordura pela equação de Siri. */
export function siri(densidade: number): number {
  return 495 / densidade - 450;
}

/** Índice de Massa Corporal: peso(kg) / altura(m)². Altura informada em cm. */
export function imc(pesoKg: number, alturaCm: number): number {
  if (pesoKg <= 0 || alturaCm <= 0) {
    throw new Error('Peso e altura devem ser positivos.');
  }
  const alturaM = alturaCm / 100;
  return pesoKg / (alturaM * alturaM);
}

/** Soma simples de dobras, ignorando valores ausentes (undefined/null). */
function soma(valores: Array<number | null | undefined>): number {
  return valores.reduce<number>((acc, v) => acc + (typeof v === 'number' ? v : 0), 0);
}

// ---------------------------------------------------------------------------
// Pollock 3 dobras
// ---------------------------------------------------------------------------

/** Dobras do protocolo Pollock 3 — variam por gênero. */
export interface DobrasPollock3 {
  /** Peitoral (mm) — HOMEM. */
  chest?: number | null;
  /** Abdominal (mm) — HOMEM. */
  abdominal?: number | null;
  /** Tríceps (mm) — MULHER. */
  triceps?: number | null;
  /** Suprailíaca (mm) — MULHER. */
  suprailiac?: number | null;
  /** Coxa (mm) — AMBOS. */
  thigh?: number | null;
}

/**
 * Densidade corporal por Pollock 3 dobras (soma das 3 + idade).
 * Homem: peitoral+abdominal+coxa. Mulher: tríceps+suprailíaca+coxa.
 */
export function densidadePollock3(
  dobras: DobrasPollock3,
  idade: number,
  genero: GeneroCalculo
): number {
  const s =
    genero === 'male'
      ? soma([dobras.chest, dobras.abdominal, dobras.thigh])
      : soma([dobras.triceps, dobras.suprailiac, dobras.thigh]);

  if (genero === 'male') {
    return 1.10938 - 0.0008267 * s + 0.0000016 * s * s - 0.0002574 * idade;
  }
  return 1.0994921 - 0.0009929 * s + 0.0000023 * s * s - 0.0001392 * idade;
}

/** %gordura por Pollock 3 dobras (densidade → Siri). */
export function pollock3(dobras: DobrasPollock3, idade: number, genero: GeneroCalculo): number {
  return siri(densidadePollock3(dobras, idade, genero));
}

// ---------------------------------------------------------------------------
// Pollock 7 dobras
// ---------------------------------------------------------------------------

/** Dobras do protocolo Pollock 7 (iguais para ambos os gêneros). */
export interface DobrasPollock7 {
  chest?: number | null;
  midaxillary?: number | null;
  triceps?: number | null;
  subscapular?: number | null;
  abdominal?: number | null;
  suprailiac?: number | null;
  thigh?: number | null;
}

/** Densidade corporal por Pollock 7 dobras (soma das 7 + idade). */
export function densidadePollock7(
  dobras: DobrasPollock7,
  idade: number,
  genero: GeneroCalculo
): number {
  const s = soma([
    dobras.chest,
    dobras.midaxillary,
    dobras.triceps,
    dobras.subscapular,
    dobras.abdominal,
    dobras.suprailiac,
    dobras.thigh,
  ]);

  if (genero === 'male') {
    return 1.112 - 0.00043499 * s + 0.00000055 * s * s - 0.00028826 * idade;
  }
  return 1.097 - 0.00046971 * s + 0.00000056 * s * s - 0.00012828 * idade;
}

/** %gordura por Pollock 7 dobras (densidade → Siri). */
export function pollock7(dobras: DobrasPollock7, idade: number, genero: GeneroCalculo): number {
  return siri(densidadePollock7(dobras, idade, genero));
}

// ---------------------------------------------------------------------------
// Guedes (protocolo brasileiro, 3 dobras, log10)
// ---------------------------------------------------------------------------

/** Dobras do protocolo Guedes — variam por gênero. */
export interface DobrasGuedes {
  /** Tríceps (mm) — HOMEM. */
  triceps?: number | null;
  /** Abdominal (mm) — HOMEM. */
  abdominal?: number | null;
  /** Coxa (mm) — MULHER. */
  thigh?: number | null;
  /** Subescapular (mm) — MULHER. */
  subscapular?: number | null;
  /** Suprailíaca (mm) — AMBOS. */
  suprailiac?: number | null;
}

/**
 * Densidade corporal por Guedes (log base 10 da soma de 3 dobras).
 * Homem: tríceps+suprailíaca+abdominal. Mulher: coxa+suprailíaca+subescapular.
 */
export function densidadeGuedes(dobras: DobrasGuedes, genero: GeneroCalculo): number {
  const s =
    genero === 'male'
      ? soma([dobras.triceps, dobras.suprailiac, dobras.abdominal])
      : soma([dobras.thigh, dobras.suprailiac, dobras.subscapular]);

  if (s <= 0) {
    throw new Error('A soma das dobras deve ser positiva para o protocolo Guedes.');
  }

  const log = Math.log10(s);
  if (genero === 'male') {
    return 1.17136 - 0.06706 * log;
  }
  return 1.1665 - 0.07063 * log;
}

/** %gordura por Guedes (densidade → Siri). */
export function guedes(dobras: DobrasGuedes, genero: GeneroCalculo): number {
  return siri(densidadeGuedes(dobras, genero));
}

// ---------------------------------------------------------------------------
// Durnin & Womersley (4 dobras, log10, por faixa etária)
// ---------------------------------------------------------------------------

/** Dobras do protocolo Durnin & Womersley (iguais para ambos os gêneros). */
export interface DobrasDurnin {
  biceps?: number | null;
  triceps?: number | null;
  subscapular?: number | null;
  suprailiac?: number | null;
}

/** Coeficientes [C, M] de Durnin por gênero e faixa etária. */
interface CoefDurnin {
  c: number;
  m: number;
}

/** Seleciona os coeficientes de Durnin pela idade e gênero. */
function coefDurnin(idade: number, genero: GeneroCalculo): CoefDurnin {
  if (genero === 'male') {
    if (idade < 17) return { c: 1.1533, m: 0.0643 };
    if (idade <= 19) return { c: 1.162, m: 0.063 };
    if (idade <= 29) return { c: 1.1631, m: 0.0632 };
    if (idade <= 39) return { c: 1.1422, m: 0.0544 };
    if (idade <= 49) return { c: 1.162, m: 0.07 };
    return { c: 1.1715, m: 0.0779 };
  }
  if (idade < 17) return { c: 1.1369, m: 0.0598 };
  if (idade <= 19) return { c: 1.1549, m: 0.0678 };
  if (idade <= 29) return { c: 1.1599, m: 0.0717 };
  if (idade <= 39) return { c: 1.1423, m: 0.0632 };
  if (idade <= 49) return { c: 1.1333, m: 0.0612 };
  return { c: 1.1339, m: 0.0645 };
}

/**
 * Densidade corporal por Durnin & Womersley (log base 10 da soma de 4 dobras,
 * coeficientes por faixa etária/gênero).
 */
export function densidadeDurnin(
  dobras: DobrasDurnin,
  idade: number,
  genero: GeneroCalculo
): number {
  const s = soma([dobras.biceps, dobras.triceps, dobras.subscapular, dobras.suprailiac]);

  if (s <= 0) {
    throw new Error('A soma das dobras deve ser positiva para o protocolo Durnin.');
  }

  const { c, m } = coefDurnin(idade, genero);
  return c - m * Math.log10(s);
}

/** %gordura por Durnin & Womersley (densidade → Siri). */
export function durnin(dobras: DobrasDurnin, idade: number, genero: GeneroCalculo): number {
  return siri(densidadeDurnin(dobras, idade, genero));
}

// ---------------------------------------------------------------------------
// Massas (gorda / magra)
// ---------------------------------------------------------------------------

/** Massa gorda (kg) a partir do peso e do %gordura (0–100). */
export function massaGordaKg(pesoKg: number, percentualGordura: number): number {
  return (pesoKg * percentualGordura) / 100;
}

/** Massa magra (kg) a partir do peso e do %gordura (0–100). */
export function massaMagraKg(pesoKg: number, percentualGordura: number): number {
  return pesoKg - massaGordaKg(pesoKg, percentualGordura);
}

// ---------------------------------------------------------------------------
// Cálculo consolidado por protocolo (usado pela Server Action)
// ---------------------------------------------------------------------------

/** Protocolos de avaliação suportados (espelha o enum `assessment_protocol`). */
export type ProtocoloCalculo = 'pollock_3' | 'pollock_7' | 'guedes' | 'durnin' | 'manual';

/** Entrada agregada para o cálculo de composição corporal por protocolo. */
export interface EntradaComposicao {
  protocol: ProtocoloCalculo;
  genero: GeneroCalculo;
  idade?: number | null;
  pesoKg?: number | null;
  alturaCm?: number | null;
  /** %gordura informado manualmente (apenas protocolo 'manual'). */
  bodyFatPctManual?: number | null;
  dobras: DobrasPollock3 & DobrasPollock7 & DobrasGuedes & DobrasDurnin;
}

/** Resultado dos cálculos de composição corporal. */
export interface ResultadoComposicao {
  bmi: number | null;
  bodyFatPct: number | null;
  fatMassKg: number | null;
  leanMassKg: number | null;
}

/**
 * Calcula IMC, %gordura (pelo protocolo), massa gorda e magra. Usado no servidor
 * pela Server Action de avaliação. Campos ausentes resultam em `null` no respectivo
 * cálculo (não quebra), permitindo avaliações parciais.
 */
export function calcularComposicao(entrada: EntradaComposicao): ResultadoComposicao {
  const { protocol, genero, idade, pesoKg, alturaCm, bodyFatPctManual, dobras } = entrada;

  const bmi =
    typeof pesoKg === 'number' && typeof alturaCm === 'number' && pesoKg > 0 && alturaCm > 0
      ? imc(pesoKg, alturaCm)
      : null;

  let bodyFatPct: number | null = null;
  const idadeOk = typeof idade === 'number' && idade > 0;

  switch (protocol) {
    case 'pollock_3':
      if (idadeOk) bodyFatPct = pollock3(dobras, idade as number, genero);
      break;
    case 'pollock_7':
      if (idadeOk) bodyFatPct = pollock7(dobras, idade as number, genero);
      break;
    case 'durnin':
      if (idadeOk) bodyFatPct = durnin(dobras, idade as number, genero);
      break;
    case 'guedes':
      bodyFatPct = guedes(dobras, genero);
      break;
    case 'manual':
      bodyFatPct = typeof bodyFatPctManual === 'number' ? bodyFatPctManual : null;
      break;
  }

  let fatMassKg: number | null = null;
  let leanMassKg: number | null = null;
  if (typeof pesoKg === 'number' && pesoKg > 0 && bodyFatPct != null) {
    fatMassKg = massaGordaKg(pesoKg, bodyFatPct);
    leanMassKg = massaMagraKg(pesoKg, bodyFatPct);
  }

  return { bmi, bodyFatPct, fatMassKg, leanMassKg };
}
