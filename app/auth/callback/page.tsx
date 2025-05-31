'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/app/providers';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { supabase } = useSupabase();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Check if this is a new user (from invite)
        const timestamp = new Date(session.user.created_at);
        const now = new Date();
        const isNewUser = (now.getTime() - timestamp.getTime()) < 300000; // 5 minutes

        if (isNewUser) {
          router.push('/dashboard/profile/set-password');
        } else {
          router.push('/dashboard');
        }
      } else {
        router.push('/login');
      }
    };

    handleAuthCallback();
  }, [router, supabase]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Setting up your account...</h2>
        <p className="text-muted-foreground">Please wait while we configure your access.</p>
      </div>
    </div>
  );
}