// components/my-workouts/components/execution/SetTracker.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  Circle, 
  Target,
  Hash,
  Weight,
  Timer,
  Play,
  Pause,
  SkipForward,
  Trophy,
  Zap,
  ArrowRight
} from 'lucide-react';

interface SetTrackerProps {
  exercise: any;
  session: any;
  onSetComplete: (setIndex: number, weight: number, reps: number) => void;
  onExerciseComplete: () => void;
}

export function SetTracker({ exercise, session, onSetComplete, onExerciseComplete }: SetTrackerProps) {
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [currentWeight, setCurrentWeight] = useState('');
  const [currentReps, setCurrentReps] = useState('');
  const [restTimer, setRestTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [restInterval, setRestInterval] = useState<NodeJS.Timeout | null>(null);

  const exerciseProgress = session.exercises.find((e: any) => e.exercise_id === exercise.exercise.id);
  const totalSets = exercise.sets;
  const suggestedReps = exercise.reps;
  const restTime = exercise.rest;

  // Auto-populate com valores anteriores se disponível
  useEffect(() => {
    const lastWeight = exerciseProgress?.weights?.[currentSetIndex - 1];
    const lastReps = exerciseProgress?.reps?.[currentSetIndex - 1];
    
    if (currentSetIndex > 0 && lastWeight) {
      setCurrentWeight(lastWeight.toString());
    }
    if (suggestedReps) {
      setCurrentReps(suggestedReps.toString());
    }
  }, [currentSetIndex, exerciseProgress, suggestedReps]);

  const handleSetComplete = () => {
    const weight = parseFloat(currentWeight) || 0;
    const reps = parseInt(currentReps) || 0;
    
    onSetComplete(currentSetIndex, weight, reps);
    
    // Avançar para próxima série
    if (currentSetIndex < totalSets - 1) {
      setCurrentSetIndex(prev => prev + 1);
      startRestTimer();
    } else {
      // Último set completado - pequeno delay para feedback visual
      setTimeout(() => {
        onExerciseComplete();
      }, 800);
    }
    
    // Limpar apenas reps, manter peso para próxima série
    setCurrentReps('');
  };

  const startRestTimer = () => {
    setRestTimer(restTime);
    setIsResting(true);
    
    const interval = setInterval(() => {
      setRestTimer(prev => {
        if (prev <= 1) {
          setIsResting(false);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    setRestInterval(interval);
  };

  const skipRest = () => {
    setIsResting(false);
    setRestTimer(0);
    if (restInterval) {
      clearInterval(restInterval);
      setRestInterval(null);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isSetCompleted = (setIndex: number) => {
    return exerciseProgress?.weights?.[setIndex] !== undefined;
  };

  const canCompleteSet = currentWeight && currentReps;
  const progressPercentage = ((currentSetIndex + (canCompleteSet ? 1 : 0)) / totalSets) * 100;

  return (
    <div className="space-y-4">
      
      {/* Header com Progresso */}
      <Card className="border-0 card-app">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-app-achievement-workout rounded-xl flex items-center justify-center">
                <Target className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-app-heading">Progresso das Séries</h3>
                <p className="text-sm text-app-text-secondary">
                  Série {currentSetIndex + 1} de {totalSets}
                </p>
              </div>
            </div>
            
            <Badge className="px-3 py-1 bg-app-achievement-workout text-white rounded-full font-bold">
              {Math.round(progressPercentage)}%
            </Badge>
          </div>
          
          <Progress value={progressPercentage} className="h-2 mb-3" />
          
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-xs text-app-text-muted">Completas</p>
              <p className="text-lg font-bold text-green-600">{currentSetIndex}</p>
            </div>
            <div>
              <p className="text-xs text-app-text-muted">Restantes</p>
              <p className="text-lg font-bold text-app-heading">{totalSets - currentSetIndex}</p>
            </div>
            <div>
              <p className="text-xs text-app-text-muted">Meta Reps</p>
              <p className="text-lg font-bold text-app-achievement-workout">{suggestedReps}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rest Timer */}
      {isResting && (
        <Card className="border-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center animate-pulse">
                  <Timer className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-blue-800 dark:text-blue-200">Descanso</p>
                  <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{formatTime(restTimer)}</p>
                </div>
              </div>
              
              <Button
                onClick={skipRest}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
              >
                <SkipForward className="h-4 w-4 mr-2" />
                Pular
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Set Input */}
      {currentSetIndex < totalSets && !isResting && (
        <Card className="border-0 card-app border-2 border-app-achievement-workout/20">
          <CardContent className="p-4">
            <div className="text-center mb-4">
              <h4 className="text-lg font-bold text-app-heading">
                Série {currentSetIndex + 1}
              </h4>
              <p className="text-sm text-app-text-secondary">
                Meta: <span className="font-semibold text-app-achievement-workout">{suggestedReps} repetições</span>
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-app-heading flex items-center gap-2">
                  <Weight className="h-4 w-4 text-app-achievement-workout" />
                  Peso (kg)
                </label>
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder="0"
                  value={currentWeight}
                  onChange={(e) => setCurrentWeight(e.target.value)}
                  className="text-center text-xl font-bold bg-white dark:bg-gray-800 border-2 border-app-border-muted focus:border-app-achievement-workout rounded-xl h-14"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-app-heading flex items-center gap-2">
                  <Hash className="h-4 w-4 text-app-achievement-workout" />
                  Repetições
                </label>
                <Input
                  type="number"
                  inputMode="numeric"
                  placeholder={suggestedReps.toString()}
                  value={currentReps}
                  onChange={(e) => setCurrentReps(e.target.value)}
                  className="text-center text-xl font-bold bg-white dark:bg-gray-800 border-2 border-app-border-muted focus:border-app-achievement-workout rounded-xl h-14"
                />
              </div>
            </div>
            
            {/* Preview da série */}
            {canCompleteSet && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl mb-4 border border-green-200 dark:border-green-800">
                <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-300">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="font-semibold">
                    {currentWeight}kg × {currentReps} repetições
                  </span>
                </div>
              </div>
            )}
            
            <Button
              onClick={handleSetComplete}
              disabled={!canCompleteSet}
              className="w-full bg-gradient-to-r from-app-achievement-workout to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold rounded-xl shadow-app-medium hover:shadow-orange-500/25 transition-all duration-300 py-4 text-lg"
            >
              {currentSetIndex === totalSets - 1 ? (
                <>
                  <Trophy className="h-5 w-5 mr-2" />
                  Finalizar Exercício
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  Completar Série
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Exercise Completed */}
      {currentSetIndex >= totalSets && (
        <Card className="border-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-200 dark:border-green-800">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-bounce">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-green-800 dark:text-green-200 mb-2">
              Exercício Concluído! 🎉
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300 mb-4">
              Parabéns! Você completou todas as {totalSets} séries deste exercício.
            </p>
            
            {/* Resumo rápido */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-xs text-green-600 dark:text-green-400">Séries</p>
                <p className="text-lg font-bold text-green-800 dark:text-green-200">{totalSets}</p>
              </div>
              <div>
                <p className="text-xs text-green-600 dark:text-green-400">Peso Total</p>
                <p className="text-lg font-bold text-green-800 dark:text-green-200">
                  {exerciseProgress?.weights?.reduce((sum: number, w: number) => sum + (w || 0), 0) || 0}kg
                </p>
              </div>
              <div>
                <p className="text-xs text-green-600 dark:text-green-400">Total Reps</p>
                <p className="text-lg font-bold text-green-800 dark:text-green-200">
                  {exerciseProgress?.reps?.reduce((sum: number, r: number) => sum + (r || 0), 0) || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sets Grid (Visual Progress) */}
      <Card className="border-0 card-app">
        <CardContent className="p-4">
          <h4 className="font-semibold text-app-heading mb-3 flex items-center gap-2">
            <Zap className="h-4 w-4 text-app-achievement-workout" />
            Histórico das Séries
          </h4>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: totalSets }, (_, index) => {
              const completed = isSetCompleted(index);
              const isCurrent = index === currentSetIndex && currentSetIndex < totalSets;
              const weight = exerciseProgress?.weights?.[index];
              const reps = exerciseProgress?.reps?.[index];
              
              return (
                <div
                  key={index}
                  className={`p-3 rounded-xl border-2 transition-all duration-300 ${
                    completed 
                      ? 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/20' 
                      : isCurrent 
                        ? 'border-app-achievement-workout bg-orange-50 dark:border-orange-700 dark:bg-orange-900/20 ring-2 ring-app-achievement-workout/20' 
                        : 'border-app-border-muted bg-app-bg-secondary'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {completed ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : isCurrent ? (
                        <Circle className="h-4 w-4 text-app-achievement-workout animate-pulse" />
                      ) : (
                        <Circle className="h-4 w-4 text-app-text-muted" />
                      )}
                      
                      <span className="text-sm font-semibold text-app-heading">
                        {index + 1}
                      </span>
                    </div>
                    
                    {isCurrent && (
                      <Badge className="px-1 py-0.5 bg-app-achievement-workout text-white text-xs rounded">
                        Atual
                      </Badge>
                    )}
                  </div>
                  
                  {completed && (
                    <div className="text-center">
                      <p className="text-sm font-bold text-green-700 dark:text-green-300">
                        {weight}kg
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400">
                        {reps} reps
                      </p>
                    </div>
                  )}
                  
                  {isCurrent && !completed && (
                    <div className="text-center">
                      <p className="text-xs text-app-achievement-workout font-semibold">
                        Em andamento...
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}