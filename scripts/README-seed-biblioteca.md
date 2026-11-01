# Gerador do seed da biblioteca global (pt-BR)

Gera a **biblioteca global** de exercícios do Flvxus (`public.exercises` com
`tenant_id = NULL`), **toda em português**, a partir do catálogo
`public.exercise_gif_catalog` (~1323 exercícios únicos). Para cada exercício, a
Anthropic produz, em pt-BR, `instructions` (texto corrido), `tips` (3–5) e
`common_errors` (2–4), com base no **movimento real** descrito nos passos do
catálogo. A saída é um arquivo **SQL de seed idempotente** que você aplica no
Supabase.

> Você roda este script **localmente, com a sua própria chave da Anthropic**. O
> custo da IA é seu.

Script: [`gerar-seed-biblioteca-ptbr.mjs`](./gerar-seed-biblioteca-ptbr.mjs)
Funções puras (de-para, SQL, parser): [`lib/biblioteca-mapeamento.mjs`](./lib/biblioteca-mapeamento.mjs)

## Pré-requisitos

- Node 18+ (usa `fetch` nativo).
- `npm install` já rodado na raiz do projeto (usa `@supabase/supabase-js`).

## Variáveis de ambiente

Lidas do ambiente **ou** do `.env.local` da raiz (gitignored — as chaves nunca
são commitadas nem escritas no SQL).

| Variável | Para quê | Obrigatória |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | chave da Anthropic | sim (exceto em `--dry-run`) |
| `ANTHROPIC_MODEL` | ID exato do modelo (ex.: `claude-sonnet-5-5`) | sim (exceto em `--dry-run`) |
| `NEXT_PUBLIC_SUPABASE_URL` (ou `SUPABASE_URL`) | URL do projeto, só se ler do banco | se `--fonte=banco` |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role, só se ler do banco | se `--fonte=banco` |

São as **mesmas variáveis** que o app/Edge Functions já usam.

## Fonte dos dados

- **(a) Supabase (preferível):** lê a tabela `exercise_gif_catalog` direto do
  banco. Exige `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`.
- **(b) Arquivos locais (fallback):** parseia `supabase/catalogo/*.sql`.

Por padrão (`--fonte=auto`) usa o banco se as duas variáveis do Supabase
existirem; caso contrário, cai para os arquivos. Em ambos os casos os registros
são deduplicados por `exercise_id`.

## Como rodar

```bash
# Geração completa (IA real) — lê a fonte automaticamente:
node scripts/gerar-seed-biblioteca-ptbr.mjs

# Forçar a fonte dos arquivos .sql:
node scripts/gerar-seed-biblioteca-ptbr.mjs --fonte=arquivos

# Teste pequeno (só 5 exercícios):
node scripts/gerar-seed-biblioteca-ptbr.mjs --limit 5

# Dry-run: NÃO chama a Anthropic (usa um stub); valida o pipeline sem chave/custo:
node scripts/gerar-seed-biblioteca-ptbr.mjs --dry-run --fonte=arquivos --limit 3
```

### Flags

| Flag | Efeito |
| --- | --- |
| `--limit N` | processa só os N primeiros (teste) |
| `--fonte=banco` / `--fonte=arquivos` | força a fonte (padrão: `auto`) |
| `--dry-run` | não chama a IA; usa stub determinístico |
| `--concorrencia N` | chamadas IA em paralelo (padrão 4) |

## Saída

| Arquivo | O quê |
| --- | --- |
| `supabase/seed-biblioteca-global-ptbr.sql` | `INSERT` idempotente (aplique no Supabase) |
| `supabase/seed-biblioteca-global-ptbr.rollback.sql` | `DELETE` seguro dos globais inseridos |
| `scripts/out/biblioteca-ptbr.jsonl` | **checkpoint** (não versionado) |

### Retomada (checkpoint)

Cada exercício concluído é gravado em `scripts/out/biblioteca-ptbr.jsonl`. Se o
processo cair (rede, 429, Ctrl+C), **rode de novo**: ele retoma de onde parou e
**não re-gasta IA** no que já foi feito. Para recomeçar do zero, apague esse
arquivo.

## Aplicar no Supabase

Depois de gerar o `.sql`, aplique-o no seu projeto (pela UI SQL do Supabase, por
`psql`, ou copiando para uma migration). O seed é **idempotente**: só insere um
global cujo `name` ainda não exista (`where not exists (… tenant_id is null …)`),
então rodar de novo não duplica. Para desfazer, rode o `.rollback.sql`.

## Custo de IA

A geração completa faz **da ordem de ~1323 chamadas** à Anthropic (uma por
exercício, `max_tokens` 1024 cada). O custo depende do modelo em
`ANTHROPIC_MODEL` e é **cobrado na sua conta**. Use `--limit` para estimar antes
de rodar tudo. O checkpoint evita pagar duas vezes pelo mesmo exercício.

## Segurança

- As chaves são **apenas lidas** do ambiente/`.env.local`; nunca são escritas no
  SQL nem logadas.
- Os dados do catálogo entram na chamada de IA como **dados** (não instruções):
  o `system` instrui o modelo a ignorar qualquer comando embutido nos textos
  (anti prompt-injection).
