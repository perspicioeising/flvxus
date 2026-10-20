# Camada de IA — Edge Functions Anthropic (Fase 6)

> Governada pelo **ADR 0001** (`docs/decisions/0001-ia-anthropic.md`) e por
> `docs/architecture.md` §8/§4.4/§11. Tudo aqui é rascunho→aprovação: a IA
> **nunca** materializa dieta/treino sozinha; o professor revisa e aprova.

A IA roda **exclusivamente** em Supabase Edge Functions (Deno). O front **nunca**
fala com a Anthropic direto — só via função autenticada. A `ANTHROPIC_API_KEY`
fica **somente** nos secrets da função (jamais em `NEXT_PUBLIC_*` ou no cliente).

## Funções e quem pode chamar

As três funções só podem ser acionadas pelo **professor** (papel `trainer`). O
gateway exige JWT (`verify_jwt = true` no `config.toml`) e cada função revalida
JWT + papel no `auth-guard` (defesa em camadas).

| Função | job_type | Efeito |
|--------|----------|--------|
| `generate-diet` | `generate_diet` | rascunho de dieta em `ai_generations` |
| `suggest-workout` | `suggest_workout` | rascunho de treino em `ai_generations` |
| `analyze-assessment` | `analyze_assessment` | rascunho de análise/recomendações em `ai_generations` |

> `weekly_adherence` (resumo semanal) está **fora** desta fase (adiado — ver
> `docs/pendencias.md`).

## Contrato de entrada/saída

A entrada é validada por **Zod** na função; a saída da Anthropic é validada por
**Zod** (`schemas/ia/`) antes de qualquer gravação. Todas as respostas de
sucesso têm o formato `{ generation_id, status: "succeeded", draft }`, onde
`draft` é o objeto já validado. Erros retornam `{ error: { code, message } }`
(pt-BR, sem vazar chave/stack).

### `generate-diet`

- **Entrada:** `student_id` (uuid), `goal` (string), `restrictions` (string[],
  default `[]`), `assessment_id?` (uuid), `target_kcal?` (número positivo).
- **Saída (`schemas/ia/generate-diet`):** `meals[]` (nome, horário,
  `order_index`, `foods[]` com `food_name`/`quantity`/`unit`/`kcal`/macros),
  `totals` (macros), `shopping_list[]`, `disclaimer`.

### `suggest-workout`

- **Entrada:** `student_id` (uuid), `goal` (string), `experience_level`
  (`beginner|intermediate|advanced`), `days_per_week` (1..7), `assessment_id?`.
- **Saída (`schemas/ia/suggest-workout`):** `days[]` (`weekday` 0..6, `label?`,
  `exercises[]` com `name`/`sets`/`reps` (string)/`rest_seconds`/`notes?`),
  `disclaimer`.

### `analyze-assessment`

- **Entrada:** `assessment_id` (uuid), `previous_assessment_id?` (uuid, para
  comparação de evolução).
- **Saída (`schemas/ia/analyze-assessment`):** `analysis` (texto),
  `recommendations[]` (`category`/`text`/`priority` alta|media|baixa),
  `disclaimer`.

## Ordem dos guarda-corpos (idêntica nas três)

1. **CORS preflight** (`OPTIONS` → 204).
2. **auth-guard:** valida o JWT primeiro (401 se ausente/ inválido) e **só
   depois** resolve papel/tenant via `service_role`; 403 se não for `trainer`
   (architecture §4.4).
3. **Validação Zod da entrada** (400 em entrada inválida).
4. **Consentimento `ai_processing`** do aluno (architecture §11): sem
   consentimento concedido e vigente, a chamada é recusada — nada é enviado à
   Anthropic. Em `analyze-assessment`, o consentimento checado é o do aluno dono
   da avaliação.
5. **Rate limit + teto de tokens + timeout real:** janela padrão de 10
   chamadas/hora por usuário (contadas em `ai_usage_logs`); teto de tokens de
   saída (`max_tokens`); timeout por `AbortController` cujo `signal` é **sempre**
   passado ao `fetch` (429 quando o rate limit estoura).
6. **`ai_generations` status `pending`**, carimbando `tenant_id` do chamador.
7. **Anthropic** com o system prompt versionado + dados do aluno como **DADOS**
   (bloco delimitado na mensagem `user`, nunca como instrução — anti-injection);
   saída estruturada forçada via tool-use (`tool_choice`).
8. **Validação Zod da saída** (`parseToolOutput`); saída malformada → falha, nada
   é gravado como sucesso.
9. **`ai_usage_logs`** gravado em **sucesso OU falha** (tenant, usuário, job,
   modelo, tokens in/out, custo estimado, status, `latency_ms`) e
   **`ai_generations`** atualizado para `succeeded` (com `output` validado) ou
   `failed`.
10. **Retorno** do rascunho. **Nunca** materializa em `diets`/`workout_plans`.

## Rascunho → aprovação

A saída vive em `ai_generations` como rascunho revisável (`status` do enum
`ai_job_status`). A materialização em `diets`/`workout_plans` (ou a gravação em
`physical_assessments.ai_analysis/ai_recommendations`) é uma ação **separada**,
feita pelo professor na UI depois de revisar — não é feita por estas funções.

## Log de uso, rate limit e custo

- `ai_usage_logs` é a fonte do rate limit (janela por `created_at`) e dos
  relatórios de custo. O custo estimado deriva do preço por modelo (ADR 0001 §2):
  Sonnet $2/$10, Opus $4/$20, Haiku $0.10/$0.50 por milhão de tokens.
- O modelo vem **sempre** de `ANTHROPIC_MODEL` (sem string de modelo fixa).

## Prompts versionados e anti-injection

Os system prompts ficam em `supabase/functions/_prompts/*.ts`. As **instruções
só existem no system prompt**; os dados do aluno entram num bloco delimitado
(`<dados_do_aluno>`/`<dados_da_avaliacao>`) na mensagem `user`. Cada prompt
instrui a IA a incluir o aviso de que o conteúdo é rascunho e não substitui
nutricionista/médico, com cautela para restrições, alergias e condições de saúde.

## Deploy

Pré-requisitos: Supabase CLI e Docker (ou um projeto hospedado) — **ausentes no
ambiente de desenvolvimento atual** (ver `docs/pendencias.md`).

```bash
# 1. Definir os secrets da função (NUNCA commitar; nunca em NEXT_PUBLIC_*):
supabase secrets set ANTHROPIC_API_KEY="sk-ant-..."

# 2. Resolver o ID exato do snapshot de modelo via Models API e fixá-lo:
#    GET https://api.anthropic.com/v1/models  (x-api-key + anthropic-version)
#    escolher o snapshot Sonnet 5.5 atual e definir:
supabase secrets set ANTHROPIC_MODEL="claude-sonnet-<snapshot-datado>"

# 3. Deploy de cada função:
supabase functions deploy generate-diet
supabase functions deploy suggest-workout
supabase functions deploy analyze-assessment
```

> `SUPABASE_URL`, `SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY` são
> injetadas automaticamente no ambiente das Edge Functions pela plataforma; a
> `service_role` é usada **apenas** após o auth-guard validar JWT + papel.

## Ponto de integração com a UI (Fases 4/5)

As telas do professor **não** chamam a Anthropic nem usam a `service_role`. Elas
invocam a Edge Function a partir de uma **Server Action** (ou Route Handler),
repassando o **JWT do usuário logado** no header `Authorization`. Assim o
`verify_jwt` do gateway e o `auth-guard` da função reconhecem o professor e
resolvem o tenant. Esboço (a ser ligado às telas sem editá-las nesta fase):

```ts
// actions/ia.ts (a criar quando a UI for ligar o fluxo — NÃO editar as telas)
'use server';

import { createClient } from '@/lib/supabase/server';

async function callAiFunction(name: string, payload: unknown) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error('Sessão ausente.');

  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/${name}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error?.message ?? 'Falha na IA.');
  return body; // { generation_id, status, draft }
}

export const gerarDieta = (input: unknown) => callAiFunction('generate-diet', input);
export const sugerirTreino = (input: unknown) => callAiFunction('suggest-workout', input);
export const analisarAvaliacao = (input: unknown) => callAiFunction('analyze-assessment', input);
```

A Action devolve o `draft` para a tela exibir como **rascunho**; a aprovação
(materializar em `diets`/`workout_plans`) é uma ação separada do professor.
