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
          <div className="w-20 h-20 bg-app-achievement-consecutive rounded-2xl flex items-center justify-center shadow-app-large mx-auto">
            <CheckCircle2 className="h-10 w-10 text-white" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-app-achievement-workout rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">4</span>
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-app-text-primary">
            Revisão Final
          </h2>
          <p className="text-app-text-secondary mt-2">
            Confira todos os detalhes antes de {mode === 'create' ? 'criar' : 'atualizar'} o plano
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-workout/20 to-app-achievement-consecutive/20 rounded-xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <div className="relative p-4 bg-app-card rounded-xl shadow-app-medium">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-app-text-secondary">Duração Total</p>
                <p className="text-xl font-bold text-app-text-primary">{calculateDuration()}</p>
              </div>
              <div className="p-3 bg-app-achievement-workout rounded-lg">
                <Calendar className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-consecutive/20 to-app-achievement-exercise/20 rounded-xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <div className="relative p-4 bg-app-card rounded-xl shadow-app-medium">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-app-text-secondary">Frequência</p>
                <p className="text-xl font-bold text-app-text-primary">{formData.schedule.length}x/semana</p>
              </div>
              <div className="p-3 bg-app-achievement-consecutive rounded-lg">
                <Dumbbell className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-weight/20 to-app-achievement-exercise/20 rounded-xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <div className="relative p-4 bg-app-card rounded-xl shadow-app-medium">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-app-text-secondary">Treinos Únicos</p>
                <p className="text-xl font-bold text-app-text-primary">{uniqueWorkouts}</p>
              </div>
              <div className="p-3 bg-app-achievement-weight rounded-lg">
                <FileText className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Plan Details */}
      <div className="space-y-6">
        {/* Basic Info */}
        <div className="bg-app-card rounded-xl shadow-app-medium p-6 border border-app-border-muted">
          <h3 className="font-semibold text-app-text-primary mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-app-achievement-workout" />
            Informações do Plano
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-app-text-secondary">Nome</p>
              <p className="font-medium text-app-text-primary">{formData.name}</p>
            </div>
            <div>
              <p className="text-sm text-app-text-secondary">Descrição</p>
              <p className="text-app-text-primary">{formData.description}</p>
            </div>
            <div className="flex gap-6">
              <div>
                <p className="text-sm text-app-text-secondary">Início</p>
                <p className="font-medium text-app-text-primary">{formatDate(formData.start_date)}</p>
              </div>
              <div>
                <p className="text-sm text-app-text-secondary">Término</p>
                <p className="font-medium text-app-text-primary">{formatDate(formData.end_date)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Schedule */}
        <div className="bg-app-card rounded-xl shadow-app-medium p-6 border border-app-border-muted">
          <h3 className="font-semibold text-app-text-primary mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-app-achievement-workout" />
            Programação Semanal
          </h3>
          <div className="space-y-3">
            {formData.schedule.map(day => {
              const dayWorkouts = workoutsByDay[day] || [];
              
              return (
                <div key={day} className="p-4 bg-app-bg-accent rounded-lg border border-app-border-muted">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-app-text-primary">
                      {getDayName(day)}
                    </h4>
                    <Badge className="bg-app-achievement-workout/10 text-app-achievement-workout border-app-border-accent">
                      {dayWorkouts.length} treino{dayWorkouts.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  {dayWorkouts.length > 0 ? (
                    <div className="space-y-1">
                      {dayWorkouts.map((sw, index) => (
                        <div key={`${sw.workout.id}-${index}`} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-app-achievement-workout rounded-full"></div>
                          <span className="text-sm text-app-text-primary">
                            {sw.workout.name}
                          </span>
                          <Badge variant="outline" className="text-xs border-app-border-muted">
                            {sw.workout.level}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-app-text-muted italic">
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
          className="px-8 py-3 bg-achievement-workout hover:bg-app-btn-primary-hover text-white font-bold rounded-xl shadow-app-xl hover:shadow-app-achievement-workout/25 transition-all duration-300 transform hover:scale-105 border-0"
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
          <div className="relative p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
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