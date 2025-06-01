'use client';

import { Header } from "@/components/dashboard/header";
import { Sidebar } from "@/components/dashboard/sidebar";
import { useSupabase } from "@/app/providers";
import { useEffect, useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { supabase, session } = useSupabase();
  const [userRole, setUserRole] = useState<'trainer' | 'student' | null>(null);

  useEffect(() => {
    const checkUserRole = async () => {
      if (!session?.user?.id) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      if (profile?.role) {
        setUserRole(profile.role);
      }
    };

    checkUserRole();
  }, [session, supabase]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header userRole={userRole} />
      <div className="flex flex-1">
        <Sidebar className="hidden md:flex" userRole={userRole} />
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}