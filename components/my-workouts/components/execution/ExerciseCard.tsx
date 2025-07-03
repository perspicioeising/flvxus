import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dumbbell, 
  Target, 
  Clock,
  Volume2,
  Info,
  MessageSquare,
  AlertTriangle,
  Lightbulb,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Activity,
  Award
} from 'lucide-react';
import { DIFFICULTY_LEVELS } from '../../constants';

interface ExerciseCardProps {
  exercise: any;
  exerciseNumber: number;
  totalExercises: number;
  onComplete: () => void;
  onNotesChange: (notes: string) => void;
  onDifficultyRating: (rating: number) => void;
}

export function ExerciseCard({ 
  exercise, 
  exerciseNumber, 
  totalExercises, 
  onNotesChange,
  onDifficultyRating 
}: ExerciseCardProps) {
  const [notes, setNotes] = useState('');
  const [difficultyRating, setDifficultyRating] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleNotesChange = (value: string) => {
    setNotes(value);
    // Debounce simples para evitar muitas chamadas
    setTimeout(() => onNotesChange(value), 300);
  };

  const handleDifficultyClick = (rating: number) => {
    setDifficultyRating(rating);
    onDifficultyRating(rating);
  };

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
  const equipment = exercise.exercise.equipment || [];

  return (
    <div className="space-y-4">
      
      {/* Main Exercise Info */}
      <Card className="border-0 card-app">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-app-achievement-workout rounded-xl flex items-center justify-center shrink-0">
              <Dumbbell className="h-6 w-6 text-white" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="px-2 py-1 bg-app-achievement-workout text-white rounded-full text-xs font-bold">
                  {exerciseNumber}/{totalExercises}
                </Badge>
                
                {exercise.exercise.audio_url && (
                  <button
                    onClick={playAudio}
                    disabled={isPlaying}
                    className="h-7 px-2 text-xs border border-app-border-muted hover:bg-app-bg-secondary rounded-lg disabled:opacity-50 flex items-center gap-1"
                  >
                    <Volume2 className="h-3 w-3" />
                    {isPlaying ? 'Tocando' : 'Áudio'}
                  </button>
                )}
              </div>
              
              <h2 className="text-xl font-bold text-app-heading mb-2 leading-tight">
                {exercise.exercise.name}
              </h2>
              
              {exercise.exercise.description && (
                <p className="text-sm text-app-text-secondary line-clamp-2 leading-relaxed">
                  {exercise.exercise.description}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card className="border-0 card-app">
        <CardContent className="p-4">
          <div className="grid grid-cols-4 gap-3 text-center">
            <div className="p-2">
              <Target className="h-5 w-5 text-app-achievement-exercise mx-auto mb-1" />
              <p className="text-xs text-app-text-muted font-medium">Séries</p>
              <p className="text-lg font-bold text-app-heading">{exercise.sets}</p>
            </div>
            
            <div className="p-2">
              <RotateCcw className="h-5 w-5 text-app-achievement-consecutive mx-auto mb-1" />
              <p className="text-xs text-app-text-muted font-medium">Reps</p>
              <p className="text-lg font-bold text-app-heading">{exercise.reps}</p>
            </div>
            
            <div className="p-2">
              <Clock className="h-5 w-5 text-app-achievement-workout mx-auto mb-1" />
              <p className="text-xs text-app-text-muted font-medium">Descanso</p>
              <p className="text-lg font-bold text-app-heading">{exercise.rest}s</p>
            </div>
            
            <div className="p-2">
              <Activity className="h-5 w-5 text-app-achievement-weight mx-auto mb-1" />
              <p className="text-xs text-app-text-muted font-medium">Músculos</p>
              <p className="text-lg font-bold text-app-heading">{muscleGroups.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Notes from Trainer */}
      {exercise.notes && (
        <Card className="border-0 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-1">
                  Observação do Personal
                </h4>
                <p className="text-sm text-amber-700 dark:text-amber-300 leading-relaxed">
                  {exercise.notes}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Video */}
      {exercise.exercise.video_url && (
        <Card className="border-0 card-app">
          <CardContent className="p-4">
            <div className="relative rounded-xl overflow-hidden bg-app-bg-secondary">
              <video
                controls
                className="w-full h-48 object-cover"
                preload="metadata"
              >
                <source src={exercise.exercise.video_url} type="video/mp4" />
                Seu navegador não suporta reprodução de vídeo.
              </video>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expandable Details */}
      {(exercise.exercise.tips?.length > 0 || exercise.exercise.common_errors?.length > 0 || muscleGroups.length > 0 || equipment.length > 0) && (
        <Card className="border-0 card-app">
          <CardContent className="p-4">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full justify-between text-app-text-primary hover:bg-app-bg-secondary rounded-xl p-3 flex items-center"
            >
              <span className="flex items-center gap-2 font-medium">
                <Info className="h-4 w-4 text-app-achievement-workout" />
                Detalhes do Exercício
              </span>
              {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {showDetails && (
              <div className="mt-4 space-y-4">
                
                {/* Muscle Groups & Equipment */}
                {(muscleGroups.length > 0 || equipment.length > 0) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {muscleGroups.length > 0 && (
                      <div>
                        <h5 className="text-xs font-semibold text-app-text-muted uppercase tracking-wider mb-2">
                          Músculos
                        </h5>
                        <div className="flex flex-wrap gap-1">
                          {muscleGroups.map((muscle: string, index: number) => (
                            <Badge key={index} className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-xs">
                              {muscle}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {equipment.length > 0 && (
                      <div>
                        <h5 className="text-xs font-semibold text-app-text-muted uppercase tracking-wider mb-2">
                          Equipamentos
                        </h5>
                        <div className="flex flex-wrap gap-1">
                          {equipment.map((item: string, index: number) => (
                            <Badge key={index} className="px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 rounded-full text-xs">
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Tips */}
                {exercise.exercise.tips?.length > 0 && (
                  <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-xl">
                    <div className="flex items-start gap-2 mb-2">
                      <Lightbulb className="h-4 w-4 text-green-600 mt-0.5" />
                      <h5 className="font-semibold text-green-800 dark:text-green-200 text-sm">Dicas</h5>
                    </div>
                    <ul className="space-y-1">
                      {exercise.exercise.tips.map((tip: string, index: number) => (
                        <li key={index} className="text-xs text-green-700 dark:text-green-300 flex items-start gap-2">
                          <span className="w-1 h-1 bg-green-500 rounded-full mt-2 shrink-0"></span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Common Errors */}
                {exercise.exercise.common_errors?.length > 0 && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-xl">
                    <div className="flex items-start gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                      <h5 className="font-semibold text-red-800 dark:text-red-200 text-sm">Evite</h5>
                    </div>
                    <ul className="space-y-1">
                      {exercise.exercise.common_errors.map((error: string, index: number) => (
                        <li key={index} className="text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
                          <span className="w-1 h-1 bg-red-500 rounded-full mt-2 shrink-0"></span>
                          <span>{error}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Notes and Rating */}
      <Card className="border-0 card-app">
        <CardContent className="p-4">
          <button
            onClick={() => setShowNotes(!showNotes)}
            className="w-full justify-between text-app-text-primary hover:bg-app-bg-secondary rounded-xl p-3 flex items-center"
          >
            <span className="flex items-center gap-2 font-medium">
              <MessageSquare className="h-4 w-4 text-app-achievement-workout" />
              Suas Anotações
            </span>
            {showNotes ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {showNotes && (
            <div className="mt-4 space-y-4">
              
              {/* Difficulty Rating */}
              <div>
                <label className="text-sm font-semibold text-app-heading mb-2 block">
                  Como foi a dificuldade?
                </label>
                <div className="flex gap-2">
                  {DIFFICULTY_LEVELS.map((level) => (
                    <button
                      key={level.value}
                      onClick={() => handleDifficultyClick(level.value)}
                      className={`w-12 h-12 rounded-xl border-2 transition-all duration-200 ${
                        difficultyRating === level.value 
                          ? 'bg-app-achievement-workout text-white border-app-achievement-workout' 
                          : 'border-app-border-muted hover:bg-app-bg-secondary'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-lg">{level.emoji}</div>
                        <div className="text-xs font-bold">{level.value}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-sm font-semibold text-app-heading mb-2 block">
                  Observações pessoais:
                </label>
                <Textarea
                  placeholder="Como foi este exercício? Dificuldades, melhorias..."
                  value={notes}
                  onChange={(e) => handleNotesChange(e.target.value)}
                  className="min-h-[80px] bg-app-card border-app-border-muted focus:border-app-achievement-workout rounded-xl text-sm resize-none"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}