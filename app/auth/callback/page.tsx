'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSupabase } from '@/app/providers';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { supabase } = useSupabase();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🚀 [AUTH CALLBACK] Iniciando processamento...');
        
        // Capturar parâmetros da URL
        const token = searchParams.get('token');
        const type = searchParams.get('type');
        const redirectTo = searchParams.get('redirect_to');
        
        console.log('📋 [AUTH CALLBACK] Parâmetros:', { token: !!token, type, redirectTo });

        // Se é um magic link ou invite, processar autenticação
        if (token && (type === 'magiclink' || type === 'invite')) {
          console.log('🔗 [AUTH CALLBACK] Processando magic link/invite...');
          
          // Verificar token com Supabase
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: type as any
          });

          if (error) {
            console.error('❌ [AUTH CALLBACK] Erro ao verificar token:', error);
            router.push('/login?error=invalid_token');
            return;
          }

          console.log('✅ [AUTH CALLBACK] Token verificado com sucesso!');
          
          // Aguardar um pouco para garantir que a sessão foi criada
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Verificar se é um novo usuário que precisa definir senha
          const userMetadata = data.user?.user_metadata;
          console.log('👤 [AUTH CALLBACK] User metadata:', userMetadata);
          
          if (userMetadata?.role === 'student' || redirectTo?.includes('set-password')) {
            console.log('🎯 [AUTH CALLBACK] Redirecionando para definir senha...');
            router.push('/set-password?new_user=true&welcome=true');
            return;
          }
        }

        // Para outros casos, processar callback normal
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('❌ [AUTH CALLBACK] Erro na sessão:', sessionError);
          router.push('/login?error=session_error');
          return;
        }

        const session = sessionData?.session;
        
        if (!session) {
          console.log('⚠️ [AUTH CALLBACK] Nenhuma sessão encontrada');
          router.push('/login');
          return;
        }

        console.log('✅ [AUTH CALLBACK] Sessão encontrada para:', session.user.email);

        // Verificar perfil do usuário
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, status, full_name')
          .eq('user_id', session.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('❌ [AUTH CALLBACK] Erro ao buscar perfil:', profileError);
          router.push('/login?error=profile_error');
          return;
        }

        if (!profile) {
          console.log('⚠️ [AUTH CALLBACK] Perfil não encontrado');
          router.push('/login?error=no_profile');
          return;
        }

        console.log('✅ [AUTH CALLBACK] Perfil encontrado:', profile.role);

        // Ativar perfil se estava pendente
        if (profile.status === 'pending') {
          await supabase
            .from('profiles')
            .update({ status: 'active' })
            .eq('user_id', session.user.id);
        }

        // Redirecionar baseado no papel do usuário
        if (profile.role === 'student') {
          router.push('/dashboard/student');
        } else {
          router.push('/dashboard');
        }

      } catch (error) {
        console.error('💥 [AUTH CALLBACK] Erro inesperado:', error);
        router.push('/login?error=unexpected_error');
      }
    };

    handleAuthCallback();
  }, [router, supabase, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-green-200 dark:border-green-800 rounded-full animate-spin border-t-green-600 dark:border-t-green-400"></div>
          <div className="absolute inset-0 w-20 h-20 border-4 border-transparent rounded-full animate-ping border-t-green-400 dark:border-t-green-500"></div>
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Processando seu acesso...
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Aguarde enquanto configuramos sua conta.
          </p>
        </div>
      </div>
    </div>
  );
}