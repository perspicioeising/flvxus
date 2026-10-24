'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';
import { LogoIcon } from '@/components/navigation/logo-icon';

export interface AuthScreenProps {
  /** Título gigante. Pode conter quebras manuais (ex.: duas <span> em linhas). */
  title: React.ReactNode;
  /** Subtítulo cinza abaixo do título. */
  subtitle?: React.ReactNode;
  /** Campos do formulário. */
  children: React.ReactNode;
  /** Ação primária fixada embaixo (tipicamente <Button size="xl" className="w-full" />). */
  primaryAction: React.ReactNode;
  /** Link/CTA secundário abaixo do botão. */
  footer?: React.ReactNode;
  /** onSubmit do <form> que envolve children + primaryAction. */
  onSubmit?: React.FormEventHandler<HTMLFormElement>;
  /** Mostra o halo verde no LogoIcon do hero. */
  glowIcon?: boolean;
}

/**
 * Layout hero full-screen reutilizável das telas de auth. Alinhado à esquerda,
 * título gigante com ponto verde, ícone de marca no topo, CTA pílula fixo
 * embaixo. Expõe exatamente 1 <h1>. Nunca vira um card com borda/sombra.
 */
export function AuthScreen({
  title,
  subtitle,
  children,
  primaryAction,
  footer,
  onSubmit,
  glowIcon = true,
}: AuthScreenProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-background px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(2rem,env(safe-area-inset-top))]">
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col">
        <div className="space-y-5">
          <LogoIcon size="xl" glow={glowIcon} />
          <div className="space-y-2">
            <h1 className="text-4xl font-black leading-[0.95] tracking-tight sm:text-5xl">
              {title}
              <span className="text-primary">.</span>
            </h1>
            {subtitle ? (
              <p className="text-sm text-muted-foreground md:text-base">
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>

        <form
          onSubmit={onSubmit}
          noValidate
          className="mt-8 flex flex-1 flex-col"
        >
          <div className="space-y-5">{children}</div>
          <div className="mt-auto space-y-4 pt-8">
            {primaryAction}
            {footer ? (
              <div className="text-center text-sm text-muted-foreground">
                {footer}
              </div>
            ) : null}
          </div>
        </form>
      </div>
    </div>
  );
}
