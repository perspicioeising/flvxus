import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Dumbbell,
  LayoutList,
  Utensils,
  BarChart3,
  Calendar,
  Palette,
  Settings,
  Activity,
  HeartPulse,
  type LucideIcon,
  Trophy,
} from 'lucide-react';

import type { UserRole } from '@/types/database.types';

/** Um item de navegação por papel, em pt-BR. */
export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const trainerNav: NavItem[] = [
  { label: 'Visão geral', href: '/professor', icon: LayoutDashboard },
  { label: 'Alunos', href: '/professor/alunos', icon: Users },
  { label: 'Avaliações', href: '/professor/avaliacoes', icon: HeartPulse },
  { label: 'Exercícios', href: '/professor/exercicios', icon: Dumbbell },
  { label: 'Modelos de treino', href: '/professor/modelos-treino', icon: LayoutList },
  { label: 'Treinos', href: '/professor/treinos', icon: ClipboardList },
  { label: 'Dietas', href: '/professor/dietas', icon: Utensils },
  // { label: 'Agenda', href: '/professor/agenda', icon: Calendar },
  // { label: 'Configurações', href: '/professor/configuracoes', icon: Settings },
];

const studentNav: NavItem[] = [
  { label: 'Início', href: '/aluno', icon: LayoutDashboard },
  { label: 'Treinos', href: '/aluno/treinos', icon: Activity },
  { label: 'Dieta', href: '/aluno/dieta', icon: Utensils },
  { label: 'Evolução', href: '/aluno/evolucao', icon: BarChart3 },
  { label: 'Avaliações', href: '/aluno/avaliacoes', icon: HeartPulse },
    { label: 'Conquistas', href: '/aluno/conquistas', icon: Trophy },
  { label: 'Perfil', href: '/aluno/perfil', icon: Settings },
];

/** Itens de menu distintos por papel. */
export function getNavItems(role: UserRole): NavItem[] {
  return role === 'trainer' ? trainerNav : studentNav;
}

/** Rótulo humano do papel, em pt-BR. */
export function roleLabel(role: UserRole): string {
  return role === 'trainer' ? 'Professor' : 'Aluno';
}

/**
 * Marca um item como ativo. A rota raiz da área (`/professor` ou `/aluno`) só é
 * ativa em correspondência exata; as demais, por prefixo, para que subrotas
 * mantenham o item do menu destacado.
 */
export function isNavItemActive(
  item: NavItem,
  pathname: string,
  rootHrefs: string[],
): boolean {
  if (rootHrefs.includes(item.href)) {
    return pathname === item.href;
  }
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
