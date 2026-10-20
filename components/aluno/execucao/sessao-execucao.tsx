'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Check, Flag, Loader2 } from 'lucide-react';

import { progressoSessao, type SerieLog } from '@/lib/treino/progresso';
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
import { TimerDescanso } from './timer-descanso';

/** Item prescrito do dia, com o que a UI de execução precisa. */
export interface ItemExecucao {
  id: string;
  nome: string;
  sets: number;
  reps: string | null;
  cargaAlvo: number | null;
  descansoSegundos: number | null;
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
}: {
  planId: string;
  itens: ItemExecucao[];
}) {
  const router = useRouter();
  const [sessionId, setSessionId] = React.useState<string | null>(null);
  const [iniciando, setIniciando] = React.useState(false);
  const [finalizando, setFinalizando] = React.useState(false);
  const [nota, setNota] = React.useState('');
  const [pendente, startTransition] = React.useTransition();

  // Estado inicial: uma série por set prescrito, com os defaults da prescrição.
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

  // Progresso global reaproveitando a lógica pura compartilhada.
  const logs: SerieLog[] = React.useMemo(
    () =>
      Object.entries(series).map(([chave, estado]) => {
        const [plan_item_id, setStr] = chave.split(':');
        return {
          plan_item_id,
          set_number: Number(setStr),
          completed: estado.completed,
          reps_done: estado.reps === '' ? null : Number(estado.reps),
          load_done: estado.carga === '' ? null : Number(estado.carga.replace(',', '.')),
        };
      }),
    [series]
  );
  const progresso = progressoSessao(logs);
  const tudoFeito = progresso.total > 0 && progresso.feitas === progresso.total;

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

      setSeries((atual) => ({
        ...atual,
        [chave]: {
          ...atual[chave],
          completed: r.ok ? novoCompleted : atual[chave].completed,
          salvando: false,
        },
      }));

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

      {itens.map((item) => (
        <Card key={item.id}>
          <CardHeader className="p-4 pb-0">
            <CardTitle className="flex items-center justify-between gap-2 text-base">
              <span>{item.nome}</span>
              {item.reps ? (
                <Badge variant="secondary" className="shrink-0">
                  {item.sets} × {item.reps}
                </Badge>
              ) : null}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-4">
            <ul className="space-y-3">
              {Array.from({ length: item.sets }).map((_, index) => {
                const setNumber = index + 1;
                const chave = chaveSerie(item.id, setNumber);
                const estado = series[chave];
                if (!estado) return null;

                return (
                  <li
                    key={chave}
                    className={cn(
                      'flex flex-wrap items-end gap-3 rounded-lg border p-3',
                      estado.completed
                        ? 'border-primary/40 bg-primary/5'
                        : 'border-border'
                    )}
                  >
                    <span className="self-center text-sm font-medium text-muted-foreground">
                      Série {setNumber}
                    </span>

                    <div className="w-20 space-y-1">
                      <Label htmlFor={`${chave}-reps`} className="text-xs">
                        Reps
                      </Label>
                      <Input
                        id={`${chave}-reps`}
                        inputMode="numeric"
                        value={estado.reps}
                        onChange={(e) => atualizarCampo(chave, 'reps', e.target.value)}
                        className="h-11"
                      />
                    </div>

                    <div className="w-24 space-y-1">
                      <Label htmlFor={`${chave}-carga`} className="text-xs">
                        Carga (kg)
                      </Label>
                      <Input
                        id={`${chave}-carga`}
                        inputMode="decimal"
                        value={estado.carga}
                        onChange={(e) => atualizarCampo(chave, 'carga', e.target.value)}
                        className="h-11"
                      />
                    </div>

                    <Button
                      type="button"
                      variant={estado.completed ? 'default' : 'outline'}
                      className="ml-auto min-h-11 min-w-11"
                      aria-pressed={estado.completed}
                      disabled={estado.salvando || iniciando}
                      onClick={() => alternarSerie(item.id, setNumber)}
                    >
                      {estado.salvando ? (
                        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                      ) : (
                        <Check className="h-5 w-5" aria-hidden="true" />
                      )}
                      {estado.completed ? 'Feita' : 'Marcar'}
                    </Button>
                  </li>
                );
              })}
            </ul>

            {item.descansoSegundos ? (
              <TimerDescanso segundos={item.descansoSegundos} />
            ) : null}
          </CardContent>
        </Card>
      ))}

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
