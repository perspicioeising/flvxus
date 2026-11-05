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
 * Agrupa os modelos da página atual por plano (prefixo do nome). A busca e a
 * paginação são server-side (estado na URL), lidas no RSC pai — aqui só
 * organizamos a exibição da janela recebida, preservando a ordem (mais recente
 * primeiro) dentro de cada grupo.
 */
function agruparPorPlano(modelos: ModeloCardData[]): GrupoModelos[] {
  const porPlano = new Map<string, ModeloCardData[]>();
  for (const m of modelos) {
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
}

/**
 * Lista dos MODELOS de treino da página atual, agrupados por plano. Os dados
 * (já filtrados/paginados/ordenados) vêm do RSC pai.
 */
export function ListaModelos({ modelos }: { modelos: ModeloCardData[] }) {
  const grupos = agruparPorPlano(modelos);

  return (
    <div className="space-y-6">
      {grupos.map((grupo) => (
        <section key={grupo.plano} className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground">{grupo.plano}</h2>
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
  );
}
