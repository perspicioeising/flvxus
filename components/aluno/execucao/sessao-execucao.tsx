'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Flag,
  Loader2,
  Pencil,
} from 'lucide-react';

import {
  exercicioConcluido,
  progressoSessao,
  type SerieLog,
} from '@/lib/treino/progresso';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  finalizarSessao,
  iniciarSessao,
  registrarSerie,
} from '@/actions/execucao';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { agruparPorDia } from '@/lib/semana';
import { agruparPorDivisao } from '@/lib/divisao';
import { TimerDescanso } from './timer-descanso';
import { ExercicioInfo } from './exercicio-info';
import { SeletorDia, type OpcaoDia } from './seletor-dia';
import { SeletorDivisao, type OpcaoDivisao } from './seletor-divisao';

/** Item prescrito, com tudo que a UI de execução precisa exibir. */
export interface ItemExecucao {
  id: string;
  nome: string;
  /** Dia da semana (0..6) ou `null` (sem dia definido) deste item. */
  weekday: number | null;
  /**
   * Divisão (ex.: 'A') ou `null` deste item. Quando algum item tem divisão, a
   * ficha inteira é tratada por divisão (e não por dia). Opcional para não
   * quebrar fichas/fakes legados que só carregam `weekday`.
   */
  division?: string | null;
  sets: number;
  reps: string | null;
  cargaAlvo: number | null;
  descansoSegundos: number | null;
  observacoes: string | null;
  instrucoes: string | null;
  dicas: string[];
  errosComuns: string[];
  gruposMusculares: string[];
  equipamento: string[];
  /** URL JÁ ASSINADA do vídeo (TTL curto, bucket privado) ou `null`. */
  videoUrl: string | null;
  /** URL JÁ ASSINADA da thumbnail (TTL curto) ou `null`. */
  thumbnailUrl: string | null;
}

/** Estado local de uma série (uma linha do exercício). */
interface EstadoSerie {
  reps: string;
  carga: string;
  completed: boolean;
  salvando: boolean;
}

/** Chave única de uma série no mapa de estado: `itemId:setNumber`. */
function chaveSerie(itemId: string, setNumber: number): string {
  return `${itemId}:${setNumber}`;
}

/**
 * Tela de execução série a série (Client Component). A sessão só é criada no
 * primeiro toque ("Começar treino" ou ao marcar a primeira série), para não
 * gravar sessão vazia ao só abrir. Cada toque chama as Server Actions
 * (`registrarSerie`/`finalizarSessao`) via `useTransition` para feedback.
 *
 * Pensado para a mão suada durante o treino: botões largos (≥ 44px), estados
 * claros, sem depender de hover.
 *
 * Apesar de viver sob `components/aluno/`, este componente agora serve DOIS
 * fluxos: o do próprio aluno (padrão) e o do professor-em-nome-do-aluno (treino
 * presencial). O que muda é só a origem dos dados: quando `studentId` vem
 * preenchido, a rota do professor o repassa às actions (que gravam a sessão em
 * nome daquele aluno) e `destinoAoFinalizar` aponta de volta à ficha do aluno
 * no professor. A autorização real é no servidor (action + RLS).
 */
export function SessaoExecucao({
  planId,
  itens,
  diaInicial = null,
  divisaoInicial = null,
  studentId = null,
  destinoAoFinalizar = '/aluno/treinos',
}: {
  planId: string;
  itens: ItemExecucao[];
  /**
   * Dia (0..6) em que o seletor deve abrir — ex.: deep-link `?dia=N` a partir
   * da ficha. Só é respeitado se houver itens nesse dia; senão cai no primeiro
   * dia com exercícios. `null` = sem preferência. Usado só no eixo DIA (legado).
   */
  diaInicial?: number | null;
  /**
   * Divisão (ex.: 'A') em que o seletor deve abrir — ex.: deep-link `?divisao=A`
   * a partir da ficha. Só é respeitada se houver itens nessa divisão; senão cai
   * na primeira divisão com exercícios. `null` = sem preferência. Usada só no
   * eixo DIVISÃO.
   */
  divisaoInicial?: string | null;
  /**
   * `user_id` do ALUNO em cujo nome a sessão é gravada. `null`/ausente = fluxo
   * do próprio aluno (a action usa `auth.uid()`). Preenchido só pela rota do
   * professor. A autorização real (papel/tenant/posse) é no servidor
   * (action + RLS); esta prop é só o parâmetro que a UI repassa.
   */
  studentId?: string | null;
  /**
   * Rota para onde navegar ao finalizar (ou ao concluir sem sessão). Default
   * `'/aluno/treinos'` (fluxo do aluno). A rota do professor passa
   * `/professor/alunos/[id]` para voltar à ficha do aluno.
   */
  destinoAoFinalizar?: string;
}) {
  const router = useRouter();
  const [sessionId, setSessionId] = React.useState<string | null>(null);
  const [iniciando, setIniciando] = React.useState(false);
  const [finalizando, setFinalizando] = React.useState(false);
  const [nota, setNota] = React.useState('');
  // Intensidade percebida (RPE 1..10) opcional ao finalizar. `null` = não
  // informada (não bloqueia a finalização).
  const [intensidade, setIntensidade] = React.useState<number | null>(null);
  const [pendente, startTransition] = React.useTransition();

  // Eixo de agrupamento da ficha: se QUALQUER item tem divisão, a ficha é por
  // divisão (A/B/C/…); senão é legada por dia da semana. Detecção barata e
  // determinística — o professor grava um eixo só por ficha.
  const porDivisao = React.useMemo(
    () => itens.some((i) => (i.division ?? null) !== null),
    [itens]
  );

  // --- Eixo DIA (legado): mantido byte-a-byte em comportamento. ---
  // Dias com itens (só os que têm exercícios; inclui o balde "Sem dia definido").
  const gruposDia = React.useMemo(
    () => agruparPorDia(itens, (item) => item.weekday),
    [itens]
  );
  const opcoesDia: OpcaoDia[] = React.useMemo(
    () =>
      gruposDia.map((g) => ({
        weekday: g.weekday,
        rotulo: g.rotulo,
        total: g.itens.length,
      })),
    [gruposDia]
  );

  // --- Eixo DIVISÃO: espelho do eixo dia, usando `agruparPorDivisao` (que já
  // ordena por localeCompare pt-BR com o balde "Divisão única" por último). ---
  const gruposDivisao = React.useMemo(
    () => agruparPorDivisao(itens, (item) => item.division ?? null),
    [itens]
  );
  const opcoesDivisao: OpcaoDivisao[] = React.useMemo(
    () =>
      gruposDivisao.map((g) => ({
        division: g.division,
        rotulo: g.rotulo,
        total: g.itens.length,
      })),
    [gruposDivisao]
  );

  // Dia escolhido: se o deep-link (`diaInicial`) aponta um dia que tem itens,
  // abre nele; senão, começa no primeiro grupo com itens (nunca força o dia de
  // hoje). A troca de dia continua livre pelo seletor.
  const [diaSelecionado, setDiaSelecionado] = React.useState<number | null>(
    () =>
      diaInicial !== null && gruposDia.some((g) => g.weekday === diaInicial)
        ? diaInicial
        : gruposDia[0]?.weekday ?? null
  );

  // Divisão escolhida: espelho exato da regra do dia. Fallback = primeira
  // divisão com itens (pode ser o balde "Divisão única" se não houver nomeadas).
  const [divisaoSelecionada, setDivisaoSelecionada] = React.useState<
    string | null
  >(() =>
    divisaoInicial != null &&
    gruposDivisao.some((g) => g.division === divisaoInicial)
      ? divisaoInicial
      : gruposDivisao[0]?.division ?? null
  );

  // Itens do grupo atualmente selecionado, ramificando pelo eixo da ficha.
  const itensVisiveis = React.useMemo(() => {
    if (porDivisao) {
      const grupo = gruposDivisao.find((g) => g.division === divisaoSelecionada);
      return grupo ? grupo.itens : (gruposDivisao[0]?.itens ?? []);
    }
    const grupo = gruposDia.find((g) => g.weekday === diaSelecionado);
    return grupo ? grupo.itens : (gruposDia[0]?.itens ?? []);
  }, [
    porDivisao,
    gruposDia,
    gruposDivisao,
    diaSelecionado,
    divisaoSelecionada,
  ]);

  // Valor do grupo ativo (dia OU divisão) — usado como dependência dos resets
  // para que trocar de divisão também volte ao exercício 0 e esconda o descanso.
  const grupoAtivo: number | string | null = porDivisao
    ? divisaoSelecionada
    : diaSelecionado;

  // Fluxo guiado: um exercício por vez. `indiceAtual` navega dentro do grupo.
  const [indiceAtual, setIndiceAtual] = React.useState(0);

  // Ao trocar de grupo (dia ou divisão), volta ao primeiro exercício.
  React.useEffect(() => {
    setIndiceAtual(0);
  }, [grupoAtivo]);

  // Clamp defensivo: nunca indexar fora quando a lista do dia encolher.
  React.useEffect(() => {
    setIndiceAtual((i) => {
      const max = Math.max(itensVisiveis.length - 1, 0);
      return i > max ? max : i;
    });
  }, [itensVisiveis.length]);

  const itemAtual =
    itensVisiveis.length > 0
      ? itensVisiveis[Math.min(indiceAtual, itensVisiveis.length - 1)]
      : undefined;

  // Mostra o descanso acoplado (auto-iniciado) somente após concluir uma série
  // do exercício atual. Guardamos o id do item para resetar ao navegar/trocar.
  const [descansoAtivoItemId, setDescansoAtivoItemId] = React.useState<
    string | null
  >(null);

  // Reinicia o timer de descanso a cada série concluída: a key do
  // <TimerDescanso> combina este contador, forçando a remontagem (que zera e
  // auto-inicia) mesmo entre séries do MESMO exercício.
  const [descansoResetKey, setDescansoResetKey] = React.useState(0);

  // Ao navegar entre exercícios ou trocar de grupo (dia/divisão), esconde o
  // descanso acoplado (ele volta a aparecer quando o aluno concluir uma série
  // do novo item).
  React.useEffect(() => {
    setDescansoAtivoItemId(null);
  }, [indiceAtual, grupoAtivo]);

  // Série atual mostrada (com inputs) por exercício. A UI exibe UMA série por
  // vez; as já concluídas aparecem em resumo compacto. Chave = item.id.
  const [serieAtualPorItem, setSerieAtualPorItem] = React.useState<
    Record<string, number>
  >({});

  // Séries concluídas REABERTAS para correção (erro de digitação de reps/carga).
  // Guarda as chaves `itemId:setNumber` em edição; é um overlay independente da
  // "série atual" — editar uma série passada não move a navegação nem o descanso.
  const [seriesEmEdicao, setSeriesEmEdicao] = React.useState<Set<string>>(
    () => new Set()
  );

  function abrirEdicao(itemId: string, setNumber: number) {
    setSeriesEmEdicao((s) => new Set(s).add(chaveSerie(itemId, setNumber)));
  }

  function fecharEdicao(itemId: string, setNumber: number) {
    setSeriesEmEdicao((s) => {
      const proximo = new Set(s);
      proximo.delete(chaveSerie(itemId, setNumber));
      return proximo;
    });
  }

  // Estado inicial: uma série por set prescrito de TODOS os itens da ficha, com
  // os defaults da prescrição. Guardamos todos para preservar o que o aluno já
  // marcou ao alternar entre dias; a UI mostra só os itens do dia selecionado.
  const [series, setSeries] = React.useState<Record<string, EstadoSerie>>(() => {
    const inicial: Record<string, EstadoSerie> = {};
    for (const item of itens) {
      for (let n = 1; n <= item.sets; n += 1) {
        inicial[chaveSerie(item.id, n)] = {
          // `reps` fica VAZIO: a prescrição (`item.reps`) costuma ser uma FAIXA
          // de texto ("10-12") e `reps_done` é um inteiro (quantas o aluno fez).
          // Pré-preencher com a faixa fazia o registro falhar na validação Zod.
          // A faixa prescrita vira placeholder no input.
          reps: '',
          carga: item.cargaAlvo !== null ? String(item.cargaAlvo) : '',
          completed: false,
          salvando: false,
        };
      }
    }
    return inicial;
  });

  // Progresso do DIA selecionado (só as séries dos itens visíveis), usando a
  // lógica pura compartilhada.
  const idsVisiveis = React.useMemo(
    () => new Set(itensVisiveis.map((item) => item.id)),
    [itensVisiveis]
  );
  const logs: SerieLog[] = React.useMemo(
    () =>
      Object.entries(series)
        .map(([chave, estado]) => {
          const [plan_item_id, setStr] = chave.split(':');
          return {
            plan_item_id,
            set_number: Number(setStr),
            completed: estado.completed,
            reps_done: estado.reps === '' ? null : Number(estado.reps),
            load_done:
              estado.carga === '' ? null : Number(estado.carga.replace(',', '.')),
          };
        })
        .filter((log) => log.plan_item_id !== null && idsVisiveis.has(log.plan_item_id)),
    [series, idsVisiveis]
  );
  const progresso = progressoSessao(logs);
  const tudoFeito = progresso.total > 0 && progresso.feitas === progresso.total;

  // Logs apenas do exercício atual, para saber se ele já está concluído e
  // realçar o botão "Próximo" como próxima ação sugerida.
  const logsItemAtual: SerieLog[] = React.useMemo(
    () =>
      itemAtual ? logs.filter((log) => log.plan_item_id === itemAtual.id) : [],
    [logs, itemAtual]
  );

  // Série atual do exercício visível: usa o estado explícito (quando o aluno já
  // avançou neste item) ou cai na primeira série ainda não concluída; fallback
  // na série 1, sempre limitada a `itemAtual.sets`.
  const serieAtual = React.useMemo(() => {
    if (!itemAtual) return 1;
    const explicito = serieAtualPorItem[itemAtual.id];
    if (explicito !== undefined) {
      return Math.min(Math.max(explicito, 1), itemAtual.sets);
    }
    for (let n = 1; n <= itemAtual.sets; n += 1) {
      const estado = series[chaveSerie(itemAtual.id, n)];
      if (!estado?.completed) return n;
    }
    // Todas concluídas: permanece na última (o botão "Próximo" já realça).
    return itemAtual.sets;
  }, [itemAtual, serieAtualPorItem, series]);

  /** Garante uma sessão criada; retorna o id ou null se falhar. */
  async function garantirSessao(): Promise<string | null> {
    if (sessionId) return sessionId;
    setIniciando(true);
    try {
      // Repasse CONDICIONAL do 3º arg (`studentId`): só anexa quando há
      // aluno-alvo (fluxo professor). No fluxo do aluno a aridade é a de sempre
      // (`iniciarSessao(planId, divisao)` ou `iniciarSessao(planId)`), o que
      // preserva os asserts `toHaveBeenCalledWith` exatos dos testes.
      let r;
      if (studentId != null) {
        r = porDivisao
          ? await iniciarSessao(planId, divisaoSelecionada ?? undefined, studentId)
          : await iniciarSessao(planId, undefined, studentId);
      } else {
        r = porDivisao
          ? await iniciarSessao(planId, divisaoSelecionada ?? undefined)
          : await iniciarSessao(planId);
      }
      if (r.ok && r.id) {
        setSessionId(r.id);
        return r.id;
      }
      toast({
        title: r.message ?? 'Não foi possível iniciar o treino.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIniciando(false);
    }
  }

  function atualizarCampo(chave: string, campo: 'reps' | 'carga', valor: string) {
    setSeries((atual) => ({
      ...atual,
      [chave]: { ...atual[chave], [campo]: valor },
    }));
  }

  /** Alterna a conclusão de uma série, criando a sessão se necessário. */
  async function alternarSerie(itemId: string, setNumber: number) {
    const chave = chaveSerie(itemId, setNumber);
    const estadoAtual = series[chave];
    if (!estadoAtual) return;

    const idSessao = await garantirSessao();
    if (!idSessao) return;

    const novoCompleted = !estadoAtual.completed;

    setSeries((atual) => ({
      ...atual,
      [chave]: { ...atual[chave], salvando: true },
    }));

    startTransition(async () => {
      const r = await registrarSerie({
        session_id: idSessao,
        plan_item_id: itemId,
        set_number: setNumber,
        reps_done: estadoAtual.reps,
        load_done: estadoAtual.carga,
        completed: novoCompleted,
      });

      setSeries((atual) => {
        const proximo = { ...atual };
        proximo[chave] = {
          ...atual[chave],
          completed: r.ok ? novoCompleted : atual[chave].completed,
          salvando: false,
        };

        // Ao concluir uma série com sucesso, herda os valores desta série para
        // a PRÓXIMA ainda não editada do mesmo exercício — só sobrescreve se a
        // próxima continua no default da prescrição (não apaga edição manual).
        if (r.ok && novoCompleted) {
          const item = itens.find((it) => it.id === itemId);
          const proximaChave = chaveSerie(itemId, setNumber + 1);
          const proximaSerie = proximo[proximaChave];
          if (item && proximaSerie && !proximaSerie.completed) {
            // `reps` nasce vazio (não herda a faixa prescrita); a carga nasce
            // da prescrição. A próxima série ainda está "intocada" quando bate
            // esses defaults — só então herdamos os valores desta série.
            const defaultCarga =
              item.cargaAlvo !== null ? String(item.cargaAlvo) : '';
            if (
              proximaSerie.reps === '' &&
              proximaSerie.carga === defaultCarga
            ) {
              proximo[proximaChave] = {
                ...proximaSerie,
                reps: estadoAtual.reps,
                carga: estadoAtual.carga,
              };
            }
          }
        }

        return proximo;
      });

      if (r.ok && novoCompleted) {
        // Descanso acoplado: dispara o timer auto-iniciado deste exercício.
        setDescansoAtivoItemId(itemId);
        // Reinicia o descanso a cada série concluída (remonta o TimerDescanso).
        setDescansoResetKey((k) => k + 1);
        // Avança para a próxima série (uma por vez); na última, permanece nela
        // — o botão "Próximo exercício" passa a realçar via exercicioConcluido.
        const item = itens.find((it) => it.id === itemId);
        if (item) {
          setSerieAtualPorItem((m) => ({
            ...m,
            [itemId]: Math.min((m[itemId] ?? setNumber) + 1, item.sets),
          }));
        }
      }

      if (!r.ok) {
        toast({
          title: r.message ?? 'Não foi possível registrar a série.',
          variant: 'destructive',
        });
      }
    });
  }

  /**
   * Regrava uma série JÁ concluída com os valores corrigidos (reps/carga). Usa
   * o mesmo upsert idempotente de `alternarSerie`, mas com `completed: true`
   * FIXO — editar não desmarca — e SEM tocar no descanso nem na série atual:
   * corrigir um registro antigo não deve reiniciar o timer de descanso (que é
   * para a conclusão de uma série nova) nem mover a navegação.
   */
  async function salvarEdicaoSerie(itemId: string, setNumber: number) {
    const chave = chaveSerie(itemId, setNumber);
    const estado = series[chave];
    if (!estado) return;

    const idSessao = await garantirSessao();
    if (!idSessao) return;

    setSeries((atual) => ({
      ...atual,
      [chave]: { ...atual[chave], salvando: true },
    }));

    startTransition(async () => {
      const r = await registrarSerie({
        session_id: idSessao,
        plan_item_id: itemId,
        set_number: setNumber,
        reps_done: estado.reps,
        load_done: estado.carga,
        completed: true,
      });

      setSeries((atual) => ({
        ...atual,
        [chave]: { ...atual[chave], salvando: false },
      }));

      if (r.ok) {
        // Volta ao resumo com os novos valores (já no estado local).
        fecharEdicao(itemId, setNumber);
      } else {
        toast({
          title: r.message ?? 'Não foi possível registrar a série.',
          variant: 'destructive',
        });
      }
    });
  }

  async function concluir() {
    if (!sessionId) {
      // Sessão nunca foi criada (nenhuma série marcada) — nada a finalizar.
      router.push(destinoAoFinalizar);
      return;
    }
    setFinalizando(true);
    const r = await finalizarSessao({
      session_id: sessionId,
      notes: nota.trim() === '' ? undefined : nota.trim(),
      perceived_intensity: intensidade ?? undefined,
    });
    setFinalizando(false);

    if (r.ok) {
      toast({ title: 'Treino finalizado. Bom trabalho!' });
      router.push(destinoAoFinalizar);
      router.refresh();
    } else {
      toast({
        title: r.message ?? 'Não foi possível finalizar o treino.',
        variant: 'destructive',
      });
    }
  }

  return (
    <div className="space-y-6">
      {/* Seletor do eixo da ficha: divisão (A/B/C/…) ou dia (legado). Cada um
          se auto-esconde quando há ≤ 1 opção. */}
      {porDivisao ? (
        <SeletorDivisao
          opcoes={opcoesDivisao}
          selecionado={divisaoSelecionada}
          onSelecionar={setDivisaoSelecionada}
        />
      ) : (
        <SeletorDia
          opcoes={opcoesDia}
          selecionado={diaSelecionado}
          onSelecionar={setDiaSelecionado}
        />
      )}

      {/* Barra de progresso fixa no topo do conteúdo. */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-foreground">Progresso</span>
          <span className="text-muted-foreground">
            {progresso.feitas} de {progresso.total} séries
          </span>
        </div>
        <Progress value={progresso.pct} aria-label="Progresso do treino" />
      </div>

      {itemAtual ? (
        <Card key={itemAtual.id}>
          <CardHeader className="space-y-3 p-4 pb-0">
            <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
              <span aria-live="polite">
                Exercício {indiceAtual + 1} de {itensVisiveis.length}
              </span>
            </div>
            <CardTitle className="text-xl font-bold text-foreground">
              {itemAtual.nome}
            </CardTitle>
            {/* Prescrição como linha de badges — fonte única da verdade. */}
            <div className="flex flex-wrap gap-2">
              {itemAtual.reps ? (
                <Badge variant="secondary">
                  {itemAtual.sets} × {itemAtual.reps}
                </Badge>
              ) : (
                <Badge variant="secondary">{itemAtual.sets} séries</Badge>
              )}
              {itemAtual.cargaAlvo !== null ? (
                <Badge variant="outline">Carga alvo: {itemAtual.cargaAlvo} kg</Badge>
              ) : null}
              {itemAtual.descansoSegundos !== null ? (
                <Badge variant="outline">
                  Descanso: {itemAtual.descansoSegundos}s
                </Badge>
              ) : null}
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-4">
            <ExercicioInfo
              info={{
                nome: itemAtual.nome,
                videoUrl: itemAtual.videoUrl,
                thumbnailUrl: itemAtual.thumbnailUrl,
                sets: itemAtual.sets,
                reps: itemAtual.reps,
                cargaAlvo: itemAtual.cargaAlvo,
                descansoSegundos: itemAtual.descansoSegundos,
                observacoes: itemAtual.observacoes,
                instrucoes: itemAtual.instrucoes,
                dicas: itemAtual.dicas,
                errosComuns: itemAtual.errosComuns,
                gruposMusculares: itemAtual.gruposMusculares,
                equipamento: itemAtual.equipamento,
              }}
            />

            {/* Resumo compacto das séries JÁ concluídas deste exercício (sem
                inputs), para a tela ficar limpa e o descanso fácil de ver. */}
            {(() => {
              const concluidas = Array.from(
                { length: itemAtual.sets },
                (_, index) => index + 1
              ).filter((setNumber) => {
                const estado = series[chaveSerie(itemAtual.id, setNumber)];
                return estado?.completed;
              });
              if (concluidas.length === 0) return null;
              return (
                <ul className="space-y-2" aria-label="Séries concluídas">
                  {concluidas.map((setNumber) => {
                    const chave = chaveSerie(itemAtual.id, setNumber);
                    const estado = series[chave];
                    const editando = seriesEmEdicao.has(chave);

                    // Modo edição: reabre os inputs daquela série (pré-preenchidos
                    // com os valores atuais) para corrigir reps/carga e re-concluir.
                    if (editando) {
                      return (
                        <li
                          key={chave}
                          className="space-y-3 rounded-lg border border-primary/40 bg-primary/5 p-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">
                              Série {setNumber} de {itemAtual.sets}
                            </span>
                          </div>

                          <div className="flex items-end gap-3">
                            <div className="flex-1 space-y-1">
                              <Label htmlFor={`${chave}-reps`} className="text-xs">
                                Reps
                              </Label>
                              <Input
                                id={`${chave}-reps`}
                                inputMode="numeric"
                                value={estado.reps}
                                placeholder={itemAtual.reps ?? undefined}
                                onChange={(e) =>
                                  atualizarCampo(chave, 'reps', e.target.value)
                                }
                                className="h-11"
                              />
                            </div>

                            <div className="flex-1 space-y-1">
                              <Label htmlFor={`${chave}-carga`} className="text-xs">
                                Carga (kg)
                              </Label>
                              <Input
                                id={`${chave}-carga`}
                                inputMode="decimal"
                                value={estado.carga}
                                onChange={(e) =>
                                  atualizarCampo(chave, 'carga', e.target.value)
                                }
                                className="h-11"
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <Button
                              type="button"
                              variant="default"
                              className="min-h-11 flex-1"
                              aria-label={`Salvar série ${setNumber}`}
                              disabled={estado.salvando || iniciando}
                              onClick={() =>
                                salvarEdicaoSerie(itemAtual.id, setNumber)
                              }
                            >
                              {estado.salvando ? (
                                <Loader2
                                  className="h-5 w-5 animate-spin"
                                  aria-hidden="true"
                                />
                              ) : (
                                <Check className="h-5 w-5" aria-hidden="true" />
                              )}
                              Salvar
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              className="min-h-11"
                              aria-label={`Cancelar edição da série ${setNumber}`}
                              disabled={estado.salvando}
                              onClick={() =>
                                fecharEdicao(itemAtual.id, setNumber)
                              }
                            >
                              Cancelar
                            </Button>
                          </div>
                        </li>
                      );
                    }

                    // Resumo somente-leitura (padrão) com botão de editar.
                    return (
                      <li
                        key={chave}
                        className="flex items-center justify-between gap-2 rounded-lg border border-primary/40 bg-primary/5 px-3 py-2 text-sm"
                      >
                        <span className="flex items-center gap-2 font-medium text-foreground">
                          <Check
                            className="h-4 w-4 text-primary"
                            aria-hidden="true"
                          />
                          Série {setNumber}
                        </span>
                        <span className="flex items-center gap-2">
                          <span className="tabular-nums text-muted-foreground">
                            {estado.reps !== '' ? `${estado.reps} reps` : '—'}
                            {estado.carga !== '' ? ` · ${estado.carga} kg` : ''}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="min-h-11 min-w-11"
                            aria-label={`Editar série ${setNumber}`}
                            onClick={() =>
                              abrirEdicao(itemAtual.id, setNumber)
                            }
                          >
                            <Pencil className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              );
            })()}

            {/* Exatamente UMA série por vez (a série atual) com inputs. */}
            {(() => {
              const setNumber = serieAtual;
              const chave = chaveSerie(itemAtual.id, setNumber);
              const estado = series[chave];
              if (!estado) return null;

              return (
                <ul className="space-y-3">
                  <li
                    key={chave}
                    className={cn(
                      'space-y-3 rounded-lg border p-3',
                      estado.completed
                        ? 'border-primary/40 bg-primary/5'
                        : 'border-border'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">
                        Série {setNumber} de {itemAtual.sets}
                      </span>
                    </div>

                    <div className="flex items-end gap-3">
                      <div className="flex-1 space-y-1">
                        <Label htmlFor={`${chave}-reps`} className="text-xs">
                          Reps
                        </Label>
                        <Input
                          id={`${chave}-reps`}
                          inputMode="numeric"
                          value={estado.reps}
                          placeholder={itemAtual.reps ?? undefined}
                          onChange={(e) =>
                            atualizarCampo(chave, 'reps', e.target.value)
                          }
                          className="h-11"
                        />
                      </div>

                      <div className="flex-1 space-y-1">
                        <Label htmlFor={`${chave}-carga`} className="text-xs">
                          Carga (kg)
                        </Label>
                        <Input
                          id={`${chave}-carga`}
                          inputMode="decimal"
                          value={estado.carga}
                          onChange={(e) =>
                            atualizarCampo(chave, 'carga', e.target.value)
                          }
                          className="h-11"
                        />
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant={estado.completed ? 'default' : 'outline'}
                      className="min-h-11 w-full"
                      aria-pressed={estado.completed}
                      disabled={estado.salvando || iniciando}
                      onClick={() => alternarSerie(itemAtual.id, setNumber)}
                    >
                      {estado.salvando ? (
                        <Loader2
                          className="h-5 w-5 animate-spin"
                          aria-hidden="true"
                        />
                      ) : (
                        <Check className="h-5 w-5" aria-hidden="true" />
                      )}
                      {estado.completed ? 'Série concluída' : 'Concluir série'}
                    </Button>
                  </li>
                </ul>
              );
            })()}

            {/* Descanso acoplado: só aparece após concluir uma série deste
                exercício e quando há descanso prescrito; auto-inicia. */}
            {itemAtual.descansoSegundos &&
            descansoAtivoItemId === itemAtual.id ? (
              <TimerDescanso
                key={`${itemAtual.id}:${descansoResetKey}`}
                segundos={itemAtual.descansoSegundos}
                autoIniciar
              />
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {/* Navegação entre exercícios do dia. */}
      {itensVisiveis.length > 0 ? (
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            className="min-h-14 flex-1"
            disabled={indiceAtual === 0}
            onClick={() => setIndiceAtual((i) => Math.max(i - 1, 0))}
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            Anterior
          </Button>
          <Button
            type="button"
            variant={
              itemAtual && exercicioConcluido(logsItemAtual)
                ? 'default'
                : 'outline'
            }
            className="min-h-14 flex-1"
            disabled={indiceAtual >= itensVisiveis.length - 1}
            onClick={() =>
              setIndiceAtual((i) =>
                Math.min(i + 1, itensVisiveis.length - 1)
              )
            }
          >
            Próximo
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>
      ) : null}

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            type="button"
            size="lg"
            className="min-h-14 w-full text-base"
            disabled={finalizando || pendente}
          >
            <Flag className="h-5 w-5" aria-hidden="true" />
            Finalizar treino
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Finalizar o treino?</AlertDialogTitle>
            <AlertDialogDescription>
              {tudoFeito
                ? 'Você concluiu todas as séries. Deseja finalizar a sessão?'
                : `Você marcou ${progresso.feitas} de ${progresso.total} séries. Finalizar mesmo assim?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {/* Intensidade percebida (RPE 1..10), opcional: não bloqueia
              finalizar. Toque para marcar/desmarcar (toggle). */}
          <div className="space-y-2">
            <span id="rpe-label" className="text-sm font-medium text-foreground">
              Intensidade do treino (opcional)
            </span>
            <div
              role="group"
              aria-labelledby="rpe-label"
              className="flex flex-wrap gap-2"
            >
              {Array.from({ length: 10 }, (_, i) => i + 1).map((valor) => {
                const ativo = intensidade === valor;
                return (
                  <button
                    key={valor}
                    type="button"
                    aria-pressed={ativo}
                    aria-label={`Intensidade ${valor}`}
                    onClick={() =>
                      setIntensidade((atual) =>
                        atual === valor ? null : valor
                      )
                    }
                    className={cn(
                      'min-h-11 min-w-11 flex-1 rounded-full border text-sm font-medium transition-colors',
                      ativo
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-background text-foreground hover:bg-muted'
                    )}
                  >
                    {valor}
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 · Muito leve</span>
              <span>10 · Máximo</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="nota-sessao" className="text-sm">
              Observações (opcional)
            </Label>
            <Textarea
              id="nota-sessao"
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              rows={3}
              placeholder="Como foi o treino?"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="min-h-11">Voltar</AlertDialogCancel>
            <AlertDialogAction
              className="min-h-11"
              onClick={(e) => {
                e.preventDefault();
                concluir();
              }}
            >
              {finalizando ? 'Finalizando…' : 'Finalizar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
