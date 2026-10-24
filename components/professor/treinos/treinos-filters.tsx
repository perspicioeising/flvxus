'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * Barra de busca de fichas (por nome da ficha OU nome do aluno). Escreve o
 * estado na URL (`searchParams`) para que a listagem RSC releia e refaça a
 * consulta server-side. Aplica no submit do form (Enter), SEM debounce, e
 * reinicia a paginação (`page=1`) a cada busca.
 */
export function TreinosFilters({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = React.useState(initialQuery);

  const aplicar = React.useCallback(
    (next: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (next.trim()) params.set('q', next.trim());
      else params.delete('q');
      params.delete('page');

      router.push(`/professor/treinos?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        aplicar(query);
      }}
    >
      <Label htmlFor="busca-treino" className="mb-1.5 block">
        Buscar treino ou aluno
      </Label>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          id="busca-treino"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Nome da ficha ou do aluno"
          className="pl-9"
        />
      </div>
    </form>
  );
}
