// components/workouts/components/list/WorkoutFilters.tsx
'use client';

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Filter, X, Target, Zap } from "lucide-react";
import { WorkoutFiltersProps } from '../../types';
import { DIFFICULTY_LEVELS, WORKOUT_GOALS } from '../../constants';

interface ExtendedWorkoutFiltersProps extends WorkoutFiltersProps {
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
}

export function WorkoutFilters({ 
  filters, 
  onFiltersChange, 
  onClearFilters,
  viewMode = 'grid',
  onViewModeChange 
}: ExtendedWorkoutFiltersProps) {
  const hasActiveFilters = filters.search !== '' || filters.level !== 'all' || filters.goal !== 'all';
  const activeFiltersCount = [
    filters.search !== '',
    filters.level !== 'all',
    filters.goal !== 'all'
  ].filter(Boolean).length;

  return (
    <div className="mb-6 space-y-4">
      {/* Search Bar - Mobile First */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-workout/5 via-app-achievement-workout/10 to-app-achievement-workout/5 rounded-xl blur-lg"></div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-app-text-muted z-10" />
          <Input
            placeholder="Buscar treinos..."
            className="pl-12 h-12 sm:h-14 text-base bg-app-card border-app-border-muted rounded-xl shadow-app-medium hover:shadow-app-large focus:shadow-app-large focus:border-app-achievement-workout transition-all duration-300"
            value={filters.search}
            onChange={(e) => onFiltersChange({ search: e.target.value })}
          />
          {filters.search && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onFiltersChange({ search: '' })}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-full hover:bg-app-border-accent/30"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Filters Row - Mobile Optimized */}
      <div className="grid grid-cols-4 gap-3">
        {/* Level Filter */}
        <Select 
          value={filters.level} 
          onValueChange={(value) => onFiltersChange({ level: value })}
        >
          <SelectTrigger className={`
            col-span-1 h-12 sm:h-14 rounded-xl border-2 transition-all duration-200 flex items-center justify-center p-0
            ${filters.level !== 'all' 
              ? 'bg-app-achievement-workout/10 border-app-border-accent shadow-app-medium' 
              : 'bg-app-card border-app-border-muted hover:border-app-border-accent hover:shadow-app-medium'
            }
          `}>
            <div className="flex flex-col items-center gap-1">
              <Zap className={`h-4 w-4 sm:h-5 sm:w-5 ${filters.level !== 'all' ? 'text-app-achievement-workout' : 'text-app-text-muted'}`} />
              {filters.level !== 'all' && (
                <div className="w-1 h-1 rounded-full bg-app-achievement-workout"></div>
              )}
            </div>
          </SelectTrigger>
          <SelectContent className="bg-app-overlay backdrop-blur-xl border border-app-border-default rounded-xl shadow-app-xl">
            <SelectItem value="all" className="focus:bg-app-border-accent/20">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-app-text-muted"></div>
                Todos os Níveis
              </div>
            </SelectItem>
            {DIFFICULTY_LEVELS.map((level) => (
              <SelectItem key={level.value} value={level.value} className="focus:bg-app-achievement-workout/10">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-app-achievement-workout"></div>
                  {level.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Goal Filter */}
        <Select 
          value={filters.goal} 
          onValueChange={(value) => onFiltersChange({ goal: value })}
        >
          <SelectTrigger className={`
            col-span-1 h-12 sm:h-14 rounded-xl border-2 transition-all duration-200 flex items-center justify-center p-0
            ${filters.goal !== 'all' 
              ? 'bg-app-achievement-consecutive/10 border-app-border-accent shadow-app-medium' 
              : 'bg-app-card border-app-border-muted hover:border-app-border-accent hover:shadow-app-medium'
            }
          `}>
            <div className="flex flex-col items-center gap-1">
              <Target className={`h-4 w-4 sm:h-5 sm:w-5 ${filters.goal !== 'all' ? 'text-app-achievement-consecutive' : 'text-app-text-muted'}`} />
              {filters.goal !== 'all' && (
                <div className="w-1 h-1 rounded-full bg-app-achievement-consecutive"></div>
              )}
            </div>
          </SelectTrigger>
          <SelectContent className="bg-app-overlay backdrop-blur-xl border border-app-border-default rounded-xl shadow-app-xl">
            <SelectItem value="all" className="focus:bg-app-border-accent/20">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-app-text-muted"></div>
                Todos Objetivos
              </div>
            </SelectItem>
            {WORKOUT_GOALS.map((goal) => (
              <SelectItem key={goal.value} value={goal.value} className="focus:bg-app-achievement-consecutive/10">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-app-achievement-consecutive"></div>
                  {goal.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status Badge */}
        {hasActiveFilters ? (
          <div className="col-span-1 h-12 sm:h-14 rounded-xl border-2 border-app-border-accent bg-app-achievement-workout/10 flex items-center justify-center">
            <div className="flex flex-col items-center gap-1">
              <Filter className="h-4 w-4 text-app-achievement-workout" />
              <span className="text-xs font-bold text-app-achievement-workout">{activeFiltersCount}</span>
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

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.search !== '' && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-app-achievement-workout/10 text-app-achievement-workout rounded-full text-sm border border-app-border-accent">
              <Search className="h-3 w-3" />
              <span>"{filters.search}"</span>
              <button 
                onClick={() => onFiltersChange({ search: '' })}
                className="hover:bg-app-achievement-workout/20 rounded-full p-0.5 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          
          {filters.level !== 'all' && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-app-achievement-workout/10 text-app-achievement-workout rounded-full text-sm border border-app-border-accent">
              <Zap className="h-3 w-3" />
              <span>{DIFFICULTY_LEVELS.find(l => l.value === filters.level)?.label}</span>
              <button 
                onClick={() => onFiltersChange({ level: 'all' })}
                className="hover:bg-app-achievement-workout/20 rounded-full p-0.5 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          
          {filters.goal !== 'all' && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-app-achievement-consecutive/10 text-app-achievement-consecutive rounded-full text-sm border border-app-border-accent">
              <Target className="h-3 w-3" />
              <span>{WORKOUT_GOALS.find(g => g.value === filters.goal)?.label}</span>
              <button 
                onClick={() => onFiltersChange({ goal: 'all' })}
                className="hover:bg-app-achievement-consecutive/20 rounded-full p-0.5 transition-colors"
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