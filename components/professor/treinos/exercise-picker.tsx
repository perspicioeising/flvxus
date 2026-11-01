'use client';

import * as React from 'react';
import { Plus, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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

/** Valor do Select quando nenhum grupo muscular está selecionado. */
const GRUPO_TODOS = 'todos';

/** Exercício disponível para prescrição (subconjunto de `exercises`). */
export interface ExercicioDisponivel {
  id: string;
  name: string;
  muscle_groups: string[];
}

/**
 * Diálogo acessível para escolher exercícios da biblioteca e adicioná-los ao
 * treino em LOTE. A lista é passada pelo servidor (RLS entrega catálogo global
 * + do tenant). Busca por nome e filtro por grupo no cliente. A seleção
 * acumula (checkbox) e PERSISTE ao mudar busca/filtro; ao confirmar, todos os
 * exercícios marcados são adicionados na ordem da lista filtrada exibida.
 */
export function ExercisePicker({
  exercicios,
  onAdicionar,
}: {
  exercicios: ExercicioDisponivel[];
  onAdicionar: (exercicios: ExercicioDisponivel[]) => void;
}) {
  const [aberto, setAberto] = React.useState(false);
  const [busca, setBusca] = React.useState('');
  const [grupo, setGrupo] = React.useState(GRUPO_TODOS);
  // Ids marcados; persiste ao mudar busca/filtro (não limpa ao filtrar).
  const [selecionados, setSelecionados] = React.useState<Set<string>>(
    () => new Set()
  );

  // União ordenada dos grupos musculares presentes no catálogo recebido.
  const grupos = React.useMemo(() => {
    const todos = new Set<string>();
    for (const e of exercicios) {
      for (const g of e.muscle_groups ?? []) todos.add(g);
    }
    return Array.from(todos).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [exercicios]);

  const filtrados = React.useMemo(() => {
    const q = busca.trim().toLowerCase();
    return exercicios.filter((e) => {
      const casaNome = !q || e.name.toLowerCase().includes(q);
      const casaGrupo = grupo === GRUPO_TODOS || (e.muscle_groups ?? []).includes(grupo);
      return casaNome && casaGrupo;
    });
  }, [busca, grupo, exercicios]);

  function alternar(id: string) {
    setSelecionados((atual) => {
      const proximo = new Set(atual);
      if (proximo.has(id)) proximo.delete(id);
      else proximo.add(id);
      return proximo;
    });
  }

  function resetar() {
    setBusca('');
    setGrupo(GRUPO_TODOS);
    setSelecionados(new Set());
  }

  function confirmar() {
    // Adiciona na ordem da lista FILTRADA exibida.
    const escolhidos = filtrados.filter((e) => selecionados.has(e.id));
    if (escolhidos.length === 0) return;
    onAdicionar(escolhidos);
    setAberto(false);
    resetar();
  }

  const total = selecionados.size;

  return (
    <Dialog
      open={aberto}
      onOpenChange={(proximo) => {
        setAberto(proximo);
        if (!proximo) resetar();
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" variant="outline" className="min-h-11 w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
          Adicionar exercício
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Adicionar exercícios</DialogTitle>
          <DialogDescription>
            Marque os exercícios da sua biblioteca para incluir no treino de uma vez.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <Label htmlFor="busca-exercicio-picker" className="sr-only">
                Buscar exercício
              </Label>
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="busca-exercicio-picker"
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
                <Label htmlFor="grupo-exercicio-picker" className="sr-only">
                  Filtrar por grupo muscular
                </Label>
                <Select value={grupo} onValueChange={setGrupo}>
                  <SelectTrigger id="grupo-exercicio-picker">
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
              Nenhum exercício encontrado. Cadastre exercícios na biblioteca primeiro.
            </p>
          ) : (
            <ScrollArea className="h-72 pr-3">
              <ul className="space-y-2">
                {filtrados.map((exercicio) => {
                  const checkboxId = `exercicio-picker-${exercicio.id}`;
                  const marcado = selecionados.has(exercicio.id);
                  return (
                    <li key={exercicio.id}>
                      <Label
                        htmlFor={checkboxId}
                        className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-xl border border-border p-3 font-normal transition-colors hover:bg-accent focus-within:ring-2 focus-within:ring-ring"
                      >
                        <Checkbox
                          id={checkboxId}
                          checked={marcado}
                          onCheckedChange={() => alternar(exercicio.id)}
                        />
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
                      </Label>
                    </li>
                  );
                })}
              </ul>
            </ScrollArea>
          )}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {total} selecionado{total === 1 ? '' : 's'}
          </p>
          <Button
            type="button"
            className="min-h-11 w-full sm:w-auto"
            disabled={total === 0}
            onClick={confirmar}
          >
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            Adicionar {total} exercício{total === 1 ? '' : 's'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
