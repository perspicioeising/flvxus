'use client';

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { 
  Calendar,
  Clock,
  Dumbbell,
  Play,
  CheckCircle,
  Timer,
  MessageSquare,
  Trophy,
  BarChart,
  Info,
  Video,
  Award,
  Star,
  Zap,
  Volume2,
  Pause,
  ArrowLeft,
  TrendingUp,
  Flame,
  Target,
  MoreVertical,
  Plus,
  Minus,
  ChevronRight,
  X,
  Activity
} from "lucide-react";
import { useSupabase } from "@/app/providers";

export default function MyWorkoutsPage() {
  const router = useRouter();
  const { supabase, session } = useSupabase();
  const { toast } = useToast();
  const [activeWorkout, setActiveWorkout] = useState<any | null>(null);
  const [workoutTime, setWorkoutTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentExercise, setCurrentExercise] = useState<any | null>(null);
  const [workoutHistory, setWorkoutHistory] = useState<any[]>([]);
  const [workoutPlans, setWorkoutPlans] = useState<any[]>([]);
  const [showExerciseDetails, setShowExerciseDetails] = useState(false);
  const [userStats, setUserStats] = useState({
    totalPoints: 0,
    level: 1,
    streak: 0,
    nextLevelProgress: 0
  });
  const [recentAchievements, setRecentAchievements] = useState<any[]>([]);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [exerciseSetWeights, setExerciseSetWeights] = useState<{[key: string]: number[]}>({});
  const [completedSets, setCompletedSets] = useState<{[key: string]: boolean[]}>({});
  const [loading, setLoading] = useState(true);

  const fetchWorkoutPlans = useCallback(async () => {
    try {
      const response = await fetch('/api/my-workouts');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }
      
      setWorkoutPlans(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao buscar treinos",
        description: error instanceof Error ? error.message : String(error),
      });
    }
  }, [toast]);

  const fetchWorkoutHistory = useCallback(async () => {
    try {
      const response = await fetch('/api/workout-history');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }
      
      setWorkoutHistory(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao buscar histórico de treinos",
        description: error instanceof Error ? error.message : String(error),
      });
    }
  }, [toast]);

  const fetchUserStats = useCallback(async () => {
    try {
      const response = await fetch('/api/user/stats');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }
      
      setUserStats({
        totalPoints: data.totalPoints,
        level: data.level,
        streak: data.streak,
        nextLevelProgress: data.nextLevel.progressPercentage
      });
    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
  }, []);

  const fetchRecentAchievements = useCallback(async () => {
    try {
      const response = await fetch('/api/user/achievements');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }
      
      const earned = data.userAchievements
        .filter((ua: any) => ua.achievement)
        .sort((a: any, b: any) => new Date(b.earned_at).getTime() - new Date(a.earned_at).getTime())
        .slice(0, 3);
      
      setRecentAchievements(earned);
    } catch (error) {
      console.error("Error fetching recent achievements:", error);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchWorkoutPlans();
      await fetchWorkoutHistory();
      await fetchUserStats();
      await fetchRecentAchievements();
      setLoading(false);
    };
    init();
  }, [fetchWorkoutPlans, fetchWorkoutHistory, fetchUserStats, fetchRecentAchievements]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setWorkoutTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Initialize exercise set weights when starting a workout
  useEffect(() => {
    if (activeWorkout) {
      const initialWeights: {[key: string]: number[]} = {};
      const initialCompleted: {[key: string]: boolean[]} = {};
      activeWorkout.exercises.forEach((exercise: any) => {
        initialWeights[exercise.id] = Array(exercise.sets).fill(0);
        initialCompleted[exercise.id] = Array(exercise.sets).fill(false);
      });
      setExerciseSetWeights(initialWeights);
      setCompletedSets(initialCompleted);
    }
  }, [activeWorkout]);

  // Audio control
  useEffect(() => {
    return () => {
      if (audioElement) {
        audioElement.pause();
        audioElement.src = '';
      }
    };
  }, [audioElement]);

  const startWorkout = (workout: any) => {
    setActiveWorkout(workout);
    setIsTimerRunning(true);
    setCurrentExercise(workout.exercises[0]);
  };

  const completeExercise = async ({ exerciseId }: { exerciseId: string }) => {
    try {
      const weights = exerciseSetWeights[exerciseId] || [];
      const averageWeight = weights.reduce((sum, weight) => sum + weight, 0) / weights.length;

      const response = await fetch('/api/workout-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          exerciseId: currentExercise.exerciseId,
          workoutId: activeWorkout?.id,
          weight: averageWeight,
          notes: currentExercise?.notes,
          setWeights: weights
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save progress');
      }

      // Move to next exercise
      const currentIndex = activeWorkout?.exercises.findIndex((e: any) => e.id === currentExercise?.id) ?? -1;
      if (
        activeWorkout &&
        currentExercise &&
        currentIndex < activeWorkout.exercises.length - 1
      ) {
        setCurrentExercise(activeWorkout.exercises[currentIndex + 1]);
      } else {
        completeWorkout();
      }

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar progresso",
        description: error.message,
      });
    }
  };

  const completeWorkout = async () => {
    try {
      const response = await fetch('/api/workout-progress/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workoutId: activeWorkout?.id,
          duration: workoutTime,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to complete workout');
      }

      setIsTimerRunning(false);
      setActiveWorkout(null);
      setCurrentExercise(null);
      setWorkoutTime(0);

      toast({
        title: "🎉 Treino concluído!",
        description: "Parabéns! Seu progresso foi salvo com sucesso.",
      });

      // Refresh data
      await fetchWorkoutHistory();
      await fetchUserStats();
      await fetchRecentAchievements();

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao completar treino",
        description: error instanceof Error ? error.message : String(error),
      });
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSetWeightChange = (exerciseId: string, setIndex: number, weight: number) => {
    setExerciseSetWeights(prev => {
      const newWeights = {...prev};
      if (!newWeights[exerciseId]) {
        newWeights[exerciseId] = Array(currentExercise.sets).fill(0);
      }
      newWeights[exerciseId][setIndex] = weight;
      return newWeights;
    });
  };

  const handleSetComplete = (exerciseId: string, setIndex: number) => {
    setCompletedSets(prev => {
      const newCompleted = {...prev};
      if (!newCompleted[exerciseId]) {
        newCompleted[exerciseId] = Array(currentExercise.sets).fill(false);
      }
      newCompleted[exerciseId][setIndex] = !newCompleted[exerciseId][setIndex];
      return newCompleted;
    });
  };

  const isExerciseComplete = (exerciseId: string) => {
    return completedSets[exerciseId]?.every(set => set) || false;
  };

  const handleSelectExercise = (exercise: any) => {
    setCurrentExercise(exercise);
  };

  const toggleAudio = () => {
    if (!currentExercise?.audioUrl) return;
    
    if (!audioElement) {
      const audio = new Audio(currentExercise.audioUrl);
      audio.onended = () => setIsAudioPlaying(false);
      setAudioElement(audio);
      audio.play();
      setIsAudioPlaying(true);
    } else {
      if (isAudioPlaying) {
        audioElement.pause();
      } else {
        audioElement.play();
      }
      setIsAudioPlaying(!isAudioPlaying);
    }
  };

  const getAchievementIcon = (type: string) => {
    switch(type) {
      case 'workouts_completed': return '💪';
      case 'consecutive_days': return '🔥';
      case 'total_weight': return '🏋️';
      case 'exercises_completed': return '🎯';
      default: return '🏆';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/40 to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 dark:border-blue-800 rounded-full animate-spin border-t-blue-600 dark:border-t-blue-400"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent rounded-full animate-ping border-t-blue-400 dark:border-t-blue-500"></div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
              Carregando treinos...
            </h2>
            <p className="text-gray-600 dark:text-gray-400">Por favor, aguarde enquanto buscamos as informações.</p>
          </div>
        </div>
      </div>
    );
  }

  // Active Workout View
  if (activeWorkout) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          
          {/* Workout Header */}
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-500/20 to-pink-600/20 dark:from-blue-500/10 dark:via-purple-400/10 dark:to-pink-500/10 rounded-3xl blur-xl"></div>
            <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-blue-200/50 dark:border-blue-800/30 rounded-3xl p-6 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (confirm("Tem certeza que deseja sair do treino?")) {
                        setActiveWorkout(null);
                        setIsTimerRunning(false);
                        setWorkoutTime(0);
                      }
                    }}
                    className="shrink-0"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                      {activeWorkout.name}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                      {activeWorkout.description}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 bg-black/5 dark:bg-white/5 rounded-2xl px-4 py-2">
                  <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-2xl font-mono font-bold text-gray-900 dark:text-white">
                    {formatTime(workoutTime)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className="h-8 w-8"
                  >
                    {isTimerRunning ? 
                      <Pause className="h-4 w-4" /> : 
                      <Play className="h-4 w-4" />
                    }
                  </Button>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Progresso do Treino</span>
                  <span className="font-semibold">
                    {activeWorkout.exercises.filter((e: any) => isExerciseComplete(e.id)).length} de {activeWorkout.exercises.length} exercícios
                  </span>
                </div>
                <Progress 
                  value={(activeWorkout.exercises.filter((e: any) => isExerciseComplete(e.id)).length / activeWorkout.exercises.length) * 100} 
                  className="h-2"
                />
              </div>
            </div>
          </div>

          {/* Mobile Exercise Tabs */}
          <div className="md:hidden mb-6">
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {activeWorkout.exercises.map((exercise: any, index: number) => (
                <Button
                  key={exercise.id}
                  variant={currentExercise?.id === exercise.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSelectExercise(exercise)}
                  className={cn(
                    "shrink-0 relative",
                    isExerciseComplete(exercise.id) && "border-green-500"
                  )}
                >
                  <span className="mr-2">{index + 1}</span>
                  {exercise.name}
                  {isExerciseComplete(exercise.id) && (
                    <CheckCircle className="h-3 w-3 ml-2 text-green-500" />
                  )}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Desktop Exercise List */}
            <div className="hidden lg:block">
              <Card className="border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl">
                <CardHeader>
                  <CardTitle>Exercícios</CardTitle>
                  <CardDescription>Navegue pelos exercícios do treino</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-200 dark:divide-gray-800">
                    {activeWorkout.exercises.map((exercise: any, index: number) => (
                      <div
                        key={exercise.id}
                        className={cn(
                          "flex items-center gap-4 p-4 cursor-pointer transition-all duration-200",
                          "hover:bg-gray-50 dark:hover:bg-gray-800/50",
                          currentExercise?.id === exercise.id && "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500",
                          isExerciseComplete(exercise.id) && "bg-green-50 dark:bg-green-900/10"
                        )}
                        onClick={() => handleSelectExercise(exercise)}
                      >
                        <div className={cn(
                          "shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold",
                          currentExercise?.id === exercise.id 
                            ? "bg-blue-600 text-white" 
                            : isExerciseComplete(exercise.id)
                              ? "bg-green-500 text-white"
                              : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                        )}>
                          {isExerciseComplete(exercise.id) ? 
                            <CheckCircle className="h-5 w-5" /> : 
                            index + 1
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 dark:text-white truncate">
                            {exercise.name}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {exercise.sets} séries × {exercise.reps} reps
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400 shrink-0" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Exercise Content */}
            <div className="lg:col-span-2">
              {currentExercise && (
                <Card className="border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <CardTitle className="text-xl sm:text-2xl">
                          {currentExercise.name}
                        </CardTitle>
                        <CardDescription>
                          Complete todas as séries marcando o peso utilizado
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        {currentExercise.audioUrl && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={toggleAudio}
                            className="shrink-0"
                          >
                            {isAudioPlaying ? 
                              <Pause className="h-4 w-4" /> : 
                              <Volume2 className="h-4 w-4" />
                            }
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          onClick={() => setShowExerciseDetails(true)}
                          className="shrink-0"
                        >
                          <Info className="h-4 w-4 sm:mr-2" />
                          <span className="hidden sm:inline">Detalhes</span>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Video Section */}
                    {currentExercise.videoUrl && (
                      <div className="aspect-video rounded-2xl overflow-hidden bg-black">
                        <video
                          src={currentExercise.videoUrl}
                          controls
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}

                    {/* Sets Section */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Dumbbell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        Séries
                      </h3>
                      <div className="space-y-3">
                        {Array.from({ length: currentExercise.sets }).map((_, setIndex) => (
                          <div
                            key={setIndex}
                            className={cn(
                              "relative p-4 rounded-xl border-2 transition-all duration-300",
                              completedSets[currentExercise.id]?.[setIndex]
                                ? "bg-green-50 dark:bg-green-900/20 border-green-500"
                                : "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
                            )}
                          >
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                              <div className="flex items-center gap-3 flex-1">
                                <div className={cn(
                                  "shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all",
                                  completedSets[currentExercise.id]?.[setIndex]
                                    ? "bg-green-500 text-white"
                                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-2 border-gray-300 dark:border-gray-600"
                                )}>
                                  {completedSets[currentExercise.id]?.[setIndex] ? 
                                    <CheckCircle className="h-5 w-5" /> : 
                                    setIndex + 1
                                  }
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900 dark:text-white">
                                    Série {setIndex + 1}
                                  </div>
                                  <div className="text-sm text-gray-600 dark:text-gray-400">
                                    {currentExercise.reps} repetições
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 w-full sm:w-auto">
                                <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-xl px-3 py-2 flex-1 sm:flex-initial">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => {
                                      const current = exerciseSetWeights[currentExercise.id]?.[setIndex] || 0;
                                      handleSetWeightChange(currentExercise.id, setIndex, Math.max(0, current - 2.5));
                                    }}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  <div className="text-center min-w-[80px]">
                                    <input
                                      type="number"
                                      step="2.5"
                                      className="w-full text-center bg-transparent font-bold text-lg focus:outline-none"
                                      value={exerciseSetWeights[currentExercise.id]?.[setIndex] || ''}
                                      onChange={(e) => handleSetWeightChange(
                                        currentExercise.id, 
                                        setIndex, 
                                        parseFloat(e.target.value) || 0
                                      )}
                                      placeholder="0"
                                    />
                                    <div className="text-xs text-gray-500">kg</div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => {
                                      const current = exerciseSetWeights[currentExercise.id]?.[setIndex] || 0;
                                      handleSetWeightChange(currentExercise.id, setIndex, current + 2.5);
                                    }}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>

                                <Button
                                  variant={completedSets[currentExercise.id]?.[setIndex] ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => handleSetComplete(currentExercise.id, setIndex)}
                                  className="shrink-0"
                                >
                                  {completedSets[currentExercise.id]?.[setIndex] ? "Concluído" : "Concluir"}
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Notes Section */}
                    <div>
                      <label className="text-lg font-semibold mb-2 block flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        Observações
                      </label>
                      <Textarea
                        placeholder="Adicione observações sobre este exercício..."
                        value={currentExercise.notes || ''}
                        onChange={(e) => setCurrentExercise({
                          ...currentExercise,
                          notes: e.target.value
                        })}
                        className="resize-none"
                        rows={3}
                      />
                    </div>

                    {/* Complete Exercise Button */}
                    <Button
                      className="w-full h-14 text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      onClick={() => completeExercise({ exerciseId: currentExercise.id })}
                      disabled={!isExerciseComplete(currentExercise.id)}
                    >
                      {currentExercise === activeWorkout.exercises[activeWorkout.exercises.length - 1]
                        ? "Finalizar Treino"
                        : "Próximo Exercício"
                      }
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Exercise Details Modal */}
          <Dialog open={showExerciseDetails} onOpenChange={setShowExerciseDetails}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{currentExercise?.name}</DialogTitle>
                <DialogDescription>
                  Instruções detalhadas para executar o exercício corretamente
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 mt-4">
                {currentExercise?.description && (
                  <div>
                    <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Descrição</h4>
                    <p className="text-gray-600 dark:text-gray-400">{currentExercise.description}</p>
                  </div>
                )}
                
                {currentExercise?.instructions && (
                  <div>
                    <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Instruções</h4>
                    <p className="text-gray-600 dark:text-gray-400">{currentExercise.instructions}</p>
                  </div>
                )}

                {currentExercise?.tips && (
                  <div>
                    <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Dicas</h4>
                    <p className="text-gray-600 dark:text-gray-400">{currentExercise.tips}</p>
                  </div>
                )}

                {currentExercise?.targetMuscles && (
                  <div>
                    <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Músculos Alvo</h4>
                    <div className="flex flex-wrap gap-2">
                      {currentExercise.targetMuscles.map((muscle: string, index: number) => (
                        <Badge key={index} variant="secondary">
                          {muscle}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {currentExercise?.videoUrl && (
                  <div>
                    <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Vídeo Demonstrativo</h4>
                    <div className="aspect-video rounded-lg overflow-hidden bg-black">
                      <video
                        src={currentExercise.videoUrl}
                        controls
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  }

  // Main Dashboard View
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/40 to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-black">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        
        {/* Header */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-500/20 to-pink-600/20 dark:from-blue-500/10 dark:via-purple-400/10 dark:to-pink-500/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-blue-200/50 dark:border-blue-800/30 rounded-3xl p-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                  Meus Treinos
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Organize e acompanhe seus treinos de forma inteligente
                </p>
              </div>
              <Button
                onClick={() => router.push('/workouts/create')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Plus className="h-5 w-5 mr-2" />
                Criar Treino
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-xl">
                  <Trophy className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Nível</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{userStats.level}</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">Progresso</span>
                  <span className="text-gray-500">{userStats.nextLevelProgress}%</span>
                </div>
                <Progress value={userStats.nextLevelProgress} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/50 rounded-xl">
                  <Flame className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Sequência</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{userStats.streak} dias</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-xl">
                  <Zap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pontos</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{userStats.totalPoints}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-xl">
                  <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Treinos</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{workoutHistory.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Workout Plans */}
          <div className="lg:col-span-2">
            <Card className="border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Dumbbell className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  Planos de Treino
                </CardTitle>
                <CardDescription>
                  Seus treinos planejados e prontos para execução
                </CardDescription>
              </CardHeader>
              <CardContent>
                {workoutPlans.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                      <Dumbbell className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Nenhum treino encontrado</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Crie seu primeiro plano de treino para começar
                    </p>
                    <Button 
                      onClick={() => router.push('/workouts/create')}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Primeiro Treino
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {workoutPlans.map((workout) => (
                      <div
                        key={workout.id}
                        className="group relative p-6 bg-gradient-to-r from-gray-50 to-blue-50/50 dark:from-gray-800/50 dark:to-blue-900/20 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-300"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                              {workout.name}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-3">
                              {workout.description}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Dumbbell className="h-4 w-4" />
                                <span>{workout.exercises?.length || 0} exercícios</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>{workout.estimatedDuration || 60} min</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Target className="h-4 w-4" />
                                <span>{workout.difficulty || 'Intermediário'}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/workouts/${workout.id}`)}
                            >
                              <Info className="h-4 w-4 mr-2" />
                              Ver Detalhes
                            </Button>
                            <Button
                              onClick={() => startWorkout(workout)}
                              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold px-6 py-2"
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Iniciar
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Achievements */}
            {recentAchievements.length > 0 && (
              <Card className="border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    Conquistas Recentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentAchievements.map((achievement, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl">
                        <div className="text-2xl">
                          {getAchievementIcon(achievement.achievement.type)}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 dark:text-white text-sm">
                            {achievement.achievement.name}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {formatDistanceToNow(new Date(achievement.earned_at), { addSuffix: true, locale: ptBR })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Workouts */}
            <Card className="border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  Histórico Recente
                </CardTitle>
              </CardHeader>
              <CardContent>
                {workoutHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                      <BarChart className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Nenhum treino realizado ainda
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {workoutHistory.slice(0, 5).map((session, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                        <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white text-sm">
                            {session.workout?.name || 'Treino'}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {format(new Date(session.completed_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatTime(session.duration)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Ações Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => router.push('/workouts/history')}
                  >
                    <BarChart className="h-4 w-4 mr-2" />
                    Ver Histórico Completo
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => router.push('/progress')}
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Acompanhar Progresso
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => router.push('/achievements')}
                  >
                    <Trophy className="h-4 w-4 mr-2" />
                    Todas as Conquistas
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}