'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { toast } from '@/hooks/use-toast';

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
import {
  criarAlunoSchema,
  editarAlunoSchema,
  NIVEIS_EXPERIENCIA,
  OBJETIVOS,
  type CriarAlunoInput,
} from '@/schemas/aluno';
import type { EstadoAcao } from '@/actions/alunos';
import { EXPERIENCIA_LABEL, OBJETIVO_LABEL } from './labels';

/** Valor "nenhum" dos selects opcionais (não é um valor do enum). */
const NENHUM = 'none';

/** Valores do formulário em texto (os selects guardam string). */
export interface AlunoFormValues {
  full_name: string;
  email: string;
  phone: string;
  birth_date: string;
  gender: string;
  height_cm: string;
  experience_level: string;
  goal: string;
}

export interface AlunoFormProps {
  modo: 'criar' | 'editar';
  /** Action a chamar com o FormData montado. */
  onSubmitAction: (formData: FormData) => Promise<EstadoAcao>;
  /** Valores iniciais (edição). */
  valoresIniciais?: Partial<AlunoFormValues>;
  /** Para onde voltar após sucesso. */
  redirecionarPara: string;
  rotuloEnvio?: string;
}

function valoresPadrao(iniciais?: Partial<AlunoFormValues>): AlunoFormValues {
  return {
    full_name: iniciais?.full_name ?? '',
    email: iniciais?.email ?? '',
    phone: iniciais?.phone ?? '',
    birth_date: iniciais?.birth_date ?? '',
    gender: iniciais?.gender ?? '',
    height_cm: iniciais?.height_cm ?? '',
    experience_level: iniciais?.experience_level ?? '',
    goal: iniciais?.goal ?? '',
  };
}

/**
 * Formulário de aluno (criar/convidar e editar). Valida no cliente com o MESMO
 * schema Zod da Server Action (`criarAlunoSchema`/`editarAlunoSchema`) e submete
 * via FormData para a action. Mobile-first e acessível.
 */
export function AlunoForm({
  modo,
  onSubmitAction,
  valoresIniciais,
  redirecionarPara,
  rotuloEnvio,
}: AlunoFormProps) {
  const router = useRouter();
  const [enviando, setEnviando] = React.useState(false);
  const schema = modo === 'criar' ? criarAlunoSchema : editarAlunoSchema;

  const form = useForm<AlunoFormValues>({
    resolver: zodResolver(schema) as never,
    defaultValues: valoresPadrao(valoresIniciais),
  });

  async function onSubmit(values: AlunoFormValues) {
    setEnviando(true);
    try {
      const fd = new FormData();
      for (const [chave, valor] of Object.entries(values)) {
        if (valor !== '' && valor !== NENHUM) {
          fd.append(chave, valor);
        }
      }

      const resultado = await onSubmitAction(fd);

      if (resultado.ok) {
        toast({ title: resultado.message ?? 'Salvo com sucesso.' });
        router.push(redirecionarPara);
        router.refresh();
        return;
      }

      if (resultado.fieldErrors) {
        for (const [campo, mensagem] of Object.entries(resultado.fieldErrors)) {
          form.setError(campo as keyof AlunoFormValues, { message: mensagem });
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
                <Input {...field} autoComplete="name" />
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
                  {...field}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  disabled={modo === 'editar'}
                />
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
                  <Input {...field} type="tel" inputMode="tel" autoComplete="tel" />
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
                  <Input {...field} type="date" />
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
                <FormControl>
                  <Input {...field} />
                </FormControl>
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
                  <Input {...field} type="number" inputMode="numeric" min={1} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="experience_level"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nível de experiência (opcional)</FormLabel>
                <Select
                  value={field.value || NENHUM}
                  onValueChange={(v) => field.onChange(v === NENHUM ? '' : v)}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={NENHUM}>Não informado</SelectItem>
                    {NIVEIS_EXPERIENCIA.map((nivel) => (
                      <SelectItem key={nivel} value={nivel}>
                        {EXPERIENCIA_LABEL[nivel]}
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
            name="goal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Objetivo (opcional)</FormLabel>
                <Select
                  value={field.value || NENHUM}
                  onValueChange={(v) => field.onChange(v === NENHUM ? '' : v)}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={NENHUM}>Não informado</SelectItem>
                    {OBJETIVOS.map((objetivo) => (
                      <SelectItem key={objetivo} value={objetivo}>
                        {OBJETIVO_LABEL[objetivo]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            onClick={() => router.push(redirecionarPara)}
            disabled={enviando}
          >
            Cancelar
          </Button>
          <Button type="submit" className="min-h-11" disabled={enviando}>
            {enviando ? 'Salvando…' : rotuloEnvio ?? (modo === 'criar' ? 'Convidar aluno' : 'Salvar alterações')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
