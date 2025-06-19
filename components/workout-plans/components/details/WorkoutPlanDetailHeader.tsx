// components/workout-plans/components/details/WorkoutPlanDetailHeader.tsx
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { 
  ArrowLeft, 
  Edit3, 
  Copy, 
  Trash2, 
  PlayCircle, 
  CalendarCheck,
  Calendar,
  Users,
  MoreVertical,
  Sparkles,
  Crown,
  Share2,
  Download,
  Trophy,
  PauseCircle,
  CheckCircle2,
  Target,
  Zap
} from 'lucide-react';
import { WorkoutPlan } from '../../types';

interface WorkoutPlanDetailHeaderProps {
  plan: WorkoutPlan;
  stats: {
    totalWorkouts: number;
    totalDays: number;
    uniqueWorkouts: number;
    duration: number;
    frequency: number;
    status: 'active' | 'completed' | 'paused';
  };
  userRole: 'trainer' | 'student';
  onEdit: () => void;
  onClone: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
  onStartPlan?: () => void;
  isLoading: boolean;
}

export function WorkoutPlanDetailHeader({
  plan,
  stats,
  userRole,
  onEdit,
  onClone,
  onDelete,
  onToggleStatus,
  onStartPlan,
  isLoading
}: WorkoutPlanDetailHeaderProps) {
  const router = useRouter();

  // Função para classificação baseada no plano (simplificada)
  const getPlanClassification = (frequency: number) => {
    if (frequency >= 6) return { label: 'Intensivo', color: 'from-red-500 to-red-600', icon: Crown };
    if (frequency >= 4) return { label: 'Avançado', color: 'from-purple-500 to-purple-600', icon: Trophy };
    if (frequency >= 3) return { label: 'Moderado', color: 'from-blue-500 to-indigo-600', icon: Target };
    return { label: 'Básico', color: 'from-green-500 to-emerald-600', icon: Zap };
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'active':
        return { label: 'Ativo', color: 'from-green-500 to-emerald-600', icon: CheckCircle2 };
      case 'paused':
        return { label: 'Pausado', color: 'from-yellow-500 to-orange-600', icon: PauseCircle };
      case 'completed':
        return { label: 'Concluído', color: 'from-gray-500 to-gray-600', icon: CheckCircle2 };
      default:
        return { label: 'Ativo', color: 'from-green-500 to-emerald-600', icon: CheckCircle2 };
    }
  };

  const classification = getPlanClassification(stats.frequency);
  const statusInfo = getStatusInfo(stats.status);

  const handleShare = () => {
    console.log('Compartilhar plano');
  };

  const handleDownload = () => {
    console.log('Download relatório do plano');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="relative mb-6 sm:mb-8">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 via-orange-500/20 to-orange-600/20 dark:from-orange-500/10 dark:via-orange-400/10 dark:to-orange-500/10 rounded-2xl sm:rounded-3xl blur-xl"></div>
      
      {/* Main Header Card */}
      <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-orange-200/50 dark:border-orange-800/30 rounded-2xl sm:rounded-3xl shadow-2xl mx-2 sm:mx-0">
        
        {/* Top Section with Actions */}
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push('/dashboard/workout-plans')}
              className="h-10 w-10 sm:h-12 sm:w-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-orange-200 dark:border-orange-700 hover:border-orange-300 dark:hover:border-orange-600 rounded-xl shadow-lg transition-all duration-300 hover:scale-105"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>

            {/* Desktop Actions */}
            {userRole === 'trainer' && (
              <div className="hidden sm:flex items-center gap-2 lg:gap-3">
                <Button
                  variant="outline"
                  onClick={onEdit}
                  disabled={isLoading}
                  className="h-10 lg:h-11 px-3 lg:px-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-orange-200 dark:border-orange-700 hover:border-orange-300 dark:hover:border-orange-600 rounded-xl font-semibold shadow-lg transition-all duration-300 hover:scale-105 group text-sm"
                >
                  <Edit3 className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform" />
                  Editar
                </Button>
                
        
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 lg:h-11 lg:w-11 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 rounded-xl shadow-lg transition-all duration-300"
                    >
                      <MoreVertical className="h-4 w-4 lg:h-5 lg:w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-0 rounded-xl shadow-2xl">

                    <DropdownMenuItem onClick={onToggleStatus} disabled={isLoading} className="rounded-lg">
                      {stats.status === 'active' ? (
                        <>
                          <PauseCircle className="h-4 w-4 mr-2" />
                          Pausar Plano
                        </>
                      ) : (
                        <>
                          <PlayCircle className="h-4 w-4 mr-2" />
                          Ativar Plano
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onDelete} disabled={isLoading} className="text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Deletar Plano
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
                      className="h-10 w-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-orange-200 dark:border-orange-700 hover:border-orange-300 dark:hover:border-orange-600 rounded-xl shadow-lg transition-all duration-300"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-0 rounded-xl shadow-2xl">
                    <DropdownMenuItem onClick={onEdit} disabled={isLoading} className="rounded-lg">
                      <Edit3 className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                
                    <DropdownMenuItem onClick={onToggleStatus} disabled={isLoading} className="rounded-lg">
                      {stats.status === 'active' ? (
                        <>
                          <PauseCircle className="h-4 w-4 mr-2" />
                          Pausar
                        </>
                      ) : (
                        <>
                          <PlayCircle className="h-4 w-4 mr-2" />
                          Ativar
                        </>
                      )}
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
            {userRole === 'student' && onStartPlan && stats.status === 'active' && (
              <Button
                onClick={onStartPlan}
                className="h-10 px-4 sm:h-12 sm:px-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl shadow-xl hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-105 border-0 text-sm sm:text-base"
              >
                <PlayCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Iniciar Plano
              </Button>
            )}
          </div>

          {/* Title Section */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="relative inline-flex items-center justify-center mb-3 sm:mb-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl">
                <CalendarCheck className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
            </div>
            
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-200 dark:to-white bg-clip-text text-transparent mb-2">
              {plan.name}
            </h1>
            
            {plan.description && (
              <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed mb-3 sm:mb-4 px-4">
                {plan.description}
              </p>
            )}
            
            {/* Badges de Status e Classificação */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <Badge className={`px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r ${statusInfo.color} text-white rounded-full font-semibold border-0 text-xs sm:text-sm`}>
                <statusInfo.icon className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                {statusInfo.label}
              </Badge>
              <Badge className={`px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r ${classification.color} text-white rounded-full font-semibold border-0 text-xs sm:text-sm`}>
                <classification.icon className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                {classification.label}
              </Badge>
            </div>
            
            {/* Informações Principais */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-gray-600 dark:text-gray-300 text-sm sm:text-base">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="font-semibold">
                  {formatDate(plan.start_date)} - {formatDate(plan.end_date)}
                </span>
              </div>
              
              {plan.student && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="font-medium">{plan.student.full_name}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}