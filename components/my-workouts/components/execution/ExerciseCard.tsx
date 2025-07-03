// components/my-workouts/components/execution/ExerciseCard.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dumbbell, 
  Target, 
  Clock,
  Volume2,
  Play,
  Info,
  MessageSquare,
  Star,
  AlertTriangle,
  Lightbulb,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Activity,
  Zap
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
  onComplete, 
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
    onNotesChange(value);
  };

  const handleDifficultyChange = (rating: number) => {
    setDifficultyRating(rating);
    onDifficultyRating(rating);
  };

  const playAudio = () => {
    if (exercise.exercise.audio_url) {
      const audio = new Audio(exercise.exercise.audio_url);
      setIsPlaying(true);
      audio.play();
      audio.onended = () => setIsPlaying(false);
    }
  };

  const muscleGroups = exercise.exercise.muscle_group || [];
  const equipment = exercise.exercise.equipment || [];

  return (
    <div className="space-y-4">
      
      {/* Header Card */}
      <Card className="border-0 card-app">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Badge className="px-3 py-1 bg-app-achievement-workout text-white rounded-full font-bold">
                  {exerciseNumber} de {totalExercises}
                </Badge>
                
                {exercise.exercise.audio_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={playAudio}
                    disabled={isPlaying}
                    className="h-8 px-3 rounded-xl border-app-border-muted hover:bg-app-bg-secondary"
                  >
                    <Volume2 className="h-3 w-3 mr-2" />
                    {isPlaying ? 'Tocando...' : 'Áudio'}
                  </Button>
                )}
              </div>
              
              <h2 className="text-2xl font-bold text-app-heading mb-2">
                {exercise.exercise.name}
              </h2>
              
              {exercise.exercise.description && (
                <p className="text-sm text-app-text-secondary line-clamp-3 leading-relaxed">
                  {exercise.exercise.description}
                </p>
              )}
            </div>

            <div className="ml-4">
              <div className="w-16 h-16 bg-gradient-to-br from-app-achievement-workout to-orange-600 rounded-2xl flex items-center justify-center shadow-app-medium">
                <Dumbbell className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card className="border-0 card-app">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-app-bg-secondary rounded-xl">
              <Target className="h-6 w-6 text-app-achievement-workout mx-auto mb-2" />
              <p className="text-xs text-app-text-muted uppercase tracking-wider mb-1">Séries</p>
              <p className="text-2xl font-bold text-app-heading">{exercise.sets}</p>
            </div>
            
            <div className="text-center p-4 bg-app-bg-secondary rounded-xl">
              <RotateCcw className="h-6 w-6 text-app-achievement-workout mx-auto mb-2" />
              <p className="text-xs text-app-text-muted uppercase tracking-wider mb-1">Reps</p>
              <p className="text-2xl font-bold text-app-heading">{exercise.reps}</p>
            </div>
            
            <div className="text-center p-4 bg-app-bg-secondary rounded-xl">
              <Clock className="h-6 w-6 text-app-achievement-workout mx-auto mb-2" />
              <p className="text-xs text-app-text-muted uppercase tracking-wider mb-1">Descanso</p>
              <p className="text-2xl font-bold text-app-heading">{exercise.rest}s</p>
            </div>
            
            <div className="text-center p-4 bg-app-bg-secondary rounded-xl">
              <Activity className="h-6 w-6 text-app-achievement-workout mx-auto mb-2" />
              <p className="text-xs text-app-text-muted uppercase tracking-wider mb-1">Músculos</p>
              <p className="text-2xl font-bold text-app-heading">{muscleGroups.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Muscle Groups & Equipment */}
      <Card className="border-0 card-app">
        <CardContent className="p-4 space-y-4">
          {muscleGroups.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-app-heading mb-3 flex items-center gap-2">
                <Target className="h-4 w-4 text-app-achievement-workout" />
                Músculos Trabalhados
              </h4>
              <div className="flex flex-wrap gap-2">
                {muscleGroups.map((muscle: string, index: number) => (
                  <Badge key={index} className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
                    {muscle}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {equipment.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-app-heading mb-3 flex items-center gap-2">
                <Dumbbell className="h-4 w-4 text-app-achievement-workout" />
                Equipamentos
              </h4>
              <div className="flex flex-wrap gap-2">
                {equipment.map((item: string, index: number) => (
                  <Badge key={index} className="px-3 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded-full">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Personal Notes */}
      {exercise.notes && (
        <Card className="border-0 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                <Info className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                  Observações do Personal
                </h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 leading-relaxed">
                  {exercise.notes}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Video Player */}
      {exercise.exercise.video_url && (
        <Card className="border-0 card-app">
          <CardContent className="p-4">
            <h4 className="font-semibold text-app-heading mb-3 flex items-center gap-2">
              <Play className="h-4 w-4 text-app-achievement-workout" />
              Demonstração
            </h4>
            <div className="rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
              <video
                controls
                className="w-full h-48 sm:h-64 object-cover"
                poster="/placeholder-video-thumbnail.jpg"
              >
                <source src={exercise.exercise.video_url} type="video/mp4" />
                Seu navegador não suporta reprodução de vídeo.
              </video>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expandable Details */}
      <Card className="border-0 card-app">
        <CardContent className="p-4">
          <Button
            variant="ghost"
            onClick={() => setShowDetails(!showDetails)}
            className="w-full justify-between text-app-text-primary hover:bg-app-bg-secondary rounded-xl p-4"
          >
            <span className="flex items-center gap-2 font-semibold">
              <Info className="h-4 w-4" />
              Dicas e Detalhes Técnicos
            </span>
            {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>

          {showDetails && (
            <div className="mt-4 space-y-4">
              {/* Tips */}
              {exercise.exercise.tips && exercise.exercise.tips.length > 0 && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                  <div className="flex items-start gap-3 mb-3">
                    <Lightbulb className="h-5 w-5 text-green-600 mt-0.5" />
                    <h4 className="font-semibold text-green-800 dark:text-green-200">Dicas de Execução</h4>
                  </div>
                  <ul className="space-y-2">
                    {exercise.exercise.tips.map((tip: string, index: number) => (
                      <li key={index} className="text-sm text-green-700 dark:text-green-300 flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Common Errors */}
              {exercise.exercise.common_errors && exercise.exercise.common_errors.length > 0 && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                  <div className="flex items-start gap-3 mb-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                    <h4 className="font-semibold text-red-800 dark:text-red-200">Erros Comuns</h4>
                  </div>
                  <ul className="space-y-2">
                    {exercise.exercise.common_errors.map((error: string, index: number) => (
                      <li key={index} className="text-sm text-red-700 dark:text-red-300 flex items-start gap-2">
                        <span className="text-red-500 mt-1">•</span>
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

      {/* Notes and Difficulty - Compact */}
      <Card className="border-0 card-app">
        <CardContent className="p-4">
          <Button
            variant="ghost"
            onClick={() => setShowNotes(!showNotes)}
            className="w-full justify-between text-app-text-primary hover:bg-app-bg-secondary rounded-xl p-4"
          >
            <span className="flex items-center gap-2 font-semibold">
              <MessageSquare className="h-4 w-4" />
              Suas Observações & Avaliação
            </span>
            {showNotes ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>

          {showNotes && (
            <div className="mt-4 space-y-4">
              {/* Personal Notes */}
              <div>
                <label className="text-sm font-semibold text-app-heading mb-2 block">
                  Observações Pessoais:
                </label>
                <Textarea
                  placeholder="Como foi este exercício? Anote suas impressões..."
                  value={notes}
                  onChange={(e) => handleNotesChange(e.target.value)}
                  className="min-h-[80px] bg-app-card border-app-border-muted focus:border-app-achievement-workout rounded-xl"
                />
              </div>

              {/* Difficulty Rating */}
              <div>
                <label className="text-sm font-semibold text-app-heading mb-3 block">
                  Dificuldade:
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {DIFFICULTY_LEVELS.map((level) => (
                    <Button
                      key={level.value}
                      variant={difficultyRating === level.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleDifficultyChange(level.value)}
                      className={`flex-1 p-3 ${
                        difficultyRating === level.value 
                          ? 'bg-app-achievement-workout text-white border-app-achievement-workout' 
                          : 'border-app-border-muted hover:bg-app-bg-secondary'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-lg">{level.emoji}</div>
                        <div className="text-xs font-semibold">{level.value}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}