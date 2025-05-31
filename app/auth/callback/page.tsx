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
        // Check if this is a student creation by looking at user metadata
        const isStudentCreation = session.user.user_metadata?.is_student_creation;
        
        if (isStudentCreation) {
          // If this is a new student, redirect to set password
          router.push('/dashboard/profile/set-password');
        } else {
          // For all other cases, redirect to dashboard
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