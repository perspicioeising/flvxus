import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Dumbbell,
  LayoutList,
  Home,
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
  Play,
  Sparkles,
  type LucideIcon,
  Trophy,
} from 'lucide-react';

import type { AccountType, UserRole } from '@/types/database.types';

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
  { label: 'Desafios', href: '/professor/desafios', icon: Trophy },
  { label: 'Agenda', href: '/professor/agenda', icon: Calendar },
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
  { label: 'Agenda', href: '/aluno/agenda', icon: Calendar },
  { label: 'Dieta', href: '/aluno/dieta', icon: Utensils },
  { label: 'Evolução', href: '/aluno/evolucao', icon: BarChart3 },
  { label: 'Avaliações', href: '/aluno/avaliacoes', icon: HeartPulse },
  { label: 'Conquistas', href: '/aluno/conquistas', icon: Trophy },
  { label: 'Arena', href: '/aluno/arena', icon: Sparkles },
  { label: 'Perfil', href: '/aluno/perfil', icon: Settings },
  { label: 'Ajuda', href: '/aluno/ajuda', icon: HelpCircle },
];

/**
 * Itens de menu distintos por papel. `isMaster` (default false) acrescenta o
 * item "Plano" APENAS para o personal master — o filiado nunca o vê. É aditivo:
 * chamadores antigos (sem o 2º argumento) seguem recebendo o menu padrão.
 *
 * `accountType` (Fase B1, default 'professional') espelha na UI o fato de que o
 * aluno autônomo (self_managed) não gerencia alunos: o item "Alunos" é ocultado.
 * O enforcement real segue no backend (NFR-3); isto é apenas espelho de UI.
 */
export function getNavItems(
  role: UserRole,
  isMaster = false,
  accountType: AccountType = 'professional',
): NavItem[] {
  if (role !== 'trainer') {
    return studentNav;
  }

  // Aluno autônomo: não gerencia terceiros — remove "Alunos" e "Modelos de
  // treino"; e também a "Visão geral" (=/professor), que é o dashboard de
  // gestão de alunos (inútil para quem não tem alunos). O painel do autônomo é
  // "Início" (=/aluno), que por isso entra como PRIMEIRO item do menu, seguido
  // das demais telas de USO (rotas /aluno, reusadas pela OPÇÃO a do design).
  let base = trainerNav;
  if (accountType === 'self_managed') {
    const semGestao = trainerNav.filter(
      (item) =>
        item.href !== '/professor' &&
        item.href !== '/professor/alunos' &&
        item.href !== '/professor/modelos-treino' &&
        // "Desafios" é o painel do personal B2B (intra-tenant); o autônomo não
        // gerencia turma, então o item não entra no menu dele (o gate de rota
        // em desafios/layout.tsx é a fronteira real).
        item.href !== '/professor/desafios' &&
        // A agenda do autônomo é a de uso (/aluno/agenda), injetada em usoItems.
        item.href !== '/professor/agenda',
    );
    // Itens de uso do autônomo (rotas /aluno reusadas). A "Arena" é exclusiva
    // do autônomo: o professor B2B não tem Arena própria (quem tem são os
    // alunos dele), por isso o item só entra aqui no ramo self_managed.
    const usoItems: NavItem[] = [
      // "Início" (/aluno) é onde ficam os hábitos do dia (hidratação, check-in e
      // editar meta de água). "Dietas" (=/professor/dietas) segue como gestão/
      // criação (geração por IA); "Minha dieta" (=/aluno/dieta) é a visão de uso
      // — ver a dieta liberada e marcar "cumpri hoje" (XP).
      { label: 'Início', href: '/aluno', icon: Home },
      { label: 'Treinar', href: '/aluno/execucao', icon: Play },
      { label: 'Minha dieta', href: '/aluno/dieta', icon: Utensils },
      { label: 'Agenda', href: '/aluno/agenda', icon: Calendar },
      { label: 'Evolução', href: '/aluno/evolucao', icon: BarChart3 },
      { label: 'Conquistas', href: '/aluno/conquistas', icon: Trophy },
      { label: 'Arena', href: '/aluno/arena', icon: Sparkles },
    ];
    // "Início" (=/aluno) é o painel do autônomo e deve ser o primeiro item do
    // menu, antes de "Avaliações"/"Exercícios"/"Treinos".
    base = [...usoItems, ...semGestao];
  }

  if (!isMaster) {
    return base;
  }
  // Insere "Plano" antes do último item ("Ajuda") para o master.
  const items = [...base];
  const ajudaIndex = items.findIndex((item) => item.href === '/professor/ajuda');
  const insertAt = ajudaIndex === -1 ? items.length : ajudaIndex;
  items.splice(insertAt, 0, masterNavItem);
  return items;
}

/**
 * Rótulo humano do papel, em pt-BR.
 *
 * `accountType` (Fase B1, default 'professional'): o aluno autônomo
 * (self_managed) é `role='trainer'` por baixo, mas se enxerga como ALUNO — não
 * como professor. Por isso o rótulo dele é "Aluno", não "Professor". O trainer
 * B2B segue "Professor"; o student segue "Aluno".
 */
export function roleLabel(
  role: UserRole,
  accountType: AccountType = 'professional',
): string {
  if (role === 'trainer' && accountType === 'self_managed') return 'Aluno';
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

/**
 * Decide se `pathname` é uma TELA PRINCIPAL (de nível de aba do menu) do papel.
 * É principal quando corresponde EXATAMENTE ao `href` de algum item de
 * navegação — a raiz da aba, nunca uma subrota (detalhe/execução/criação). Ex.:
 * `/aluno/treinos` é principal; `/aluno/treinos/[id]` ou `/aluno/execucao/...`
 * não são. Usada no mobile para exibir a logo só nas telas principais.
 */
export function isMainScreen(
  pathname: string,
  role: UserRole,
  isMaster = false,
  accountType: AccountType = 'professional',
): boolean {
  return getNavItems(role, isMaster, accountType).some(
    (item) => item.href === pathname,
  );
}
