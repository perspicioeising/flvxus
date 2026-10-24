'use client';

import Link from 'next/link';
import { PlayCircle } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { CARTAO_CLASSES, ConteudoAtalho } from './atalhos-aluno';

/** Ficha liberada (status='released') oferecida como opção de treino presencial. */
interface FichaLiberada {
  id: string;
  name: string;
}

/**
 * Seletor do atalho "Treinar com o aluno" quando há 2+ fichas liberadas.
 *
 * Em vez de mandar o professor para uma âncora sem destino útil, abre um menu
 * com uma opção por ficha liberada, cada uma linkando direto para a rota
 * presencial `/professor/alunos/[id]/treinar/[planId]`. Reutiliza o mesmo visual
 * do cartão de atalho (`CARTAO_CLASSES` + `ConteudoAtalho`) para manter o layout
 * do hub consistente.
 *
 * `defaultOpen` existe só para permitir asserir o conteúdo do menu em testes
 * (jsdom não implementa os pointer-events de que o Radix depende para abrir).
 */
export function TreinarAlunoSelector({
  alunoId,
  fichasLiberadas,
  defaultOpen = false,
}: {
  alunoId: string;
  fichasLiberadas: FichaLiberada[];
  defaultOpen?: boolean;
}) {
  return (
    <DropdownMenu defaultOpen={defaultOpen}>
      <DropdownMenuTrigger className={`${CARTAO_CLASSES} w-full text-left`}>
        <ConteudoAtalho
          Icone={PlayCircle}
          titulo="Treinar com o aluno"
          descricao="Registrar a execução presencial a partir de uma ficha liberada."
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Escolha a ficha liberada</DropdownMenuLabel>
        {fichasLiberadas.map((ficha) => (
          <DropdownMenuItem key={ficha.id} asChild>
            <Link href={`/professor/alunos/${alunoId}/treinar/${ficha.id}`}>
              {ficha.name}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
