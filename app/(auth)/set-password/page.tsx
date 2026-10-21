'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/browser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Loader2 className="mb-6 h-10 w-10 animate-spin text-primary" aria-hidden="true" />
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              Processando seu acesso...
            </h3>
            <p className="text-sm text-muted-foreground">
              Validando o seu convite
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !userInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-3 text-center">
            <div
              className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive"
              aria-hidden="true"
            >
              <AlertCircle className="h-6 w-6" />
            </div>
            <CardTitle>Link inválido</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => {
                window.location.href = '/login';
              }}
              className="w-full min-h-11"
            >
              Ir para Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3 text-center">
          <div
            className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary"
            aria-hidden="true"
          >
            <Lock className="h-6 w-6" />
          </div>
          <CardTitle>Bem-vindo!</CardTitle>
          <CardDescription>
            Defina sua senha para acessar a plataforma
          </CardDescription>

          {userInfo && (
            <div className="mt-2 space-y-2 rounded-lg border bg-muted/50 p-4 text-left">
              <div className="flex items-center justify-center gap-2 text-foreground">
                <User className="h-4 w-4" aria-hidden="true" />
                <span className="font-semibold">{userInfo.name}</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" aria-hidden="true" />
                <span>{userInfo.email}</span>
              </div>
              {userInfo.role === 'student' && (
                <p className="text-center text-xs text-muted-foreground">
                  Convite de: {userInfo.trainerName}
                </p>
              )}
            </div>
          )}
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSetPassword} className="space-y-5">
            {/* Nova Senha */}
            <div className="space-y-2">
              <Label htmlFor="password">Nova senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="min-h-11 pr-10"
                  placeholder="Mínimo 8 caracteres"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            {/* Critério de senha (coerente com o cadastro de professor) */}
            {password && (
              <div
                className={`flex items-center gap-2 text-xs transition-colors ${
                  senhaValida ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <CheckCircle className="h-3 w-3" aria-hidden="true" />
                <span>Mínimo 8 caracteres</span>
              </div>
            )}

            {/* Confirmar Senha */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar senha</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="min-h-11 pr-10"
                  placeholder="Confirme sua senha"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>

              {confirmPassword && !senhasConferem && (
                <p className="flex items-center gap-1 text-xs text-destructive">
                  <AlertCircle className="h-3 w-3" aria-hidden="true" />
                  As senhas não coincidem
                </p>
              )}
            </div>

            {/* Erro */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Botão de Confirmar */}
            <Button
              type="submit"
              disabled={!senhaValida || !senhasConferem || isLoading}
              className="w-full min-h-11"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  Definindo senha...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" aria-hidden="true" />
                  Definir senha e entrar
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
