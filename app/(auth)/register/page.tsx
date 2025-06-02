'use client';

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Dumbbell } from "lucide-react";
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
        description: "Redirecting you to the dashboard...",
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

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-muted/30">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-2">
            <Dumbbell className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Crie sua conta</h1>
          <p className="text-muted-foreground">
            {plan === 'free' 
              ? 'Comece sua avaliação gratuita de 14 dias' 
              : `Comece com o plano ${plan}`}
          </p>
        </div>

        <div className="bg-card p-8 rounded-lg shadow-sm border">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
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
                    <FormLabel>Nome da Empresa</FormLabel>
                    <FormControl>
                      <Input placeholder="Fitness Studio" {...field} />
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
                      <Input placeholder="yourname@example.com" {...field} />
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
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Criando conta..." : "Criar Conta"}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
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