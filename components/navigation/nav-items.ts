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
  HelpCircle,
  CreditCard,
  History,
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
  { label: 'Configurações', href: '/professor/configuracoes', icon: Settings },
  { label: 'Ajuda', href: '/professor/ajuda', icon: HelpCircle },
];

/** Item exclusivo do MASTER (billing/assinatura). Nunca mostrado a filiados. */
const masterNavItem: NavItem = {
  label: 'Plano',
  href: '/professor/plano',
  icon: CreditCard,
};

const studentNav: NavItem[] = [
  { label: 'Início', href: '/aluno', icon: LayoutDashboard },
  { label: 'Treinos', href: '/aluno/treinos', icon: Activity },
  { label: 'Histórico', href: '/aluno/historico', icon: History },
  { label: 'Dieta', href: '/aluno/dieta', icon: Utensils },
  { label: 'Evolução', href: '/aluno/evolucao', icon: BarChart3 },
  { label: 'Avaliações', href: '/aluno/avaliacoes', icon: HeartPulse },
    { label: 'Conquistas', href: '/aluno/conquistas', icon: Trophy },
  { label: 'Perfil', href: '/aluno/perfil', icon: Settings },
  { label: 'Ajuda', href: '/aluno/ajuda', icon: HelpCircle },
];

/**
 * Itens de menu distintos por papel. `isMaster` (default false) acrescenta o
 * item "Plano" APENAS para o personal master — o filiado nunca o vê. É aditivo:
 * chamadores antigos (sem o 2º argumento) seguem recebendo o menu padrão.
 */
export function getNavItems(role: UserRole, isMaster = false): NavItem[] {
  if (role !== 'trainer') {
    return studentNav;
  }
  if (!isMaster) {
    return trainerNav;
  }
  // Insere "Plano" antes do último item ("Ajuda") para o master.
  const items = [...trainerNav];
  const ajudaIndex = items.findIndex((item) => item.href === '/professor/ajuda');
  const insertAt = ajudaIndex === -1 ? items.length : ajudaIndex;
  items.splice(insertAt, 0, masterNavItem);
  return items;
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
