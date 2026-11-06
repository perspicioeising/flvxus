'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useSupabase } from "@/app/providers";
import { loginSchema } from "@/schemas/auth";
import { AuthScreen } from "@/components/auth/auth-screen";
import { lerIntencao, queryIntencao } from "@/lib/billing/intencao";

type FormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { supabase } = useSupabase();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error || !data.user) {
        toast({
          variant: "destructive",
          title: "Falha no login",
          description: error?.message ?? "Não foi possível entrar. Verifique suas credenciais.",
        });
        return;
      }

      // Redireciona por papel lendo profiles. O aluno vinculado (student) e o
      // aluno autônomo (trainer + self_managed) vão para /aluno — este é o
      // painel deles. O professor B2B (trainer professional) vai para
      // /professor. O gate definitivo é server-side nos layouts.
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, account_type")
        .eq("user_id", data.user.id)
        .single();

      const destino =
        profile?.role === "student" || profile?.account_type === "self_managed"
          ? "/aluno"
          : "/professor";

      toast({
        title: "Login bem-sucedido! 🎉",
        description: "Redirecionando...",
      });

      // Intenção de assinatura vinda da landing (plano/ciclo): após autenticar,
      // segue para /assinar (checkout). Só aceita valores validados por Zod.
      const intencao = lerIntencao(new URLSearchParams(window.location.search));
      if (intencao?.acao === "assinar" && profile?.role !== "student") {
        window.location.assign(`/assinar?${queryIntencao(intencao)}`);
        return;
      }
      router.push(destino);
      router.refresh();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Algo deu errado",
        description: error.message || "Falha ao fazer login. Por favor, tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <AuthScreen
        onSubmit={form.handleSubmit(onSubmit)}
        title={
          <>
            BEM-VINDO
            <br />
            DE VOLTA
          </>
        }
        subtitle="Acesse sua conta e continue sua jornada"
        primaryAction={
          <Button
            type="submit"
            size="xl"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                Entrando...
              </>
            ) : (
              "Entrar"
            )}
          </Button>
        }
        footer={
          <>
            Não tem uma conta?{" "}
            <Link
              href="/register"
              className="font-semibold text-primary underline-offset-4 hover:underline"
            >
              Cadastre-se gratuitamente
            </Link>
          </>
        }
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  enterKeyHint="next"
                  placeholder="seu@email.com"
                  className="min-h-11 text-base md:text-sm"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between gap-2">
                <FormLabel>Senha</FormLabel>
                <Link
                  href="/forgot-password"
                  className="-my-1 rounded-sm py-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    enterKeyHint="go"
                    placeholder="Sua senha"
                    className="min-h-11 pr-11 text-base md:text-sm"
                    {...field}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-md text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </AuthScreen>
    </Form>
  );
}
