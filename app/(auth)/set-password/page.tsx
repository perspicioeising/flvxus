'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/browser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Mail, User, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { senhaSchema } from '@/schemas/auth';
import { AuthScreen } from '@/components/auth/auth-screen';
import { AceiteLegalCheckbox } from '@/components/legal/aceite-legal-checkbox';
import { registrarAceiteLegal } from '@/actions/legal';
import { PRIVACY_VERSION, TERMS_VERSION } from '@/lib/legal/versions';

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
  const [aceiteLegal, setAceiteLegal] = useState(false);
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

    if (!aceiteLegal) {
      setError('É necessário aceitar os Termos e a Política de Privacidade.');
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

      // Aceite legal faz parte INDIVISÍVEL do primeiro acesso: a sessão já
      // existe aqui, então gravamos (IP/UA no servidor) ANTES do redirect. Se
      // falhar, bloqueamos o redirect e permitimos retry (não seguimos sem a
      // prova do aceite).
      const aceite = await registrarAceiteLegal({
        documents: [
          { type: 'terms', version: TERMS_VERSION },
          { type: 'privacy', version: PRIVACY_VERSION },
        ],
      });

      if (!aceite.ok) {
        throw new Error(
          aceite.message ?? 'Não foi possível registrar o aceite. Tente novamente.',
        );
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

  // Estado de sistema: validando o convite. Layout centrado mínimo (sem LogoIcon).
  if (isValidating) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" aria-hidden="true" />
        <div className="space-y-1">
          <h1 className="text-lg font-semibold text-foreground">
            Processando seu acesso...
          </h1>
          <p className="text-sm text-muted-foreground">Validando o seu convite</p>
        </div>
      </div>
    );
  }

  // Estado de sistema: link inválido. Layout centrado mínimo (sem LogoIcon).
  if (error && !userInfo) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="h-6 w-6" aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <h1 className="text-lg font-semibold text-foreground">Link inválido</h1>
          <p className="max-w-sm text-sm text-muted-foreground">{error}</p>
        </div>
        <Button
          size="xl"
          className="w-full max-w-sm"
          onClick={() => {
            window.location.href = '/login';
          }}
        >
          Ir para Login
        </Button>
      </div>
    );
  }

  return (
    <AuthScreen
      onSubmit={handleSetPassword}
      glowIcon
      title={
        <>
          DEFINA SUA
          <br />
          SENHA
        </>
      }
      subtitle="Para acessar a plataforma"
      primaryAction={
        <Button
          type="submit"
          size="xl"
          className="w-full"
          disabled={!senhaValida || !senhasConferem || !aceiteLegal || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              Definindo senha...
            </>
          ) : (
            "Definir senha e entrar"
          )}
        </Button>
      }
    >
      {userInfo && (
        <div className="space-y-2 rounded-2xl bg-muted/60 p-4">
          <div className="flex items-center gap-2 text-foreground">
            <User className="h-4 w-4" aria-hidden="true" />
            <span className="font-semibold">{userInfo.name}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4" aria-hidden="true" />
            <span className="break-all">{userInfo.email}</span>
          </div>
          {userInfo.role === 'student' && (
            <p className="text-xs text-muted-foreground">
              Convite de: {userInfo.trainerName}
            </p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="password">Nova senha</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="min-h-11 pr-11 text-base md:text-sm"
            placeholder="Mínimo 8 caracteres"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-md text-muted-foreground transition-colors hover:text-foreground"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

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

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmar senha</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="min-h-11 pr-11 text-base md:text-sm"
            placeholder="Confirme sua senha"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            aria-label={showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-md text-muted-foreground transition-colors hover:text-foreground"
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

      <AceiteLegalCheckbox
        checked={aceiteLegal}
        onCheckedChange={setAceiteLegal}
        disabled={isLoading}
      />

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </AuthScreen>
  );
}
