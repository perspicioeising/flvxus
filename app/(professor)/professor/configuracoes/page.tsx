import { getSessionUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { atualizarPerfilProfessor } from '@/actions/perfil';
import { ErrorState } from '@/components/patterns';
import { PerfilProfessorForm } from '@/components/professor/perfil/perfil-professor-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

/**
 * Configurações/Perfil do professor. Leitura via RSC sob RLS: lê o próprio
 * `profiles` (nome, e-mail, telefone) e o `tenants.name` do seu tenant. O gate
 * de papel (`trainer`) é do layout da área.
 *
 * O form edita `full_name`/`phone` em `profiles` e o nome do negócio em
 * `tenants` (apenas quando o professor é owner — a policy `tenants_update`
 * garante o isolamento). O e-mail é read-only.
 */
export default async function ProfessorConfiguracoesPage() {
  const user = await getSessionUser();
  if (!user) {
    return (
      <section className="mx-auto w-full max-w-2xl space-y-6">
        <PageHeader />
        <ErrorState
          title="Sessão expirada"
          description="Entre novamente para acessar suas configurações."
        />
      </section>
    );
  }

  const supabase = await createClient();

  const [{ data: perfil, error: erroPerfil }, { data: tenant, error: erroTenant }] =
    await Promise.all([
      supabase
        .from('profiles')
        .select('full_name, email, phone')
        .eq('user_id', user.userId)
        .single(),
      supabase.from('tenants').select('name').eq('id', user.tenantId).single(),
    ]);

  if (erroPerfil || !perfil || erroTenant) {
    return (
      <section className="mx-auto w-full max-w-2xl space-y-6">
        <PageHeader />
        <ErrorState
          title="Não foi possível carregar suas configurações"
          description="Ocorreu um erro ao buscar seus dados. Atualize a página para tentar novamente."
        />
      </section>
    );
  }

  async function salvar(fd: FormData) {
    'use server';
    return atualizarPerfilProfessor(fd);
  }

  return (
    <section className="mx-auto w-full max-w-2xl space-y-6">
      <PageHeader />

      <Card>
        <CardHeader className="p-4 pb-0">
          <CardTitle className="text-base">Perfil</CardTitle>
          <CardDescription>
            {perfil.email ? `Conta: ${perfil.email}` : 'Mantenha seus dados atualizados.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <PerfilProfessorForm
            email={perfil.email ?? ''}
            valoresIniciais={{
              full_name: perfil.full_name ?? '',
              phone: perfil.phone ?? '',
              business_name: tenant?.name ?? '',
            }}
            onSubmitAction={salvar}
          />
        </CardContent>
      </Card>
    </section>
  );
}

/** Cabeçalho da tela de configurações (reusado nos caminhos de erro). */
function PageHeader() {
  return (
    <header className="space-y-1">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Configurações</h1>
      <p className="text-sm text-muted-foreground">
        Seus dados e os do seu negócio. Atualize o que precisar.
      </p>
    </header>
  );
}
