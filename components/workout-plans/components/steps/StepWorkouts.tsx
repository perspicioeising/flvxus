// components/workout-plans/components/steps/StepWorkouts.tsx
import { useState } from 'react';
import { Dumbbell, Search, Filter, Plus, X, Target, Clock, TrendingUp, CheckCircle2, Info, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DAYS_OF_WEEK } from '../../constants';

interface Workout {
  id: string;
  name: string;
  description: string;
  level: string;
  goal: string;
  exercises_count?: number;
  estimated_duration?: number;
}

interface SelectedWorkout {
  workout: Workout;
  day_of_week: number;
}

interface StepWorkoutsProps {
  availableWorkouts: Workout[];
  selectedWorkouts: SelectedWorkout[];
  schedule: number[];
  onWorkoutSelect: (workout: Workout, day: number) => void;
  onWorkoutRemove: (workoutId: string, day: number) => void;
  isLoading: boolean;
}

const LEVEL_COLORS = {
  beginner: 'from-green-500 to-emerald-500',
  intermediate: 'from-blue-500 to-cyan-500',
  advanced: 'from-purple-500 to-pink-500'
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
                         workout.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === 'all' || workout.level === filterLevel;
    const matchesGoal = filterGoal === 'all' || workout.goal === filterGoal;
    
    return matchesSearch && matchesLevel && matchesGoal;
  });

  // Group selected workouts by day
  const workoutsByDay = schedule.reduce((acc, day) => {
    acc[day] = selectedWorkouts.filter(sw => sw.day_of_week === day);
    return acc;
  }, {} as Record<number, SelectedWorkout[]>);

  const handleWorkoutClick = (workout: Workout) => {
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
          <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg mx-auto">
            <Dumbbell className="h-10 w-10 text-white" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">3</span>
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Seleção de Treinos
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Atribua treinos para cada dia da semana
          </p>
        </div>
      </div>

      {/* Schedule Overview */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          Dias Programados
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {schedule.map(day => {
            const dayWorkouts = workoutsByDay[day] || [];
            
            return (
              <div key={day} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 to-amber-600/10 rounded-xl blur-lg"></div>
                <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-gray-900 dark:text-white">
                      {getDayName(day)}
                    </h4>
                    <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                      {dayWorkouts.length} treino{dayWorkouts.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>

                  {/* Workouts for this day */}
                  <div className="space-y-2 mb-3">
                    {dayWorkouts.map((sw, index) => (
                      <div key={`${sw.workout.id}-${index}`} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-400 rounded-lg flex items-center justify-center">
                            <Dumbbell className="h-4 w-4 text-white" />
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
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
                    className="w-full border-dashed border-2 border-orange-300 dark:border-orange-700 hover:border-orange-400 dark:hover:border-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20"
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
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 to-red-600/20 rounded-xl blur-xl"></div>
          <div className="relative bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-orange-800 dark:text-orange-300 flex items-center gap-2">
                <Info className="h-5 w-5" />
                Selecionando treino para {getDayName(selectedDay)}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedDay(null)}
                className="hover:bg-orange-200 dark:hover:bg-orange-800/30"
              >
                <X className="h-4 w-4 mr-1" />
                Cancelar
              </Button>
            </div>

            {/* Search and Filters */}
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar treinos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white dark:bg-gray-800 border-0 shadow-md"
                />
              </div>

              <div className="flex gap-3">
                <Select value={filterLevel} onValueChange={setFilterLevel}>
                  <SelectTrigger className="bg-white dark:bg-gray-800 border-0 shadow-md">
                    <SelectValue placeholder="Nível" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os níveis</SelectItem>
                    <SelectItem value="beginner">Iniciante</SelectItem>
                    <SelectItem value="intermediate">Intermediário</SelectItem>
                    <SelectItem value="advanced">Avançado</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterGoal} onValueChange={setFilterGoal}>
                  <SelectTrigger className="bg-white dark:bg-gray-800 border-0 shadow-md">
                    <SelectValue placeholder="Objetivo" />
                  </SelectTrigger>
                  <SelectContent>
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
                    <div className="w-8 h-8 border-3 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto"></div>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">Carregando treinos...</p>
                  </div>
                ) : filteredWorkouts.length === 0 ? (
                  <div className="col-span-full text-center py-8">
                    <Dumbbell className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-600 dark:text-gray-400">Nenhum treino encontrado</p>
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
                        className={`p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md text-left transition-all duration-300 ${
                          isAlreadySelected 
                            ? 'opacity-50 cursor-not-allowed' 
                            : 'hover:shadow-lg hover:scale-[1.02] cursor-pointer'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 bg-gradient-to-br ${LEVEL_COLORS[workout.level as keyof typeof LEVEL_COLORS] || 'from-gray-500 to-gray-600'} rounded-lg`}>
                            <GoalIcon className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                              {workout.name}
                              {isAlreadySelected && (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              )}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {workout.description}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="secondary" className="text-xs">
                                {workout.level}
                              </Badge>
                              {workout.exercises_count && (
                                <Badge variant="outline" className="text-xs">
                                  {workout.exercises_count} exercícios
                                </Badge>
                              )}
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
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          Resumo do Plano
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {schedule.length}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">dias por semana</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {selectedWorkouts.length}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">treinos selecionados</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {[...new Set(selectedWorkouts.map(sw => sw.workout.id))].length}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">treinos únicos</p>
          </div>
        </div>
      </div>
    </div>
  );
}