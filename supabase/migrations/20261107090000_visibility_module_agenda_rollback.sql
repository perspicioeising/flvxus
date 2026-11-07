-- Rollback de 20261107090000_visibility_module_agenda.sql
-- O Postgres NAO permite remover um valor de enum (alter type ... drop value
-- nao existe). O valor 'agenda' permanece no tipo; este rollback e um no-op seguro.
-- As linhas 'agenda' de tenant_module_visibility sao removidas pelo rollback de
-- 20261107090100_agenda_core.
select 1;
