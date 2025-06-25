'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Lock, Mail, User, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SetPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClientComponentClient();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const processAuthentication = async () => {
      try {
        setIsValidating(true);
        console.log('🔍 [SET PASSWORD] Iniciando processamento...');
        console.log('🔍 [SET PASSWORD] URL:', window.location.href);
        
        // 🔥 FORÇA o processamento de hash fragments PRIMEIRO
        const hash = window.location.hash;
        if (hash && hash.includes('access_token')) {
          console.log('🔗 [SET PASSWORD] Hash com tokens detectado, forçando processamento...');
          
          // Extrair tokens do hash
          const hashParams = new URLSearchParams(hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          
          if (accessToken && refreshToken) {
            console.log('💪 [SET PASSWORD] Definindo sessão com tokens do hash...');
            
            try {
              // Força a definição da sessão
              const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken
              });

              if (sessionError) {
                console.error('❌ [SET PASSWORD] Erro ao definir sessão:', sessionError);
                throw sessionError;
              }

              if (sessionData?.user) {
                console.log('✅ [SET PASSWORD] Sessão definida com sucesso:', sessionData.user.email);
                
                // Buscar perfil
                const { data: profile } = await supabase
                  .from('profiles')
                  .select('full_name, role')
                  .eq('user_id', sessionData.user.id)
                  .single();

                setUserInfo({
                  email: sessionData.user.email,
                  name: profile?.full_name || sessionData.user.user_metadata?.full_name || 'Usuário',
                  role: profile?.role || sessionData.user.user_metadata?.role || 'student',
                  trainer_name: sessionData.user.user_metadata?.trainer_name || 'Seu Personal Trainer'
                });

                // Limpar hash da URL
                window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
                
                setIsValidating(false);
                return; // Sucesso!
              }
              
            } catch (hashError) {
              console.error('❌ [SET PASSWORD] Erro ao processar tokens:', hashError);
              setError('Erro ao processar autenticação. Link pode estar expirado.');
              setIsValidating(false);
              return;
            }
          }
        }

        // Se não há hash ou falhou, verificar sessão existente
        console.log('🔍 [SET PASSWORD] Verificando sessão existente...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('❌ [SET PASSWORD] Erro na sessão:', sessionError);
          setError('Erro ao verificar sessão.');
          setIsValidating(false);
          return;
        }

        if (session?.user) {
          console.log('✅ [SET PASSWORD] Sessão existente encontrada:', session.user.email);
          
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, role')
            .eq('user_id', session.user.id)
            .single();

          setUserInfo({
            email: session.user.email,
            name: profile?.full_name || session.user.user_metadata?.full_name || 'Usuário',
            role: profile?.role || session.user.user_metadata?.role || 'student',
            trainer_name: session.user.user_metadata?.trainer_name || 'Seu Personal Trainer'
          });
        } else {
          console.warn('⚠️ [SET PASSWORD] Nenhuma sessão encontrada');
          setError('Acesso não autorizado. Use o link enviado por email.');
        }
        
      } catch (error) {
        console.error('💥 [SET PASSWORD] Erro geral:', error);
        setError('Erro ao processar acesso. Tente novamente.');
      } finally {
        setIsValidating(false);
      }
    };

    // Aguardar um tick para garantir que o DOM está pronto
    setTimeout(processAuthentication, 100);
  }, [supabase]);

  const validatePassword = (pwd: string) => {
    const minLength = pwd.length >= 8;
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNumber = /\d/.test(pwd);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);

    return {
      minLength,
      hasUpper,
      hasLower,
      hasNumber,
      hasSpecial,
      isValid: minLength && hasUpper && hasLower && hasNumber && hasSpecial
    };
  };

  const passwordValidation = validatePassword(password);
  const passwordsMatch = password === confirmPassword;

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordValidation.isValid) {
      setError('A senha não atende aos critérios de segurança.');
      return;
    }

    if (!passwordsMatch) {
      setError('As senhas não coincidem.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      console.log('🔐 [SET PASSWORD] Definindo nova senha...');

      // Atualizar senha do usuário
      const { data, error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) {
        throw updateError;
      }

      console.log('✅ [SET PASSWORD] Senha definida com sucesso!');

      // Buscar e atualizar perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, status, tenant_id')
        .eq('user_id', data.user?.id)
        .single();

      if (profile) {
        // Ativar o perfil se estava pendente
        if (profile.status === 'pending') {
          await supabase
            .from('profiles')
            .update({ status: 'active' })
            .eq('user_id', data.user?.id);
          console.log('✅ [SET PASSWORD] Perfil ativado!');
        }
      }

      toast({
        title: "Senha definida com sucesso! 🎉",
        description: "Bem-vindo à plataforma! Redirecionando...",
      });

      // Aguardar um pouco antes de redirecionar
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Redirecionar para dashboard
      console.log('🎯 [SET PASSWORD] Redirecionando para dashboard...');
      window.location.href = '/dashboard';

    } catch (error: any) {
      console.error('❌ [SET PASSWORD] Erro ao definir senha:', error);
      setError(error.message || 'Erro ao definir senha. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-0 shadow-2xl rounded-3xl">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="relative mb-6">
              <div className="w-16 h-16 border-4 border-green-200 dark:border-green-800 rounded-full animate-spin border-t-green-600 dark:border-t-green-400"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-ping border-t-green-400 dark:border-t-green-500"></div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Processando seu acesso...
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-center text-sm">
              Configurando sua conta e validando permissões
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !userInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-0 shadow-2xl rounded-3xl">
          <CardContent className="text-center py-12">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Acesso Inválido
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              {error}
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="w-full"
              >
                Tentar Novamente
              </Button>
              <Button
                onClick={() => window.location.href = '/login'}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              >
                Ir para Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-0 shadow-2xl rounded-3xl">
        <CardHeader className="text-center pb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <Lock className="h-10 w-10 text-white" />
          </div>
          
          <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Bem-vindo!
          </CardTitle>
          
          <p className="text-gray-600 dark:text-gray-400">
            Defina sua senha para acessar a plataforma
          </p>
          
          {userInfo && (
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-green-800 dark:text-green-300">
                  <User className="h-4 w-4" />
                  <span className="font-semibold">{userInfo.name}</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-400 text-sm">
                  <Mail className="h-4 w-4" />
                  <span>{userInfo.email}</span>
                </div>
                {userInfo.role === 'student' && (
                  <p className="text-xs text-green-600 dark:text-green-400 text-center">
                    Convite de: {userInfo.trainer_name}
                  </p>
                )}
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSetPassword} className="space-y-5">
            
            {/* Nova Senha */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                Nova Senha
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10 bg-white/80 dark:bg-gray-800/80 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 h-12 text-base"
                  placeholder="Digite sua nova senha"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Critérios de Senha */}
            {password && (
              <div className="space-y-3">
                <Label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  Critérios de Segurança
                </Label>
                <div className="grid grid-cols-1 gap-2 text-xs">
                  {[
                    { key: 'minLength', text: 'Mínimo 8 caracteres', valid: passwordValidation.minLength },
                    { key: 'hasUpper', text: 'Letra maiúscula', valid: passwordValidation.hasUpper },
                    { key: 'hasLower', text: 'Letra minúscula', valid: passwordValidation.hasLower },
                    { key: 'hasNumber', text: 'Número', valid: passwordValidation.hasNumber },
                    { key: 'hasSpecial', text: 'Caractere especial', valid: passwordValidation.hasSpecial }
                  ].map((criterion) => (
                    <div key={criterion.key} className={`flex items-center gap-2 transition-colors ${
                      criterion.valid ? 'text-green-600 dark:text-green-400' : 'text-gray-400'
                    }`}>
                      <CheckCircle className="h-3 w-3" />
                      <span>{criterion.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Confirmar Senha */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                Confirmar Senha
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pr-10 bg-white/80 dark:bg-gray-800/80 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 h-12 text-base"
                  placeholder="Confirme sua senha"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              
              {confirmPassword && !passwordsMatch && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  As senhas não coincidem
                </p>
              )}
            </div>

            {/* Erro */}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* Botão de Confirmar */}
            <Button
              type="submit"
              disabled={!passwordValidation.isValid || !passwordsMatch || isLoading}
              className="w-full h-14 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 disabled:from-gray-400 disabled:via-gray-400 disabled:to-gray-400 text-white rounded-xl font-bold text-lg shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:transform-none disabled:opacity-50 border-0"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                  Definindo Senha...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5 mr-3" />
                  Definir Senha e Entrar
                </>
              )}
            </Button>
          </form>

          {/* Informação de Segurança */}
          <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              🔒 Suas informações estão protegidas com criptografia de ponta a ponta
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}