/**
 * Classificação (faixas) de composição corporal — funções PURAS, sem UI.
 *
 * Apenas classifica valores JÁ calculados (não recalcula nada): recebe
 * %gordura/IMC e devolve a faixa em que o valor cai (rótulo pt-BR + cor do tema
 * pronta como string `hsl(var(--token))`) e a lista completa de faixas para
 * desenhar a barra segmentada. Testada em `tests/unit/classificacao.test.ts`.
 *
 * Referências:
 * - %gordura por gênero: faixas ACE (American Council on Exercise).
 * - IMC: faixas da OMS.
 */

/** Uma faixa de classificação (rótulo + cor + limites do domínio visual). */
export interface FaixaClassificacao {
  /** Rótulo pt-BR exibido ao usuário. */
  rotulo: string;
  /** Cor da faixa (string pronta: 'hsl(var(--success))' etc.). */
  cor: string;
  /** Limite inferior do domínio visual da faixa (inclusive). */
  min: number;
  /** Limite superior do domínio visual da faixa (exclusive, salvo a última). */
  max: number;
}

/** Domínios visuais fixos das barras de faixa. */
export const DOMINIO_GORDURA = { min: 0, max: 45 } as const;
export const DOMINIO_IMC = { min: 15, max: 45 } as const;

/**
 * Faixas de %gordura por gênero (padrão ACE). Os limites usam o domínio visual
 * fixo 0–45% nas bordas externas; a última faixa fica aberta até o máximo.
 */
export function faixasGordura(genero: 'male' | 'female'): FaixaClassificacao[] {
  if (genero === 'male') {
    return [
      { rotulo: 'Gordura essencial', cor: 'hsl(var(--chart-4))', min: DOMINIO_GORDURA.min, max: 5 },
      { rotulo: 'Atleta', cor: 'hsl(var(--chart-2))', min: 5, max: 13 },
      { rotulo: 'Bom (fitness)', cor: 'hsl(var(--success))', min: 13, max: 17 },
      { rotulo: 'Aceitável', cor: 'hsl(var(--warning))', min: 17, max: 24 },
      { rotulo: 'Obesidade', cor: 'hsl(var(--destructive))', min: 24, max: DOMINIO_GORDURA.max },
    ];
  }
  return [
    { rotulo: 'Gordura essencial', cor: 'hsl(var(--chart-4))', min: DOMINIO_GORDURA.min, max: 13 },
    { rotulo: 'Atleta', cor: 'hsl(var(--chart-2))', min: 13, max: 20 },
    { rotulo: 'Bom (fitness)', cor: 'hsl(var(--success))', min: 20, max: 24 },
    { rotulo: 'Aceitável', cor: 'hsl(var(--warning))', min: 24, max: 31 },
    { rotulo: 'Obesidade', cor: 'hsl(var(--destructive))', min: 31, max: DOMINIO_GORDURA.max },
  ];
}

/**
 * Classifica %gordura por gênero. Valores abaixo do mínimo caem na primeira
 * faixa; a última faixa é aberta à direita (qualquer valor acima do último
 * limite cai nela).
 */
export function classificarGordura(
  bodyFatPct: number,
  genero: 'male' | 'female'
): FaixaClassificacao {
  const faixas = faixasGordura(genero);
  for (const faixa of faixas) {
    if (bodyFatPct <= faixa.max) return faixa;
  }
  return faixas[faixas.length - 1];
}

/**
 * Faixas de IMC (OMS). Domínio visual fixo 15–45 kg/m² nas bordas externas; a
 * última faixa (obesidade grau III) fica aberta até o máximo.
 */
export function faixasImc(): FaixaClassificacao[] {
  return [
    { rotulo: 'Abaixo do peso', cor: 'hsl(var(--chart-4))', min: DOMINIO_IMC.min, max: 18.5 },
    { rotulo: 'Peso normal', cor: 'hsl(var(--success))', min: 18.5, max: 25 },
    { rotulo: 'Sobrepeso', cor: 'hsl(var(--warning))', min: 25, max: 30 },
    { rotulo: 'Obesidade grau I', cor: 'hsl(var(--destructive))', min: 30, max: 35 },
    { rotulo: 'Obesidade grau II', cor: 'hsl(var(--destructive))', min: 35, max: 40 },
    { rotulo: 'Obesidade grau III', cor: 'hsl(var(--destructive))', min: 40, max: DOMINIO_IMC.max },
  ];
}

/**
 * Classifica IMC (OMS). As bordas são inclusivas no limite inferior da faixa
 * seguinte (ex.: 25.0 → "Sobrepeso"), seguindo a convenção da OMS.
 */
export function classificarImc(bmi: number): FaixaClassificacao {
  const faixas = faixasImc();
  for (const faixa of faixas) {
    if (bmi < faixa.max) return faixa;
  }
  return faixas[faixas.length - 1];
}
