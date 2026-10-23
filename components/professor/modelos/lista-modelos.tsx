'use client';

import * as React from 'react';
import { Search } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ModeloCard, type ModeloCardData } from '@/components/professor/treinos/modelo-card';

/** Nome do grupo para modelos sem o separador " — " no nome. */
const GRUPO_OUTROS = 'Outros';

/**
 * Deriva o "plano" de um modelo pelo prefixo do nome antes do primeiro " — "
 * (ex.: "Men's Physique — A (Costas)" → "Men's Physique"). Sem o separador,
 * o modelo cai no grupo "Outros".
 */
function planoDoModelo(name: string): string {
  const idx = name.indexOf(' — ');
  if (idx === -1) return GRUPO_OUTROS;
  const plano = name.slice(0, idx).trim();
  return plano || GRUPO_OUTROS;
}

/** Grupo de modelos exibido como seção na listagem. */
interface GrupoModelos {
  plano: string;
  modelos: ModeloCardData[];
}

/**
 * Lista client-side dos MODELOS de treino com busca por nome (substring
 * case-insensitive) e agrupamento por plano. Os dados vêm do RSC pai; aqui só
 * filtramos/organizamos a exibição, preservando o link de edição de cada card.
 */
export function ListaModelos({ modelos }: { modelos: ModeloCardData[] }) {
  const [busca, setBusca] = React.useState('');

  const grupos = React.useMemo<GrupoModelos[]>(() => {
    const q = busca.trim().toLowerCase();
    const filtrados = q
      ? modelos.filter((m) => m.name.toLowerCase().includes(q))
      : modelos;

    const porPlano = new Map<string, ModeloCardData[]>();
    for (const m of filtrados) {
      const plano = planoDoModelo(m.name);
      const lista = porPlano.get(plano);
      if (lista) lista.push(m);
      else porPlano.set(plano, [m]);
    }

    return Array.from(porPlano.entries())
      .sort(([a], [b]) => {
        // "Outros" sempre por último; o resto em ordem alfabética.
        if (a === GRUPO_OUTROS) return 1;
        if (b === GRUPO_OUTROS) return -1;
        return a.localeCompare(b, 'pt-BR');
      })
      .map(([plano, lista]) => ({ plano, modelos: lista }));
  }, [busca, modelos]);

  const totalFiltrado = grupos.reduce((acc, g) => acc + g.modelos.length, 0);

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="busca-modelos" className="sr-only">
          Buscar modelo por nome
        </Label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="busca-modelos"
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar modelo pelo nome"
            className="pl-9"
          />
        </div>
      </div>

      {totalFiltrado === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Nenhum modelo encontrado para “{busca.trim()}”.
        </p>
      ) : (
        <div className="space-y-6">
          {grupos.map((grupo) => (
            <section key={grupo.plano} className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground">
                {grupo.plano}
              </h2>
              <ul className="space-y-3">
                {grupo.modelos.map((modelo) => (
                  <li key={modelo.id}>
                    <ModeloCard modelo={modelo} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
