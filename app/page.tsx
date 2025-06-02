'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from 'next/image';
import { ArrowRight, Dumbbell, BarChart, Calendar, Shield, Users, Trophy, BarChart3, Check, Play, Sparkles, TrendingUp, Star } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground overflow-x-hidden">
      {/* Navigation */}
      <header className="w-full py-4 px-6 md:px-8 lg:px-12 flex items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-2 text-primary font-bold text-xl">
          <Dumbbell className="h-6 w-6" />
          <span>FLVXUS</span>
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
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
           <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-primary/5" />
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full blur-3xl animate-pulse opacity-50" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-tl from-primary/15 to-transparent rounded-full blur-3xl animate-pulse delay-1000 opacity-60" />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-gradient-to-r from-primary/10 to-primary/20 rounded-full blur-3xl animate-pulse delay-500 opacity-40" />
          
          {/* Floating Elements */}
          <div className="absolute top-1/4 right-1/4 w-4 h-4 bg-primary/30 rounded-full animate-bounce delay-300" />
          <div className="absolute top-3/4 left-1/4 w-6 h-6 bg-primary/20 rounded-full animate-bounce delay-700" />
          <div className="absolute top-1/3 left-1/6 w-3 h-3 bg-primary/40 rounded-full animate-bounce delay-1000" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 text-center lg:text-left">
              {/* Animated Badge */}
           
              
              {/* Main Heading with Animation */}
              <div className="space-y-4 mb-8 mt-8">
                <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-6xl font-black leading-none">
                  <span className="block transform hover:scale-105 transition-transform duration-300">
                    Transforme
                  </span>
                  <span className="block bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent transform hover:scale-105 transition-transform duration-300 delay-100">
                    seu Negócio
                  </span>
                  <span className="block bg-gradient-to-r from-primary/80 via-primary to-primary/90 bg-clip-text text-transparent transform hover:scale-105 transition-transform duration-300 delay-200">
                    Fitness
                  </span>
                </h1>
              </div>
              
              <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                A plataforma que combina{" "}
                <span className="text-primary font-semibold">gestão inteligente</span>,{" "}
                <span className="text-primary font-semibold">IA avançada</span> e{" "}
                <span className="text-primary font-semibold">resultados excepcionais</span>{" "}
                para personal trainers visionários.
              </p>
              
              {/* Enhanced CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start mb-12">
                <Button size="lg" className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-110 hover:-translate-y-1 text-lg px-8 py-4 relative overflow-hidden group" asChild>
                  <Link href="/register" className="flex items-center relative z-10">
                    <span className="mr-3">Começar Gratuitamente</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-2 border-primary/30 hover:border-primary hover:bg-primary/5 transition-all duration-300 transform hover:scale-105 text-lg px-8 py-4 group relative overflow-hidden">
                  <Play className="w-5 h-5 mr-3 group-hover:scale-125 transition-transform duration-300" />
                  Ver Demo Interativa
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Button>
              </div>
              
              {/* Enhanced Trust Indicators */}
              <div className="flex items-center justify-center lg:justify-start gap-8 text-sm">
                <div className="flex items-center gap-3 bg-card/50 backdrop-blur-sm rounded-full px-4 py-2 border border-border/50">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-muted-foreground font-medium">14 dias grátis</span>
                </div>
                <div className="flex items-center gap-3 bg-card/50 backdrop-blur-sm rounded-full px-4 py-2 border border-border/50">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-muted-foreground font-medium">Sem cartão</span>
                </div>
                <div className="flex items-center gap-3 bg-card/50 backdrop-blur-sm rounded-full px-4 py-2 border border-border/50">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-muted-foreground font-medium">Suporte 24/7</span>
                </div>
              </div>
            </div>
            
            {/* Enhanced Image Section */}
            <div className="lg:w-1/2 relative">
              <div className="relative group">
                {/* Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/20 to-primary/10 rounded-3xl blur-3xl transform rotate-6 group-hover:rotate-12 transition-transform duration-700" />
                
                {/* Main Image */}
                <img 
                  src="https://images.pexels.com/photos/4498362/pexels-photo-4498362.jpeg" 
                  alt="Personal trainer revolucionário" 
                  className="relative rounded-3xl shadow-2xl w-full h-auto max-w-lg mx-auto transform group-hover:scale-105 transition-all duration-700 border border-border/20"
                />
                
                {/* Enhanced Floating Cards */}
                <div className="absolute -bottom-8 -left-8 bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-border/50 transform hover:scale-110 transition-all duration-500 hover:shadow-3xl">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <TrendingUp className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-lg text-green-600">+287% ROI</p>
                      <p className="text-sm text-muted-foreground">em 6 meses médios</p>
                    </div>
                  </div>
                </div>
                
                <div className="absolute -top-8 -right-8 bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-border/50 transform hover:scale-110 transition-all duration-500 hover:shadow-3xl">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg">
                      <Users className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-lg text-primary">12.5K+</p>
                      <p className="text-sm text-muted-foreground">clientes ativos</p>
                    </div>
                  </div>
                </div>
                
                <div className="absolute top-1/2 -right-16 bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur-xl rounded-3xl p-4 shadow-2xl border border-border/50 transform hover:scale-110 transition-all duration-500 hover:shadow-3xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-purple-600">AI Smart</p>
                      <p className="text-xs text-muted-foreground">Insights</p>
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
  <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-background to-muted/20" />
  <div className="container mx-auto px-4 relative">
    <div className="text-center mb-24">
     
      <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-8 leading-tight">
        <span className="block">Tudo que você precisa para</span>
        <span className="block bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
          dominar o mercado fitness
        </span>
      </h2>
      <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
        Tecnologia de ponta, design intuitivo e resultados comprovados.{" "}
        <span className="text-primary font-semibold">Seja o personal trainer do futuro.</span>
      </p>
    </div>

    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[
        {
          icon: Dumbbell,
          title: "Biblioteca de Exercícios",
          description: "Crie e gerencie uma biblioteca completa de exercícios com vídeos, instruções e variações.",
          gradient: "from-blue-500 to-blue-600",
          hoverGradient: "from-blue-400 to-blue-500"
        },
        {
          icon: BarChart,
          title: "Acompanhamento de Progresso",
          description: "Acompanhe avaliações físicas e visualize o progresso com gráficos detalhados.",
          gradient: "from-emerald-500 to-emerald-600",
          hoverGradient: "from-emerald-400 to-emerald-500"
        },
        {
          icon: Calendar,
          title: "Agendamento Inteligente",
          description: "Gerencie eficientemente os horários com seus alunos através de uma agenda intuitiva.",
          gradient: "from-purple-500 to-purple-600",
          hoverGradient: "from-purple-400 to-purple-500"
        },
        {
          icon: Shield,
          title: "Análise por IA",
          description: "Utilize inteligência artificial para análise postural e recomendações personalizadas.",
          gradient: "from-orange-500 to-orange-600",
          hoverGradient: "from-orange-400 to-orange-500"
        },
        {
          icon: Users,
          title: "Gestão de Equipe",
          description: "Adicione e gerencie treinadores em sua equipe com controles de acesso personalizados.",
          gradient: "from-pink-500 to-pink-600",
          hoverGradient: "from-pink-400 to-pink-500"
        },
        {
          icon: Trophy,
          title: "Gamificação",
          description: "Mantenha os alunos motivados com conquistas, desafios e recompensas de performance.",
          gradient: "from-red-500 to-red-600",
          hoverGradient: "from-red-400 to-red-500"
        }
      ].map((feature, index) => (
        <div key={index} className="group relative">
          <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 rounded-3xl blur-xl transition-all duration-500`} />
          <div className="relative bg-gradient-to-br from-card/80 via-card/60 to-card/40 backdrop-blur-xl rounded-3xl p-8 shadow-lg border border-border/50 hover:shadow-3xl hover:border-primary/30 transition-all duration-500 h-full transform group-hover:scale-105 group-hover:-translate-y-2">
            <div className={`bg-gradient-to-br ${feature.gradient} group-hover:bg-gradient-to-br group-hover:${feature.hoverGradient} w-16 h-16 rounded-3xl flex items-center justify-center mb-6 shadow-xl transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500`}>
              <feature.icon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-4 group-hover:text-primary transition-colors duration-300">{feature.title}</h3>
            <p className="text-muted-foreground leading-relaxed">{feature.description}</p>

            <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
              <ArrowRight className="w-5 h-5 text-primary" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>


      {/* Pricing Section */}
     <section id="pricing" className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-8">
              <span className="block">Planos que multiplicam</span>
              <span className="block bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                seus resultados
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Escolha seu nível de impacto. <span className="text-primary font-semibold">ROI médio de 287% em 6 meses.</span>
            </p>
          </div>
          
          {/* Rest of pricing section with enhanced styling */}
          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Free Plan Enhanced */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-3xl blur-2xl opacity-0 group-hover:opacity-50 transition-all duration-700" />
              <div className="relative bg-gradient-to-br from-card/90 via-card/70 to-card/50 backdrop-blur-xl border border-border/50 rounded-3xl overflow-hidden hover:shadow-3xl transition-all duration-500 transform group-hover:scale-105">
                <div className="p-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold mb-4">Teste grátis</h3>
                    <div className="mb-6">
                      <span className="text-5xl font-black">R$0</span>
                      <span className="text-muted-foreground text-lg">/mês</span>
                    </div>
                    <p className="text-muted-foreground">
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
                  
                  <Button className="w-full transform hover:scale-105 transition-all duration-300" variant="outline" asChild>
                    <Link href="/register">
                      Começar Grátis
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Pro Plan Enhanced */}
            <div className="group relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-primary via-primary/80 to-primary rounded-3xl blur-3xl opacity-75 group-hover:opacity-100 transition-all duration-700 animate-pulse" />
              <div className="relative bg-gradient-to-br from-card via-card/95 to-card/90 border-2 border-primary rounded-3xl overflow-hidden shadow-3xl transform group-hover:scale-105 transition-all duration-500">
                <div className="absolute top-0 right-0 bg-gradient-to-l from-primary to-primary/80 text-white text-sm font-bold px-6 py-3 rounded-bl-3xl">
                  🔥 MAIS ESCOLHIDO
                </div>
                <div className="p-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold mb-4">Platinum</h3>
                    <div className="mb-6">
                      <span className="text-5xl font-black bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">R$49,90</span>
                      <span className="text-muted-foreground text-lg">/mês</span>
                    </div>
                    <p className="text-muted-foreground">
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
                  
                  <Button className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-xl transform hover:scale-105 transition-all duration-300" asChild>
                    <Link href="/register?plan=pro">
                      Revolucionar Agora
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Enterprise Plan Enhanced */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-200 to-yellow-300 dark:from-yellow-700 dark:to-yellow-800 rounded-3xl blur-2xl opacity-0 group-hover:opacity-50 transition-all duration-700" />
              <div className="relative bg-gradient-to-br from-card/90 via-card/70 to-card/50 backdrop-blur-xl border border-border/50 rounded-3xl overflow-hidden hover:shadow-3xl transition-all duration-500 transform group-hover:scale-105">
                <div className="p-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold mb-4">Gold</h3>
                    <div className="mb-6">
                      <span className="text-5xl font-black">R$149,90</span>
                      <span className="text-muted-foreground text-lg">/mês</span>
                    </div>
                    <p className="text-muted-foreground">
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
                  
                  <Button className="w-full transform hover:scale-105 transition-all duration-300" variant="outline" asChild>
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

      <section id="testimonials" className="py-32 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-24">
         
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-8">
              <span className="block">Histórias que</span>
              <span className="block bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
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
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700" />
                <div className="relative bg-gradient-to-br from-card/80 via-card/60 to-card/40 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-border/50 hover:shadow-3xl transition-all duration-500 transform group-hover:scale-105 group-hover:-translate-y-2">
                  <div className="flex mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 leading-relaxed text-lg italic">
                    "{testimonial.testimonial}"
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <img 
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="w-14 h-14 rounded-full object-cover mr-4 ring-2 ring-primary/20"
                      />
                      <div>
                        <h4 className="font-bold text-lg">{testimonial.name}</h4>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-500">{testimonial.result}</div>
                      <div className="text-xs text-muted-foreground">resultado</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-muted/50 to-muted/30 py-20 border-t border-border/50 backdrop-blur-sm">
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
              <span>FLVXUS</span>
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