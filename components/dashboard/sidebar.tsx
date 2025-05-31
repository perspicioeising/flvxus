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
  Users 
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
      icon: Home,
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
      name: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
      isActive: pathname.startsWith("/dashboard/settings"),
    },
  ];

  return (
    <aside className={cn("pb-12 w-64 border-r bg-background", className)}>
      <div className="space-y-4 py-4">
        <div className="px-4 py-2">
          <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
            Main
          </h2>
          <div className="space-y-1">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
                  route.isActive ? "bg-accent text-accent-foreground" : "transparent"
                )}
              >
                <route.icon className="mr-2 h-4 w-4" />
                {route.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}