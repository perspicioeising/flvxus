// components/workouts/detail/components/WorkoutDetailHeader.tsx
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
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
  Share2,
  Download,
  User,
  TrendingUp,
  Zap
} from 'lucide-react';
import { WorkoutDetailHeaderProps } from './types';
import { DIFFICULTY_LEVELS, WORKOUT_GOALS } from '../../constants';

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
  
  const levelInfo = DIFFICULTY_LEVELS.find(l => l.value === workout.level);
  const goalInfo = WORKOUT_GOALS.find(g => g.value === workout.goal);

  // Função para classificação baseada no treino
  const getWorkoutClassificationData = (level: string, totalExercises: number) => {
    let classification = '';
    let badgeColor = '';
    let icon = Award;

    if (totalExercises >= 10) {
      classification = 'Intensivo';
      badgeColor = 'from-app-achievement-workout to-app-achievement-workout';
      icon = Crown;
    } else if (totalExercises >= 7) {
      classification = 'Completo';
      badgeColor = 'from-app-achievement-consecutive to-app-achievement-consecutive';
      icon = Award;
    } else if (totalExercises >= 5) {
      classification = 'Moderado';
      badgeColor = 'from-app-achievement-exercise to-app-achievement-exercise';
      icon = Target;
    } else {
      classification = 'Básico';
      badgeColor = 'from-app-achievement-weight to-app-achievement-weight';
      icon = Zap;
    }

    return { classification, badgeColor, icon };
  };

  const { classification, badgeColor, icon: ClassificationIcon } = getWorkoutClassificationData(workout.level, stats.totalExercises);

  const handleShare = () => {
    // Implementar compartilhamento
    console.log('Compartilhar treino');
  };

  const handleDownload = () => {
    // Implementar download/relatório
    console.log('Download relatório');
  };

  return (
    <div className="relative mb-6 sm:mb-8">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-workout/10 via-app-achievement-workout/15 to-app-achievement-workout/10 rounded-2xl sm:rounded-3xl blur-xl"></div>
      
      {/* Main Header Card */}
      <div className="relative bg-app-overlay backdrop-blur-xl border border-app-border-accent/30 rounded-2xl sm:rounded-3xl shadow-app-xl">
        
        {/* Top Section with Actions */}
        <div className="p-4 sm:p-6 lg:p-8 pb-0">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push('/dashboard/workouts')}
              className="h-12 w-12 bg-app-card backdrop-blur-sm border-2 border-app-border-accent hover:border-app-achievement-workout rounded-xl shadow-app-medium transition-all duration-300 hover:scale-105"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            {/* Desktop Actions */}
            {userRole === 'trainer' && (
              <div className="hidden sm:flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={onEdit}
                  disabled={isLoading}
                  className="h-11 px-4 bg-app-card backdrop-blur-sm border-2 border-app-border-accent hover:border-app-achievement-workout rounded-xl font-semibold shadow-app-medium transition-all duration-300 hover:scale-105 group"
                >
                  <Edit3 className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform" />
                  Editar
                </Button>
                
                {/* <Button
                  variant="outline"
                  onClick={handleShare}
                  className="h-11 px-4 bg-app-card backdrop-blur-sm border-2 border-app-achievement-consecutive hover:border-app-achievement-consecutive/80 rounded-xl font-semibold shadow-app-medium transition-all duration-300 hover:scale-105 group text-app-achievement-consecutive"
                >
                  <Share2 className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                  Compartilhar
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleDownload}
                  className="h-11 px-4 bg-app-card backdrop-blur-sm border-2 border-app-achievement-exercise hover:border-app-achievement-exercise/80 rounded-xl font-semibold shadow-app-medium transition-all duration-300 hover:scale-105 group text-app-achievement-exercise"
                >
                  <Download className="h-4 w-4 mr-2 group-hover:translate-y-0.5 transition-transform" />
                  Relatório
                </Button> */}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-11 w-11 bg-app-card backdrop-blur-sm border-2 border-app-border-muted hover:border-app-border-accent rounded-xl shadow-app-medium transition-all duration-300"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-app-overlay backdrop-blur-md border-0 rounded-xl shadow-app-xl">
                    <DropdownMenuItem onClick={onClone} disabled={isLoading} className="rounded-lg">
                      <Copy className="h-4 w-4 mr-2" />
                      Clonar Treino
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onDelete} disabled={isLoading} className="text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Deletar Treino
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            {/* Mobile Actions */}
            {userRole === 'trainer' && (
              <div className="sm:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-12 w-12 bg-app-card backdrop-blur-sm border-2 border-app-border-accent hover:border-app-achievement-workout rounded-xl shadow-app-medium transition-all duration-300"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-app-overlay backdrop-blur-md border-0 rounded-xl shadow-app-xl">
                    <DropdownMenuItem onClick={onEdit} disabled={isLoading} className="rounded-lg">
                      <Edit3 className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    {/* <DropdownMenuItem onClick={handleShare} className="rounded-lg">
                      <Share2 className="h-4 w-4 mr-2" />
                      Compartilhar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDownload} className="rounded-lg">
                      <Download className="h-4 w-4 mr-2" />
                      Relatório
                    </DropdownMenuItem> */}
                    <DropdownMenuItem onClick={onClone} disabled={isLoading} className="rounded-lg">
                      <Copy className="h-4 w-4 mr-2" />
                      Clonar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onDelete} disabled={isLoading} className="text-red-600 rounded-lg">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Deletar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            {/* Student Action Button */}
            {userRole === 'student' && onStartWorkout && (
              <Button
                onClick={onStartWorkout}
                className="h-12 px-4 sm:px-6 bg-app-achievement-consecutive hover:bg-app-achievement-consecutive/90 text-white font-bold rounded-xl shadow-app-xl hover:shadow-app-achievement-consecutive/25 transition-all duration-300 transform hover:scale-105 border-0"
              >
                <Play className="h-5 w-5 mr-2" />
                Iniciar Treino
              </Button>
            )}
          </div>

          {/* Title Section */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="relative inline-flex items-center justify-center mb-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-achievement-workout rounded-2xl flex items-center justify-center shadow-app-xl">
                <Activity className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-app-achievement-consecutive to-app-achievement-consecutive rounded-full flex items-center justify-center shadow-app-medium animate-pulse">
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
            </div>
            
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black bg-gradient-to-r from-app-text-heading to-app-text-heading bg-clip-text text-transparent mb-2">
              {workout.name}
            </h1>
            
            {workout.description && (
              <p className="text-base sm:text-lg text-app-text-secondary max-w-2xl mx-auto leading-relaxed mb-4 px-4">
                {workout.description}
              </p>
            )}
            
            <div className="flex items-center justify-center gap-2 text-app-text-muted">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base font-semibold">
                Criado em {new Date(workout.created_at).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>
        </div>

        {/* Workout Info Section */}
        
      </div>
    </div>
  );
}

// Componente auxiliar para cards de métricas
interface MetricCardProps {
  icon: any;
  label: string;
  value: string;
  unit: string;
  gradient: string;
  bgColor: string;
  borderColor: string;
}

function MetricCard({ icon: Icon, label, value, unit, gradient, bgColor, borderColor }: MetricCardProps) {
  return (
    <div className="group relative">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-xl blur-lg opacity-0 group-hover:opacity-20 transition-opacity duration-300`}></div>
      <div className={`relative flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gradient-to-br ${bgColor} rounded-xl border ${borderColor} transition-all duration-300 group-hover:scale-105 group-hover:shadow-app-medium`}>
        <div className={`p-2 sm:p-2.5 bg-gradient-to-br ${gradient} rounded-lg shadow-app-medium`}>
          <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
        </div>
        <div>
          <div className="text-xs font-semibold text-app-text-muted">{label}</div>
          <div className="text-base sm:text-lg font-bold text-app-text-primary">
            {value}{unit}
          </div>
        </div>
      </div>
    </div>
  );
}