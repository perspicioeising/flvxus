'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConfirmDialog, PageHeader } from '@/components/patterns';
import { alternarRefeicaoCumprida, registrarAgua } from '@/actions/habitos';
import { confirmarDescanso } from '@/actions/execucao';
import { cancelarCompromisso } from '@/actions/agenda';
import { diasDoIntervalo, somarDias, type VisaoAgenda } from '@/lib/agenda/fuso';
import type { PerfilAgenda } from '@/lib/agenda/permissoes';
import type { EventoAgenda } from '@/lib/agenda/tipos';
import type { EscopoAgenda } from '@/schemas/agenda';
import { AvisoFichasSemDia } from '@/components/agenda/aviso-fichas-sem-dia';
import { CompromissoForm, type AlunoOpcao, type EdicaoCompromisso } from '@/components/agenda/compromisso-form';
import { EscopoRecorrenciaDialog } from '@/components/agenda/escopo-recorrencia-dialog';
import { FaixaSemana } from '@/components/agenda/faixa-semana';
import { GradeMes } from '@/components/agenda/grade-mes';
import { ListaDia } from '@/components/agenda/lista-dia';
import { rotuloDia, rotuloJanela } from '@/components/agenda/formatar';

export interface AgendaViewProps {
  /** Rota-base da agenda (`/professor/agenda` ou `/aluno/agenda`). */
  basePath: string;
  visao: VisaoAgenda;
  /** Dia de referência da URL (`YYYY-MM-DD`). */
  dia: string;
  diaInicio: string;
  diaFim: string;
  hoje: string;
  tz: string;
  /** Instante atual (ISO) do servidor, para marcar o passado como leitura. */
  agoraIso: string;
  perfil: PerfilAgenda;
  eventos: EventoAgenda[];
  fichasSemDia: { id: string; name: string }[];
  alunos: AlunoOpcao[];
  /** Link para alterar o fuso (perfil do aluno ou configurações do professor). */
  fusoHref: string;
}

const VISOES: { valor: VisaoAgenda; rotulo: string }[] = [
  { valor: 'dia', rotulo: 'Dia' },
  { valor: 'semana', rotulo: 'Semana' },
  { valor: 'mes', rotulo: 'Mês' },
];

/**
 * Agenda (cliente): abas dia/semana/mês, navegação anterior/próximo/Hoje (via
 * `?visao=&data=`), criação, edição e cancelamento de compromissos (com escopo
 * para séries) e "Concluir" dos derivados chamando as actions já existentes
 * (`registrarAgua`, `alternarRefeicaoCumprida`, `confirmarDescanso`).
 */
export function AgendaView({
  basePath,
  visao,
  dia,
  diaInicio,
  diaFim,
  hoje,
  tz,
  agoraIso,
  perfil,
  eventos,
  fichasSemDia,
  alunos,
  fusoHref,
}: AgendaViewProps) {
  const router = useRouter();
  const [ocupado, iniciar] = React.useTransition();
  const [selecionado, setSelecionado] = React.useState(dia);
  React.useEffect(() => setSelecionado(dia), [dia, visao]);

  const [novoAberto, setNovoAberto] = React.useState(false);
  const [edicao, setEdicao] = React.useState<EdicaoCompromisso | null>(null);
  const [escopoDialog, setEscopoDialog] = React.useState<{
    acao: 'editar' | 'cancelar';
    evento: EventoAgenda;
  } | null>(null);
  const [confirmacao, setConfirmacao] = React.useState<{
    evento: EventoAgenda;
    escopo: EscopoAgenda;
  } | null>(null);
  const [cancelando, setCancelando] = React.useState(false);

  const dias = React.useMemo(() => diasDoIntervalo(diaInicio, diaFim), [diaInicio, diaFim]);
  const diaAtivo = dias.includes(selecionado) ? selecionado : dias.includes(hoje) ? hoje : diaInicio;

  function irPara(novaVisao: VisaoAgenda, novoDia: string) {
    router.push(`${basePath}?visao=${novaVisao}&data=${novoDia}`);
  }

  function concluir(evento: EventoAgenda) {
    const acao = evento.acao;
    if (!acao || acao.tipo === 'link') return;
    iniciar(async () => {
      const r =
        acao.tipo === 'concluir_agua'
          ? await registrarAgua(acao.ml)
          : acao.tipo === 'concluir_refeicao'
            ? await alternarRefeicaoCumprida(acao.mealId, acao.dietId)
            : await confirmarDescanso(acao.planId, acao.restStepIndex);
      if (r.ok) {
        toast({ title: r.message ?? 'Atualizado.' });
        router.refresh();
      } else {
        toast({ title: r.message ?? 'Não foi possível concluir.', variant: 'destructive' });
      }
    });
  }

  function editar(evento: EventoAgenda) {
    if (evento.meta.recorrente === true) setEscopoDialog({ acao: 'editar', evento });
    else setEdicao({ evento, escopo: 'ocorrencia' });
  }

  function cancelar(evento: EventoAgenda) {
    if (evento.meta.recorrente === true) setEscopoDialog({ acao: 'cancelar', evento });
    else setConfirmacao({ evento, escopo: 'ocorrencia' });
  }

  function aoEscolherEscopo(escopo: EscopoAgenda) {
    if (!escopoDialog) return;
    const { acao, evento } = escopoDialog;
    setEscopoDialog(null);
    if (acao === 'editar') setEdicao({ evento, escopo });
    else setConfirmacao({ evento, escopo });
  }

  async function confirmarCancelamento() {
    if (!confirmacao) return;
    setCancelando(true);
    try {
      const { evento, escopo } = confirmacao;
      const r = await cancelarCompromisso({
        id: evento.meta.compromissoId,
        escopo,
        dataOcorrencia: evento.meta.dataOriginal,
      });
      if (r.ok) {
        toast({ title: r.message ?? 'Compromisso cancelado.' });
        setConfirmacao(null);
        router.refresh();
      } else {
        toast({ title: r.message ?? 'Não foi possível cancelar.', variant: 'destructive' });
      }
    } finally {
      setCancelando(false);
    }
  }

  const cartao = {
    tz,
    agoraIso,
    ocupado,
    onEditar: editar,
    onCancelar: cancelar,
    onConcluir: concluir,
  };
  const doDia = (d: string) => eventos.filter((e) => e.dia === d);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Agenda"
        subtitle={
          <>
            Fuso horário: {tz}.{' '}
            <Link href={fusoHref} className="font-medium underline underline-offset-2">
              Alterar
            </Link>
          </>
        }
        actions={
          <Button type="button" className="min-h-11" onClick={() => setNovoAberto(true)}>
            <Plus className="mr-1 h-4 w-4" aria-hidden="true" />
            Novo compromisso
          </Button>
        }
      />

      {perfil !== 'professor' ? (
        <AvisoFichasSemDia fichas={fichasSemDia} autonomo={perfil === 'autonomo'} />
      ) : null}

      <Tabs value={visao} onValueChange={(v) => irPara(v as VisaoAgenda, diaAtivo)}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <TabsList aria-label="Visão da agenda">
            {VISOES.map((v) => (
              <TabsTrigger key={v.valor} value={v.valor} className="min-h-9 min-w-16">
                {v.rotulo}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-11 w-11"
              aria-label="Período anterior"
              onClick={() => irPara(visao, somarDias(diaInicio, -1))}
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button type="button" variant="outline" className="min-h-11" onClick={() => irPara(visao, hoje)}>
              Hoje
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-11 w-11"
              aria-label="Próximo período"
              onClick={() => irPara(visao, somarDias(diaFim, 1))}
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
        <p className="mt-3 text-sm font-semibold capitalize text-foreground" aria-live="polite">
          {rotuloJanela(visao, diaInicio, diaFim)}
        </p>

        <TabsContent value={visao} className="mt-3">
          {visao === 'dia' ? (
            <ListaDia eventos={doDia(diaInicio)} {...cartao} />
          ) : visao === 'semana' ? (
            <FaixaSemana
              dias={dias}
              eventos={eventos}
              hoje={hoje}
              selecionado={diaAtivo}
              onSelecionar={setSelecionado}
              {...cartao}
            />
          ) : (
            <div className="space-y-4">
              <GradeMes
                diaInicio={diaInicio}
                diaFim={diaFim}
                eventos={eventos}
                hoje={hoje}
                selecionado={diaAtivo}
                onSelecionar={setSelecionado}
              />
              <h2 className="text-sm font-semibold capitalize text-foreground">{rotuloDia(diaAtivo)}</h2>
              <ListaDia eventos={doDia(diaAtivo)} {...cartao} />
            </div>
          )}
        </TabsContent>
      </Tabs>

      <CompromissoForm
        open={novoAberto}
        onOpenChange={setNovoAberto}
        perfil={perfil}
        alunos={alunos}
        diaPadrao={visao === 'dia' ? diaInicio : diaAtivo}
      />
      {edicao ? (
        <CompromissoForm
          open
          onOpenChange={(aberto) => {
            if (!aberto) setEdicao(null);
          }}
          perfil={perfil}
          alunos={alunos}
          diaPadrao={diaAtivo}
          edicao={edicao}
        />
      ) : null}
      <EscopoRecorrenciaDialog
        open={escopoDialog !== null}
        onOpenChange={(aberto) => {
          if (!aberto) setEscopoDialog(null);
        }}
        acao={escopoDialog?.acao ?? 'editar'}
        onConfirmar={aoEscolherEscopo}
      />
      <ConfirmDialog
        open={confirmacao !== null}
        onOpenChange={(aberto) => {
          if (!aberto) setConfirmacao(null);
        }}
        title="Cancelar compromisso?"
        description="O compromisso deixa de aparecer na agenda. Isto não pode ser desfeito."
        confirmLabel="Cancelar compromisso"
        cancelLabel="Voltar"
        destructive
        loading={cancelando}
        onConfirm={confirmarCancelamento}
      />
    </div>
  );
}
