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
  Zap
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

  const startWorkout = (workout: any) => {
    setActiveWorkout(workout);
    setIsTimerRunning(true);
    setCurrentExercise(workout.exercises[0]);
  };

  const completeExercise = async ({ exerciseId }: { exerciseId: string }) => {
    try {
      const response = await fetch('/api/workout-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          exerciseId,
          workoutId: activeWorkout?.id,
          weight: currentExercise?.weight,
          notes: currentExercise?.notes,
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

        <div className="grid gap-6">
          {currentExercise && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{currentExercise.name}</CardTitle>
                    <CardDescription>
                      Complete todas as séries para avançar para o próximo exercício
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setShowExerciseDetails(true)}
                  >
                    <Info className="h-4 w-4 mr-2" />
                    Detalhes do Exercício
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentExercise.videoUrl && (
                  <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                    <video
                      src={currentExercise.videoUrl}
                      controls
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Peso Usado (kg)</label>
                    <input
                      type="number"
                      className="w-full mt-1 p-2 border rounded"
                      value={currentExercise.weight || ''}
                      onChange={(e) => setCurrentExercise({
                        ...currentExercise,
                        weight: parseFloat(e.target.value)
                      })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Séries Completadas</label>
                    <div className="flex items-center gap-2 mt-1">
                      {Array.from({ length: currentExercise.sets }).map((_, i) => (
                        <Button
                          key={i}
                          variant={(currentExercise.completedSets ?? 0) > i ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentExercise({
                            ...currentExercise,
                            completedSets: i + 1
                          })}
                        >
                          {i + 1}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Notes</label>
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
                  disabled={!currentExercise.completedSets}
                >
                  Completar Exercício
                </Button>
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

          <Card>
            <CardHeader>
              <CardTitle>Workout Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeWorkout.exercises.map((exercise: any, index: number) => (
                  <div 
                    key={exercise.id}
                    className={`flex items-center gap-4 p-4 rounded-lg ${
                      exercise.id === currentExercise?.id 
                        ? 'bg-primary/10 border-primary' 
                        : 'bg-muted'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{exercise.name}</span>
                        {exercise.completed && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {exercise.sets} séries × {exercise.reps} repetições • {exercise.rest}s de descanso
                      </div>
                    </div>
                    {exercise.weight && (
                      <Badge variant="outline">
                        {exercise.weight} kg
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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
            <CardTitle>Treinos de Hoje</CardTitle>
            <CardDescription>
              Seus treinos agendados para hoje
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {workoutPlans.map((plan) => (
                <div 
                  key={plan.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Dumbbell className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {plan.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Dumbbell className="h-4 w-4" />
                          {plan.exercises.length} exercises
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          ~{plan.duration} minutes
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button onClick={() => startWorkout(plan)}>
                    Iniciar Treino
                  </Button>
                </div>
              ))}

              {workoutPlans.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  Nenhum treino agendado para hoje
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