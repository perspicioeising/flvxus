'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Check, ChevronLeft, ChevronRight, Flag, Loader2 } from 'lucide-react';

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
import { TimerDescanso } from './timer-descanso';
import { ExercicioInfo } from './exercicio-info';
import { SeletorDia, type OpcaoDia } from './seletor-dia';

/** Item prescrito, com tudo que a UI de execução precisa exibir. */
export interface ItemExecucao {
  id: string;
  nome: string;
  /** Dia da semana (0..6) ou `null` (sem dia definido) deste item. */
  weekday: number | null;
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
 */
export function SessaoExecucao({
  planId,
  itens,
  diaInicial = null,
}: {
  planId: string;
  itens: ItemExecucao[];
  /**
   * Dia (0..6) em que o seletor deve abrir — ex.: deep-link `?dia=N` a partir
   * da ficha. Só é respeitado se houver itens nesse dia; senão cai no primeiro
   * dia com exercícios. `null` = sem preferência.
   */
  diaInicial?: number | null;
}) {
  const router = useRouter();
  const [sessionId, setSessionId] = React.useState<string | null>(null);
  const [iniciando, setIniciando] = React.useState(false);
  const [finalizando, setFinalizando] = React.useState(false);
  const [nota, setNota] = React.useState('');
  const [pendente, startTransition] = React.useTransition();

  // Dias com itens (só os que têm exercícios; inclui o balde "Sem dia definido").
  const grupos = React.useMemo(
    () => agruparPorDia(itens, (item) => item.weekday),
    [itens]
  );
  const opcoes: OpcaoDia[] = React.useMemo(
    () =>
      grupos.map((g) => ({
        weekday: g.weekday,
        rotulo: g.rotulo,
        total: g.itens.length,
      })),
    [grupos]
  );

  // Dia escolhido: se o deep-link (`diaInicial`) aponta um dia que tem itens,
  // abre nele; senão, começa no primeiro grupo com itens (nunca força o dia de
  // hoje). A troca de dia continua livre pelo seletor.
  const [diaSelecionado, setDiaSelecionado] = React.useState<number | null>(
    () =>
      diaInicial !== null && grupos.some((g) => g.weekday === diaInicial)
        ? diaInicial
        : grupos[0]?.weekday ?? null
  );

  // Itens do dia atualmente selecionado (ou todos, se não houver seletor).
  const itensVisiveis = React.useMemo(() => {
    const grupo = grupos.find((g) => g.weekday === diaSelecionado);
    return grupo ? grupo.itens : (grupos[0]?.itens ?? []);
  }, [grupos, diaSelecionado]);

  // Fluxo guiado: um exercício por vez. `indiceAtual` navega dentro do dia.
  const [indiceAtual, setIndiceAtual] = React.useState(0);

  // Ao trocar de dia, volta ao primeiro exercício.
  React.useEffect(() => {
    setIndiceAtual(0);
  }, [diaSelecionado]);

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

  // Ao navegar entre exercícios ou trocar de dia, esconde o descanso acoplado
  // (ele volta a aparecer quando o aluno concluir uma série do novo item).
  React.useEffect(() => {
    setDescansoAtivoItemId(null);
  }, [indiceAtual, diaSelecionado]);

  // Estado inicial: uma série por set prescrito de TODOS os itens da ficha, com
  // os defaults da prescrição. Guardamos todos para preservar o que o aluno já
  // marcou ao alternar entre dias; a UI mostra só os itens do dia selecionado.
  const [series, setSeries] = React.useState<Record<string, EstadoSerie>>(() => {
    const inicial: Record<string, EstadoSerie> = {};
    for (const item of itens) {
      for (let n = 1; n <= item.sets; n += 1) {
        inicial[chaveSerie(item.id, n)] = {
          reps: item.reps ?? '',
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

  /** Garante uma sessão criada; retorna o id ou null se falhar. */
  async function garantirSessao(): Promise<string | null> {
    if (sessionId) return sessionId;
    setIniciando(true);
    try {
      const r = await iniciarSessao(planId);
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
            const defaultReps = item.reps ?? '';
            const defaultCarga =
              item.cargaAlvo !== null ? String(item.cargaAlvo) : '';
            if (
              proximaSerie.reps === defaultReps &&
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
      }

      if (!r.ok) {
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
      router.push('/aluno/treinos');
      return;
    }
    setFinalizando(true);
    const r = await finalizarSessao({
      session_id: sessionId,
      notes: nota.trim() === '' ? undefined : nota.trim(),
    });
    setFinalizando(false);

    if (r.ok) {
      toast({ title: 'Treino finalizado. Bom trabalho!' });
      router.push('/aluno/treinos');
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
      {/* Seletor de dia/divisão: só aparece quando há mais de um dia com itens. */}
      <SeletorDia
        opcoes={opcoes}
        selecionado={diaSelecionado}
        onSelecionar={setDiaSelecionado}
      />

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

            <ul className="space-y-3">
              {Array.from({ length: itemAtual.sets }).map((_, index) => {
                const setNumber = index + 1;
                const chave = chaveSerie(itemAtual.id, setNumber);
                const estado = series[chave];
                if (!estado) return null;

                return (
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
                        Série {setNumber}
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
                );
              })}
            </ul>

            {/* Descanso acoplado: só aparece após concluir uma série deste
                exercício e quando há descanso prescrito; auto-inicia. */}
            {itemAtual.descansoSegundos &&
            descansoAtivoItemId === itemAtual.id ? (
              <TimerDescanso
                key={itemAtual.id}
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
