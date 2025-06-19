import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  X, 
  Dumbbell, 
  Target, 
  Package, 
  AlertTriangle, 
  Lightbulb,
  Play,
  Volume2,
  ExternalLink
} from 'lucide-react';
import { ExerciseDetailModalProps } from './types';

export function ExerciseDetailModal({ 
  exercise, 
  isOpen, 
  onClose 
}: ExerciseDetailModalProps) {
  if (!exercise) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[100vw] h-[100vh] sm:w-[95vw] sm:max-w-2xl sm:max-h-[90vh] sm:h-auto overflow-y-auto bg-white dark:bg-gray-900 border-0 rounded-none sm:rounded-2xl shadow-2xl p-0 m-0 sm:m-4">
        
        {/* Header */}
        <DialogHeader className="relative p-4 pb-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-10">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl flex items-center justify-center transition-all duration-200"
          >
            <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
          
          <div className="flex items-start gap-3 pr-10">
            <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <Dumbbell className="h-7 w-7 text-white" />
            </div>
            
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg font-bold text-gray-900 dark:text-white mb-1 pr-2">
                {exercise.name}
              </DialogTitle>
              {exercise.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 pr-2">
                  {exercise.description}
                </p>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="p-4 space-y-6 pb-20">
          
          {/* Video Section - Priority on mobile */}
          {exercise.video_url && (
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Play className="h-5 w-5 text-red-600 dark:text-red-400" />
                Demonstração
              </h3>
              
              <div className="relative">
                <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden">
                  {exercise.video_url.includes('youtube') || exercise.video_url.includes('vimeo') ? (
                    <iframe
                      src={exercise.video_url}
                      className="w-full h-full"
                      allowFullScreen
                      title={`Vídeo: ${exercise.name}`}
                    />
                  ) : (
                    <video
                      src={exercise.video_url}
                      controls
                      className="w-full h-full object-cover"
                      title={`Vídeo: ${exercise.name}`}
                    />
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
                  onClick={() => window.open(exercise.video_url, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Abrir em nova aba
                </Button>
              </div>
            </div>
          )}

          {/* Audio Section */}
          {exercise.audio_url && (
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Volume2 className="h-5 w-5 text-red-600 dark:text-red-400" />
                Áudio Explicativo
              </h3>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <audio
                  src={exercise.audio_url}
                  controls
                  className="w-full"
                />
              </div>
            </div>
          )}

          {/* Muscle Groups */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Target className="h-5 w-5 text-red-600 dark:text-red-400" />
              Grupos Musculares
            </h3>
            <div className="flex flex-wrap gap-2">
              {exercise.muscle_group.map((muscle) => (
                <Badge
                  key={muscle}
                  className="px-3 py-1.5 bg-gradient-to-r from-red-50 to-red-100 text-red-800 dark:from-red-900/30 dark:to-red-800/30 dark:text-red-300 border-red-200 dark:border-red-700 text-sm font-medium rounded-lg capitalize"
                >
                  {muscle}
                </Badge>
              ))}
            </div>
          </div>

          {/* Equipment */}
          {exercise.equipment && exercise.equipment.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Package className="h-5 w-5 text-red-600 dark:text-red-400" />
                Equipamentos
              </h3>
              <div className="flex flex-wrap gap-2">
                {exercise.equipment.map((eq) => (
                  <Badge
                    key={eq}
                    className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700 text-sm font-medium rounded-lg capitalize"
                  >
                    {eq}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Tips */}
          {exercise.tips && exercise.tips.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                Dicas de Execução
              </h3>
              <div className="space-y-3">
                {exercise.tips.map((tip, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800"
                  >
                    <div className="w-6 h-6 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-white">{index + 1}</span>
                    </div>
                    <p className="text-sm text-yellow-800 dark:text-yellow-200 leading-relaxed">
                      {tip}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Common Errors */}
          {exercise.common_errors && exercise.common_errors.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                Erros Comuns
              </h3>
              <div className="space-y-3">
                {exercise.common_errors.map((error, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800"
                  >
                    <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <AlertTriangle className="h-3 w-3 text-white" />
                    </div>
                    <p className="text-sm text-orange-800 dark:text-orange-200 leading-relaxed">
                      {error}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Variations */}
          {exercise.variations && exercise.variations.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Variações
              </h3>
              <div className="space-y-2">
                {exercise.variations.map((variation, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800"
                  >
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-white">{index + 1}</span>
                    </div>
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      {variation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions - Fixed at bottom on mobile */}
        <div className="fixed bottom-0 left-0 right-0 sm:relative border-t border-gray-100 dark:border-gray-800 p-4 bg-white dark:bg-gray-900 z-20">
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 h-12 border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 rounded-xl font-semibold"
            >
              Fechar
            </Button>
            {exercise.video_url && (
              <Button
                onClick={() => window.open(exercise.video_url, '_blank')}
                className="flex-1 h-12 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-red-500/25 transition-all duration-300"
              >
                <Play className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Ver Vídeo Completo</span>
                <span className="sm:hidden">Vídeo</span>
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}