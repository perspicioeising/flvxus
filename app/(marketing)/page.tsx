import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  CalendarClock,
  Check,
  ClipboardList,
  Copy,
  Droplets,
  Dumbbell,
  Flame,
  HeartPulse,
  Mail,
  Medal,
  PlayCircle,
  Smartphone,
  Sparkles,
  Swords,
  Target,
  Trophy,
  UserPlus,
  Users,
  Utensils,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HeroMock } from '@/components/marketing/hero-mock';
import { LandingFaq } from '@/components/marketing/landing-faq';
import { PlanosSection } from '@/components/marketing/planos-section';

/**
 * Landing pública do Flvxus (Server Component).
 *
 * O texto de recursos e do FAQ deriva do inventário real de funcionalidades
 * (ajuda interna em components/ajuda/conteudo-ajuda.tsx e docs/roadmap-reta-final.md).
 * Nada de feature, depoimento ou métrica inventados: depoimentos são placeholder
 * claramente marcado. Os valores dos planos vêm do roadmap §B2 e seguem sujeitos
 * a confirmação comercial do usuário. O FAQ interativo e a ilustração do hero
 * vivem em components/marketing/.
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
      'Dobras cutâneas, circunferências e anamnese. A composição corporal é calculada no servidor; anexe fotos e acompanhe por gráficos de evolução.',
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
    titulo: 'Flvxus Arena',
    descricao:
      'Gamificação por consistência: XP, níveis permanentes, streak, missões, conquistas, rankings da academia e globais, amigos e desafios entre usuários.',
  },
  {
    icon: Droplets,
    titulo: 'Hábitos do dia a dia',
    descricao:
      'Hidratação com meta própria, aderência à dieta com o "cumpri hoje" em cada refeição e check-in diário para manter a rotina em dia.',
  },
  {
    icon: Target,
    titulo: 'Treinar por conta própria',
    descricao:
      'Quem não tem personal usa o plano Individual: cria os próprios treinos e dietas, acompanha a evolução e entra na Arena competindo com todo mundo.',
  },
  {
    icon: Smartphone,
    titulo: 'Mobile-first (Android e iOS)',
    descricao:
      'Experiência pensada para o celular primeiro e empacotável como aplicativo Android e iOS, além de rodar no navegador.',
  },
];

// Pilares da Flvxus Arena (gamificação), para a seção de destaque.
const arenaPilares = [
  {
    icon: Sparkles,
    titulo: 'XP por consistência',
    descricao:
      'Você ganha XP ao concluir treinos, cumprir a dieta do dia, bater a meta de água, registrar evolução, progredir carga e fazer check-in. Vale a frequência, não o excesso.',
  },
  {
    icon: Trophy,
    titulo: 'Níveis permanentes',
    descricao:
      'De Iniciante a Lenda: o XP acumulado nunca zera. Cada nível é uma conquista que fica com você.',
  },
  {
    icon: Flame,
    titulo: 'Streak e missões',
    descricao:
      'Mantenha a sequência (o descanso programado não quebra o streak) e cumpra missões diárias e semanais.',
  },
  {
    icon: Medal,
    titulo: 'Rankings e conquistas',
    descricao:
      'Dispute o ranking da sua academia e os rankings globais mensal e anual, e desbloqueie conquistas pelo caminho.',
  },
  {
    icon: Users,
    titulo: 'Amigos',
    descricao:
      'Adicione amigos pelo @handle e acompanhe quem está mais consistente na sua lista.',
  },
  {
    icon: Swords,
    titulo: 'Desafios entre amigos',
    descricao:
      'Desafie um amigo para um duelo de XP de 7, 15 ou 30 dias. Começa a valer quando os dois aceitam; quem somar mais XP no período leva a medalha "Campeão de desafio".',
  },
];

// "Como funciona" em passos.
const passos = [
  {
    icon: UserPlus,
    titulo: 'Crie sua conta',
    descricao:
      'No cadastro, escolha "Sou personal" ou "Treino por conta própria". Sua conta já vem com o espaço certo para o seu uso.',
  },
  {
    icon: Mail,
    titulo: 'Convide alunos ou monte o seu',
    descricao:
      'O personal convida alunos por e-mail e monta o conteúdo deles. Quem treina por conta própria cria os próprios treinos e dietas direto na sua área.',
  },
  {
    icon: Sparkles,
    titulo: 'Avaliações, treinos e dieta',
    descricao:
      'Crie com modelos ou apoio da IA. No fluxo personal→aluno, liberar é o que entrega o conteúdo; quem treina sozinho já vê o que criou na hora.',
  },
  {
    icon: PlayCircle,
    titulo: 'Treine, acompanhe e jogue na Arena',
    descricao:
      'No celular, execute o treino série por série, registre hábitos e acompanhe a evolução — ganhando XP e subindo na Flvxus Arena.',
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
  'Treino do dia na tela inicial, com atalhos para dieta, evolução e Arena.',
  'Execução guiada: uma série por vez, timer de descanso e RPE ao finalizar.',
  'GIF/vídeo de demonstração e instruções em cada exercício.',
  'Dieta com metas, refeições e totais, e o "cumpri hoje" em cada refeição.',
  'Hábitos de hidratação e check-in diário, com XP por consistência na Arena.',
];

// Para quem treina por conta própria (plano Individual / aluno autônomo).
const paraAutonomo = [
  'Crie seus próprios treinos, dietas e avaliações, que já nascem liberados para você.',
  'Sem etapa de "liberar": o que você cria aparece na hora, na sua área.',
  'Hábitos, evolução e metas de hidratação sob o seu controle.',
  'Participe da Flvxus Arena e dos rankings globais, competindo com todo mundo.',
  'Adicione amigos por @handle e dispute desafios de XP.',
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
      <section className="mx-auto w-full max-w-6xl px-4 py-12 md:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="max-w-2xl space-y-6">
            <h1 className="text-4xl font-black leading-[0.95] tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Treine seus alunos ou treine por conta própria
              <span className="text-primary">.</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              O Flvxus reúne avaliação física, montagem de treinos, dieta com
              IA, hábitos e evolução em um só lugar. O personal monta e libera
              para seus alunos; quem treina sozinho cria o próprio plano. Todo
              mundo joga na Flvxus Arena — no computador ou no celular.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="xl">
                <Link href="/register" className="gap-2">
                  Começar agora
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="xl">
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
      <section className="mx-auto w-full max-w-6xl px-4 pb-12 md:pb-24">
        <div className="mb-8 max-w-2xl">
          <h2 className="text-2xl font-black uppercase tracking-tight text-foreground sm:text-3xl md:text-4xl">
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
        <div className="mx-auto w-full max-w-6xl px-4 py-12 md:py-24">
          <div className="mb-8 max-w-2xl">
            <h2 className="text-2xl font-black uppercase tracking-tight text-foreground sm:text-3xl md:text-4xl">
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

      {/* ===================== PROFESSOR / ALUNO / AUTÔNOMO ===================== */}
      <section className="mx-auto w-full max-w-6xl px-4 py-12 md:py-24">
        <h2 className="mb-8 text-2xl font-black uppercase tracking-tight text-foreground sm:text-3xl md:text-4xl">
          Para cada jeito de treinar
        </h2>
        <div className="grid gap-6 lg:grid-cols-3">
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

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="h-5 w-5 text-primary" aria-hidden="true" />
                Para quem treina sozinho
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
                {paraAutonomo.map((item) => (
                  <li key={item} className="flex gap-2">
                    <Check
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

      {/* ===================== FLVXUS ARENA ===================== */}
      <section className="border-t border-border bg-muted/30">
        <div className="mx-auto w-full max-w-6xl px-4 py-12 md:py-24">
          <div className="mb-8 max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
              <Trophy className="h-4 w-4" aria-hidden="true" />
              Flvxus Arena
            </span>
            <h2 className="mt-3 text-2xl font-black uppercase tracking-tight text-foreground sm:text-3xl md:text-4xl">
              Consistência que vira jogo
            </h2>
            <p className="mt-2 text-muted-foreground">
              A gamificação do Flvxus premia quem mantém a rotina, não quem
              exagera. Cada ação real vira XP, e a disputa acontece na sua
              academia e no mundo todo.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {arenaPilares.map((pilar) => {
              const Icon = pilar.icon;
              return (
                <Card key={pilar.titulo}>
                  <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <CardTitle className="text-base">{pilar.titulo}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {pilar.descricao}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===================== PROVA SOCIAL ===================== */}
      {/* PLACEHOLDER depoimentos — sem depoimentos reais ainda */}
      <section className="border-t border-border bg-muted/30">
        <div className="mx-auto w-full max-w-6xl px-4 py-12 md:py-24">
          <h2 className="mb-8 text-2xl font-black uppercase tracking-tight text-foreground sm:text-3xl md:text-4xl">
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
      <PlanosSection />

      {/* ===================== FAQ ===================== */}
      <section className="border-t border-border bg-muted/30">
        <div className="mx-auto w-full max-w-3xl px-4 py-12 md:py-24">
          <div className="mb-8">
            <h2 className="text-2xl font-black uppercase tracking-tight text-foreground sm:text-3xl md:text-4xl">
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
      <section className="mx-auto w-full max-w-6xl px-4 py-12 md:py-24">
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-primary/5 px-6 py-12 text-center">
          <h2 className="text-2xl font-black uppercase tracking-tight text-foreground sm:text-3xl md:text-4xl">
            Pronto para começar?
          </h2>
          <p className="max-w-xl text-muted-foreground">
            Crie sua conta de professor e comece a acompanhar seus alunos hoje.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="xl">
              <Link href="/register" className="gap-2">
                Começar agora
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="xl">
              <Link href="/documentacao">Ver documentação</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
