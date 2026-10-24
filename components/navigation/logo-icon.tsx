import * as React from 'react';
import { Dumbbell } from 'lucide-react';

import { cn } from '@/lib/utils';

export interface LogoIconProps {
  /** Tamanho do quadrado. md=h-12 (nav/header), lg=h-14, xl=h-16 (hero de auth). */
  size?: 'md' | 'lg' | 'xl';
  /** Halo verde (shadow-app-glow). Opt-in; default false. */
  glow?: boolean;
  className?: string;
  /** Decorativo quando acompanha wordmark/título. */
  'aria-hidden'?: boolean;
}

const BOX_SIZE: Record<NonNullable<LogoIconProps['size']>, string> = {
  md: 'h-12 w-12 rounded-2xl',
  lg: 'h-14 w-14 rounded-2xl',
  xl: 'h-16 w-16 rounded-3xl',
};

const ICON_SIZE: Record<NonNullable<LogoIconProps['size']>, string> = {
  md: 'h-6 w-6',
  lg: 'h-7 w-7',
  xl: 'h-8 w-8',
};

/**
 * Ícone de marca do Flvxus: quadrado verde com o halter centralizado.
 * Distinto do wordmark `Logo`. O glow é opt-in via prop (default false).
 */
export function LogoIcon({
  size = 'md',
  glow = false,
  className,
  'aria-hidden': ariaHidden = true,
}: LogoIconProps) {
  return (
    <div
      aria-hidden={ariaHidden}
      className={cn(
        'flex shrink-0 items-center justify-center bg-primary text-primary-foreground',
        BOX_SIZE[size],
        glow && 'shadow-app-glow',
        className
      )}
    >
      <Dumbbell className={ICON_SIZE[size]} aria-hidden="true" />
    </div>
  );
}
