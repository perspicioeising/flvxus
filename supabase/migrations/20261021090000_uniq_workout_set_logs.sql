-- =============================================================================
-- Índice único em workout_set_logs(session_id, plan_item_id, set_number).
-- =============================================================================
-- Motivo: `actions/execucao.ts registrarSerie` fazia read-then-write (select
-- maybeSingle + insert/update). Sob corrida (dois toques quase simultâneos na
-- mesma série), as duas leituras podiam não encontrar a linha e inserir duas
-- vezes, duplicando a série. Trocamos o fluxo por um UPSERT com
-- `onConflict: 'session_id,plan_item_id,set_number'`, que exige um índice único
-- nessas colunas para resolver o conflito no banco.
--
-- Este índice fecha a corrida de forma definitiva no servidor: uma mesma série
-- (sessão + item + número) só pode existir uma vez. `if not exists` mantém a
-- migration idempotente.
-- -----------------------------------------------------------------------------

create unique index if not exists workout_set_logs_sessao_item_set_uidx
  on public.workout_set_logs (session_id, plan_item_id, set_number);
