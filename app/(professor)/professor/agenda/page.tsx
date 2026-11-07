import { redirect } from 'next/navigation';
import { getSessionUser, isSelfManaged } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { carregarAgenda, type ResultadoAgenda } from '@/lib/agenda/dados';
import { dataDeParametro, visaoDeParametro } from '@/lib/agenda/query';
import { ErrorState, PageHeader } from '@/components/patterns';
import { AgendaView } from '@/components/agenda/agenda-view';
import { ErroAgenda } from '@/components/agenda/erro-agenda';

/**
 * Agenda do professor (personal profissional). O autônomo (self_managed) usa a
 * agenda do aluno (`/aluno/agenda`). Leitura via RSC sob RLS: o professor vê só
 * compromissos (sem derivados de treino/dieta/água, que são do aluno).
 */
export default async function ProfessorAgendaPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const usuario = await getSessionUser();
  if (!usuario) {
    return (
      <section className="mx-auto w-full max-w-4xl space-y-6">
        <PageHeader title="Agenda" />
        <ErrorState title="Sessão expirada" description="Entre novamente para acessar a agenda." />
      </section>
    );
  }
  if (isSelfManaged(usuario)) {
    redirect('/aluno/agenda');
  }

  const sp = await searchParams;
  const visao = visaoDeParametro(sp.visao);
  const data = dataDeParametro(sp.data);

  let resultado: ResultadoAgenda;
  let alunos: { id: string; nome: string }[] = [];
  try {
    resultado = await carregarAgenda(usuario, visao, data);
    // Alunos ativos para o seletor do formulário (a RLS já filtra o que o professor enxerga).
    const supabase = await createClient();
    const { data: lista } = await supabase
      .from('profiles')
      .select('user_id, full_name')
      .eq('role', 'student')
      .eq('status', 'active')
      .order('full_name', { ascending: true });
    alunos = (lista ?? []).map((a) => ({ id: a.user_id, nome: a.full_name ?? 'Aluno sem nome' }));
  } catch {
    return (
      <section className="mx-auto w-full max-w-4xl space-y-6">
        <PageHeader title="Agenda" />
        <ErroAgenda />
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-5xl">
      <AgendaView
        basePath="/professor/agenda"
        visao={visao}
        dia={data ?? resultado.hoje}
        diaInicio={resultado.janela.diaInicio}
        diaFim={resultado.janela.diaFim}
        hoje={resultado.hoje}
        tz={resultado.tz}
        agoraIso={new Date().toISOString()}
        perfil={resultado.perfil}
        eventos={resultado.eventos}
        fichasSemDia={resultado.fichasSemDia}
        alunos={alunos}
        fusoHref="/professor/configuracoes"
      />
    </section>
  );
}
