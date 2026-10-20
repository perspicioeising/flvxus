import * as React from 'react';
import Link from 'next/link';
import { Activity, ClipboardList, HeartPulse } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { EmptyState } from '@/components/patterns';

/** Tipo da atividade, define ícone e rota de destino. */
export type AtividadeTipo = 'avaliacao' | 'ficha';

/** Um evento recente do tenant (avaliação criada ou ficha criada). */
export interface AtividadeItem {
  id: string;
  tipo: AtividadeTipo;
  /** Descrição do evento (ex.: "Avaliação de Maria"). */
  texto: string;
  /** Data formatada (pt-BR). */
  data: string;
  /** Rota de destino. */
  href: string;
}

const ICONE: Record<AtividadeTipo, typeof Activity> = {
  avaliacao: HeartPulse,
  ficha: ClipboardList,
};

export interface AtividadeRecenteCardProps {
  itens: AtividadeItem[];
}

/**
 * Bloco de atividade recente do painel: últimas avaliações e fichas criadas,
 * ordenadas pelo chamador. Mobile-first, acessível.
 */
export function AtividadeRecenteCard({ itens }: AtividadeRecenteCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="p-4 pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Activity className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          Atividade recente
        </CardTitle>
        <CardDescription>
          Últimas avaliações e fichas cadastradas.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 p-4 pt-0">
        {itens.length === 0 ? (
          <EmptyState
            title="Nenhuma atividade ainda"
            description="Avaliações e fichas que você cadastrar aparecerão aqui."
          />
        ) : (
          <ul className="divide-y divide-border">
            {itens.map((item) => {
              const Icon = ICONE[item.tipo];
              return (
                <li key={`${item.tipo}-${item.id}`}>
                  <Link
                    href={item.href}
                    className="flex min-h-11 items-center gap-3 rounded-md px-1 py-2 text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1 truncate font-medium text-foreground">
                      {item.texto}
                    </span>
                    <time className="shrink-0 text-xs text-muted-foreground">
                      {item.data}
                    </time>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
