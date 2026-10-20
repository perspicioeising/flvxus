import Link from 'next/link';
import {
  ArrowRight,
  Users,
  HeartPulse,
  ClipboardList,
  Utensils,
  BarChart3,
  Smartphone,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const recursos = [
  {
    icon: Users,
    titulo: 'Gestão de alunos',
    descricao: 'Cadastre e acompanhe seus alunos, com visão de quem está ativo e aderência.',
  },
  {
    icon: HeartPulse,
    titulo: 'Avaliação física',
    descricao: 'Medidas, composição corporal, dobras e fotos, com histórico e evolução.',
  },
  {
    icon: ClipboardList,
    titulo: 'Treinos',
    descricao: 'Monte fichas por aluno e reaproveite modelos de rotina com facilidade.',
  },
  {
    icon: Utensils,
    titulo: 'Dietas com IA',
    descricao: 'Sugestões geradas por IA, sempre revisáveis e aprovadas por você.',
  },
  {
    icon: BarChart3,
    titulo: 'Evolução',
    descricao: 'Gráficos comparando avaliações para mostrar resultado ao aluno.',
  },
  {
    icon: Smartphone,
    titulo: 'Pronto para o celular',
    descricao: 'Experiência mobile-first, pensada para uso durante o treino.',
  },
];

export default function MarketingHomePage() {
  return (
    <>
      {/* Hero */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 md:py-24">
        <div className="max-w-2xl space-y-6">
          <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Gerencie seus alunos em um só lugar
          </h1>
          <p className="text-lg text-muted-foreground">
            O Flvxus reúne avaliação física, treinos, dietas e evolução para
            personal trainers acompanharem cada aluno com clareza — no computador
            ou no celular.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="min-h-11">
              <Link href="/register" className="gap-2">
                Começar agora
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="min-h-11">
              <Link href="/login">Já tenho conta</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Recursos */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-16 md:pb-24">
        <h2 className="mb-8 text-2xl font-bold tracking-tight text-foreground">
          Tudo que o seu trabalho precisa
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recursos.map((recurso) => {
            const Icon = recurso.icon;
            return (
              <Card key={recurso.titulo}>
                <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <CardTitle className="text-base">{recurso.titulo}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{recurso.descricao}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </>
  );
}
