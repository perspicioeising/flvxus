'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Dumbbell, Zap, Eye, EyeOff, Loader2, ArrowLeft, Mail, Lock } from "lucide-react";
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
  email: z.string().email({ message: "Por favor, insira um email válido" }),
  password: z.string().min(8, { message: "A senha deve ter pelo menos 8 caracteres" }),
});

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { supabase } = useSupabase();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Falha no login",
          description: error.message,
        });
        return;
      }
      
      toast({
        title: "Login bem-sucedido",
        description: "Redirecionando para o dashboard...",
      });
      
      router.push("/dashboard");
      
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-green-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black overflow-hidden">
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

        {/* Main Login Card */}
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
                  Bem-vindo de volta
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-lg">
                  Acesse sua conta e continue sua jornada
                </p>
              </div>

              {/* Form */}
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                            <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl blur opacity-50"></div>
                            <div className="relative">
                              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-600 dark:text-green-400" />
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
                        <div className="flex items-center justify-between">
                          <FormLabel className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            Senha
                          </FormLabel>
                          <Link href="/forgot-password" className="text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-semibold transition-colors duration-300">
                            Esqueceu a senha?
                          </Link>
                        </div>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur opacity-50"></div>
                            <div className="relative">
                              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-600 dark:text-blue-400" />
                              <Input
                                type={showPassword ? "text" : "password"}
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
                        Entrando...
                      </>
                    ) : (
                      "Entrar"
                    )}
                  </Button>
                </form>
              </Form>

              {/* Footer */}
              <div className="mt-8 text-center">
                <div className="p-4 bg-gradient-to-r from-gray-50 to-green-50 dark:from-gray-800/50 dark:to-green-900/20 rounded-xl border border-gray-200/50 dark:border-green-700/50">
                  <span className="text-gray-600 dark:text-gray-400">Não tem uma conta? </span>
                  <Link href="/register" className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-bold transition-colors duration-300">
                    Cadastre-se gratuitamente
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