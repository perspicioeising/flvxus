"use client";

import { useEffect, useState } from "react";
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
  Utensils,
  User,
  LogOut,
  Bell,
  Moon,
  Sun,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "next-themes";
import { useSupabase } from "@/app/providers";
import { useRouter } from "next/navigation";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  userRole: 'trainer' | 'student' | null;
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

export function Sidebar({ className, userRole, isCollapsed, toggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const [profile, setProfile] = useState<any>(null);
  const { theme, setTheme } = useTheme();
  const { supabase, session } = useSupabase();
  const router = useRouter();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }
      
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const userInitial = profile?.full_name?.charAt(0).toUpperCase() || session?.user?.email?.charAt(0).toUpperCase() || "U";

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const getRoutes = () => {
    if (userRole === 'trainer') {
      return [
        {
          name: "Painel",
          href: "/dashboard",
          icon: LayoutDashboard,
          isActive: pathname === "/dashboard",
          color: "achievement-consecutive",
        },
        {
          name: "Atletas",
          href: "/dashboard/students",
          icon: Users,
          isActive: pathname.startsWith("/dashboard/students"),
          color: "achievement-workout",
        },
        {
          name: "Avaliações",
          href: "/dashboard/physical-assessments",
          icon: BarChart4,
          isActive: pathname.startsWith("/dashboard/physical-assessments"),
          color: "achievement-weight",
        },
         {
          name: "Exercícios",
          href: "/dashboard/exercises",
          icon: Dumbbell,
          isActive: pathname.startsWith("/dashboard/exercises"),
          color: "achievement-exercise",
        },
        {
          name: "Treinos",
          href: "/dashboard/workouts",
          icon: Activity,
          isActive: pathname.startsWith("/dashboard/workouts"),
          color: "achievement-consecutive",
        },
        {
          name: "Rotinas",
          href: "/dashboard/workout-plans",
          icon: ClipboardList,
          isActive: pathname.startsWith("/dashboard/workout-plans"),
          color: "achievement-weight",
        },
        {
          name: "Dietas",
          href: "/dashboard/diets",
          icon: Utensils,
          isActive: pathname.startsWith("/dashboard/diets"),
          color: "achievement-exercise",
        },
        {
          name: "Conquistas",
          href: "/dashboard/achievements",
          icon: Trophy,
          isActive: pathname.startsWith("/dashboard/achievements"),
          color: "achievement-workout",
        },
      ];
    } else {
      return [
        {
          name: "Meus Treinos",
          href: "/dashboard/my-workouts",
          icon: Activity,
          isActive: pathname.startsWith("/dashboard/my-workouts"),
          color: "achievement-consecutive",
        },
        {
          name: "Dietas",
          href: "/dashboard/diets",
          icon: Utensils,
          isActive: pathname.startsWith("/dashboard/diets"),
          color: "achievement-weight",
        },
        {
          name: "Meu Progresso",
          href: "/dashboard/my-progress",
          icon: BarChart4,
          isActive: pathname.startsWith("/dashboard/my-progress"),
          color: "achievement-workout",
        },
        {
          name: "Minhas Conquistas",
          href: "/dashboard/my-achievements",
          icon: Trophy,
          isActive: pathname.startsWith("/dashboard/my-achievements"),
          color: "achievement-exercise",
        },
        {
          name: "Avaliações",
          href: "/dashboard/progress",
          icon: Heart,
          isActive: pathname.startsWith("/dashboard/progress"),
          color: "achievement-weight",
        }
      ];
    }
  };

  const routes = getRoutes();

  const bottomRoutes = [
    {
      name: "Webhooks",
      href: "/dashboard/webhooks",
      icon: Settings,
      isActive: pathname.startsWith("/dashboard/webhooks"),
       color: "achievement-consecutive",
    },
    {
      name: "Ajuda",
      href: "/dashboard/help",
      icon: HelpCircle,
      isActive: pathname.startsWith("/dashboard/help"),
      color: "achievement-consecutive",
    },
  ];

  return (
    <aside
      className={cn(
        "relative hidden md:flex flex-col bg-app-overlay backdrop-blur-xl border-r border-app-border-muted transition-all duration-300 ease-in-out h-[calc(var(--vh, 1vh) * 100)]",
        isCollapsed ? "w-[70px]" : "w-64",
        className
      )}
    >
      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-4 top-6 h-8 w-8 rounded-full border-2 border-app-border-default bg-app-bg-secondary shadow-app-large hover:shadow-app-xl transition-all duration-300 z-10"
        onClick={toggleCollapse}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4 text-app-text-accent" />
        ) : (
          <ChevronLeft className="h-4 w-4 text-app-text-accent" />
        )}
      </Button>

      {/* Header */}
      {!isCollapsed && (
        <div className="p-6 border-b border-app-border-muted">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-achievement-consecutive rounded-xl flex items-center justify-center shadow-app-large">
                <Dumbbell className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-achievement-exercise rounded-full flex items-center justify-center">
                <Zap className="h-2 w-2 text-white" />
              </div>
            </div>
            <div>
              <h2 className="font-black text-lg text-app-heading">
                FLVXUS
              </h2>
              <p className="text-xs text-app-text-secondary -mt-1">
                {userRole === 'trainer' ? 'Personal Trainer' : 'Dashboard'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Collapsed Header */}
      {isCollapsed && (
        <div className="p-4 border-b border-app-border-muted flex justify-center">
          <div className="relative">
            <div className="w-10 h-10 bg-achievement-consecutive rounded-xl flex items-center justify-center shadow-app-large">
              <Dumbbell className="h-6 w-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-achievement-exercise rounded-full flex items-center justify-center">
              <Zap className="h-2 w-2 text-white" />
            </div>
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <div className="flex-1 py-4 overflow-y-auto">
        <div className="px-3 space-y-2">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "group flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all duration-200 relative overflow-hidden",
                isCollapsed && "justify-center px-2",
                route.isActive
                  ? `bg-${route.color} text-white shadow-app-large`
                  : "text-app-text-primary hover:bg-app-border-accent/20"
              )}
              title={isCollapsed ? route.name : undefined}
            >
              {route.isActive && (
                <div className={`absolute inset-0 bg-${route.color}/20 blur-xl -z-10`}></div>
              )}
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200",
                route.isActive
                  ? "bg-white/20 shadow-app-medium"
                  : "bg-app-bg-secondary group-hover:bg-app-border-accent/30"
              )}>
                <route.icon className={cn(
                  "h-5 w-5 transition-all duration-200",
                  route.isActive ? "text-white" : "text-app-text-secondary group-hover:text-app-text-accent"
                )} />
              </div>
              {!isCollapsed && (
                <div className="flex items-center justify-between flex-1">
                  <span className="truncate">{route.name}</span>
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>

      <div className="border-t border-app-border-muted">
        {!isCollapsed && (
          <div className="p-3 border-b border-app-border-muted">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="flex-1 h-10 rounded-xl hover:bg-app-border-accent/20 transition-all relative"
                title="Notificações"
              >
                <Bell className="h-4 w-4 text-app-text-secondary" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="flex-1 h-10 rounded-xl hover:bg-app-border-accent/20 transition-all"
                onClick={toggleTheme}
                title="Alternar tema"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4 text-app-btn-accent" />
                ) : (
                  <Moon className="h-4 w-4 text-app-achievement-workout" />
                )}
              </Button>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="p-2 border-b border-app-border-muted space-y-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="w-full h-10 rounded-xl hover:bg-app-border-accent/20 transition-all relative"
              title="Notificações"
            >
              <Bell className="h-4 w-4 text-app-text-secondary" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="w-full h-10 rounded-xl hover:bg-app-border-accent/20 transition-all"
              onClick={toggleTheme}
              title="Alternar tema"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 text-app-btn-accent" />
              ) : (
                <Moon className="h-4 w-4 text-app-achievement-workout" />
              )}
            </Button>
          </div>
        )}
        <div className="p-3">
          <div className="space-y-2 mb-4">
            {bottomRoutes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "group flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all duration-200",
                  isCollapsed && "justify-center px-2",
                  route.isActive
                    ? `bg-${route.color} text-white shadow-app-large`
                    : "text-app-text-primary hover:bg-app-border-accent/20"
                )}
                title={isCollapsed ? route.name : undefined}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200",
                  route.isActive
                    ? "bg-white/20 shadow-app-medium"
                    : "bg-app-bg-secondary group-hover:bg-app-border-accent/30"
                )}>
                  <route.icon className={cn(
                    "h-5 w-5 transition-all duration-200",
                    route.isActive ? "text-white" : "text-app-text-secondary group-hover:text-app-text-accent"
                  )} />
                </div>
                {!isCollapsed && (
                  <span className="truncate">{route.name}</span>
                )}
              </Link>
            ))}
          </div>
          {!isCollapsed && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-3 p-3 bg-app-card rounded-xl hover:bg-app-border-accent/20 transition-all cursor-pointer group">
                  <Avatar className="h-10 w-10 border-2 border-app-border-accent">
                    <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
                    <AvatarFallback className="bg-achievement-consecutive text-white font-bold">
                      {userInitial}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-app-text-primary truncate">
                      {profile?.full_name || "Usuário"}
                    </p>
                    <p className="text-xs text-app-text-secondary truncate">
                      {userRole === 'trainer' ? 'Personal Trainer' : 'Aluno'}
                    </p>
                  </div>
                  {profile?.status === 'active' && (
                    <div className="w-3 h-3 bg-app-text-accent rounded-full flex-shrink-0"></div>
                  )}
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                side="top"
                className="w-64 bg-app-overlay backdrop-blur-xl border border-app-border-default shadow-app-xl rounded-2xl p-2 mb-2"
              >
                <DropdownMenuLabel className="p-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border-2 border-app-border-accent">
                      <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
                      <AvatarFallback className="bg-achievement-consecutive text-white font-bold">
                        {userInitial}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-app-text-primary truncate">
                        {profile?.full_name || "Usuário"}
                      </p>
                      <p className="text-sm text-app-text-secondary truncate">
                        {profile?.email}
                      </p>
                      <p className="text-xs text-app-text-accent font-medium">
                        {userRole === 'trainer' ? 'Personal Trainer' : 'Aluno'}
                      </p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-app-border-muted" />
                <DropdownMenuItem asChild className="p-0 m-1">
                  <Link 
                    href="/dashboard/profile" 
                    className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-app-border-accent/20 transition-all"
                  >
                    <div className="w-8 h-8 bg-achievement-consecutive/20 rounded-lg flex items-center justify-center">
                      <User className="h-4 w-4 text-achievement-consecutive" />
                    </div>
                    <span className="font-medium">Meu Perfil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-app-border-muted" />
                <DropdownMenuItem 
                  onClick={handleSignOut}
                  className="p-0 m-1"
                >
                  <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all w-full">
                    <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                      <LogOut className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </div>
                    <span className="font-medium text-red-600 dark:text-red-400">Sair</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {isCollapsed && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full p-2 rounded-xl hover:bg-app-border-accent/20 transition-all">
                  <Avatar className="h-8 w-8 border-2 border-app-border-accent">
                    <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
                    <AvatarFallback className="bg-achievement-consecutive text-white font-bold text-sm">
                      {userInitial}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                side="right"
                className="w-64 bg-app-overlay backdrop-blur-xl border border-app-border-default shadow-app-xl rounded-2xl p-2"
              >
                <DropdownMenuLabel className="p-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border-2 border-app-border-accent">
                      <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
                      <AvatarFallback className="bg-achievement-consecutive text-white font-bold">
                        {userInitial}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-app-text-primary truncate">
                        {profile?.full_name || "Usuário"}
                      </p>
                      <p className="text-sm text-app-text-secondary truncate">
                        {profile?.email}
                      </p>
                      <p className="text-xs text-app-text-accent font-medium">
                        {userRole === 'trainer' ? 'Personal Trainer' : 'Aluno'}
                      </p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-app-border-muted" />
                <DropdownMenuItem asChild className="p-0 m-1">
                  <Link 
                    href="/dashboard/profile" 
                    className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-app-border-accent/20 transition-all"
                  >
                    <div className="w-8 h-8 bg-achievement-consecutive/20 rounded-lg flex items-center justify-center">
                      <User className="h-4 w-4 text-achievement-consecutive" />
                    </div>
                    <span className="font-medium">Meu Perfil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-app-border-muted" />
                <DropdownMenuItem 
                  onClick={handleSignOut}
                  className="p-0 m-1"
                >
                  <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all w-full">
                    <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                      <LogOut className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </div>
                    <span className="font-medium text-red-600 dark:text-red-400">Sair</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </aside>
  );
}