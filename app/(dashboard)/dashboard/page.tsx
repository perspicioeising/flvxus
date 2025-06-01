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

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      if (profile?.role === 'student') {
        router.push('/dashboard/my-workouts');
      } else {
        router.push('/dashboard/students');
      }
    };

    checkUserRole();
  }, [session]);

  return null;
}