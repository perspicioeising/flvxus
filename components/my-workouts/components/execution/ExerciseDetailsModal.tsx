import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  X,
  Lightbulb,
  AlertTriangle
} from 'lucide-react';

interface ExerciseDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  exercise?: any;
}

export function ExerciseDetailsModal({ isOpen, onClose, exercise }: ExerciseDetailsModalProps) {
  if (!isOpen || !exercise) return null;

  const muscleGroups = exercise.muscle_group || [];
  const equipment = exercise.equipment || [];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:p-4 sm:items-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-800/90 to-slate-900/80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-app-overlay backdrop-blur-xl border border-app-border-accent/50 rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[80vh] overflow-hidden shadow-app-xl">

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-app-border-muted">
          <h3 className="text-lg font-bold text-app-heading">
            Detalhes do Exercício
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-app-text-muted hover:text-app-text-primary hover:bg-app-bg-secondary rounded-xl transition-colors"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          <div className="space-y-4">

            {/* Exercise Name */}
            <div className="text-center">
              <h4 className="text-xl font-bold text-app-heading mb-2">
                {exercise.name}
              </h4>

            </div>

            {/* Video */}
            {exercise.video_url && (
              <div className="relative rounded-xl overflow-hidden bg-app-bg-secondary">
                <video
                  controls
                  className="w-full h-48 object-cover"
                  preload="metadata"
                >
                  <source src={exercise.video_url} type="video/mp4" />
                  Seu navegador não suporta reprodução de vídeo.
                </video>
              </div>
            )}

            {/* Muscle Groups & Equipment */}


            {/* Tips */}
            {exercise.tips?.length > 0 && (
              <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-xl border border-green-200 dark:border-green-800">
                <div className="flex items-start gap-3 mb-3">
                  <Lightbulb className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                  <h5 className="font-semibold text-green-800 dark:text-green-200">Dicas Importantes</h5>
                </div>
                <ul className="space-y-2">
                  {exercise.tips.map((tip: string, index: number) => (
                    <li key={index} className="text-sm text-green-700 dark:text-green-300 flex items-start gap-3">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 shrink-0"></span>
                      <span className="leading-relaxed">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Common Errors */}
            {exercise.common_errors?.length > 0 && (
              <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-800">
                <div className="flex items-start gap-3 mb-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                  <h5 className="font-semibold text-red-800 dark:text-red-200">Erros Comuns - Evite</h5>
                </div>
                <ul className="space-y-2">
                  {exercise.common_errors.map((error: string, index: number) => (
                    <li key={index} className="text-sm text-red-700 dark:text-red-300 flex items-start gap-3">
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2 shrink-0"></span>
                      <span className="leading-relaxed">{error}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="p-4 bg-app-gradient-to-br from-app-bg-secondary to-app-bg-tertiary rounded-xl mt-4">
            {(muscleGroups.length > 0 || equipment.length > 0) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {muscleGroups.length > 0 && (
                  <div>
                    <h5 className="text-xs font-semibold text-app-text-muted uppercase tracking-wider mb-2">
                      Músculos Trabalhados
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
          </div>
        </div>

          {/* Footer */}
          <div className="p-4 border-t border-app-border-muted bg-app-bg-secondary">
            <Button
              onClick={onClose}
              className="w-full bg-app-achievement-workout hover:bg-app-achievement-workout/90 text-white font-semibold rounded-xl py-3"
            >
              Entendi, vamos treinar!
            </Button>
          </div>
        </div>
      </div>
      );
}