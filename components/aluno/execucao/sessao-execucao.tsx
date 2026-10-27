'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Minus,
  Pencil,
  Plus,
  X,
} from 'lucide-react';

import {
  exercicioConcluido,
  hidratarSerie,
  seriesPorItem,
  serieAtualDeLogs,
  progressoSessao,
  type SerieLog,
} from '@/lib/treino/progresso';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  carregarSessaoAberta,
  finalizarSessao,
  iniciarSessao,
  registrarSerie,
} from '@/actions/execucao';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { agruparPorDia } from '@/lib/semana';
import { agruparPorDivisao, DIVISAO_SEM } from '@/lib/divisao';
import { TimerDescanso } from './timer-descanso';
import { ExercicioInfo } from './exercicio-info';
import { SeletorDia, type OpcaoDia } from './seletor-dia';
import { SeletorDivisao, type OpcaoDivisao } from './seletor-divisao';
import { DialogAvaliacaoTreino } from './dialog-avaliacao-treino';

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
 * Calcula a próxima string de CARGA ao tocar −/+. Passo ±2,5, clamp ≥ 0, no
 * máximo 1 casa decimal e ponto como separador. Aceita vírgula na entrada.
 * Campo vazio/NaN parte de 0. Nunca muda a faixa prescrita (placeholder).
 */
function passoCarga(valor: string, delta: number): string {
  const atual = Number((valor || '').replace(',', '.'));
  const base = Number.isNaN(atual) ? 0 : atual;
  const proximo = Math.max(0, base + delta);
  // Arredonda para 1 casa decimal e remove o ".0" quando for inteiro.
  const arredondado = Math.round(proximo * 10) / 10;
  return Number.isInteger(arredondado)
    ? String(arredondado)
    : arredondado.toFixed(1);
}

/**
 * Calcula a próxima string de REPS ao tocar −/+. Passo ±1 inteiro, clamp ≥ 0.
 * Campo vazio/não-numérico parte de 0 (o + leva a 1, o − fica em 0). Nunca
 * incrementa a faixa prescrita (que é só placeholder).
 */
function passoReps(valor: string, delta: number): string {
  const atual = parseInt(valor, 10);
  const base = Number.isNaN(atual) ? 0 : atual;
  const proximo = Math.max(0, base + delta);
  return String(proximo);
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
  permitirTrocaDeGrupo = true,
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
  /**
   * Controla se o seletor de troca de grupo (divisão/dia) é renderizado.
   * **Default `true`** para preservar o fluxo do PROFESSOR (treino presencial),
   * que depende do seletor para navegar entre divisões/dias sem editar a rota.
   * A rota do ALUNO passa `false` explicitamente: ela já entrega SÓ os itens da
   * divisão-alvo (filtrada no servidor), então o seletor é ocultado para focar
   * no treino em andamento. A prop NÃO muda a gravação — só esconde os seletores.
   */
  permitirTrocaDeGrupo?: boolean;
}) {
  const router = useRouter();
  // Estado multi-divisão (design §4.3): uma sessão por divisão-alvo, chaveada
  // pela divisão (sentinela DIVISAO_SEM para o balde sem divisão). O fluxo do
  // professor (permitirTrocaDeGrupo) pode alternar de divisão; o índice único
  // garante uma sessão ABERTA por divisão, e o estado reflete isso sem cruzar
  // sessões de divisões diferentes.
  const [sessionIdPorGrupo, setSessionIdPorGrupo] = React.useState<
    Record<string, string>
  >({});
  // Divisões já hidratadas (guarda contra re-disparo do effect em re-render).
  const [gruposHidratados, setGruposHidratados] = React.useState<Set<string>>(
    () => new Set()
  );
  // `true` enquanto a hidratação do grupo ativo não resolveu — gate dos
  // controles para evitar a corrida "marca série antes de hidratar".
  const [hidratando, setHidratando] = React.useState(true);
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

  // Divisão-alvo da sessão (ou `undefined` para o balde sem divisão / eixo dia).
  // A retomada de sessão é por `(plan, division, student)`; o eixo DIA (legado)
  // nunca carimbou divisão, então sua sessão também é resolvida com `division`
  // ausente (o balde `null`).
  const divisaoAlvo: string | undefined = React.useMemo(() => {
    if (!porDivisao) return undefined;
    return divisaoSelecionada ?? undefined;
  }, [porDivisao, divisaoSelecionada]);

  // Chave do grupo ativo no mapa de sessões: a divisão-alvo ou o sentinela do
  // balde sem divisão (inclui o eixo dia legado, sempre `DIVISAO_SEM`).
  const grupoAtivoKey = divisaoAlvo ?? DIVISAO_SEM;

  // `sessionId` EFETIVO: o da divisão ativa (usado por garantirSessao/registrar/
  // concluir). Sem hidratação/criação ainda, é `null`.
  const sessionId = sessionIdPorGrupo[grupoAtivoKey] ?? null;

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

  // Descanso em MODAL: abre automaticamente ao concluir uma série (quando há
  // descanso prescrito e não é a última série do último exercício). Guardamos
  // os segundos capturados no momento da conclusão (não o do item navegado) e
  // um rótulo opcional "a seguir". `null` = modal fechado.
  const [descansoAberto, setDescansoAberto] = React.useState<{
    itemId: string;
    segundos: number;
    proximoRotulo: string | null;
  } | null>(null);

  // Fecha o modal de descanso (ao esgotar o tempo, pular, Esc ou overlay).
  function fecharDescanso() {
    setDescansoAberto(null);
  }

  // Reinicia o timer de descanso a cada série concluída: a key do
  // <TimerDescanso> combina este contador, forçando a remontagem (que zera e
  // auto-inicia) mesmo entre séries do MESMO exercício.
  const [descansoResetKey, setDescansoResetKey] = React.useState(0);

  // Ao navegar entre exercícios ou trocar de grupo (dia/divisão), fecha o
  // modal de descanso (ele reabre quando o aluno concluir uma série).
  React.useEffect(() => {
    setDescansoAberto(null);
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

  // --- HIDRATAÇÃO da sessão ABERTA a partir do banco (design §4.1–§4.3). ---
  // Dispara UMA vez por divisão visitada: quando `grupoAtivoKey` muda e ainda
  // não está em `gruposHidratados`, chama `carregarSessaoAberta` e reconstrói o
  // estado `series`/`indiceAtual`/`serieAtualPorItem` a partir dos logs. O
  // estado nunca mora em localStorage: recarga/navegação/reabertura re-resolvem
  // a mesma sessão aberta por `(plan, division, student)`.
  React.useEffect(() => {
    if (gruposHidratados.has(grupoAtivoKey)) {
      setHidratando(false);
      return;
    }

    let cancelado = false;
    setHidratando(true);

    (async () => {
      const r = await carregarSessaoAberta(
        planId,
        divisaoAlvo,
        studentId ?? undefined
      );
      if (cancelado) return;

      // Marca o grupo como hidratado independentemente do resultado (não
      // re-disparar). Erro/`data:null` apenas deixam os defaults da prescrição.
      setGruposHidratados((s) => new Set(s).add(grupoAtivoKey));

      if (r.ok && r.data) {
        const { sessionId: idAberta, logs: logsDaSessao } = r.data;

        // Só os logs CASADOS com itens prescritos visíveis hidratam: descarta
        // `plan_item_id === null` (item removido via on delete set null) e logs
        // de outra divisão / órfãos.
        const casados = logsDaSessao.filter(
          (log) =>
            log.plan_item_id !== null && idsVisiveis.has(log.plan_item_id)
        );

        setSessionIdPorGrupo((m) => ({ ...m, [grupoAtivoKey]: idAberta }));

        if (casados.length > 0) {
          // Merge no estado `series` SEM sobrescrever edição não confirmada
          // (série `salvando`). Como a hidratação roda uma vez por grupo com os
          // controles gated, não há edição pendente no primeiro merge; a guarda
          // é defesa contra re-hidratação acidental.
          setSeries((atual) => {
            const proximo = { ...atual };
            for (const log of casados) {
              const chave = chaveSerie(log.plan_item_id as string, log.set_number);
              const estadoAtual = proximo[chave];
              if (estadoAtual?.salvando) continue;
              const h = hidratarSerie(log);
              proximo[chave] = {
                reps: h.reps,
                carga: h.carga,
                completed: h.completed,
                salvando: false,
              };
            }
            return proximo;
          });

          // Posiciona a "série atual" de cada item e o `indiceAtual` no primeiro
          // exercício não concluído do grupo, usando a lógica pura.
          const porItem = seriesPorItem(casados);
          setSerieAtualPorItem((m) => {
            const proximo = { ...m };
            for (const item of itensVisiveis) {
              const logsDoItem = porItem.get(item.id) ?? [];
              if (logsDoItem.length > 0) {
                proximo[item.id] = serieAtualDeLogs(logsDoItem, item.sets);
              }
            }
            return proximo;
          });

          const primeiroNaoConcluido = itensVisiveis.findIndex(
            (item) => !exercicioConcluido(porItem.get(item.id) ?? [])
          );
          setIndiceAtual(
            primeiroNaoConcluido >= 0 ? primeiroNaoConcluido : 0
          );
        }
      }

      if (!cancelado) setHidratando(false);
    })();

    return () => {
      cancelado = true;
    };
    // `divisaoAlvo`/`planId`/`studentId` identificam a sessão; `grupoAtivoKey`
    // dispara por divisão. `itensVisiveis`/`idsVisiveis` são estáveis para um
    // mesmo grupo. `gruposHidratados` é lido como guarda (não re-dispara porque
    // o próprio effect o atualiza e sai cedo).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grupoAtivoKey, planId, divisaoAlvo, studentId]);

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
    const existente = sessionIdPorGrupo[grupoAtivoKey];
    if (existente) return existente;
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
        const idNovo = r.id;
        setSessionIdPorGrupo((m) => ({ ...m, [grupoAtivoKey]: idNovo }));
        return idNovo;
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
        const item = itens.find((it) => it.id === itemId);

        // Decide se abre o modal de descanso. Abre quando há descanso prescrito
        // E NÃO é a última série do último exercício visível (nesse caso não há
        // descanso — segue para o fluxo de finalizar/RPE já existente).
        const ehUltimaSerie = item ? setNumber === item.sets : false;
        const ehUltimoExercicio = indiceAtual >= itensVisiveis.length - 1;
        const temDescanso = (item?.descansoSegundos ?? 0) > 0;

        if (item && temDescanso && !(ehUltimaSerie && ehUltimoExercicio)) {
          // Rótulo opcional "a seguir": próxima série do mesmo exercício, ou o
          // nome do próximo exercício quando esta foi a última série dele.
          const proximoRotulo = ehUltimaSerie
            ? (itensVisiveis[indiceAtual + 1]?.nome ?? null)
            : `Série ${Math.min(setNumber + 1, item.sets)}`;
          // Reinicia o descanso a cada série concluída (remonta o TimerDescanso
          // via `key`) e abre o modal auto-iniciado.
          setDescansoResetKey((k) => k + 1);
          setDescansoAberto({
            itemId,
            segundos: item.descansoSegundos as number,
            proximoRotulo,
          });
        }

        // Avança para a próxima série (uma por vez); na última, permanece nela
        // — o botão "Próximo exercício" passa a realçar via exercicioConcluido.
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
      // Ambos os fluxos vão para a MESMA tela de resumo pós-treino da sessão,
      // variando só a rota por papel: o ALUNO (`studentId == null`) vai à rota
      // do aluno; o PROFESSOR (presencial) vai à rota-espelho do resumo dentro
      // do contexto do aluno-alvo. `destinoAoFinalizar` segue valendo para o
      // caso "concluir sem sessão criada" (nenhuma série marcada) tratado acima.
      if (studentId == null) {
        router.push(`/aluno/execucao/${planId}/resumo/${sessionId}`);
      } else {
        router.push(
          `/professor/alunos/${studentId}/execucao/${planId}/resumo/${sessionId}`
        );
      }
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
          se auto-esconde quando há ≤ 1 opção. No fluxo do ALUNO
          (`permitirTrocaDeGrupo={false}`) o seletor NÃO é renderizado — a rota
          já entrega só a divisão-alvo, mantendo o foco no treino em andamento. */}
      {permitirTrocaDeGrupo ? (
        porDivisao ? (
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
        )
      ) : null}

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
        <Card key={itemAtual.id} className="rounded-3xl">
          <CardHeader className="space-y-3 p-4 pb-0">
            {/* Topo: "Exercício i de n" centralizado + X de fechar à direita. */}
            <div className="flex items-center justify-between gap-2">
              <span className="w-11" aria-hidden="true" />
              <span
                className="text-sm font-semibold text-muted-foreground"
                aria-live="polite"
              >
                Exercício {indiceAtual + 1} de {itensVisiveis.length}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="min-h-11 min-w-11"
                aria-label="Sair da execução"
                onClick={() => router.push(destinoAoFinalizar)}
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </Button>
            </div>
            <CardTitle className="text-2xl font-black text-foreground">
              {itemAtual.nome}
            </CardTitle>
            {/* Prescrição em uma linha discreta. */}
            <p className="text-sm text-muted-foreground">
              {itemAtual.reps
                ? `${itemAtual.sets}×${itemAtual.reps}`
                : `${itemAtual.sets} séries`}
              {itemAtual.descansoSegundos !== null
                ? ` · Descanso ${itemAtual.descansoSegundos}s`
                : ''}
              {itemAtual.gruposMusculares.length > 0
                ? ` · ${itemAtual.gruposMusculares.join(', ')}`
                : ''}
            </p>
            {/* "Série k de sets" + dots de progresso do exercício atual. */}
            <div className="space-y-1.5">
              <span className="text-sm font-semibold text-foreground">
                Série {serieAtual} de {itemAtual.sets}
              </span>
              <div className="flex items-center gap-1.5" aria-hidden="true">
                {Array.from({ length: itemAtual.sets }, (_, i) => i + 1).map(
                  (n) => {
                    const concluida =
                      series[chaveSerie(itemAtual.id, n)]?.completed;
                    const atual = n === serieAtual;
                    return (
                      <span
                        key={n}
                        className={cn(
                          'h-2.5 w-2.5 rounded-full',
                          concluida
                            ? 'bg-primary'
                            : atual
                              ? 'border-2 border-primary'
                              : 'bg-muted'
                        )}
                      />
                    );
                  }
                )}
              </div>
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
                            disabled={hidratando}
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

            {/* Exatamente UMA série por vez (a série atual): dois cards grandes
                (Reps/Carga) com número gigante e steppers −/+. Os inputs mantêm
                os mesmos ids/labels e chamam o mesmo `atualizarCampo`. */}
            {(() => {
              const setNumber = serieAtual;
              const chave = chaveSerie(itemAtual.id, setNumber);
              const estado = series[chave];
              if (!estado) return null;

              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {/* Card REPS */}
                    <div className="space-y-3 rounded-3xl border border-border p-4">
                      <Label
                        htmlFor={`${chave}-reps`}
                        className="text-xs font-bold uppercase tracking-wide text-muted-foreground"
                      >
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
                        className="h-auto border-0 bg-transparent p-0 text-center text-4xl font-black tabular-nums focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                      <div className="flex items-center justify-between gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="min-h-11 min-w-11 rounded-full"
                          aria-label="Diminuir reps"
                          onClick={() =>
                            atualizarCampo(
                              chave,
                              'reps',
                              passoReps(estado.reps, -1)
                            )
                          }
                        >
                          <Minus className="h-4 w-4" aria-hidden="true" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="min-h-11 min-w-11 rounded-full"
                          aria-label="Aumentar reps"
                          onClick={() =>
                            atualizarCampo(
                              chave,
                              'reps',
                              passoReps(estado.reps, 1)
                            )
                          }
                        >
                          <Plus className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      </div>
                    </div>

                    {/* Card CARGA */}
                    <div className="space-y-3 rounded-3xl border border-border p-4">
                      <Label
                        htmlFor={`${chave}-carga`}
                        className="text-xs font-bold uppercase tracking-wide text-muted-foreground"
                      >
                        Carga (kg)
                      </Label>
                      <Input
                        id={`${chave}-carga`}
                        inputMode="decimal"
                        value={estado.carga}
                        onChange={(e) =>
                          atualizarCampo(chave, 'carga', e.target.value)
                        }
                        className="h-auto border-0 bg-transparent p-0 text-center text-4xl font-black tabular-nums focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                      <div className="flex items-center justify-between gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="min-h-11 min-w-11 rounded-full"
                          aria-label="Diminuir carga"
                          onClick={() =>
                            atualizarCampo(
                              chave,
                              'carga',
                              passoCarga(estado.carga, -2.5)
                            )
                          }
                        >
                          <Minus className="h-4 w-4" aria-hidden="true" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="min-h-11 min-w-11 rounded-full"
                          aria-label="Aumentar carga"
                          onClick={() =>
                            atualizarCampo(
                              chave,
                              'carga',
                              passoCarga(estado.carga, 2.5)
                            )
                          }
                        >
                          <Plus className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Botão principal da série. Concluída → MARCA D'ÁGUA:
                      `ghost` + opacity-50 + pointer-events-none + disabled, com
                      o estado comunicado por texto/ícone (não só por cor) e
                      `aria-pressed`/`aria-disabled` para acessibilidade. A
                      correção de série já registrada passa a ser só pelo lápis
                      no resumo. Não-concluída → ação primária (`default`). */}
                  <Button
                    type="button"
                    size="xl"
                    variant={estado.completed ? 'ghost' : 'default'}
                    className={cn(
                      'w-full',
                      estado.completed &&
                        'pointer-events-none border border-primary/40 bg-primary/5 text-primary opacity-50'
                    )}
                    aria-pressed={estado.completed}
                    aria-disabled={estado.completed || undefined}
                    disabled={
                      estado.completed ||
                      estado.salvando ||
                      iniciando ||
                      hidratando
                    }
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
                </div>
              );
            })()}

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

      {/* Avaliação do treino (RPE + notas) no padrão do app. Mesma persistência
          via `finalizarSessao` — o dialog só chama `concluir()`. */}
      <DialogAvaliacaoTreino
        seriesFeitas={progresso.feitas}
        seriesTotal={progresso.total}
        tudoFeito={tudoFeito}
        intensidade={intensidade}
        onIntensidadeChange={setIntensidade}
        nota={nota}
        onNotaChange={setNota}
        onConfirmar={concluir}
        finalizando={finalizando}
        disabledTrigger={pendente}
      />

      {/* Descanso entre séries em MODAL: abre automaticamente ao concluir uma
          série (quando há descanso e não é a última série do último exercício).
          Fecha ao esgotar o tempo, ao pular, por Esc ou clique no overlay — e
          volta o fluxo para a próxima série/exercício exatamente como antes. O
          foco preso/retorno e `aria-modal` vêm do Radix Dialog. */}
      <Dialog
        open={descansoAberto !== null}
        onOpenChange={(aberto) => {
          if (!aberto) fecharDescanso();
        }}
      >
        <DialogContent className="max-w-sm gap-6 rounded-3xl text-center">
          <DialogHeader className="items-center">
            <DialogTitle>Descanso</DialogTitle>
            {descansoAberto?.proximoRotulo ? (
              <DialogDescription>
                A seguir · {descansoAberto.proximoRotulo}
              </DialogDescription>
            ) : (
              <DialogDescription className="sr-only">
                Timer de descanso entre séries
              </DialogDescription>
            )}
          </DialogHeader>
          {descansoAberto ? (
            <TimerDescanso
              key={`${descansoAberto.itemId}:${descansoResetKey}`}
              segundos={descansoAberto.segundos}
              autoIniciar
              onConcluir={fecharDescanso}
              onPular={fecharDescanso}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
