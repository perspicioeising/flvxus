-- =============================================================================
-- Fix: handle_new_user() não deve criar tenant+trainer quando o novo usuário é
-- um ALUNO convidado pelo professor.
-- =============================================================================
-- Problema: o trigger on_auth_user_created dispara em TODO insert em auth.users,
-- inclusive no convite de aluno (admin.inviteUserByEmail). Assim, o aluno nascia
-- como 'trainer' com um tenant próprio, colidindo com o profile 'student' que a
-- action tenta inserir e ficando invisível para o professor (tenant divergente).
--
-- Correção: o convite de aluno passa `role: 'student'` em raw_user_meta_data. O
-- trigger agora SÓ cria tenant + profile trainer quando NÃO for um aluno. Para
-- alunos, não faz nada — a Server Action `convidarAluno` cria o profile 'student'
-- com o tenant/trainer corretos do professor.
--
-- Também torna o trigger idempotente: se o profile já existir (corrida/retry),
-- não falha.
-- -----------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_tenant_id uuid;
  v_full_name text;
  v_role text;
begin
  v_role := new.raw_user_meta_data ->> 'role';

  -- Aluno convidado pelo professor: NÃO cria tenant nem profile aqui.
  -- A action `convidarAluno` cria o profile 'student' com o tenant do professor.
  if v_role = 'student' then
    return new;
  end if;

  -- Se já existe profile para este usuário (retry/corrida), não duplica.
  if exists (select 1 from public.profiles p where p.user_id = new.id) then
    return new;
  end if;

  v_full_name := coalesce(new.raw_user_meta_data ->> 'full_name', new.email);

  -- Cadastro público de PROFESSOR: cria o tenant (owner) e o profile trainer.
  insert into public.tenants (owner_id, name)
  values (new.id, coalesce(v_full_name, 'Meu negócio'))
  returning id into v_tenant_id;

  insert into public.profiles (user_id, tenant_id, role, trainer_id, full_name, email)
  values (new.id, v_tenant_id, 'trainer', null, v_full_name, new.email);

  return new;
end;
$$;
