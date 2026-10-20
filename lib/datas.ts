/**
 * Utilitários puros de data (sem UI, sem dependências de runtime do Next).
 *
 * Usados por listagens e pela ficha 360 do aluno (ex.: "última avaliação há N
 * dias", destacar avaliação vencida). Operam sobre datas ISO (string) ou `Date`.
 */

const MS_POR_DIA = 1000 * 60 * 60 * 24;

/** Converte entrada ISO/Date em `Date`, ou `null` quando inválida/ausente. */
function paraData(valor: string | Date | null | undefined): Date | null {
  if (valor === null || valor === undefined) {
    return null;
  }
  const data = valor instanceof Date ? valor : new Date(valor);
  return Number.isNaN(data.getTime()) ? null : data;
}

/**
 * Quantidade de dias inteiros decorridos entre `dataISO` e `referencia`
 * (padrão: agora). Retorna `null` se a data for inválida. Resultado pode ser
 * negativo se a data estiver no futuro.
 */
export function diasDesde(
  dataISO: string | Date | null | undefined,
  referencia: Date = new Date()
): number | null {
  const data = paraData(dataISO);
  if (!data) {
    return null;
  }
  return Math.floor((referencia.getTime() - data.getTime()) / MS_POR_DIA);
}

/**
 * Indica se `dataISO` está "vencida": passaram-se mais de `dias` desde ela.
 * Datas ausentes/inválidas são consideradas vencidas (precisam de atenção).
 */
export function dataVencida(
  dataISO: string | Date | null | undefined,
  dias: number,
  referencia: Date = new Date()
): boolean {
  const decorridos = diasDesde(dataISO, referencia);
  if (decorridos === null) {
    return true;
  }
  return decorridos > dias;
}

/**
 * Formata uma data ISO para `dd/mm/aaaa` (pt-BR). Retorna '—' quando ausente
 * ou inválida, para uso direto na UI.
 */
export function formatarData(valor: string | Date | null | undefined): string {
  const data = paraData(valor);
  if (!data) {
    return '—';
  }
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(data);
}
