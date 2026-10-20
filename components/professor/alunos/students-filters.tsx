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
import { STATUS_LABEL } from './labels';

/** Opção "todos" do filtro de status (não é um status do banco). */
const TODOS = 'all';

const STATUS_OPCOES: { valor: string; label: string }[] = [
  { valor: TODOS, label: 'Todos os status' },
  { valor: 'active', label: STATUS_LABEL.active },
  { valor: 'inactive', label: STATUS_LABEL.inactive },
  { valor: 'pending', label: STATUS_LABEL.pending },
  { valor: 'archived', label: STATUS_LABEL.archived },
];

/**
 * Barra de busca + filtro por status. Escreve o estado na URL (`searchParams`)
 * para que a listagem RSC releia e refaça a consulta server-side. Reinicia a
 * paginação (`page=1`) a cada mudança de filtro.
 */
export function StudentsFilters({
  initialQuery,
  initialStatus,
}: {
  initialQuery: string;
  initialStatus: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = React.useState(initialQuery);

  const aplicar = React.useCallback(
    (next: { q?: string; status?: string }) => {
      const params = new URLSearchParams(searchParams.toString());

      if (next.q !== undefined) {
        if (next.q.trim()) params.set('q', next.q.trim());
        else params.delete('q');
      }
      if (next.status !== undefined) {
        if (next.status && next.status !== TODOS) params.set('status', next.status);
        else params.delete('status');
      }
      params.delete('page');

      router.push(`/professor/alunos?${params.toString()}`);
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
        <Label htmlFor="busca-aluno" className="mb-1.5 block">
          Buscar aluno
        </Label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="busca-aluno"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nome ou e-mail"
            className="pl-9"
          />
        </div>
      </form>

      <div className="sm:w-56">
        <Label htmlFor="filtro-status" className="mb-1.5 block">
          Status
        </Label>
        <Select
          value={initialStatus || TODOS}
          onValueChange={(valor) => aplicar({ status: valor })}
        >
          <SelectTrigger id="filtro-status">
            <SelectValue placeholder="Todos os status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPCOES.map((opcao) => (
              <SelectItem key={opcao.valor} value={opcao.valor}>
                {opcao.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
