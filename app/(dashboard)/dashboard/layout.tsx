"use client";

import { useState, useEffect, useCallback } from "react";
import { useSupabase } from "@/app/providers";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { BottomNavigation } from "@/components/dashboard/bottom-navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session } = useSupabase();
  const [userRole, setUserRole] = useState<'trainer' | 'student' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const fetchUserRole = useCallback(async () => {
    try {
      if (!session || !session.user) {
        setUserRole(null);
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/profile');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }
      
      setUserRole(data.role);
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserRole(null);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchUserRole();
  }, [fetchUserRole]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/40 to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-green-200 dark:border-green-800 rounded-full animate-spin border-t-green-600 dark:border-t-green-400"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent rounded-full animate-ping border-t-green-400 dark:border-t-green-500"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-50 via-green-50/40 to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-black">
      {/* Mobile Layout */}
      <div className="flex flex-col h-full md:hidden">
        {/* Mobile Header */}
        <Header userRole={userRole} />
        
        {/* Mobile Main Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="pb-20">
            {children}
          </div>
        </main>
        
        {/* Bottom Navigation */}
        <BottomNavigation userRole={userRole} />
      </div>
      
      {/* Desktop Layout */}
      <div className="hidden md:flex h-full">
        {/* Desktop Sidebar */}
        <Sidebar 
          userRole={userRole} 
          isCollapsed={isSidebarCollapsed}
          toggleCollapse={toggleSidebar}
        />
        
        {/* Desktop Main Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}