# ADR 0012 — LGPD do aluno: consentimento e solicitação de export/exclusão

- **Status:** aceito
- **Data:** 2026-10-20
- **Relacionado:** `docs/architecture.md` (§6.2, §11 LGPD);
  `supabase/migrations/20261020090700_lgpd.sql`; **FEAT-004** (perfil + LGPD);
  `app/(aluno)/aluno/perfil/page.tsx`, `components/aluno/perfil/lgpd-controles.tsx`,
  `actions/perfil.ts`, `schemas/perfil.ts`

## Contexto

O aluno é o titular dos próprios dados e, pela LGPD, precisa poder (1) conceder/revogar
consentimentos e (2) solicitar a exportação e a exclusão dos seus dados. O schema v2 já modela
isso em `consent_records` (append-only, histórico) e `data_requests`
(`request_type` export/delete, `status` requested→processing→completed/rejected). A FEAT-004 pede
a tela do aluno e exige documentar como esses controles se comportam, em especial o limite de
escopo desta fase.

## Opções consideradas

- **(A) Consentimento como estado mutável.** Um `update` por tipo guardando apenas o valor atual.
  Perde o histórico de quando o aluno concedeu/revogou — ruim para prova de conformidade.
- **(B) Consentimento append-only + estado atual derivado.** Cada mudança é uma nova linha em
  `consent_records` (com `granted_at`/`revoked_at`); o estado vigente é o último registro por tipo.
- **(C) Processar export/exclusão de forma síncrona agora.** Gerar o pacote de export e apagar os
  dados no ato da solicitação. Exige orquestração (bucket privado, cascatas, anonimização) e
  envolve service_role — fora do escopo da área do aluno nesta fase.

## Decisão

- **Consentimento: opção B.** `registrarConsentimento` faz `insert` append-only em
  `consent_records`, carimbando `tenant_id`/`user_id` do aluno e gravando `granted_at` ao conceder
  ou `revoked_at` ao revogar. A tela lê o **último registro por tipo** para montar o estado dos
  switches.
- **Solicitações: registrar, não processar.** `solicitarDados` faz `insert` em `data_requests` com
  `status = 'requested'`. O PROCESSAMENTO efetivo (gerar o export no bucket privado; executar a
  exclusão/anonimização) **não** é implementado nesta fase — fica como pendência documentada,
  porque depende de service_role e de rotina de backend fora da área do aluno.
- Tudo roda no contexto do próprio aluno sob RLS (`consent_records_insert`/`data_requests_insert`
  exigem `user_id = auth.uid()`); **nada de service_role** no fluxo do aluno.

## Justificativa

O modelo append-only preserva a trilha de auditoria que a LGPD valoriza, sem precisar de tabela
extra. Registrar a solicitação sem processá-la já cumpre o direito do titular de PEDIR, deixando o
aluno ciente do status, enquanto a execução segura (que mexe em dados de terceiros via cascata e
precisa de privilégio elevado) é tratada de forma controlada depois — evitando exclusões
irreversíveis disparadas direto da UI.

## Consequências

- O processamento de export (montar o arquivo em `data-exports`) e de exclusão/anonimização é
  pendência (ver `docs/pendencias.md`): precisa de uma rotina com service_role que leia
  `data_requests` com `status = 'requested'`, execute e atualize o status/`export_path`.
- O status das solicitações é somente leitura para o aluno; só o sistema/service_role avança
  `requested → processing → completed/rejected` (a policy de `update` de `data_requests` não libera
  o titular).
- Qualquer novo consentimento deve reusar os tipos de `schemas/perfil.ts` (`TIPOS_CONSENTIMENTO`) e
  o padrão append-only; não introduzir `update` de valor atual em `consent_records`.
