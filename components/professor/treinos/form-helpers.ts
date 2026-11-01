import type { ItemEditavel } from './item-editor';

/**
 * Converte os itens editáveis (campos como string, vindos dos inputs) na forma
 * que os schemas Zod esperam. Os schemas (`schemas/treino.ts`) já fazem a
 * coerção/normalização de strings vazias → `undefined`, então aqui só montamos
 * o objeto com `order_index` sequencial (a ordem da lista é a verdade) e, nas
 * fichas, o `weekday` e a `division`.
 */
export function itensEditaveisParaInput(
  itens: ItemEditavel[],
  comDiaSemana: boolean,
  comDivisao = false
): Array<Record<string, unknown>> {
  return itens.map((item, indice) => {
    const base: Record<string, unknown> = {
      exercise_id: item.exercise_id,
      order_index: indice,
      sets: item.sets,
      reps: item.reps,
      rest_seconds: item.rest_seconds,
      target_load: item.target_load,
      notes: item.notes,
    };
    if (comDiaSemana) {
      base.weekday = item.weekday ?? undefined;
    }
    if (comDivisao) {
      base.division = item.division ?? undefined;
    }
    // Propaga as séries detalhadas só quando materializadas no editor; o schema
    // normaliza cada campo (strings vazias → undefined).
    if (item.series !== undefined) {
      base.series = item.series.map((serie) => ({
        set_number: serie.set_number,
        kind: serie.kind,
        note: serie.note,
        target_reps: serie.target_reps,
        target_load: serie.target_load,
      }));
    }
    return base;
  });
}
