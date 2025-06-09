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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header - apenas mobile (md:hidden) */}
      <Header userRole={userRole} />

      {/* Layout Principal */}
      <div className="flex h-screen">
        {/* Sidebar - apenas desktop (hidden md:flex) */}
        <div className="hidden md:flex">
          <Sidebar userRole={userRole} />
        </div>

        {/* Conteúdo Principal */}
        <main className="flex-1 overflow-auto ">
          {/* Container do conteúdo com padding ajustado */}
          <div className="h-full pt-16 md:pt-0">
            <div className="p-3 sm:p-4 md:p-6 lg:p-8 bg-gradient-to-br from-gray-50 via-green-50/40 to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-black min-h-full">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}