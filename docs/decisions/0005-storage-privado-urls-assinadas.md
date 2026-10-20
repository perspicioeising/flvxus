# ADR 0005 — Storage privado com URLs assinadas

- **Status:** aceito
- **Data:** 2026-10-19
- **Relacionado:** `docs/architecture.md` §7 e §11; `docs/audit.md` §3.2 e §6

## Contexto

A v1 tem **todos os buckets de Storage públicos** (`public = true`) e **sem nenhuma policy em
`storage.objects`**. Fotos de avaliação (dado de saúde, LGPD) e áudios ficam acessíveis por URL
pública — o risco de segurança mais grave do estado atual. A visão v2 exige buckets privados com
policies por professor/aluno e URLs assinadas.

## Decisão

1. **Todos os buckets privados** (`public = false`), com policies em `storage.objects`.
2. **Acesso só por URLs assinadas** de TTL curto, geradas no servidor (`lib/storage/`).
3. **Buckets e convenção de path** conforme `docs/architecture.md` §7:
   - `assessment-photos` — `{tenant_id}/{student_id}/{assessment_id}/...` — dado de saúde.
   - `exercise-videos` — `{tenant_id}/{exercise_id}/...`
   - `exercise-audio` — `{tenant_id}/{exercise_id}/...`
   - `data-exports` — `{tenant_id}/{user_id}/{request_id}.zip` — LGPD, TTL muito curto.
4. **Policies** casam o 1º segmento do path (`tenant_id`) com `app_tenant_id()`; para fotos e
   exports, casam o 2º segmento (`student_id`/`user_id`) com o dono ou com o professor do aluno.
5. **Upload sempre pelo servidor** (Server Action) após validar papel e posse; o cliente nunca
   recebe `service_role`.

## Justificativa

Tratar fotos de avaliação como dado de saúde é obrigação de LGPD. URLs assinadas de TTL curto
dão acesso temporário sem expor o objeto publicamente. A convenção de path com `tenant_id` no
primeiro segmento permite que a policy de `storage.objects` reutilize a mesma primitiva de
isolamento do RLS de tabelas (ADR 0004), mantendo um modelo de segurança único.

## Consequências

- Migrar os buckets existentes para privados e migrar mídias já enviadas (ou re-upload) com a
  nova convenção de path.
- **Consolidar `posture-images` (v1) em `assessment-photos`:** fotos físicas e posturais passam
  a conviver sob `{tenant_id}/{student_id}/{assessment_id}/...`; a migração de mídia remapeia os
  objetos existentes de `posture-images` para a nova convenção de path.
- Toda leitura de mídia passa a exigir uma chamada server-side para assinar a URL — custo
  pequeno, compensado pela segurança.
- `exercise-videos`/`exercise-audio` precisam de URL assinada mesmo para alunos; cachear a URL
  assinada no cliente pelo TTL evita reassinar a cada render.
