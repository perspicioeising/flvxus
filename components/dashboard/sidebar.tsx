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
  Award,
  Zap,
  Sparkles,
  Utensils
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
          color: "text-green-600 dark:text-green-400",
          bgColor: "bg-gray-100 dark:bg-gray-900/30",
          hoverColor: "hover:bg-green-50 dark:hover:bg-green-900/20",
        },
        {
          name: "Alunos",
          href: "/dashboard/students",
          icon: Users,
          isActive: pathname.startsWith("/dashboard/students"),
          color: "text-green-600 dark:text-green-400",
          bgColor: "bg-gray-100 dark:bg-gray-900/30",
          hoverColor: "hover:bg-green-50 dark:hover:bg-green-900/20",
        //  badge: "12"
        },
        // {
        //   name: "Avaliação Física",
        //   href: "/dashboard/physical-assessments",
        //   icon: BookOpen,
        //   isActive: pathname.startsWith("/dashboard/physical-assessments"),
        //   color: "text-green-600 dark:text-green-400",
        //   bgColor: "bg-gray-100 dark:bg-gray-900/30",
        //   hoverColor: "hover:bg-green-50 dark:hover:bg-green-900/20",
        // },
        // {
        //   name: "Avaliação Postural",
        //   href: "/dashboard/posture-assessments",
        //   icon: Camera,
        //   isActive: pathname.startsWith("/dashboard/posture-assessments"),
        //   color: "text-green-600 dark:text-green-400",
        //   bgColor: "bg-gray-100 dark:bg-gray-900/30",
        //   hoverColor: "hover:bg-green-50 dark:hover:bg-green-900/20",
        // },
         {
          name: "Dietas",
          href: "/dashboard/diets",
          icon: Utensils,
          isActive: pathname.startsWith("/dashboard/diets"),
          color: "text-green-600 dark:text-green-400",
          bgColor: "bg-gray-100 dark:bg-gray-900/30",
          hoverColor: "hover:bg-green-50 dark:hover:bg-green-900/20",
        },
        // {
        //   name: "Calendário",
        //   href: "/dashboard/calendar",
        //   icon: Calendar,
        //   isActive: pathname.startsWith("/dashboard/calendar"),
        //   color: "text-green-600 dark:text-green-400",
        //   bgColor: "bg-gray-100 dark:bg-gray-900/30",
        //   hoverColor: "hover:bg-green-50 dark:hover:bg-green-900/20",
        // },
        {
          name: "Conquistas",
          href: "/dashboard/achievements",
          icon: Trophy,
          isActive: pathname.startsWith("/dashboard/achievements"),
          color: "text-green-600 dark:text-green-400",
          bgColor: "bg-gray-100 dark:bg-gray-900/30",
          hoverColor: "hover:bg-green-50 dark:hover:bg-green-900/20",
        },
        {
          name: "Exercícios",
          href: "/dashboard/exercises",
          icon: Dumbbell,
          isActive: pathname.startsWith("/dashboard/exercises"),
          color: "text-green-600 dark:text-green-400",
          bgColor: "bg-gray-100 dark:bg-gray-900/30",
          hoverColor: "hover:bg-green-50 dark:hover:bg-green-900/20",
        },
        {
          name: "Treinos",
          href: "/dashboard/workouts",
          icon: Activity,
          isActive: pathname.startsWith("/dashboard/workouts"),
          color: "text-green-600 dark:text-green-400",
          bgColor: "bg-gray-100 dark:bg-gray-900/30",
          hoverColor: "hover:bg-green-50 dark:hover:bg-green-900/20",
        },
        {
          name: "Planos de Treino",
          href: "/dashboard/workout-plans",
          icon: ClipboardList,
          isActive: pathname.startsWith("/dashboard/workout-plans"),
          color: "text-green-600 dark:text-green-400",
          bgColor: "bg-gray-100 dark:bg-gray-900/30",
          hoverColor: "hover:bg-green-50 dark:hover:bg-green-900/20",
        },
      ];
    } else {
      return [
        {
          name: "Meus Treinos",
          href: "/dashboard/my-workouts",
          icon: Activity,
          isActive: pathname.startsWith("/dashboard/my-workouts"),
          color: "text-green-600 dark:text-green-400",
          bgColor: "bg-green-100 dark:bg-green-900/30",
          hoverColor: "hover:bg-green-50 dark:hover:bg-green-900/20",
        },
          {
          name: "Dietas",
          href: "/dashboard/diets",
          icon: Calendar,
          isActive: pathname.startsWith("/dashboard/diets"),
          color: "text-green-600 dark:text-green-400",
          bgColor: "bg-gray-100 dark:bg-gray-900/30",
          hoverColor: "hover:bg-green-50 dark:hover:bg-green-900/20",
        },
        {
          name: "Meu Progresso",
          href: "/dashboard/my-progress",
          icon: BarChart4,
          isActive: pathname.startsWith("/dashboard/my-progress"),
          color: "text-green-600 dark:text-green-400",
          bgColor: "bg-blue-100 dark:bg-blue-900/30",
          hoverColor: "hover:bg-blue-50 dark:hover:bg-blue-900/20",
        },
        {
          name: "Minhas Conquistas",
          href: "/dashboard/my-achievements",
          icon: Trophy,
          isActive: pathname.startsWith("/dashboard/my-achievements"),
          color: "text-green-600 dark:text-green-400",
          bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
          hoverColor: "hover:bg-yellow-50 dark:hover:bg-yellow-900/20",
        },
        {
          name: "Avaliações",
          href: "/dashboard/progress",
          icon: Heart,
          isActive: pathname.startsWith("/dashboard/progress"),
          color: "text-green-600 dark:text-green-400",
          bgColor: "bg-red-100 dark:bg-red-900/30",
          hoverColor: "hover:bg-red-50 dark:hover:bg-red-900/20",
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
      color: "text-gray-600 dark:text-gray-400",
      bgColor: "bg-gray-100 dark:bg-gray-900/30",
      hoverColor: "hover:bg-gray-50 dark:hover:bg-gray-900/20",
    },
    {
      name: "Ajuda",
      href: "/dashboard/help",
      icon: HelpCircle,
      isActive: pathname.startsWith("/dashboard/help"),
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
      hoverColor: "hover:bg-emerald-50 dark:hover:bg-emerald-900/20",
    },
  ];

  return (
    <aside
      className={cn(
        "relative flex flex-col bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-800/50 transition-all duration-300 ease-in-out",
        isCollapsed ? "w-[70px]" : "w-64",
        className
      )}
    >
      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-4 top-6 h-8 w-8 rounded-full border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg hover:shadow-xl transition-all duration-300 z-10"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4 text-green-600 dark:text-green-400" />
        ) : (
          <ChevronLeft className="h-4 w-4 text-green-600 dark:text-green-400" />
        )}
      </Button>

      {/* Header */}
      {!isCollapsed && (
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                <Dumbbell className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Zap className="h-2 w-2 text-white" />
              </div>
            </div>
            <div>
              <h2 className="font-black text-lg bg-gradient-to-r from-gray-900 via-green-600 to-gray-900 dark:from-white dark:via-green-400 dark:to-white bg-clip-text text-transparent">
                FLVXUS
              </h2>
              <p className="text-xs text-gray-600 dark:text-gray-400 -mt-1">
                {userRole === 'trainer' ? 'Personal Trainer' : 'Dashboard'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Collapsed Header */}
      {isCollapsed && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-center">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
              <Dumbbell className="h-6 w-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <Zap className="h-2 w-2 text-white" />
            </div>
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <div className="flex-1 py-4">
        <div className="px-3 space-y-2">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "group flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all duration-200 relative overflow-hidden",
                isCollapsed && "justify-center px-2",
                route.isActive
                  ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg"
                  : `text-gray-700 dark:text-gray-200 ${route.hoverColor}`
              )}
              title={isCollapsed ? route.name : undefined}
            >
              {/* Background glow effect for active items */}
              {route.isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20 blur-xl -z-10"></div>
              )}

              {/* Icon container */}
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200",
                route.isActive
                  ? "bg-white/20 shadow-sm"
                  : route.bgColor
              )}>
                <route.icon className={cn(
                  "h-5 w-5 transition-all duration-200",
                  route.isActive ? "text-white" : route.color
                )} />
              </div>

              {/* Text and badge */}
              {!isCollapsed && (
                <div className="flex items-center justify-between flex-1">
                  <span className="truncate">{route.name}</span>
             
                </div>
              )}

              {/* Collapsed badge indicator */}
         
            </Link>
          ))}
        </div>
      </div>

      {/* Premium Upgrade Card (only for non-collapsed) */}
      {!isCollapsed && userRole === 'trainer' && (
        <div className="px-3 mb-4">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 p-4 text-white">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-cyan-400/20 blur-xl"></div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-yellow-300" />
                <span className="font-bold text-sm">Premium</span>
              </div>
              <p className="text-xs opacity-90 mb-3">
                Desbloqueie recursos avançados e impulsione seu negócio!
              </p>
              <Button
                size="sm"
                className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30 text-xs font-semibold"
              >
                Fazer Upgrade
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-3">
        <div className="space-y-2">
          {bottomRoutes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "group flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all duration-200",
                isCollapsed && "justify-center px-2",
                route.isActive
                  ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg"
                  : `text-gray-700 dark:text-gray-200 ${route.hoverColor}`
              )}
              title={isCollapsed ? route.name : undefined}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200",
                route.isActive
                  ? "bg-white/20 shadow-sm"
                  : route.bgColor
              )}>
                <route.icon className={cn(
                  "h-5 w-5 transition-all duration-200",
                  route.isActive ? "text-white" : route.color
                )} />
              </div>

              {!isCollapsed && (
                <span className="truncate">{route.name}</span>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* User Status Indicator (collapsed) */}
      {isCollapsed && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-800">
          <div className="w-full h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
        </div>
      )}
    </aside>
  );
}