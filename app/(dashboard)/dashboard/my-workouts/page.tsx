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
import { format } from "date-fns";
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
  Pause
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
  const [exerciseSetWeights, setExerciseSetWeights] = useState<{[key: string]: number[]}>({}); // Track weights for each set

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
      
      // Get only earned achievements and sort by most recent
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
      await fetchWorkoutPlans();
      await fetchWorkoutHistory();
      await fetchUserStats();
      await fetchRecentAchievements();
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
      activeWorkout.exercises.forEach((exercise: any) => {
        initialWeights[exercise.id] = Array(exercise.sets).fill(0);
      });
      setExerciseSetWeights(initialWeights);
    }
  }, [activeWorkout]);

  // Audio control
  useEffect(() => {
    return () => {
      // Cleanup audio when component unmounts
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
      // Get the weights for all sets of this exercise
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
        title: "Treino concluído!",
        description: "Ótimo trabalho! Seu progresso foi salvo.",
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
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
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

  if (activeWorkout) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{activeWorkout.name}</h2>
            <p className="text-muted-foreground">
              {activeWorkout.description}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-2xl font-mono">{formatTime(workoutTime)}</div>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setIsTimerRunning(!isTimerRunning)}
            >
              {isTimerRunning ? <Timer className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left sidebar - Exercise list */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Exercícios</CardTitle>
                <CardDescription>Selecione um exercício para trabalhar</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {activeWorkout.exercises.map((exercise: any, index: number) => (
                    <div 
                      key={exercise.id}
                      className={`flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                        exercise.id === currentExercise?.id 
                          ? 'bg-primary/10 border-primary' 
                          : exercise.completed ? 'bg-green-50 dark:bg-green-900/10' : ''
                      }`}
                      onClick={() => handleSelectExercise(exercise)}
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{exercise.name}</span>
                          {exercise.completed && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {exercise.sets} séries × {exercise.reps} repetições
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main content - Current exercise */}
          <div className="md:col-span-2">
            {currentExercise && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{currentExercise.name}</CardTitle>
                      <CardDescription>
                        Complete todas as séries para avançar
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {currentExercise.audioUrl && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={toggleAudio}
                        >
                          {isAudioPlaying ? <Pause className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        onClick={() => setShowExerciseDetails(true)}
                      >
                        <Info className="h-4 w-4 mr-2" />
                        Detalhes
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {currentExercise.videoUrl && (
                    <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                      <video
                        src={currentExercise.videoUrl}
                        controls
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Séries</h3>
                      <div className="space-y-4">
                        {Array.from({ length: currentExercise.sets }).map((_, setIndex) => (
                          <div key={setIndex} className="flex items-center gap-4 p-4 border rounded-lg">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                              {setIndex + 1}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Série {setIndex + 1}</span>
                                <span className="text-sm text-muted-foreground">
                                  {currentExercise.reps} repetições
                                </span>
                              </div>
                            </div>
                            <div className="w-24">
                              <label className="text-xs text-muted-foreground block mb-1">Peso (kg)</label>
                              <input
                                type="number"
                                className="w-full p-2 border rounded"
                                value={exerciseSetWeights[currentExercise.id]?.[setIndex] || ''}
                                onChange={(e) => handleSetWeightChange(
                                  currentExercise.id, 
                                  setIndex, 
                                  parseFloat(e.target.value) || 0
                                )}
                              />
                            </div>
                            <Button
                              variant={exerciseSetWeights[currentExercise.id]?.[setIndex] ? "default" : "outline"}
                              size="sm"
                              onClick={() => {
                                // Mark this set as completed
                                const newWeights = {...exerciseSetWeights};
                                if (!newWeights[currentExercise.id]) {
                                  newWeights[currentExercise.id] = Array(currentExercise.sets).fill(0);
                                }
                                // If weight is already set, we consider it completed
                                if (!newWeights[currentExercise.id][setIndex]) {
                                  // If no weight is set, use the previous set's weight or 0
                                  const prevWeight = setIndex > 0 ? 
                                    newWeights[currentExercise.id][setIndex - 1] : 0;
                                  newWeights[currentExercise.id][setIndex] = prevWeight;
                                }
                                setExerciseSetWeights(newWeights);
                              }}
                            >
                              {exerciseSetWeights[currentExercise.id]?.[setIndex] ? "Concluído" : "Concluir"}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-lg font-medium mb-2 block">Notas</label>
                      <Textarea
                        placeholder="Adicione notas sobre este exercício..."
                        value={currentExercise.notes || ''}
                        onChange={(e) => setCurrentExercise({
                          ...currentExercise,
                          notes: e.target.value
                        })}
                        className="mt-1"
                      />
                    </div>

                    <Button 
                      className="w-full"
                      onClick={() => completeExercise({ exerciseId: currentExercise.id })}
                      disabled={!exerciseSetWeights[currentExercise.id] || 
                        exerciseSetWeights[currentExercise.id].filter(Boolean).length < currentExercise.sets}
                    >
                      Completar Exercício
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Dialog open={showExerciseDetails} onOpenChange={setShowExerciseDetails}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{currentExercise?.name}</DialogTitle>
                  <DialogDescription>
                    Instruções detalhadas e dicas para este exercício
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-muted-foreground">{currentExercise?.description}</p>
                  </div>

                  {currentExercise?.muscleGroup && (
                    <div>
                      <h4 className="font-medium mb-2">Músculos Alvo</h4>
                      <div className="flex flex-wrap gap-2">
                        {currentExercise.muscleGroup.map((muscle: string) => (
                          <Badge key={muscle} variant="secondary">{muscle}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentExercise?.equipment && (
                    <div>
                      <h4 className="font-medium mb-2">Equipamentos Necessários</h4>
                      <div className="flex flex-wrap gap-2">
                        {currentExercise.equipment.map((item: string) => (
                          <Badge key={item} variant="outline">{item}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentExercise?.tips && currentExercise.tips.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Dicas de Execução</h4>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        {currentExercise.tips.map((tip: string, index: number) => (
                          <li key={index}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {currentExercise?.commonErrors && currentExercise.commonErrors.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Erros Comuns a Evitar</h4>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        {currentExercise.commonErrors.map((error: string, index: number) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Meus Treinos</h2>
        <p className="text-muted-foreground">
          Veja seus planos de treino e acompanhe seu progresso
        </p>
      </div>

      <div className="grid gap-6">
        {/* User Stats */}
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <Trophy className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Nível {userStats.level}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Award className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">{userStats.totalPoints} pontos totais</span>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 max-w-md">
                <div className="flex justify-between text-sm mb-2">
                  <span>Progresso para Nível {userStats.level + 1}</span>
                  <span>{Math.round(userStats.nextLevelProgress)}%</span>
                </div>
                <Progress value={userStats.nextLevelProgress} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Meus Planos de Treino</CardTitle>
            <CardDescription>
              Todos os seus treinos disponíveis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {workoutPlans.length > 0 ? (
                workoutPlans.map((workout) => (
                  <div 
                    key={workout.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Dumbbell className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{workout.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {workout.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Dumbbell className="h-4 w-4" />
                            {workout.exercises.length} exercícios
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            ~{workout.duration} minutos
                          </div>
                          {workout.planName && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {workout.planName}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button onClick={() => startWorkout(workout)}>
                      Iniciar Treino
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  Nenhum treino disponível. Entre em contato com seu treinador.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Atividade Recente</CardTitle>
              <CardDescription>
                Seus treinos completados mais recentes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workoutHistory.slice(0, 5).map((workout) => (
                  <div 
                    key={workout.id}
                    className="flex items-center gap-4 p-4 rounded-lg bg-muted"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{workout.workout?.name || "Treino"}</span>
                        <Badge variant="outline">
                          {workout.exercises_completed} exercises
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(workout.completed_at), 'MMM d, yyyy')}
                        <Clock className="h-4 w-4 ml-2" />
                        {Math.round(workout.duration / 60)} minutos
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <BarChart className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                {workoutHistory.length === 0 && (
                  <div className="text-center py-6 text-muted-foreground">
                    Nenhum treino completado ainda
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Progresso e Conquistas</CardTitle>
              <CardDescription>
                Acompanhe sua jornada de fitness
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Meta Mensal</span>
                    <span className="text-sm text-muted-foreground">15/20 workouts</span>
                  </div>
                  <Progress value={75} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-muted text-center">
                    <Trophy className="h-5 w-5 text-primary mx-auto mb-2" />
                    <div className="font-medium">Level {userStats.level}</div>
                    <div className="text-sm text-muted-foreground">Rank de Fitness</div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted text-center">
                    <Zap className="h-5 w-5 text-primary mx-auto mb-2" />
                    <div className="font-medium">{userStats.streak} dias</div>
                    <div className="text-sm text-muted-foreground">Sequência Atual</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Conquistas Recentes</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {recentAchievements.length > 0 ? (
                      recentAchievements.map((achievement: any) => (
                        <div key={achievement.id} className="p-2 text-center rounded-lg border">
                          <div className="text-2xl mb-1">
                            {achievement.achievement.criteria_type === 'workouts_completed' && '💪'}
                            {achievement.achievement.criteria_type === 'consecutive_days' && '🔥'}
                            {achievement.achievement.criteria_type === 'total_weight' && '🏋️'}
                            {achievement.achievement.criteria_type === 'exercises_completed' && '🎯'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {achievement.achievement.name}
                          </div>
                        </div>
                      ))
                    ) : (
                      ['🏃‍♂️', '💪', '🎯'].map((emoji, i) => (
                        <div key={i} className="p-2 text-center rounded-lg border">
                          <div className="text-2xl mb-1">{emoji}</div>
                          <div className="text-xs text-muted-foreground">
                            {['Primeira Milha', 'Potência', 'Definidor de Metas'][i]}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}