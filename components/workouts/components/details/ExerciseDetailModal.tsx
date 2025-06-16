
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border-0 rounded-3xl shadow-2xl">
        
        {/* Header */}
        <DialogHeader className="relative p-6 pb-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl flex items-center justify-center transition-all duration-300"
          >
            <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
          
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Dumbbell className="h-10 w-10 text-white" />
            </div>
            
            <div className="flex-1">
              <DialogTitle className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                {exercise.name}
              </DialogTitle>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {exercise.description}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-8">
          
          {/* Media Section */}
          {(exercise.video_url || exercise.audio_url) && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Play className="h-5 w-5 text-red-600 dark:text-red-400" />
                Demonstração
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {exercise.video_url && (
                  <div className="relative">
                    <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden">
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
                      className="mt-2 text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => window.open(exercise.video_url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Abrir em nova aba
                    </Button>
                  </div>
                )}
                
                {exercise.audio_url && (
                  <div className="space-y-3">
                    <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                          <Volume2 className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-blue-800 dark:text-blue-300">Áudio Explicativo</h4>
                          <p className="text-sm text-blue-600 dark:text-blue-400">Instruções em áudio</p>
                        </div>
                      </div>
                      <audio
                        src={exercise.audio_url}
                        controls
                        className="w-full"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Muscle Groups */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
              Grupos Musculares
            </h3>
            <div className="flex flex-wrap gap-3">
              {exercise.muscle_group.map((muscle) => (
                <Badge
                  key={muscle}
                  className="px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-300 border-green-200 dark:border-green-600 text-sm font-semibold rounded-xl"
                >
                  {muscle}
                </Badge>
              ))}
            </div>
          </div>

          {/* Equipment */}
          {exercise.equipment && exercise.equipment.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Equipamentos Necessários
              </h3>
              <div className="flex flex-wrap gap-3">
                {exercise.equipment.map((eq) => (
                  <Badge
                    key={eq}
                    className="px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 dark:from-blue-900/30 dark:to-indigo-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-600 text-sm font-semibold rounded-xl"
                  >
                    {eq}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Tips */}
          {exercise.tips && exercise.tips.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                Dicas de Execução
              </h3>
              <div className="space-y-3">
                {exercise.tips.map((tip, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl border border-yellow-200 dark:border-yellow-700"
                  >
                    <div className="w-6 h-6 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
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
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                Erros Comuns
              </h3>
              <div className="space-y-3">
                {exercise.common_errors.map((error, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl border border-red-200 dark:border-red-700"
                  >
                    <div className="w-6 h-6 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <AlertTriangle className="h-3 w-3 text-white" />
                    </div>
                    <p className="text-sm text-red-800 dark:text-red-200 leading-relaxed">
                      {error}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Variations */}
          {exercise.variations && exercise.variations.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                Variações
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {exercise.variations.map((variation, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-700"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <span className="text-xs font-bold text-white">{index + 1}</span>
                      </div>
                      <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                        {variation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
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
                Ver Vídeo Completo
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}