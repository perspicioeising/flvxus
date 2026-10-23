-- =============================================================================
-- Flvxus — Recria as conquistas (gamificação) do tenant "Treinador Eising"
-- =============================================================================
-- O conjunto inicial de conquistas é semeado por uma função do banco
-- (seed_achievements_for_tenant), criada na migration
-- 20261021091000_gamificacao_conquistas.sql. Após o reset do banco, basta
-- chamar essa função para o seu tenant — ela é IDEMPOTENTE (identifica cada
-- conquista por rule->>'code', então rodar de novo não duplica).
--
-- Tenant: ae4e4d12-7d48-4e23-8ef1-ccab78144d5d  (Treinador Eising)
--
-- Conquistas semeadas (ADR 0013):
--   • Primeiro treino        — 1ª sessão concluída                      (20 pts)
--   • Semana cheia           — 3 sessões concluídas na mesma semana     (30 pts)
--   • Sequência de 7 dias    — 7 dias seguidos treinando                (50 pts)
--   • 100 pontos             — acumular 100 pontos de gamificação       (0 pts)
--
-- A concessão ocorre automaticamente no banco quando o aluno finaliza a sessão
-- (trigger award_points_on_session_finish). Nada mais a configurar.
-- =============================================================================

select public.seed_achievements_for_tenant('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d');

-- Verificação (deve retornar 4 linhas):
-- select name, points, rule ->> 'code' as code
-- from public.achievements
-- where tenant_id = 'ae4e4d12-7d48-4e23-8ef1-ccab78144d5d'
-- order by points desc;
