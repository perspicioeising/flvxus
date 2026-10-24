import * as React from 'react';
import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

export interface StatCardProps {
  /** Rótulo da métrica (pt-BR). */
  label: string;
  /** Valor principal já formatado. */
  value: React.ReactNode;
  /** Ícone ilustrativo opcional (lucide-react). Sem wrapper quando ausente. */
  icon?: LucideIcon;
  /** Texto auxiliar opcional abaixo do valor. */
  hint?: string;
  /** `default` = valor neutro forte; `emphasis` = número verde gigante. */
  tone?: 'default' | 'emphasis';
  /** Raio do card. `lg` = default do Card; `2xl` = cantos mais arredondados. */
  radius?: 'lg' | '2xl';
  className?: string;
}

/**
 * Cartão de métrica reutilizável. Matriz de classes fixa por tone/radius
 * para evitar regressão visual onde já era usado como MetricCard neutro.
 */
export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  tone = 'default',
  radius = 'lg',
  className,
}: StatCardProps) {
  return (
    <Card className={cn(radius === '2xl' && 'rounded-2xl', className)}>
      <CardContent className="flex items-start gap-3 p-4">
        {Icon ? (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
        ) : null}
        <div className="min-w-0 space-y-0.5">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p
            className={cn(
              'leading-none tracking-tight',
              tone === 'emphasis'
                ? 'text-3xl font-black tabular-nums text-primary md:text-4xl'
                : 'text-2xl font-bold text-foreground'
            )}
          >
            {value}
          </p>
          {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
        </div>
      </CardContent>
    </Card>
  );
}
