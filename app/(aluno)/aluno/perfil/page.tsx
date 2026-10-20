import { getSessionUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { ErrorState } from '@/components/patterns';
import { PerfilForm } from '@/components/aluno/perfil/perfil-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

/**
 * Perfil do aluno. Leitura via RSC sob RLS: o aluno vê apenas o próprio
 * `profiles` (a policy garante o isolamento — não refiltramos posse). O gate
 * de papel é do layout da área.
 *
 * Mostra apenas o formulário de dados pessoais (`atualizarPerfil`). O logout
 * vive no AppShell (sidebar/bottom-nav) do layout do aluno.
 *
 * LGPD adiado por decisão de escopo (FEAT-003): o perfil não pede mais
 * consentimentos nem solicitações de export/exclusão. Para reativar, ver
 * docs/pendencias.md.
 */
export default async function AlunoPerfilPage() {
  const aluno = await getSessionUser();
  if (!aluno) {
    return (
      <section className="mx-auto w-full max-w-2xl space-y-6">
        <PageHeader />
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
        <PageHeader />
        <ErrorState
          title="Não foi possível carregar seu perfil"
          description="Ocorreu um erro ao buscar seus dados. Atualize a página para tentar novamente."
        />
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-2xl space-y-6">
      <PageHeader />

      <Card>
        <CardHeader className="p-4 pb-0">
          <CardTitle className="text-base">Dados pessoais</CardTitle>
          <CardDescription>
            {perfil.email ? `Conta: ${perfil.email}` : 'Mantenha seus dados atualizados.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <PerfilForm
            valoresIniciais={{
              full_name: perfil.full_name ?? '',
              phone: perfil.phone ?? '',
              birth_date: perfil.birth_date ?? '',
              gender: perfil.gender ?? '',
              height_cm: perfil.height_cm !== null ? String(perfil.height_cm) : '',
            }}
          />
        </CardContent>
      </Card>
    </section>
  );
}

/** Cabeçalho da tela de perfil (reusado nos caminhos de erro). */
function PageHeader() {
  return (
    <header className="space-y-1">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Perfil</h1>
      <p className="text-sm text-muted-foreground">
        Seus dados pessoais. Atualize o que precisar.
      </p>
    </header>
  );
}
