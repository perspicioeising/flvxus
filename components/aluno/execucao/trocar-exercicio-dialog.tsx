'use client';

import * as React from 'react';
import { Repeat, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ExercicioDisponivel } from '@/components/professor/treinos/exercise-picker';

/** Valor do Select quando nenhum grupo muscular está selecionado. */
const GRUPO_TODOS = 'todos';

/**
 * Diálogo acessível para TROCAR o exercício atual por um alternativo DURANTE a
 * execução (máquina ocupada — FEAT-002). Espelha o `ExercisePicker` do professor
 * (Dialog + busca + filtro por grupo), mas com SELEÇÃO ÚNICA: escolher um item
 * chama `onTrocar` e fecha de imediato (não acumula checkbox). A troca é ad-hoc
 * (vive só na sessão corrente, não altera a ficha); este componente só emite a
 * escolha — a sessão decide o que fazer com ela.
 *
 * Abre pré-filtrando pelo grupo muscular do exercício atual (`grupoAtual`), para
 * sugerir substitutos do mesmo grupo primeiro; o aluno pode limpar o filtro.
 * O exercício atual (`exercicioAtualId`) é marcado como "atual" e não trocável
 * por si mesmo (não aparece como opção de troca).
 */
export function TrocarExercicioDialog({
  exercicios,
  grupoAtual,
  exercicioAtualId,
  onTrocar,
}: {
  exercicios: ExercicioDisponivel[];
  grupoAtual?: string;
  exercicioAtualId?: string;
  onTrocar: (exercicio: ExercicioDisponivel) => void;
}) {
  const [aberto, setAberto] = React.useState(false);
  const [busca, setBusca] = React.useState('');
  const [grupo, setGrupo] = React.useState(GRUPO_TODOS);

  // União ordenada dos grupos musculares presentes no catálogo recebido.
  const grupos = React.useMemo(() => {
    const todos = new Set<string>();
    for (const e of exercicios) {
      for (const g of e.muscle_groups ?? []) todos.add(g);
    }
    return Array.from(todos).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [exercicios]);

  // Ao abrir, pré-filtra pelo grupo do exercício atual (se existir no catálogo);
  // senão cai em "todos". Resetamos busca/filtro a cada abertura para começar
  // limpo. Depende de `aberto` para rodar só na transição fechado → aberto.
  React.useEffect(() => {
    if (!aberto) return;
    setBusca('');
    setGrupo(grupoAtual && grupos.includes(grupoAtual) ? grupoAtual : GRUPO_TODOS);
  }, [aberto, grupoAtual, grupos]);

  const filtrados = React.useMemo(() => {
    const q = busca.trim().toLowerCase();
    return exercicios.filter((e) => {
      // O próprio exercício atual nunca é opção de troca.
      if (exercicioAtualId && e.id === exercicioAtualId) return false;
      const casaNome = !q || e.name.toLowerCase().includes(q);
      const casaGrupo =
        grupo === GRUPO_TODOS || (e.muscle_groups ?? []).includes(grupo);
      return casaNome && casaGrupo;
    });
  }, [busca, grupo, exercicios, exercicioAtualId]);

  function escolher(exercicio: ExercicioDisponivel) {
    onTrocar(exercicio);
    setAberto(false);
  }

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="min-h-11"
        >
          <Repeat className="mr-2 h-4 w-4" aria-hidden="true" />
          Trocar exercício
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Trocar exercício</DialogTitle>
          <DialogDescription>
            Máquina ocupada? Escolha um exercício alternativo para esta sessão. As
            séries, reps, carga e descanso continuam os mesmos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <Label htmlFor="busca-trocar-exercicio" className="sr-only">
                Buscar exercício
              </Label>
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="busca-trocar-exercicio"
                  type="search"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Nome do exercício"
                  className="pl-9"
                  autoFocus
                />
              </div>
            </div>

            {grupos.length > 0 ? (
              <div className="sm:w-48">
                <Label htmlFor="grupo-trocar-exercicio" className="sr-only">
                  Filtrar por grupo muscular
                </Label>
                <Select value={grupo} onValueChange={setGrupo}>
                  <SelectTrigger id="grupo-trocar-exercicio">
                    <SelectValue placeholder="Grupo muscular" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={GRUPO_TODOS}>Todos os grupos</SelectItem>
                    {grupos.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}
          </div>

          {filtrados.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nenhum exercício encontrado. Ajuste a busca ou o filtro de grupo.
            </p>
          ) : (
            <ScrollArea className="h-72 pr-3">
              <ul className="space-y-2" aria-label="Exercícios para troca">
                {filtrados.map((exercicio) => (
                  <li key={exercicio.id}>
                    <button
                      type="button"
                      onClick={() => escolher(exercicio)}
                      className="flex min-h-11 w-full items-center gap-3 rounded-xl border border-border p-3 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium text-foreground">
                          {exercicio.name}
                        </span>
                        <span className="mt-1 flex flex-wrap gap-1">
                          {(exercicio.muscle_groups ?? []).slice(0, 3).map((g) => (
                            <Badge key={g} variant="secondary" className="font-normal">
                              {g}
                            </Badge>
                          ))}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
