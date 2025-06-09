'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Dumbbell, Edit, Trash2, CalendarCheck, User, Clock, Target, Activity, Zap, Users, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

const DAYS_OF_WEEK = [
  "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"
];

export default function WorkoutPlanDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  
  type WorkoutExercise = {
    id: number;
    exercise: {
      name: string;
    };
    sets: number;
    reps: number;
    rest?: number;
    notes?: string;
  };
  
  type Workout = {
    id: number;
    name: string;
    description?: string;
    level: string;
    goal: string;
    workout_exercises?: WorkoutExercise[];
  };
  
  type WorkoutPlanItem = {
    day_of_week: number;
    workout: Workout;
  };
  
  type Student = {
    full_name: string;
    email: string;
  };
  
  type Plan = {
    id: string;
    name: string;
    description?: string;
    start_date: string;
    end_date: string;
    student?: Student;
    workout_plan_items: WorkoutPlanItem[];
  };
  
  const [plan, setPlan] = useState<Plan | null>(null);

  useEffect(() => {
    fetchPlanDetails();
  }, []);

  const fetchPlanDetails = async () => {
    try {
      const response = await fetch(`/api/workout-plans/${params.id}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }
      
      setPlan(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao buscar detalhes do plano",
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Tem certeza que deseja deletar o plano "${plan?.name}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      setIsDeleting(true);
      
      const response = await fetch(`/api/workout-plans/${params.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }

      toast({
        title: "Plano deletado",
        description: "O plano de treino foi removido com sucesso",
      });
      
      router.push('/dashboard/workout-plans');
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao deletar plano",
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 dark:border-blue-800 rounded-full animate-spin border-t-blue-600 dark:border-t-blue-400"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent rounded-full animate-ping border-t-blue-400 dark:border-t-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative mb-8">
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-red-100 via-orange-100 to-yellow-100 dark:from-red-900/30 dark:via-orange-900/30 dark:to-yellow-900/30 rounded-full flex items-center justify-center shadow-2xl">
              <AlertTriangle className="h-16 w-16 text-red-600 dark:text-red-400" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-red-400/30 via-orange-400/30 to-yellow-400/30 rounded-full blur-3xl animate-pulse"></div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-3xl font-black bg-gradient-to-r from-gray-900 via-red-600 to-gray-900 dark:from-white dark:via-red-400 dark:to-white bg-clip-text text-transparent">
              Plano não encontrado
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-md mx-auto leading-relaxed">
              O plano de treino solicitado não foi encontrado ou pode ter sido removido.
            </p>
            <Button 
              onClick={() => router.push('/dashboard/workout-plans')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-2xl font-bold shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Voltar aos Planos
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate plan statistics
  const totalDays = differenceInDays(new Date(plan.end_date), new Date(plan.start_date));
  const totalWorkouts = plan.workout_plan_items?.length || 0;
  const totalExercises = plan.workout_plan_items?.reduce((sum, item) => sum + (item.workout?.workout_exercises?.length || 0), 0) || 0;
  const isActive = new Date(plan.end_date) >= new Date();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black">
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl">
        
        {/* Modern Header */}
        <div className="relative mb-6 sm:mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-500/20 to-pink-600/20 dark:from-blue-500/10 dark:via-purple-400/10 dark:to-pink-500/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-blue-200/50 dark:border-blue-800/30 rounded-3xl p-4 sm:p-8 shadow-2xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 rounded-xl shadow-lg transition-all duration-300"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                  </Button>
                  <div className="relative">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <CalendarCheck className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <Zap className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black bg-gradient-to-r from-gray-600 via-gray-600 to-gray-900 dark:from-white dark:via-gray-400 dark:to-white bg-clip-text text-transparent">
                      {plan.name}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base mt-1">
                      Detalhes do Plano de Treino
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/dashboard/workout-plans/${params.id}/edit`)}
                  className="bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 min-h-[44px]"
                >
                  <Edit className="h-4 w-4 mr-2" />
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-xl shadow-lg hover:shadow-red-500/25 transition-all duration-300 min-h-[44px]"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Deletando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Card className="relative border-0 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl transform group-hover:scale-105 transition-all duration-300">
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="flex items-center gap-3 mb-3 sm:mb-4">
                  <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-blue-600 dark:text-blue-400 text-xs sm:text-sm font-semibold">Duração</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{totalDays}d</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min((totalDays / 90) * 100, 100)}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Card className="relative border-0 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl transform group-hover:scale-105 transition-all duration-300">
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="flex items-center gap-3 mb-3 sm:mb-4">
                  <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                    <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-green-600 dark:text-green-400 text-xs sm:text-sm font-semibold">Status</p>
                    <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{isActive ? 'Ativo' : 'Concluído'}</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className={`h-2 rounded-full transition-all duration-1000 ${isActive ? 'bg-gradient-to-r from-green-500 to-green-600 w-full' : 'bg-gradient-to-r from-gray-400 to-gray-500 w-3/4'}`}></div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Card className="relative border-0 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl transform group-hover:scale-105 transition-all duration-300">
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="flex items-center gap-3 mb-3 sm:mb-4">
                  <div className="p-2 sm:p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                    <CalendarCheck className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-purple-600 dark:text-purple-400 text-xs sm:text-sm font-semibold">Treinos</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{totalWorkouts}</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min((totalWorkouts / 7) * 100, 100)}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Card className="relative border-0 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl transform group-hover:scale-105 transition-all duration-300">
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="flex items-center gap-3 mb-3 sm:mb-4">
                  <div className="p-2 sm:p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                    <Dumbbell className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-orange-600 dark:text-orange-400 text-xs sm:text-sm font-semibold">Exercícios</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{totalExercises}</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min((totalExercises / 50) * 100, 100)}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Plan Overview */}
        <div className="relative mb-6 sm:mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 via-blue-500/10 to-purple-600/10 rounded-2xl blur-xl"></div>
          <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl rounded-2xl">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                  <User className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Informações do Plano</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                    Detalhes gerais e configurações do programa
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200/50 dark:border-blue-700/50">
                    <div className="flex items-center gap-3 mb-2">
                      <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <h3 className="font-semibold text-gray-900 dark:text-white">Aluno</h3>
                    </div>
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{plan.student?.full_name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{plan.student?.email}</p>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200/50 dark:border-green-700/50">
                    <div className="flex items-center gap-3 mb-2">
                      <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <h3 className="font-semibold text-gray-900 dark:text-white">Descrição</h3>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {plan.description || "Nenhuma descrição fornecida para este plano."}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200/50 dark:border-purple-700/50">
                    <div className="flex items-center gap-3 mb-3">
                      <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      <h3 className="font-semibold text-gray-900 dark:text-white">Período</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Início:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {format(new Date(plan.start_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Término:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {format(new Date(plan.end_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl border border-orange-200/50 dark:border-orange-700/50">
                    <div className="flex items-center gap-3 mb-3">
                      <Activity className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      <h3 className="font-semibold text-gray-900 dark:text-white">Status Atual</h3>
                    </div>
                    <Badge className={`text-sm px-3 py-1 rounded-full ${
                      isActive 
                        ? 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-600' 
                        : 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-600'
                    }`}>
                      {isActive ? '✦ Plano Ativo' : '○ Plano Concluído'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Schedule */}
        <div className="space-y-4 sm:space-y-6">
          {DAYS_OF_WEEK.map((day, index) => {
            const dayWorkouts = plan.workout_plan_items
              ?.filter(item => item.day_of_week === index + 1)
              ?.map(item => item.workout)
              ?.filter(Boolean) || [];

            if (dayWorkouts.length === 0) return null;

            return (
              <div key={day} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
                <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl">
                  <CardHeader className="p-4 sm:p-6">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
                        <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{day}</CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-400">
                          {dayWorkouts.length} treino{dayWorkouts.length !== 1 ? 's' : ''} programado{dayWorkouts.length !== 1 ? 's' : ''}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    <div className="space-y-4">
                      {dayWorkouts.map((workout, workoutIndex) => (
                        <div key={workout.id} 
                             className="bg-white dark:bg-gray-900/70 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300"
                             style={{
                               animation: `fadeInUp 0.5s ease-out ${workoutIndex * 0.1}s both`
                             }}>
                          <div className="p-4 sm:p-6">
                            <div className="flex items-start gap-3 sm:gap-4 mb-4">
                              <div className="p-2 sm:p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg">
                                <Dumbbell className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-bold text-lg sm:text-xl text-gray-900 dark:text-white mb-2">
                                  {workout.name}
                                </h3>
                                {workout.description && (
                                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                                    {workout.description}
                                  </p>
                                )}
                                <div className="flex flex-wrap gap-2 mb-4">
                                  <Badge className="bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-600 rounded-full text-xs capitalize">
                                    {workout.level}
                                  </Badge>
                                  <Badge className="bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-600 rounded-full text-xs">
                                    {workout.goal}
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            {/* Exercises List */}
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 mb-4">
                                <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
                                <span className="px-3 py-1 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full text-xs font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                  {workout.workout_exercises?.length || 0} exercícios
                                </span>
                                <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
                              </div>
                              
                              {workout.workout_exercises?.map((we, exerciseIndex) => (
                                <div key={we.id} 
                                     className="group flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800/50 dark:to-blue-900/20 rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-md transition-all duration-300"
                                     style={{
                                       animation: `slideInLeft 0.3s ease-out ${exerciseIndex * 0.05}s both`
                                     }}>
                                  <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg shadow-md group-hover:scale-110 transition-transform duration-300">
                                    <Dumbbell className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white truncate">
                                      {we.exercise.name}
                                    </h4>
                                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                                      <div className="flex items-center gap-1">
                                        <Target className="h-3 w-3 text-blue-500" />
                                        <span><span className="font-medium text-blue-600 dark:text-blue-400">{we.sets}</span> séries</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Activity className="h-3 w-3 text-green-500" />
                                        <span><span className="font-medium text-green-600 dark:text-green-400">{we.reps}</span> reps</span>
                                      </div>
                                      {we.rest && (
                                        <div className="flex items-center gap-1">
                                          <Clock className="h-3 w-3 text-orange-500" />
                                          <span><span className="font-medium text-orange-600 dark:text-orange-400">{we.rest}s</span> desc.</span>
                                        </div>
                                      )}
                                    </div>
                                    {we.notes && (
                                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2 italic">
                                        💡 {we.notes}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {plan.workout_plan_items?.length === 0 && (
          <div className="text-center py-12 sm:py-20">
            <div className="relative mb-6 sm:mb-8">
              <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-blue-900/30 dark:via-purple-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center shadow-2xl">
                <CalendarCheck className="h-12 w-12 sm:h-16 sm:w-16 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/30 via-purple-400/30 to-pink-400/30 rounded-full blur-3xl animate-pulse"></div>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-gray-900 via-blue-600 to-gray-900 dark:from-white dark:via-blue-400 dark:to-white bg-clip-text text-transparent mb-3 sm:mb-4">
              Nenhum treino programado
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 sm:mb-10 max-w-lg mx-auto text-base sm:text-lg leading-relaxed">
              Este plano ainda não possui treinos configurados. Edite o plano para adicionar exercícios.
            </p>

            <Button
              onClick={() => router.push(`/dashboard/workout-plans/${params.id}/edit`)}
              className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white px-6 py-3 sm:px-10 sm:py-4 rounded-2xl font-bold shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 transform hover:scale-110 border-0 min-h-[44px] text-sm sm:text-base"
            >
              <Edit className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6" />
              Adicionar Treinos
            </Button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}