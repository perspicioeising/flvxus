'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  EQUIPAMENTOS,
  GRUPOS_MUSCULARES,
  TODOS_EQUIPAMENTOS,
  TODOS_GRUPOS,
} from './labels';

/**
 * Busca por nome + filtros por grupo muscular e equipamento. Escreve o estado
 * na URL (`searchParams`) para a listagem RSC reler e refazer a consulta
 * server-side. Reinicia a paginação (`page`) a cada mudança de filtro.
 */
export function ExerciseFilters({
  initialQuery,
  initialMuscleGroup,
  initialEquipment,
}: {
  initialQuery: string;
  initialMuscleGroup: string;
  initialEquipment: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = React.useState(initialQuery);

  const aplicar = React.useCallback(
    (next: { q?: string; muscle_group?: string; equipment?: string }) => {
      const params = new URLSearchParams(searchParams.toString());

      if (next.q !== undefined) {
        if (next.q.trim()) params.set('q', next.q.trim());
        else params.delete('q');
      }
      if (next.muscle_group !== undefined) {
        if (next.muscle_group && next.muscle_group !== TODOS_GRUPOS)
          params.set('muscle_group', next.muscle_group);
        else params.delete('muscle_group');
      }
      if (next.equipment !== undefined) {
        if (next.equipment && next.equipment !== TODOS_EQUIPAMENTOS)
          params.set('equipment', next.equipment);
        else params.delete('equipment');
      }
      params.delete('page');

      router.push(`/professor/exercicios?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <form
        className="flex-1"
        onSubmit={(e) => {
          e.preventDefault();
          aplicar({ q: query });
        }}
      >
        <Label htmlFor="busca-exercicio" className="mb-1.5 block">
          Buscar exercício
        </Label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="busca-exercicio"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nome do exercício"
            className="pl-9"
          />
        </div>
      </form>

      <div className="sm:w-48">
        <Label htmlFor="filtro-grupo" className="mb-1.5 block">
          Grupo muscular
        </Label>
        <Select
          value={initialMuscleGroup || TODOS_GRUPOS}
          onValueChange={(valor) => aplicar({ muscle_group: valor })}
        >
          <SelectTrigger id="filtro-grupo">
            <SelectValue placeholder="Todos os grupos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TODOS_GRUPOS}>Todos os grupos</SelectItem>
            {GRUPOS_MUSCULARES.map((grupo) => (
              <SelectItem key={grupo} value={grupo}>
                {grupo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="sm:w-48">
        <Label htmlFor="filtro-equipamento" className="mb-1.5 block">
          Equipamento
        </Label>
        <Select
          value={initialEquipment || TODOS_EQUIPAMENTOS}
          onValueChange={(valor) => aplicar({ equipment: valor })}
        >
          <SelectTrigger id="filtro-equipamento">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TODOS_EQUIPAMENTOS}>Todos</SelectItem>
            {EQUIPAMENTOS.map((equip) => (
              <SelectItem key={equip} value={equip}>
                {equip}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
