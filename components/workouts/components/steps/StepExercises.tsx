// components/workouts/steps/StepExercises.tsx
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Dumbbell, 
  Search, 
  Plus, 
  Minus, 
  Target, 
  Clock, 
  Hash,
  StickyNote,
  Trash2,
  Filter,
  X
} from 'lucide-react';
import { MUSCLE_GROUPS, EQUIPMENT_TYPES } from '../../constants';
import { StepExercisesProps } from '../../types';

export function StepExercises({
  exercises,
  selectedExercises,
  filters,
  onExerciseSelect,
  onExerciseRemove,
  onExerciseUpdate,
  onFiltersChange,
  isLoading
}: StepExercisesProps) {
  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({ [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      muscleGroup: 'all',
      equipment: 'all'
    });
  };

  const hasActiveFilters = filters.search || filters.muscleGroup !== 'all' || filters.equipment !== 'all';

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Dumbbell className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Exercícios do Treino
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Selecione e configure os exercícios para o seu treino
        </p>
      </div>

      {/* Selected Exercises Summary */}
      {selectedExercises.length > 0 && (
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-red-200/50 to-orange-200/50 dark:from-red-700/50 dark:to-orange-700/50 rounded-2xl blur-xl"></div>
          <div className="relative p-6 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
                Exercícios Selecionados
              </h4>
              <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-600">
                {selectedExercises.length} exercício{selectedExercises.length !== 1 ? 's' : ''}
              </Badge>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {selectedExercises.slice(0, 4).map((exercise) => (
                <div key={exercise.id} className="flex items-center gap-2 p-2 bg-white/80 dark:bg-gray-800/80 rounded-lg">
                  <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Dumbbell className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {exercise.name}
                  </span>
                </div>
              ))}
              {selectedExercises.length > 4 && (
                <div className="flex items-center justify-center p-2 bg-white/80 dark:bg-gray-800/80 rounded-lg">
                  <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                    +{selectedExercises.length - 4} mais
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Exercise Library */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Buscar exercícios..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10 h-12 bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={`h-12 px-4 border-2 rounded-xl transition-all duration-300 ${
                  hasActiveFilters 
                    ? 'border-red-300 bg-red-50 text-red-700 dark:border-red-600 dark:bg-red-900/20 dark:text-red-300'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <Filter className="h-5 w-5 mr-2" />
                Filtros
                {hasActiveFilters && (
                  <Badge className="ml-2 bg-red-500 text-white rounded-full w-5 h-5 p-0 text-xs">
                    !
                  </Badge>
                )}
              </Button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Filtros Avançados</h4>
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-red-600 hover:text-red-700 dark:text-red-400"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Limpar
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Grupo Muscular
                    </label>
                    <Select value={filters.muscleGroup} onValueChange={(value) => handleFilterChange('muscleGroup', value)}>
                      <SelectTrigger className="h-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MUSCLE_GROUPS.map((group) => (
                          <SelectItem key={group.value} value={group.value}>
                            {group.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Equipamento
                    </label>
                    <Select value={filters.equipment} onValueChange={(value) => handleFilterChange('equipment', value)}>
                      <SelectTrigger className="h-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {EQUIPMENT_TYPES.map((equipment) => (
                          <SelectItem key={equipment.value} value={equipment.value}>
                            {equipment.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Exercise List */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="p-4 bg-white dark:bg-gray-800 rounded-xl animate-pulse">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      </div>
                      <div className="w-20 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : exercises.length === 0 ? (
              <div className="text-center py-12">
                <Dumbbell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Nenhum exercício encontrado
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Tente ajustar os filtros de busca
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {exercises.map((exercise) => {
                  const isSelected = selectedExercises.some(e => e.id === exercise.id);
                  
                  return (
                    <div
                      key={exercise.id}
                      className={`relative group p-4 rounded-xl transition-all duration-300 ${
                        isSelected
                          ? 'bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-200 dark:border-red-700'
                          : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-red-200 dark:hover:border-red-700'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-xl flex items-center justify-center shadow-lg ${
                          isSelected
                            ? 'bg-gradient-to-br from-red-500 to-red-600'
                            : 'bg-gradient-to-br from-gray-500 to-gray-600'
                        }`}>
                          <Dumbbell className="h-8 w-8 text-white" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                            {exercise.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                            {exercise.description}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {exercise.muscle_group.slice(0, 2).map((muscle) => (
                              <Badge
                                key={muscle}
                                variant="secondary"
                                className="text-xs bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                              >
                                {muscle}
                              </Badge>
                            ))}
                            {exercise.muscle_group.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{exercise.muscle_group.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <Button
                          onClick={() => onExerciseSelect(exercise)}
                          disabled={isSelected}
                          className={`h-10 px-4 rounded-lg font-semibold transition-all duration-300 ${
                            isSelected
                              ? 'bg-green-500 hover:bg-green-600 text-white'
                              : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
                          }`}
                        >
                          {isSelected ? (
                            <>✓ Adicionado</>
                          ) : (
                            <>
                              <Plus className="h-4 w-4 mr-1" />
                              Adicionar
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Selected Exercises Configuration */}
        <div className="space-y-6">
          <div className="sticky top-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-2 border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Target className="h-5 w-5 text-red-600 dark:text-red-400" />
                  Exercícios Selecionados
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Configure séries, repetições e descanso
                </p>
              </div>
              
              <div className="p-6">
                {selectedExercises.length === 0 ? (
                  <div className="text-center py-8">
                    <Dumbbell className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Nenhum exercício selecionado ainda
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {selectedExercises.map((exercise, index) => (
                      <div
                        key={exercise.id}
                        className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                                {exercise.name}
                              </h4>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onExerciseRemove(exercise.id)}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 p-2"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block flex items-center gap-1">
                              <Hash className="h-3 w-3" />
                              Séries
                            </label>
                            <Input
                              type="number"
                              value={exercise.sets}
                              onChange={(e) => onExerciseUpdate(exercise.id, 'sets', parseInt(e.target.value) || 1)}
                              className="h-8 text-sm bg-white dark:bg-gray-800"
                              min="1"
                              max="10"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block flex items-center gap-1">
                              <Target className="h-3 w-3" />
                              Reps
                            </label>
                            <Input
                              type="number"
                              value={exercise.reps}
                              onChange={(e) => onExerciseUpdate(exercise.id, 'reps', parseInt(e.target.value) || 1)}
                              className="h-8 text-sm bg-white dark:bg-gray-800"
                              min="1"
                              max="100"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Rest (s)
                            </label>
                            <Input
                              type="number"
                              value={exercise.rest}
                              onChange={(e) => onExerciseUpdate(exercise.id, 'rest', parseInt(e.target.value) || 0)}
                              className="h-8 text-sm bg-white dark:bg-gray-800"
                              min="0"
                              max="600"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block flex items-center gap-1">
                            <StickyNote className="h-3 w-3" />
                            Observações
                          </label>
                          <Input
                            placeholder="Observações opcionais..."
                            value={exercise.notes}
                            onChange={(e) => onExerciseUpdate(exercise.id, 'notes', e.target.value)}
                            className="h-8 text-sm bg-white dark:bg-gray-800"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}