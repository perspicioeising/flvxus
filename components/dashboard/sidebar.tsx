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
  User
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
      ];
    } else {
      return [
        {
          name: "My Workouts",
          href: "/dashboard/my-workouts",
          icon: Activity,
          isActive: pathname.startsWith("/dashboard/my-workouts"),
        },
        {
          name: "Progress",
          href: "/dashboard/progress",
          icon: BarChart4,
          isActive: pathname.startsWith("/dashboard/progress"),
        },
        {
          name: "Profile",
          href: "/dashboard/profile",
          icon: User,
          isActive: pathname.startsWith("/dashboard/profile"),
        },
      ];
    }
  };

  const routes = getRoutes();

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