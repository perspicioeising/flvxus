import { useState } from 'react';
import { Dumbbell, Search, Filter, Plus, X, Target, Clock, TrendingUp, CheckCircle2, Info, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DAYS_OF_WEEK } from '../../constants';
import { FormWorkout, FormSelectedWorkout } from '../../hooks/form-types';

interface StepWorkoutsProps {
  availableWorkouts: FormWorkout[];
  selectedWorkouts: FormSelectedWorkout[];
  schedule: number[];
  onWorkoutSelect: (workout: FormWorkout, day: number) => void;
  onWorkoutRemove: (workoutId: string, day: number) => void;
  isLoading: boolean;
}

const LEVEL_COLORS = {
  beginner: 'bg-app-achievement-consecutive',
  intermediate: 'bg-app-achievement-workout',
  advanced: 'bg-app-achievement-weight'
};

const GOAL_ICONS = {
  strength: TrendingUp,
  hypertrophy: Target,
  endurance: Clock,
  weight_loss: TrendingUp,
  general_fitness: Target
};

export function StepWorkouts({
  availableWorkouts,
  selectedWorkouts,
  schedule,
  onWorkoutSelect,
  onWorkoutRemove,
  isLoading
}: StepWorkoutsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterGoal, setFilterGoal] = useState<string>('all');
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Filter workouts
  const filteredWorkouts = availableWorkouts.filter(workout => {
    const matchesSearch = workout.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workout.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === 'all' || workout.level === filterLevel;
    const matchesGoal = filterGoal === 'all' || workout.goal === filterGoal;
    
    return matchesSearch && matchesLevel && matchesGoal;
  });

  // Group selected workouts by day
  const workoutsByDay = schedule.reduce((acc, day) => {
    acc[day] = selectedWorkouts.filter(sw => sw.day_of_week === day);
    return acc;
  }, {} as Record<number, FormSelectedWorkout[]>);

  const handleWorkoutClick = (workout: FormWorkout) => {
    if (selectedDay !== null) {
      onWorkoutSelect(workout, selectedDay);
      setSelectedDay(null);
    }
  };

  const getDayName = (dayValue: number) => {
    return DAYS_OF_WEEK.find(d => d.value === dayValue)?.label || '';
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="relative inline-block">
          <div className="w-20 h-20 bg-app-achievement-exercise rounded-2xl flex items-center justify-center shadow-app-large mx-auto">
            <Dumbbell className="h-10 w-10 text-white" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-app-achievement-workout rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">3</span>
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-app-text-primary">
            Seleção de Treinos
          </h2>
          <p className="text-app-text-secondary mt-2">
            Atribua treinos para cada dia da semana
          </p>
        </div>
      </div>

      {/* Schedule Overview */}
      <div className="space-y-4">
        <h3 className="font-semibold text-app-text-primary flex items-center gap-2">
          <Calendar className="h-5 w-5 text-app-achievement-workout" />
          Dias Programados
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {schedule.map(day => {
            const dayWorkouts = workoutsByDay[day] || [];
            
            return (
              <div key={day} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-workout/10 to-app-achievement-consecutive/10 rounded-xl blur-lg"></div>
                <div className="relative bg-app-card rounded-xl shadow-app-medium p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-app-text-primary">
                      {getDayName(day)}
                    </h4>
                    <Badge className="bg-app-achievement-workout/10 text-app-achievement-workout border-app-border-accent">
                      {dayWorkouts.length} treino{dayWorkouts.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>

                  {/* Workouts for this day */}
                  <div className="space-y-2 mb-3">
                    {dayWorkouts.map((sw, index) => (
                      <div key={`${sw.workout.id}-${index}`} className="flex items-center justify-between p-2 bg-app-bg-secondary rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-app-achievement-workout rounded-lg flex items-center justify-center">
                            <Dumbbell className="h-4 w-4 text-white" />
                          </div>
                          <span className="text-sm font-medium text-app-text-primary">
                            {sw.workout.name}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400"
                          onClick={() => onWorkoutRemove(sw.workout.id, day)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {/* Add Workout Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-dashed border-2 border-app-border-accent hover:border-app-achievement-workout hover:bg-app-achievement-workout/10"
                    onClick={() => setSelectedDay(day)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Treino
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Workout Selection */}
      {selectedDay !== null && (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-workout/20 to-app-achievement-exercise/20 rounded-xl blur-xl"></div>
          <div className="relative bg-app-achievement-workout/10 rounded-xl p-6 border border-app-border-accent">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-app-achievement-workout flex items-center gap-2">
                <Info className="h-5 w-5" />
                Selecionando treino para {getDayName(selectedDay)}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedDay(null)}
                className="hover:bg-app-achievement-workout/20"
              >
                <X className="h-4 w-4 mr-1" />
                Cancelar
              </Button>
            </div>

            {/* Search and Filters */}
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-app-text-muted" />
                <Input
                  placeholder="Buscar treinos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-app-card border-0 shadow-app-medium"
                />
              </div>

              <div className="flex gap-3">
                <Select value={filterLevel} onValueChange={setFilterLevel}>
                  <SelectTrigger className="bg-app-card border-0 shadow-app-medium">
                    <SelectValue placeholder="Nível" />
                  </SelectTrigger>
                  <SelectContent className="bg-app-overlay backdrop-blur-xl border border-app-border-default rounded-xl shadow-app-xl">
                    <SelectItem value="all">Todos os níveis</SelectItem>
                    <SelectItem value="beginner">Iniciante</SelectItem>
                    <SelectItem value="intermediate">Intermediário</SelectItem>
                    <SelectItem value="advanced">Avançado</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterGoal} onValueChange={setFilterGoal}>
                  <SelectTrigger className="bg-app-card border-0 shadow-app-medium">
                    <SelectValue placeholder="Objetivo" />
                  </SelectTrigger>
                  <SelectContent className="bg-app-overlay backdrop-blur-xl border border-app-border-default rounded-xl shadow-app-xl">
                    <SelectItem value="all">Todos os objetivos</SelectItem>
                    <SelectItem value="strength">Força</SelectItem>
                    <SelectItem value="hypertrophy">Hipertrofia</SelectItem>
                    <SelectItem value="endurance">Resistência</SelectItem>
                    <SelectItem value="weight_loss">Emagrecimento</SelectItem>
                    <SelectItem value="general_fitness">Condicionamento</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Workouts List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {isLoading ? (
                  <div className="col-span-full text-center py-8">
                    <div className="w-8 h-8 border-3 border-app-achievement-workout/20 border-t-app-achievement-workout rounded-full animate-spin mx-auto"></div>
                    <p className="text-app-text-secondary mt-2">Carregando treinos...</p>
                  </div>
                ) : filteredWorkouts.length === 0 ? (
                  <div className="col-span-full text-center py-8">
                    <Dumbbell className="h-12 w-12 text-app-text-muted mx-auto mb-2" />
                    <p className="text-app-text-secondary">Nenhum treino encontrado</p>
                  </div>
                ) : (
                  filteredWorkouts.map(workout => {
                    const GoalIcon = GOAL_ICONS[workout.goal as keyof typeof GOAL_ICONS] || Target;
                    const isAlreadySelected = selectedWorkouts.some(
                      sw => sw.workout.id === workout.id && sw.day_of_week === selectedDay
                    );
                    
                    return (
                      <button
                        key={workout.id}
                        onClick={() => !isAlreadySelected && handleWorkoutClick(workout)}
                        disabled={isAlreadySelected}
                        className={`p-4 bg-app-card rounded-lg shadow-app-medium text-left transition-all duration-300 ${
                          isAlreadySelected 
                            ? 'opacity-50 cursor-not-allowed' 
                            : 'hover:shadow-app-large hover:scale-[1.02] cursor-pointer'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 ${LEVEL_COLORS[workout.level as keyof typeof LEVEL_COLORS] || 'bg-app-bg-secondary'} rounded-lg`}>
                            <GoalIcon className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-app-text-primary flex items-center gap-2">
                              {workout.name}
                              {isAlreadySelected && (
                                <CheckCircle2 className="h-4 w-4 text-app-achievement-consecutive" />
                              )}
                            </h4>
                            <p className="text-sm text-app-text-secondary mt-1">
                              {workout.description}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="secondary" className="text-xs bg-app-bg-secondary text-app-text-primary">
                                {workout.level}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="bg-app-bg-accent rounded-xl p-6 border border-app-border-muted">
        <h3 className="font-semibold text-app-text-primary mb-4 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-app-achievement-consecutive" />
          Resumo do Plano
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-app-achievement-workout">
              {schedule.length}
            </p>
            <p className="text-sm text-app-text-secondary">dias por semana</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-app-achievement-workout">
              {selectedWorkouts.length}
            </p>
            <p className="text-sm text-app-text-secondary">treinos selecionados</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-app-achievement-workout">
              {[...new Set(selectedWorkouts.map(sw => sw.workout.id))].length}
            </p>
            <p className="text-sm text-app-text-secondary">treinos únicos</p>
          </div>
        </div>
      </div>
    </div>
  );
}