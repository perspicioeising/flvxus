import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
  SkipForward,
  Trophy,
  ArrowRight,
  TrendingUp,
  Timer,
  Edit2,
  Save,
  X
} from 'lucide-react';

interface SetConfig {
  set_number: number;
  target_reps: number;
  suggested_weight?: number;
  notes?: string;
}

interface SetTrackerProps {
  exercise: any;
  session: any;
  onSetComplete: (setIndex: number, weight: number, reps: number) => void;
  onExerciseComplete: () => void;
}

export function SetTracker({ exercise, session, onSetComplete, onExerciseComplete }: SetTrackerProps) {
  const [currentWeight, setCurrentWeight] = useState('');
  const [currentReps, setCurrentReps] = useState('');
  const [restTimer, setRestTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [restInterval, setRestInterval] = useState<NodeJS.Timeout | null>(null);
  const [editingSet, setEditingSet] = useState<number | null>(null);
  const [editWeight, setEditWeight] = useState('');
  const [editReps, setEditReps] = useState('');
  const [pendingSaves, setPendingSaves] = useState<{[key: number]: {weight: number, reps: number}}>({});
  
  // Transição suave - estado local para evitar loading
  const [localProgress, setLocalProgress] = useState<any>(null);

  const exerciseProgress = session?.exercises?.find((e: any) => e.exercise_id === exercise.exercise.id) || localProgress;
  const totalSets = exercise.sets;
  const restTime = exercise.rest;
  
  // Calcular série atual - considerar o progresso local também
  const completedSets = localProgress?.sets_completed || exerciseProgress?.weights?.filter((w: any) => w !== undefined && w !== null).length || 0;
  const nextSetIndex = completedSets;
  const isExerciseComplete = completedSets >= totalSets;

  // Configuração das séries
  const setsConfig: SetConfig[] = exercise.sets_config || 
    Array.from({ length: totalSets }, (_, i) => ({
      set_number: i + 1,
      target_reps: exercise.reps,
      suggested_weight: i > 0 ? exerciseProgress?.weights?.[i - 1] : undefined
    }));

  const currentSetConfig = setsConfig[nextSetIndex] || {
    set_number: nextSetIndex + 1,
    target_reps: exercise.reps
  };

  // Auto-preencher valores - melhorar lógica
  useEffect(() => {
    if (isExerciseComplete || isResting) return;

    // Usar progresso local se disponível, senão usar o do exerciseProgress
    const currentProgress = localProgress || exerciseProgress;
    const suggestedWeight = currentSetConfig.suggested_weight;
    const lastWeight = nextSetIndex > 0 ? currentProgress?.weights?.[nextSetIndex - 1] : null;
    
    if (suggestedWeight && !currentWeight) {
      setCurrentWeight(suggestedWeight.toString());
    } else if (lastWeight && !currentWeight) {
      setCurrentWeight(lastWeight.toString());
    }
    
    if (!currentReps) {
      setCurrentReps(currentSetConfig.target_reps.toString());
    }
  }, [nextSetIndex, currentSetConfig, exerciseProgress, localProgress, currentWeight, currentReps, isExerciseComplete, isResting]);

  // Timer de descanso
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isResting && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer(prev => {
          if (prev <= 1) {
            // Tempo acabou - finalizar descanso automaticamente
            finishRest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      setRestInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isResting, restTimer]);

  const handleSetComplete = () => {
    const weight = parseFloat(currentWeight) || 0;
    const reps = parseInt(currentReps) || 0;
    
    // Armazenar dados localmente SEM chamar API ainda
    const newWeights = [...(exerciseProgress?.weights || [])];
    const newReps = [...(exerciseProgress?.reps || [])];
    
    newWeights[nextSetIndex] = weight;
    newReps[nextSetIndex] = reps;
    
    // Armazenar para salvar depois
    setPendingSaves(prev => ({
      ...prev,
      [nextSetIndex]: { weight, reps }
    }));
    
    // Estado local atualizado imediatamente
    setLocalProgress({
      ...exerciseProgress,
      weights: newWeights,
      reps: newReps,
      sets_completed: nextSetIndex + 1
    });
    
    // Verificar se é a última série
    if (nextSetIndex + 1 >= totalSets) {
      // Exercício completo - salvar TODOS os dados pendentes
      setTimeout(async () => {
        // Salvar todas as séries pendentes de uma vez
        for (const [setIndex, data] of Object.entries(pendingSaves)) {
          await onSetComplete(parseInt(setIndex), data.weight, data.reps);
        }
        // Salvar a série atual também
        await onSetComplete(nextSetIndex, weight, reps);
        
        // Limpar pendências
        setPendingSaves({});
        
        // Finalizar exercício
        onExerciseComplete();
      }, 200);
    } else {
      // NÃO é a última série - iniciar descanso
      if (restTime > 0) {
        setRestTimer(restTime);
        setIsResting(true);
      }
      // Se não tem tempo de descanso, a próxima série já estará disponível
    }
    
    // Limpar inputs
    setCurrentWeight('');
    setCurrentReps('');
  };

  const handleEditSet = (setIndex: number) => {
    const weight = exerciseProgress?.weights?.[setIndex];
    const reps = exerciseProgress?.reps?.[setIndex];
    
    setEditingSet(setIndex);
    setEditWeight(weight?.toString() || '');
    setEditReps(reps?.toString() || '');
  };

  const handleSaveEdit = async () => {
    if (editingSet === null) return;
    
    const weight = parseFloat(editWeight) || 0;
    const reps = parseInt(editReps) || 0;
    
    // Atualizar localmente
    const newWeights = [...(exerciseProgress?.weights || [])];
    const newReps = [...(exerciseProgress?.reps || [])];
    
    newWeights[editingSet] = weight;
    newReps[editingSet] = reps;
    
    setLocalProgress({
      ...exerciseProgress,
      weights: newWeights,
      reps: newReps
    });
    
    // Salvar imediatamente para edições (pois já foi completado antes)
    await onSetComplete(editingSet, weight, reps);
    
    // Limpar edição
    setEditingSet(null);
    setEditWeight('');
    setEditReps('');
  };

  const handleCancelEdit = () => {
    setEditingSet(null);
    setEditWeight('');
    setEditReps('');
  };

  const skipRest = () => {
    setIsResting(false);
    setRestTimer(0);
    if (restInterval) {
      clearInterval(restInterval);
      setRestInterval(null);
    }
  };

  // Função para finalizar descanso (seja por tempo ou por pular)
  const finishRest = () => {
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

  const progressPercentage = (completedSets / totalSets) * 100;
  const canCompleteSet = currentWeight && currentReps && !isExerciseComplete && !isResting;

  if (isExerciseComplete) {
    return (
      <Card className="border-0 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800 shadow-app-xl">
        <CardContent className="p-6 text-center">
          <div className="w-20 h-20 bg-app-achievement-consecutive rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <Trophy className="h-10 w-10 text-white" />
          </div>
          <h3 className="text-xl font-bold text-app-heading mb-2">
            Exercício Concluído! 🎉
          </h3>
          <p className="text-app-text-secondary mb-4">
            {totalSets} séries • {(localProgress || exerciseProgress)?.weights?.reduce((sum: number, w: number) => sum + (w || 0), 0) || 0}kg total
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      
      {/* Progress Header */}
      <Card className="border-0 card-app">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-app-achievement-workout rounded-xl flex items-center justify-center">
                <Target className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-app-heading">
                  Série {nextSetIndex + 1} de {totalSets}
                </h3>
                <p className="text-sm text-app-text-secondary">
                  {completedSets} completadas
                </p>
              </div>
            </div>
            
            <Badge className="px-3 py-1 bg-app-achievement-workout text-white rounded-full font-bold">
              {Math.round(progressPercentage)}%
            </Badge>
          </div>
          
          <Progress value={progressPercentage} className="h-2" />
        </CardContent>
      </Card>

      {/* Rest Timer */}
      {isResting && (
        <Card className="border-0 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-app-achievement-exercise rounded-xl flex items-center justify-center animate-pulse">
                  <Timer className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-app-text-primary">Descanso</p>
                  <p className="text-2xl font-bold text-app-achievement-exercise">{formatTime(restTimer)}</p>
                </div>
              </div>
              
              <Button
                onClick={skipRest}
                className="bg-app-btn-primary hover:bg-app-btn-primary-hover text-white font-semibold rounded-xl px-4 py-2"
              >
                <SkipForward className="h-4 w-4 mr-2" />
                Pular
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Set Input */}
      {!isResting && (
        <Card className="border-0 card-app border-2 border-app-achievement-workout/20">
          <CardContent className="p-4">
            
            {/* Set Number */}
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-2 bg-app-bg-secondary rounded-xl px-4 py-2">
                <div className="w-6 h-6 bg-app-achievement-workout rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{currentSetConfig.set_number}</span>
                </div>
                <span className="font-bold text-app-heading">Série {currentSetConfig.set_number}</span>
              </div>
            </div>
            
            {/* Weight and Reps Inputs */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm font-semibold text-app-heading mb-2 block flex items-center gap-2">
                  <Weight className="h-4 w-4 text-app-achievement-workout" />
                  Peso (kg)
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    inputMode="decimal"
                    step="0.5"
                    placeholder="0"
                    value={currentWeight}
                    onChange={(e) => setCurrentWeight(e.target.value)}
                    className="text-center text-xl font-bold bg-app-card border-2 border-app-border-muted focus:border-app-achievement-workout rounded-xl h-14"
                  />
                  {currentSetConfig.suggested_weight && (
                    <div className="absolute -top-1 right-2">
                      <Badge className="px-2 py-0.5 bg-app-achievement-consecutive text-white text-xs rounded-full">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {currentSetConfig.suggested_weight}kg
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-semibold text-app-heading mb-2 block flex items-center gap-2">
                  <Hash className="h-4 w-4 text-app-achievement-workout" />
                  Repetições
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    inputMode="numeric"
                    placeholder={currentSetConfig.target_reps.toString()}
                    value={currentReps}
                    onChange={(e) => setCurrentReps(e.target.value)}
                    className="text-center text-xl font-bold bg-app-card border-2 border-app-border-muted focus:border-app-achievement-workout rounded-xl h-14"
                  />
                  <div className="absolute -top-1 right-2">
                    <Badge className="px-2 py-0.5 bg-app-achievement-exercise text-white text-xs rounded-full">
                      Meta: {currentSetConfig.target_reps}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Preview */}
            {canCompleteSet && (
              <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-xl mb-4 text-center">
                <span className="text-green-700 dark:text-green-300 font-semibold">
                  {currentWeight}kg × {currentReps} reps = {(parseFloat(currentWeight) * parseInt(currentReps) || 0).toFixed(1)}kg
                </span>
              </div>
            )}
            
            {/* Complete Button */}
            <Button
              onClick={handleSetComplete}
              disabled={!canCompleteSet}
              className="w-full bg-app-achievement-workout hover:bg-app-achievement-workout/90 disabled:opacity-50 text-white font-bold rounded-xl py-4 text-lg transition-all duration-200"
            >
              {nextSetIndex === totalSets - 1 ? (
                <>
                  <Trophy className="h-5 w-5 mr-2" />
                  Finalizar Exercício
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  Completar Série {nextSetIndex + 1}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Sets Summary */}
      <Card className="border-0 card-app">
        <CardContent className="p-4">
          <h4 className="font-semibold text-app-heading mb-3">Progresso das Séries</h4>
          
          <div className="space-y-2">
            {setsConfig.map((setConfig, index) => {
              // Usar progresso local se disponível
              const currentProgress = localProgress || exerciseProgress;
              const completed = (currentProgress?.weights?.[index] !== undefined);
              const isCurrent = index === nextSetIndex && !completed && !isResting;
              const weight = currentProgress?.weights?.[index];
              const reps = currentProgress?.reps?.[index];
              const isEditing = editingSet === index;
              
              return (
                <div
                  key={index}
                  className={`p-3 rounded-xl border transition-all duration-300 ${
                    completed 
                      ? 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-950/20' 
                      : isCurrent 
                        ? 'border-app-achievement-workout bg-orange-50 dark:border-orange-700 dark:bg-orange-950/20' 
                        : 'border-app-border-muted bg-app-bg-secondary'
                  }`}
                >
                  {isEditing ? (
                    /* Modo de Edição */
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Edit2 className="h-4 w-4 text-app-achievement-workout" />
                        <span className="font-medium text-app-heading text-sm">
                          Editando Série {setConfig.set_number}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-app-text-muted mb-1 block">Peso (kg)</label>
                          <Input
                            type="number"
                            inputMode="decimal"
                            step="0.5"
                            value={editWeight}
                            onChange={(e) => setEditWeight(e.target.value)}
                            className="text-center font-bold bg-app-card border-app-border-muted focus:border-app-achievement-workout rounded-lg h-10"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-app-text-muted mb-1 block">Repetições</label>
                          <Input
                            type="number"
                            inputMode="numeric"
                            value={editReps}
                            onChange={(e) => setEditReps(e.target.value)}
                            className="text-center font-bold bg-app-card border-app-border-muted focus:border-app-achievement-workout rounded-lg h-10"
                          />
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={handleSaveEdit}
                          size="sm"
                          className="flex-1 bg-app-achievement-workout hover:bg-app-achievement-workout/90 text-white font-semibold rounded-lg py-2"
                        >
                          <Save className="h-3 w-3 mr-1" />
                          Salvar
                        </Button>
                        <Button
                          onClick={handleCancelEdit}
                          variant="outline"
                          size="sm"
                          className="flex-1 bg-app-card border-app-border-muted hover:bg-app-bg-secondary rounded-lg py-2"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* Modo Normal */
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {completed ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : isCurrent ? (
                          <div className="w-5 h-5 border-2 border-app-achievement-workout rounded-full animate-pulse">
                            <div className="w-1 h-1 bg-app-achievement-workout rounded-full m-1"></div>
                          </div>
                        ) : (
                          <Circle className="h-5 w-5 text-app-text-muted" />
                        )}
                        
                        <span className="font-medium text-app-heading">
                          Série {setConfig.set_number}
                        </span>
                        
                        {isCurrent && !isResting && (
                          <Badge className="px-2 py-0.5 bg-app-achievement-workout text-white text-xs rounded-full">
                            ATUAL
                          </Badge>
                        )}
                        
                        {isCurrent && isResting && (
                          <Badge className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full animate-pulse">
                            DESCANSO
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {completed && (
                          <>
                            <div className="text-right">
                              <span className="font-bold text-app-achievement-consecutive">
                                {weight}kg × {reps}
                              </span>
                            </div>
                            <Button
                              onClick={() => handleEditSet(index)}
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-app-bg-secondary rounded-lg"
                            >
                              <Edit2 className="h-3 w-3 text-app-text-muted" />
                            </Button>
                          </>
                        )}
                      </div>
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