'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Dumbbell, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

      // Redireciona por papel lendo profiles.role (trainer → /professor,
      // student → /aluno). O gate definitivo é server-side nos layouts.
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", data.user.id)
        .single();

      const destino = profile?.role === "student" ? "/aluno" : "/professor";

      toast({
        title: "Login bem-sucedido! 🎉",
        description: "Redirecionando...",
      });

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
   <div className="flex min-h-dvh items-center justify-center bg-app-gradient px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
      <Card className="w-full max-w-md border-app-muted shadow-app-large motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2 motion-safe:duration-300">
        <CardHeader className="space-y-3 pb-6 text-center">
          <div
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[hsl(var(--primary-soft))] text-[hsl(var(--primary-soft-foreground))] ring-1 ring-primary/20"
            aria-hidden="true"
          >
            <Dumbbell className="h-7 w-7" />
          </div>
          <CardTitle>Bem-vindo</CardTitle>
          <CardDescription className="text-balance">
            Acesse sua conta e continue sua jornada
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-4">
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
                        className="-my-1 rounded-sm py-1 text-sm font-medium text-app-accent underline-offset-4 hover:underline"
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

              <Button type="submit" className="w-full min-h-11 text-base md:text-sm" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>
          </Form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Não tem uma conta?{" "}
            <Link
              href="/register"
              className="rounded-sm font-medium text-app-accent underline-offset-4 hover:underline"
            >
              Cadastre-se gratuitamente
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
