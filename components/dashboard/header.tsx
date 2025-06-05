// components/dashboard/header.tsx - MODERNIZADO
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Dumbbell, Menu, User, Settings, LogOut, Search, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { useSupabase } from "@/app/providers";
import { useRouter } from "next/navigation";

interface HeaderProps {
  userRole: 'trainer' | 'student' | null;
}

export function Header({ userRole }: HeaderProps) {
  const { supabase, session } = useSupabase();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

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

  const getNavigationItems = () => {
    if (userRole === 'trainer') {
      return [
        { name: "Dashboard", href: "/dashboard", current: pathname === "/dashboard" },
        { name: "Alunos", href: "/dashboard/students", current: pathname.startsWith("/dashboard/students") },
        { name: "Treinos", href: "/dashboard/workouts", current: pathname.startsWith("/dashboard/workouts") },
        { name: "Exercícios", href: "/dashboard/exercises", current: pathname.startsWith("/dashboard/exercises") },
        { name: "Planos", href: "/dashboard/workout-plans", current: pathname.startsWith("/dashboard/workout-plans") },
        { name: "Dietas", href: "/dashboard/diets", current: pathname.startsWith("/dashboard/diets") },
      ];
    } else {
      return [
        { name: "Meus Treinos", href: "/dashboard/my-workouts", current: pathname.startsWith("/dashboard/my-workouts") },
        { name: "Progresso", href: "/dashboard/progress", current: pathname.startsWith("/dashboard/progress") },
         { name: "Dietas", href: "/dashboard/diets", current: pathname.startsWith("/dashboard/diets") },
        { name: "Perfil", href: "/dashboard/profile", current: pathname.startsWith("/dashboard/profile") },
      ];
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 shadow-lg">
      <div className="container mx-auto">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          
          {/* Mobile Menu & Logo */}
          <div className="flex items-center gap-4">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="md:hidden p-2 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-all"
                >
                  <Menu className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[350px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-r border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3 mb-8 p-2">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Dumbbell className="h-6 w-6 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <Zap className="h-2 w-2 text-white" />
                    </div>
                  </div>
                  <div>
                    <span className="font-black text-xl bg-gradient-to-r from-gray-900 via-green-600 to-gray-900 dark:from-white dark:via-green-400 dark:to-white bg-clip-text text-transparent">
                      FLVXUS
                    </span>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Personal Training</p>
                  </div>
                </div>
                <nav className="space-y-2">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                        item.current
                          ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg"
                          : "text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-700 dark:hover:text-green-300"
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <div className={`w-2 h-2 rounded-full transition-all ${
                        item.current ? 'bg-white' : 'bg-green-500 opacity-0 group-hover:opacity-100'
                      }`} />
                      {item.name}
                    </Link>
                  ))}
                </nav>
                
                {/* Mobile User Info */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                    <Avatar className="h-10 w-10 border-2 border-green-200 dark:border-green-800">
                      <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
                      <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-500 text-white font-bold">
                        {userInitial}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {profile?.full_name || "Usuário"}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        {userRole === 'trainer' ? 'Personal Trainer' : 'Aluno'}
                      </p>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Desktop Logo */}
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110">
                  <Dumbbell className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Zap className="h-2 w-2 text-white" />
                </div>
              </div>
              <div className="hidden lg:block">
                <span className="font-black text-xl bg-gradient-to-r from-gray-900 via-green-600 to-gray-900 dark:from-white dark:via-green-400 dark:to-white bg-clip-text text-transparent">
                  FLVXUS
                </span>
                <p className="text-xs text-gray-600 dark:text-gray-400 -mt-1">Personal Training</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  item.current
                    ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg"
                    : "text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-700 dark:hover:text-green-300"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 lg:gap-3">
            
        

            {/* Theme Toggle */}
            <div className="p-2">
              <ThemeToggle />
            </div>
            
            {/* Notifications */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative p-2 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-all"
            >
              <Bell className="h-5 w-5 text-gray-700 dark:text-gray-200" />
              <span className="absolute top-1 right-1 w-3 h-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
              </span>
            </Button>
            
            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative p-1 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-all">
                  <Avatar className="h-9 w-9 border-2 border-green-200 dark:border-green-800">
                    <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
                    <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-500 text-white font-bold">
                      {userInitial}
                    </AvatarFallback>
                  </Avatar>
                  {profile?.status === 'active' && (
                    <div className="absolute -bottom-0 -right-0 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200 dark:border-gray-800 shadow-2xl rounded-2xl p-2">
                <DropdownMenuLabel className="p-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border-2 border-green-200 dark:border-green-800">
                      <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
                      <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-500 text-white font-bold">
                        {userInitial}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white truncate">
                        {profile?.full_name || "Usuário"}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {profile?.email}
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                        {userRole === 'trainer' ? 'Personal Trainer' : 'Aluno'}
                      </p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                <DropdownMenuItem asChild className="p-0 m-1">
                  <Link 
                    href="/dashboard/profile" 
                    className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-green-50 dark:hover:bg-green-900/20 transition-all"
                  >
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                      <User className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="font-medium">Meu Perfil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="p-0 m-1">
                  <Link 
                    href="/dashboard/settings" 
                    className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                  >
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <Settings className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="font-medium">Configurações</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
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
          </div>
        </div>
      </div>
    </header>
  );
}