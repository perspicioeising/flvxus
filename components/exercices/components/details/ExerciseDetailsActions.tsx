// components/exercises/details/ExerciseDetailsActions.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Exercise } from '@/components/exercices/types/exercise';
import { Edit, Copy, Trash2, Loader2, Share2, Download, BarChart3, Info } from 'lucide-react';

interface ExerciseDetailsActionsProps {
  exercise: Exercise;
  onEdit: () => void;
  onClone: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

export function ExerciseDetailsActions({
  exercise,
  onEdit,
  onClone,
  onDelete,
  isDeleting
}: ExerciseDetailsActionsProps) {

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Exercício: ${exercise.name}`,
          text: exercise.description.substring(0, 100) + '...',
          url: window.location.href,
        });
      } catch (error) {
        console.log('Erro ao compartilhar:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleExport = () => {
    const exerciseData = {
      name: exercise.name,
      description: exercise.description,
      muscle_group: exercise.muscle_group,
      equipment: exercise.equipment,
      variations: exercise.variations,
      tips: exercise.tips,
      common_errors: exercise.common_errors,
      created_at: exercise.created_at
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
  };

  return (
    <div className="lg:hidden mt-6">
      <Card className="border-0 card-app">
        <CardContent className="p-4 sm:p-6">
          
          {/* Quick Stats */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-app-heading mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-app-text-accent" />
              Estatísticas do Exercício
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-achievement-workout/10 border border-app-border-accent rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-achievement-workout">
                  {exercise.muscle_group?.length || 0}
                </div>
                <div className="text-xs text-app-text-secondary">Grupos Musculares</div>
              </div>
              
              <div className="bg-achievement-exercise/10 border border-app-border-accent rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-achievement-exercise">
                  {exercise.equipment?.length || 0}
                </div>
                <div className="text-xs text-app-text-secondary">Equipamentos</div>
              </div>
              
              <div className="bg-achievement-consecutive/10 border border-app-border-accent rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-achievement-consecutive">
                  {exercise.variations?.length || 0}
                </div>
                <div className="text-xs text-app-text-secondary">Variações</div>
              </div>
              
              <div className="bg-achievement-weight/10 border border-app-border-accent rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-achievement-weight">
                  {exercise.tips?.length || 0}
                </div>
                <div className="text-xs text-app-text-secondary">Dicas</div>
              </div>
            </div>
          </div>

          {/* Primary Actions */}
          <div className="space-y-3 mb-6">
            <h4 className="text-base font-semibold text-app-text-primary mb-3">
              Ações Principais
            </h4>
            
            <div className="space-y-3">
              <Button
                onClick={onEdit}
                className="w-full btn-gradient-primary h-12 rounded-xl font-bold shadow-app-medium hover:shadow-app-large transition-all duration-300 transform active:scale-95"
              >
                <Edit className="h-5 w-5 mr-3" />
                Editar Exercício
              </Button>
              
              <Button
                onClick={onClone}
                variant="outline"
                className="w-full h-12 bg-app-card border-app-border-accent text-app-text-primary hover:bg-app-border-accent/20 rounded-xl font-semibold transition-all duration-300"
              >
                <Copy className="h-5 w-5 mr-3" />
                Clonar Exercício
              </Button>
              
              <Button
                onClick={onDelete}
                disabled={isDeleting}
                variant="outline"
                className="w-full h-12 bg-app-card border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                    Deletando...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-5 w-5 mr-3" />
                    Deletar Exercício
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-app-border-muted"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-app-bg-card text-app-text-muted">
                Ações Secundárias
              </span>
            </div>
          </div>

          {/* Secondary Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleShare}
              variant="outline"
              className="h-11 bg-app-card border-app-border-muted text-app-text-primary hover:bg-app-border-accent/20 rounded-xl font-medium transition-all duration-300"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Compartilhar
            </Button>
            
            <Button
              onClick={handleExport}
              variant="outline"
              className="h-11 bg-app-card border-app-border-muted text-app-text-primary hover:bg-app-border-accent/20 rounded-xl font-medium transition-all duration-300"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>

          {/* Additional Info */}
          <div className="mt-6 p-4 bg-app-bg-secondary rounded-xl border border-app-border-muted">
            <div className="flex items-center gap-2 mb-3">
              <Info className="h-4 w-4 text-app-text-accent" />
              <h5 className="text-sm font-semibold text-app-text-primary">
                Informações Detalhadas
              </h5>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-app-text-secondary">Grupos Musculares:</span>
                <span className="font-medium text-app-text-primary">{exercise.muscle_group?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-app-text-secondary">Equipamentos:</span>
                <span className="font-medium text-app-text-primary">{exercise.equipment?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-app-text-secondary">Variações:</span>
                <span className="font-medium text-app-text-primary">{exercise.variations?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-app-text-secondary">Dicas:</span>
                <span className="font-medium text-app-text-primary">{exercise.tips?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-app-text-secondary">Erros Comuns:</span>
                <span className="font-medium text-app-text-primary">{exercise.common_errors?.length || 0}</span>
              </div>
              
              {/* Multimedia indicators */}
              <div className="pt-2 border-t border-app-border-muted">
                <div className="flex justify-between items-center">
                  <span className="text-app-text-secondary">Tem Vídeo:</span>
                  <span className={`font-medium ${exercise.video_url ? 'text-achievement-consecutive' : 'text-app-text-muted'}`}>
                    {exercise.video_url ? 'Sim' : 'Não'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-app-text-secondary">Tem Áudio:</span>
                  <span className={`font-medium ${exercise.audio_url ? 'text-achievement-consecutive' : 'text-app-text-muted'}`}>
                    {exercise.audio_url ? 'Sim' : 'Não'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}