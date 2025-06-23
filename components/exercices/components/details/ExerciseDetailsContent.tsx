// components/exercises/details/ExerciseDetailsContent.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Exercise } from '@/components/exercices/types/exercise';
import { 
  FileText, 
  Video, 
  Volume2, 
  RefreshCw, 
  Lightbulb, 
  AlertTriangle,
  Play,
  ExternalLink,
  Expand,
  Sparkles,
  ListCollapse
} from 'lucide-react';
import { useState } from 'react';

interface ExerciseDetailsContentProps {
  exercise: Exercise;
}

export function ExerciseDetailsContent({ exercise }: ExerciseDetailsContentProps) {
  const [expandedSections, setExpandedSections] = useState({
    description: true,
    variations: false,
    tips: false,
    errors: false
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

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
    <div className="space-y-4 sm:space-y-6">
      
      {/* Description Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-workout/10 via-app-text-accent/10 to-app-achievement-workout/10 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <Card className="relative border-0 card-app">
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-achievement-workout rounded-lg flex items-center justify-center">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <CardTitle className="text-lg sm:text-xl font-bold text-app-heading">
                  Descrição
                </CardTitle>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection('description')}
                className="h-8 w-8 p-0 sm:hidden"
              >
                {expandedSections.description ? (
                  <ListCollapse className="h-4 w-4" />
                ) : (
                  <Expand className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardHeader>

          {(expandedSections.description || window.innerWidth >= 640) && (
            <CardContent>
              <p className="text-sm sm:text-base leading-relaxed text-app-text-primary whitespace-pre-wrap">
                {exercise.description}
              </p>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Media Section */}
      {(exercise.video_url || exercise.audio_url) && (
        <div className="space-y-4">
          
          {/* Video */}
          {exercise.video_url && (
            <Card className="border-0 card-app overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                      <Video className="h-4 w-4 text-white" />
                    </div>
                    <CardTitle className="text-lg font-bold text-app-heading">
                      Vídeo Demonstrativo
                    </CardTitle>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleVideoClick}
                    className="h-8 w-8 p-0"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {isYouTubeUrl(exercise.video_url) ? (
                  <div 
                    className="relative aspect-video bg-gray-900 cursor-pointer group/video"
                    onClick={handleVideoClick}
                  >
                    <img
                      src={getYouTubeThumbnail(exercise.video_url) || '/api/placeholder/640/360'}
                      alt="Thumbnail do vídeo"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover/video:bg-black/50 transition-colors">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-600 rounded-full flex items-center justify-center shadow-app-large group-hover/video:scale-110 transition-transform">
                        <Play className="h-6 w-6 sm:h-8 sm:w-8 text-white ml-1" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4">
                    <div className="flex items-center justify-between p-3 bg-app-bg-secondary rounded-xl">
                      <span className="text-sm text-app-text-secondary">
                        Vídeo Externo
                      </span>
                      <Button
                        onClick={handleVideoClick}
                        className="btn-gradient-primary px-4 py-2 rounded-lg font-semibold"
                      >
                        Assistir
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Audio */}
          {exercise.audio_url && (
            <Card className="border-0 card-app">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-achievement-consecutive rounded-lg flex items-center justify-center">
                    <Volume2 className="h-4 w-4 text-white" />
                  </div>
                  <CardTitle className="text-lg font-bold text-app-heading">
                    Áudio de Instruções
                  </CardTitle>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-app-text-secondary">
                    Ouça as instruções de execução:
                  </p>
                  <audio 
                    controls 
                    className="w-full h-10 rounded-xl"
                    preload="metadata"
                  >
                    <source src={exercise.audio_url} type="audio/mpeg" />
                    Seu navegador não suporta o elemento de áudio.
                  </audio>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Details Grid - Mobile Stacked */}
      <div className="space-y-4 sm:grid sm:grid-cols-1 lg:grid-cols-3 sm:gap-4 sm:space-y-0">
        
        {/* Variations */}
        {exercise.variations && exercise.variations.length > 0 && (
          <Card className="border-0 card-app">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-achievement-exercise rounded-lg flex items-center justify-center">
                    <RefreshCw className="h-4 w-4 text-white" />
                  </div>
                  <CardTitle className="text-base sm:text-lg font-bold text-app-heading">
                    Variações
                  </CardTitle>
                  <Badge className="px-2 py-1 bg-achievement-exercise/10 text-achievement-exercise border border-app-border-accent rounded-full text-xs">
                    {exercise.variations.length}
                  </Badge>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSection('variations')}
                  className="h-8 w-8 p-0 sm:hidden"
                >
                  {expandedSections.variations ? (
                    <ListCollapse className="h-4 w-4" />
                  ) : (
                    <Expand className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>

            {(expandedSections.variations || window.innerWidth >= 640) && (
              <CardContent>
                <div className="space-y-3">
                  {exercise.variations.map((variation, index) => (
                    <div key={index} className="p-3 bg-achievement-exercise/5 border border-app-border-accent rounded-lg">
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 bg-achievement-exercise rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-white">
                            {index + 1}
                          </span>
                        </div>
                        <p className="text-sm text-app-text-primary leading-relaxed">
                          {variation}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        )}

        {/* Tips */}
        {exercise.tips && exercise.tips.length > 0 && (
          <Card className="border-0 card-app">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-achievement-consecutive rounded-lg flex items-center justify-center">
                    <Lightbulb className="h-4 w-4 text-white" />
                  </div>
                  <CardTitle className="text-base sm:text-lg font-bold text-app-heading">
                    Dicas
                  </CardTitle>
                  <Badge className="px-2 py-1 bg-achievement-consecutive/10 text-achievement-consecutive border border-app-border-accent rounded-full text-xs">
                    {exercise.tips.length}
                  </Badge>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSection('tips')}
                  className="h-8 w-8 p-0 sm:hidden"
                >
                  {expandedSections.tips ? (
                    <ListCollapse className="h-4 w-4" />
                  ) : (
                    <Expand className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>

            {(expandedSections.tips || window.innerWidth >= 640) && (
              <CardContent>
                <div className="space-y-3">
                  {exercise.tips.map((tip, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-achievement-consecutive/20 border border-app-border-accent rounded-full flex items-center justify-center mt-0.5">
                        <Lightbulb className="h-3 w-3 text-achievement-consecutive" />
                      </div>
                      <p className="text-sm text-app-text-primary leading-relaxed">
                        {tip.replace(/[✔️🟡]/g, '').trim()}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        )}

        {/* Common Errors */}
        {exercise.common_errors && exercise.common_errors.length > 0 && (
          <Card className="border-0 card-app">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4 text-white" />
                  </div>
                  <CardTitle className="text-base sm:text-lg font-bold text-app-heading">
                    Erros Comuns
                  </CardTitle>
                  <Badge className="px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-full text-xs">
                    {exercise.common_errors.length}
                  </Badge>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSection('errors')}
                  className="h-8 w-8 p-0 sm:hidden"
                >
                  {expandedSections.errors ? (
                    <ListCollapse className="h-4 w-4" />
                  ) : (
                    <Expand className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>

            {(expandedSections.errors || window.innerWidth >= 640) && (
              <CardContent>
                <div className="space-y-3">
                  {exercise.common_errors.map((error, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-full flex items-center justify-center mt-0.5">
                        <AlertTriangle className="h-3 w-3 text-red-600 dark:text-red-400" />
                      </div>
                      <p className="text-sm text-app-text-primary leading-relaxed">
                        {error.replace(/❌/g, '').trim()}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        )}
      </div>

      {/* Empty State */}
      {(!exercise.variations || exercise.variations.length === 0) && 
       (!exercise.tips || exercise.tips.length === 0) && 
       (!exercise.common_errors || exercise.common_errors.length === 0) && (
        <Card className="border-0 card-app">
          <CardContent className="text-center py-12 sm:py-16">
            <div className="relative mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-app-bg-secondary rounded-full flex items-center justify-center shadow-app-large">
                <FileText className="h-8 w-8 sm:h-10 sm:w-10 text-app-text-muted" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-app-text-muted/30 via-app-achievement-exercise/30 to-app-text-muted/30 rounded-full blur-2xl animate-pulse"></div>
            </div>
            
            <h3 className="text-lg sm:text-xl font-bold text-app-heading mb-2">
              Detalhes Não Disponíveis
            </h3>
            <p className="text-app-text-secondary max-w-md mx-auto leading-relaxed">
              Este exercício não possui variações, dicas de execução ou erros comuns cadastrados.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Quick Action Cards - Mobile Only */}
      <div className="grid grid-cols-2 gap-3 sm:hidden">
        <Button
          onClick={() => window.navigator.share?.({
            title: `Exercício: ${exercise.name}`,
            text: exercise.description.substring(0, 100) + '...',
            url: window.location.href,
          })}
          variant="outline"
          className="h-12 bg-app-card border-app-border-muted text-app-text-primary rounded-xl"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Compartilhar
        </Button>
        
        <Button
          onClick={() => {
            const exerciseData = {
              name: exercise.name,
              description: exercise.description,
              muscle_group: exercise.muscle_group,
              equipment: exercise.equipment,
            };
            const dataStr = JSON.stringify(exerciseData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `exercicio-${exercise.name.toLowerCase().replace(/\s+/g, '-')}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          }}
          variant="outline"
          className="h-12 bg-app-card border-app-border-muted text-app-text-primary rounded-xl"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </div>
    </div>
  );
}