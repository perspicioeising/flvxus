// components/workout-plans/components/steps/StepReview.tsx
import { CheckCircle2, Calendar, User, FileText, Dumbbell, Save, Edit, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DAYS_OF_WEEK } from '../../constants';

interface StepReviewProps {
  formData: {
    name: string;
    description: string;
    student_id: string;
    start_date: string;
    end_date: string;
    schedule: number[];
  };
  selectedWorkouts: Array<{
    workout: {
      id: string;
      name: string;
      level: string;
      goal: string;
    };
    day_of_week: number;
  }>;
  onSave: () => void;
  isSaving: boolean;
  mode: 'create' | 'edit';
}

export function StepReview({ 
  formData, 
  selectedWorkouts, 
  onSave, 
  isSaving,
  mode 
}: StepReviewProps) {
  const getDayName = (dayValue: number) => {
    return DAYS_OF_WEEK.find(d => d.value === dayValue)?.label || '';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const calculateDuration = () => {
    const start = new Date(formData.start_date);
    const end = new Date(formData.end_date);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(diffDays / 7);
    const days = diffDays % 7;
    
    if (weeks > 0 && days > 0) {
      return `${weeks} semana${weeks > 1 ? 's' : ''} e ${days} dia${days > 1 ? 's' : ''}`;
    } else if (weeks > 0) {
      return `${weeks} semana${weeks > 1 ? 's' : ''}`;
    } else {
      return `${diffDays} dia${diffDays > 1 ? 's' : ''}`;
    }
  };

  // Group workouts by day
  const workoutsByDay = formData.schedule.reduce((acc, day) => {
    acc[day] = selectedWorkouts.filter(sw => sw.day_of_week === day);
    return acc;
  }, {} as Record<number, typeof selectedWorkouts>);

  const uniqueWorkouts = [...new Set(selectedWorkouts.map(sw => sw.workout.id))].length;

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="relative inline-block">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg mx-auto">
            <CheckCircle2 className="h-10 w-10 text-white" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">4</span>
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Revisão Final
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Confira todos os detalhes antes de {mode === 'create' ? 'criar' : 'atualizar'} o plano
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-amber-600 rounded-xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <div className="relative p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Duração Total</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{calculateDuration()}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg">
                <Calendar className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <div className="relative p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Frequência</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{formData.schedule.length}x/semana</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                <Dumbbell className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <div className="relative p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Treinos Únicos</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{uniqueWorkouts}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                <FileText className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Plan Details */}
      <div className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            Informações do Plano
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Nome</p>
              <p className="font-medium text-gray-900 dark:text-white">{formData.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Descrição</p>
              <p className="text-gray-700 dark:text-gray-300">{formData.description}</p>
            </div>
            <div className="flex gap-6">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Início</p>
                <p className="font-medium text-gray-900 dark:text-white">{formatDate(formData.start_date)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Término</p>
                <p className="font-medium text-gray-900 dark:text-white">{formatDate(formData.end_date)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Schedule */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            Programação Semanal
          </h3>
          <div className="space-y-3">
            {formData.schedule.map(day => {
              const dayWorkouts = workoutsByDay[day] || [];
              
              return (
                <div key={day} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {getDayName(day)}
                    </h4>
                    <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                      {dayWorkouts.length} treino{dayWorkouts.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  {dayWorkouts.length > 0 ? (
                    <div className="space-y-1">
                      {dayWorkouts.map((sw, index) => (
                        <div key={`${sw.workout.id}-${index}`} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {sw.workout.name}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {sw.workout.level}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                      Nenhum treino atribuído
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center">
        <Button
          onClick={onSave}
          disabled={isSaving}
          className="px-8 py-3 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:via-amber-600 hover:to-orange-700 text-white font-bold rounded-xl shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 transform hover:scale-105 border-0"
        >
          {isSaving ? (
            <>
              <div className="h-5 w-5 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {mode === 'create' ? 'Criando...' : 'Atualizando...'}
            </>
          ) : (
            <>
              <Save className="h-5 w-5 mr-2" />
              {mode === 'create' ? 'Criar Plano de Treino' : 'Atualizar Plano'}
            </>
          )}
        </Button>
      </div>

      {/* Warning Message */}
      {selectedWorkouts.length === 0 && (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 rounded-xl blur-xl"></div>
          <div className="relative p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-800 dark:text-yellow-300">
                  Atenção: Nenhum treino selecionado
                </h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                  O plano será criado sem treinos. Você poderá adicionar treinos posteriormente.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}