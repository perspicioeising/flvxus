# ADR 0001 — IA com a API da Anthropic (modelos e integração)

- **Status:** aceito
- **Data:** 2026-10-19
- **Contexto:** A v1 usa Google Gemini com string de modelo fixa espalhada por 4 arquivos,
  sem validação de saída, sem rate limit, sem log de uso e sem proteção contra prompt
  injection. A visão v2 exige IA exclusivamente pela API da Anthropic, com a chave só no
  servidor, via Supabase Edge Functions que validam JWT e papel do usuário.

## Dados oficiais consultados (docs.claude.com / platform.claude.com, out/2026)

Família de modelos vigente (cutoff de conhecimento Jun/2026, verificado na página oficial
"Models overview"):

| Modelo | Uso recomendado | Preço (in/out por MTok) | Linha (`line`) |
|--------|-----------------|--------------------------|----------------|
| Claude Opus 5.5 | Coding agêntico e trabalho de conhecimento de longa duração; recomendado como padrão geral | $4 / $20 | `opus` |
| Claude Fable 5.1 | Raciocínio exigente e agêntico de longo horizonte | $10 / $50 | `fable` |
| Claude Sonnet 5.5 | Melhor equilíbrio velocidade/inteligência | $2 / $10 | `sonnet` |
| Claude Haiku 5.5 | Alto volume e baixa latência (classificação, extração, roteamento) | a partir de $0.10 / $0.50 | `haiku` |

> Os preços e nomes de exibição acima foram reescritos/resumidos da documentação oficial
> para fins de registro. Conteúdo adaptado para conformidade de licenciamento.
> Fonte: [Models overview — Claude Platform Docs](https://platform.claude.com/docs/en/docs/about-claude/models/overview).

## Decisões

1. **Nenhuma string de modelo fixa no código.** O modelo vem de `ANTHROPIC_MODEL` (env var,
   só no servidor/Edge Function). Não espalhar literais de modelo.

2. **Modelo padrão do produto: Claude Sonnet 5.5** (melhor custo/qualidade para geração de
   dieta e treino em volume). Análises mais complexas (ex.: leitura de evolução entre
   avaliações) podem usar Opus 5.5 via override de env por função, se necessário. Haiku 5.5
   fica reservado para tarefas baratas de classificação/resumo.

3. **Resolução do ID exato de modelo.** Como os snapshots datados mudam, o ID concreto
   (`claude-sonnet-...`) deve ser confirmado em runtime/deploy via Models API
   (`GET https://api.anthropic.com/v1/models`, cabeçalho `x-api-key` + `anthropic-version`)
   e fixado em `ANTHROPIC_MODEL`. Documentar isso no README e no `.env.example`.
   Fonte: [List Models — Claude API Reference](https://platform.claude.com/docs/en/api/models-list).

4. **Saída estruturada validada com Zod.** Preferir o recurso de Structured Outputs da
   Anthropic (header beta `structured-outputs-2025-11-13`) OU o padrão tool-use (tool com
   `input_schema` JSON que força o formato). Em ambos os casos, **validar sempre com Zod no
   servidor** antes de gravar no banco. Retry limitado (ex.: 2 tentativas) e fallback amigável.
   Fonte: [Structured outputs — Claude Platform Docs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs).

5. **Segurança da camada de IA (não-negociável):**
   - `ANTHROPIC_API_KEY` apenas em secrets da Edge Function; nunca em `NEXT_PUBLIC_*`.
   - Edge Function valida o JWT do Supabase e o papel (professor/aluno) antes de chamar a IA.
   - Rate limit por usuário + teto de tokens + timeout real por requisição.
   - Tabela de log de uso (`ai_usage_logs`): usuário, função, modelo, tokens in/out, custo
     estimado, status, timestamp.
   - Prompts de sistema versionados em arquivos próprios; dados do aluno entram como **dados**
     (blocos delimitados / mensagem de `user` separada), nunca interpolados como instruções.

6. **Rascunho → aprovação obrigatório.** Dieta e treino gerados por IA nascem como rascunho
   (`status = draft`/`pending_review`). O professor revisa e aprova antes de o aluno ver.
   Incluir aviso de que não substitui nutricionista/médico; tratar restrições, alergias e
   condições de saúde com cautela.

7. **Usos de IA previstos:** geração de dieta, sugestão de treino a partir da avaliação,
   análise de evolução entre avaliações e resumo semanal de aderência. Implementar os que
   fizerem sentido, todos sob o mesmo guard-rail (Edge Function + Zod + log + rate limit).

## Consequências

- Remover `@google/genai` e `@google/generative-ai` do projeto.
- Criar um cliente Anthropic server-side único (nas Edge Functions) e um wrapper com retry,
  timeout, validação Zod e logging.
- O front nunca fala com a Anthropic diretamente — sempre via Edge Function autenticada.
