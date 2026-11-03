# Storage — bucket de avatares (`avatars`)

A foto de perfil (avatar) usa um bucket **PÚBLICO** dedicado `avatars`, com path
`{user_id}.<ext>` e escrita restrita ao dono. O código faz o upload (via Server
Action, sob RLS) e grava a **public URL** em `profiles.avatar_url`; o bucket e as
policies de `storage.objects` são criados **à mão no painel do Supabase**.

O passo a passo completo (criar bucket público, limite de 2 MB, allowlist
`image/jpeg,image/png,image/webp`, policies de leitura pública + escrita do dono,
e rollback) está em:

- `.agents/tasks/foto-perfil-avatar/storage-setup.md`

Resumo das decisões:

- Bucket `avatars`, **público** (ranking cross-tenant exibe `avatar_url` cru — URL
  assinada expiraria).
- Escrita só do dono: `bucket_id='avatars' AND name LIKE auth.uid()::text || '.%'`.
- SVG bloqueado (fora da allowlist de MIME + validação de magic bytes no servidor).
- **Nenhuma migration de schema**: `profiles.avatar_url` já existe.
