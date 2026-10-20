'use client';

import { toast, Toaster as SonnerToaster } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThemeToggle } from '@/components/theme-toggle';
import { LoadingState, EmptyState, ErrorState } from '@/components/patterns';

/** Amostra de cor dos tokens (classe utilitária do token + rótulo). */
function Swatch({ className, label }: { className: string; label: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className={`h-12 w-full rounded-lg border border-border ${className}`} />
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">{title}</h2>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export default function UiKitPage() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-10">
      <SonnerToaster position="top-center" />

      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">UI Kit</h1>
          <p className="text-sm text-muted-foreground">
            Tokens e componentes base do design system. Alterne o tema para ver
            claro e escuro.
          </p>
        </div>
        <ThemeToggle />
      </header>

      {/* Cores */}
      <Section
        title="Cores"
        description="Tokens semânticos (claro/escuro). A troca de tema atualiza todas as amostras."
      >
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          <Swatch className="bg-background" label="background" />
          <Swatch className="bg-card" label="card" />
          <Swatch className="bg-muted" label="muted" />
          <Swatch className="bg-primary" label="primary" />
          <Swatch className="bg-secondary" label="secondary" />
          <Swatch className="bg-accent" label="accent" />
          <Swatch className="bg-success" label="success" />
          <Swatch className="bg-warning" label="warning" />
          <Swatch className="bg-destructive" label="destructive" />
          <Swatch className="bg-border" label="border" />
        </div>
      </Section>

      {/* Tipografia */}
      <Section
        title="Tipografia"
        description="Escala mobile-first. Fonte Inter (self-hospedada)."
      >
        <div className="space-y-2">
          <p className="text-3xl font-bold">Título grande (3xl)</p>
          <p className="text-2xl font-semibold">Título (2xl)</p>
          <p className="text-xl font-semibold">Subtítulo (xl)</p>
          <p className="text-base">Corpo de texto (base)</p>
          <p className="text-sm text-muted-foreground">Texto secundário (sm)</p>
          <p className="text-xs text-muted-foreground">Legenda (xs)</p>
        </div>
      </Section>

      {/* Espaçamento, raios e sombras */}
      <Section
        title="Espaçamento, raios e sombras"
        description="Base de 4px; raios de card (lg/2xl/3xl) e sombras do app."
      >
        <div className="flex flex-wrap items-end gap-3">
          <div className="h-10 w-4 rounded bg-primary" title="4px" />
          <div className="h-10 w-8 rounded bg-primary" title="8px" />
          <div className="h-10 w-12 rounded bg-primary" title="12px" />
          <div className="h-10 w-16 rounded bg-primary" title="16px" />
        </div>
        <div className="flex flex-wrap gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-card shadow-app-light text-xs">
            lg
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-card shadow-app-medium text-xs">
            2xl
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-card shadow-app-large text-xs">
            3xl
          </div>
        </div>
      </Section>

      {/* Botões */}
      <Section title="Botões" description="Variantes e tamanhos.">
        <div className="flex flex-wrap gap-3">
          <Button>Primário</Button>
          <Button variant="secondary">Secundário</Button>
          <Button variant="outline">Contorno</Button>
          <Button variant="ghost">Fantasma</Button>
          <Button variant="destructive">Destrutivo</Button>
          <Button variant="link">Link</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">Pequeno</Button>
          <Button size="default">Padrão</Button>
          <Button size="lg">Grande</Button>
          <Button disabled>Desabilitado</Button>
        </div>
      </Section>

      {/* Card */}
      <Section title="Card">
        <Card className="max-w-sm">
          <CardHeader>
            <CardTitle>Título do card</CardTitle>
            <CardDescription>Descrição de apoio do card.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Superfície sólida usando os tokens do design system.
            </p>
          </CardContent>
        </Card>
      </Section>

      {/* Formulário */}
      <Section title="Campos de formulário">
        <div className="grid max-w-md gap-4">
          <div className="space-y-2">
            <Label htmlFor="nome-exemplo">Nome</Label>
            <Input id="nome-exemplo" placeholder="Digite o nome do aluno" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="objetivo-exemplo">Objetivo</Label>
            <Select>
              <SelectTrigger id="objetivo-exemplo">
                <SelectValue placeholder="Selecione um objetivo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hipertrofia">Hipertrofia</SelectItem>
                <SelectItem value="emagrecimento">Emagrecimento</SelectItem>
                <SelectItem value="condicionamento">Condicionamento</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Section>

      {/* Badges e Avatar */}
      <Section title="Badges e avatar">
        <div className="flex flex-wrap items-center gap-3">
          <Badge>Padrão</Badge>
          <Badge variant="secondary">Secundário</Badge>
          <Badge variant="outline">Contorno</Badge>
          <Badge variant="destructive">Destrutivo</Badge>
          <Avatar>
            <AvatarFallback>FL</AvatarFallback>
          </Avatar>
        </div>
      </Section>

      {/* Overlays */}
      <Section title="Diálogo, painel e abas">
        <div className="flex flex-wrap gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Abrir diálogo</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Exemplo de diálogo</DialogTitle>
                <DialogDescription>
                  Diálogos servem para confirmações e formulários curtos.
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">Abrir painel</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Exemplo de painel</SheetTitle>
                <SheetDescription>
                  Painéis laterais acomodam filtros e detalhes.
                </SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>
        </div>

        <Tabs defaultValue="visao" className="max-w-md">
          <TabsList>
            <TabsTrigger value="visao">Visão geral</TabsTrigger>
            <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
          </TabsList>
          <TabsContent value="visao" className="text-sm text-muted-foreground">
            Conteúdo da aba de visão geral.
          </TabsContent>
          <TabsContent value="detalhes" className="text-sm text-muted-foreground">
            Conteúdo da aba de detalhes.
          </TabsContent>
        </Tabs>
      </Section>

      {/* Toast */}
      <Section title="Notificações (toast)">
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => toast.success('Alteração salva com sucesso.')}>
            Toast de sucesso
          </Button>
          <Button
            variant="destructive"
            onClick={() => toast.error('Não foi possível salvar.')}
          >
            Toast de erro
          </Button>
        </div>
      </Section>

      {/* Estados padrão */}
      <Section
        title="Estados padrão"
        description="Carregando, vazio e erro — reaproveitados em todo o produto."
      >
        <div className="grid gap-6 md:grid-cols-3">
          <LoadingState rows={3} />
          <EmptyState
            title="Nenhum aluno ainda"
            description="Cadastre o primeiro aluno para começar."
          />
          <ErrorState onRetry={() => toast('Tentando novamente…')} />
        </div>
      </Section>
    </div>
  );
}
