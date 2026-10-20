import * as React from 'react';
import type { LucideIcon } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';

export interface MetricCardProps {
  /** Rótulo da métrica (pt-BR). */
  label: string;
  /** Valor principal já formatado. */
  value: React.ReactNode;
  /** Ícone ilustrativo (lucide-react). */
  icon: LucideIcon;
  /** Texto auxiliar opcional abaixo do valor. */
  hint?: string;
}

/**
 * Cartão compacto de métrica do painel do professor. Mobile-first, legível
 * em 360px, com ícone decorativo (aria-hidden) e hierarquia clara entre
 * rótulo, valor e dica.
 */
export function MetricCard({ label, value, icon: Icon, hint }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="flex items-start gap-3 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 space-y-0.5">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold leading-none tracking-tight text-foreground">
            {value}
          </p>
          {hint ? (
            <p className="text-xs text-muted-foreground">{hint}</p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
