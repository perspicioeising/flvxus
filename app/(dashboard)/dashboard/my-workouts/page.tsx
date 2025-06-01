'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
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
  BarChart
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
        title: "Error fetching workouts",
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
        title: "Error fetching workout history",
        description: (error as Error).message,
      });
    }
  };

  interface Exercise {
    id: string;
    name: string;
    sets: number;
    reps: number;
    weight?: number;
    notes?: string;
    completed?: boolean;
    completedSets?: number;
  }

  interface WorkoutPlan {
    id: string;
    name: string;
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
        title: "Error saving progress",
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
        title: "Workout completed!",
        description: "Great job! Your progress has been saved.",
      });

      // Refresh workout history
      fetchWorkoutHistory();

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error completing workout",
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
              Keep going! You&apos;re doing great.
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
                <CardTitle>{currentExercise.name}</CardTitle>
                <CardDescription>
                  Complete all sets to move to the next exercise
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Weight Used (kg)</label>
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
                    <label className="text-sm font-medium">Sets Completed</label>
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
                    placeholder="Add any notes about this exercise..."
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
                  Complete Exercise
                </Button>
              </CardContent>
            </Card>
          )}

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
                        {exercise.sets} sets × {exercise.reps} reps
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
        <h2 className="text-3xl font-bold tracking-tight">My Workouts</h2>
        <p className="text-muted-foreground">
          View your workout plans and track your progress
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Workouts</CardTitle>
            <CardDescription>
              Your scheduled workouts for today
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
                        {plan.exercises.length} exercises • Approximately {plan.duration} minutes
                      </p>
                    </div>
                  </div>
                  <Button onClick={() => startWorkout(plan)}>
                    Start Workout
                  </Button>
                </div>
              ))}

              {workoutPlans.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  No workouts scheduled for today
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your latest completed workouts
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
              <CardTitle>Progress & Achievements</CardTitle>
              <CardDescription>
                Track your fitness journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Monthly Goal</span>
                    <span className="text-sm text-muted-foreground">15/20 workouts</span>
                  </div>
                  <Progress value={75} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-muted text-center">
                    <Trophy className="h-5 w-5 text-primary mx-auto mb-2" />
                    <div className="font-medium">Level 5</div>
                    <div className="text-sm text-muted-foreground">Fitness Rank</div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted text-center">
                    <MessageSquare className="h-5 w-5 text-primary mx-auto mb-2" />
                    <div className="font-medium">85%</div>
                    <div className="text-sm text-muted-foreground">Completion Rate</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Recent Achievements</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {['🏃‍♂️', '💪', '🎯'].map((emoji, i) => (
                      <div key={i} className="p-2 text-center rounded-lg border">
                        <div className="text-2xl mb-1">{emoji}</div>
                        <div className="text-xs text-muted-foreground">
                          {['First Mile', 'Power Up', 'Goal Setter'][i]}
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