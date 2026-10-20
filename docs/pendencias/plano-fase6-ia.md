# Plano de Implementação — Fase 6 (Camada de IA Anthropic)

> Worktree isolado: `c:\Users\b.hsantos\Documents\flvxus\flvxus\.worktrees\ia` (branch `feat/v2-ia`).
> Git sempre via `git -C c:\Users\b.hsantos\Documents\flvxus\flvxus\.worktrees\ia`.
> Contrato: `docs/decisions/0001-ia-anthropic.md` (ADR 0001) + `docs/architecture.md` §8/§4.4/§6.
> Este plano NÃO contradiz o ADR 0001 nem a arquitetura. Tudo em pt-BR.

## Contexto e decisões de design (fundamentadas no código lido)

Decisões tomadas aqui (o ADR 0001 é o contrato; onde ele deixa alternativas, escolho uma):

1. **Structured Output: tool-use como caminho primário, header beta como override.** O ADR 0001
   aceita Structured Outputs (header beta `structured-outputs-2025-11-13`) OU tool-use com
   `input_schema`. Escolho **tool-use com uma única tool forçada via `tool_choice`** como padrão,
   porque é estável fora de beta e não depende de o projeto ter o beta liberado; o helper aceita
   ligar o header beta por flag quando desejado. **Em ambos os casos a saída é validada com Zod**
   no servidor antes de gravar (exigência inegociável do ADR 0001 §4). Motivo: menor risco de
   bloqueio por recurso beta indisponível no projeto hospedado do usuário.

2. **Cliente Anthropic via `fetch` nativo do Deno, não o SDK.** As Edge Functions rodam em Deno;
   um cliente fino sobre `fetch` evita dependência de bundling do `@anthropic-ai/sdk` e dá
   controle total do `AbortController` (o bug da v1 era NÃO passar o `signal` ao `fetch` — este
   plano exige passar o `signal` em todas as chamadas). A função de `fetch` é **injetável** para
   permitir testes sem a chave real.

3. **`schemas/ia/` é Zod PURO (zero API só-Deno).** Esses schemas são a fronteira de validação e
   precisam ser importáveis tanto pelo Deno (Edge Function) quanto pelo Next/Vitest. Por isso não
   importam nada de `Deno.*`, `std/`, nem `npm:`. As Edge Functions importam esses mesmos arquivos
   por caminho relativo (`../../../schemas/ia/...`) OU, se o runtime Deno exigir, via um
   re-export documentado — qualquer API só-Deno fica ISOLADA nos helpers `_shared/`, nunca em
   `schemas/ia/`. Verificado: `tsconfig.json` usa alias `@/*` → raiz; `vitest.config.ts` idem.

4. **Validação de lógica testável sem a chave.** O cliente Anthropic, o rate-limit, o parsing e o
   logging são estruturados com injeção de dependências (função de `fetch` e um "client Supabase"
   mínimo injetáveis) para que a lógica pura de parsing/validação/rate-limit seja coberta por
   Vitest com um Anthropic FAKE. O teste end-to-end real depende de `ANTHROPIC_API_KEY` + deploy
   e fica documentado como bloqueio de ambiente.

5. **`weekly_adherence` fica FORA.** O enum `ai_job_type` tem `weekly_adherence`
   (`supabase/migrations/20261020090000_extensions_e_enums.sql`), mas o resumo semanal foi adiado
   (`docs/pendencias.md` — escopo adiado). Só `generate_diet`, `suggest_workout`,
   `analyze_assessment` entram.

6. **`.env.example` já tem `ANTHROPIC_API_KEY` e `ANTHROPIC_MODEL=claude-sonnet-5-5`** (conferido).
   Só adiciono, se necessário, variáveis OPCIONAIS de guarda-corpo (teto de tokens / janela de
   rate limit / timeout) com defaults no código — sem quebrar o existente.

### Áreas intocáveis (Fase 4 em paralelo)
NÃO tocar: `app/(professor)/**`, `app/(aluno)/**`, `actions/**` (exceto criar `actions/ia.ts` NOVO
se necessário), `components/professor/**`, `components/aluno/**`, `lib/supabase/**`, `lib/auth/**`.
NÃO religar `app/_legacy-api`. O ponto de ligação com a UI é documento/função de integração em
`docs/ia.md`, não edição de telas.

### Bloqueio de ambiente conhecido
`docs/pendencias.md` registra: este ambiente (Windows) NÃO tem Docker; o Supabase CLI e o runtime
Deno das Edge Functions dependem dele. Logo, `deno check`, `supabase functions serve` e o deploy
NÃO rodam aqui. A verificação Deno será **revisão estática** + registro em `docs/pendencias.md`.
A verificação executável real é o lado Next (Vitest/tsc/lint/build) sobre `schemas/ia/` e a lógica
pura dos helpers. Se `deno` existir no PATH do ambiente de execução, rodar `deno check` nas
funções; senão, revisão estática.

---

## Arquivos a criar / editar (caminhos absolutos)

**Criar:**
- `c:\Users\b.hsantos\Documents\flvxus\flvxus\.worktrees\ia\schemas\ia\generate-diet.ts`
- `c:\Users\b.hsantos\Documents\flvxus\flvxus\.worktrees\ia\schemas\ia\suggest-workout.ts`
- `c:\Users\b.hsantos\Documents\flvxus\flvxus\.worktrees\ia\schemas\ia\analyze-assessment.ts`
- `c:\Users\b.hsantos\Documents\flvxus\flvxus\.worktrees\ia\schemas\ia\index.ts` (re-export opcional)
- `c:\Users\b.hsantos\Documents\flvxus\flvxus\.worktrees\ia\tests\unit\ia\generate-diet.schema.test.ts`
- `c:\Users\b.hsantos\Documents\flvxus\flvxus\.worktrees\ia\tests\unit\ia\suggest-workout.schema.test.ts`
- `c:\Users\b.hsantos\Documents\flvxus\flvxus\.worktrees\ia\tests\unit\ia\analyze-assessment.schema.test.ts`
- `c:\Users\b.hsantos\Documents\flvxus\flvxus\.worktrees\ia\tests\unit\ia\anthropic-parsing.test.ts`
- `c:\Users\b.hsantos\Documents\flvxus\flvxus\.worktrees\ia\tests\unit\ia\rate-limit.test.ts`
- `c:\Users\b.hsantos\Documents\flvxus\flvxus\.worktrees\ia\supabase\functions\_shared\anthropic.ts`
- `c:\Users\b.hsantos\Documents\flvxus\flvxus\.worktrees\ia\supabase\functions\_shared\auth-guard.ts`
- `c:\Users\b.hsantos\Documents\flvxus\flvxus\.worktrees\ia\supabase\functions\_shared\rate-limit.ts`
- `c:\Users\b.hsantos\Documents\flvxus\flvxus\.worktrees\ia\supabase\functions\_shared\logging.ts`
- `c:\Users\b.hsantos\Documents\flvxus\flvxus\.worktrees\ia\supabase\functions\_shared\structured-output.ts`
- `c:\Users\b.hsantos\Documents\flvxus\flvxus\.worktrees\ia\supabase\functions\_shared\errors.ts`
- `c:\Users\b.hsantos\Documents\flvxus\flvxus\.worktrees\ia\supabase\functions\_shared\cors.ts`
- `c:\Users\b.hsantos\Documents\flvxus\flvxus\.worktrees\ia\supabase\functions\_prompts\generate-diet.ts`
- `c:\Users\b.hsantos\Documents\flvxus\flvxus\.worktrees\ia\supabase\functions\_prompts\suggest-workout.ts`
- `c:\Users\b.hsantos\Documents\flvxus\flvxus\.worktrees\ia\supabase\functions\_prompts\analyze-assessment.ts`
- `c:\Users\b.hsantos\Documents\flvxus\flvxus\.worktrees\ia\supabase\functions\generate-diet\index.ts`
- `c:\Users\b.hsantos\Documents\flvxus\flvxus\.worktrees\ia\supabase\functions\suggest-workout\index.ts`
- `c:\Users\b.hsantos\Documents\flvxus\flvxus\.worktrees\ia\supabase\functions\analyze-assessment\index.ts`
- `c:\Users\b.hsantos\Documents\flvxus\flvxus\.worktrees\ia\supabase\functions\deno.json`
- `c:\Users\b.hsantos\Documents\flvxus\flvxus\.worktrees\ia\supabase\functions\import_map.json` (se necessário)
- `c:\Users\b.hsantos\Documents\flvxus\flvxus\.worktrees\ia\docs\ia.md`

**Editar:**
- `c:\Users\b.hsantos\Documents\flvxus\flvxus\.worktrees\ia\supabase\config.toml` (entradas `[functions.*]`)
- `c:\Users\b.hsantos\Documents\flvxus\flvxus\.worktrees\ia\.env.example` (só se faltar variável de guarda-corpo; os dois obrigatórios já existem)
- `c:\Users\b.hsantos\Documents\flvxus\flvxus\.worktrees\ia\docs\pendencias.md` (bloqueio de ambiente Deno/deploy)

---

## Plano ordenado (cada item deixa o repo buildável)

- [ ] 1. Criar os schemas Zod de saída da IA em `schemas/ia/` (Zod PURO, sem API só-Deno),
      espelhando o `input_schema` das tools de cada função. `generate-diet.ts`: refeições
      (nome, horário, ordem) → alimentos (nome, quantidade, unidade, kcal, macros) + totais de
      macros + lista de compras + campo de aviso (não substitui nutricionista/médico).
      `suggest-workout.ts`: divisão por dia (weekday) → exercícios (nome, séries, reps, descanso,
      observações) + aviso. `analyze-assessment.ts`: análise textual + recomendações estruturadas
      + aviso. `index.ts` re-exporta os três. Campos alinhados a `docs/architecture.md` §6.2
      (colunas de `diets`/`diet_meals`/`diet_meal_foods`, `workout_plan_items`,
      `physical_assessments.ai_analysis/ai_recommendations`).
      Arquivos: `schemas/ia/generate-diet.ts`, `schemas/ia/suggest-workout.ts`,
      `schemas/ia/analyze-assessment.ts`, `schemas/ia/index.ts`.
      Verificar: `npm run typecheck` passa.

- [ ] 2. Escrever testes Vitest dos schemas: cada schema validado contra exemplos BONS (passam) e
      RUINS (falham — ex.: macro negativo, campo faltando, tipo errado), garantindo que saída
      inválida nunca seria gravada (ADR 0001 §4, architecture §12). Seguir o padrão de
      `tests/unit/smoke.test.ts` e o alias `@/` do `vitest.config.ts`.
      Arquivos: `tests/unit/ia/generate-diet.schema.test.ts`,
      `tests/unit/ia/suggest-workout.schema.test.ts`,
      `tests/unit/ia/analyze-assessment.schema.test.ts`.
      Verificar: `npm run test` — os novos testes passam e os existentes continuam verdes.

- [ ] 3. Criar os helpers `_shared/` (Deno) desenhados para teste. `anthropic.ts`: cliente fino
      sobre `fetch` (injetável) que lê `ANTHROPIC_API_KEY`/`ANTHROPIC_MODEL` do ambiente, chama a
      Messages API com tool-use forçada (`tool_choice`), SEMPRE passa o `signal` do
      `AbortController` ao `fetch` (corrige o bug da v1), NUNCA loga a chave, com retry limitado
      (2 tentativas) e fallback amigável. `structured-output.ts`: monta a tool a partir de um
      JSON Schema e faz parsing seguro + validação Zod da saída. `errors.ts` e `cors.ts`:
      utilitários de resposta. Separar lógica PURA (parsing/validação, cálculo de janela de rate
      limit) de efeitos (fetch/DB) para testabilidade.
      Arquivos: `supabase/functions/_shared/anthropic.ts`,
      `supabase/functions/_shared/structured-output.ts`,
      `supabase/functions/_shared/errors.ts`, `supabase/functions/_shared/cors.ts`.
      Verificar: `deno check supabase/functions/_shared/*.ts` SE o `deno` existir no PATH; senão,
      revisão estática e registro em `docs/pendencias.md`.

- [ ] 4. Criar `_shared/auth-guard.ts`: valida o JWT do header `Authorization` (via client
      Supabase com o anon key + token do chamador), 401 se não autenticado; resolve papel/tenant
      consultando `profiles` com `service_role` SOMENTE APÓS validar o JWT (architecture §4.4),
      403 se o papel não for `trainer`. Retorna `{ userId, tenantId, role }` carimbável nos logs.
      Arquivos: `supabase/functions/_shared/auth-guard.ts`.
      Verificar: `deno check` se disponível; senão revisão estática.

- [ ] 5. Criar `_shared/rate-limit.ts` e `_shared/logging.ts`. `rate-limit.ts`: conta chamadas do
      usuário em `ai_usage_logs` dentro de uma janela (lógica de janela PURA e testável), aplica
      teto de tokens e timeout real (expõe o `AbortController`/`signal` consumido pelo cliente).
      `logging.ts`: grava `ai_usage_logs` (`tenant_id`, `user_id`, `job_type`, `model`,
      `input_tokens`, `output_tokens`, `estimated_cost_usd`, `status`, `latency_ms`) após SUCESSO
      OU FALHA, usando os tipos de `types/database.types.ts` como referência das colunas.
      Arquivos: `supabase/functions/_shared/rate-limit.ts`,
      `supabase/functions/_shared/logging.ts`.
      Verificar: `deno check` se disponível; senão revisão estática.

- [ ] 6. Testes Vitest da lógica PURA dos helpers com Anthropic FAKE/mock: parsing+validação Zod
      (saída boa → objeto validado; saída malformada → erro, nunca grava) e cálculo de janela de
      rate-limit. Importar só a lógica pura (sem `Deno.*`); se um helper misturar Deno e lógica,
      extrair a parte pura para um módulo compartilhável testável. Documentar em
      `docs/pendencias.md` que o teste end-to-end real depende de `ANTHROPIC_API_KEY`+deploy.
      Arquivos: `tests/unit/ia/anthropic-parsing.test.ts`, `tests/unit/ia/rate-limit.test.ts`.
      Verificar: `npm run test` — novos testes passam; suíte inteira verde.

- [ ] 7. Criar os prompts de SISTEMA versionados (pt-BR, anti-injection) em `_prompts/`. Um por
      função; instruções SÓ no system prompt; os dados do aluno NUNCA entram nas instruções —
      entram como blocos de dados delimitados na mensagem `user`. Cada prompt instrui o modelo a
      incluir no conteúdo gerado o aviso de que dieta/treino são RASCUNHO, não substituem
      nutricionista/médico, e que restrições/alergias/condições de saúde exigem cautela (ADR 0001
      §5/§6).
      Arquivos: `supabase/functions/_prompts/generate-diet.ts`,
      `supabase/functions/_prompts/suggest-workout.ts`,
      `supabase/functions/_prompts/analyze-assessment.ts`.
      Verificar: `deno check` se disponível; senão revisão estática do fluxo instruções×dados.

- [ ] 8. Criar as três Edge Functions (`index.ts` Deno, uma pasta por função). Cada uma, na ordem:
      (a) auth-guard (JWT+papel trainer; 401/403); (b) valida o corpo de entrada com Zod;
      (c) rate-limit + teto de tokens + timeout; (d) grava `ai_generations` com `status='pending'`;
      (e) chama a Anthropic com saída estruturada (prompt do sistema + dados do aluno como dados);
      (f) valida a saída com o schema de `schemas/ia/`; (g) grava `ai_usage_logs` (sucesso OU
      falha) e atualiza `ai_generations` (`status='succeeded'` com `output` jsonb validado, ou
      `'failed'`); (h) retorna o rascunho. NÃO materializa em `diets`/`workout_plans` — é rascunho
      para o professor aprovar (ADR 0001 §6). `generate-diet` → `job_type=generate_diet`;
      `suggest-workout` → `suggest_workout`; `analyze-assessment` → `analyze_assessment`.
      Arquivos: `supabase/functions/generate-diet/index.ts`,
      `supabase/functions/suggest-workout/index.ts`,
      `supabase/functions/analyze-assessment/index.ts`.
      Verificar: `deno check supabase/functions/**/index.ts` se disponível; senão revisão estática
      conferindo a ordem dos guarda-corpos acima em cada função.

- [ ] 9. Config Deno e registro das funções. `supabase/functions/deno.json` (compilerOptions/
      imports; `import_map.json` se necessário para o alias de `schemas/ia`). Adicionar entradas
      `[functions.generate-diet]`, `[functions.suggest-workout]`, `[functions.analyze-assessment]`
      em `supabase/config.toml` (ex.: `verify_jwt = true`). Conferir `.env.example`: os dois
      obrigatórios já existem (`ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL=claude-sonnet-5-5`); adicionar
      APENAS variáveis opcionais de guarda-corpo se o código precisar, sem quebrar o arquivo.
      Arquivos: `supabase/functions/deno.json`, `supabase/functions/import_map.json` (se preciso),
      `supabase/config.toml`, `.env.example` (se preciso).
      Verificar: `npm run build` continua verde (garante que nada de Deno vazou para o bundle Next).

- [ ] 10. Escrever `docs/ia.md`: contrato entrada/saída de cada Edge Function e quem pode chamar
      (só professor); fluxo rascunho→aprovação; rate limit/teto de tokens/timeout; log de uso;
      prompts versionados e anti-injection; COMO fazer deploy (`supabase functions deploy <nome>`,
      `supabase secrets set ANTHROPIC_API_KEY=...`, resolver o ID de snapshot via Models API
      `GET /v1/models` e fixar em `ANTHROPIC_MODEL`); e o PONTO DE INTEGRAÇÃO com a UI — como a
      Fase 4/5 chama as funções a partir de uma Server Action passando o JWT do usuário (sem
      editar as telas do professor nesta fase).
      Arquivos: `docs/ia.md`.
      Verificar: leitura/revisão de que cobre todos os itens do escopo.

- [ ] 11. Atualizar `docs/pendencias.md` com o bloqueio de ambiente da Fase 6: `deno check`,
      `supabase functions serve` e o deploy dependem de Docker/Deno/projeto Supabase (ausentes
      aqui); o teste end-to-end real depende de `ANTHROPIC_API_KEY` + deploy. Registrar o que foi
      verificado estaticamente e os comandos a rodar quando o ambiente existir.
      Arquivos: `docs/pendencias.md`.
      Verificar: `npm run typecheck && npm run lint && npm run build && npm run test` — todos verdes
      (lado Next intacto; testes existentes verdes).

## Ordem de commits (pequenos, lógicos, em pt-BR)

1. `feat(ia): schemas Zod de saída da IA em schemas/ia` (itens 1–2)
2. `feat(ia): cliente Anthropic e helpers de saída estruturada` (item 3)
3. `feat(ia): auth-guard, rate-limit e logging das Edge Functions` (itens 4–5)
4. `test(ia): testes de parsing/validação e rate-limit com Anthropic fake` (item 6)
5. `feat(ia): prompts de sistema versionados anti-injection` (item 7)
6. `feat(ia): Edge Functions generate-diet, suggest-workout e analyze-assessment` (item 8)
7. `chore(ia): config Deno e registro das funções no config.toml` (item 9)
8. `docs(ia): documentação da camada de IA e pendências de ambiente` (itens 10–11)

Commitar localmente na branch `feat/v2-ia`; NUNCA fazer push.

## Verificações finais (lado Next, obrigatórias e executáveis aqui)

- `npm run typecheck` — verde.
- `npm run lint` — verde.
- `npm run build` — verde (prova que nada só-Deno entrou no bundle do Next).
- `npm run test` — novos testes de `schemas/ia/` e da lógica pura passam; testes existentes verdes.
- Deno: `deno check` nas funções SE `deno` existir; senão revisão estática + registro em
  `docs/pendencias.md` (bloqueio de ambiente).
