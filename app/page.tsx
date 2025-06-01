'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Dumbbell, BarChart, Calendar, Shield, Users, Trophy } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="w-full py-4 px-6 md:px-8 lg:px-12 flex items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-2 text-primary font-bold text-xl">
          <Dumbbell className="h-6 w-6" />
          <span>FitConnect Pro</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost">Entrar</Button>
          </Link>
          <Link href="/register">
            <Button>Cadastrar</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 px-6 md:px-8 lg:px-12 landing-hero">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Eleve seu Negócio de Personal Training
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              A plataforma completa para personal trainers gerenciarem alunos, criarem treinos, acompanharem progresso e expandirem seus negócios.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Comece Grátis <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="#pricing">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Ver Preços
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-video bg-muted rounded-lg overflow-hidden shadow-2xl">
              <img 
                src="https://images.pexels.com/photos/4498362/pexels-photo-4498362.jpeg" 
                alt="FitConnect Pro Dashboard" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 px-6 md:px-8 lg:px-12 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">Gestão Completa de Fitness</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Tudo que você precisa para gerenciar seu negócio de personal training em um só lugar.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Dumbbell className="h-8 w-8 text-primary" />,
                title: "Biblioteca de Exercícios",
                description: "Crie e gerencie uma biblioteca completa de exercícios com vídeos, instruções e variações."
              },
              {
                icon: <BarChart className="h-8 w-8 text-primary" />,
                title: "Acompanhamento de Progresso",
                description: "Acompanhe avaliações físicas e visualize o progresso com gráficos detalhados."
              },
              {
                icon: <Calendar className="h-8 w-8 text-primary" />,
                title: "Agendamento Inteligente",
                description: "Gerencie eficientemente os horários com seus alunos através de uma agenda intuitiva."
              },
              {
                icon: <Shield className="h-8 w-8 text-primary" />,
                title: "Análise por IA",
                description: "Utilize inteligência artificial para análise postural e recomendações personalizadas."
              },
              {
                icon: <Users className="h-8 w-8 text-primary" />,
                title: "Gestão de Equipe",
                description: "Adicione e gerencie treinadores em sua equipe com controles de acesso personalizados."
              },
              {
                icon: <Trophy className="h-8 w-8 text-primary" />,
                title: "Gamificação",
                description: "Mantenha os alunos motivados com conquistas, desafios e recompensas de performance."
              },
            ].map((feature, index) => (
              <div key={index} className="landing-feature-card p-6 rounded-lg border transition-all duration-200 hover:shadow-lg">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 md:py-24 px-6 md:px-8 lg:px-12 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">Preços Simples e Transparentes</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Escolha o plano que se adequa às suas necessidades e cresça conforme seu negócio.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Free Plan */}
            <div className="landing-pricing-card rounded-lg overflow-hidden border shadow-sm">
              <div className="p-6">
                <h3 className="text-xl font-semibold">Teste Grátis</h3>
                <div className="mt-4 flex items-end">
                  <span className="text-3xl font-bold">R$0</span>
                  <span className="text-muted-foreground ml-2">/ 14 dias</span>
                </div>
                <ul className="mt-6 space-y-3">
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Até 5 alunos
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Biblioteca básica de exercícios
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Planos de treino simples
                  </li>
                  <li className="flex items-center text-muted-foreground">
                    <svg className="h-5 w-5 text-muted-foreground mr-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    Sem treinadores adicionais
                  </li>
                  <li className="flex items-center text-muted-foreground">
                    <svg className="h-5 w-5 text-muted-foreground mr-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    Recursos de IA limitados
                  </li>
                </ul>
                <div className="mt-8">
                  <Link href="/register?plan=free">
                    <Button className="w-full" variant="outline">Começar Teste Grátis</Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Platinum Plan */}
            <div className="landing-pricing-card rounded-lg overflow-hidden border shadow-sm relative">
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1 text-sm font-medium rounded-bl-lg">
                Popular
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold">Platinum</h3>
                <div className="mt-4 flex items-baseline gap-4">
                  <div className="flex items-end">
                    <span className="text-3xl font-bold">R$249</span>
                    <span className="text-muted-foreground ml-1">/ mês</span>
                  </div>
                  <div className="flex items-end">
                    <span className="text-xl font-semibold">R$2.499</span>
                    <span className="text-muted-foreground ml-1">/ ano</span>
                  </div>
                </div>
                <ul className="mt-6 space-y-3">
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Até 100 alunos (mensal)
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Até 1000 alunos (anual)
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    5-20 treinadores adicionais
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Biblioteca completa de exercícios
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Recursos de IA avançados
                  </li>
                </ul>
                <div className="mt-8">
                  <Link href="/register?plan=platinum">
                    <Button className="w-full">Escolher Platinum</Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Gold Plan */}
            <div className="landing-pricing-card rounded-lg overflow-hidden border shadow-sm">
              <div className="p-6">
                <h3 className="text-xl font-semibold">Gold</h3>
                <div className="mt-4 flex items-baseline gap-4">
                  <div className="flex items-end">
                    <span className="text-3xl font-bold">R$499</span>
                    <span className="text-muted-foreground ml-1">/ mês</span>
                  </div>
                  <div className="flex items-end">
                    <span className="text-xl font-semibold">R$4.999</span>
                    <span className="text-muted-foreground ml-1">/ ano</span>
                  </div>
                </div>
                <ul className="mt-6 space-y-3">
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Até 1000 alunos (mensal)
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Até 5000 alunos (anual)
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    10-50 treinadores adicionais
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Recursos premium
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Suporte prioritário
                  </li>
                </ul>
                <div className="mt-8">
                  <Link href="/register?plan=gold">
                    <Button className="w-full" variant="outline">Escolher Gold</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 md:px-8 lg:px-12 bg-muted">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Recursos</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Preços</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Integrações</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Recursos</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Documentação</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Guias</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Suporte</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Sobre</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Blog</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Carreiras</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Privacidade</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Termos de Uso</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Cookies</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-primary font-bold">
              <Dumbbell className="h-5 w-5" />
              <span>FitConnect Pro</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} FitConnect Pro. Todos os direitos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}