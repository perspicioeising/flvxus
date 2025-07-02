// components/workout-plans/components/details/WorkoutPlanDetailPage.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  ArrowLeft,
  Calendar,
  Clock,
  Target,
  Dumbbell,
  Users,
  Trophy,
  Zap,
  Heart,
  Play,
  BarChart3,
  Activity,
  TrendingUp,
  Edit3,
  Copy,
  Trash2,
  PlayCircle,
  PauseCircle,
  CheckCircle2,
  ListCollapse,
  Expand,
  CalendarCheck,
  Sparkles,
  Info,
  Crown,
  MoreVertical,
  Eye,
  Brain,
  Shield,
  Calculator,
  Star,
  Award,
  Droplets,
  Flame,
  Scale,
  PieChart,
  Share2,
  Download
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { WorkoutPlanDetailSkeleton } from './WorkoutPlanDetailSkeleton';
import { WorkoutDayCard } from './WorkoutDayCard';
import { WorkoutPlan, WorkoutPlanItem } from '../../types';
import { DAYS_OF_WEEK } from '../../constants';

interface WorkoutPlanDetailPageProps {
  planId: string;
  userRole?: 'trainer' | 'student';
}

export function WorkoutPlanDetailPage({ 
  planId, 
  userRole = 'trainer' 
}: WorkoutPlanDetailPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Estado para seções expandidas/colapsadas
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    schedule: true,
    stats: false,
    info: false
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Fetch plan details
  useEffect(() => {
    const fetchPlan = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/workout-plans/${planId}`);
        
        if (!response.ok) {
          throw new Error('Plano não encontrado');
        }
        
        const data = await response.json();
        setPlan(data);
        
      } catch (error) {
        console.error('❌ Error fetching plan:', error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar plano",
          description: error instanceof Error ? error.message : "Não foi possível carregar os detalhes do plano.",
        });
        router.push('/dashboard/workout-plans');
      } finally {
        setIsLoading(false);
      }
    };

    if (planId) {
      fetchPlan();
    }
  }, [planId, toast, router]);

  // Calculate stats
  const getStats = (plan: WorkoutPlan) => {
    const startDate = new Date(plan.start_date);
    const endDate = new Date(plan.end_date);
    const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const now = new Date();
    
    let status: 'active' | 'completed' | 'paused' = 'active';
    if (endDate < now) {
      status = 'completed';
    } else if (startDate > now) {
      status = 'paused';
    }

    const workouts = plan.workouts || [];
    const scheduledDays = [...new Set(workouts.map(w => w.day_of_week))];
    const uniqueWorkoutIds = [...new Set(workouts.map(w => w.workout?.id || w.workout_id).filter(Boolean))];
    
    return {
      totalWorkouts: workouts.length,
      totalDays: scheduledDays.length,
      uniqueWorkouts: uniqueWorkoutIds.length,
      duration,
      frequency: scheduledDays.length,
      status
    };
  };

  // Análise do plano
  const analyzePlan = (workouts: WorkoutPlanItem[]) => {
    if (!workouts.length) return null;
    
    const goals = workouts
      .map(w => w.workout?.goal)
      .filter((goal): goal is string => Boolean(goal) && typeof goal === 'string');
    
    const goalCounts = goals.reduce((acc: Record<string, number>, goal: string) => {
      acc[goal] = (acc[goal] || 0) + 1;
      return acc;
    }, {});
    
    const mainGoal = Object.entries(goalCounts).sort(([,a], [,b]) => b - a)[0]?.[0];
    
    const uniqueWorkoutIds = workouts
      .map(w => w.workout?.id)
      .filter((id): id is string => Boolean(id) && typeof id === 'string');
    
    const uniqueWorkouts = [...new Set(uniqueWorkoutIds)];
    const variety = uniqueWorkouts.length === workouts.length ? 'Alta' : 
                   uniqueWorkouts.length >= workouts.length * 0.7 ? 'Moderada' : 'Baixa';
    
    return { mainGoal, variety, uniqueCount: uniqueWorkouts.length };
  };

  // Handlers
  const handleEdit = () => {
    router.push(`/dashboard/workout-plans/${planId}/edit`);
  };

  const handleClone = async () => {
    if (!plan) return;
    
    try {
      const workouts = plan.workouts || [];
      
      const cloneData = {
        name: `${plan.name} (Cópia)`,
        description: plan.description,
        student_id: plan.student_id,
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        workouts: workouts.map(w => ({
          workout_id: w.workout?.id || w.workout_id,
          day_of_week: w.day_of_week
        })).filter(w => w.workout_id)
      };

      const response = await fetch('/api/workout-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cloneData),
      });

      if (!response.ok) {
        throw new Error('Erro ao clonar plano');
      }

      toast({
        title: "Plano clonado!",
        description: "Uma cópia do plano foi criada com sucesso.",
      });

      router.push('/dashboard/workout-plans');
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao clonar plano",
        description: error instanceof Error ? error.message : "Não foi possível clonar o plano.",
      });
    }
  };

  const handleDelete = async () => {
    if (!plan || isDeleting) return;
    
    const confirmDelete = window.confirm(
      `Tem certeza que deseja deletar o plano "${plan.name}"? Esta ação não pode ser desfeita.`
    );
    
    if (!confirmDelete) return;
    
    try {
      setIsDeleting(true);
      
      const response = await fetch(`/api/workout-plans/${planId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar plano');
      }

      toast({
        title: "Plano deletado!",
        description: "O plano foi removido com sucesso.",
      });

      router.push('/dashboard/workout-plans');
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao deletar plano",
        description: error instanceof Error ? error.message : "Não foi possível deletar o plano.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!plan) return;
    
    try {
      const newStatus = stats.status === 'active' ? 'paused' : 'active';
      
      const response = await fetch(`/api/workout-plans/${planId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Erro ao alterar status');
      }

      toast({
        title: "Status alterado!",
        description: `O plano foi ${newStatus === 'active' ? 'ativado' : 'pausado'} com sucesso.`,
      });
      
      // Recarregar o plano
      router.refresh();
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao alterar status",
        description: "Não foi possível alterar o status do plano.",
      });
    }
  };

  const handleStartWorkout = (workoutId: string) => {
    router.push(`/dashboard/workouts/${workoutId}/execute`);
  };

  const handleStartPlan = () => {
    if (plan && plan.workouts && plan.workouts.length > 0) {
      const firstWorkout = plan.workouts[0];
      const workoutId = firstWorkout?.workout?.id || firstWorkout?.workout_id;
      
      if (workoutId) {
        router.push(`/dashboard/workouts/${workoutId}/execute?planId=${planId}`);
      } else {
        toast({
          variant: "destructive",
          title: "Erro ao iniciar plano",
          description: "Não foi possível encontrar treinos válidos neste plano.",
        });
      }
    } else {
      toast({
        variant: "destructive",
        title: "Plano vazio",
        description: "Este plano não possui treinos configurados.",
      });
    }
  };

  const handleShare = () => {
    if (window.navigator.share) {
      window.navigator.share({
        title: `Plano de Treino: ${plan?.name}`,
        text: `Plano de treino para ${plan?.student?.full_name}`,
        url: window.location.href,
      });
    }
  };

  const handleDownload = () => {
    if (plan) {
      const planData = {
        name: plan.name,
        student: plan.student?.full_name,
        start_date: plan.start_date,
        end_date: plan.end_date,
        workouts: plan.workouts?.length || 0,
        frequency: stats.frequency
      };
      const dataStr = JSON.stringify(planData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `plano-${plan.name.toLowerCase().replace(/\s+/g, '-')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  // Funções auxiliares
  const getLevelColor = (level?: string): string => {
    if (!level) return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
    
    switch (level.toLowerCase()) {
      case 'iniciante':
      case 'beginner':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'intermediário':
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'avançado':
      case 'advanced':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    }
  };

  const getGoalIcon = (goal?: string) => {
    if (!goal) return Users;
    
    switch (goal.toLowerCase()) {
      case 'hipertrofia':
      case 'muscle gain':
        return Dumbbell;
      case 'emagrecimento':
      case 'weight loss':
        return Zap;
      case 'resistência':
      case 'endurance':
        return Heart;
      case 'força':
      case 'strength':
        return Trophy;
      case 'condicionamento':
      case 'conditioning':
        return Target;
      default:
        return Users;
    }
  };

  const getGoalColor = (goal?: string): string => {
    if (!goal) return 'text-gray-500';
    
    switch (goal.toLowerCase()) {
      case 'hipertrofia':
      case 'muscle gain':
        return 'text-orange-600 dark:text-orange-400';
      case 'emagrecimento':
      case 'weight loss':
        return 'text-red-600 dark:text-red-400';
      case 'resistência':
      case 'endurance':
        return 'text-blue-600 dark:text-blue-400';
      case 'força':
      case 'strength':
        return 'text-purple-600 dark:text-purple-400';
      case 'condicionamento':
      case 'conditioning':
        return 'text-green-600 dark:text-green-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getDayName = (dayNumber: number): string => {
    const day = DAYS_OF_WEEK.find((d) => d.value === dayNumber);
    return day?.label || `Dia ${dayNumber}`;
  };

  const getDayShort = (dayNumber: number): string => {
    const day = DAYS_OF_WEEK.find((d) => d.value === dayNumber);
    return day?.short || `D${dayNumber}`;
  };

  const groupWorkoutsByDay = (workouts: WorkoutPlanItem[] = []): Record<number, WorkoutPlanItem[]> => {
    return workouts.reduce((acc, item) => {
      if (!item || typeof item.day_of_week !== 'number') {
        return acc;
      }
      
      const day = item.day_of_week;
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push(item);
      return acc;
    }, {} as Record<number, WorkoutPlanItem[]>);
  };

  // Loading state
  if (isLoading || !plan) {
    return <WorkoutPlanDetailSkeleton />;
  }

  const stats = getStats(plan);
  const analysis = analyzePlan(plan.workouts || []);
  const workoutsByDay = groupWorkoutsByDay(plan?.workouts);
  const scheduledDays = Object.keys(workoutsByDay)
    .map(Number)
    .sort((a, b) => a - b);

  // Get status info
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'active':
        return { label: 'Ativo', color: 'from-green-500 to-emerald-600', icon: CheckCircle2 };
      case 'paused':
        return { label: 'Pausado', color: 'from-yellow-500 to-orange-600', icon: PauseCircle };
      case 'completed':
        return { label: 'Concluído', color: 'from-gray-500 to-gray-600', icon: CheckCircle2 };
      default:
        return { label: 'Ativo', color: 'from-green-500 to-emerald-600', icon: CheckCircle2 };
    }
  };

  const statusInfo = getStatusInfo(stats.status);

  // Get plan classification
  const getPlanClassification = (frequency: number) => {
    if (frequency >= 6) return { label: 'Intensivo', color: 'from-red-500 to-red-600', colorClass: 'from-red-500 to-red-600', icon: Crown };
    if (frequency >= 4) return { label: 'Avançado', color: 'from-purple-500 to-purple-600', colorClass: 'from-purple-500 to-purple-600', icon: Trophy };
    if (frequency >= 3) return { label: 'Moderado', color: 'from-blue-500 to-indigo-600', colorClass: 'from-blue-500 to-indigo-600', icon: Target };
    return { label: 'Básico', color: 'from-green-500 to-emerald-600', colorClass: 'from-green-500 to-emerald-600', icon: Zap };
  };

  const classification = getPlanClassification(stats.frequency);

  // Metrics configuration
  const metrics = [
    {
      value: stats.totalWorkouts,
      label: "Total Treinos",
      color: 'from-app-achievement-workout to-app-btn-primary',
      icon: Activity,
      progress: Math.min((stats.totalWorkouts / 30) * 100, 100),
      suffix: " sessões",
      description: "Número total de treinos",
      idealRange: "Máximo possível"
    },
    {
      value: stats.frequency,
      label: "Frequência",
      color: 'from-app-achievement-workout to-app-btn-secondary',
      icon: Calendar,
      progress: Math.min((stats.frequency / 7) * 100, 100),
      suffix: "x/semana",
      description: "Treinos por semana",
      idealRange: "3-5x ideal"
    },
    {
      value: stats.duration,
      label: "Duração",
      color: 'from-app-achievement-workout to-app-text-accent',
      icon: Clock,
      progress: Math.min((stats.duration / 90) * 100, 100),
      suffix: " dias",
      description: "Período total do plano",
      idealRange: "30-90 dias"
    },
    {
      value: stats.uniqueWorkouts,
      label: "Variedade",
      color: 'from-app-achievement-workout to-app-btn-accent',
      icon: Dumbbell,
      progress: Math.min((stats.uniqueWorkouts / stats.totalWorkouts) * 100, 100),
      suffix: " únicos",
      description: "Treinos diferentes",
      idealRange: "Máximo possível"
    }
  ];

  return (
    <div className="min-h-screen bg-app-gradient">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 max-w-7xl">
        
        {/* Header - Similar ao Assessment Details */}
        <div className="relative mb-6">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-workout/10 via-orange-500/10 to-app-achievement-workout/10 rounded-2xl sm:rounded-3xl blur-xl"></div>
          
          <div className="relative bg-app-overlay backdrop-blur-xl border border-app-border-accent/30 rounded-2xl sm:rounded-3xl shadow-app-xl">
            <div className="p-4 sm:p-6 lg:p-8">
              
              {/* Navigation Bar */}
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <Button
                  variant="ghost"
                  onClick={() => router.back()}
                  className="h-10 w-10 sm:h-12 sm:w-auto sm:px-4 bg-app-bg-secondary hover:bg-app-border-accent/20 rounded-xl transition-all duration-300"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span className="hidden sm:inline sm:ml-2 font-semibold">Voltar</span>
                </Button>

                {/* Actions Menu - Mobile */}
                {userRole === 'trainer' && (
                  <div className="sm:hidden">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 bg-app-bg-secondary hover:bg-app-border-accent/20 rounded-xl"
                        >
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent 
                        align="end" 
                        className="w-48 bg-app-overlay backdrop-blur-xl border border-app-border-default rounded-xl shadow-app-xl"
                      >
                        <DropdownMenuItem onClick={handleEdit} className="flex items-center gap-2 p-3">
                          <Edit3 className="h-4 w-4 text-app-achievement-workout" />
                          <span>Editar</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleClone} className="flex items-center gap-2 p-3">
                          <Copy className="h-4 w-4 text-app-achievement-workout" />
                          <span>Clonar</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={handleDelete} 
                          className="flex items-center gap-2 p-3 text-red-600 dark:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Deletar</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}

                {/* Desktop Actions */}
                {userRole === 'trainer' && (
                  <div className="hidden sm:flex items-center gap-3">
                    <Button
                      onClick={handleEdit}
                      className="h-10 px-4 bg-app-card border-app-border-accent text-app-text-primary hover:bg-app-border-accent/20 rounded-xl font-semibold transition-all duration-300"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    
                    <Button
                      onClick={handleClone}
                      variant="outline"
                      className="h-10 px-4 bg-app-card border-app-border-accent text-app-text-primary hover:bg-app-border-accent/20 rounded-xl font-semibold transition-all duration-300"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Clonar
                    </Button>
                    
                    <Button
                      onClick={handleDelete}
                      variant="outline"
                      className="h-10 px-4 bg-app-card border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-semibold transition-all duration-300"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Deletar
                    </Button>
                  </div>
                )}

                {/* Student Action */}
                {userRole === 'student' && stats.status === 'active' && (
                  <Button
                    onClick={handleStartPlan}
                    className="h-10 px-4 sm:h-12 sm:px-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl shadow-xl hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-105 border-0"
                  >
                    <PlayCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Iniciar Plano
                  </Button>
                )}
              </div>

              {/* Plan Info */}
              <div className="space-y-4">
                
                {/* Title and Icon */}
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-app-achievement-workout rounded-xl sm:rounded-2xl flex items-center justify-center shadow-app-large">
                      <CalendarCheck className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-app-heading leading-tight break-words">
                      {plan.name}
                    </h1>
                    
                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs sm:text-sm text-app-text-secondary">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>{format(new Date(plan.start_date), 'dd/MM/yyyy')} - {format(new Date(plan.end_date), 'dd/MM/yyyy')}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>{plan.student?.full_name}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>{stats.frequency}x por semana</span>
                      </div>

                      {plan.updated_at !== plan.created_at && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span>Atualizado em {format(new Date(plan.updated_at), 'dd/MM/yy')}</span>
                        </div>
                      )}
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <Badge className={`px-3 py-1 bg-gradient-to-r ${statusInfo.color} text-white rounded-full font-semibold border-0 text-xs`}>
                        <statusInfo.icon className="h-3 w-3 mr-1" />
                        {statusInfo.label}
                      </Badge>
                      <Badge className={`px-3 py-1 bg-gradient-to-r ${classification.colorClass} text-white rounded-full font-semibold border-0 text-xs`}>
                        <classification.icon className="h-3 w-3 mr-1" />
                        {classification.label}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {plan.description && (
                  <p className="text-sm sm:text-base text-app-text-secondary leading-relaxed">
                    {plan.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {/* Visão Geral Section */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-workout/10 via-app-text-accent/10 to-app-achievement-workout/10 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <Card className="relative border-0 card-app">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-app-achievement-workout rounded-lg flex items-center justify-center">
                      <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <CardTitle className="text-lg sm:text-xl font-bold text-app-heading">
                      Visão Geral
                    </CardTitle>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSection('overview')}
                    className="h-8 w-8 p-0 sm:hidden"
                  >
                    {expandedSections.overview ? (
                      <ListCollapse className="h-4 w-4" />
                    ) : (
                      <Expand className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>

              {(expandedSections.overview || window.innerWidth >= 640) && (
                <CardContent>
                  {/* Main Metrics Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
                    {metrics.map((metric, index) => {
                      const Icon = metric.icon;
                      
                      return (
                        <div key={index} className="relative group">
                          {/* Glow Effect */}
                          <div className={`absolute inset-0 bg-gradient-to-br ${metric.color} rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500`}></div>

                          {/* Card */}
                          <Card className="relative border-0 bg-app-card backdrop-blur-xl rounded-2xl shadow-app-large hover:shadow-app-xl transition-all duration-500 group-hover:scale-105 overflow-hidden">
                            {/* Background Pattern */}
                            <div className="absolute inset-0 opacity-5">
                              <div className="absolute inset-0 bg-gradient-to-br from-app-text-primary to-transparent"></div>
                            </div>

                            <CardContent className="relative p-4 sm:p-6">
                              {/* Header */}
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <p className="text-xs font-bold text-app-text-muted uppercase tracking-wider mb-1">
                                    {metric.label}
                                  </p>
                                  <div className="flex items-baseline gap-1">
                                    <span className="text-2xl sm:text-3xl font-black text-app-heading">
                                      {metric.value}
                                    </span>
                                    <span className="text-lg sm:text-xl font-semibold text-app-text-secondary">
                                      {metric.suffix}
                                    </span>
                                  </div>
                                  <p className="text-xs text-app-text-muted mt-1">
                                    Ideal: {metric.idealRange}
                                  </p>
                                </div>

                                {/* Icon */}
                                <div className={`relative p-2 sm:p-3 bg-gradient-to-br ${metric.color} rounded-xl shadow-app-medium group-hover:shadow-app-large transition-all duration-300`}>
                                  <Icon className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                                  <div className="absolute inset-0 bg-white/20 rounded-xl blur-sm"></div>
                                </div>
                              </div>

                              {/* Progress Bar */}
                              <div className="space-y-2">
                                <Progress
                                  value={metric.progress}
                                  className="h-2 bg-app-bg-secondary"
                                />
                                <p className="text-xs text-app-text-muted">
                                  {metric.description}
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      );
                    })}
                  </div>

                  {/* Plan Composition */}
                  <div className="relative">
                    <div className="p-6 bg-gradient-to-r from-app-bg-secondary/30 via-app-achievement-workout/10 to-app-bg-secondary/30 rounded-2xl border border-app-border-muted shadow-app-medium">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="relative">
                          <div className="p-3 bg-app-achievement-workout rounded-xl shadow-app-large">
                            <PieChart className="h-6 w-6 text-white" />
                          </div>
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                            <Star className="h-2 w-2 text-white" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-app-heading">
                            Composição do Plano
                          </h3>
                          <p className="text-app-text-secondary">
                            Distribuição e análise dos treinos
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Classification */}
                        <div className="text-center">
                          <div className="relative w-32 h-32 mx-auto mb-4">
                            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-app-bg-secondary to-app-border-muted"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-center">
                                <div className="text-2xl font-black text-app-heading">
                                  {stats.frequency}x
                                </div>
                                <div className="text-xs text-app-text-secondary font-semibold">
                                  Semana
                                </div>
                              </div>
                            </div>
                          </div>

                          <Badge className={`px-3 py-1 bg-gradient-to-r ${classification.colorClass} text-white rounded-full text-sm font-bold border-0 shadow-app-medium`}>
                            <Crown className="h-3 w-3 mr-1" />
                            {classification.label}
                          </Badge>
                        </div>

                        {/* Extended Stats */}
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-3 bg-app-card rounded-xl">
                            <span className="text-sm font-semibold text-app-text-primary flex items-center gap-2">
                              <Activity className="h-4 w-4 text-app-achievement-workout" />
                              Total de Sessões:
                            </span>
                            <span className="text-sm font-bold text-app-heading">{stats.totalWorkouts}</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-app-card rounded-xl">
                            <span className="text-sm font-semibold text-app-text-primary flex items-center gap-2">
                              <Dumbbell className="h-4 w-4 text-app-achievement-workout" />
                              Treinos Únicos:
                            </span>
                            <span className="text-sm font-bold text-app-heading">{stats.uniqueWorkouts}</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-app-card rounded-xl">
                            <span className="text-sm font-semibold text-app-text-primary flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-app-achievement-workout" />
                              Dias Ativos:
                            </span>
                            <span className="text-sm font-bold text-app-heading">{stats.totalDays}</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-app-card rounded-xl">
                            <span className="text-sm font-semibold text-app-text-primary flex items-center gap-2">
                              <Clock className="h-4 w-4 text-app-achievement-workout" />
                              Duração Total:
                            </span>
                            <span className="text-sm font-bold text-app-heading">{stats.duration} dias</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="p-4 bg-gradient-to-br from-app-bg-secondary/30 to-app-bg-secondary/50 rounded-xl border border-app-border-muted">
                      <h4 className="font-bold text-app-heading mb-3 flex items-center gap-2">
                        <Shield className="h-4 w-4 text-app-achievement-workout" />
                        Informações do Aluno
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-app-text-secondary">Nome:</span>
                          <span className="text-sm font-semibold text-app-heading">
                            {plan.student?.full_name || 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-app-text-secondary">Email:</span>
                          <span className="text-sm font-semibold text-app-heading">
                            {plan.student?.email || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-gradient-to-br from-app-bg-secondary/30 to-app-bg-secondary/50 rounded-xl border border-app-border-muted">
                      <h4 className="font-bold text-app-heading mb-3 flex items-center gap-2">
                        <Calculator className="h-4 w-4 text-app-achievement-workout" />
                        Dados do Plano
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-app-text-secondary">Status:</span>
                          <span className="text-sm font-semibold text-app-heading">
                            {statusInfo.label}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-app-text-secondary">Criado em:</span>
                          <span className="text-sm font-semibold text-app-heading">
                            {format(new Date(plan.created_at), 'dd/MM/yyyy')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>

          {/* Cronograma Section */}
          <Card className="border-0 card-app">
            <CardHeader className="pb-3 sm:pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-app-achievement-workout rounded-lg flex items-center justify-center">
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-bold text-app-heading">
                    Cronograma Semanal
                  </CardTitle>
                  <Badge className="px-2 py-1 bg-app-achievement-workout/10 text-app-achievement-workout border border-app-border-accent rounded-full text-xs">
                    {scheduledDays.length} dias
                  </Badge>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSection('schedule')}
                  className="h-8 w-8 p-0"
                >
                  {expandedSections.schedule ? (
                    <ListCollapse className="h-4 w-4" />
                  ) : (
                    <Expand className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>

            {expandedSections.schedule && (
              <CardContent>
                {scheduledDays.length === 0 ? (
                  <div className="text-center py-8">
                    <Dumbbell className="w-10 h-10 sm:w-12 sm:h-12 text-app-text-muted mx-auto mb-3 sm:mb-4" />
                    <h4 className="text-base sm:text-lg font-semibold text-app-heading mb-2">
                      Nenhum treino agendado
                    </h4>
                    <p className="text-sm sm:text-base text-app-text-secondary">
                      Este plano ainda não possui treinos configurados.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {scheduledDays.map((dayNumber) => {
                      const dayWorkouts = workoutsByDay[dayNumber] || [];
                      
                      return (
                        <div key={dayNumber} className="border border-app-border-muted rounded-xl overflow-hidden">
                          {/* Day Header */}
                          <div className="bg-gradient-to-r from-app-achievement-workout/10 to-app-achievement-consecutive/10 px-4 py-3">
                            <div className="flex items-center justify-between">
                              <h4 className="text-base font-semibold text-app-heading">
                                {getDayName(dayNumber)}
                              </h4>
                              <div className="flex items-center gap-1.5 text-app-achievement-workout">
                                <Dumbbell className="w-3.5 h-3.5" />
                                <span className="text-xs font-medium">
                                  {dayWorkouts.length} treino{dayWorkouts.length !== 1 ? 's' : ''}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Workouts List */}
                          <div className="p-4 space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {dayWorkouts.map((item, index) => {
                                if (!item?.workout) return null;
                                
                                return (
                                  <WorkoutDayCard
                                    key={`${item.id}-${index}`}
                                    workout={item.workout}
                                    onStartWorkout={handleStartWorkout}
                                    userRole={userRole}
                                  />
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            )}
          </Card>

          {/* Análise Section */}
          {analysis && (
            <Card className="border-0 card-app">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-app-achievement-workout rounded-lg flex items-center justify-center">
                      <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <CardTitle className="text-lg sm:text-xl font-bold text-app-heading">
                      Análise do Plano
                    </CardTitle>
                 
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSection('stats')}
                    className="h-8 w-8 p-0"
                  >
                    {expandedSections.stats ? (
                      <ListCollapse className="h-4 w-4" />
                    ) : (
                      <Expand className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>

              {expandedSections.stats && (
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    {/* Main Goal */}
                    {analysis.mainGoal && (
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Foco Principal</span>
                        </div>
                        <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{analysis.mainGoal}</div>
                      </div>
                    )}

                    {/* Variety */}
                    <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700 dark:text-green-300">Variedade</span>
                      </div>
                      <div className="text-lg font-bold text-green-600 dark:text-green-400">{analysis.variety}</div>
                      <div className="text-xs text-green-500">{analysis.uniqueCount} treinos únicos</div>
                    </div>

                    {/* Intensity */}
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Intensidade</span>
                      </div>
                      <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                        {scheduledDays.length >= 5 ? 'Alta' : 
                         scheduledDays.length >= 3 ? 'Moderada' : 'Básica'}
                      </div>
                      <div className="text-xs text-purple-500">{scheduledDays.length}x por semana</div>
                    </div>
                  </div>

                  {/* Weekly Distribution */}
                  <div className="mt-6">
                    <h4 className="text-sm font-bold text-app-heading mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-app-achievement-workout" />
                      Distribuição Semanal
                    </h4>
                    
                    <div className="grid grid-cols-7 gap-2">
                      {DAYS_OF_WEEK.map((day) => {
                        const hasWorkout = workoutsByDay[day.value];
                        const workoutCount = hasWorkout?.length || 0;
                        
                        return (
                          <div
                            key={day.value}
                            className={`
                              group p-3 rounded-lg text-center border-2 transition-all duration-300
                              ${hasWorkout 
                                ? 'border-app-achievement-workout/30 bg-gradient-to-br from-app-achievement-workout/10 to-app-achievement-consecutive/10' 
                                : 'border-app-border-muted bg-gradient-to-br from-app-bg-secondary to-app-bg-card'
                              }
                            `}
                          >
                            <div className={`text-xs font-medium mb-1 ${
                              hasWorkout ? 'text-app-achievement-workout' : 'text-app-text-muted'
                            }`}>
                              {day.short}
                            </div>
                            <div className={`text-lg font-bold ${
                              hasWorkout ? 'text-app-achievement-workout' : 'text-app-text-muted'
                            }`}>
                              {workoutCount}
                            </div>
                            {hasWorkout && (
                              <div className="w-2 h-2 bg-app-achievement-workout rounded-full mx-auto mt-1"></div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          )}

          {/* Info Section */}
          <Card className="border-0 card-app">
            <CardHeader className="pb-3 sm:pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-app-achievement-workout rounded-lg flex items-center justify-center">
                    <Calculator className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-bold text-app-heading">
                    Informações da Rotina
                  </CardTitle>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSection('info')}
                  className="h-8 w-8 p-0"
                >
                  {expandedSections.info ? (
                    <ListCollapse className="h-4 w-4" />
                  ) : (
                    <Expand className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>

            {expandedSections.info && (
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gradient-to-br from-app-bg-secondary/30 to-app-bg-secondary/50 rounded-xl border border-app-border-muted shadow-app-medium">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gradient-to-br from-app-achievement-workout to-app-btn-primary rounded-lg shadow-app-medium">
                        <Users className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-app-text-secondary mb-1 text-sm">
                          Aluno
                        </div>
                        <div className="text-app-heading font-semibold">
                          {plan.student?.full_name || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-app-bg-secondary/30 to-app-bg-secondary/50 rounded-xl border border-app-border-muted shadow-app-medium">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gradient-to-br from-app-achievement-workout to-app-btn-secondary rounded-lg shadow-app-medium">
                        <Shield className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-app-text-secondary mb-1 text-sm">
                          Status do Plano
                        </div>
                        <div className="text-app-heading font-semibold">
                          {statusInfo.label}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-app-bg-secondary/30 to-app-bg-secondary/50 rounded-xl border border-app-border-muted shadow-app-medium">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gradient-to-br from-app-achievement-workout to-app-btn-accent rounded-lg shadow-app-medium">
                        <Calendar className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-app-text-secondary mb-1 text-sm">
                          Criado em
                        </div>
                        <div className="text-app-heading font-semibold">
                          {format(new Date(plan.created_at), 'dd/MM/yyyy')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {plan.notes && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-app-bg-secondary/20 to-app-achievement-workout/5 rounded-xl border border-app-border-accent">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-app-achievement-workout rounded-lg">
                        <Info className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-app-heading mb-2">Observações do Plano</h4>
                        <p className="text-sm text-app-text-primary leading-relaxed">
                          {plan.notes}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Timeline Info */}
                <div className="mt-6 p-4 bg-gradient-to-r from-app-bg-secondary/20 to-app-achievement-workout/5 rounded-xl border border-app-border-accent">
                  <div className="flex items-center gap-3 mb-3">
                    <Clock className="h-5 w-5 text-app-achievement-workout" />
                    <h4 className="font-bold text-app-heading">Timeline do Plano</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-app-text-secondary">Início:</span>
                      <span className="font-semibold text-app-heading">
                        {format(new Date(plan.start_date), 'dd/MM/yyyy')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-app-text-secondary">Término:</span>
                      <span className="font-semibold text-app-heading">
                        {format(new Date(plan.end_date), 'dd/MM/yyyy')}
                      </span>
                    </div>
                    {plan.updated_at !== plan.created_at && (
                      <div className="flex justify-between">
                        <span className="text-app-text-secondary">Atualizado em:</span>
                        <span className="font-semibold text-app-heading">
                          {format(new Date(plan.updated_at), 'dd/MM/yyyy')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Empty State */}
          {(!plan.workouts || plan.workouts.length === 0) && (
            <Card className="border-0 card-app">
              <CardContent className="text-center py-12 sm:py-16">
                <div className="relative mb-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-app-bg-secondary rounded-full flex items-center justify-center shadow-app-large">
                    <Dumbbell className="h-8 w-8 sm:h-10 sm:w-10 text-app-text-muted" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-app-text-muted/30 via-app-achievement-workout/30 to-app-text-muted/30 rounded-full blur-2xl animate-pulse"></div>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-app-heading mb-2">
                  Plano Sem Treinos
                </h3>
                <p className="text-app-text-secondary max-w-md mx-auto leading-relaxed">
                  Este plano ainda não possui treinos configurados. 
                  {userRole === 'trainer' && ' Clique em Editar para adicionar treinos.'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Actions - Mobile Only */}
        <div className="grid grid-cols-2 gap-3 sm:hidden mt-6">
          <Button
            onClick={handleShare}
            variant="outline"
            className="h-12 bg-app-card border-app-border-muted text-app-text-primary rounded-xl"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Compartilhar
          </Button>

          <Button
            onClick={handleDownload}
            variant="outline"
            className="h-12 bg-app-card border-app-border-muted text-app-text-primary rounded-xl"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>

        {/* Floating Action Button - Mobile Only */}
        {userRole === 'trainer' && (
          <div className="fixed bottom-24 right-4 sm:hidden z-40">
            <div className="relative">
              <div className="absolute inset-0 bg-app-achievement-workout/30 rounded-full blur-xl animate-pulse"></div>
              <Button
                onClick={handleEdit}
                className="relative w-14 h-14 bg-achievement-workout hover:bg-app-btn-primary-hover rounded-full shadow-app-xl hover:shadow-app-xl transition-all duration-300 transform hover:scale-110 active:scale-95"
              >
                <Edit3 className="h-6 w-6 text-white" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}