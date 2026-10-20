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
import { PROTOCOLOS } from '@/schemas/avaliacao';
import { PROTOCOLO_LABEL } from './labels';

const TODOS = 'all';

/**
 * Busca por nome/e-mail do aluno + filtro por protocolo. Escreve na URL para o
 * RSC reconsultar server-side; reinicia a paginação a cada mudança.
 */
export function AvaliacoesFilters({
  initialQuery,
  initialProtocol,
}: {
  initialQuery: string;
  initialProtocol: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = React.useState(initialQuery);

  const aplicar = React.useCallback(
    (next: { q?: string; protocol?: string }) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next.q !== undefined) {
        if (next.q.trim()) params.set('q', next.q.trim());
        else params.delete('q');
      }
      if (next.protocol !== undefined) {
        if (next.protocol && next.protocol !== TODOS) params.set('protocol', next.protocol);
        else params.delete('protocol');
      }
      params.delete('page');
      router.push(`/professor/avaliacoes?${params.toString()}`);
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
        <Label htmlFor="busca-avaliacao" className="mb-1.5 block">
          Buscar por aluno
        </Label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="busca-avaliacao"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nome ou e-mail do aluno"
            className="pl-9"
          />
        </div>
      </form>

      <div className="sm:w-60">
        <Label htmlFor="filtro-protocolo" className="mb-1.5 block">
          Protocolo
        </Label>
        <Select
          value={initialProtocol || TODOS}
          onValueChange={(valor) => aplicar({ protocol: valor })}
        >
          <SelectTrigger id="filtro-protocolo">
            <SelectValue placeholder="Todos os protocolos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TODOS}>Todos os protocolos</SelectItem>
            {PROTOCOLOS.map((p) => (
              <SelectItem key={p} value={p}>
                {PROTOCOLO_LABEL[p]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
