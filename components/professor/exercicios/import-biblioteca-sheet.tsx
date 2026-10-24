'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Library, Loader2, Search } from 'lucide-react';
import { toast, Toaster as SonnerToaster } from 'sonner';

import { importarExercicios } from '@/actions/exercicios';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  EQUIPAMENTOS,
  GRUPOS_MUSCULARES,
  TODOS_EQUIPAMENTOS,
  TODOS_GRUPOS,
} from './labels';

/** Teto de itens marcados de uma vez pelo "selecionar todos". */
const LIMITE_SELECAO_EM_LOTE = 200;

/** Aviso exibido quando o "selecionar todos" ultrapassa o limite de 200. */
const AVISO_LIMITE =
  'Selecionados os 200 primeiros (em ordem alfabética). Refine os filtros para importar o restante.';

/** Item do catálogo global devolvido pelo Route Handler (modo lista). */
interface ItemBiblioteca {
  id: string;
  name: string;
  muscle_groups: string[];
  equipment: string[];
  thumbnail_url: string | null;
}

interface RespostaLista {
  itens: ItemBiblioteca[];
  total: number;
  page: number;
  pageSize: number;
}

interface RespostaIds {
  ids: string[];
  truncado: boolean;
}

/** Monta a query string a partir dos filtros atuais (omitindo vazios). */
function montarParams(filtros: {
  q: string;
  muscleGroup: string;
  equipment: string;
  page?: number;
  idsOnly?: boolean;
}): string {
  const params = new URLSearchParams();
  if (filtros.q) params.set('q', filtros.q);
  if (filtros.muscleGroup) params.set('muscle_group', filtros.muscleGroup);
  if (filtros.equipment) params.set('equipment', filtros.equipment);
  if (filtros.page) params.set('page', String(filtros.page));
  if (filtros.idsOnly) params.set('idsOnly', '1');
  return params.toString();
}

/**
 * Drawer (shadcn Sheet) para importar exercícios do catálogo global para o
 * acervo do professor (FEAT-003). Busca os itens do Route Handler
 * `/professor/exercicios/biblioteca` conforme o usuário digita/filtra/pagina,
 * mantém a seleção (`Set<string>`) entre páginas e filtros, e dispara a Server
 * Action `importarExercicios` no rodapé.
 */
export function ImportBibliotecaSheet() {
  const router = useRouter();

  const [aberto, setAberto] = React.useState(false);

  // Filtros aplicados (muscleGroup/equipment são imediatos; q tem debounce).
  const [busca, setBusca] = React.useState('');
  const [buscaAplicada, setBuscaAplicada] = React.useState('');
  const [grupo, setGrupo] = React.useState(TODOS_GRUPOS);
  const [equipamento, setEquipamento] = React.useState(TODOS_EQUIPAMENTOS);
  const [pagina, setPagina] = React.useState(1);

  const [itens, setItens] = React.useState<ItemBiblioteca[]>([]);
  const [total, setTotal] = React.useState(0);
  const [carregando, setCarregando] = React.useState(false);
  const [erro, setErro] = React.useState<string | null>(null);

  const [selecionados, setSelecionados] = React.useState<Set<string>>(
    () => new Set()
  );
  const [selecionandoTodos, setSelecionandoTodos] = React.useState(false);
  const [importando, setImportando] = React.useState(false);

  const pageSize = 50;
  const totalPaginas = Math.max(1, Math.ceil(total / pageSize));

  const grupoFiltro = grupo === TODOS_GRUPOS ? '' : grupo;
  const equipamentoFiltro =
    equipamento === TODOS_EQUIPAMENTOS ? '' : equipamento;

  // Debounce da busca por nome (300ms).
  React.useEffect(() => {
    const id = window.setTimeout(() => {
      setBuscaAplicada(busca.trim());
      setPagina(1);
    }, 300);
    return () => window.clearTimeout(id);
  }, [busca]);

  // Reinicia a página ao mudar grupo/equipamento.
  React.useEffect(() => {
    setPagina(1);
  }, [grupoFiltro, equipamentoFiltro]);

  // Busca os itens sempre que abrir/filtrar/paginar (cancelando a anterior).
  React.useEffect(() => {
    if (!aberto) return;

    const controller = new AbortController();
    setCarregando(true);
    setErro(null);

    const qs = montarParams({
      q: buscaAplicada,
      muscleGroup: grupoFiltro,
      equipment: equipamentoFiltro,
      page: pagina,
    });

    fetch(`/professor/exercicios/biblioteca?${qs}`, {
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('falha');
        return (await res.json()) as RespostaLista;
      })
      .then((dados) => {
        setItens(dados.itens);
        setTotal(dados.total);
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setItens([]);
        setTotal(0);
        setErro('Não foi possível carregar a biblioteca. Tente novamente.');
      })
      .finally(() => {
        // Evita desligar o spinner quando a requisição foi cancelada.
        if (!controller.signal.aborted) setCarregando(false);
      });

    return () => controller.abort();
  }, [aberto, buscaAplicada, grupoFiltro, equipamentoFiltro, pagina]);

  const alternarItem = React.useCallback((id: string, marcado: boolean) => {
    setSelecionados((anterior) => {
      const proximo = new Set(anterior);
      if (marcado) proximo.add(id);
      else proximo.delete(id);
      return proximo;
    });
  }, []);

  const limparSelecao = React.useCallback(() => {
    setSelecionados(new Set());
  }, []);

  const selecionarTodos = React.useCallback(async () => {
    setSelecionandoTodos(true);
    try {
      const qs = montarParams({
        q: buscaAplicada,
        muscleGroup: grupoFiltro,
        equipment: equipamentoFiltro,
        idsOnly: true,
      });
      const res = await fetch(`/professor/exercicios/biblioteca?${qs}`);
      if (!res.ok) throw new Error('falha');
      const dados = (await res.json()) as RespostaIds;

      const aMarcar = dados.ids.slice(0, LIMITE_SELECAO_EM_LOTE);
      setSelecionados((anterior) => {
        const proximo = new Set(anterior);
        for (const id of aMarcar) proximo.add(id);
        return proximo;
      });

      if (dados.ids.length > LIMITE_SELECAO_EM_LOTE || dados.truncado) {
        toast.warning(AVISO_LIMITE);
      }
    } catch {
      toast.error('Não foi possível selecionar os exercícios. Tente novamente.');
    } finally {
      setSelecionandoTodos(false);
    }
  }, [buscaAplicada, grupoFiltro, equipamentoFiltro]);

  const importar = React.useCallback(async () => {
    const ids = Array.from(selecionados);
    if (ids.length === 0) return;

    setImportando(true);
    try {
      const resultado = await importarExercicios(ids);
      if (resultado.ok) {
        toast.success(resultado.message ?? 'Exercícios importados.');
        router.refresh();
        setSelecionados(new Set());
        setAberto(false);
      } else {
        toast.error(resultado.message ?? 'Não foi possível importar.');
      }
    } finally {
      setImportando(false);
    }
  }, [selecionados, router]);

  const quantidade = selecionados.size;

  return (
    <>
      <SonnerToaster position="top-center" />
      <Sheet open={aberto} onOpenChange={setAberto}>
        <Button
          type="button"
          variant="outline"
          className="min-h-11"
          onClick={() => setAberto(true)}
        >
          <Library className="mr-2 h-4 w-4" aria-hidden="true" />
          Importar da biblioteca
        </Button>

        <SheetContent
          side="right"
          className="flex w-full flex-col gap-0 p-0 sm:max-w-lg"
        >
          <SheetHeader className="space-y-1 border-b border-border p-6">
            <SheetTitle>Importar da biblioteca</SheetTitle>
            <SheetDescription>
              Escolha exercícios do catálogo global para copiar ao seu acervo.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-3 border-b border-border p-6">
            <div>
              <Label htmlFor="biblioteca-busca" className="mb-1.5 block">
                Buscar exercício
              </Label>
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="biblioteca-busca"
                  type="search"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Nome do exercício"
                  className="pl-9"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex-1">
                <Label htmlFor="biblioteca-grupo" className="mb-1.5 block">
                  Grupo muscular
                </Label>
                <Select value={grupo} onValueChange={setGrupo}>
                  <SelectTrigger id="biblioteca-grupo">
                    <SelectValue placeholder="Todos os grupos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={TODOS_GRUPOS}>Todos os grupos</SelectItem>
                    {GRUPOS_MUSCULARES.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <Label htmlFor="biblioteca-equipamento" className="mb-1.5 block">
                  Equipamento
                </Label>
                <Select value={equipamento} onValueChange={setEquipamento}>
                  <SelectTrigger id="biblioteca-equipamento">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={TODOS_EQUIPAMENTOS}>Todos</SelectItem>
                    {EQUIPAMENTOS.map((e) => (
                      <SelectItem key={e} value={e}>
                        {e}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="min-h-11"
                onClick={selecionarTodos}
                disabled={selecionandoTodos || carregando}
              >
                {selecionandoTodos ? (
                  <Loader2
                    className="mr-2 h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                ) : null}
                Selecionar todos
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="min-h-11"
                onClick={limparSelecao}
                disabled={quantidade === 0}
              >
                Limpar seleção
              </Button>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-6">
              {erro ? (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  {erro}
                </p>
              ) : carregando ? (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  Carregando…
                </p>
              ) : itens.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  Nenhum exercício encontrado no catálogo global.
                </p>
              ) : (
                <ul className="space-y-3">
                  {itens.map((item) => {
                    const grupos = item.muscle_groups ?? [];
                    const equipamentos = item.equipment ?? [];
                    const marcado = selecionados.has(item.id);
                    return (
                      <li key={item.id}>
                        <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-accent">
                          <Checkbox
                            checked={marcado}
                            onCheckedChange={(valor) =>
                              alternarItem(item.id, valor === true)
                            }
                            aria-label={item.name}
                          />
                          {item.thumbnail_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.thumbnail_url}
                              alt=""
                              aria-hidden="true"
                              className="h-11 w-11 shrink-0 rounded-xl object-cover"
                            />
                          ) : (
                            <span
                              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground"
                              aria-hidden="true"
                            >
                              <Library className="h-5 w-5" />
                            </span>
                          )}
                          <div className="min-w-0 flex-1 space-y-1">
                            <p className="truncate font-medium text-foreground">
                              {item.name}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {grupos.slice(0, 3).map((g) => (
                                <Badge
                                  key={g}
                                  variant="secondary"
                                  className="font-normal"
                                >
                                  {g}
                                </Badge>
                              ))}
                              {equipamentos.slice(0, 2).map((e) => (
                                <Badge
                                  key={e}
                                  variant="outline"
                                  className="font-normal"
                                >
                                  {e}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              )}

              {!carregando && !erro && totalPaginas > 1 ? (
                <div className="mt-4 flex items-center justify-between gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="min-h-11"
                    onClick={() => setPagina((p) => Math.max(1, p - 1))}
                    disabled={pagina <= 1}
                  >
                    Anterior
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Página {pagina} de {totalPaginas}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="min-h-11"
                    onClick={() =>
                      setPagina((p) => Math.min(totalPaginas, p + 1))
                    }
                    disabled={pagina >= totalPaginas}
                  >
                    Próxima
                  </Button>
                </div>
              ) : null}
            </div>
          </ScrollArea>

          <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-border bg-background p-6">
            <span className="text-sm text-muted-foreground">
              {quantidade} selecionados
            </span>
            <Button
              type="button"
              className="min-h-11"
              onClick={importar}
              disabled={quantidade === 0 || importando}
            >
              {importando ? (
                <Loader2
                  className="mr-2 h-4 w-4 animate-spin"
                  aria-hidden="true"
                />
              ) : null}
              Importar {quantidade}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
