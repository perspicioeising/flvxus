'use client';

import { Header } from "@/components/dashboard/header";
import { Sidebar } from "@/components/dashboard/sidebar";
import { useSupabase } from "@/app/providers";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { supabase, session } = useSupabase();
  const router = useRouter();
  const [userRole, setUserRole] = useState<'trainer' | 'student' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };


  useEffect(() => {
    const checkUserRole = async () => {
      if (!session?.user?.id) {
        router.push('/login');
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', session.user.id)
          .single();

        if (error) throw error;

        if (profile?.role) {
          setUserRole(profile.role);
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkUserRole();
  }, [session, supabase, router]);

   useEffect(() => {
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setVh();
    window.addEventListener('resize', setVh);
    return () => window.removeEventListener('resize', setVh);
  }, []);


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/40 to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-green-200 dark:border-green-800 rounded-full animate-spin border-t-green-600 dark:border-t-green-400"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent rounded-full animate-ping border-t-green-400 dark:border-t-green-500"></div>
          </div>
          <div className="space-y-2">          </div>
        </div>
      </div>
    );
  }

  // const mainMargin = isSidebarCollapsed ? 'md:ml-[70px]' : 'md:ml-64';


  return (
 <div className="min-h-[calc(var(--vh, 1vh) * 100)] bg-gray-50 dark:bg-gray-950">
      {/* Header - Mobile only */}
      <Header userRole={userRole} />

      {/* Layout Principal */}
      <div className="flex min-h-screen flex-col md:flex-row">
        {/* Sidebar - Desktop only */}
        <Sidebar
          userRole={userRole}
          isCollapsed={isSidebarCollapsed}
          toggleCollapse={toggleSidebar}
        />

        {/* Main Content */}
        <main className={`flex-1 overflow-y-auto transition-all duration-300 `}>
          <div className="min-h-[calc(var(--vh, 1vh) * 100)] pt-[24px] md:pt-0 px-3 sm:px-4 md:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-green-50/40 to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-black">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}