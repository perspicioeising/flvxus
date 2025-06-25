'use client';

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Dumbbell, Zap, Eye, EyeOff, Loader2, ArrowLeft, Mail, Lock, User, Building } from "lucide-react";
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

const formSchema = z.object({
  name: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres" }),
  email: z.string().email({ message: "Por favor, insira um email válido" }),
  password: z.string().min(8, { message: "A senha deve ter pelo menos 8 caracteres" }),
  businessName: z.string().min(2, { message: "O nome da empresa deve ter pelo menos 2 caracteres" }),
});

function RegisterContent() {
  const router = useRouter();
  const { toast } = useToast();
  const { supabase } = useSupabase();
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan") || "free";
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      businessName: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    
    try {
      // 1. Primeiro criar o usuário no Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.name,
          }
        }
      });
      
      if (authError) {
        throw new Error(authError.message);
      }
      
      if (!authData.user) {
        throw new Error("Falha ao criar usuário");
      }

      // 2. Aguardar um pouco para a sessão ser estabelecida
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 3. Usar a função do banco para criar tenant e perfil
      const { data: functionResult, error: functionError } = await supabase
        .rpc('create_trainer_with_tenant', {
          user_id: authData.user.id,
          full_name: values.name,
          email: values.email,
          business_name: values.businessName,
          plan: plan
        });
      
      if (functionError) {
        console.error('Function error:', functionError);
        throw new Error(functionError.message || "Erro ao criar perfil da empresa");
      }

      if (!functionResult?.success) {
        console.error('Function result:', functionResult);
        throw new Error(functionResult?.error || "Erro desconhecido ao criar perfil");
      }
      
      toast({
        title: "Conta criada com sucesso!",
        description: "Redirecionando para o dashboard...",
      });
      
      // Aguardar um pouco para garantir que tudo foi criado
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
      
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        variant: "destructive",
        title: "Falha no cadastro",
        description: error.message || "Algo deu errado. Por favor, tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const getPlanInfo = () => {
    switch(plan) {
      case 'monthly':
        return {
          name: 'Mensal',
          color: 'from-green-600 to-emerald-600',
          description: 'R$ 59,90/mês - Para trainers profissionais',
          features: ['Até 1000 alunos', 'IA ilimitada', '5 treinadores']
        };
      case 'annual':
        return {
          name: 'Anual',
          color: 'from-yellow-600 to-orange-600',
          description: 'R$ 399,90/ano - Melhor custo-benefício',
          features: ['Alunos ilimitados', 'IA ilimitada', '20 treinadores']
        };
      default:
        return {
          name: 'Gratuito',
          color: 'from-gray-600 to-slate-600',
          description: '14 dias grátis - Teste todas as funcionalidades',
          features: ['Até 5 alunos', 'IA limitada', '1 treinador']
        };
    }
  };

  const planInfo = getPlanInfo();

  return (
    <div className="min-h-screen flex items-center justify-center bg-app-gradient overflow-hidden py-8">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-app-btn-primary/20 to-app-btn-accent/10 rounded-full blur-3xl animate-pulse opacity-50" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-tl from-app-btn-secondary/15 to-transparent rounded-full blur-3xl animate-pulse delay-1000 opacity-60" />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-gradient-to-r from-app-btn-indigo/10 to-app-btn-accent/20 rounded-full blur-3xl animate-pulse delay-500 opacity-40" />
      </div>

      <div className="relative w-full max-w-md mx-4">
        {/* Back to Home Button */}
        <div className="mb-8">
          <Link href="/">
            <Button
              variant="ghost"
              className="p-3 rounded-2xl bg-app-overlay backdrop-blur-sm hover:bg-app-card transition-all duration-300"
            >
              <ArrowLeft className="h-5 w-5 text-app-text-primary" />
            </Button>
          </Link>
        </div>

        {/* Main Register Card */}
        <div className="relative group">
          {/* Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-app-btn-primary/20 via-app-btn-accent/20 to-app-btn-secondary/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          {/* Card */}
          <div className="relative bg-app-overlay backdrop-blur-xl border border-app-border-accent/30 rounded-3xl shadow-app-xl overflow-hidden">
            
            {/* Animated gradient border */}
            <div className="absolute inset-0 bg-gradient-to-r from-app-btn-primary via-app-btn-accent to-app-btn-secondary rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute inset-[1px] bg-app-overlay rounded-3xl"></div>

            <div className="relative p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-app-btn-primary via-app-btn-accent to-app-btn-secondary rounded-2xl flex items-center justify-center shadow-app-large">
                      <Dumbbell className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <Zap className="h-3 w-3 text-white" />
                    </div>
                  </div>
                </div>
                <h1 className="text-3xl font-black text-app-heading mb-3">
                  Crie sua conta
                </h1>
                
                {/* Plan Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-app-card backdrop-blur-sm rounded-2xl border border-app-border-accent/50 shadow-app-medium mb-4">
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${planInfo.color}`}></div>
                  <span className="text-sm font-semibold text-app-text-primary">
                    Plano {planInfo.name}
                  </span>
                </div>
                
                <p className="text-app-text-secondary text-base mb-2">
                  {planInfo.description}
                </p>
                
                {/* Features */}
                <div className="text-xs text-app-text-muted space-y-1">
                  {planInfo.features.map((feature, index) => (
                    <div key={index} className="flex items-center justify-center gap-1">
                      <div className="w-1 h-1 bg-app-text-accent rounded-full"></div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form */}
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-bold text-app-text-primary uppercase tracking-wider">
                          Nome Completo
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-app-btn-primary/20 to-app-btn-indigo/20 rounded-xl blur opacity-50"></div>
                            <div className="relative">
                              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-app-btn-primary" />
                              <Input
                                placeholder="Seu nome completo"
                                className="relative h-14 text-lg bg-app-card backdrop-blur-sm border-0 rounded-xl shadow-app-medium focus:bg-app-card focus:shadow-app-large transition-all duration-300 pl-12 text-app-text-primary placeholder:text-app-text-muted"
                                {...field}
                              />
                            </div>
                          </div>
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
                        <FormLabel className="text-sm font-bold text-app-text-primary uppercase tracking-wider">
                          Nome da Empresa
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-app-btn-indigo/20 to-app-btn-accent/20 rounded-xl blur opacity-50"></div>
                            <div className="relative">
                              <Building className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-app-btn-indigo" />
                              <Input
                                placeholder="Nome do seu negócio"
                                className="relative h-14 text-lg bg-app-card backdrop-blur-sm border-0 rounded-xl shadow-app-medium focus:bg-app-card focus:shadow-app-large transition-all duration-300 pl-12 text-app-text-primary placeholder:text-app-text-muted"
                                {...field}
                              />
                            </div>
                          </div>
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
                        <FormLabel className="text-sm font-bold text-app-text-primary uppercase tracking-wider">
                          E-mail
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-app-btn-accent/20 to-app-btn-secondary/20 rounded-xl blur opacity-50"></div>
                            <div className="relative">
                              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-app-btn-accent" />
                              <Input
                                placeholder="seu@email.com"
                                className="relative h-14 text-lg bg-app-card backdrop-blur-sm border-0 rounded-xl shadow-app-medium focus:bg-app-card focus:shadow-app-large transition-all duration-300 pl-12 text-app-text-primary placeholder:text-app-text-muted"
                                {...field}
                              />
                            </div>
                          </div>
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
                        <FormLabel className="text-sm font-bold text-app-text-primary uppercase tracking-wider">
                          Senha
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-app-btn-secondary/20 to-app-btn-primary/20 rounded-xl blur opacity-50"></div>
                            <div className="relative">
                              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-app-btn-secondary" />
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Mínimo 8 caracteres"
                                className="relative h-14 text-lg bg-app-card backdrop-blur-sm border-0 rounded-xl shadow-app-medium focus:bg-app-card focus:shadow-app-large transition-all duration-300 pl-12 pr-12 text-app-text-primary placeholder:text-app-text-muted"
                                {...field}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-app-text-muted hover:text-app-text-primary transition-colors duration-300"
                              >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                              </button>
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full btn-gradient-primary text-white font-bold h-14 rounded-2xl shadow-app-xl hover:shadow-app-btn-primary/25 transition-all duration-500 transform hover:scale-105 border-0"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                        Criando conta...
                      </>
                    ) : (
                      "Criar Conta Gratuitamente"
                    )}
                  </Button>
                </form>
              </Form>

              {/* Footer */}
              <div className="mt-8 text-center">
                <div className="p-4 bg-app-card rounded-xl border border-app-border-muted/50">
                  <span className="text-app-text-secondary">Já tem uma conta? </span>
                  <Link href="/login" className="text-app-text-accent hover:text-app-btn-primary font-bold transition-colors duration-300">
                    Faça login
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-app-gradient flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-app-border-accent rounded-full animate-spin border-t-app-btn-primary"></div>
          <p className="text-app-text-secondary">Carregando...</p>
        </div>
      </div>
    }>
      <RegisterContent />
    </Suspense>
  );
}