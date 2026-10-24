'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { toast } from '@/hooks/use-toast';
import { atualizarPerfil, type EstadoAcao } from '@/actions/perfil';
import { editarPerfilSchema } from '@/schemas/perfil';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GENEROS } from '@/schemas/aluno';
import { GENERO_LABEL } from '@/components/professor/alunos/labels';

/** Valor "nenhum" do select opcional (não é um valor do vocabulário). */
const NENHUM = 'none';

/** Valores do formulário em texto (inputs guardam string). */
export interface PerfilFormValues {
  full_name: string;
  phone: string;
  birth_date: string;
  gender: string;
  height_cm: string;
}

export interface PerfilFormProps {
  /** Valores iniciais vindos do `profiles` do aluno (RSC). */
  valoresIniciais?: Partial<PerfilFormValues>;
}

function valoresPadrao(iniciais?: Partial<PerfilFormValues>): PerfilFormValues {
  return {
    full_name: iniciais?.full_name ?? '',
    phone: iniciais?.phone ?? '',
    birth_date: iniciais?.birth_date ?? '',
    gender: iniciais?.gender ?? '',
    height_cm: iniciais?.height_cm ?? '',
  };
}

/**
 * Formulário de dados pessoais do aluno. Valida no cliente com o MESMO schema
 * Zod da Server Action (`editarPerfilSchema`) e submete via FormData para
 * `atualizarPerfil`. Mobile-first (alvos ≥ 44px) e acessível.
 */
export function PerfilForm({ valoresIniciais }: PerfilFormProps) {
  const router = useRouter();
  const [enviando, setEnviando] = React.useState(false);

  const form = useForm<PerfilFormValues>({
    resolver: zodResolver(editarPerfilSchema) as never,
    defaultValues: valoresPadrao(valoresIniciais),
  });

  async function onSubmit(values: PerfilFormValues) {
    setEnviando(true);
    try {
      const fd = new FormData();
      for (const [chave, valor] of Object.entries(values)) {
        if (valor !== '') {
          fd.append(chave, valor);
        }
      }

      const resultado: EstadoAcao = await atualizarPerfil(fd);

      if (resultado.ok) {
        toast({ title: resultado.message ?? 'Dados atualizados.' });
        router.refresh();
        return;
      }

      if (resultado.fieldErrors) {
        for (const [campo, mensagem] of Object.entries(resultado.fieldErrors)) {
          form.setError(campo as keyof PerfilFormValues, { message: mensagem });
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
            name="birth_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de nascimento (opcional)</FormLabel>
                <FormControl>
                  <Input {...field} type="date" className="h-11" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gênero (opcional)</FormLabel>
                <Select
                  value={field.value || NENHUM}
                  onValueChange={(v) => field.onChange(v === NENHUM ? '' : v)}
                >
                  <FormControl>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={NENHUM}>Não informado</SelectItem>
                    {GENEROS.map((genero) => (
                      <SelectItem key={genero} value={genero}>
                        {GENERO_LABEL[genero]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="height_cm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Altura em cm (opcional)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    inputMode="numeric"
                    min={1}
                    className="h-11"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" size="xl" className="w-full" disabled={enviando}>
          {enviando ? 'Salvando…' : 'Salvar alterações'}
        </Button>
      </form>
    </Form>
  );
}
