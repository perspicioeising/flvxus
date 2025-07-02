// components/workouts/detail/components/WorkoutDetailHeader.tsx
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  ArrowLeft, 
  Edit3, 
  Copy, 
  Trash2, 
  Play, 
  Activity,
  Clock,
  Target,
  Hash,
  Award,
  Calendar,
  MoreVertical,
  Sparkles,
  Crown,
  Zap,
  Dumbbell,
  TrendingUp
} from 'lucide-react';
import { WorkoutDetailHeaderProps } from './types';

export function WorkoutDetailHeader({
  workout,
  stats,
  userRole,
  onEdit,
  onClone,
  onDelete,
  onStartWorkout,
  isLoading
}: WorkoutDetailHeaderProps) {
  const router = useRouter();

  // Função para classificação baseada no treino
  const getWorkoutClassification = (totalExercises: number) => {
    if (totalExercises >= 10) {
      return { 
        label: 'Intensivo', 
        colorClass: 'from-red-500 to-red-600',
        icon: Crown 
      };
    } else if (totalExercises >= 7) {
      return { 
        label: 'Completo', 
        colorClass: 'from-purple-500 to-purple-600',
        icon: Award 
      };
    } else if (totalExercises >= 5) {
      return { 
        label: 'Moderado', 
        colorClass: 'from-blue-500 to-indigo-600',
        icon: Target 
      };
    } else {
      return { 
        label: 'Básico', 
        colorClass: 'from-green-500 to-emerald-600',
        icon: Zap 
      };
    }
  };

  const getLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'iniciante':
      case 'beginner':
        return 'from-green-500 to-emerald-600';
      case 'intermediário':
      case 'intermediate':
        return 'from-yellow-500 to-orange-600';
      case 'avançado':
      case 'advanced':
        return 'from-red-500 to-red-600';
      default:
        return 'from-blue-500 to-indigo-600';
    }
  };

  const getGoalColor = (goal: string) => {
    switch (goal?.toLowerCase()) {
      case 'hipertrofia':
      case 'muscle gain':
        return 'from-orange-500 to-orange-600';
      case 'emagrecimento':
      case 'weight loss':
        return 'from-red-500 to-red-600';
      case 'resistência':
      case 'endurance':
        return 'from-blue-500 to-blue-600';
      case 'força':
      case 'strength':
        return 'from-purple-500 to-purple-600';
      case 'condicionamento':
      case 'conditioning':
        return 'from-green-500 to-green-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const classification = getWorkoutClassification(stats.totalExercises);
  const levelColor = getLevelColor(workout.level);
  const goalColor = getGoalColor(workout.goal);

  return (
    <div className="relative mb-6">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-workout/10 via-app-achievement-workout/15 to-app-achievement-workout/10 rounded-2xl sm:rounded-3xl blur-xl"></div>
      
      <div className="relative bg-app-overlay backdrop-blur-xl border border-app-border-accent/30 rounded-2xl sm:rounded-3xl shadow-app-xl">
        <div className="p-4 sm:p-6 lg:p-8">
          
          {/* Navigation Bar - Mobile First */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="h-10 w-10 sm:h-12 sm:w-auto sm:px-4 bg-app-bg-secondary hover:bg-app-border-accent/20 rounded-xl transition-all duration-300"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="hidden sm:inline sm:ml-2 font-semibold">Voltar</span>
            </Button>

            {/* Actions Menu - Mobile */}
            {userRole === 'trainer' && (
              <div className="sm:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 bg-app-bg-secondary hover:bg-app-border-accent/20 rounded-xl"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end" 
                    className="w-48 bg-app-overlay backdrop-blur-xl border border-app-border-default rounded-xl shadow-app-xl"
                  >
                    <DropdownMenuItem onClick={onEdit} className="flex items-center gap-2 p-3">
                      <Edit3 className="h-4 w-4 text-app-achievement-workout" />
                      <span>Editar</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onClone} className="flex items-center gap-2 p-3">
                      <Copy className="h-4 w-4 text-app-achievement-workout" />
                      <span>Clonar</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={onDelete} 
                      className="flex items-center gap-2 p-3 text-red-600 dark:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Deletar</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            {/* Desktop Actions */}
            {userRole === 'trainer' && (
              <div className="hidden sm:flex items-center gap-3">
                <Button
                  onClick={onEdit}
                  className="h-10 px-4 bg-app-card border-app-border-accent text-app-text-primary hover:bg-app-border-accent/20 rounded-xl font-semibold transition-all duration-300"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                
                <Button
                  onClick={onClone}
                  variant="outline"
                  className="h-10 px-4 bg-app-card border-app-border-accent text-app-text-primary hover:bg-app-border-accent/20 rounded-xl font-semibold transition-all duration-300"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Clonar
                </Button>
                
                <Button
                  onClick={onDelete}
                  variant="outline"
                  className="h-10 px-4 bg-app-card border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-semibold transition-all duration-300"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Deletar
                </Button>
              </div>
            )}

            {/* Student Action */}
            {userRole === 'student' && onStartWorkout && (
              <Button
                onClick={onStartWorkout}
                className="h-10 px-4 sm:h-12 sm:px-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl shadow-xl hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-105 border-0"
              >
                <Play className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Iniciar Treino
              </Button>
            )}
          </div>

          {/* Workout Info */}
          <div className="space-y-4">
            
            {/* Title and Icon */}
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-app-achievement-workout rounded-xl sm:rounded-2xl flex items-center justify-center shadow-app-large">
                  <Dumbbell className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-app-heading leading-tight break-words">
                  {workout.name}
                </h1>
                
                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs sm:text-sm text-app-text-secondary">
                  <div className="flex items-center gap-1">
                    <Hash className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>{stats.totalExercises} exercícios</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>~{stats.estimatedDuration} min</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Target className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>{stats.totalSets} séries</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>{stats.muscleGroups.length} grupos musculares</span>
                  </div>

                  {workout.updated_at !== workout.created_at && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>Atualizado em {format(new Date(workout.updated_at), 'dd/MM/yy')}</span>
                    </div>
                  )}
                </div>

                {/* Badges */}
                
              </div>
            </div>

            {/* Description */}
            {workout.description && (
              <p className="text-sm sm:text-base text-app-text-secondary leading-relaxed">
                {workout.description}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}