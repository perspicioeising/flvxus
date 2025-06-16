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
  Dumbbell,
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
  Zap,
  Activity,
  Trophy
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
      badgeColor = 'from-red-500 to-red-600';
      icon = Crown;
    } else if (totalExercises >= 7) {
      classification = 'Completo';
      badgeColor = 'from-green-500 to-emerald-600';
      icon = Trophy;
    } else if (totalExercises >= 5) {
      classification = 'Moderado';
      badgeColor = 'from-blue-500 to-indigo-600';
      icon = Target;
    } else {
      classification = 'Básico';
      badgeColor = 'from-yellow-500 to-orange-600';
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
    <div className="relative mb-8">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 via-red-500/20 to-red-600/20 dark:from-red-500/10 dark:via-red-400/10 dark:to-red-500/10 rounded-3xl blur-xl"></div>
      
      {/* Main Header Card */}
      <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-red-200/50 dark:border-red-800/30 rounded-3xl shadow-2xl">
        
        {/* Top Section with Actions */}
        <div className="p-6 sm:p-8 pb-0">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push('/dashboard/workouts')}
              className="h-12 w-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-red-200 dark:border-red-700 hover:border-red-300 dark:hover:border-red-600 rounded-xl shadow-lg transition-all duration-300 hover:scale-105"
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
                  className="h-11 px-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-red-200 dark:border-red-700 hover:border-red-300 dark:hover:border-red-600 rounded-xl font-semibold shadow-lg transition-all duration-300 hover:scale-105 group"
                >
                  <Edit3 className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform" />
                  Editar
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleShare}
                  className="h-11 px-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-blue-200 dark:border-blue-700 hover:border-blue-300 dark:hover:border-blue-600 rounded-xl font-semibold shadow-lg transition-all duration-300 hover:scale-105 group"
                >
                  <Share2 className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                  Compartilhar
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleDownload}
                  className="h-11 px-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-emerald-200 dark:border-emerald-700 hover:border-emerald-300 dark:hover:border-emerald-600 rounded-xl font-semibold shadow-lg transition-all duration-300 hover:scale-105 group"
                >
                  <Download className="h-4 w-4 mr-2 group-hover:translate-y-0.5 transition-transform" />
                  Relatório
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-11 w-11 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 rounded-xl shadow-lg transition-all duration-300"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-0 rounded-xl shadow-2xl">
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
                      className="h-12 w-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-red-200 dark:border-red-700 hover:border-red-300 dark:hover:border-red-600 rounded-xl shadow-lg transition-all duration-300"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-0 rounded-xl shadow-2xl">
                    <DropdownMenuItem onClick={onEdit} disabled={isLoading} className="rounded-lg">
                      <Edit3 className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleShare} className="rounded-lg">
                      <Share2 className="h-4 w-4 mr-2" />
                      Compartilhar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDownload} className="rounded-lg">
                      <Download className="h-4 w-4 mr-2" />
                      Relatório
                    </DropdownMenuItem>
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
                className="h-12 px-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl shadow-xl hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-105 border-0"
              >
                <Play className="h-5 w-5 mr-2" />
                Iniciar Treino
              </Button>
            )}
          </div>

          {/* Title Section */}
          <div className="text-center mb-8">
            <div className="relative inline-flex items-center justify-center mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-xl">
                <Dumbbell className="h-10 w-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-200 dark:to-white bg-clip-text text-transparent mb-2">
              {workout.name}
            </h1>
            
            {workout.description && (
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed mb-4">
                {workout.description}
              </p>
            )}
            
            <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-300">
              <Calendar className="h-5 w-5" />
              <span className="text-lg font-semibold">
                Criado em {new Date(workout.created_at).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>
        </div>

        {/* Workout Info Section */}
        <div className="p-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-red-600/10 rounded-2xl blur-lg"></div>
            <div className="relative p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-red-200/50 dark:border-red-700/50 shadow-xl">
              
              {/* Workout Profile Row */}
              <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
                {/* Workout Avatar */}
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-xl">
                    <Dumbbell className="h-10 w-10" />
                  </div>
                  <Badge className={`absolute -bottom-2 -right-2 px-3 py-1.5 bg-gradient-to-r ${badgeColor} text-white rounded-full text-xs font-bold border-0 shadow-lg`}>
                    <ClassificationIcon className="h-3 w-3 mr-1" />
                    {classification}
                  </Badge>
                </div>

                {/* Workout Info */}
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Treino {levelInfo?.label}
                  </h2>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <span className="flex items-center gap-1.5">
                      <Target className="h-4 w-4" />
                      {goalInfo?.label || 'Objetivo não definido'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Activity className="h-4 w-4" />
                      {levelInfo?.label || 'Nível não definido'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <TrendingUp className="h-4 w-4" />
                      {stats.totalExercises} exercícios
                    </span>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                    {levelInfo && (
                      <Badge className={`px-4 py-2 bg-gradient-to-r ${levelInfo.color} text-white rounded-full font-semibold border-0 text-sm`}>
                        <Award className="h-4 w-4 mr-2" />
                        {levelInfo.label}
                      </Badge>
                    )}
                    {goalInfo && (
                      <Badge className={`px-4 py-2 bg-gradient-to-r ${goalInfo.color} text-white rounded-full font-semibold border-0 text-sm`}>
                        <goalInfo.icon className="h-4 w-4 mr-2" />
                        {goalInfo.label}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard
                  icon={Dumbbell}
                  label="Exercícios"
                  value={stats.totalExercises.toString()}
                  unit=""
                  gradient="from-blue-500 to-indigo-600"
                  bgColor="from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20"
                  borderColor="border-blue-200 dark:border-blue-700"
                />
                <MetricCard
                  icon={Hash}
                  label="Séries"
                  value={stats.totalSets.toString()}
                  unit=""
                  gradient="from-green-500 to-emerald-600"
                  bgColor="from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20"
                  borderColor="border-green-200 dark:border-green-700"
                />
                <MetricCard
                  icon={Clock}
                  label="Duração"
                  value={stats.estimatedDuration.toString()}
                  unit="min"
                  gradient="from-purple-500 to-pink-600"
                  bgColor="from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20"
                  borderColor="border-purple-200 dark:border-purple-700"
                />
                <MetricCard
                  icon={TrendingUp}
                  label="Descanso"
                  value={stats.averageRest.toString()}
                  unit="s"
                  gradient="from-orange-500 to-red-600"
                  bgColor="from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20"
                  borderColor="border-orange-200 dark:border-orange-700"
                />
              </div>
            </div>
          </div>
        </div>
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
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
      <div className={`relative flex items-center gap-3 p-4 bg-gradient-to-br ${bgColor} rounded-xl border ${borderColor} transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg`}>
        <div className={`p-2.5 bg-gradient-to-br ${gradient} rounded-lg shadow-md`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
        <div>
          <div className="text-xs font-semibold text-gray-600 dark:text-gray-400">{label}</div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {value}{unit}
          </div>
        </div>
      </div>
    </div>
  );
}