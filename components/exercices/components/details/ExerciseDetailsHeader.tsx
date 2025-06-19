// components/exercises/details/ExerciseDetailsHeader.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Exercise } from '@/components/exercices/types/exercise';
import { getMuscleGroupIcon } from '@/components/exercices/components/constants/exercise';
import { 
  ArrowLeft, 
  Edit, 
  Copy, 
  Trash2, 
  Dumbbell, 
  Settings,
  Loader2,
  Calendar,
  Clock
} from 'lucide-react';

interface ExerciseDetailsHeaderProps {
  exercise: Exercise;
  onBack: () => void;
  onEdit: () => void;
  onClone: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

export function ExerciseDetailsHeader({
  exercise,
  onBack,
  onEdit,
  onClone,
  onDelete,
  isDeleting
}: ExerciseDetailsHeaderProps) {
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getMainMuscleGroup = () => {
    if (!exercise.muscle_group || exercise.muscle_group.length === 0) return null;
    return getMuscleGroupIcon(exercise.muscle_group[0]);
  };

  const mainMuscleGroup = getMainMuscleGroup();

  return (
    <div className="relative mb-8">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-purple-500/10 to-purple-600/10 rounded-3xl blur-xl"></div>
      
      <div className="relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-0 rounded-3xl shadow-2xl">
        <div className="p-6 lg:p-8">
          
          {/* Botão Voltar */}
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={onBack}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 rounded-xl h-12 px-4 font-semibold transition-all duration-300 hover:scale-105"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Voltar
            </Button>
          </div>

          {/* Header Principal */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            
            {/* Informações do Exercício */}
            <div className="flex-1 space-y-4">
              
              {/* Título e ícone */}
              <div className="flex items-start gap-4">
                {mainMuscleGroup && (
                  <div className={`p-4 bg-gradient-to-br ${mainMuscleGroup.color} rounded-2xl shadow-lg`}>
                    <Dumbbell className="h-8 w-8 text-white" />
                  </div>
                )}
                
                <div className="flex-1">
                  <h1 className="text-3xl lg:text-4xl font-black bg-gradient-to-r from-gray-900 via-purple-600 to-gray-900 dark:from-white dark:via-purple-400 dark:to-white bg-clip-text text-transparent leading-tight">
                    {exercise.name}
                  </h1>
                  
                  {/* Metadados */}
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Criado em {formatDate(exercise.created_at)}</span>
                    </div>
                    
                    {exercise.updated_at !== exercise.created_at && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>Atualizado em {formatDate(exercise.updated_at)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Badges de Categorias */}
              <div className="space-y-3">
                
                {/* Grupos Musculares */}
                {exercise.muscle_group && exercise.muscle_group.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Dumbbell className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Grupos Musculares:
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {exercise.muscle_group.map((group) => {
                        const groupInfo = getMuscleGroupIcon(group);
                        return (
                          <Badge
                            key={group}
                            className={`px-3 py-1 bg-gradient-to-r ${groupInfo.color} text-white rounded-full text-sm font-semibold border-0`}
                          >
                            {groupInfo.icon} {group}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Equipamentos */}
                {exercise.equipment && exercise.equipment.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Settings className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Equipamentos:
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {exercise.equipment.map((equipment) => (
                        <Badge
                          key={equipment}
                          variant="secondary"
                          className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-sm font-semibold"
                        >
                          {equipment}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Ações Principais (Desktop) */}
            <div className="hidden lg:flex lg:flex-col gap-3">
              <Button
                onClick={onEdit}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl h-12 px-6 font-bold shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105 border-0"
              >
                <Edit className="h-5 w-5 mr-2" />
                Editar
              </Button>
              
              <Button
                onClick={onClone}
                variant="outline"
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-blue-200 dark:border-blue-700 hover:border-blue-300 dark:hover:border-blue-600 text-blue-600 dark:text-blue-400 rounded-xl h-12 px-6 font-semibold transition-all duration-300 hover:scale-105"
              >
                <Copy className="h-5 w-5 mr-2" />
                Clonar
              </Button>
              
              <Button
                onClick={onDelete}
                disabled={isDeleting}
                variant="outline"
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-red-200 dark:border-red-700 hover:border-red-300 dark:hover:border-red-600 text-red-600 dark:text-red-400 rounded-xl h-12 px-6 font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isDeleting ? (
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-5 w-5 mr-2" />
                )}
                {isDeleting ? 'Deletando...' : 'Deletar'}
              </Button>
            </div>
          </div>

          {/* Ações Principais (Mobile) */}
          <div className="lg:hidden mt-6 grid grid-cols-3 gap-3">
            <Button
              onClick={onEdit}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl h-12 font-bold shadow-lg border-0"
            >
              <Edit className="h-5 w-5" />
            </Button>
            
            <Button
              onClick={onClone}
              variant="outline"
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 rounded-xl h-12 font-semibold"
            >
              <Copy className="h-5 w-5" />
            </Button>
            
            <Button
              onClick={onDelete}
              disabled={isDeleting}
              variant="outline"
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 rounded-xl h-12 font-semibold disabled:opacity-50"
            >
              {isDeleting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Trash2 className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}