# Templates de e-mail do Supabase Auth — Flvxus

Este diretório guarda os templates de e-mail para colar no painel do Supabase e o
passo a passo de configuração. Os templates são **HTML puro** (o Supabase não executa
scripts) e usam as variáveis do Supabase Auth (`{{ .ConfirmationURL }}`, etc.).

## Arquivos

- `convite-aluno.html` — template do e-mail **"Invite user"** (convite de aluno).

---

## Convite de aluno → cair direto em `/set-password`

### Como o fluxo funciona (resumo do código)

1. O professor convida o aluno. Em `actions/alunos.ts`, o app chama
   `inviteUserByEmail(email, { redirectTo })`.

2. O Supabase envia o e-mail de convite. No template, o link do botão **monta a URL
   de verificação à mão** apontando para o `/callback` do app com `token_hash`:

   ```
   {{ .SiteURL }}/callback?token_hash={{ .TokenHash }}&type=invite&next=/set-password
   ```

3. O aluno clica → cai em **`/callback`** (route handler server-side,
   `app/(auth)/callback/route.ts`). O callback faz
   `verifyOtp({ token_hash, type: 'invite' })` → cria a sessão (cookies) e, por ser
   um convite (`type=invite`), **encaminha para `/set-password`**.

4. Em `/set-password` a sessão já existe; o aluno só define a senha e entra em `/aluno`.

> **Regra de ouro do template (IMPORTANTE):** NÃO use **`{{ .ConfirmationURL }}`** no
> botão. Na prática ele leva o aluno para a tela de **login** (Site URL raiz) em vez de
> `/set-password` — e como o aluno ainda não tem senha, ele fica preso. Monte a URL à
> mão com **`{{ .TokenHash }}`** + `type=invite` + `next=/set-password`, como acima.
> O `/callback` já sabe tratar `token_hash` (via `verifyOtp`) e sempre manda um convite
> para `/set-password`.

### Passo 1 — URL Configuration (OBRIGATÓRIO)

Painel do Supabase → **Authentication → URL Configuration**:

- **Site URL**: a URL base de produção. Ex.: `https://flvxus.vercel.app`
  (é para onde o Supabase manda quando um link não traz `redirectTo`).
- **Redirect URLs** (lista de URLs permitidas): precisa conter a URL de callback,
  casando com `${NEXT_PUBLIC_SITE_URL}/callback`. Inclua:
  - Produção: `https://flvxus.vercel.app/callback`
  - Dev local: `http://localhost:3000/callback`
  - Ou com curinga, para liberar o `?next=...`:
    `https://flvxus.vercel.app/callback*` e `http://localhost:3000/callback*`

> Se a Redirect URL **não** estiver nessa lista, o Supabase **ignora** o `redirectTo`
> do convite e manda o aluno para a Site URL raiz — o bug clássico que trava o onboarding.

### Passo 2 — Variável de ambiente

- `NEXT_PUBLIC_SITE_URL` deve estar definida **no ambiente de produção** (ex.: Vercel)
  como a URL base (ex.: `https://flvxus.vercel.app`). Em dev, o fallback é
  `http://localhost:3000` (ver `lib/site-url.ts`). O domínio **não** é hardcodado no
  código — vem só dessa variável.

### Passo 3 — Colar o template

Painel → **Authentication → Emails → Templates → "Invite user"**:

1. Assunto sugerido: `Seu convite para o Flvxus — defina sua senha`
2. Corpo: cole o conteúdo de `convite-aluno.html`.
3. Salve.

### Passo 4 — Testar de ponta a ponta

1. Com o app em produção/staging, convide um aluno de teste (um e-mail real seu).
2. Confira que o e-mail chegou com o botão **"Definir minha senha"**.
3. Clique: deve abrir `/set-password` já logado (sem pedir login).
4. Defina a senha e confirme que entra em `/aluno`.

> O envio real do e-mail depende do **provedor de SMTP** configurado no projeto e do
> domínio de produção — nada disso roda no build/CI local. A validação de ponta a ponta
> (receber o e-mail e clicar) precisa ser feita por você em produção/staging.

### Variáveis úteis neste template

| Variável | Uso |
|----------|-----|
| `{{ .TokenHash }}` | **Use no link do botão**, montando a URL de verificação (ver acima). |
| `{{ .SiteURL }}` | Base da URL do `/callback` no link do botão. |
| `{{ .Email }}` | E-mail do aluno convidado (texto). |
| `{{ .ConfirmationURL }}` | **NÃO usar** no convite de aluno — leva ao login, não ao set-password. |

> Se preferir fixar o domínio em vez de `{{ .SiteURL }}`, troque por
> `https://flvxus.vercel.app` no link do botão — o resultado é o mesmo, desde que a
> Redirect URL `https://flvxus.vercel.app/callback` (ou o curinga `/**`) esteja liberada
> no painel (e está).

### Observação sobre o callback aceitar os dois formatos

O `app/(auth)/callback/route.ts` aceita tanto o fluxo **PKCE** (`?code=...`) quanto o
**token_hash** (`verify`), e sempre encaminha um convite (`type=invite`) para
`/set-password`, mesmo que o `next` não seja propagado pelo provedor de e-mail. Ou seja,
o template funciona com `{{ .ConfirmationURL }}` independentemente do método.
