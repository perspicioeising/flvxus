'use client';

import { useState, useEffect } from "react";
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
  Video
} from "lucide-react";

export default function MyWorkoutsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [activeWorkout, setActiveWorkout] = useState<WorkoutPlan | null>(null);
  const [workoutTime, setWorkoutTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutHistoryItem[]>([]);
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [showExerciseDetails, setShowExerciseDetails] = useState(false);

  const fetchWorkoutPlans = async () => {
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
        description: (error as Error).message,
      });
    }
  };

  const fetchWorkoutHistory = async () => {
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
        description: (error as Error).message,
      });
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchWorkoutPlans();
      await fetchWorkoutHistory();
    };
    init();
  }, [fetchWorkoutPlans, fetchWorkoutHistory]);

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

  interface Exercise {
    id: string;
    name: string;
    description: string;
    videoUrl?: string;
    muscleGroup?: string[];
    equipment?: string[];
    sets: number;
    reps: number;
    rest: number;
    notes?: string;
    tips?: string[];
    commonErrors?: string[];
    completed?: boolean;
    completedSets?: number;
    weight?: number;
  }

  interface WorkoutPlan {
    id: string;
    name: string;
    description: string;
    exercises: Exercise[];
    duration: number;
  }

  interface WorkoutHistoryItem {
    id: string;
    name: string;
    exercises_completed: number;
    completed_at: string;
    duration: number;
  }

  const startWorkout = (workout: WorkoutPlan) => {
    setActiveWorkout(workout);
    setIsTimerRunning(true);
    setCurrentExercise(workout.exercises[0]);
  };

  interface CompleteExerciseParams {
    exerciseId: string;
  }

  const completeExercise = async ({ exerciseId }: CompleteExerciseParams): Promise<void> => {
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
      const currentIndex = activeWorkout?.exercises.findIndex((e: Exercise) => e.id === currentExercise?.id) ?? -1;
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
        description: (error as Error).message,
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

      // Refresh workout history
      fetchWorkoutHistory();

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao completar treino",
        description: (error as Error).message,
      });
    }
  };

  interface FormatTime {
    (seconds: number): string;
  }

  const formatTime: FormatTime = (seconds) => {
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
                      {currentExercise.muscleGroup.map((muscle) => (
                        <Badge key={muscle} variant="secondary">{muscle}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {currentExercise?.equipment && (
                  <div>
                    <h4 className="font-medium mb-2">Equipamentos Necessários</h4>
                    <div className="flex flex-wrap gap-2">
                      {currentExercise.equipment.map((item) => (
                        <Badge key={item} variant="outline">{item}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {currentExercise?.tips && currentExercise.tips.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Dicas de Execução</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      {currentExercise.tips.map((tip, index) => (
                        <li key={index}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {currentExercise?.commonErrors && currentExercise.commonErrors.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Erros Comuns a Evitar</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      {currentExercise.commonErrors.map((error, index) => (
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
                {activeWorkout.exercises.map((exercise, index) => (
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
                        <span className="font-medium">{workout.name}</span>
                        <Badge variant="outline">
                          {workout.exercises_completed} exercises
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(workout.completed_at), 'MMM d, yyyy')}
                        <Clock className="h-4 w-4 ml-2" />
                        {workout.duration} minutes
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <BarChart className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
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
                    <div className="font-medium">Level 5</div>
                    <div className="text-sm text-muted-foreground">Rank de Fitness</div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted text-center">
                    <MessageSquare className="h-5 w-5 text-primary mx-auto mb-2" />
                    <div className="font-medium">85%</div>
                    <div className="text-sm text-muted-foreground">Taxa de Completude</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Conquistas Recentes</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {['🏃‍♂️', '💪', '🎯'].map((emoji, i) => (
                      <div key={i} className="p-2 text-center rounded-lg border">
                        <div className="text-2xl mb-1">{emoji}</div>
                        <div className="text-xs text-muted-foreground">
                          {['Primeira Milha', 'Potência', 'Definidor de Metas'][i]}
                        </div>
                      </div>
                    ))}
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