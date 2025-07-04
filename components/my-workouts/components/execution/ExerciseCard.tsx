import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dumbbell,
  Target,
  Clock,
  Volume2,
  Info,
  RotateCcw,
  Activity
} from 'lucide-react';

interface ExerciseCardProps {
  exercise: any;
  exerciseNumber: number;
  totalExercises: number;
  onShowDetails: () => void;
}

export function ExerciseCard({
  exercise,
  exerciseNumber,
  totalExercises,
  onShowDetails
}: ExerciseCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const playAudio = () => {
    if (!exercise.exercise.audio_url || isPlaying) return;

    try {
      const audio = new Audio(exercise.exercise.audio_url);
      setIsPlaying(true);
      audio.play();
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => setIsPlaying(false);
    } catch (error) {
      setIsPlaying(false);
    }
  };

  const muscleGroups = exercise.exercise.muscle_group || [];

  return (
    <div className="space-y-4">
{exercise.notes && (
        <Card className="border-0 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-1">
                  Observação
                </h4>
                <p className="text-sm text-amber-700 dark:text-amber-300 leading-relaxed">
                  {exercise.notes}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      {/* Main Exercise Info */}
      <Card className="border-0 card-app">
        <CardContent className="p-4">
          {/* Nome + Total de Exercícios na mesma linha */}
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-app-heading leading-tight">
              {exercise.exercise.name}
            </h2>
            <Badge className="px-2 py-1 bg-app-achievement-workout text-white rounded-full text-xs font-bold">
              {exerciseNumber}/{totalExercises}
            </Badge>
          </div>

          {/* Botões de Áudio e Detalhes */}
          <div className="flex items-center gap-2 mb-4">
            {exercise.exercise.audio_url && (
              <button
                onClick={playAudio}
                disabled={isPlaying}
                className="h-7 px-2 text-xs border border-app-border-muted hover:bg-app-bg-secondary rounded-lg disabled:opacity-50 flex items-center gap-1 transition-colors"
              >
                <Volume2 className="h-3 w-3" />
                {isPlaying ? 'Tocando' : 'Áudio'}
              </button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={onShowDetails}
              className="h-7 px-2 text-xs border border-app-border-muted hover:bg-app-bg-secondary rounded-lg flex items-center gap-1 transition-colors"
            >
              <Info className="h-3 w-3" />
              Detalhes
            </Button>
          </div>

          {/* Stats Compactos - Informações Essenciais */}
          <div className="grid grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-app-bg-secondary rounded-xl">
              <Target className="h-5 w-5 text-app-achievement-exercise mx-auto mb-1" />
              <p className="text-xs text-app-text-muted font-medium">Séries</p>
              <p className="text-lg font-bold text-app-heading">{exercise.sets}</p>
            </div>

            <div className="p-3 bg-app-bg-secondary rounded-xl">
              <RotateCcw className="h-5 w-5 text-app-achievement-consecutive mx-auto mb-1" />
              <p className="text-xs text-app-text-muted font-medium">Reps</p>
              <p className="text-lg font-bold text-app-heading">{exercise.reps}</p>
            </div>

            <div className="p-3 bg-app-bg-secondary rounded-xl">
              <Clock className="h-5 w-5 text-app-achievement-workout mx-auto mb-1" />
              <p className="text-xs text-app-text-muted font-medium">Descanso</p>
              <p className="text-lg font-bold text-app-heading">{exercise.rest}s</p>
            </div>

            <div className="p-3 bg-app-bg-secondary rounded-xl">
              <Activity className="h-5 w-5 text-app-achievement-weight mx-auto mb-1" />
              <p className="text-xs text-app-text-muted font-medium">Músculos</p>
              <p className="text-lg font-bold text-app-heading">{muscleGroups.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>    
    </div>
  );
}