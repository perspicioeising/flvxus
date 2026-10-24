'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlus } from 'lucide-react';

import { toast } from '@/hooks/use-toast';
import { convidarFiliado, removerFiliado } from '@/actions/filiados';
import { convidarFiliadoSchema, type ConvidarFiliadoInput } from '@/schemas/filiado';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/patterns/confirm-dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

/** Um filiado na lista de gestão. */
export interface FiliadoItem {
  userId: string;
  fullName: string | null;
  email: string | null;
  ativo: boolean;
}

export interface FiliadosSectionProps {
  /** Filiados do tenant (trainers não-master). */
  filiados: FiliadoItem[];
  /** Filiados ativos usados / total do plano (total null = ilimitado). */
  usados: number;
  limite: number | null;
  /** Pode convidar agora? (reflexo do backend; enforcement real na action). */
  podeConvidar: boolean;
  /** Mensagem a exibir quando não pode convidar (limite/plano). */
  motivoBloqueio?: string;
}

/**
 * Seção de GESTÃO DE FILIADOS (master-only). Lista nome/e-mail/status, convida
 * (botão desabilitado no limite, FR10 — enforcement real no backend) e desativa.
 */
export function FiliadosSection({
  filiados,
  usados,
  limite,
  podeConvidar,
  motivoBloqueio,
}: FiliadosSectionProps) {
  const router = useRouter();
  const [enviando, setEnviando] = React.useState(false);
  const [alvoRemocao, setAlvoRemocao] = React.useState<FiliadoItem | null>(null);
  const [removendo, setRemovendo] = React.useState(false);

  const form = useForm<ConvidarFiliadoInput>({
    resolver: zodResolver(convidarFiliadoSchema) as never,
    defaultValues: { full_name: '', email: '' },
  });

  async function onConvidar(values: ConvidarFiliadoInput) {
    setEnviando(true);
    try {
      const fd = new FormData();
      fd.append('full_name', values.full_name);
      fd.append('email', values.email);
      const r = await convidarFiliado(undefined, fd);
      if (r.ok) {
        toast({ title: r.message ?? 'Convite enviado.' });
        form.reset();
        router.refresh();
        return;
      }
      if (r.fieldErrors) {
        for (const [campo, mensagem] of Object.entries(r.fieldErrors)) {
          form.setError(campo as keyof ConvidarFiliadoInput, { message: mensagem });
        }
      }
      toast({ title: r.message ?? 'Não foi possível convidar.', variant: 'destructive' });
    } catch {
      toast({ title: 'Erro inesperado. Tente novamente.', variant: 'destructive' });
    } finally {
      setEnviando(false);
    }
  }

  async function onRemover() {
    if (!alvoRemocao) return;
    setRemovendo(true);
    try {
      const r = await removerFiliado(alvoRemocao.userId);
      if (r.ok) {
        toast({ title: r.message ?? 'Filiado desativado.' });
        setAlvoRemocao(null);
        router.refresh();
      } else {
        toast({ title: r.message ?? 'Não foi possível desativar.', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Erro inesperado. Tente novamente.', variant: 'destructive' });
    } finally {
      setRemovendo(false);
    }
  }

  const totalLabel = limite === null ? 'ilimitado' : String(limite);

  return (
    <Card>
      <CardHeader className="p-4 pb-0">
        <CardTitle className="text-base">Filiados</CardTitle>
        <CardDescription>
          Personais vinculados à sua conta. Em uso: {usados} de {totalLabel}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 p-4">
        {/* Convite */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onConvidar)} className="space-y-4" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do filiado</FormLabel>
                    <FormControl>
                      <Input {...field} autoComplete="name" className="h-11" disabled={!podeConvidar} />
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
                        autoComplete="email"
                        className="h-11"
                        disabled={!podeConvidar}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {!podeConvidar ? (
              <p className="text-sm text-muted-foreground">
                {motivoBloqueio ??
                  'Seu plano atingiu o limite de filiados. Faça upgrade na tela de Plano.'}
              </p>
            ) : null}
            <div className="flex justify-end">
              <Button type="submit" className="min-h-11" disabled={enviando || !podeConvidar}>
                <UserPlus className="mr-2 h-4 w-4" aria-hidden="true" />
                {enviando ? 'Enviando…' : 'Convidar filiado'}
              </Button>
            </div>
          </form>
        </Form>

        {/* Lista */}
        {filiados.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum filiado cadastrado ainda.</p>
        ) : (
          <ul className="divide-y divide-border">
            {filiados.map((f) => (
              <li key={f.userId} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{f.fullName ?? 'Sem nome'}</p>
                  <p className="truncate text-xs text-muted-foreground">{f.email ?? '—'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={f.ativo ? 'default' : 'secondary'}>
                    {f.ativo ? 'Ativo' : 'Inativo'}
                  </Badge>
                  {f.ativo ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => setAlvoRemocao(f)}
                    >
                      Desativar
                    </Button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      <ConfirmDialog
        open={alvoRemocao !== null}
        onOpenChange={(o) => {
          if (!o) setAlvoRemocao(null);
        }}
        title="Desativar filiado?"
        description={
          alvoRemocao
            ? `${alvoRemocao.fullName ?? alvoRemocao.email ?? 'Este filiado'} perderá o acesso. ` +
              'Os registros que ele cadastrou são preservados.'
            : undefined
        }
        confirmLabel="Desativar"
        destructive
        loading={removendo}
        onConfirm={onRemover}
      />
    </Card>
  );
}
