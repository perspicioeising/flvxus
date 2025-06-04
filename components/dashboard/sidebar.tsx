"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  BarChart4, 
  Calendar, 
  Dumbbell, 
  LayoutDashboard, 
  Settings, 
  Users,
  Activity,
  Heart,
  Trophy,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  BookOpen,
  Camera,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  userRole: 'trainer' | 'student' | null;
}

export function Sidebar({ className, userRole }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getRoutes = () => {
  if (userRole === 'trainer') {
    return [
      {
        name: "Painel",
        href: "/dashboard",
        icon: LayoutDashboard,
        isActive: pathname === "/dashboard",
      },
      {
        name: "Alunos",
        href: "/dashboard/students",
        icon: Users,
        isActive: pathname.startsWith("/dashboard/students"),
      },
      {
        name: "Física",
        href: "/dashboard/physical-assessments",
        icon: BookOpen,
        isActive: pathname.startsWith("/dashboard/physical-assessments"),
      },
      {
        name: "Postural",
        href: "/dashboard/posture-assessments",
        icon: Camera,
        isActive: pathname.startsWith("/dashboard/posture-assessments"),
      },
       {
        name: "Calendário",
        href: "/dashboard/calendar",
        icon: Calendar,
        isActive: pathname.startsWith("/dashboard/calendar"),
      },     
      {
        name: "Conquistas",
        href: "/dashboard/achievements",
        icon: Trophy,
        isActive: pathname.startsWith("/dashboard/achievements"),
      },
       {
        name: "Exercícios",
        href: "/dashboard/exercises",
        icon: Dumbbell,
        isActive: pathname.startsWith("/dashboard/exercises"),
      },
      {
        name: "Treinos",
        href: "/dashboard/workouts",
        icon: Activity,
        isActive: pathname.startsWith("/dashboard/workouts"),
      },
      {
        name: "Planos de Treino",
        href: "/dashboard/workout-plans",
        icon: ClipboardList,
        isActive: pathname.startsWith("/dashboard/workout-plans"),
      },
     
     
    ];
  } else {
    return [
      {
        name: "Meus Treinos",
        href: "/dashboard/my-workouts",
        icon: Activity,
        isActive: pathname.startsWith("/dashboard/my-workouts"),
      },
      {
        name: "Meu Progresso",
        href: "/dashboard/my-progress",
        icon: BarChart4,
        isActive: pathname.startsWith("/dashboard/my-progress"),
      },
      {
        name: "Minhas Conquistas",
        href: "/dashboard/my-achievements",
        icon: Trophy,
        isActive: pathname.startsWith("/dashboard/my-achievements"),
      },
      {
        name: "Avaliações",
        href: "/dashboard/progress",
        icon: Heart,
        isActive: pathname.startsWith("/dashboard/progress"),
      }
    ];
  }
};

  const routes = getRoutes();

const bottomRoutes = [
  {
    name: "Configurações",
    href: "/dashboard/settings",
    icon: Settings,
    isActive: pathname.startsWith("/dashboard/settings"),
  },
  {
    name: "Ajuda",
    href: "/dashboard/help",
    icon: HelpCircle,
    isActive: pathname.startsWith("/dashboard/help"),
  },
];

  return (
    <aside 
      className={cn(
        "border-r bg-background flex flex-col relative",
        isCollapsed ? "sidebar-collapsed" : "sidebar-expanded",
        className
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-4 top-6 h-8 w-8 rounded-full border bg-background"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>

      <div className="flex-1 space-y-1 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "sidebar-item",
                  isCollapsed && "sidebar-item-collapsed",
                  route.isActive && "sidebar-item-active"
                )}
                title={isCollapsed ? route.name : undefined}
              >
                <route.icon className="h-4 w-4 flex-shrink-0" />
                <span className={cn(
                  "sidebar-text",
                  isCollapsed && "sidebar-text-collapsed"
                )}>
                  {route.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
      
      <div className="border-t">
        <div className="px-3 py-4">
          <div className="space-y-1">
            {bottomRoutes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "sidebar-item",
                  isCollapsed && "sidebar-item-collapsed",
                  route.isActive && "sidebar-item-active"
                )}
                title={isCollapsed ? route.name : undefined}
              >
                <route.icon className="h-4 w-4 flex-shrink-0" />
                <span className={cn(
                  "sidebar-text",
                  isCollapsed && "sidebar-text-collapsed"
                )}>
                  {route.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}