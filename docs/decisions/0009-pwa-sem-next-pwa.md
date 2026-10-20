# ADR 0009 — PWA nesta fase: manifest nativo, sem `next-pwa`

- **Status:** aceito
- **Data:** 2026-10-20
- **Relacionado:** `docs/architecture.md` §10; **ADR 0007** (estratégia mobile/PWA); `app/manifest.ts`,
  `capacitor.config.json`, `next.config.js`, `docs/pendencias.md`

## Contexto

O ADR 0007 definiu a v2 como PWA (Web App Manifest + service worker) empacotado pelo Capacitor
sobre o app hospedado com HTTPS, e deixou **explicitamente para a Fase 3** a escolha entre
`next-pwa` e service worker manual — com default em `next-pwa` "se não houver atrito com Next 15".

Ao executar a Fase 3 (fundação do front-end) sobre **Next 15 + React 19**, confirmei que:

1. O pacote `next-pwa` mais referenciado (`shadowwalker/next-pwa`) está **sem manutenção ativa** e
   não acompanha o App Router do Next 15 sem _patches_ de comunidade; integrá-lo agora adiciona
   dívida e risco de build.
2. O **Next oferece suporte a PWA de forma nativa** (Web App Manifest via `app/manifest.ts` e
   registro de service worker próprio), que é o caminho recomendado atual para App Router.
3. O **escopo desta fase** é apenas a **base**: tornar o app **instalável** (manifest + ícones +
   metadados). O cache offline do app shell é trabalho de uma fase posterior, não um requisito de
   fundação.

## Opções consideradas

- **(A) Adotar `next-pwa` agora** (default do ADR 0007). Entrega SW com Workbox, mas com pacote
  desatualizado e atrito conhecido com Next 15/App Router — dívida imediata numa fase de base.
- **(B) `app/manifest.ts` nativo agora + service worker como pendência documentada.** Entrega a
  instalabilidade exigida pela fundação sem acoplar um pacote frágil; o SW/offline entra depois com
  a abordagem nativa do Next ou um sucessor mantido (ex.: Serwist), quando o shell estiver estável.
- **(C) SW manual completo agora.** Fora do escopo da fundação e arriscado antes de as rotas por
  papel existirem.

## Decisão

- **Opção B.** Nesta fase, o PWA se limita a `app/manifest.ts` (nome "Flvxus", ícones de
  `public/`, `theme_color`/`background_color` derivados dos tokens, `lang: "pt-BR"`,
  `display: "standalone"`), tornando o app **instalável**.
- **Não** adicionar `next-pwa` ao `package.json` nesta fase (refina o default "next-pwa" do
  ADR 0007, que era condicionado a "sem atrito com Next 15").
- O **service worker / cache offline** fica como **esboço documentado** em `docs/pendencias.md`,
  com escopo de cache definido (app shell/assets; **dados sensíveis não são cacheados**, por LGPD),
  a ser implementado em fase posterior com a abordagem nativa do Next ou um sucessor mantido.
- O **Capacitor** segue o ADR 0007: aponta para a URL hospedada com **HTTPS** (`cleartext: false`)
  e empacota o mesmo app.

## Justificativa

A fundação precisa de instalabilidade, não de offline completo. Acoplar um pacote PWA sem
manutenção a uma base recém-migrada para Next 15 criaria dívida e risco de build logo no alicerce.
O manifest nativo entrega o requisito desta fase com custo mínimo e mantém a porta aberta para o SW
na abordagem recomendada, sem contradizer o ADR 0007 (que previu a confirmação da escolha na Fase 3).

## Consequências

- `docs/architecture.md` §10 e o ADR 0007 permanecem válidos; esta ADR apenas fixa a implementação
  da Fase 3 (manifest sim, `next-pwa` não) e remete o SW para `docs/pendencias.md`.
- A instalabilidade é verificável pelo web manifest emitido no `next build`; o offline do shell é
  pendência rastreada.
- Quando o SW for implementado, reavaliar entre o registro nativo do Next e um pacote mantido
  (ex.: Serwist), evitando o `next-pwa` desatualizado.
