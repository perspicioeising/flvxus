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
      // 1. Create user in Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.name,
          }
        }
      });
      
      if (authError || !authData.user) {
        throw new Error(authError?.message || "Failed to create account");
      }
      
      // 2. Create tenant
      const maxStudents = plan === 'free' ? 5 : plan === 'platinum' ? 100 : 1000;
      const maxTrainers = plan === 'free' ? 0 : plan === 'platinum' ? 5 : 10;

      const { data: tenantData, error: tenantError } = await supabase
        .from('tenants')
        .insert({
          name: values.businessName,
          plan: plan as any,
          plan_type: 'monthly',
          max_students: maxStudents,
          max_trainers: maxTrainers,
          owner_id: authData.user.id,
        })
        .select()
        .single();
      
      if (tenantError || !tenantData) {
        throw new Error(tenantError?.message || "Failed to create business profile");
      }
      
      // 3. Create user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: authData.user.id,
          full_name: values.name,
          email: values.email,
          role: 'trainer',
          tenant_id: tenantData.id,
        });
      
      if (profileError) {
        throw new Error(profileError.message || "Failed to create user profile");
      }
      
      toast({
        title: "Conta criada com sucesso",
        description: "Redirecionando para o dashboard...",
      });
      
      router.push("/dashboard");
      
    } catch (error: any) {
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
      case 'platinum':
        return {
          name: 'Platinum',
          color: 'from-green-600 to-emerald-600',
          description: 'Para trainers ambiciosos'
        };
      case 'gold':
        return {
          name: 'Gold',
          color: 'from-yellow-600 to-orange-600',
          description: 'Para impérios fitness'
        };
      default:
        return {
          name: 'Gratuito',
          color: 'from-gray-600 to-slate-600',
          description: '14 dias grátis'
        };
    }
  };

  const planInfo = getPlanInfo();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-green-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black overflow-hidden py-8">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-green-500/20 to-emerald-500/10 rounded-full blur-3xl animate-pulse opacity-50" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-tl from-teal-500/15 to-transparent rounded-full blur-3xl animate-pulse delay-1000 opacity-60" />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-gradient-to-r from-blue-500/10 to-purple-500/20 rounded-full blur-3xl animate-pulse delay-500 opacity-40" />
      </div>

      <div className="relative w-full max-w-md mx-4">
        {/* Back to Home Button */}
        <div className="mb-8">
          <Link href="/">
            <Button
              variant="ghost"
              className="p-3 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 transition-all duration-300"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
        </div>

        {/* Main Register Card */}
        <div className="relative group">
          {/* Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 via-emerald-500/20 to-teal-600/20 dark:from-green-500/10 dark:via-emerald-400/10 dark:to-teal-500/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          {/* Card */}
          <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-green-200/50 dark:border-green-800/30 rounded-3xl shadow-2xl overflow-hidden">
            
            {/* Animated gradient border */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute inset-[1px] bg-white dark:bg-gray-900 rounded-3xl"></div>

            <div className="relative p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <Dumbbell className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <Zap className="h-3 w-3 text-white" />
                    </div>
                  </div>
                </div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-gray-600 via-gray-600 to-gray-900 dark:from-white dark:via-gray-400 dark:to-white bg-clip-text text-transparent mb-3">
                  Crie sua conta
                </h1>
                
                {/* Plan Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-green-200/50 dark:border-green-700/50 shadow-lg mb-4">
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${planInfo.color}`}></div>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Plano {planInfo.name}
                  </span>
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 text-lg">
                  {planInfo.description} • Comece agora mesmo
                </p>
              </div>

              {/* Form */}
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          Nome Completo
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl blur opacity-50"></div>
                            <div className="relative">
                              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-600 dark:text-green-400" />
                              <Input
                                placeholder="Seu nome completo"
                                className="relative h-14 text-lg bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 transition-all duration-300 pl-12"
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
                        <FormLabel className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          Nome da Empresa
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur opacity-50"></div>
                            <div className="relative">
                              <Building className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-600 dark:text-blue-400" />
                              <Input
                                placeholder="Nome do seu negócio"
                                className="relative h-14 text-lg bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 transition-all duration-300 pl-12"
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
                        <FormLabel className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          E-mail
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl blur opacity-50"></div>
                            <div className="relative">
                              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-600 dark:text-purple-400" />
                              <Input
                                placeholder="seu@email.com"
                                className="relative h-14 text-lg bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 transition-all duration-300 pl-12"
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
                        <FormLabel className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          Senha
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl blur opacity-50"></div>
                            <div className="relative">
                              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-orange-600 dark:text-orange-400" />
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Mínimo 8 caracteres"
                                className="relative h-14 text-lg bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 transition-all duration-300 pl-12 pr-12"
                                {...field}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-300"
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
                    className="w-full bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white font-bold h-14 rounded-2xl shadow-2xl hover:shadow-green-500/25 transition-all duration-500 transform hover:scale-105 border-0"
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
                <div className="p-4 bg-gradient-to-r from-gray-50 to-green-50 dark:from-gray-800/50 dark:to-green-900/20 rounded-xl border border-gray-200/50 dark:border-green-700/50">
                  <span className="text-gray-600 dark:text-gray-400">Já tem uma conta? </span>
                  <Link href="/login" className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-bold transition-colors duration-300">
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
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterContent />
    </Suspense>
  );
}