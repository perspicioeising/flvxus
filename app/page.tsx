'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from 'next/image';
import { ArrowRight, Dumbbell, BarChart, Calendar, Shield, Users, Trophy, BarChart3, Check, Play, Sparkles, TrendingUp, Star, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-green-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black text-foreground overflow-x-hidden">
      {/* Navigation */}
      <header className="w-full py-6 px-6 md:px-8 lg:px-12 flex items-center justify-between relative">
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-green-200/50 dark:border-green-800/30"></div>
        <div className="relative flex items-center gap-3 font-bold text-2xl z-10">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Dumbbell className="h-6 w-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <Zap className="h-2 w-2 text-white" />
            </div>
          </div>
          <span className="bg-gradient-to-r from-gray-600 via-gray-600 to-gray-900 dark:from-white dark:via-gray-400 dark:to-white bg-clip-text text-transparent">
            FLVXUS
          </span>
        </div>
        <div className="relative flex items-center gap-4 z-10">
          <Link href="/login">
            <Button variant="ghost" className="rounded-2xl hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-300">
              Entrar
            </Button>
          </Link>
          <Link href="/register">
            <Button className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white rounded-2xl font-bold shadow-xl hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-105 border-0">
              Cadastrar
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-green-600/10 via-background to-emerald-500/5" />
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-green-500/20 to-emerald-500/10 rounded-full blur-3xl animate-pulse opacity-50" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-tl from-teal-500/15 to-transparent rounded-full blur-3xl animate-pulse delay-1000 opacity-60" />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-gradient-to-r from-blue-500/10 to-purple-500/20 rounded-full blur-3xl animate-pulse delay-500 opacity-40" />
          
          {/* Floating Elements */}
          <div className="absolute top-1/4 right-1/4 w-4 h-4 bg-green-500/30 rounded-full animate-bounce delay-300" />
          <div className="absolute top-3/4 left-1/4 w-6 h-6 bg-emerald-500/20 rounded-full animate-bounce delay-700" />
          <div className="absolute top-1/3 left-1/6 w-3 h-3 bg-teal-500/40 rounded-full animate-bounce delay-1000" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 text-center lg:text-left">
              {/* Main Heading with Animation */}
              <div className="space-y-4 mb-8 mt-8">
                <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-6xl font-black leading-none">
                  <span className="block transform hover:scale-105 transition-transform duration-300">
                    Transforme
                  </span>
                  <span className="block bg-gradient-to-r from-green-600 via-emerald-500 to-teal-600 bg-clip-text text-transparent transform hover:scale-105 transition-transform duration-300 delay-100">
                    seu Negócio
                  </span>
                  <span className="block bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-600 bg-clip-text text-transparent transform hover:scale-105 transition-transform duration-300 delay-200">
                    Fitness
                  </span>
                </h1>
              </div>
              
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                A plataforma que combina{" "}
                <span className="text-green-600 dark:text-green-400 font-semibold">gestão inteligente</span>,{" "}
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">IA avançada</span> e{" "}
                <span className="text-teal-600 dark:text-teal-400 font-semibold">resultados excepcionais</span>{" "}
                para personal trainers visionários.
              </p>
              
              {/* Enhanced CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start mb-12">
                <Button size="lg" className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white shadow-2xl hover:shadow-green-500/25 transition-all duration-500 transform hover:scale-110 hover:-translate-y-1 text-lg px-8 py-6 relative overflow-hidden group rounded-2xl border-0 font-bold" asChild>
                  <Link href="/register" className="flex items-center relative z-10">
                    <span className="mr-3">Começar Gratuitamente</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-2 border-green-300 dark:border-green-600 hover:border-green-500 dark:hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-300 transform hover:scale-105 text-lg px-8 py-6 group relative overflow-hidden rounded-2xl font-semibold">
                  <Play className="w-5 h-5 mr-3 group-hover:scale-125 transition-transform duration-300 text-green-600 dark:text-green-400" />
                  <span className="text-green-800 dark:text-green-300">Ver Demo Interativa</span>
                  <div className="absolute inset-0 bg-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Button>
              </div>
              
              {/* Enhanced Trust Indicators */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 text-sm">
                <div className="flex items-center gap-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl px-6 py-3 border border-green-200/50 dark:border-green-700/50 shadow-lg">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">14 dias grátis</span>
                </div>
                <div className="flex items-center gap-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl px-6 py-3 border border-emerald-200/50 dark:border-emerald-700/50 shadow-lg">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Sem cartão</span>
                </div>
                <div className="flex items-center gap-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl px-6 py-3 border border-teal-200/50 dark:border-teal-700/50 shadow-lg">
                  <Check className="w-4 h-4 text-teal-500" />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Suporte 24/7</span>
                </div>
              </div>
            </div>
            
            {/* Enhanced Image Section */}
            <div className="lg:w-1/2 relative">
              <div className="relative group">
                {/* Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/30 via-emerald-500/20 to-teal-500/10 rounded-3xl blur-3xl transform rotate-6 group-hover:rotate-12 transition-transform duration-700" />
                
                {/* Main Image */}
                <img 
                  src="https://images.pexels.com/photos/4498362/pexels-photo-4498362.jpeg" 
                  alt="Personal trainer revolucionário" 
                  className="relative rounded-3xl shadow-2xl w-full h-auto max-w-lg mx-auto transform group-hover:scale-105 transition-all duration-700 border border-green-200/20 dark:border-green-700/20"
                />
                
                {/* Enhanced Floating Cards */}
                <div className="absolute -bottom-8 -left-8 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-green-200/50 dark:border-green-700/50 transform hover:scale-110 transition-all duration-500 hover:shadow-3xl">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <TrendingUp className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-lg text-green-600 dark:text-green-400">+287% ROI</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">em 6 meses médios</p>
                    </div>
                  </div>
                </div>
                
                <div className="absolute -top-8 -right-8 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-emerald-200/50 dark:border-emerald-700/50 transform hover:scale-110 transition-all duration-500 hover:shadow-3xl">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Users className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-lg text-emerald-600 dark:text-emerald-400">12.5K+</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">clientes ativos</p>
                    </div>
                  </div>
                </div>
                
                <div className="absolute top-1/2 -right-16 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl p-4 shadow-2xl border border-purple-200/50 dark:border-purple-700/50 transform hover:scale-110 transition-all duration-500 hover:shadow-3xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-purple-600 dark:text-purple-400">AI Smart</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Insights</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-green-100/30 via-background to-emerald-100/20 dark:from-green-900/10 dark:via-background dark:to-emerald-900/10" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-8 leading-tight">
              <span className="block">Tudo que você precisa para</span>
              <span className="block bg-gradient-to-r from-green-600 via-emerald-500 to-teal-600 bg-clip-text text-transparent">
                dominar o mercado fitness
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Tecnologia de ponta, design intuitivo e resultados comprovados.{" "}
              <span className="text-green-600 dark:text-green-400 font-semibold">Seja o personal trainer do futuro.</span>
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Dumbbell,
                title: "Biblioteca de Exercícios",
                description: "Crie e gerencie uma biblioteca completa de exercícios com vídeos, instruções e variações.",
                gradient: "from-blue-500 to-cyan-600",
                hoverGradient: "from-blue-400 to-cyan-500"
              },
              {
                icon: BarChart,
                title: "Acompanhamento de Progresso",
                description: "Acompanhe avaliações físicas e visualize o progresso com gráficos detalhados.",
                gradient: "from-emerald-500 to-green-600",
                hoverGradient: "from-emerald-400 to-green-500"
              },
              {
                icon: Calendar,
                title: "Agendamento Inteligente",
                description: "Gerencie eficientemente os horários com seus alunos através de uma agenda intuitiva.",
                gradient: "from-purple-500 to-indigo-600",
                hoverGradient: "from-purple-400 to-indigo-500"
              },
              {
                icon: Shield,
                title: "Análise por IA",
                description: "Utilize inteligência artificial para análise postural e recomendações personalizadas.",
                gradient: "from-orange-500 to-red-600",
                hoverGradient: "from-orange-400 to-red-500"
              },
              {
                icon: Users,
                title: "Gestão de Equipe",
                description: "Adicione e gerencie treinadores em sua equipe com controles de acesso personalizados.",
                gradient: "from-pink-500 to-rose-600",
                hoverGradient: "from-pink-400 to-rose-500"
              },
              {
                icon: Trophy,
                title: "Gamificação",
                description: "Mantenha os alunos motivados com conquistas, desafios e recompensas de performance.",
                gradient: "from-yellow-500 to-orange-600",
                hoverGradient: "from-yellow-400 to-orange-500"
              }
            ].map((feature, index) => (
              <div key={index} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 via-blue-500/20 to-purple-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl overflow-hidden group-hover:transform group-hover:scale-105 group-hover:-translate-y-2">
                  
                  {/* Animated gradient border */}
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute inset-[1px] bg-white dark:bg-gray-900 rounded-2xl"></div>

                  <div className="relative p-8 h-full">
                    <div className={`bg-gradient-to-br ${feature.gradient} group-hover:bg-gradient-to-br group-hover:${feature.hoverGradient} w-16 h-16 rounded-3xl flex items-center justify-center mb-6 shadow-xl transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500`}>
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-4 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">{feature.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feature.description}</p>

                    <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                      <ArrowRight className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-600/5 via-background to-emerald-600/10" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-8">
              <span className="block">Planos que multiplicam</span>
              <span className="block bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                seus resultados
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Escolha seu nível de impacto. <span className="text-green-600 dark:text-green-400 font-semibold">ROI médio de 287% em 6 meses.</span>
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Free Plan Enhanced */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-600/20 to-gray-700/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl overflow-hidden group-hover:transform group-hover:scale-105">

                <div className="absolute inset-0 bg-gradient-to-r from-gray-500 via-slate-500 to-gray-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-[1px] bg-white dark:bg-gray-900 rounded-2xl"></div>

                <div className="relative p-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold mb-4">Teste grátis</h3>
                    <div className="mb-6">
                      <span className="text-5xl font-black">R$0</span>
                      <span className="text-gray-600 dark:text-gray-400 text-lg">/mês</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                      Ideal para descobrir o potencial
                    </p>
                  </div>
                  
                  <ul className="space-y-4 mb-8">
                    {[
                      "1 aluno ativo",
                      "50 exercícios premium",
                      "10 templates profissionais",
                      "100MB armazenamento",
                      "Dashboard essencial"
                    ].map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Check className="mr-3 h-5 w-5 text-green-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button className="w-full transform hover:scale-105 transition-all duration-300 rounded-2xl font-semibold" variant="outline" asChild>
                    <Link href="/register">
                      Começar Grátis
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Pro Plan Enhanced */}
            <div className="group relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-green-600 via-emerald-500 to-teal-600 rounded-3xl blur-3xl opacity-75 group-hover:opacity-100 transition-all duration-700 animate-pulse" />
              <div className="relative bg-white/95 dark:bg-gray-900/95 border-2 border-green-500 rounded-3xl overflow-hidden shadow-3xl transform group-hover:scale-105 transition-all duration-500 backdrop-blur-xl">
                <div className="absolute top-0 right-0 bg-gradient-to-l from-green-600 to-emerald-600 text-white text-sm font-bold px-6 py-3 rounded-bl-3xl">
                  🔥 MAIS ESCOLHIDO
                </div>
                <div className="p-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold mb-4">Platinum</h3>
                    <div className="mb-6">
                      <span className="text-5xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">R$49,90</span>
                      <span className="text-gray-600 dark:text-gray-400 text-lg">/mês</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                      Para trainers ambiciosos
                    </p>
                  </div>
                  
                  <ul className="space-y-4 mb-8">
                    {[
                      "100 alunos simultâneos",
                      "Biblioteca completa + IA",
                      "Templates ilimitados",
                      "5GB armazenamento",
                      "IA avançada + predições",
                      "Chat & automações"
                    ].map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Check className="mr-3 h-5 w-5 text-green-500" />
                        <span className="font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-xl transform hover:scale-105 transition-all duration-300 rounded-2xl font-bold border-0" asChild>
                    <Link href="/register?plan=pro">
                      Revolucionar Agora
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Enterprise Plan Enhanced */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/20 to-orange-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl overflow-hidden group-hover:transform group-hover:scale-105">

                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-[1px] bg-white dark:bg-gray-900 rounded-2xl"></div>

                <div className="relative p-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold mb-4">Gold</h3>
                    <div className="mb-6">
                      <span className="text-5xl font-black">R$149,90</span>
                      <span className="text-gray-600 dark:text-gray-400 text-lg">/mês</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                      Para impérios fitness
                    </p>
                  </div>
                  
                  <ul className="space-y-4 mb-8">
                    {[
                      "1000+ alunos",
                      "5 trainers simultâneos",
                      "Biblioteca colaborativa",
                      "50GB armazenamento",
                      "IA biomecânica completa",
                      "White label + API"
                    ].map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Check className="mr-3 h-5 w-5 text-green-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button className="w-full transform hover:scale-105 transition-all duration-300 rounded-2xl font-semibold" variant="outline" asChild>
                    <Link href="/register?plan=enterprise">
                      Falar com Especialista
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-100/30 via-background to-green-100/20 dark:from-emerald-900/10 dark:via-background dark:to-green-900/10" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-8">
              <span className="block">Histórias que</span>
              <span className="block bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                inspiram e comprovam
              </span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {[
              {
                name: "Alexandre Silva",
                role: "Personal Trainer, Rio de Janeiro",
                image: "https://images.pexels.com/photos/1684187/pexels-photo-1684187.jpeg",
                testimonial: "Quadrupliquei minha base de clientes em 6 meses. A IA do FitPro não apenas funciona, ela TRANSFORMA. Meus resultados nunca foram tão consistentes.",
                result: "+400% clientes"
              },
              {
                name: "Camila Rodrigues", 
                role: "Studio de Pilates, São Paulo",
                image: "https://images.pexels.com/photos/3765114/pexels-photo-3765114.jpeg",
                testimonial: "Nossa equipe trabalha como um organismo único. Os insights de IA revolucionaram nossa abordagem. Nunca vimos resultados tão rápidos nos alunos.",
                result: "5x mais eficiência"
              },
              {
                name: "Rafael Costa Neto",
                role: "Coach Online, Brasília", 
                image: "https://images.pexels.com/photos/6456300/pexels-photo-6456300.jpeg",
                testimonial: "De 15 para 87 alunos mantendo qualidade premium. A automação me devolveu 20 horas por semana. Isso não é tecnologia, é magia pura.",
                result: "+480% escala"
              }
            ].map((testimonial, index) => (
              <div key={index} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 via-blue-500/20 to-purple-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl overflow-hidden group-hover:transform group-hover:scale-105 group-hover:-translate-y-2">

                  {/* Animated gradient border */}
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute inset-[1px] bg-white dark:bg-gray-900 rounded-2xl"></div>

                  <div className="relative p-8">
                    <div className="flex mb-6">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed text-lg italic">
                      "{testimonial.testimonial}"
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <img 
                          src={testimonial.image}
                          alt={testimonial.name}
                          className="w-14 h-14 rounded-full object-cover mr-4 ring-2 ring-green-500/20"
                        />
                        <div>
                          <h4 className="font-bold text-lg">{testimonial.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-500">{testimonial.result}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">resultado</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-100/50 to-green-100/30 dark:from-gray-900/50 dark:to-green-900/30 py-20 border-t border-green-200/50 dark:border-green-700/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <h4 className="font-semibold mb-4 text-gray-900 dark:text-white">Produto</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors duration-300">Recursos</a></li>
                  <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors duration-300">Preços</a></li>
                  <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors duration-300">Integrações</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4 text-gray-900 dark:text-white">Recursos</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-300">Documentação</a></li>
                  <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-300">Guias</a></li>
                  <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-300">Suporte</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4 text-gray-900 dark:text-white">Empresa</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors duration-300">Sobre</a></li>
                  <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors duration-300">Blog</a></li>
                  <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors duration-300">Carreiras</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4 text-gray-900 dark:text-white">Legal</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-300">Privacidade</a></li>
                  <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-300">Termos de Uso</a></li>
                  <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-300">Cookies</a></li>
                </ul>
              </div>
            </div>
            <div className="mt-12 pt-8 border-t border-green-200/50 dark:border-green-700/50 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3 font-bold">
                <div className="relative">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Dumbbell className="h-4 w-4 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <Zap className="h-1.5 w-1.5 text-white" />
                  </div>
                </div>
                <span className="bg-gradient-to-r from-gray-600 via-gray-600 to-gray-900 dark:from-white dark:via-gray-400 dark:to-white bg-clip-text text-transparent">
                  FLVXUS
                </span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                © {new Date().getFullYear()} FLVXUS. Todos os direitos reservados.
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}