"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  BarChart4, 
  Calendar, 
  Dumbbell, 
  Home,
  LayoutDashboard, 
  Settings, 
  Users,
  BookOpen,
  Activity,
  Heart,
  Trophy,
  HelpCircle
} from "lucide-react";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  const routes = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      isActive: pathname === "/dashboard",
    },
    {
      name: "Students",
      href: "/dashboard/students",
      icon: Users,
      isActive: pathname.startsWith("/dashboard/students"),
    },
    {
      name: "Workouts",
      href: "/dashboard/workouts",
      icon: Activity,
      isActive: pathname.startsWith("/dashboard/workouts"),
    },
    {
      name: "Exercises",
      href: "/dashboard/exercises",
      icon: Dumbbell,
      isActive: pathname.startsWith("/dashboard/exercises"),
    },
    {
      name: "Calendar",
      href: "/dashboard/calendar",
      icon: Calendar,
      isActive: pathname.startsWith("/dashboard/calendar"),
    },
    {
      name: "Analytics",
      href: "/dashboard/analytics",
      icon: BarChart4,
      isActive: pathname.startsWith("/dashboard/analytics"),
    },
    {
      name: "Programs",
      href: "/dashboard/programs",
      icon: BookOpen,
      isActive: pathname.startsWith("/dashboard/programs"),
    },
    {
      name: "Health",
      href: "/dashboard/health",
      icon: Heart,
      isActive: pathname.startsWith("/dashboard/health"),
    },
    {
      name: "Achievements",
      href: "/dashboard/achievements",
      icon: Trophy,
      isActive: pathname.startsWith("/dashboard/achievements"),
    },
  ];

  const bottomRoutes = [
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
      isActive: pathname.startsWith("/dashboard/settings"),
    },
    {
      name: "Help",
      href: "/dashboard/help",
      icon: HelpCircle,
      isActive: pathname.startsWith("/dashboard/help"),
    },
  ];

  return (
    <aside className={cn("pb-12 w-64 border-r bg-background flex flex-col", className)}>
      <div className="flex-1 space-y-1 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted",
                  route.isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <route.icon className="h-4 w-4" />
                {route.name}
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
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted",
                  route.isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <route.icon className="h-4 w-4" />
                {route.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}