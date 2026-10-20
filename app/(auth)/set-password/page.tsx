'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/browser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Lock, Mail, User, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { senhaSchema } from '@/schemas/auth';

/**
 * Tela de definição de senha do aluno convidado.
 *
 * Fluxo (@supabase/ssr / PKCE): o convite leva o aluno a `/callback` (route
 * handler server-side), que troca o `code` por sessão (cookies) ANTES de chegar
 * aqui. Logo, quando esta tela monta, a sessão JÁ EXISTE server-side e o browser
 * client a lê pelos cookies. A tela só precisa: (1) confirmar que há sessão;
 * (2) `updateUser({ password })`; (3) ativar o profile (pending → active);
 * (4) redirecionar por papel. Sem sessão, mostramos "link inválido/expirado".
 *
 * A regra de senha é a MESMA do cadastro de professor (`senhaSchema`,
 * mínimo 8 caracteres) — nenhum critério extra é exigido aqui.
 */

interface UserInfo {
  email: string | null;
  name: string;
  role: 'student' | 'trainer';
  trainerName: string;
}

export default function SetPasswordPage() {
  const { toast } = useToast();
  const [supabase] = useState(() => createClient());

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const carregarSessao = async () => {
      setIsValidating(true);

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        setError('Link inválido ou expirado. Peça um novo convite ao seu professor.');
        setIsValidating(false);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('user_id', session.user.id)
        .single();

      const metadata = session.user.user_metadata ?? {};

      setUserInfo({
        email: session.user.email ?? null,
        name: profile?.full_name ?? metadata.full_name ?? 'Usuário',
        role: (profile?.role ?? metadata.role ?? 'student') as 'student' | 'trainer',
        trainerName: metadata.trainer_name ?? 'Seu Personal Trainer',
      });
      setIsValidating(false);
    };

    carregarSessao();
  }, [supabase]);

  const senhaValida = senhaSchema.safeParse(password).success;
  const senhasConferem = password === confirmPassword;

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!senhaValida) {
      setError('A senha deve ter pelo menos 8 caracteres.');
      return;
    }

    if (!senhasConferem) {
      setError('As senhas não coincidem.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { data, error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError || !data.user) {
        throw updateError ?? new Error('Não foi possível definir a senha.');
      }

      // Ativa o perfil do aluno (pending → active) e descobre o destino por papel.
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, status')
        .eq('user_id', data.user.id)
        .single();

      if (profile?.status === 'pending') {
        await supabase
          .from('profiles')
          .update({ status: 'active' })
          .eq('user_id', data.user.id);
      }

      toast({
        title: 'Senha definida com sucesso!',
        description: 'Bem-vindo à plataforma. Redirecionando...',
      });

      const destino = profile?.role === 'student' ? '/aluno' : '/professor';
      window.location.href = destino;
    } catch (err) {
      const mensagem =
        err instanceof Error ? err.message : 'Erro ao definir senha. Tente novamente.';
      setError(mensagem);
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
              Validando o seu convite
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
              Link inválido
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">{error}</p>
            <Button
              onClick={() => {
                window.location.href = '/login';
              }}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
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
                    Convite de: {userInfo.trainerName}
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
              <Label
                htmlFor="password"
                className="text-sm font-semibold text-gray-800 dark:text-gray-200"
              >
                Nova Senha
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10 bg-white/80 dark:bg-gray-800/80 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 h-12 text-base"
                  placeholder="Mínimo 8 caracteres"
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

            {/* Critério de senha (coerente com o cadastro de professor) */}
            {password && (
              <div
                className={`flex items-center gap-2 text-xs transition-colors ${
                  senhaValida ? 'text-green-600 dark:text-green-400' : 'text-gray-400'
                }`}
              >
                <CheckCircle className="h-3 w-3" />
                <span>Mínimo 8 caracteres</span>
              </div>
            )}

            {/* Confirmar Senha */}
            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="text-sm font-semibold text-gray-800 dark:text-gray-200"
              >
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
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {confirmPassword && !senhasConferem && (
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
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Botão de Confirmar */}
            <Button
              type="submit"
              disabled={!senhaValida || !senhasConferem || isLoading}
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
        </CardContent>
      </Card>
    </div>
  );
}
