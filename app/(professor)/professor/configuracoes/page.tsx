import { getSessionUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { atualizarPerfilProfessor } from '@/actions/perfil';
import { canAddAffiliate } from '@/lib/billing/entitlement';
import { ErrorState } from '@/components/patterns';
import { PerfilProfessorForm } from '@/components/professor/perfil/perfil-professor-form';
import { VisibilidadeSection } from '@/components/professor/configuracoes/visibilidade-section';
import {
  FiliadosSection,
  type FiliadoItem,
} from '@/components/professor/configuracoes/filiados-section';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { VisibilityModule } from '@/types/database.types';

/**
 * Configurações do professor. O card Perfil é visível a qualquer trainer. As
 * seções Visibilidade e Filiados são renderizadas SÓ para o MASTER (Fase 3):
 * o gate server-side é `user.isMaster` (lido de `profiles.is_tenant_master`
 * via getSessionUser). O módulo Financeiro/Billing nunca aparece ao filiado.
 *
 * Leitura via RSC sob RLS: a config de visibilidade e as assinaturas só são
 * legíveis pelo master (policies tmv_select/subscriptions_select), então
 * buscá-las aqui é seguro — para o filiado a query volta vazia e as seções
 * simplesmente não renderizam.
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

  // --- Dados master-only (visibilidade + filiados + limite do plano) ---------
  let visibilidade: Record<VisibilityModule, boolean> | null = null;
  let filiados: FiliadoItem[] = [];
  let usados = 0;
  let limite: number | null = null;
  let podeConvidar = false;
  let motivoBloqueio: string | undefined;

  if (user.isMaster) {
    const [{ data: vis }, { data: trainers }, { data: sub }] = await Promise.all([
      supabase.from('tenant_module_visibility').select('module, is_open'),
      supabase
        .from('profiles')
        .select('user_id, full_name, email, deactivated_at')
        .eq('role', 'trainer')
        .eq('is_tenant_master', false),
      supabase
        .from('subscriptions')
        .select('status, plan_id, plans(max_affiliates)')
        .eq('tenant_id', user.tenantId)
        .maybeSingle(),
    ]);

    // Visibilidade: default LIBERADO para módulos ausentes.
    const MODULOS: VisibilityModule[] = ['students', 'workouts', 'assessments', 'diets', 'exercises'];
    const mapa = new Map((vis ?? []).map((v) => [v.module, v.is_open]));
    visibilidade = Object.fromEntries(
      MODULOS.map((m) => [m, mapa.get(m) ?? true])
    ) as Record<VisibilityModule, boolean>;

    filiados = (trainers ?? []).map((t) => ({
      userId: t.user_id,
      fullName: t.full_name,
      email: t.email,
      ativo: t.deactivated_at === null,
    }));

    usados = filiados.filter((f) => f.ativo).length;

    const plano = (sub?.plans ?? null) as { max_affiliates: number | null } | null;
    limite = plano?.max_affiliates ?? null;

    podeConvidar = canAddAffiliate({
      status: sub?.status ?? null,
      maxAffiliates: plano?.max_affiliates,
      usedActive: usados,
      hasResolvedPlan: Boolean(sub?.plan_id),
    });

    if (!podeConvidar) {
      motivoBloqueio = !sub?.status
        ? 'Você ainda não tem um plano ativo. Assine na tela de Plano para adicionar filiados.'
        : 'Seu plano atingiu o limite de filiados. Faça upgrade na tela de Plano.';
    }
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

      {user.isMaster && visibilidade ? (
        <>
          <VisibilidadeSection valores={visibilidade} />
          <FiliadosSection
            filiados={filiados}
            usados={usados}
            limite={limite}
            podeConvidar={podeConvidar}
            motivoBloqueio={motivoBloqueio}
          />
        </>
      ) : null}
    </section>
  );
}

/** Cabeçalho da tela de configurações (reusado nos caminhos de erro). */
function PageHeader() {
  return (
    <header className="space-y-1">
      <h1 className="text-4xl font-black uppercase leading-[0.95] tracking-tight text-foreground md:text-5xl">Configurações</h1>
      <p className="text-sm text-muted-foreground">
        Seus dados e os do seu negócio. Atualize o que precisar.
      </p>
    </header>
  );
}
