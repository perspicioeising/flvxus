'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

/**
 * Isola o next-themes do resto do app (ADR 0006 / architecture.md §9).
 * Padrões do design system: classe `dark`, tema inicial seguindo o sistema
 * e troca manual (claro/escuro/sistema) via ThemeToggle.
 */
type ThemeProviderProps = React.ComponentProps<typeof NextThemesProvider>;

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
