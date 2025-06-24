'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Lock, Mail, CheckCircle, AlertCircle, Dumbbell, Sparkles } from 'lucide-react';

function SetPasswordContent() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const supabase = createClientComponentClient();

  // Validações de senha
  const passwordValidations = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };

  const isPasswordValid = Object.values(passwordValidations).every(Boolean);
  const passwordsMatch = password === confirmPassword && password.length > 0;

  useEffect(() => {
    const validateInvite = async () => {
      try {
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const type = searchParams.get('type');

        if (!accessToken || !refreshToken || type !== 'invite') {
          toast({
            variant: "destructive",
            title: "Link inválido",
            description: "Este link de convite é inválido ou expirou.",
          });
          router.push('/login');
          return;
        }

        // Definir a sessão com os tokens do convite
        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });

        if (sessionError) {
          throw sessionError;
        }

        if (sessionData.user) {
          setUserEmail(sessionData.user.email || '');
          setUserName(sessionData.user.user_metadata?.full_name || '');
        }

      } catch (error: any) {
        console.error('Erro ao validar convite:', error);
        toast({
          variant: "destructive",
          title: "Erro de validação",
          description: "Não foi possível validar o convite. Tente novamente.",
        });
        router.push('/login');
      } finally {
        setIsValidating(false);
      }
    };

    validateInvite();
  }, [searchParams, supabase.auth, toast, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isPasswordValid || !passwordsMatch) {
      toast({
        variant: "destructive",
        title: "Senha inválida",
        description: "Por favor, verifique os requisitos da senha.",
      });
      return;
    }

    try {
      setIsLoading(true);

      // Atualizar a senha do usuário
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Senha definida com sucesso! 🎉",
        description: "Sua conta foi ativada. Você será redirecionado para o dashboard.",
      });

      // Pequeno delay para mostrar o sucesso
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);

    } catch (error: any) {
      console.error('Erro ao definir senha:', error);
      toast({
        variant: "destructive",
        title: "Erro ao definir senha",
        description: error.message || "Tente novamente em alguns instantes.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen bg-app-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-app-text-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-app-text-secondary">Validando convite...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        {/* Header com logo */}
        <div className="text-center mb-8">
          <div className="relative inline-flex items-center gap-3 mb-4">
            <div className="relative">
              <div className="w-16 h-16 bg-achievement-consecutive rounded-2xl flex items-center justify-center shadow-app-xl">
                <Dumbbell className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Sparkles className="h-3 w-3 text-white" />
              </div>
            </div>
            <span className="text-2xl font-black text-app-heading">FLVXUS</span>
          </div>
          <h1 className="text-2xl font-bold text-app-heading mb-2">
            Bem-vindo ao FLVXUS!
          </h1>
          <p className="text-app-text-secondary">
            Defina sua senha para acessar a plataforma
          </p>
        </div>

        {/* Card principal */}
        <Card className="border-0 bg-app-card shadow-app-xl rounded-2xl">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center gap-2 text-app-text-accent mb-2">
              <Mail className="h-5 w-5" />
              <span className="text-sm font-medium">Convite para: {userEmail}</span>
            </div>
            {userName && (
              <p className="text-app-text-secondary text-sm">
                Olá, {userName}! 👋
              </p>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Campo de senha */}
              <div className="space-y-3">
                <Label htmlFor="password" className="text-sm font-semibold text-app-text-primary flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Nova Senha
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 bg-app-bg-card border-app-border-muted rounded-xl pr-12 text-base focus:border-app-text-accent"
                    placeholder="Digite sua nova senha"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-app-text-muted hover:text-app-text-primary"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                {/* Requisitos da senha */}
                <div className="space-y-2">
                  {Object.entries({
                    minLength: 'Pelo menos 8 caracteres',
                    hasUppercase: 'Uma letra maiúscula',
                    hasLowercase: 'Uma letra minúscula', 
                    hasNumber: 'Um número',
                    hasSpecial: 'Um caractere especial'
                  }).map(([key, text]) => (
                    <div key={key} className="flex items-center gap-2 text-sm">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        passwordValidations[key as keyof typeof passwordValidations]
                          ? 'bg-app-achievement-workout text-white'
                          : 'bg-app-border-muted text-app-text-muted'
                      }`}>
                        {passwordValidations[key as keyof typeof passwordValidations] ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-current"></div>
                        )}
                      </div>
                      <span className={passwordValidations[key as keyof typeof passwordValidations] 
                        ? 'text-app-achievement-workout' 
                        : 'text-app-text-muted'
                      }>
                        {text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Confirmar senha */}
              <div className="space-y-3">
                <Label htmlFor="confirmPassword" className="text-sm font-semibold text-app-text-primary">
                  Confirmar Senha
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`h-12 bg-app-bg-card border-app-border-muted rounded-xl pr-12 text-base focus:border-app-text-accent ${
                      confirmPassword && !passwordsMatch ? 'border-red-500' : ''
                    }`}
                    placeholder="Confirme sua senha"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-app-text-muted hover:text-app-text-primary"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                
                {confirmPassword && !passwordsMatch && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>As senhas não coincidem</span>
                  </div>
                )}
              </div>

              {/* Botão de submit */}
              <Button
                type="submit"
                disabled={!isPasswordValid || !passwordsMatch || isLoading}
                className="w-full h-12 btn-gradient-primary rounded-xl font-bold text-lg shadow-app-xl transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Definindo senha...
                  </>
                ) : (
                  'Definir Senha e Acessar'
                )}
              </Button>
            </form>

            {/* Info de segurança */}
            <div className="bg-app-text-accent/10 border border-app-border-accent rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Lock className="h-5 w-5 text-app-text-accent mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-app-text-primary mb-1">
                    Segurança
                  </h4>
                  <p className="text-sm text-app-text-secondary">
                    Sua senha será criptografada e mantida em segurança. Você poderá alterá-la a qualquer momento nas configurações.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Link para suporte */}
        <div className="text-center mt-6">
          <p className="text-sm text-app-text-secondary">
            Problemas com o convite?{' '}
            <a href="mailto:suporte@flvxus.com" className="text-app-text-accent hover:underline font-medium">
              Entre em contato
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-app-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-app-text-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-app-text-secondary">Carregando...</p>
        </div>
      </div>
    }>
      <SetPasswordContent />
    </Suspense>
  );
}