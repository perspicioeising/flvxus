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
        // Check if user has set their password by checking last_sign_in_at
        // If it's null, they haven't logged in before (invited user)
        if (!session.user.last_sign_in_at) {
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