'use client';

import * as React from 'react';
import { Plus, Search } from 'lucide-react';

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

/** Valor do Select quando nenhum grupo muscular está selecionado. */
const GRUPO_TODOS = 'todos';

/** Exercício disponível para prescrição (subconjunto de `exercises`). */
export interface ExercicioDisponivel {
  id: string;
  name: string;
  muscle_groups: string[];
}

/**
 * Diálogo acessível para escolher um exercício da biblioteca e adicioná-lo ao
 * treino. A lista é passada pelo servidor (RLS entrega catálogo global + do
 * tenant). Busca por nome no cliente. Fecha ao selecionar.
 */
export function ExercisePicker({
  exercicios,
  onSelecionar,
}: {
  exercicios: ExercicioDisponivel[];
  onSelecionar: (exercicio: ExercicioDisponivel) => void;
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

  const filtrados = React.useMemo(() => {
    const q = busca.trim().toLowerCase();
    return exercicios.filter((e) => {
      const casaNome = !q || e.name.toLowerCase().includes(q);
      const casaGrupo = grupo === GRUPO_TODOS || (e.muscle_groups ?? []).includes(grupo);
      return casaNome && casaGrupo;
    });
  }, [busca, grupo, exercicios]);

  function selecionar(exercicio: ExercicioDisponivel) {
    onSelecionar(exercicio);
    setAberto(false);
    setBusca('');
    setGrupo(GRUPO_TODOS);
  }

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" className="min-h-11 w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
          Adicionar exercício
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Adicionar exercício</DialogTitle>
          <DialogDescription>
            Escolha um exercício da sua biblioteca para incluir no treino.
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
                {filtrados.map((exercicio) => (
                  <li key={exercicio.id}>
                    <button
                      type="button"
                      onClick={() => selecionar(exercicio)}
                      className="flex w-full items-center justify-between gap-3 rounded-xl border border-border p-3 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                      <Plus className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
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
