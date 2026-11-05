'use client';

import * as React from 'react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  ItemEditor,
  CoberturaMuscular,
  gruposCoberturaDe,
  type ItemEditavel,
} from './item-editor';
import type { ExercicioDisponivel } from './exercise-picker';

/**
 * Chave interna do grupo "sem divisão". O prefixo `\u0000` (byte nulo) torna
 * impossível colidir com um rótulo real de divisão vindo do Select (A..E) ou de
 * uma ficha importada pela IA — nenhum rótulo real começa com esse byte.
 */
const SEM_DIVISAO = '\u0000sem-divisao';

/** Um grupo visual (uma seção do accordion) derivado do array plano `itens`. */
interface GrupoVisual {
  /** Chave da divisão (ex.: 'A') ou a sentinela `SEM_DIVISAO`. */
  chave: string;
  /** Rótulo exibido no gatilho (ex.: 'Divisão A', 'Sem divisão'). */
  rotulo: string;
  /** Itens do grupo, na mesma ordem relativa que têm no array global. */
  itensDoGrupo: ItemEditavel[];
  /** Posição no array global `itens` de cada item da fatia, na mesma ordem. */
  indicesGlobais: number[];
}

/**
 * Reconstrói o array global de itens substituindo a fatia de UM grupo por uma
 * nova fatia, PRESERVANDO a ordem global dos demais grupos. Pura e testável.
 *
 * - Percorre `itens` na ordem original: posições que NÃO são do grupo são
 *   copiadas intactas; posições do grupo consomem a nova fatia em ordem.
 * - Se a nova fatia for MAIOR (adições), os itens excedentes são inseridos
 *   imediatamente após a última posição global do grupo (ficam contíguos ao
 *   grupo, sem reordenar os outros).
 * - Se for MENOR (remoções), as posições do grupo que sobram são descartadas.
 */
export function reconstruirComFatia(
  itens: ItemEditavel[],
  indicesGlobais: number[],
  novaFatia: ItemEditavel[]
): ItemEditavel[] {
  const doGrupo = new Set(indicesGlobais);
  const ultimaPosicaoGrupo =
    indicesGlobais.length > 0 ? indicesGlobais[indicesGlobais.length - 1] : -1;

  const resultado: ItemEditavel[] = [];
  let cursorFatia = 0;

  for (let i = 0; i < itens.length; i += 1) {
    if (doGrupo.has(i)) {
      // Posição do grupo: consome a fatia nova em ordem (enquanto houver).
      if (cursorFatia < novaFatia.length) {
        resultado.push(novaFatia[cursorFatia]);
        cursorFatia += 1;
      }
    } else {
      resultado.push(itens[i]);
    }

    // Logo após a última posição global do grupo, despeja os itens excedentes
    // da fatia (adições) — contíguos ao grupo.
    if (i === ultimaPosicaoGrupo) {
      while (cursorFatia < novaFatia.length) {
        resultado.push(novaFatia[cursorFatia]);
        cursorFatia += 1;
      }
    }
  }

  // Grupo vazio original (ultimaPosicaoGrupo === -1) com fatia nova: anexa no fim.
  while (cursorFatia < novaFatia.length) {
    resultado.push(novaFatia[cursorFatia]);
    cursorFatia += 1;
  }

  return resultado;
}

/**
 * Deriva os grupos visuais (seções do accordion) a partir do array plano.
 * Divisões em ordem alfabética (pt-BR) primeiro; o grupo "Sem divisão" por
 * último (quando existe). Cada grupo carrega o mapa índice-no-grupo →
 * índice-global para a reconstrução posicional.
 */
function derivarGrupos(itens: ItemEditavel[]): GrupoVisual[] {
  const porDivisao = new Map<string, GrupoVisual>();
  const semDivisao: GrupoVisual = {
    chave: SEM_DIVISAO,
    rotulo: 'Sem divisão',
    itensDoGrupo: [],
    indicesGlobais: [],
  };

  itens.forEach((item, indice) => {
    const d = item.division ?? null;
    if (d === null || d === '') {
      semDivisao.itensDoGrupo.push(item);
      semDivisao.indicesGlobais.push(indice);
      return;
    }
    let g = porDivisao.get(d);
    if (!g) {
      g = { chave: d, rotulo: `Divisão ${d}`, itensDoGrupo: [], indicesGlobais: [] };
      porDivisao.set(d, g);
    }
    g.itensDoGrupo.push(item);
    g.indicesGlobais.push(indice);
  });

  const divisoes = Array.from(porDivisao.values()).sort((a, b) =>
    a.chave.localeCompare(b.chave, 'pt-BR')
  );
  return semDivisao.itensDoGrupo.length > 0 ? [...divisoes, semDivisao] : divisoes;
}

/**
 * Apresentação da seção "Exercícios" da ficha, AGRUPADA por divisão num
 * accordion (uma seção colapsável por divisão + "Sem divisão"). Reusa o
 * `ItemEditor` por grupo (toda a edição existente funciona dentro de cada
 * seção) e mantém um único card de cobertura muscular no topo.
 *
 * O estado continua sendo o array plano `itens` do `FichaForm` (fonte da verdade
 * do `order_index` no submit). O agrupamento é só de apresentação: a
 * reconstrução preserva as posições globais, então abrir/salvar uma ficha
 * existente NÃO reordena os itens.
 */
export function ItemEditorPorDivisao({
  itens,
  onChange,
  exercicios,
}: {
  itens: ItemEditavel[];
  onChange: (itens: ItemEditavel[]) => void;
  exercicios: ExercicioDisponivel[];
}) {
  // Ficha vazia: um único ItemEditor (EmptyState + picker) SEM accordion. Seu
  // onChange é o do próprio wrapper (repassa direto a setItens), sem passar por
  // aoMudarGrupo — não há grupo com índices globais ainda. Novos itens nascem
  // com division = null e, no render seguinte, caem no grupo "Sem divisão".
  if (itens.length === 0) {
    return (
      <div className="space-y-4">
        <ItemEditor
          itens={itens}
          onChange={onChange}
          exercicios={exercicios}
          comDiaSemana
          comDivisao
          semCobertura
        />
      </div>
    );
  }

  const grupos = derivarGrupos(itens);
  const coberturaGlobal = gruposCoberturaDe(itens);

  // Valor inicial aberto: a primeira seção (não controlado — sem estado novo).
  const valorPadrao = grupos.length > 0 ? grupos[0].chave : undefined;

  function aoMudarGrupo(g: GrupoVisual, novaFatia: ItemEditavel[]) {
    const divisaoDoGrupo = g.chave === SEM_DIVISAO ? null : g.chave;
    const antigasKeys = new Set(g.itensDoGrupo.map((i) => i.key));
    // Carimba `division` só nos itens NOVOS do grupo (add pelo picker); itens já
    // existentes preservam o division escolhido (inclusive via o Select).
    const fatiaCarimbada = novaFatia.map((item) =>
      antigasKeys.has(item.key) ? item : { ...item, division: divisaoDoGrupo }
    );
    onChange(reconstruirComFatia(itens, g.indicesGlobais, fatiaCarimbada));
  }

  return (
    <div className="space-y-4">
      {coberturaGlobal.length > 0 ? (
        <CoberturaMuscular grupos={coberturaGlobal} />
      ) : null}

      <Accordion type="single" collapsible defaultValue={valorPadrao} className="space-y-3">
        {grupos.map((g) => (
          <AccordionItem
            key={g.chave}
            value={g.chave}
            className="rounded-2xl border border-border border-b-0 bg-card px-4"
          >
            <AccordionTrigger className="min-h-11 hover:no-underline">
              <span className="flex min-w-0 flex-1 items-center gap-2 text-left">
                <span className="text-xs font-bold uppercase tracking-widest text-primary">
                  {g.rotulo}
                </span>
                <span className="text-xs font-normal normal-case tracking-normal text-muted-foreground">
                  ({g.itensDoGrupo.length})
                </span>
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <ItemEditor
                itens={g.itensDoGrupo}
                onChange={(novaFatia) => aoMudarGrupo(g, novaFatia)}
                exercicios={exercicios}
                comDiaSemana
                comDivisao
                semCobertura
              />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
