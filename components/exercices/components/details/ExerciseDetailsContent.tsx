// components/exercises/details/ExerciseDetailsContent.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Exercise } from '@/components/exercices/types/exercise';
import { 
  FileText, 
  Video, 
  Volume2, 
  RefreshCw, 
  Lightbulb, 
  AlertTriangle,
  Play,
  ExternalLink
} from 'lucide-react';

interface ExerciseDetailsContentProps {
  exercise: Exercise;
}

export function ExerciseDetailsContent({ exercise }: ExerciseDetailsContentProps) {
  
  const handleVideoClick = () => {
    if (exercise.video_url) {
      window.open(exercise.video_url, '_blank');
    }
  };

  const isYouTubeUrl = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  const getYouTubeThumbnail = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
  };

  return (
    <div className="space-y-8">
      
      {/* Descrição Principal */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-500/20 to-blue-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <Card className="relative border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute inset-[1px] bg-white dark:bg-gray-900 rounded-2xl"></div>

          <CardHeader className="relative pb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl shadow-md">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                Descrição do Exercício
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent className="relative">
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {exercise.description}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid de Mídia */}
      {(exercise.video_url || exercise.audio_url) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Vídeo */}
          {exercise.video_url && (
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 via-pink-500/20 to-red-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <Card className="relative border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-pink-500 to-red-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-[1px] bg-white dark:bg-gray-900 rounded-2xl"></div>

                <CardHeader className="relative pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg shadow-md">
                        <Video className="h-5 w-5 text-white" />
                      </div>
                      <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                        Vídeo Demonstrativo
                      </CardTitle>
                    </div>
                    <button
                      onClick={handleVideoClick}
                      className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <ExternalLink className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                </CardHeader>

                <CardContent className="relative p-0">
                  {isYouTubeUrl(exercise.video_url) ? (
                    <div 
                      className="relative aspect-video bg-gray-900 rounded-b-2xl overflow-hidden cursor-pointer group/video"
                      onClick={handleVideoClick}
                    >
                      <img
                        src={getYouTubeThumbnail(exercise.video_url) || '/api/placeholder/640/360'}
                        alt="Thumbnail do vídeo"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover/video:bg-black/50 transition-colors">
                        <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg group-hover/video:scale-110 transition-transform">
                          <Play className="h-8 w-8 text-white ml-1" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6">
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Vídeo Externo
                        </span>
                        <button
                          onClick={handleVideoClick}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
                        >
                          Assistir
                        </button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Áudio */}
          {exercise.audio_url && (
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 via-emerald-500/20 to-green-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <Card className="relative border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-emerald-500 to-green-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-[1px] bg-white dark:bg-gray-900 rounded-2xl"></div>

                <CardHeader className="relative pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg shadow-md">
                      <Volume2 className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                      Áudio de Instruções
                    </CardTitle>
                  </div>
                </CardHeader>

                <CardContent className="relative">
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Ouça as instruções de execução e erros a evitar:
                    </p>
                    <audio 
                      controls 
                      className="w-full h-12 rounded-xl"
                      preload="metadata"
                    >
                      <source src={exercise.audio_url} type="audio/mpeg" />
                      Seu navegador não suporta o elemento de áudio.
                    </audio>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Grid de Detalhes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Variações */}
        {exercise.variations && exercise.variations.length > 0 && (
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-indigo-500/20 to-purple-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <Card className="relative border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl overflow-hidden h-full">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute inset-[1px] bg-white dark:bg-gray-900 rounded-2xl"></div>

              <CardHeader className="relative pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg shadow-md">
                    <RefreshCw className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                    Variações
                  </CardTitle>
                  <Badge className="ml-auto px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 rounded-full text-xs">
                    {exercise.variations.length}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="relative">
                <div className="space-y-3">
                  {exercise.variations.map((variation, index) => (
                    <div key={index} className="p-3 bg-purple-50/50 dark:bg-purple-900/10 rounded-lg">
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {variation}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Dicas */}
        {exercise.tips && exercise.tips.length > 0 && (
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 via-emerald-500/20 to-green-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <Card className="relative border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl overflow-hidden h-full">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-emerald-500 to-green-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute inset-[1px] bg-white dark:bg-gray-900 rounded-2xl"></div>

              <CardHeader className="relative pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg shadow-md">
                    <Lightbulb className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                    Dicas de Execução
                  </CardTitle>
                  <Badge className="ml-auto px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-full text-xs">
                    {exercise.tips.length}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="relative">
                <div className="space-y-3">
                  {exercise.tips.map((tip, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-xs font-bold text-green-600 dark:text-green-400">
                          {index + 1}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {tip.replace(/[✔️🟡]/g, '').trim()}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Erros Comuns */}
        {exercise.common_errors && exercise.common_errors.length > 0 && (
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 via-orange-500/20 to-red-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <Card className="relative border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl overflow-hidden h-full">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute inset-[1px] bg-white dark:bg-gray-900 rounded-2xl"></div>

              <CardHeader className="relative pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg shadow-md">
                    <AlertTriangle className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                    Erros Comuns
                  </CardTitle>
                  <Badge className="ml-auto px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 rounded-full text-xs">
                    {exercise.common_errors.length}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="relative">
                <div className="space-y-3">
                  {exercise.common_errors.map((error, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mt-0.5">
                        <AlertTriangle className="h-3 w-3 text-red-600 dark:text-red-400" />
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {error.replace(/❌/g, '').trim()}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Estado vazio para detalhes */}
      {(!exercise.variations || exercise.variations.length === 0) && 
       (!exercise.tips || exercise.tips.length === 0) && 
       (!exercise.common_errors || exercise.common_errors.length === 0) && (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200/50 to-gray-300/50 dark:from-gray-700/50 dark:to-gray-600/50 rounded-2xl blur-xl"></div>
          <Card className="relative border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl rounded-2xl">
            <CardContent className="text-center py-12">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 to-gray-700 rounded-full flex items-center justify-center mb-4">
                <FileText className="h-10 w-10 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Detalhes Não Disponíveis
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                Este exercício não possui variações, dicas de execução ou erros comuns cadastrados.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}