'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { toast } from '@/hooks/use-toast';
import { type EstadoAcao } from '@/actions/perfil';
import { editarPerfilProfessorSchema } from '@/schemas/perfil';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

/** Valores do formulário em texto (inputs guardam string). */
export interface PerfilProfessorFormValues {
  full_name: string;
  phone: string;
  business_name: string;
}

export interface PerfilProfessorFormProps {
  /** Valores iniciais vindos do `profiles`/`tenants` do professor (RSC). */
  valoresIniciais?: Partial<PerfilProfessorFormValues>;
  /** E-mail da conta (read-only, identidade gerida pelo Supabase Auth). */
  email: string;
  /** Server Action que persiste os dados. */
  onSubmitAction: (fd: FormData) => Promise<EstadoAcao>;
}

function valoresPadrao(
  iniciais?: Partial<PerfilProfessorFormValues>,
): PerfilProfessorFormValues {
  return {
    full_name: iniciais?.full_name ?? '',
    phone: iniciais?.phone ?? '',
    business_name: iniciais?.business_name ?? '',
  };
}

/**
 * Formulário de perfil do professor. Valida no cliente com o MESMO schema Zod
 * da Server Action (`editarPerfilProfessorSchema`) e submete via FormData para
 * `onSubmitAction`. O e-mail é exibido read-only. Mobile-first (alvos ≥ 44px)
 * e acessível.
 */
export function PerfilProfessorForm({
  valoresIniciais,
  email,
  onSubmitAction,
}: PerfilProfessorFormProps) {
  const router = useRouter();
  const [enviando, setEnviando] = React.useState(false);

  const form = useForm<PerfilProfessorFormValues>({
    resolver: zodResolver(editarPerfilProfessorSchema) as never,
    defaultValues: valoresPadrao(valoresIniciais),
  });

  async function onSubmit(values: PerfilProfessorFormValues) {
    setEnviando(true);
    try {
      const fd = new FormData();
      for (const [chave, valor] of Object.entries(values)) {
        if (valor !== '') {
          fd.append(chave, valor);
        }
      }

      const resultado: EstadoAcao = await onSubmitAction(fd);

      if (resultado.ok) {
        toast({ title: resultado.message ?? 'Dados atualizados.' });
        router.refresh();
        return;
      }

      if (resultado.fieldErrors) {
        for (const [campo, mensagem] of Object.entries(resultado.fieldErrors)) {
          form.setError(campo as keyof PerfilProfessorFormValues, { message: mensagem });
        }
      }
      toast({
        title: resultado.message ?? 'Não foi possível salvar.',
        variant: 'destructive',
      });
    } catch {
      toast({ title: 'Erro inesperado. Tente novamente.', variant: 'destructive' });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome completo</FormLabel>
              <FormControl>
                <Input {...field} autoComplete="name" className="h-11" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <Label htmlFor="perfil-professor-email">E-mail</Label>
          <Input
            id="perfil-professor-email"
            value={email}
            type="email"
            autoComplete="email"
            readOnly
            disabled
            className="h-11"
          />
          <p className="text-sm text-muted-foreground">
            O e-mail da conta não pode ser alterado.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone (opcional)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    className="h-11"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="business_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do negócio</FormLabel>
                <FormControl>
                  <Input {...field} autoComplete="organization" className="h-11" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" className="min-h-11" disabled={enviando}>
            {enviando ? 'Salvando…' : 'Salvar alterações'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
