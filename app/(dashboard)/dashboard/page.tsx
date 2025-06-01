'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/app/providers';

export default function DashboardPage() {
  const router = useRouter();
  const { supabase, session } = useSupabase();

  useEffect(() => {
    const checkUserRole = async () => {
      if (!session?.user?.id) return;

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', session.user.id)
          .single();

        if (error) throw error;

        if (profile?.role === 'student') {
          router.push('/dashboard/my-workouts');
        } else if (profile?.role === 'trainer') {
          router.push('/dashboard/students');
        }
      } catch (error) {
        console.error('Error checking user role:', error);
      }
    };

    checkUserRole();
  }, [session, supabase, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Setting up your dashboard...</h2>
        <p className="text-muted-foreground">Please wait while we redirect you to the appropriate view.</p>
      </div>
    </div>
  );
}