import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  CalendarClock,
  ClipboardList,
  Copy,
  Dumbbell,
  HeartPulse,
  Mail,
  PlayCircle,
  Smartphone,
  Sparkles,
  Trophy,
  UserPlus,
  Users,
  Utensils,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HeroMock } from '@/components/marketing/hero-mock';
import { LandingFaq } from '@/components/marketing/landing-faq';

/**
 * Landing pública do Flvxus (Server Component).
 *
 * O texto de recursos e do FAQ deriva do inventário real de funcionalidades
 * (.agents/tasks/doc-ajuda-plan.md §1) e da ajuda interna
 * (components/ajuda/conteudo-ajuda.tsx). Nada de feature, preço, depoimento ou
 * métrica inventados: depoimentos e preços são placeholders claramente marcados.
 * O FAQ interativo e a ilustração do hero vivem em components/marketing/.
 */

// Recursos reais confirmados no inventário, agrupados por categoria.
const recursos = [
  {
    icon: Users,
    titulo: 'Gestão de alunos',
    descricao:
      'Convide alunos por e-mail, reenvie convites pendentes, edite cadastros e controle o status (ativo, inativo, arquivado) com lista filtrável.',
  },
  {
    icon: HeartPulse,
    titulo: 'Avaliação física',
    descricao:
      'Dobras cutâneas, circunferências, InBody e anamnese. A composição corporal é calculada no servidor; anexe fotos e acompanhe por gráficos de evolução.',
  },
  {
    icon: Dumbbell,
    titulo: 'Biblioteca de exercícios',
    descricao:
      'Catálogo global somente leitura mais o seu acervo editável. Duplique exercícios do catálogo e anexe mídia (GIF/vídeo) que aparece na execução.',
  },
  {
    icon: ClipboardList,
    titulo: 'Montagem de treino',
    descricao:
      'Modelos reutilizáveis, montagem a partir de múltiplos modelos, divisões A/B/C/D/E, clonar ficha para outro aluno e liberação imediata ou programada.',
  },
  {
    icon: PlayCircle,
    titulo: 'Treinar presencialmente',
    descricao:
      'Acompanhe o treino ao vivo: o professor abre a mesma tela de execução do aluno e registra a sessão em nome dele, a partir de uma ficha liberada.',
  },
  {
    icon: Utensils,
    titulo: 'Dieta com IA',
    descricao:
      'A IA gera um rascunho de dieta; o professor revisa, edita e aprova. Nada chega ao aluno automaticamente — só depois da liberação.',
  },
  {
    icon: BarChart3,
    titulo: 'Evolução',
    descricao:
      'Aderência aos treinos e gráficos de carga, volume e frequência, somados aos gráficos das avaliações físicas (peso, percentual de gordura, cintura).',
  },
  {
    icon: Trophy,
    titulo: 'Gamificação',
    descricao:
      'Pontos acumulados, sequência (streak) de treinos e conquistas desbloqueadas para o aluno manter a constância.',
  },
  {
    icon: Smartphone,
    titulo: 'Mobile-first (Android e iOS)',
    descricao:
      'Experiência pensada para o celular primeiro e empacotável como aplicativo Android e iOS, além de rodar no navegador.',
  },
];

// "Como funciona" em passos.
const passos = [
  {
    icon: UserPlus,
    titulo: 'Crie sua conta de professor',
    descricao:
      'Cadastre-se com nome, e-mail e senha. Sua conta já vem com um espaço de trabalho para seus alunos e conteúdos.',
  },
  {
    icon: Mail,
    titulo: 'Convide seus alunos por e-mail',
    descricao:
      'O aluno recebe um convite, define a própria senha e passa a ter a área dele dentro do seu espaço.',
  },
  {
    icon: Sparkles,
    titulo: 'Monte avaliações e treinos e libere',
    descricao:
      'Crie avaliações e fichas (com modelos ou apoio da IA) e libere na hora ou agende. Liberar é o que entrega o conteúdo ao aluno.',
  },
  {
    icon: PlayCircle,
    titulo: 'O aluno treina e acompanha a evolução',
    descricao:
      'No celular, o aluno executa o treino série por série e vê a própria evolução, dieta e conquistas.',
  },
];

// Pontos para cada papel, derivados das seções 1.A e 1.B do inventário.
const paraProfessor = [
  'Painel com total de alunos, avaliações vencidas e fichas aguardando liberação.',
  'Avaliação física completa com composição corporal calculada automaticamente.',
  'Modelos de treino, divisões A/B/C/D/E e clonagem de fichas entre alunos.',
  'Liberação imediata ou programada por data ou por número de dias.',
  'Dieta e treino com apoio de IA, sempre com revisão e aprovação sua.',
];

const paraAluno = [
  'Treino do dia na tela inicial, com atalhos para dieta, evolução e conquistas.',
  'Execução guiada: uma série por vez, timer de descanso e RPE ao finalizar.',
  'GIF/vídeo de demonstração e instruções em cada exercício.',
  'Dieta liberada com metas, refeições e totais, somente leitura.',
  'Evolução com gráficos e conquistas para manter a constância.',
];

// PLACEHOLDER depoimentos — sem depoimentos reais ainda.
const depoimentos = [
  { nome: 'Professor(a) de exemplo', papel: 'Personal trainer' },
  { nome: 'Aluno(a) de exemplo', papel: 'Aluno' },
  { nome: 'Professor(a) de exemplo', papel: 'Personal trainer' },
];

export default function MarketingHomePage() {
  return (
    <>
      {/* ===================== HERO ===================== */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 md:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="max-w-2xl space-y-6">
            <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Acompanhe seus alunos de ponta a ponta
            </h1>
            <p className="text-lg text-muted-foreground">
              O Flvxus reúne cadastro, avaliação física, montagem de treinos,
              dieta e evolução em um só lugar. O professor monta e libera; o
              aluno treina, registra e acompanha o próprio progresso — no
              computador ou no celular.
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
            <p className="text-sm text-muted-foreground">
              <Link
                href="/documentacao"
                className="inline-flex min-h-11 items-center gap-1 rounded font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Ver documentação
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </p>
          </div>

          {/* MOCK ilustrativo — trocar por print real do app aqui */}
          <HeroMock />
        </div>
      </section>

      {/* ===================== RECURSOS ===================== */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-16 md:pb-24">
        <div className="mb-8 max-w-2xl">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Tudo que o seu trabalho precisa
          </h2>
          <p className="mt-2 text-muted-foreground">
            Recursos pensados para o fluxo real do personal trainer e do aluno.
          </p>
        </div>
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
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {recurso.descricao}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ===================== COMO FUNCIONA ===================== */}
      <section className="border-t border-border bg-muted/30">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 md:py-24">
          <div className="mb-8 max-w-2xl">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Como funciona
            </h2>
            <p className="mt-2 text-muted-foreground">
              Do cadastro ao acompanhamento, em poucos passos.
            </p>
          </div>
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {passos.map((passo, i) => {
              const Icon = passo.icon;
              return (
                <li key={passo.titulo}>
                  <Card className="h-full">
                    <CardHeader className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <span className="text-sm font-semibold text-muted-foreground">
                          {i + 1}
                        </span>
                      </div>
                      <CardTitle className="text-base">{passo.titulo}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {passo.descricao}
                      </p>
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* ===================== PROFESSOR / ALUNO ===================== */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 md:py-24">
        <h2 className="mb-8 text-2xl font-bold tracking-tight text-foreground">
          Para cada lado do acompanhamento
        </h2>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-primary" aria-hidden="true" />
                Para o professor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
                {paraProfessor.map((item) => (
                  <li key={item} className="flex gap-2">
                    <CalendarClock
                      className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/documentacao#para-o-professor"
                className="inline-flex min-h-11 items-center gap-1 rounded text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Ver documentação completa
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Dumbbell className="h-5 w-5 text-primary" aria-hidden="true" />
                Para o aluno
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
                {paraAluno.map((item) => (
                  <li key={item} className="flex gap-2">
                    <Copy
                      className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/documentacao#para-o-aluno"
                className="inline-flex min-h-11 items-center gap-1 rounded text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Ver documentação completa
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ===================== PROVA SOCIAL ===================== */}
      {/* PLACEHOLDER depoimentos — sem depoimentos reais ainda */}
      <section className="border-t border-border bg-muted/30">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 md:py-24">
          <h2 className="mb-8 text-2xl font-bold tracking-tight text-foreground">
            O que dizem por aí
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {depoimentos.map((depoimento, i) => (
              <Card key={i}>
                <CardContent className="space-y-4 pt-6">
                  <p className="text-sm italic leading-relaxed text-muted-foreground">
                    [depoimento de exemplo — substituir]
                  </p>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {depoimento.nome}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {depoimento.papel}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== PREÇO / PLANOS ===================== */}
      {/* PLACEHOLDER preços — não inventar valores */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 md:py-24">
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Planos em breve
            </h2>
            <p className="max-w-xl text-muted-foreground">
              Os planos e valores ainda serão divulgados. Enquanto isso, você já
              pode criar sua conta e conhecer o Flvxus.
            </p>
            <Button asChild size="lg" className="mt-2 min-h-11">
              <Link href="/register" className="gap-2">
                Começar agora
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* ===================== FAQ ===================== */}
      <section className="border-t border-border bg-muted/30">
        <div className="mx-auto w-full max-w-3xl px-4 py-16 md:py-24">
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Dúvidas comuns
            </h2>
            <p className="mt-2 text-muted-foreground">
              Respostas rápidas para as situações mais frequentes. Para o
              conteúdo completo, veja a{' '}
              <Link
                href="/documentacao"
                className="rounded font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                documentação
              </Link>
              .
            </p>
          </div>
          <LandingFaq />
        </div>
      </section>

      {/* ===================== CTA FINAL ===================== */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 md:py-24">
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-primary/5 px-6 py-12 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Pronto para começar?
          </h2>
          <p className="max-w-xl text-muted-foreground">
            Crie sua conta de professor e comece a acompanhar seus alunos hoje.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="min-h-11">
              <Link href="/register" className="gap-2">
                Começar agora
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="min-h-11">
              <Link href="/documentacao">Ver documentação</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
