-- Intensidade percebida (RPE 1..10) opcional ao finalizar o treino do aluno.
-- Coluna nullable: finalizar sem informar continua valido (intensidade e opcional).
alter table public.workout_sessions
  add column perceived_intensity smallint
    check (perceived_intensity is null or perceived_intensity between 1 and 10);

comment on column public.workout_sessions.perceived_intensity is
  'Intensidade percebida do treino (RPE 1..10) informada pelo aluno ao finalizar. NULL = nao informada.';
