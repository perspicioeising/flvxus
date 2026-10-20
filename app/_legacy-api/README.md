# `_legacy-api/` — rotas da v1 (código morto, só referência)

Este diretório contém as antigas rotas `app/api/*` da **v1**, movidas para cá
(`git mv app/api app/_legacy-api`) na Fase 3 (FEAT-002) ao adotar o `@supabase/ssr`.

## Por que está fora do roteamento

O App Router do Next só serve rotas sob `app/api`. Como esta pasta se chama `_legacy-api`,
**nada aqui é roteável** nem entra no grafo de build das páginas. É consulta, não runtime.

## NÃO reativar

Estas rotas dependem de pacotes que foram **removidos** na migração de stack (FEAT-001):

- `@supabase/auth-helpers-nextjs` → substituído por `@supabase/ssr`
  (`lib/supabase/{server,browser,middleware,admin}.ts`).
- `@google/generative-ai` / `@google/genai` → a IA migra para **Anthropic via Edge Functions**
  (ADR 0001), nas Fases 4–6.

Mover qualquer arquivo daqui de volta para `app/api/` quebra o `next build`.

## O que fazer com este código

Serve de **referência funcional** ao reconstruir os endpoints na v2. A lógica será reescrita
como **Server Actions** / novos **Route Handlers** (usando `lib/supabase/server.ts` e, quando
o `service_role` for necessário, `lib/supabase/admin.ts` com `tenant_id` obrigatório — §4.4) ou
como **Edge Functions** (IA), conforme as Fases 4–6 do plano. Ao concluir cada área, os
arquivos correspondentes aqui devem ser removidos.
