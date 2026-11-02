/**
 * Progresso de hidratação do dia — função PURA (sem I/O), testável em
 * `tests/unit/habitos-agua.test.ts`.
 *
 * Recebe os registros de ingestão (`water_intake_logs`) e soma SOMENTE os do
 * dia-SP pedido (`occurred_on === dia`, formato `YYYY-MM-DD`). O `occurred_on`
 * já é o dia-SP carimbado pelo banco (`gamification_sp_date`), então o filtro é
 * uma comparação de string exata — não reconvertemos fuso aqui.
 */

/** Registro mínimo de ingestão usado no cálculo (espelha `water_intake_logs`). */
export interface RegistroAgua {
  amount_ml: number;
  occurred_on: string;
}

/** Progresso de hidratação resolvido para a UI. */
export interface ProgressoAgua {
  /** Soma (ml) dos registros do dia pedido. */
  consumidoMl: number;
  /** Meta (ml) do dia. */
  targetMl: number;
  /** Percentual consumido frente à meta, limitado a 0..100 (inteiro). */
  pct: number;
  /** `true` quando o consumido atinge ou ultrapassa a meta. */
  metaAtingida: boolean;
}

/**
 * Calcula o progresso de água do `dia` (dia-SP `YYYY-MM-DD`) a partir dos
 * `logs`, frente a `targetMl`. Filtra por `occurred_on === dia` (registros de
 * outro dia não contam). `pct` fica preso a 0..100; `metaAtingida` reflete o
 * total real (pode exceder a meta mesmo com `pct === 100`).
 */
export function progressoAgua(
  logs: RegistroAgua[],
  targetMl: number,
  dia: string
): ProgressoAgua {
  const consumidoMl = logs
    .filter((log) => log.occurred_on === dia)
    .reduce((soma, log) => soma + (log.amount_ml ?? 0), 0);

  const pct =
    targetMl > 0 ? Math.min(100, Math.round((consumidoMl / targetMl) * 100)) : 0;

  return {
    consumidoMl,
    targetMl,
    pct,
    metaAtingida: targetMl > 0 && consumidoMl >= targetMl,
  };
}
