"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Dumbbell,
  Activity,
  ClipboardList,
  Utensils,
  Trophy,
  Settings,
  HelpCircle,
  BarChart4,
  Heart,
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Target,
  Award,
  Book,
  ChevronRight,
  Zap
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
      name: "Atletas",
      description: "Gerencie seus atletas",
      href: "/dashboard/students",
      icon: Users,
      color: "bg-achievement-workout",
      gradient: "achievement-workout",
      stats: "24 ativos",
      priority: "high"
    },
    {
      name: "Avaliações",
      description: "Gerencie suas avaliações",
      href: "/dashboard/physical-assessments",
      icon: Book,
      color: "bg-achievement-weight",
      gradient: "achievement-weight",
      stats: "112 avaliações",
      priority: "high"
    },
    {
      name: "Exercícios",
      description: "Biblioteca de exercícios",
      href: "/dashboard/exercises",
      icon: Dumbbell,
      color: "bg-achievement-exercise",
      gradient: "achievement-exercise",
      stats: "150+ exercícios",
      priority: "medium"
    },
    {
      name: "Treinos",
      description: "Crie e gerencie treinos",
      href: "/dashboard/workouts",
      icon: Activity,
      color: "bg-achievement-consecutive",
      gradient: "achievement-consecutive",
      stats: "32 treinos",
      priority: "high"
    },
    {
      name: "Rotinas",
      description: "Organize rotinas completas",
      href: "/dashboard/workout-plans",
      icon: ClipboardList,
      color: "bg-achievement-exercise",
      gradient: "achievement-exercise",
      stats: "12 planos",
      priority: "medium"
    },
    {
      name: "Dietas",
      description: "Planos nutricionais",
      href: "/dashboard/diets",
      icon: Utensils,
      color: "bg-achievement-consecutive",
      gradient: "achievement-consecutive",
      stats: "8 dietas",
      priority: "high"
    },
    {
      name: "Conquistas",
      description: "Sistema de recompensas",
      href: "/dashboard/achievements",
      icon: Trophy,
      color: "bg-achievement-workout",
      gradient: "achievement-workout",
      stats: "25 conquistas",
      priority: "low"
    },
    {
      name: "Relatórios",
      description: "Análises e métricas",
      href: "/dashboard/analytics",
      icon: BarChart4,
      color: "bg-achievement-weight",
      gradient: "achievement-weight",
      stats: "Ver dados",
      priority: "low"
    }
  ];

  const getStudentActions = () => [
    {
      name: "Meus Treinos",
      description: "Acesse seus treinos diários",
      href: "/dashboard/my-workouts",
      icon: Activity,
      color: "bg-achievement-consecutive",
      gradient: "achievement-consecutive",
      stats: "Hoje: 3 exercícios",
      priority: "high"
    },
    {
      name: "Meu Progresso",
      description: "Acompanhe sua evolução",
      href: "/dashboard/my-progress",
      icon: BarChart4,
      color: "bg-achievement-workout",
      gradient: "achievement-workout",
      stats: "85% concluído",
      priority: "high"
    },
    {
      name: "Minhas Conquistas",
      description: "Veja suas medalhas e troféus",
      href: "/dashboard/my-achievements",
      icon: Trophy,
      color: "bg-achievement-exercise",
      gradient: "achievement-exercise",
      stats: "12 conquistadas",
      priority: "medium"
    },
    {
      name: "Minha Dieta",
      description: "Plano nutricional personalizado",
      href: "/dashboard/diets",
      icon: Utensils,
      color: "bg-achievement-weight",
      gradient: "achievement-weight",
      stats: "Plano ativo",
      priority: "high"
    },
    {
      name: "Avaliações",
      description: "Histórico de avaliações físicas",
      href: "/dashboard/progress",
      icon: Heart,
      color: "bg-achievement-workout",
      gradient: "achievement-workout",
      stats: "Última: 15/11",
      priority: "medium"
    },
    {
      name: "Calendário",
      description: "Próximos treinos agendados",
      href: "/dashboard/calendar",
      icon: Calendar,
      color: "bg-achievement-exercise",
      gradient: "achievement-exercise",
      stats: "Próximo: Hoje 16h",
      priority: "medium"
    }
  ];

  const actions = userRole === 'trainer' ? getTrainerActions() : getStudentActions();
  const priorityActions = actions.filter(action => action.priority === 'high');
  const secondaryActions = actions.filter(action => action.priority !== 'high');

  if (loading) {
    return (
      <div className="min-h-screen bg-app-gradient flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-app-border-accent rounded-full animate-spin border-t-app-btn-primary"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-ping border-t-app-text-accent"></div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-app-text-primary">Carregando dashboard</h3>
            <p className="text-app-text-secondary text-sm">Preparando sua área de trabalho...</p>
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
    <div className="min-h-screen bg-app-gradient">
      <div className="container mx-auto px-3 py-4 max-w-7xl">

        {/* Welcome Header - Mobile Optimized */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-app-text-accent/10 via-app-btn-primary/10 to-app-text-accent/10 rounded-2xl blur-xl"></div>
          <div className="relative bg-app-overlay backdrop-blur-xl border border-app-border-accent/30 rounded-2xl p-4 sm:p-6 shadow-app-large">
            <div className="text-center space-y-3">
              <div className="relative inline-block">
                <div className="w-16 h-16 bg-achievement-consecutive rounded-2xl flex items-center justify-center shadow-app-large mx-auto">
                  <span className="text-2xl">{getGreetingEmoji()}</span>
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-achievement-exercise rounded-full flex items-center justify-center">
                  <Sparkles className="h-3 w-3 text-white" />
                </div>
              </div>

              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-app-heading leading-tight">
                  {timeOfDay}, {userName}!
                </h1>
                <p className="text-base sm:text-lg font-semibold text-app-text-accent">
                  {getMotivationalMessage()}
                </p>
                <p className="text-app-text-secondary text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
                  {userRole === 'trainer'
                    ? "Acesse rapidamente suas ferramentas principais"
                    : "Continue sua jornada fitness"
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

       

        {/* Priority Actions - Mobile First Grid */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-app-heading mb-3 px-1">
              {userRole === 'trainer' ? 'Principais' : 'Seus Treinos'}
            </h2>
            
            {/* Mobile: 2 columns, Tablet+: 4 columns */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {priorityActions.map((action, index) => (
                <Link key={action.href} href={action.href}>
                  <div className="group relative">
                    <div className={`absolute inset-0 bg-${action.gradient}/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-300`} />
                    <div className="relative card-app group-hover:scale-105 transition-all duration-300 p-3 sm:p-4">
                      <div className="text-center space-y-2 sm:space-y-3">
                        <div className={`w-12 h-12 sm:w-14 sm:h-14 ${action.color} rounded-xl flex items-center justify-center mx-auto shadow-app-medium group-hover:shadow-app-large transition-all duration-300`}>
                          <action.icon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                        </div>
                        <div>
                          <h3 className="text-sm sm:text-base font-bold text-app-text-primary group-hover:text-app-text-accent transition-colors duration-300">
                            {action.name}
                          </h3>
                          <p className="text-xs text-app-text-secondary hidden sm:block">
                            {action.description}
                          </p>
                        </div>
                        <Badge className="px-2 py-1 bg-app-bg-secondary/50 border-app-border-muted text-app-text-secondary text-xs">
                          {action.stats}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Secondary Actions - List Style for Mobile */}
          {secondaryActions.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-app-heading mb-3 px-1">
                Mais Opções
              </h3>
              
              <div className="space-y-2">
                {secondaryActions.map((action, index) => (
                  <Link key={action.href} href={action.href}>
                    <div className="group bg-app-card backdrop-blur-sm border border-app-border-muted rounded-xl p-3 sm:p-4 hover:shadow-app-medium transition-all duration-300">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <action.icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-app-text-primary group-hover:text-app-text-accent transition-colors duration-300 truncate">
                            {action.name}
                          </h4>
                          <p className="text-sm text-app-text-secondary truncate">
                            {action.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge className="px-2 py-1 bg-app-bg-secondary/50 border-app-border-muted text-app-text-secondary text-xs hidden sm:block">
                            {action.stats}
                          </Badge>
                          <ChevronRight className="h-4 w-4 text-app-text-muted group-hover:text-app-text-accent transition-colors duration-300" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Quick Access Row - Mobile Optimized */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-app-heading px-1">
              Acesso Rápido
            </h3>
            
            <div className="flex gap-3">
              <Link href="/dashboard/settings" className="flex-1">
                <div className="group bg-app-card backdrop-blur-sm border border-app-border-muted rounded-xl p-3 hover:shadow-app-medium transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-500 rounded-lg flex items-center justify-center">
                      <Settings className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-app-text-primary group-hover:text-app-text-accent transition-colors duration-300">
                        Configurações
                      </h4>
                    </div>
                    <ChevronRight className="h-4 w-4 text-app-text-muted group-hover:text-app-text-accent transition-colors duration-300" />
                  </div>
                </div>
              </Link>
              
              <Link href="/dashboard/help" className="flex-1">
                <div className="group bg-app-card backdrop-blur-sm border border-app-border-muted rounded-xl p-3 hover:shadow-app-medium transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-achievement-consecutive rounded-lg flex items-center justify-center">
                      <HelpCircle className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-app-text-primary group-hover:text-app-text-accent transition-colors duration-300">
                        Ajuda
                      </h4>
                    </div>
                    <ChevronRight className="h-4 w-4 text-app-text-muted group-hover:text-app-text-accent transition-colors duration-300" />
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Premium Upgrade - Mobile Optimized */}
          {userRole === 'trainer' && (
            <div className="relative overflow-hidden rounded-xl bg-achievement-weight p-4 text-white">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-400/20 to-emerald-400/20 blur-2xl"></div>
              <div className="relative text-center space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full">
                  <Sparkles className="h-4 w-4 text-yellow-300" />
                  <span className="font-bold text-sm">FLVXUS Premium</span>
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black mb-1">
                    Desbloqueie Todo o Potencial
                  </h3>
                  <p className="text-sm opacity-90">
                    Recursos avançados, relatórios e IA personalizada
                  </p>
                </div>
                <Button className="btn-gradient-emerald px-6 py-2 rounded-xl font-bold shadow-app-large transition-all duration-300 transform hover:scale-105 text-sm">
                  <Zap className="h-4 w-4 mr-2" />
                  Fazer Upgrade
                </Button>
                <p className="text-xs opacity-75">
                  A partir de R$ 29,90/mês
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}