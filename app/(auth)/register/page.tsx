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
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  businessName: z.string().min(2, { message: "Business name must be at least 2 characters" }),
});

export default function RegisterPage() {
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
        title: "Account created successfully",
        description: "Redirecting you to the dashboard...",
      });
      
      router.push("/dashboard");
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error.message || "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
        <Suspense fallback={<div>Carregando...</div>}>

    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-muted/30">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-2">
            <Dumbbell className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-muted-foreground">
            {plan === 'free' 
              ? 'Start your 14-day free trial' 
              : `Get started with the ${plan} plan`}
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
                    <FormLabel>Full Name</FormLabel>
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
                    <FormLabel>Business Name</FormLabel>
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
                    <FormLabel>Email</FormLabel>
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
                {isLoading ? "Creating account..." : "Create Account"}
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
    </Suspense>
  );
}