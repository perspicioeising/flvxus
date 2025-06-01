"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Dumbbell, Menu, User, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
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

  const userInitial = session?.user?.email?.charAt(0).toUpperCase() || "U";

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  // Navigation items based on user role
  const getNavigationItems = () => {
    if (userRole === 'trainer') {
      return [
        { name: "Dashboard", href: "/dashboard", current: pathname === "/dashboard" },
        { name: "Students", href: "/dashboard/students", current: pathname.startsWith("/dashboard/students") },
        { name: "Workouts", href: "/dashboard/workouts", current: pathname.startsWith("/dashboard/workouts") },
        { name: "Exercises", href: "/dashboard/exercises", current: pathname.startsWith("/dashboard/exercises") },
        { name: "Calendar", href: "/dashboard/calendar", current: pathname.startsWith("/dashboard/calendar") },
        { name: "Analytics", href: "/dashboard/analytics", current: pathname.startsWith("/dashboard/analytics") },
      ];
    } else {
      return [
        { name: "My Workouts", href: "/dashboard/my-workouts", current: pathname.startsWith("/dashboard/my-workouts") },
        { name: "Progress", href: "/dashboard/progress", current: pathname.startsWith("/dashboard/progress") },
        { name: "Profile", href: "/dashboard/profile", current: pathname.startsWith("/dashboard/profile") },
      ];
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full">
      <div className="flex h-16 items-center px-4 sm:px-6">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px]">
            <div className="flex items-center gap-2 mb-8">
              <Dumbbell className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">FitConnect Pro</span>
            </div>
            <nav className="flex flex-col gap-4">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    item.current
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        <div className="flex items-center gap-2 md:mr-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Dumbbell className="h-6 w-6 text-primary hidden md:block" />
            <span className="font-bold text-lg hidden md:block">FitConnect Pro</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-4 lg:space-x-6 mx-6">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                item.current
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-4">
          <ThemeToggle />
          
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full animate-pulse"></span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="" alt="Profile" />
                  <AvatarFallback className="bg-primary/10">{userInitial}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile" className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings" className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleSignOut}
                className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}