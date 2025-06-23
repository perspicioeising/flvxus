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
    },
    {
      name: "Alunos",
      href: "/dashboard/students",
      icon: Users,
      isActive: pathname.startsWith("/dashboard/students"),
    },
    {
      name: "Avaliações",
      href: "/dashboard/physical-assessments",
      icon: BarChart4,
      isActive: pathname.startsWith("/dashboard/physical-assessments"),
    },
    {
      name: "Dietas",
      href: "/dashboard/diets",
      icon: Utensils,
      isActive: pathname.startsWith("/dashboard/diets"),
    },
  ];

  // Navegação principal para alunos
  const studentMainNavigation = [
    {
      name: "Treinos",
      href: "/dashboard/my-workouts",
      icon: Activity,
      isActive: pathname.startsWith("/dashboard/my-workouts"),
    },
    {
      name: "Progresso",
      href: "/dashboard/my-progress",
      icon: BarChart4,
      isActive: pathname.startsWith("/dashboard/my-progress"),
    },
    {
      name: "Dietas",
      href: "/dashboard/diets",
      icon: Utensils,
      isActive: pathname.startsWith("/dashboard/diets"),
    },
    {
      name: "Conquistas",
      href: "/dashboard/my-achievements",
      icon: Trophy,
      isActive: pathname.startsWith("/dashboard/my-achievements"),
    },
  ];

  // Navegação secundária para o menu lateral
  const getSecondaryNavigation = () => {
    if (userRole === 'trainer') {
      return [
        { name: "Treinos", href: "/dashboard/workouts", icon: Activity },
        { name: "Conquistas", href: "/dashboard/achievements", icon: Trophy },
        { name: "Exercícios", href: "/dashboard/exercises", icon: Dumbbell },
        { name: "Rotinas", href: "/dashboard/workout-plans", icon: ClipboardList },
      ];
    } else {
      return [
        { name: "Avaliações", href: "/dashboard/progress", icon: Calendar },
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
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/95 to-white/80 dark:from-gray-900 dark:via-gray-900/95 dark:to-gray-900/80 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-800/50"></div>
        
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
                <div className={`relative p-2 rounded-full transition-all duration-300 ${
                  item.isActive 
                    ? "bg-gradient-to-r from-green-600 to-emerald-600 shadow-lg scale-110" 
                    : "bg-gray-100 dark:bg-gray-800/50 group-hover:bg-green-100 dark:group-hover:bg-green-900/30 group-hover:scale-105"
                }`}>
                  <item.icon className={`h-5 w-5 transition-colors duration-200 ${
                    item.isActive 
                      ? "text-white" 
                      : "text-gray-600 dark:text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400"
                  }`} />
                  
                  {/* Active indicator */}
                  {item.isActive && (
                    <div className="absolute -inset-1 bg-gradient-to-r from-green-600/30 to-emerald-600/30 rounded-full blur-md -z-10"></div>
                  )}
                </div>
                
                <span className={`text-xs font-medium transition-colors duration-200 truncate max-w-full ${
                  item.isActive 
                    ? "text-green-600 dark:text-green-400" 
                    : "text-gray-600 dark:text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400"
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
                  <div className="relative p-2 rounded-full bg-gray-100 dark:bg-gray-800/50 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 group-hover:scale-105 transition-all duration-300">
                    <Menu className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200" />
                  </div>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                    Menu
                  </span>
                </Button>
              </SheetTrigger>
              
              <SheetContent 
                side="bottom" 
                className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 rounded-t-3xl max-h-[80vh] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border-2 border-green-200 dark:border-green-800">
                      <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
                      <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-500 text-white font-bold">
                        {userInitial}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {profile?.full_name || "Usuário"}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {userRole === 'trainer' ? 'Personal Trainer' : 'Aluno'}
                      </p>
                    </div>
                  </div>
                  
                  {profile?.status === 'active' && (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-300 dark:border-green-600">
                      Online
                    </Badge>
                  )}
                </div>

                {/* Secondary Navigation */}
                <div className="space-y-3 mb-6">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
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
                        className={`group flex items-center gap-3 p-4 rounded-2xl transition-all duration-200 no-select ${
                          pathname.startsWith(item.href)
                            ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg"
                            : "bg-gray-50 dark:bg-gray-800/50 hover:bg-green-50 dark:hover:bg-green-900/20 text-gray-700 dark:text-gray-200"
                        }`}
                      >
                        <div className={`p-2 rounded-xl transition-all duration-200 ${
                          pathname.startsWith(item.href)
                            ? "bg-white/20"
                            : "bg-white dark:bg-gray-700 group-hover:bg-green-100 dark:group-hover:bg-green-900/30"
                        }`}>
                          <item.icon className={`h-5 w-5 transition-colors duration-200 ${
                            pathname.startsWith(item.href)
                              ? "text-white"
                              : "text-gray-600 dark:text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400"
                          }`} />
                        </div>
                        <span className="font-medium text-sm">{item.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-3 mb-6">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Ações Rápidas
                  </h4>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <Link
                      href="/dashboard/profile"
                      onClick={async () => {
                        await hapticFeedback('light');
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center gap-3 p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300 transition-all duration-200 group no-select"
                    >
                      <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-all duration-200">
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
                      className="flex items-center gap-3 p-4 rounded-2xl bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 text-purple-700 dark:text-purple-300 transition-all duration-200 group no-select"
                    >
                      <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/30 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-all duration-200">
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
                      className="flex items-center gap-3 p-4 rounded-2xl bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 text-orange-700 dark:text-orange-300 transition-all duration-200 group border-0 h-auto no-select"
                    >
                      <div className="relative p-2 rounded-xl bg-orange-100 dark:bg-orange-900/30 group-hover:bg-orange-200 dark:group-hover:bg-orange-900/50 transition-all duration-200">
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
                      className="flex items-center gap-3 p-4 rounded-2xl bg-yellow-50 dark:bg-gray-800/50 hover:bg-yellow-100 dark:hover:bg-gray-700/50 text-yellow-700 dark:text-yellow-300 transition-all duration-200 group border-0 h-auto no-select"
                    >
                      <div className="p-2 rounded-xl bg-yellow-100 dark:bg-gray-700/30 group-hover:bg-yellow-200 dark:group-hover:bg-gray-600/50 transition-all duration-200">
                        {theme === "dark" ? (
                          <Sun className="h-5 w-5 text-yellow-600" />
                        ) : (
                          <Moon className="h-5 w-5 text-gray-700" />
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
                    className="w-full flex items-center gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-700 dark:text-red-300 transition-all duration-200 group border-0 h-auto no-select"
                    variant="ghost"
                  >
                    <div className="p-2 rounded-xl bg-red-100 dark:bg-red-900/30 group-hover:bg-red-200 dark:group-hover:bg-red-900/50 transition-all duration-200">
                      <LogOut className="h-5 w-5" />
                    </div>
                    <span className="font-medium text-sm">Sair da Conta</span>
                  </Button>
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 pb-safe-bottom">
                  <p className="text-center text-xs text-gray-500 dark:text-gray-400">
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