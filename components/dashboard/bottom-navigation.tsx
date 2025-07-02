"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  Activity,
  Trophy,
  Settings,
  Menu,
  BarChart4,
  Calendar,
  Utensils,
  Dumbbell,
  ClipboardList,
  User,
  Bell,
  Moon,
  Sun,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSupabase } from "@/app/providers";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useCapacitor } from "@/hooks/useCapacitor";

interface BottomNavigationProps {
  userRole: 'trainer' | 'student' | null;
}

export function BottomNavigation({ userRole }: BottomNavigationProps) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const { supabase, session } = useSupabase();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { hapticFeedback } = useCapacitor();

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
    await hapticFeedback('medium');
    await supabase.auth.signOut();
    router.push("/login");
  }

  const toggleTheme = async () => {
    await hapticFeedback('light');
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleNavClick = async () => {
    await hapticFeedback('light');
  };

  // Navegação principal para trainers
  const trainerMainNavigation = [
    {
      name: "Início",
      href: "/dashboard",
      icon: Home,
      isActive: pathname === "/dashboard",
      color: "achievement-consecutive"
    },
    {
      name: "Alunos",
      href: "/dashboard/students",
      icon: Users,
      isActive: pathname.startsWith("/dashboard/students"),
      color: "achievement-workout"
    },
    {
      name: "Avaliações",
      href: "/dashboard/physical-assessments",
      icon: BarChart4,
      isActive: pathname.startsWith("/dashboard/physical-assessments"),
      color: "achievement-weight"
    },
    {
      name: "Treinos",
      href: "/dashboard/workouts",
      icon: Activity,
      isActive: pathname.startsWith("/dashboard/workouts"),
      color: "achievement-consecutive"
    },

  ];

  // Navegação principal para alunos
  const studentMainNavigation = [
    {
      name: "Treinos",
      href: "/dashboard/my-workouts",
      icon: Activity,
      isActive: pathname.startsWith("/dashboard/my-workouts"),
      color: "achievement-consecutive"
    },
    {
      name: "Progresso",
      href: "/dashboard/my-progress",
      icon: BarChart4,
      isActive: pathname.startsWith("/dashboard/my-progress"),
      color: "achievement-workout"
    },
    {
      name: "Dietas",
      href: "/dashboard/diets",
      icon: Utensils,
      isActive: pathname.startsWith("/dashboard/diets"),
      color: "achievement-weight"
    },
    {
      name: "Conquistas",
      href: "/dashboard/my-achievements",
      icon: Trophy,
      isActive: pathname.startsWith("/dashboard/my-achievements"),
      color: "achievement-exercise"
    },
  ];

  // Navegação secundária para o menu lateral
  const getSecondaryNavigation = () => {
    if (userRole === 'trainer') {
      return [
        {
          name: "Dietas", href: "/dashboard/diets", icon: Activity, color: "achievement-consecutive"},
        { name: "Conquistas", href: "/dashboard/achievements", icon: Trophy, color: "achievement-exercise" },
        { name: "Exercícios", href: "/dashboard/exercises", icon: Dumbbell, color: "achievement-weight" },
        { name: "Rotinas", href: "/dashboard/workout-plans", icon: ClipboardList, color: "achievement-workout" },
      ];
    } else {
      return [
        { name: "Avaliações", href: "/dashboard/progress", icon: Calendar, color: "achievement-workout" },
      ];
    }
  };

  const mainNavigation = userRole === 'trainer' ? trainerMainNavigation : studentMainNavigation;
  const secondaryNavigation = getSecondaryNavigation();

  return (
    <>
      {/* Bottom Navigation Bar - Visible only on mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        {/* Gradient Background with Blur */}
        <div className="absolute inset-0 bg-app-overlay backdrop-blur-xl border-t border-app-border-muted"></div>

        {/* Navigation Content */}
        <nav className="relative px-4 py-2 pb-safe-bottom">
          <div className="flex items-center justify-around">
            {/* Main Navigation Items */}
            {mainNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleNavClick}
                className="group flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 min-w-0 flex-1 no-select"
              >
                <div className={`relative p-2 rounded-full transition-all duration-300 ${item.isActive
                    ? `bg-${item.color} shadow-app-large scale-110`
                    : "bg-app-bg-secondary group-hover:bg-app-border-accent group-hover:scale-105"
                  }`}>
                  <item.icon className={`h-5 w-5 transition-colors duration-200 ${item.isActive
                      ? "text-white"
                      : "text-app-text-secondary group-hover:text-app-text-accent"
                    }`} />

                  {/* Active indicator */}
                  {item.isActive && (
                    <div className={`absolute -inset-1 bg-${item.color}/30 rounded-full blur-md -z-10`}></div>
                  )}
                </div>

                <span className={`text-xs font-medium transition-colors duration-200 truncate max-w-full ${item.isActive
                    ? "text-app-text-accent"
                    : "text-app-text-secondary group-hover:text-app-text-accent"
                  }`}>
                  {item.name}
                </span>
              </Link>
            ))}

            {/* Menu Button */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  onClick={handleNavClick}
                  className="group flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 min-w-0 flex-1 hover:bg-transparent no-select"
                >
                  <div className="relative p-2 rounded-full bg-app-bg-secondary group-hover:bg-app-border-accent group-hover:scale-105 transition-all duration-300">
                    <Menu className="h-5 w-5 text-app-text-secondary group-hover:text-app-text-accent transition-colors duration-200" />
                  </div>
                  <span className="text-xs font-medium text-app-text-secondary group-hover:text-app-text-accent transition-colors duration-200">
                    Menu
                  </span>
                </Button>
              </SheetTrigger>

              <SheetContent
                side="bottom"
                className="bg-app-overlay backdrop-blur-xl border-t border-app-border-default rounded-t-3xl max-h-[80vh] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-app-border-muted"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border-2 border-app-border-accent">
                      <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
                      <AvatarFallback className="bg-achievement-consecutive text-white font-bold">
                        {userInitial}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-app-text-primary">
                        {profile?.full_name || "Usuário"}
                      </h3>
                      <p className="text-sm text-app-text-secondary">
                        {userRole === 'trainer' ? 'Personal Trainer' : 'Aluno'}
                      </p>
                    </div>
                  </div>

                  {profile?.status === 'active' && (
                    <Badge className="bg-achievement-consecutive/10 text-achievement-consecutive border-app-border-accent">
                      Online
                    </Badge>
                  )}
                </div>

                {/* Secondary Navigation */}
                <div className="space-y-3 mb-6">
                  <h4 className="text-sm font-medium text-app-text-muted uppercase tracking-wider">
                    Navegação
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {secondaryNavigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={async () => {
                          await hapticFeedback('light');
                          setIsMenuOpen(false);
                        }}
                        className={`group flex items-center gap-3 p-4 rounded-2xl transition-all duration-200 no-select ${pathname.startsWith(item.href)
                            ? `bg-${item.color} text-white shadow-app-large`
                            : "bg-app-card hover:bg-app-border-accent/20 text-app-text-primary"
                          }`}
                      >
                        <div className={`p-2 rounded-xl transition-all duration-200 ${pathname.startsWith(item.href)
                            ? "bg-white/20"
                            : "bg-app-bg-secondary group-hover:bg-app-border-accent/30"
                          }`}>
                          <item.icon className={`h-5 w-5 transition-colors duration-200 ${pathname.startsWith(item.href)
                              ? "text-white"
                              : "text-app-text-secondary group-hover:text-app-text-accent"
                            }`} />
                        </div>
                        <span className="font-medium text-sm">{item.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-3 mb-6">
                  <h4 className="text-sm font-medium text-app-text-muted uppercase tracking-wider">
                    Ações Rápidas
                  </h4>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <Link
                      href="/dashboard/profile"
                      onClick={async () => {
                        await hapticFeedback('light');
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center gap-3 p-4 rounded-2xl bg-achievement-workout/10 hover:bg-achievement-workout/20 text-achievement-workout transition-all duration-200 group no-select"
                    >
                      <div className="p-2 rounded-xl bg-achievement-workout/20 group-hover:bg-achievement-workout/30 transition-all duration-200">
                        <User className="h-5 w-5" />
                      </div>
                      <span className="font-medium text-sm">Perfil</span>
                    </Link>

                    <Link
                      href="/dashboard/settings"
                      onClick={async () => {
                        await hapticFeedback('light');
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center gap-3 p-4 rounded-2xl bg-achievement-exercise/10 hover:bg-achievement-exercise/20 text-achievement-exercise transition-all duration-200 group no-select"
                    >
                      <div className="p-2 rounded-xl bg-achievement-exercise/20 group-hover:bg-achievement-exercise/30 transition-all duration-200">
                        <Settings className="h-5 w-5" />
                      </div>
                      <span className="font-medium text-sm">Config</span>
                    </Link>
                  </div>

                  {/* Notifications and Theme */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="ghost"
                      onClick={() => hapticFeedback('light')}
                      className="flex items-center gap-3 p-4 rounded-2xl bg-achievement-weight/10 hover:bg-achievement-weight/20 text-achievement-weight transition-all duration-200 group border-0 h-auto no-select"
                    >
                      <div className="relative p-2 rounded-xl bg-achievement-weight/20 group-hover:bg-achievement-weight/30 transition-all duration-200">
                        <Bell className="h-5 w-5" />
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                        </span>
                      </div>
                      <span className="font-medium text-sm">Avisos</span>
                    </Button>

                    <Button
                      onClick={toggleTheme}
                      variant="ghost"
                      className="flex items-center gap-3 p-4 rounded-2xl bg-app-card hover:bg-app-border-muted text-app-text-primary transition-all duration-200 group border-0 h-auto no-select"
                    >
                      <div className="p-2 rounded-xl bg-app-bg-secondary group-hover:bg-app-border-accent/30 transition-all duration-200">
                        {theme === "dark" ? (
                          <Sun className="h-5 w-5 text-app-btn-accent" />
                        ) : (
                          <Moon className="h-5 w-5 text-app-text-primary" />
                        )}
                      </div>
                      <span className="font-medium text-sm">
                        {theme === "dark" ? "Claro" : "Escuro"}
                      </span>
                    </Button>
                  </div>

                  {/* Logout Button */}
                  <Button
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleSignOut();
                    }}
                    className="w-full flex items-center gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-all duration-200 group border-0 h-auto no-select"
                    variant="ghost"
                  >
                    <div className="p-2 rounded-xl bg-red-100 dark:bg-red-900/30 group-hover:bg-red-200 dark:group-hover:bg-red-900/50 transition-all duration-200">
                      <LogOut className="h-5 w-5" />
                    </div>
                    <span className="font-medium text-sm">Sair da Conta</span>
                  </Button>
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-app-border-muted pb-safe-bottom">
                  <p className="text-center text-xs text-app-text-muted">
                    FLVXUS Personal Training Platform
                  </p>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </div>

      {/* Spacer for bottom navigation */}
      <div className="h-20 md:hidden"></div>
    </>
  );
}