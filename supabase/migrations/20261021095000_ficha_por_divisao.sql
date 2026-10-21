-- Flvxus — Ficha por divisão A/B/C/D/E (sem dia fixo) — PARTE A (Onda 4)
-- Aditiva e idempotente: weekday permanece (nullable) para fichas legadas;
-- nada é dropado e nenhuma policy muda (posse herdada do plano pai).
alter table public.workout_plan_items add column if not exists division text;
alter table public.workout_sessions   add column if not exists division text;
create index if not exists workout_plan_items_plan_division_idx
  on public.workout_plan_items (plan_id, division);

comment on column public.workout_plan_items.division is
  'Rótulo curto da divisão do item (ex.: A, B, C ou nome do modelo). Nullable; weekday permanece para fichas por dia da semana.';
comment on column public.workout_sessions.division is
  'Rótulo curto da divisão executada na sessão. Nullable; será carimbado na PARTE B.';
