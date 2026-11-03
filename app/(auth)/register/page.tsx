'use client';

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { CheckCircle, Eye, EyeOff, Loader2, MailCheck, XCircle } from "lucide-react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useSupabase } from "@/app/providers";
import { cadastroProfessorSchema } from "@/schemas/auth";
import { AuthScreen } from "@/components/auth/auth-screen";
import { AceiteLegalCheckbox } from "@/components/legal/aceite-legal-checkbox";
import { registrarAceiteLegal } from "@/actions/legal";
import { definirHandle, verificarDisponibilidadeHandle } from "@/actions/arena-social";
import { sugerirUsername } from "@/lib/arena/social";
import { PRIVACY_VERSION, TERMS_VERSION } from "@/lib/legal/versions";

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
      accountType: "professional",
      businessName: "",
      socialHandle: "",
      email: "",
      password: "",
      confirmPassword: "",
      // Começa desmarcado; o schema (z.literal(true)) bloqueia o submit até ser
      // marcado. O cast reflete que o valor inicial não satisfaz o literal ainda.
      aceiteLegal: false as true,
    },
  });

  const aceiteLegal = form.watch("aceiteLegal");
  const accountType = form.watch("accountType");
  const isSelfManaged = accountType === "self_managed";

  // UX do nome de usuário (apenas self_managed). Pré-preenchemos uma sugestão a
  // partir do nome/e-mail ENQUANTO o usuário não editou o campo manualmente;
  // depois do primeiro toque, paramos de semear para não sobrescrever a escolha.
  const name = form.watch("name");
  const email = form.watch("email");
  const socialHandle = form.watch("socialHandle") ?? "";
  const usernameEditadoRef = useRef(false);
  const [disponibilidade, setDisponibilidade] = useState<
    "idle" | "checking" | "available" | "taken"
  >("idle");

  useEffect(() => {
    if (!isSelfManaged || usernameEditadoRef.current) return;
    const sugestao = sugerirUsername(name, email);
    form.setValue("socialHandle", sugestao, { shouldValidate: false });
  }, [isSelfManaged, name, email, form]);

  // Checagem de disponibilidade com debounce ANTES do submit. Só roda quando o
  // valor normalizado tem formato válido; caso contrário o hint fica 'idle' e o
  // FormMessage do zod cobre o erro de formato.
  const socialHandleNormalizado = socialHandle
    .trim()
    .replace(/^@/, "")
    .toLowerCase();
  const formatoUsernameValido = /^[a-z0-9_]{3,30}$/.test(socialHandleNormalizado);

  useEffect(() => {
    if (!isSelfManaged || !formatoUsernameValido) {
      setDisponibilidade("idle");
      return;
    }
    let cancelado = false;
    setDisponibilidade("checking");
    const timer = setTimeout(async () => {
      const { disponivel } = await verificarDisponibilidadeHandle(
        socialHandleNormalizado,
      );
      if (cancelado) return;
      setDisponibilidade(disponivel ? "available" : "taken");
    }, 400);
    return () => {
      cancelado = true;
      clearTimeout(timer);
    };
  }, [isSelfManaged, formatoUsernameValido, socialHandleNormalizado]);

  // Bloqueia o submit do aluno autônomo enquanto o username não for válido e
  // disponível (o 'professional' não tem esse campo, então não bloqueia).
  const usernameBloqueia =
    isSelfManaged && (!formatoUsernameValido || disponibilidade !== "available");

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
            // O aluno autônomo (self_managed) não tem empresa; só enviamos
            // business_name quando há valor para não poluir os metadados.
            ...(values.businessName
              ? { business_name: values.businessName }
              : {}),
            account_type: values.accountType,
            // Carrega o nome de usuário escolhido nos metadados para que o
            // caminho de confirmação por e-mail (/callback) possa concluir a
            // gravação em profiles.social_handle depois, quando a sessão surgir.
            ...(values.accountType === "self_managed" && values.socialHandle
              ? { social_handle: values.socialHandle }
              : {}),
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

      // Sem confirmação de e-mail: já há sessão → materializa o aceite legal
      // (IP/UA capturados no servidor) ANTES de redirecionar. Quando o signUp
      // retorna SEM sessão (ramo acima), o aceite é materializado no /callback
      // na primeira entrada autenticada. A falha aqui NÃO bloqueia o cadastro
      // (já feito): apenas avisa, e o gancho do /callback tentará de novo.
      const aceite = await registrarAceiteLegal({
        documents: [
          { type: "terms", version: TERMS_VERSION },
          { type: "privacy", version: PRIVACY_VERSION },
        ],
      });

      if (!aceite.ok) {
        toast({
          variant: "destructive",
          title: "Aviso",
          description:
            aceite.message ??
            "Não foi possível registrar o aceite agora; tentaremos novamente no próximo acesso.",
        });
      }

      // Aluno autônomo com sessão imediata: grava o nome de usuário já. Em caso
      // de corrida de unicidade ('em_uso'), avisamos em pt-BR e mantemos o
      // usuário no formulário para escolher outro (não seguimos com redirect).
      if (values.accountType === "self_managed" && values.socialHandle) {
        const resultado = await definirHandle(values.socialHandle);
        if (resultado.status === "em_uso") {
          setDisponibilidade("taken");
          form.setError("socialHandle", {
            message: "Esse nome de usuário já está em uso.",
          });
          toast({
            variant: "destructive",
            title: "Nome de usuário indisponível",
            description: "Esse nome de usuário já está em uso.",
          });
          return;
        }
      }

      toast({
        title: "Conta criada com sucesso! 🎉",
        description: "Redirecionando para o seu painel...",
      });
      router.push(values.accountType === "self_managed" ? "/aluno" : "/professor");
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
      <AuthScreen
        title={
          <>
            VERIFIQUE SEU
            <br />
            E-MAIL
          </>
        }
        subtitle="Enviamos um link de confirmação para ativar a sua conta."
        primaryAction={
          <Button asChild size="xl" className="w-full">
            <Link href="/login">Ir para o login</Link>
          </Button>
        }
      >
        <div className="space-y-4 rounded-2xl bg-muted/50 p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary-soft-foreground">
            <MailCheck className="h-6 w-6" aria-hidden="true" />
          </div>
          <p className="break-all text-lg font-bold text-foreground">
            {emailEnviado}
          </p>
          <p className="text-sm text-muted-foreground">
            Abra o link no seu e-mail para ativar a conta e acessar a plataforma.
          </p>
        </div>
      </AuthScreen>
    );
  }

  return (
    <Form {...form}>
      <AuthScreen
        onSubmit={form.handleSubmit(onSubmit)}
        title={
          <>
            CRIE SUA
            <br />
            CONTA
          </>
        }
        subtitle={
          isSelfManaged
            ? "Monte e acompanhe os seus próprios treinos"
            : "Comece a organizar seus alunos e treinos"
        }
        primaryAction={
          <Button
            type="submit"
            size="xl"
            className="w-full"
            disabled={isLoading || !aceiteLegal || usernameBloqueia}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                Criando conta...
              </>
            ) : (
              "Criar conta gratuitamente"
            )}
          </Button>
        }
        footer={
          <>
            Já tem uma conta?{" "}
            <Link
              href="/login"
              className="font-semibold text-primary underline-offset-4 hover:underline"
            >
              Faça login
            </Link>
          </>
        }
      >
        <FormField
          control={form.control}
          name="accountType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Como você vai usar o Flvxus?</FormLabel>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="grid gap-3 sm:grid-cols-2"
                >
                  <label
                    htmlFor="account-type-professional"
                    className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors ${
                      field.value === "professional"
                        ? "border-primary bg-primary-soft/40"
                        : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <RadioGroupItem
                      id="account-type-professional"
                      value="professional"
                      className="mt-1"
                    />
                    <span className="flex flex-col gap-0.5">
                      <span className="text-sm font-semibold text-foreground">
                        Sou personal
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Gerencio alunos e crio treinos para eles.
                      </span>
                    </span>
                  </label>

                  <label
                    htmlFor="account-type-self-managed"
                    className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors ${
                      field.value === "self_managed"
                        ? "border-primary bg-primary-soft/40"
                        : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <RadioGroupItem
                      id="account-type-self-managed"
                      value="self_managed"
                      className="mt-1"
                    />
                    <span className="flex flex-col gap-0.5">
                      <span className="text-sm font-semibold text-foreground">
                        Treino por conta própria
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Monto e acompanho os meus próprios treinos.
                      </span>
                    </span>
                  </label>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome completo</FormLabel>
              <FormControl>
                <Input
                  autoComplete="name"
                  autoCapitalize="words"
                  enterKeyHint="next"
                  placeholder="Seu nome completo"
                  className="min-h-11 text-base md:text-sm"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {!isSelfManaged ? (
          <FormField
            control={form.control}
            name="businessName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome da empresa</FormLabel>
                <FormControl>
                  <Input
                    autoComplete="organization"
                    autoCapitalize="words"
                    enterKeyHint="next"
                    placeholder="Nome do seu negócio"
                    className="min-h-11 text-base md:text-sm"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : null}

        {isSelfManaged ? (
          <FormField
            control={form.control}
            name="socialHandle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome de usuário</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span
                      className="pointer-events-none absolute inset-y-0 left-0 flex w-9 items-center justify-center text-muted-foreground"
                      aria-hidden="true"
                    >
                      @
                    </span>
                    <Input
                      autoComplete="off"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      enterKeyHint="next"
                      placeholder="seu_usuario"
                      className="min-h-11 pl-9 text-base md:text-sm"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => {
                        usernameEditadoRef.current = true;
                        field.onChange(e);
                      }}
                    />
                  </div>
                </FormControl>
                {formatoUsernameValido && disponibilidade === "checking" && (
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                    Verificando disponibilidade...
                  </p>
                )}
                {formatoUsernameValido && disponibilidade === "available" && (
                  <p className="flex items-center gap-1 text-xs text-primary">
                    <CheckCircle className="h-3 w-3" aria-hidden="true" />
                    @{socialHandleNormalizado} está disponível
                  </p>
                )}
                {formatoUsernameValido && disponibilidade === "taken" && (
                  <p className="flex items-center gap-1 text-xs text-destructive">
                    <XCircle className="h-3 w-3" aria-hidden="true" />
                    Esse nome de usuário já está em uso.
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        ) : null}

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
              <FormLabel>Senha</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    enterKeyHint="next"
                    placeholder="Mínimo 8 caracteres"
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
                    autoComplete="new-password"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    enterKeyHint="go"
                    placeholder="Repita a senha"
                    className="min-h-11 pr-11 text-base md:text-sm"
                    {...field}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}
                    className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-md text-muted-foreground transition-colors hover:text-foreground"
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

        <FormField
          control={form.control}
          name="aceiteLegal"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <AceiteLegalCheckbox
                  checked={field.value === true}
                  onCheckedChange={field.onChange}
                  disabled={isLoading}
                  errorId="aceite-legal-error"
                />
              </FormControl>
              <FormMessage id="aceite-legal-error" />
            </FormItem>
          )}
        />
      </AuthScreen>
    </Form>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div
          role="status"
          aria-live="polite"
          className="flex min-h-dvh items-center justify-center bg-background p-4"
        >
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">Carregando...</p>
          </div>
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}
