'use client';

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Dumbbell, Eye, EyeOff, Loader2, MailCheck } from "lucide-react";
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
import { cadastroProfessorSchema } from "@/schemas/auth";

type FormValues = z.infer<typeof cadastroProfessorSchema>;

function RegisterContent() {
  const router = useRouter();
  const { toast } = useToast();
  const { supabase } = useSupabase();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailEnviado, setEmailEnviado] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(cadastroProfessorSchema),
    defaultValues: {
      name: "",
      businessName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);

    try {
      // Cadastro via Supabase Auth (@supabase/ssr). O trigger handle_new_user()
      // cria o tenant + profile(role='trainer') a partir de `full_name`.
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.name,
            business_name: values.businessName,
          },
          emailRedirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}/callback`
              : undefined,
        },
      });

      if (error) {
        const jaCadastrado =
          error.status === 422 ||
          /already registered|already been registered|user already/i.test(error.message);

        toast({
          variant: "destructive",
          title: "Falha no cadastro",
          description: jaCadastrado
            ? "Este e-mail já está cadastrado. Faça login ou use outro e-mail."
            : error.message || "Algo deu errado. Por favor, tente novamente.",
        });

        if (jaCadastrado) {
          form.setError("email", {
            message: "Este e-mail já está cadastrado.",
          });
        }
        return;
      }

      // Quando a confirmação de e-mail está habilitada no projeto, o signUp
      // retorna o usuário SEM sessão: mostramos a tela "verifique seu e-mail".
      if (!data.session) {
        setEmailEnviado(values.email);
        toast({
          title: "Confirme seu e-mail 📧",
          description: "Enviamos um link de confirmação para o seu e-mail.",
        });
        return;
      }

      // Sem confirmação de e-mail: já há sessão → vai direto para a área do professor.
      toast({
        title: "Conta criada com sucesso! 🎉",
        description: "Redirecionando para o seu painel...",
      });
      router.push("/professor");
      router.refresh();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Falha no cadastro",
        description: error?.message || "Algo deu errado. Por favor, tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (emailEnviado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-3 text-center">
            <div
              className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary"
              aria-hidden="true"
            >
              <MailCheck className="h-6 w-6" />
            </div>
            <CardTitle>Verifique seu e-mail</CardTitle>
            <CardDescription>
              Enviamos um link de confirmação para
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <p className="font-medium text-foreground break-all">{emailEnviado}</p>
            <p className="text-sm text-muted-foreground">
              Abra o link para ativar sua conta e acessar a plataforma.
            </p>
            <Button asChild className="w-full min-h-11">
              <Link href="/login">Ir para o login</Link>
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
            <Dumbbell className="h-6 w-6" />
          </div>
          <CardTitle>Crie sua conta</CardTitle>
          <CardDescription>
            Comece a organizar seus alunos e treinos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome completo</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Seu nome completo"
                        className="min-h-11"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="businessName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da empresa</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nome do seu negócio"
                        className="min-h-11"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="seu@email.com"
                        className="min-h-11"
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
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Mínimo 8 caracteres"
                          className="min-h-11 pr-10"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar senha</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Repita a senha"
                          className="min-h-11 pr-10"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          aria-label={showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showConfirmPassword ? (
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

              <Button type="submit" className="w-full min-h-11" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                    Criando conta...
                  </>
                ) : (
                  "Criar conta gratuitamente"
                )}
              </Button>
            </form>
          </Form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Já tem uma conta?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Faça login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">Carregando...</p>
          </div>
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}
