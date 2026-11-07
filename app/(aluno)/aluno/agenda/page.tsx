import { getSessionUser } from '@/lib/auth';
import { carregarAgenda, type ResultadoAgenda } from '@/lib/agenda/dados';
import { dataDeParametro, visaoDeParametro } from '@/lib/agenda/query';
import { ErrorState, PageHeader } from '@/components/patterns';
import { AgendaView } from '@/components/agenda/agenda-view';
import { ErroAgenda } from '@/components/agenda/erro-agenda';

/**
 * Agenda do aluno (vinculado ou autônomo): compromissos pessoais + treino,
 * refeições e água projetados das rotinas já existentes. Leitura via RSC sob
 * RLS; o gate de papel é do layout (`requireSelfOrStudent`).
 */
export default async function AlunoAgendaPage({
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

  const sp = await searchParams;
  const visao = visaoDeParametro(sp.visao);
  const data = dataDeParametro(sp.data);

  let resultado: ResultadoAgenda;
  try {
    resultado = await carregarAgenda(usuario, visao, data);
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
        basePath="/aluno/agenda"
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
        alunos={[]}
        fusoHref="/aluno/perfil"
      />
    </section>
  );
}
