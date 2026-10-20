# ADR 0006 — Design system e tokens

- **Status:** aceito
- **Data:** 2026-10-19
- **Relacionado:** `docs/architecture.md` §9; `anotações` (diretrizes visuais da v1);
  `tailwind.config.ts`, `components.json`

## Contexto

A v1 já usa shadcn/Radix + Tailwind + `next-themes`, com um `tailwind.config.ts` que define
tokens via CSS variables (cores, radius, sombras, gradientes, keyframes). O arquivo `anotações`
documenta um design system forte em **glassmorphism, gradientes e micro-interações**. A visão
v2 pede uma UI **mobile-first (360px→desktop)**, com dark/light, estados de loading/vazio/erro,
acessibilidade e pt-BR — e um sistema **coeso e sóbrio de produto**, não só efeitos.

## Opções consideradas

- **(A) Adotar as diretrizes do `anotações` como regra geral** (gradientes/vidro por toda parte).
  Visual chamativo, mas cansativo, pesado em contraste e difícil de manter consistente.
- **(B) Sistema sóbrio com acentos.** Base neutra sólida + primária única; glassmorphism e
  gradientes reservados a destaques (métricas, sucesso, header).

## Decisão

- **Opção B.** Manter a base shadcn/Radix + Tailwind + `next-themes` e organizar em
  `components/ui/` (primitivos) e `components/patterns/` (composições do produto).
- **Tokens** em `app/globals.css` consumidos pelo `tailwind.config.ts` existente: cor (neutros +
  primária única + semânticas sucesso/alerta/erro + `chart-1..5`), tipografia (escala
  mobile-first), espaçamento (4px), radius (`--radius` + `2xl/3xl` p/ cards de destaque),
  sombras (`app-light..xl`).
- **Glassmorphism/gradientes do `anotações`** entram como **camada de acento** reservada a
  destaques, não como padrão de todas as superfícies.
- **Dark/light** via `next-themes`. **Mobile-first** 360px→desktop com breakpoints padrão.
- **Estados obrigatórios** (loading/skeleton, vazio com ação, erro com retry) em
  `components/patterns/`.
- **Acessibilidade:** primitivos Radix (foco/teclado/ARIA), contraste AA nos tokens, alvos de
  toque ≥ 44px, `html lang="pt-BR"`.
- **i18n pt-BR:** língua única nesta fase, sem framework de i18n.
- **Bibliotecas:** **manter `recharts`** (gráficos de evolução — requisito do produto) e
  **manter `framer-motion`** restrito a transições sutis de entrada/estado.

## Justificativa

Efeitos em excesso prejudicam legibilidade, contraste e manutenção — justamente num app usado
durante o treino, no celular, sob condições variáveis de luz. Uma base sóbria com acentos
preserva a identidade visual do `anotações` onde ela agrega (destaques) sem comprometer o uso
diário. Reaproveita o máximo da base já existente (tokens, Radix, config).

## Consequências

- Alguns componentes da v1 (muito gradiente/vidro) serão "acalmados" ao migrar.
- A validação plena de acessibilidade (WCAG) exige testes manuais com tecnologias assistivas e
  revisão especializada — fora do escopo de documentação; registrado como etapa posterior.
