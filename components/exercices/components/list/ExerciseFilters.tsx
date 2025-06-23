// /components/exercises/components/list/ExerciseFilters.tsx

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, X, Dumbbell, Zap } from "lucide-react";
import { ExerciseFiltersProps } from "@/components/exercices/types/exercise";
import { MUSCLE_GROUPS, EQUIPMENT_TYPES } from "@/components/exercices/components/constants/exercise";

export function ExerciseFilters({
  filters,
  viewMode,
  onFiltersChange,
  onViewModeChange,
  onClearFilters
}: ExerciseFiltersProps) {
  const hasActiveFilters = filters.searchQuery || filters.muscleFilter !== 'all' || filters.equipmentFilter !== 'all';
  const activeFiltersCount = [
    filters.searchQuery,
    filters.muscleFilter !== 'all',
    filters.equipmentFilter !== 'all'
  ].filter(Boolean).length;

  return (
    <div className="mb-6 space-y-4">
      {/* Search Bar - Mobile First */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-workout/5 via-app-achievement-exercise/5 to-app-achievement-workout/5 rounded-xl blur-lg"></div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-app-text-muted z-10" />
          <Input
            placeholder="Buscar exercícios..."
            className="pl-12 h-12 sm:h-14 text-base bg-app-card border-app-border-muted rounded-xl shadow-app-medium hover:shadow-app-large focus:shadow-app-large focus:border-app-text-accent transition-all duration-300"
            value={filters.searchQuery}
            onChange={(e) => onFiltersChange({ searchQuery: e.target.value })}
          />
          {filters.searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onFiltersChange({ searchQuery: '' })}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-full hover:bg-app-border-accent/30"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Filters Row - Mobile Optimized */}
      <div className="grid grid-cols-4 gap-3">
        {/* Muscle Group Filter */}
        <Select 
          value={filters.muscleFilter} 
          onValueChange={(value) => onFiltersChange({ muscleFilter: value })}
        >
          <SelectTrigger className={`
            col-span-1 h-12 sm:h-14 rounded-xl border-2 transition-all duration-200 flex items-center justify-center p-0
            ${filters.muscleFilter !== 'all' 
              ? 'bg-achievement-workout/10 border-app-border-accent shadow-app-medium' 
              : 'bg-app-card border-app-border-muted hover:border-app-border-accent hover:shadow-app-medium'
            }
          `}>
            <div className="flex flex-col items-center gap-1">
              <Dumbbell className={`h-4 w-4 sm:h-5 sm:w-5 ${filters.muscleFilter !== 'all' ? 'text-achievement-workout' : 'text-app-text-muted'}`} />
              {filters.muscleFilter !== 'all' && (
                <div className="w-1 h-1 rounded-full bg-achievement-workout"></div>
              )}
            </div>
          </SelectTrigger>
          <SelectContent className="bg-app-overlay backdrop-blur-xl border border-app-border-default rounded-xl shadow-app-xl">
            <SelectItem value="all" className="focus:bg-app-border-accent/20">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-app-text-muted"></div>
                Todos os Grupos
              </div>
            </SelectItem>
            {MUSCLE_GROUPS.map((group) => (
              <SelectItem key={group} value={group} className="focus:bg-achievement-workout/10">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-achievement-workout"></div>
                  {group}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Equipment Filter */}
        <Select 
          value={filters.equipmentFilter} 
          onValueChange={(value) => onFiltersChange({ equipmentFilter: value })}
        >
          <SelectTrigger className={`
            col-span-1 h-12 sm:h-14 rounded-xl border-2 transition-all duration-200 flex items-center justify-center p-0
            ${filters.equipmentFilter !== 'all' 
              ? 'bg-achievement-exercise/10 border-app-border-accent shadow-app-medium' 
              : 'bg-app-card border-app-border-muted hover:border-app-border-accent hover:shadow-app-medium'
            }
          `}>
            <div className="flex flex-col items-center gap-1">
              <Zap className={`h-4 w-4 sm:h-5 sm:w-5 ${filters.equipmentFilter !== 'all' ? 'text-achievement-exercise' : 'text-app-text-muted'}`} />
              {filters.equipmentFilter !== 'all' && (
                <div className="w-1 h-1 rounded-full bg-achievement-exercise"></div>
              )}
            </div>
          </SelectTrigger>
          <SelectContent className="bg-app-overlay backdrop-blur-xl border border-app-border-default rounded-xl shadow-app-xl">
            <SelectItem value="all" className="focus:bg-app-border-accent/20">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-app-text-muted"></div>
                Todos Equipamentos
              </div>
            </SelectItem>
            {EQUIPMENT_TYPES.map((type) => (
              <SelectItem key={type} value={type} className="focus:bg-achievement-exercise/10">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-achievement-exercise"></div>
                  {type}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status Badge */}
        {hasActiveFilters ? (
          <div className="col-span-1 h-12 sm:h-14 rounded-xl border-2 border-app-border-accent bg-achievement-consecutive/10 flex items-center justify-center">
            <div className="flex flex-col items-center gap-1">
              <Filter className="h-4 w-4 text-achievement-consecutive" />
              <span className="text-xs font-bold text-achievement-consecutive">{activeFiltersCount}</span>
            </div>
          </div>
        ) : (
          <div className="col-span-1 h-12 sm:h-14 rounded-xl border-2 border-dashed border-app-border-muted flex items-center justify-center">
            <Filter className="h-4 w-4 text-app-text-muted" />
          </div>
        )}

        {/* Clear Button */}
        {hasActiveFilters ? (
          <Button
            variant="ghost"
            onClick={onClearFilters}
            className="col-span-1 h-12 sm:h-14 rounded-xl border-2 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-700 transition-all duration-200 group flex items-center justify-center"
          >
            <div className="flex flex-col items-center gap-1">
              <X className="h-4 w-4 text-red-600 dark:text-red-400 group-hover:rotate-90 transition-transform duration-200" />
              <span className="text-xs font-medium text-red-600 dark:text-red-400">Limpar</span>
            </div>
          </Button>
        ) : (
          <div className="col-span-1 h-12 sm:h-14 rounded-xl border-2 border-dashed border-app-border-muted flex items-center justify-center">
            <div className="flex flex-col items-center gap-1">
              <X className="h-4 w-4 text-app-text-muted" />
              <span className="text-xs text-app-text-muted">Limpar</span>
            </div>
          </div>
        )}
      </div>

      {/* Active Filters Summary - Melhorado */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.searchQuery && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-achievement-workout/10 text-achievement-workout rounded-full text-sm border border-app-border-accent">
              <Search className="h-3 w-3" />
              <span>"{filters.searchQuery}"</span>
              <button 
                onClick={() => onFiltersChange({ searchQuery: '' })}
                className="hover:bg-achievement-workout/20 rounded-full p-0.5 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          
          {filters.muscleFilter !== 'all' && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-achievement-consecutive/10 text-achievement-consecutive rounded-full text-sm border border-app-border-accent">
              <Dumbbell className="h-3 w-3" />
              <span>{filters.muscleFilter}</span>
              <button 
                onClick={() => onFiltersChange({ muscleFilter: 'all' })}
                className="hover:bg-achievement-consecutive/20 rounded-full p-0.5 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          
          {filters.equipmentFilter !== 'all' && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-achievement-exercise/10 text-achievement-exercise rounded-full text-sm border border-app-border-accent">
              <Zap className="h-3 w-3" />
              <span>{filters.equipmentFilter}</span>
              <button 
                onClick={() => onFiltersChange({ equipmentFilter: 'all' })}
                className="hover:bg-achievement-exercise/20 rounded-full p-0.5 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}