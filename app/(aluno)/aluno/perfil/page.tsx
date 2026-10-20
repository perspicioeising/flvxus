import { getSessionUser } from '@/lib/auth';
import { formatarData } from '@/lib/datas';
import { createClient } from '@/lib/supabase/server';
import { ErrorState } from '@/components/patterns';
import { PerfilForm } from '@/components/aluno/perfil/perfil-form';
import {
  LgpdControles,
  type ConsentimentoAtual,
  type SolicitacaoResumo,
} from '@/components/aluno/perfil/lgpd-controles';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { ConsentType } from '@/types/database.types';

/**
 * Perfil do aluno + LGPD (FEAT-004). Leitura via RSC sob RLS: o aluno vê
 * apenas o próprio `profiles`, seus `consent_records` e `data_requests` (as
 * policies garantem o isolamento — não refiltramos posse). O gate de papel é
 * do layout da área.
 *
 * Mostra: (a) formulário de dados pessoais (`atualizarPerfil`), (b) controles
 * LGPD — consentimentos e solicitações de export/exclusão — e (c) logout.
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

  const [
    { data: perfil, error: erroPerfil },
    { data: consentimentos, error: erroConsentimentos },
    { data: solicitacoes, error: erroSolicitacoes },
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('full_name, email, phone, birth_date, gender, height_cm')
      .eq('user_id', aluno.userId)
      .single(),
    supabase
      .from('consent_records')
      .select('consent_type, granted, created_at')
      .eq('user_id', aluno.userId)
      .order('created_at', { ascending: false }),
    supabase
      .from('data_requests')
      .select('id, request_type, status, requested_at')
      .eq('user_id', aluno.userId)
      .order('requested_at', { ascending: false })
      .limit(10),
  ]);

  if (erroPerfil || !perfil || erroConsentimentos || erroSolicitacoes) {
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

  // Último consentimento por tipo (a consulta já vem do mais recente ao mais antigo).
  const consentimentoAtual: ConsentimentoAtual[] = [];
  const vistos = new Set<ConsentType>();
  for (const registro of consentimentos ?? []) {
    if (!vistos.has(registro.consent_type)) {
      vistos.add(registro.consent_type);
      consentimentoAtual.push({
        consent_type: registro.consent_type,
        granted: registro.granted,
      });
    }
  }

  const solicitacoesResumo: SolicitacaoResumo[] = (solicitacoes ?? []).map((s) => ({
    id: s.id,
    request_type: s.request_type,
    status: s.status,
    requestedAtLabel: formatarData(s.requested_at),
  }));

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

      <LgpdControles
        consentimentos={consentimentoAtual}
        solicitacoes={solicitacoesResumo}
      />
    </section>
  );
}

/** Cabeçalho da tela de perfil (reusado nos caminhos de erro). */
function PageHeader() {
  return (
    <header className="space-y-1">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Perfil</h1>
      <p className="text-sm text-muted-foreground">
        Seus dados, consentimentos e privacidade. Atualize o que precisar.
      </p>
    </header>
  );
}
