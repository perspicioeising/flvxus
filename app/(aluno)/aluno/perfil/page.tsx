import { getSessionUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { ErrorState, PageHeader } from '@/components/patterns';
import { PerfilForm } from '@/components/aluno/perfil/perfil-form';

/** Iniciais do nome para o avatar. */
function iniciais(nome: string | null | undefined): string {
  const partes = (nome ?? '').trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '–';
  if (partes.length === 1) return partes[0][0]?.toUpperCase() ?? '–';
  return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase();
}

/**
 * Perfil do aluno. Leitura via RSC sob RLS: o aluno vê apenas o próprio
 * `profiles` (a policy garante o isolamento). O gate de papel é do layout.
 *
 * Mostra o formulário de dados pessoais (`atualizarPerfil`). O logout vive no
 * AppShell (sidebar/bottom-nav) do layout do aluno.
 */
export default async function AlunoPerfilPage() {
  const aluno = await getSessionUser();
  if (!aluno) {
    return (
      <section className="mx-auto w-full max-w-2xl space-y-6">
        <PageHeader emphasis="caps" title="Perfil" />
        <ErrorState
          title="Sessão expirada"
          description="Entre novamente para acessar seu perfil."
        />
      </section>
    );
  }

  const supabase = await createClient();

  const { data: perfil, error: erroPerfil } = await supabase
    .from('profiles')
    .select('full_name, email, phone, birth_date, gender, height_cm')
    .eq('user_id', aluno.userId)
    .single();

  if (erroPerfil || !perfil) {
    return (
      <section className="mx-auto w-full max-w-2xl space-y-6">
        <PageHeader emphasis="caps" title="Perfil" />
        <ErrorState
          title="Não foi possível carregar seu perfil"
          description="Ocorreu um erro ao buscar seus dados. Atualize a página para tentar novamente."
        />
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-2xl space-y-6">
      <PageHeader emphasis="caps" title="Perfil" />

      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-soft text-2xl font-black text-primary-soft-foreground">
          {iniciais(perfil.full_name)}
        </span>
        <div>
          <p className="text-lg font-bold text-foreground">
            {perfil.full_name ?? 'Aluno'}
          </p>
          {perfil.email ? (
            <p className="text-sm text-muted-foreground">{perfil.email}</p>
          ) : null}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4">
        <PerfilForm
          valoresIniciais={{
            full_name: perfil.full_name ?? '',
            phone: perfil.phone ?? '',
            birth_date: perfil.birth_date ?? '',
            gender: perfil.gender ?? '',
            height_cm: perfil.height_cm !== null ? String(perfil.height_cm) : '',
          }}
        />
      </div>
    </section>
  );
}
