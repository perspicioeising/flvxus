// components/exercises/details/ExerciseDetailsActions.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Exercise } from '@/components/exercices/types/exercise';
import { Edit, Copy, Trash2, Loader2, Share2, Download } from 'lucide-react';

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
      // Fallback: copiar URL para clipboard
      navigator.clipboard.writeText(window.location.href);
      // Aqui você poderia mostrar um toast de sucesso
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
    <div className="lg:hidden mt-8">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200/50 to-purple-200/50 dark:from-gray-700/50 dark:to-purple-700/50 rounded-2xl blur-md"></div>
        <Card className="relative border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-lg rounded-2xl">
          <CardContent className="p-6">
            
            {/* Ações Principais */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Ações do Exercício
              </h3>
              
              {/* Grid de ações principais */}
              <div className="grid grid-cols-1 gap-3">
                <Button
                  onClick={onEdit}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl h-12 font-bold shadow-lg hover:shadow-purple-500/25 transition-all duration-300 border-0"
                >
                  <Edit className="h-5 w-5 mr-3" />
                  Editar Exercício
                </Button>
                
                <Button
                  onClick={onClone}
                  variant="outline"
                  className="w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-blue-200 dark:border-blue-700 hover:border-blue-300 dark:hover:border-blue-600 text-blue-600 dark:text-blue-400 rounded-xl h-12 font-semibold transition-all duration-300"
                >
                  <Copy className="h-5 w-5 mr-3" />
                  Clonar Exercício
                </Button>
                
                <Button
                  onClick={onDelete}
                  disabled={isDeleting}
                  variant="outline"
                  className="w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-red-200 dark:border-red-700 hover:border-red-300 dark:hover:border-red-600 text-red-600 dark:text-red-400 rounded-xl h-12 font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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

              {/* Separador */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                    Ações Secundárias
                  </span>
                </div>
              </div>

              {/* Ações secundárias */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-xl h-11 font-medium transition-all duration-300"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartilhar
                </Button>
                
                <Button
                  onClick={handleExport}
                  variant="outline"
                  className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-xl h-11 font-medium transition-all duration-300"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>

              {/* Informações adicionais */}
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Informações Rápidas
                </h4>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex justify-between">
                    <span>Grupos Musculares:</span>
                    <span className="font-medium">{exercise.muscle_group?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Equipamentos:</span>
                    <span className="font-medium">{exercise.equipment?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Variações:</span>
                    <span className="font-medium">{exercise.variations?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dicas:</span>
                    <span className="font-medium">{exercise.tips?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Erros Comuns:</span>
                    <span className="font-medium">{exercise.common_errors?.length || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}