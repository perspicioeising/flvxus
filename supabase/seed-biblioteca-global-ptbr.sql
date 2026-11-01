-- =============================================================================
-- Flvxus — Seed da BIBLIOTECA GLOBAL de exercícios (pt-BR) gerado por IA.
-- Gerado por scripts/gerar-seed-biblioteca-ptbr.mjs. NÃO editar à mão.
--
-- Insere SOMENTE linhas GLOBAIS (tenant_id null, created_by null, source null).
-- Idempotente: WHERE NOT EXISTS por (tenant_id is null + name). Rodar de novo
-- não duplica. instructions/tips/common_errors em pt-BR (gerados por IA sobre
-- os passos reais do catálogo). thumbnail_url = GIF público do bucket; video_url null.
-- Registros neste arquivo: 2 (de 2 no catálogo).
-- =============================================================================

insert into public.exercises (
  tenant_id, created_by, source_exercise_id, name, muscle_groups, equipment,
  instructions, tips, common_errors, video_url, thumbnail_url
)
select
  null,                 -- tenant_id: GLOBAL
  null,                 -- created_by
  null,                 -- source_exercise_id
  v.name,
  v.muscle_groups,
  v.equipment,
  v.instructions,
  v.tips,
  v.common_errors,
  null,                 -- video_url: sempre null nos globais
  v.thumbnail_url
from (values
  ('Extensão lombar',
   ARRAY['Peito','Costas','Ombros'],
   ARRAY['Peso Corporal'],
   'Execute o movimento conforme a técnica: Position yourself face down on the floor with your legs extended behind you. Set your hands on the floor next to your lower ribs, fingers pointing forward. Settle into the starting position and take an easy breath before moving deeper. Mantenha o controle em toda a amplitude.',
   ARRAY['Controle a fase excêntrica','Mantenha a postura estável','Respire de forma coordenada'],
   ARRAY['Usar impulso excessivo','Amplitude incompleta'],
   'https://nltoaiiquuryjlnikyxy.supabase.co/storage/v1/object/public/exercise-gifs/catalogo/cachorro-olhando-para-cima--01qpYSe.gif'),
  ('Elevação de joelhos na barra fixa assistida',
   ARRAY['Core'],
   ARRAY['Peso Corporal'],
   'Execute o movimento conforme a técnica: Suspend yourself from a pull-up bar with your arms straight and your palms turned away from you. Brace your trunk muscles and lift your knees toward your chest, bending at the hips and knees. Brace the abdomen and keep the shoulders anchored to the support. Mantenha o controle em toda a amplitude.',
   ARRAY['Controle a fase excêntrica','Mantenha a postura estável','Respire de forma coordenada'],
   ARRAY['Usar impulso excessivo','Amplitude incompleta'],
   'https://nltoaiiquuryjlnikyxy.supabase.co/storage/v1/object/public/exercise-gifs/catalogo/elevacao-de-joelhos-na-barra-fixa-assistida--03lzqwk.gif')
) as v(name, muscle_groups, equipment, instructions, tips, common_errors, thumbnail_url)
where not exists (
  select 1 from public.exercises e
  where e.tenant_id is null and e.name = v.name
);
