# Edge Functions — versões inline (deploy pelo navegador)

Estes arquivos são versões **autocontidas** (um arquivo só) das três Edge Functions
de IA do Flvxus, feitas para você **deployar pelo dashboard do Supabase, sem CLI e
sem Docker**. São equivalentes às versões modulares em `supabase/functions/`
(fonte canônica para quem usa o CLI). Ao evoluir a IA, mantenha as duas em sincronia.

| Arquivo inline | Nome da função (deve ser EXATO) | Job |
|----------------|--------------------------------|-----|
| `generate-diet.ts` | `generate-diet` | Gera rascunho de dieta |
| `suggest-workout.ts` | `suggest-workout` | Gera rascunho de treino |
| `analyze-assessment.ts` | `analyze-assessment` | Analisa avaliação física |

## Passo a passo (tudo pelo navegador)

### 1. Configurar os secrets (uma vez)

No dashboard do seu projeto: **Edge Functions → Secrets** (ou **Project Settings →
Edge Functions → Secrets**). Adicione:

- `ANTHROPIC_API_KEY` = sua chave da Anthropic (a mesma do `.env`)
- `ANTHROPIC_MODEL` = `claude-sonnet-5-5`

> `SUPABASE_URL`, `SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY` **já são
> injetados automaticamente** pelo runtime do Supabase — você NÃO precisa adicioná-los.

### 2. Criar e publicar cada função (3x)

Para **cada** uma das três funções:

1. **Edge Functions → Create a new function** (ou "Deploy a new function").
2. Dê o **nome EXATO** da tabela acima (ex.: `generate-diet`). O nome importa: é
   por ele que o app chama a função.
3. Apague o código de exemplo e **cole todo o conteúdo** do arquivo inline
   correspondente.
4. Deixe **"Verify JWT" LIGADO** (a função também valida o papel de professor
   internamente, mas o Verify JWT é uma camada a mais).
5. **Deploy**.

Repita para `suggest-workout` e `analyze-assessment`.

### 3. Pré-requisitos no banco (já cobertos pelas migrations)

As funções leem/gravam nas tabelas `ai_generations`, `ai_usage_logs`,
`consent_records`, `profiles` e `physical_assessments`, todas criadas pelas
migrations da Fase 2. Garanta que as migrations foram aplicadas (incluindo a
`20261020120000_fix_handle_new_user_convite_aluno.sql`).

### 4. Consentimento de IA é obrigatório

Antes de gerar dieta/treino/análise para um aluno, o aluno precisa ter concedido o
consentimento `ai_processing` (tabela `consent_records`). Sem isso, a função recusa
com "O aluno não concedeu consentimento de processamento por IA." — é uma proteção
LGPD intencional.

## Como o app chama estas funções

O front (Server Action do professor) invoca a função via `supabase.functions.invoke`
passando o JWT do professor. A função valida JWT + papel, aplica rate-limit (10/h por
usuário), chama a Anthropic com saída estruturada, valida com Zod e grava um
**rascunho** em `ai_generations` — que o professor revisa e aprova antes de o aluno ver.
A ligação do botão "gerar com IA" a estas funções é feita na etapa de integração IA↔UI.

## Segurança

- A `ANTHROPIC_API_KEY` vive só nos secrets da função (servidor); nunca no cliente.
- O `service_role` é usado apenas após validar o JWT, sempre carimbando `tenant_id`.
- Os dados do aluno entram como DADOS (bloco delimitado), nunca como instruções
  (proteção contra prompt injection).
