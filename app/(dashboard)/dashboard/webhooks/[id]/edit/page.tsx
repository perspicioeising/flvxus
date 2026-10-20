'use client';

import { WebhookFormCarousel } from '@/components/webhooks/WebhookFormCarousel';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/browser';
import { useRouter } from 'next/navigation';
import { use } from 'react';

interface EditWebhookPageProps {
  params: Promise<{ id: string }>;
}

export default function EditWebhookPage({ params }: EditWebhookPageProps) {
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const supabase = createClient();
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

  return <WebhookFormCarousel mode="edit" webhookId={id} />;
}