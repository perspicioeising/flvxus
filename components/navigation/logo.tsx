import * as React from 'react';

import { cn } from '@/lib/utils';

export interface LogoProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Tamanho tipográfico do wordmark. */
  size?: 'sm' | 'md' | 'lg';
}

const SIZE: Record<NonNullable<LogoProps['size']>, string> = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-2xl',
};

/**
 * Wordmark tipográfico "FLVXUS" com o "X" em verde de marca.
 * Usado em header/sidebar/marketing. Sem dependência/asset.
 */
export function Logo({ size = 'md', className, ...props }: LogoProps) {
  return (
    <span
      className={cn(
        'font-black uppercase tracking-tight text-foreground',
        SIZE[size],
        className
      )}
      {...props}
    >
      FLV<span className="text-primary">X</span>US
    </span>
  );
}
