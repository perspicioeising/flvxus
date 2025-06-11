"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  Activity,
  ClipboardList,
  Utensils,
  Trophy,
  Settings,
  HelpCircle,
  Plus,
  Eye,
  BarChart4,
  Heart,
  Calendar,
  Sparkles,
  Zap,
  ArrowRight,
  TrendingUp,
  Target,
  BookOpen,
  Award,
  Book
} from "lucide-react";
import Link from "next/link";
import { useSupabase } from "@/app/providers";

export default function DashboardPage() {
  const { supabase } = useSupabase();
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<'trainer' | 'student'>('trainer');
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [timeOfDay, setTimeOfDay] = useState("");

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      setUser(data?.user || null);

      // Fetch user profile to get role
      if (data?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', data.user.id)
          .single();

        setUserRole(profile?.role || 'trainer');
      }
    };
    getUser();
  }, [supabase]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay("Bom dia");
    else if (hour < 18) setTimeOfDay("Boa tarde");
    else setTimeOfDay("Boa noite");

    if (user) {
      setUserName(user.user_metadata?.full_name || user.email?.split("@")[0] || (userRole === 'trainer' ? "Personal" : "Aluno"));
    }
    setLoading(false);
  }, [user, userRole]);

  const getTrainerActions = () => [
    {
      name: "Alunos",
      description: "Gerencie seus alunos",
      href: "/dashboard/students",
      icon: Users,
      color: "from-blue-500 to-blue-600",
      hoverColor: "hover:from-blue-600 hover:to-blue-700",
      shadowColor: "hover:shadow-blue-500/25",
      stats: "24 ativos"
    },
    {
      name: "Avaliações",
      description: "Gerencie sua avaliações",
      href: "/dashboard/physical-assessments",
      icon: Book,
      color: "from-indigo-500 to-indigo-600",
      hoverColor: "hover:from-indigo-600 hover:to-indigo-700",
      shadowColor: "hover:shadow-indigo-500/25",
      stats: "112 Avaliações"
    },
    {
      name: "Exercícios",
      description: "Biblioteca de exercícios",
      href: "/dashboard/exercises",
      icon: Dumbbell,
      color: "from-purple-500 to-purple-600",
      hoverColor: "hover:from-purple-600 hover:to-purple-700",
      shadowColor: "hover:shadow-purple-500/25",
      stats: "150+ exercícios"
    },
    {
      name: "Treinos",
      description: "Crie e gerencie treinos",
      href: "/dashboard/workouts",
      icon: Activity,
      color: "from-yellow-500 to-yellow-600",
      hoverColor: "hover:from-yellow-600 hover:to-yellow-700",
      shadowColor: "hover:shadow-yellow-500/25",
      stats: "32 treinos"
    },
    {
      name: "Rotinas",
      description: "Organize rotinas completas",
      href: "/dashboard/workout-plans",
      icon: ClipboardList,
      color: "from-pink-500 to-pink-600",
      hoverColor: "hover:from-pink-600 hover:to-pink-700",
      shadowColor: "hover:shadow-pink-500/25",
      stats: "12 planos"
    },
    {
      name: "Dietas",
      description: "Planos nutricionais",
      href: "/dashboard/diets",
      icon: Utensils,
      color: "from-emerald-500 to-emerald-600",
      hoverColor: "hover:from-emerald-600 hover:to-emerald-700",
      shadowColor: "hover:shadow-emerald-500/25",
      stats: "8 dietas"
    },
    {
      name: "Conquistas",
      description: "Sistema de recompensas",
      href: "/dashboard/achievements",
      icon: Trophy,

      color: "from-orange-500 to-orange-600",
      hoverColor: "hover:from-orange-600 hover:to-orange-700",
      shadowColor: "hover:shadow-orange-500/25",
      stats: "25 conquistas"
    },
    {
      name: "Relatórios",
      description: "Análises e métricas",
      href: "/dashboard/analytics",
      icon: BarChart4,
      color: "from-green-500 to-green-600",
      hoverColor: "hover:from-green-600 hover:to-green-700",
      shadowColor: "hover:shadow-green-500/25",
      stats: "Ver dados"
    }
  ];

  const getStudentActions = () => [
    {
      name: "Meus Treinos",
      description: "Acesse seus treinos diários",
      href: "/dashboard/my-workouts",
      icon: Activity,
      color: "from-green-500 to-green-600",
      hoverColor: "hover:from-green-600 hover:to-green-700",
      shadowColor: "hover:shadow-green-500/25",
      stats: "Hoje: 3 exercícios"
    },
    {
      name: "Meu Progresso",
      description: "Acompanhe sua evolução",
      href: "/dashboard/my-progress",
      icon: BarChart4,
      color: "from-blue-500 to-blue-600",
      hoverColor: "hover:from-blue-600 hover:to-blue-700",
      shadowColor: "hover:shadow-blue-500/25",
      stats: "85% concluído"
    },
    {
      name: "Minhas Conquistas",
      description: "Veja suas medalhas e troféus",
      href: "/dashboard/my-achievements",
      icon: Trophy,
      color: "from-yellow-500 to-yellow-600",
      hoverColor: "hover:from-yellow-600 hover:to-yellow-700",
      shadowColor: "hover:shadow-yellow-500/25",
      stats: "12 conquistadas"
    },
    {
      name: "Minha Dieta",
      description: "Plano nutricional personalizado",
      href: "/dashboard/diets",
      icon: Utensils,
      color: "from-emerald-500 to-emerald-600",
      hoverColor: "hover:from-emerald-600 hover:to-emerald-700",
      shadowColor: "hover:shadow-emerald-500/25",
      stats: "Plano ativo"
    },
    {
      name: "Avaliações",
      description: "Histórico de avaliações físicas",
      href: "/dashboard/progress",
      icon: Heart,
      color: "from-red-500 to-red-600",
      hoverColor: "hover:from-red-600 hover:to-red-700",
      shadowColor: "hover:shadow-red-500/25",
      stats: "Última: 15/11"
    },
    {
      name: "Agendar Treino",
      description: "Marque sua próxima sessão",
      href: "/dashboard/schedule",
      icon: Calendar,
      color: "from-purple-500 to-purple-600",
      hoverColor: "hover:from-purple-600 hover:to-purple-700",
      shadowColor: "hover:shadow-purple-500/25",
      stats: "Próximo: Hoje 16h"
    }
  ];

  const getQuickActions = () => [
    {
      name: "Configurações",
      href: "/dashboard/settings",
      icon: Settings,
      color: "from-gray-500 to-gray-600",
      hoverColor: "hover:from-gray-600 hover:to-gray-700",
      shadowColor: "hover:shadow-gray-500/25"
    },
    {
      name: "Ajuda",
      href: "/dashboard/help",
      icon: HelpCircle,
      color: "from-emerald-500 to-emerald-600",
      hoverColor: "hover:from-emerald-600 hover:to-emerald-700",
      shadowColor: "hover:shadow-emerald-500/25"
    }
  ];

  const actions = userRole === 'trainer' ? getTrainerActions() : getStudentActions();
  const quickActions = getQuickActions();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-green-200 dark:border-green-800 rounded-full animate-spin border-t-green-600 dark:border-t-green-400"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent rounded-full animate-ping border-t-green-400 dark:border-t-green-500"></div>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Carregando dashboard</h3>
            <p className="text-gray-600 dark:text-gray-400">Preparando sua área de trabalho...</p>
          </div>
        </div>
      </div>
    );
  }

  const getGreetingEmoji = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "🌅";
    else if (hour < 18) return "☀️";
    else return "🌙";
  };

  const getMotivationalMessage = () => {
    if (userRole === 'trainer') {
      return "Vamos transformar vidas hoje!";
    } else {
      return "Hora de superar seus limites!";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black">
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl">

        {/* Welcome Header */}
        <div className="relative mb-8 sm:mb-12">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 via-emerald-500/20 to-teal-600/20 dark:from-green-500/10 dark:via-emerald-400/10 dark:to-teal-500/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-green-200/50 dark:border-green-800/30 rounded-3xl p-6 sm:p-8 md:p-12 shadow-2xl">
            <div className="text-center space-y-4 sm:space-y-6">
              <div className="relative inline-block">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-2xl mx-auto">
                  <span className="text-3xl sm:text-4xl">{getGreetingEmoji()}</span>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-gray-600 via-gray-700 to-gray-900 dark:from-white dark:via-gray-300 dark:to-white bg-clip-text text-transparent leading-tight">
                  {timeOfDay}, {userName}!
                </h1>
                <p className="text-lg sm:text-xl md:text-2xl font-semibold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
                  {getMotivationalMessage()}
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
                  {userRole === 'trainer'
                    ? "Acesse rapidamente as ferramentas que você mais usa para gerenciar seus alunos e treinos"
                    : "Escolha uma das opções abaixo para continuar sua jornada fitness"
                  }
                </p>
              </div>

              {/* Quick Stats for Trainer */}
              {userRole === 'trainer' && (
                <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-6 sm:mt-8">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-full border border-gray-200/50 dark:border-gray-700/50">
                    <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">24 Alunos</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-full border border-gray-200/50 dark:border-gray-700/50">
                    <Activity className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">8 Treinos Hoje</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-full border border-gray-200/50 dark:border-gray-700/50">
                    <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">89% Frequência</span>
                  </div>
                </div>
              )}

              {/* Quick Stats for Student */}
              {userRole === 'student' && (
                <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-6 sm:mt-8">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-full border border-gray-200/50 dark:border-gray-700/50">
                    <Target className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Meta: 85%</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-full border border-gray-200/50 dark:border-gray-700/50">
                    <Award className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">12 Conquistas</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-full border border-gray-200/50 dark:border-gray-700/50">
                    <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Próximo: 16h</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Actions Grid */}
        <div className="space-y-8 sm:space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              {userRole === 'trainer' ? 'Ferramentas Principais' : 'Suas Atividades'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg">
              {userRole === 'trainer'
                ? 'Tudo que você precisa para gerenciar seus alunos em um só lugar'
                : 'Acesse suas funcionalidades favoritas com um toque'
              }
            </p>
          </div>

          {/* Actions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {actions.map((action, index) => (
              <div
                key={action.href}
                className="group relative"
                style={{
                  animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                }}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${action.color.replace('from-', 'from-').replace('to-', 'to-')}/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500`} />
                <Link href={action.href}>
                  <div className={`relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-3xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:scale-105 group-hover:border-white/60 dark:group-hover:border-gray-600/60`}>
                    {/* Icon Container */}
                    <div className="relative mb-6">
                      <div className={`w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r ${action.color} rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-2xl group-hover:shadow-3xl transition-all duration-500 group-hover:scale-110`}>
                        <action.icon className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-3 sm:space-y-4">
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">
                          {action.name}
                        </h3>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                          {action.description}
                        </p>
                      </div>

                      {/* Stats Badge */}
                      <div className="flex items-center justify-between">
                        <Badge className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 rounded-full text-xs font-semibold">
                          {action.stats}
                        </Badge>
                        <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 transform group-hover:translate-x-1 transition-all duration-300" />
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {/* Quick Actions Row */}
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Acesso Rápido
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Configurações e ajuda sempre à mão
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 max-w-2xl mx-auto">
              {quickActions.map((action, index) => (
                <div
                  key={action.href}
                  className="group relative flex-1"
                  style={{
                    animation: `fadeInUp 0.6s ease-out ${(actions.length + index) * 0.1}s both`
                  }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${action.color.replace('from-', 'from-').replace('to-', 'to-')}/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500`} />
                  <Link href={action.href}>
                    <div className={`relative bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                          <action.icon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">
                            {action.name}
                          </h4>
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 transform group-hover:translate-x-1 transition-all duration-300" />
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Premium Upgrade for Trainer */}
          {userRole === 'trainer' && (
            <div className="max-w-4xl mx-auto">
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 p-6 sm:p-8 text-white">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-cyan-400/20 blur-3xl"></div>
                <div className="relative text-center space-y-4 sm:space-y-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full">
                    <Sparkles className="h-5 w-5 text-yellow-300" />
                    <span className="font-bold text-sm sm:text-base">FLVXUS Premium</span>
                  </div>
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-black mb-2">
                      Desbloqueie Todo o Potencial
                    </h3>
                    <p className="text-base sm:text-lg opacity-90 max-w-2xl mx-auto">
                      Acesse recursos avançados, relatórios detalhados, IA personalizada e muito mais para impulsionar seu negócio
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Button
                      className="bg-white/20 hover:bg-white/30 text-white border-white/30 px-8 py-3 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      Fazer Upgrade Agora
                    </Button>
                    <span className="text-sm opacity-75">
                      A partir de R$ 29,90/mês
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}