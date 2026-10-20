# Plano de Implementação — Fase 3: Fundação do Front-end e Design System (Flvxus v2)

> Worktree: `c:\Users\b.hsantos\Documents\flvxus\flvxus\.worktrees\frontend` (branch `feat/v2-frontend-foundation`).
> Git sempre via `git -C c:\Users\b.hsantos\Documents\flvxus\flvxus\.worktrees\frontend ...`. Todos os caminhos abaixo são relativos ao worktree.
> Escopo: SÓ a base (stack, tokens, layout por papel, componentes base, estados padrão, i18n pt-BR, PWA manifest, showcase). NÃO implementar as telas de alunos/avaliações/treinos/dietas (Fases 4 e 5).
>
> Verificação global (rodar após cada entregável e no fim; NUNCA rodar `next dev` nem servidores que não terminam):
> - `npm run typecheck` (tsc --noEmit)
> - `npm run lint` (next lint)
> - `npm run build` (next build)
> Todos devem passar. `npm install` deve terminar sem peer conflicts fatais (avisos de peer são aceitáveis; erro fatal não).

## Decisões de design desta fase (ver ADR 0009)

- **PWA sem `next-pwa`.** O `next-pwa` (shadowwalker) está sem manutenção e tem atrito com Next 15/App Router. Esta fase entrega instalabilidade via `app/manifest.ts` nativo do Next; o service worker/offline fica como esboço documentado em `docs/pendencias.md`. Decisão registrada como ADR 0009 (refina o default do ADR 0007).
- **Gate de papel server-side.** `(professor)/layout.tsx` e `(aluno)/layout.tsx` leem `profiles.role` via `createServerClient` e redirecionam; o middleware só renova sessão e barra não-autenticado (§5.2). Corrige o `userRole` hardcoded/`fetch('/api/profile')` client-side da v1.
- **Rotas v1 preservadas como referência.** `app/(dashboard)/`, `components/*` de domínio (students, diets, etc.) e `app/api/*` da v1 NÃO são apagados nesta fase — ficam como referência para as Fases 4-6. Criamos os novos route groups `(professor)`/`(aluno)` ao lado. (As libs de IA do Google saem do `package.json`, mas as rotas que as importam permanecem no disco como referência e não entram no grafo de build dos novos route groups; se o `next build` falhar por import quebrado numa rota v1, mover a rota ofensora para fora de `app/` — ver item 2.6.)
- **Base sóbria com acentos** (ADR 0006): tokens neutros + primária única; glassmorphism/gradiente só em destaques.

---

## Ordem de execução

Entregável 1 (stack) é pré-requisito de todos. 2 (clientes Supabase) e 3 (design system) dependem de 1 e são independentes entre si. 4 (estrutura/layouts/gates/nav) depende de 2 e 3. 5 (PWA/manifest/capacitor) depende de 4. 6 (showcase) depende de 3 e 4.

---

## 1. Stack e configuração de build (ADR 0002)

- [ ] 1.1 Reescrever `package.json`: renomear `"name"` de `fitconnect-pro` para `flvxus`.
      Dependências — REMOVER: `@google/genai`, `@google/generative-ai`, `i`, `npm`, `node-wav`, `@supabase/auth-helpers-nextjs`.
      ADICIONAR: `@supabase/ssr` (manter `@supabase/supabase-js`).
      SUBIR: `next` e `eslint-config-next` para `15.x` estável (sair da canary `14.2.0-canary.29`); `react` e `react-dom` para `19.x`; `@types/react` e `@types/react-dom` para `19.x`.
      devDeps de teste: `vitest` (já presente), `@vitest/coverage-v8`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`; manter `supabase` (CLI) como devDep.
      Ajustar ranges dos pacotes `@radix-ui/*` para versões que declaram peer compat com React 19 (subir para as últimas 1.x/2.x que listam `react@^19`); subir `next-themes` (`^0.3`+ / `^0.4` compat React 19), `vaul`, `cmdk`, `react-day-picker`, `input-otp`, `lucide-react`, `sonner`, `react-error-boundary`, `recharts`, `framer-motion` para versões compatíveis com React 19 onde o range atual não cobrir.
      Scripts: adicionar `typecheck` (`tsc --noEmit`), `test` (`vitest run`), manter `test:rls`, `db:types`, `db:reset`; manter `dev`/`build`/`start`/`lint` e os `cap:*`.
      Files: `package.json`
      Verify: `git -C <worktree> diff --stat package.json` mostra as mudanças; a validação real vem no 1.5.

- [ ] 1.2 Elevar `tsconfig.json`: `target` e `lib` de `es2015` para `ES2022` (`"lib": ["dom","dom.iterable","es2022"]`), remover `downlevelIteration`, manter `strict: true`, `moduleResolution: "bundler"`, `jsx: "preserve"`, paths `@/*`.
      Files: `tsconfig.json`
      Verify: parte do 1.5 (`npm run typecheck`).

- [ ] 1.3 Reescrever `next.config.js` para Next 15: remover `swcMinify: false`, remover `output: 'standalone'`, remover `images.unoptimized` e `trailingSlash`/`assetPrefix` de export estático; manter `reactStrictMode: true`, o alias webpack `@`, e `images.remotePatterns` (host do Supabase Storage). Converter para `next.config.mjs`/`.ts` é opcional; manter `.js` é aceitável.
      Files: `next.config.js`
      Verify: parte do 1.5 (`npm run build`).

- [ ] 1.4 Criar `vitest.config.ts` (ambiente `jsdom`, globals, setup com `@testing-library/jest-dom`, alias `@`→raiz) e `vitest.setup.ts`. Criar um teste de fumaça em `tests/unit/smoke.test.ts` para validar o runner. Criar `.env.example` na raiz com, no mínimo: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`, `NEXT_PUBLIC_SITE_URL`, `CRON_SECRET` (valores vazios/placeholder, nenhum segredo real). Garantir que `.gitignore` já ignora `.env`/`.env*.local` (já ignora).
      Files: `vitest.config.ts`, `vitest.setup.ts`, `tests/unit/smoke.test.ts`, `.env.example`
      Verify: `npm run test` — o teste de fumaça passa.

- [ ] 1.5 Rodar `npm install` para regenerar `package-lock.json` coerente com React 19 / Next 15.
      Files: `package-lock.json` (gerado)
      Verify: `npm install` conclui sem erro fatal de peer deps; em seguida `npm run typecheck`, `npm run lint`, `npm run build` passam. Se um pacote Radix bloquear o install por peer de React 18, subir esse pacote para a versão compatível com React 19 e reinstalar.

- [ ] 1.6 Commit: `chore(stack): migra para Next 15 + React 19 e @supabase/ssr; renomeia pacote para flvxus`.

## 2. Clientes Supabase com @supabase/ssr (§4, §5)

- [ ] 2.1 Criar `lib/supabase/server.ts`: `createServerClient` do `@supabase/ssr` usando `cookies()` do `next/headers` (padrão get/set/remove com try-catch para contexto RSC). Tipar com `Database` de `types/database.types.ts`.
      Files: `lib/supabase/server.ts`
      Verify: parte do 2.7.

- [ ] 2.2 Criar `lib/supabase/browser.ts`: `createBrowserClient` tipado com `Database`.
      Files: `lib/supabase/browser.ts`
      Verify: parte do 2.7.

- [ ] 2.3 Criar `lib/supabase/middleware.ts`: helper `updateSession(request)` que cria o client de middleware, renova a sessão e devolve `{ response, user }` (padrão oficial `@supabase/ssr` para middleware).
      Files: `lib/supabase/middleware.ts`
      Verify: parte do 2.7.

- [ ] 2.4 Criar `lib/supabase/admin.ts`: cliente `service_role` com API fina que OBRIGA passar `tenantId` (§4.4). Expor função tipo `createAdminClient(tenantId: string)` que retorna um objeto cujos helpers já carimbam/filtram `tenant_id`; nunca expor o client cru sem tenant. `SUPABASE_SERVICE_ROLE_KEY` lido só no servidor. Incluir comentário de regra inegociável.
      Files: `lib/supabase/admin.ts`
      Verify: parte do 2.7.

- [ ] 2.5 Reescrever `middleware.ts` da raiz com `@supabase/ssr` via `lib/supabase/middleware.ts`: renovar sessão sempre; barrar não-autenticado nas rotas protegidas (`/professor`, `/aluno`, e por retrocompat `/dashboard` enquanto a v1 existe) redirecionando para `/login`; redirecionar logados para fora de `/login` e `/register`. NÃO decidir papel (isso é dos layouts). Preservar a liberação de rotas de auth e magic link. Ajustar o `matcher` para excluir assets estáticos e `manifest`.
      Files: `middleware.ts`
      Verify: parte do 2.7.

- [ ] 2.6 Atualizar `app/providers.tsx`: trocar `createClientComponentClient` (auth-helpers) por `createBrowserClient` de `lib/supabase/browser.ts`; manter a API `useSupabase()`/contexto para não quebrar os consumidores v1. Importar `Database` de `types/database.types.ts` (não de `lib/database.types`). Se o `next build` quebrar por rotas v1 em `app/api/*` que importam libs removidas (Google IA) ou `auth-helpers`, mover essas rotas ofensoras para `app/_legacy-api/` (fora do roteamento) preservando o conteúdo como referência — documentar a lista movida em `docs/pendencias.md`.
      Files: `app/providers.tsx` (+ eventuais mudanças de localização de rotas v1 quebradas)
      Verify: parte do 2.7.

- [ ] 2.7 Verificação do entregável 2.
      Verify: `npm run typecheck`, `npm run lint`, `npm run build` passam. Commit: `feat(supabase): adota @supabase/ssr (server/browser/middleware/admin) e reescreve middleware`.

## 3. Design system: tokens, tema e componentes base (ADR 0006, §9)

- [ ] 3.1 Revisar `app/globals.css`: consolidar os tokens em escala coesa e sóbria — primária única do produto (emerald/teal já é a identidade), neutros, semânticas (sucesso/alerta/erro), `chart-1..5`, tipografia mobile-first, espaçamento 4px, `--radius` (+ `2xl/3xl` para cards de destaque), sombras `app-light..xl`, e blocos `:root`/`.dark` completos com contraste AA. Reservar gradiente/glass a classes utilitárias de acento (ex.: `.surface-glass`, `.accent-gradient`) em `@layer components`, não como padrão.
      Files: `app/globals.css`
      Verify: parte do 3.6 (build compila o CSS).

- [ ] 3.2 Garantir `.dark` em `app/globals.css` (par claro/escuro de todas as vars shadcn e das `--app-*`/rgb usadas pelo `tailwind.config.ts`). Confirmar que `tailwind.config.ts` já mapeia as vars (mantê-lo; só ajustar se faltar token). 
      Files: `app/globals.css`, `tailwind.config.ts` (ajuste pontual se necessário)
      Verify: parte do 3.6.

- [ ] 3.3 Trocar o provider de tema por `next-themes` isolado em `components/providers/theme-provider.tsx` (`attribute="class"`, `defaultTheme="system"`, `enableSystem`). Ajustar `app/providers.tsx` para usá-lo. Padronizar o toggle: consolidar em `components/ui/` ou `components/patterns/` um `ThemeToggle` (claro/escuro/sistema) acessível, reaproveitando `components/theme-toggle.tsx` da v1.
      Files: `components/providers/theme-provider.tsx`, `app/providers.tsx`, `components/theme-toggle.tsx` (ou novo em patterns)
      Verify: parte do 3.6.

- [ ] 3.4 Confirmar/alinhar os primitivos `components/ui/` necessários a esta fase (já existem na v1 como shadcn): `button`, `card`, `input`, `label`, `form`, `select`, `dialog`, `sheet`, `tabs`, `badge`, `avatar`, `sonner`/`toaster`. Ajustar apenas o que a subida para React 19 exigir (ex.: tipos de `ref`, `React.forwardRef`), sem reescrever a API. Garantir foco visível e `aria-*` nos primitivos usados.
      Files: arquivos pontuais em `components/ui/`
      Verify: parte do 3.6.

- [ ] 3.5 Criar os estados padrão em `components/patterns/`: `loading-state.tsx` (`<LoadingState/>` com skeletons), `empty-state.tsx` (`<EmptyState/>` com ícone, texto e ação sugerida), `error-state.tsx` (`<ErrorState/>` com mensagem + retry, integrando `react-error-boundary`). Textos em pt-BR, mobile-first, alvos de toque ≥44px, acessíveis. Adicionar um teste de render em `tests/unit/patterns.test.tsx` cobrindo os três.
      Files: `components/patterns/loading-state.tsx`, `components/patterns/empty-state.tsx`, `components/patterns/error-state.tsx`, `components/patterns/index.ts`, `tests/unit/patterns.test.tsx`
      Verify: `npm run test` — testes dos patterns passam.

- [ ] 3.6 Verificação do entregável 3.
      Verify: `npm run typecheck`, `npm run lint`, `npm run build`, `npm run test` passam. Commit: `feat(design-system): tokens coesos, tema claro/escuro e estados padrão (loading/vazio/erro)`.

## 4. Estrutura por papel, layouts, gates e navegação (§3, §5.2)

- [ ] 4.1 Criar route group `(marketing)` com `layout.tsx` (público) e `page.tsx` (home pública sóbria usando os tokens; pode reaproveitar/acalmar o `app/page.tsx` da v1). Mover a home pública para `(marketing)` e deixar `app/page.tsx` apenas redirecionando ou servindo a landing conforme a organização de rotas (garantir que não haja conflito de rota raiz duplicada).
      Files: `app/(marketing)/layout.tsx`, `app/(marketing)/page.tsx` (e ajuste de `app/page.tsx`)
      Verify: parte do 4.6.

- [ ] 4.2 Criar helpers de autorização em `lib/auth/`: `getSessionUser()` (usuário autenticado via `createServerClient`) e `requireRole(role)` (lê `profiles.role` e `tenant_id`; redireciona para `/login` se sem sessão e para a área correta / página de acesso negado se papel divergente). Tipar o retorno (role, tenantId, userId).
      Files: `lib/auth/index.ts` (ou `lib/auth/session.ts` + `lib/auth/require-role.ts`)
      Verify: parte do 4.6.

- [ ] 4.3 Criar `app/(professor)/layout.tsx` e `app/(aluno)/layout.tsx` como Server Components que chamam `requireRole('trainer')` / `requireRole('student')` — GATE server-side real — e renderizam o scaffolding (sidebar desktop + bottom-nav mobile + header com troca de tema). Passar papel/tenant via contexto/props. Criar as páginas internas como stubs COERENTES ("em construção" com layout e navegação reais): `app/(professor)/professor/page.tsx` e `app/(aluno)/aluno/page.tsx` (e, se úteis, stubs de subrotas listadas em §3, todas "em construção").
      Files: `app/(professor)/layout.tsx`, `app/(professor)/professor/page.tsx`, `app/(aluno)/layout.tsx`, `app/(aluno)/aluno/page.tsx`
      Verify: parte do 4.6.

- [ ] 4.4 Criar o scaffolding de navegação FUNCIONAL em `components/patterns/` (ou `components/navigation/`): `AppSidebar` (desktop, colapsável), `BottomNav` (mobile, usando `Sheet`/`ui` para menu), `AppHeader` (com `ThemeToggle` e identidade). Itens de menu distintos por papel (professor vs aluno), em pt-BR, acessíveis por teclado, alvos ≥44px. Reaproveitar a estrutura de `components/dashboard/{sidebar,header,bottom-navigation}.tsx` da v1, acalmando o visual e religando aos novos tokens e ao papel vindo do layout (sem `fetch('/api/profile')`).
      Files: `components/navigation/app-sidebar.tsx`, `components/navigation/bottom-nav.tsx`, `components/navigation/app-header.tsx` (+ index)
      Verify: parte do 4.6.

- [ ] 4.5 Atualizar `app/layout.tsx` (root): manter `html lang="pt-BR"`, aplicar fonte e `bg-background`, usar o novo `ThemeProvider`, remover `themeColor`/`viewport`/`manifest` do objeto `metadata` que o Next 15 recomenda mover para `export const viewport` e para `app/manifest.ts` (viewport como `export const viewport: Viewport`). Garantir `suppressHydrationWarning` por causa do tema.
      Files: `app/layout.tsx`
      Verify: parte do 4.6.

- [ ] 4.6 Verificação do entregável 4.
      Verify: `npm run typecheck`, `npm run lint`, `npm run build`, `npm run test` passam; o build gera as rotas `(marketing)`, `(professor)` e `(aluno)`. Commit: `feat(app): route groups por papel com gate server-side e navegação funcional`.

## 5. PWA (manifest) e Capacitor (ADR 0007 + ADR 0009)

- [ ] 5.1 Criar `app/manifest.ts` (`export default function manifest(): MetadataRoute.Manifest`): `name` "Flvxus", `short_name` "Flvxus", `description` pt-BR, `start_url` "/", `display: "standalone"`, `background_color`/`theme_color` derivados dos tokens, `lang: "pt-BR"`, `icons` apontando para `public/icon-512x512.png` (e adicionar/declarar um `icon-192` se existir; caso não exista, declarar só o 512 com `sizes` e `purpose: "any maskable"`). Remover o `public/manifest.json` estático e a referência `manifest: '/manifest.json'` do layout (substituídos pelo manifest dinâmico).
      Files: `app/manifest.ts`, `app/layout.tsx` (remoção da referência estática), remover `public/manifest.json`
      Verify: parte do 5.4; o build gera `/manifest.webmanifest`.

- [ ] 5.2 Revisar `capacitor.config.json`: `cleartext: false`; `server.url` apontando para HTTPS (`https://flvxus.com.br` ou `NEXT_PUBLIC_SITE_URL`); manter `appId`/`appName`/plugins. Remover `webDir: "out"` tensionado com export estático (ou documentar que o Capacitor aponta para a URL hospedada, não para `out/`). Documentar a estratégia PWA+Capacitor.
      Files: `capacitor.config.json`
      Verify: parte do 5.4 (não há build nativo aqui; validar apenas JSON válido e coerência).

- [ ] 5.3 Registrar em `docs/pendencias.md` o esboço do service worker/offline (escopo de cache: app shell/assets; dados sensíveis NÃO cacheados por LGPD) e a lista de rotas/pastas v1 movidas para `_legacy-api`/referência (se houver). Atualizar `lib/api-config.ts` para a URL hospedada via `NEXT_PUBLIC_SITE_URL`.
      Files: `docs/pendencias.md`, `lib/api-config.ts`
      Verify: parte do 5.4.

- [ ] 5.4 Verificação do entregável 5.
      Verify: `npm run typecheck`, `npm run lint`, `npm run build` passam e o build emite o web manifest. Commit: `feat(pwa): manifest instalável e revisão do Capacitor (HTTPS); SW como pendência`.

## 6. Página de showcase do design system

- [ ] 6.1 Criar a página de showcase (ex.: `app/(professor)/professor/ui-kit/page.tsx`, protegida pelo gate de professor) que renderiza os tokens (amostras de cor light/dark, tipografia, espaçamento, radius, sombras) e os componentes base (`Button` com variantes, `Card`, `Input/Field`, `Select`, `Dialog`, `Sheet`, `Tabs`, `Badge`, `Avatar`, `Toast` via sonner) e os estados padrão (`LoadingState`/`EmptyState`/`ErrorState`). Tudo em pt-BR, mobile-first, com alternância de tema visível. Adicionar link para a showcase na navegação do professor.
      Files: `app/(professor)/professor/ui-kit/page.tsx` (+ item de menu em `components/navigation`)
      Verify: parte do 6.2.

- [ ] 6.2 Verificação do entregável 6 (e verificação final).
      Verify: `npm run typecheck`, `npm run lint`, `npm run build`, `npm run test` passam. Commit: `feat(design-system): página de showcase (ui-kit) dos tokens e componentes`.

---

## Critérios de verificação (resumo)

1. `npm install` sem peer conflicts fatais.
2. `npm run typecheck` sem erros.
3. `npm run lint` sem erros.
4. `npm run build` conclui e gera as rotas dos route groups + web manifest.
5. `npm run test` (Vitest) verde (fumaça + patterns).
6. Gate de papel REAL nos layouts `(professor)`/`(aluno)` (server-side via `profiles.role`).
7. `html lang="pt-BR"`, interface 100% pt-BR, mobile-first 360px, foco/labels/contraste AA.
8. `.env.example` presente e sem segredos reais; nenhum segredo commitado.
9. Não contradiz `architecture.md` nem ADRs; não quebra artefatos da Fase 2 (migrations, `types/database.types.ts`, `tests/rls`, docs).

## Sugestão de commits (pt-BR, pequenos e lógicos)

1. `chore(stack): migra para Next 15 + React 19 e @supabase/ssr; renomeia pacote para flvxus`
2. `feat(supabase): adota @supabase/ssr (server/browser/middleware/admin) e reescreve middleware`
3. `feat(design-system): tokens coesos, tema claro/escuro e estados padrão (loading/vazio/erro)`
4. `feat(app): route groups por papel com gate server-side e navegação funcional`
5. `feat(pwa): manifest instalável e revisão do Capacitor (HTTPS); SW como pendência`
6. `feat(design-system): página de showcase (ui-kit) dos tokens e componentes`
7. `docs(adr): adiciona ADR 0009 (PWA sem next-pwa nesta fase)`

> Observação: ao final de cada entregável, rodar typecheck+lint+build (e test quando houver testes) antes de commitar.
