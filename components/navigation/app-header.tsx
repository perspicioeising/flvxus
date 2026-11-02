'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Logo } from '@/components/navigation/logo';
import { LogoIcon } from '@/components/navigation/logo-icon';
import type { AccountType, UserRole } from '@/types/database.types';
import { isMainScreen, roleLabel } from '@/components/navigation/nav-items';
import { cn } from '@/lib/utils';

interface AppHeaderProps {
  role: UserRole;
  rootHref: string;
  /** Master vê o item "Plano"; repassado para casar a rota com os nav items. */
  isMaster?: boolean;
  /** Fase B1: aluno autônomo (self_managed) não vê o item "Alunos". */
  accountType?: AccountType;
}

/**
 * Cabeçalho do app: identidade FLVXUS (logo com X verde) apenas no mobile,
 * onde a sidebar fica oculta. No desktop a marca vive na sidebar, então o
 * header não repete a logo (sem duplicação). A alternância de tema não vive
 * mais aqui — no desktop fica no rodapé da sidebar e no mobile dentro do
 * Sheet do menu da bottom-nav.
 *
 * No MOBILE a logo só aparece nas TELAS PRINCIPAIS (nível de aba do menu:
 * Início, Treinos, Dieta, Evolução, …). Nas telas internas (detalhe, execução,
 * criação) o header some para dar mais espaço — essas telas já têm seu próprio
 * título/voltar. No DESKTOP nada muda: o header segue presente (a logo continua
 * oculta no desktop), só a sidebar cuida da marca.
 */
export function AppHeader({
  role,
  rootHref,
  isMaster = false,
  accountType = 'professional',
}: AppHeaderProps) {
  const pathname = usePathname();
  const telaPrincipal = isMainScreen(pathname ?? '', role, isMaster, accountType);

  return (
    <header
      className={cn(
        'sticky top-0 z-30 h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80',
        // Telas principais: header visível em todos os tamanhos. Telas internas:
        // oculto no mobile (sem buraco — o <main> encosta no topo) e preservado
        // no desktop (onde é só uma barra, sem logo).
        telaPrincipal ? 'flex' : 'hidden md:flex'
      )}
    >
      {/* No desktop a sidebar (md+) já exibe a marca; o header só mostra a logo
          no mobile, onde a sidebar fica oculta. Evita a logo duplicada. */}
      <Link
        href={rootHref}
        className="flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
        aria-label="Flvxus — página inicial"
      >
        <LogoIcon size="md" className="h-9 w-9 rounded-lg" />
        <span className="flex flex-col leading-tight">
          <Logo size="md" />
          <span className="text-xs text-muted-foreground">{roleLabel(role, accountType)}</span>
        </span>
      </Link>
    </header>
  );
}
