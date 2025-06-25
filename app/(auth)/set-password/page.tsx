'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Lock, Mail, User, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
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

  const type = searchParams.get('type');
  const newUser = searchParams.get('new_user') === 'true';
  const welcome = searchParams.get('welcome') === 'true';

  useEffect(() => {
    const validateSession = async () => {
      try {
        setIsValidating(true);
        console.log('🔍 [SET PASSWORD] Validando sessão...');
        
        // 🔥 PRIMEIRO: Verificar se há parâmetros de token na URL
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const tokenType = urlParams.get('type');
        
        console.log('🔍 [SET PASSWORD] Parâmetros URL:', { token: !!token, tokenType });
        
        // Se há token, tentar autenticar primeiro
        if (token && tokenType) {
          console.log('🔗 [SET PASSWORD] Token encontrado, autenticando...');
          
          try {
            const { data: authData, error: verifyError } = await supabase.auth.verifyOtp({
              token_hash: token,
              type: tokenType as any
            });

            if (verifyError) {
              console.error('❌ [SET PASSWORD] Erro ao verificar token:', verifyError);
              setError('Link inválido ou expirado. Solicite um novo convite.');
              return;
            }

            if (authData?.user) {
              console.log('✅ [SET PASSWORD] Autenticado via token:', authData.user.email);
              
              // Buscar perfil
              const { data: profile } = await supabase
                .from('profiles')
                .select('full_name, role')
                .eq('user_id', authData.user.id)
                .single();

              setUserInfo({
                email: authData.user.email,
                name: profile?.full_name || authData.user.user_metadata?.full_name || 'Usuário',
                role: profile?.role || authData.user.user_metadata?.role || 'student',
                trainer_name: authData.user.user_metadata?.trainer_name || 'Seu Personal Trainer'
              });
              
              return; // Sucesso, sair da função
            }
            
          } catch (tokenError) {
            console.error('❌ [SET PASSWORD] Erro no processamento do token:', tokenError);
            setError('Erro ao processar link de acesso. Tente novamente.');
            return;
          }
        }
        
        // 🔥 SEGUNDO: Verificar se já há uma sessão ativa
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('❌ [SET PASSWORD] Erro ao verificar sessão:', sessionError);
          setError('Erro ao verificar sessão. Tente acessar o link novamente.');
          return;
        }

        if (session?.user) {
          console.log('✅ [SET PASSWORD] Sessão ativa encontrada:', session.user.email);
          
          // Buscar informações do perfil
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
          console.warn('⚠️ [SET PASSWORD] Nenhuma sessão encontrada e sem token válido');
          setError('Acesso não autorizado. Use o link enviado por email.');
        }
        
      } catch (error) {
        console.error('💥 [SET PASSWORD] Erro na validação:', error);
        setError('Erro ao validar acesso. Tente novamente.');
      } finally {
        setIsValidating(false);
      }
    };

    validateSession();
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
        description: "Você já pode acessar sua conta.",
      });

      // Aguardar um pouco antes de redirecionar
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Redirecionar baseado no papel do usuário
      if (userInfo?.role === 'student') {
        console.log('👤 [SET PASSWORD] Redirecionando estudante...');
        router.push('/dashboard');
      } else {
        console.log('👨‍🏫 [SET PASSWORD] Redirecionando trainer...');
        router.push('/dashboard');
      }

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
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-green-600 dark:text-green-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Validando acesso...</p>
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
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Acesso Inválido
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error}
            </p>
            <Button
              onClick={() => router.push('/login')}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg"
            >
              Ir para Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-0 shadow-2xl rounded-3xl">
        <CardHeader className="text-center pb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Lock className="h-8 w-8 text-white" />
          </div>
          
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            {newUser ? 'Bem-vindo!' : 'Definir Nova Senha'}
          </CardTitle>
          
          {userInfo && (
            <div className="space-y-2 mt-4">
              <div className="flex items-center justify-center gap-2 text-gray-800 dark:text-gray-200">
                <User className="h-4 w-4" />
                <span className="font-semibold">{userInfo.name}</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                <Mail className="h-4 w-4" />
                <span>{userInfo.email}</span>
              </div>
              {newUser && userInfo.role === 'student' && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Convite de: {userInfo.trainer_name}
                </p>
              )}
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSetPassword} className="space-y-4">
            
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
                  className="pr-10 bg-white/80 dark:bg-gray-800/80 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 h-12"
                  placeholder="Digite sua nova senha"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Critérios de Senha */}
            {password && (
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                  Critérios de Segurança:
                </Label>
                <div className="grid grid-cols-1 gap-1 text-xs">
                  <div className={`flex items-center gap-2 ${passwordValidation.minLength ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                    <CheckCircle className="h-3 w-3" />
                    Mínimo 8 caracteres
                  </div>
                  <div className={`flex items-center gap-2 ${passwordValidation.hasUpper ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                    <CheckCircle className="h-3 w-3" />
                    Letra maiúscula
                  </div>
                  <div className={`flex items-center gap-2 ${passwordValidation.hasLower ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                    <CheckCircle className="h-3 w-3" />
                    Letra minúscula
                  </div>
                  <div className={`flex items-center gap-2 ${passwordValidation.hasNumber ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                    <CheckCircle className="h-3 w-3" />
                    Número
                  </div>
                  <div className={`flex items-center gap-2 ${passwordValidation.hasSpecial ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                    <CheckCircle className="h-3 w-3" />
                    Caractere especial
                  </div>
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
                  className="pr-10 bg-white/80 dark:bg-gray-800/80 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 h-12"
                  placeholder="Confirme sua senha"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              
              {confirmPassword && !passwordsMatch && (
                <p className="text-xs text-red-500">
                  As senhas não coincidem
                </p>
              )}
            </div>

            {/* Erro */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              </div>
            )}

            {/* Botão de Confirmar */}
            <Button
              type="submit"
              disabled={!passwordValidation.isValid || !passwordsMatch || isLoading}
              className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-bold text-lg shadow-xl transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:opacity-50 border-0"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Definindo Senha...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5 mr-2" />
                  Definir Senha
                </>
              )}
            </Button>
          </form>

          {/* Informação de Segurança */}
          <div className="text-center text-xs text-gray-600 dark:text-gray-400">
            <p>
              Após definir sua senha, você terá acesso completo à plataforma.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}