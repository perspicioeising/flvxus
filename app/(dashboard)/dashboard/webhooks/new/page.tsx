'use client';

import { WebhookFormCarousel } from '@/components/webhooks/WebhookFormCarousel';
import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

export default function NewWebhookPage() {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      if (profile?.role !== 'trainer') {
        router.push('/dashboard/webhooks');
        return;
      }

      setAuthorized(true);
    } catch (error) {
      console.error('Erro na autorização:', error);
      router.push('/dashboard/webhooks');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-app-gradient flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-app-text-accent"></div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return <WebhookFormCarousel mode="create" />;
}