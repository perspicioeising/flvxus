'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSupabase } from '@/app/providers';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, MailCheck } from 'lucide-react';
import { AuthScreen } from '@/components/auth/auth-screen';

/**
 * Solicitação de recuperação de senha: o usuário informa o e-mail e recebe o
 * link de redefinição. Reutiliza o fluxo existente `resetPasswordForEmail`
 * com `redirectTo` para `/reset-password` (mesma rota que define a nova senha).
 */
export default function ForgotPasswordPage() {
  const { supabase } = useSupabase();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast({
        variant: 'destructive',
        title: 'Informe o seu e-mail',
        description: 'Precisamos do e-mail para enviar o link de recuperação.',
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo:
          typeof window !== 'undefined'
            ? `${window.location.origin}/reset-password`
            : undefined,
      });

      if (error) throw error;

      setEnviado(true);
      toast({
        title: 'E-mail enviado',
        description: 'Verifique sua caixa de entrada para redefinir a senha.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao enviar o e-mail',
        description: error?.message ?? 'Tente novamente em instantes.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (enviado) {
    return (
      <AuthScreen
        title={
          <>
            VERIFIQUE SEU
            <br />
            E-MAIL
          </>
        }
        subtitle="Enviamos um link para você redefinir a sua senha."
        primaryAction={
          <Button asChild size="xl" className="w-full">
            <Link href="/login">Voltar ao login</Link>
          </Button>
        }
      >
        <div className="space-y-4 rounded-2xl bg-muted/50 p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary-soft-foreground">
            <MailCheck className="h-6 w-6" aria-hidden="true" />
          </div>
          <p className="break-all text-lg font-bold text-foreground">{email}</p>
          <p className="text-sm text-muted-foreground">
            Abra o link no seu e-mail para criar uma nova senha.
          </p>
        </div>
      </AuthScreen>
    );
  }

  return (
    <AuthScreen
      onSubmit={handleSubmit}
      title={
        <>
          RECUPERAR
          <br />
          ACESSO
        </>
      }
      subtitle="Informe seu e-mail para receber o link de recuperação"
      primaryAction={
        <Button type="submit" size="xl" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              Enviando...
            </>
          ) : (
            'Enviar link de recuperação'
          )}
        </Button>
      }
      footer={
        <>
          Lembrou a senha?{' '}
          <Link
            href="/login"
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            Voltar ao login
          </Link>
        </>
      }
    >
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="go"
          placeholder="seu@email.com"
          className="min-h-11 text-base md:text-sm"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
    </AuthScreen>
  );
}
