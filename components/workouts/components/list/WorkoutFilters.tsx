// components/workouts/components/list/WorkoutFilters.tsx
'use client';

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Filter, X, LayoutGrid, List } from "lucide-react";
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

  return (
    <div className="relative mb-8">
      <div className="absolute inset-0 bg-gradient-to-r from-pink-600/10 via-rose-500/10 to-pink-600/10 dark:from-pink-500/5 dark:via-rose-400/5 dark:to-pink-500/5 rounded-2xl blur-xl"></div>
      <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl rounded-2xl">
        <CardContent className="p-4 sm:p-6">
          
          {/* Mobile-first layout */}
          <div className="space-y-4">
            
            {/* Search bar - full width on mobile */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-xl blur opacity-20"></div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-pink-600 dark:text-pink-400" />
                <Input
                  placeholder="Buscar treinos..."
                  className="pl-12 h-12 text-base bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 transition-all duration-300"
                  value={filters.search}
                  onChange={(e) => onFiltersChange({ search: e.target.value })}
                />
              </div>
            </div>

            {/* Filters row - responsive */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              
              {/* Level filter */}
              <Select value={filters.level} onValueChange={(value) => onFiltersChange({ level: value })}>
                <SelectTrigger className="h-12 bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <Filter className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                    <span className="font-semibold text-sm">Nível</span>
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white/95 dark:bg-gray-900/95 border-0 rounded-xl shadow-2xl backdrop-blur-xl">
                  <SelectItem value="all">Todos os Níveis</SelectItem>
                  {DIFFICULTY_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Goal filter */}
              <Select value={filters.goal} onValueChange={(value) => onFiltersChange({ goal: value })}>
                <SelectTrigger className="h-12 bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <Filter className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                    <span className="font-semibold text-sm">Objetivo</span>
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white/95 dark:bg-gray-900/95 border-0 rounded-xl shadow-2xl backdrop-blur-xl">
                  <SelectItem value="all">Todos os Objetivos</SelectItem>
                  {WORKOUT_GOALS.map((goal) => (
                    <SelectItem key={goal.value} value={goal.value}>{goal.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* View Mode Toggle */}
              {onViewModeChange && (
                <div className="flex rounded-xl overflow-hidden shadow-lg">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="icon"
                    onClick={() => onViewModeChange('grid')}
                    className={`h-12 w-12 rounded-none ${
                      viewMode === 'grid'
                        ? 'bg-pink-600 hover:bg-pink-700 text-white shadow-lg'
                        : 'bg-white/80 dark:bg-gray-800/80 hover:bg-pink-50 dark:hover:bg-pink-900/20 text-pink-600 dark:text-pink-400'
                    }`}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="icon"
                    onClick={() => onViewModeChange('list')}
                    className={`h-12 w-12 rounded-none ${
                      viewMode === 'list'
                        ? 'bg-pink-600 hover:bg-pink-700 text-white shadow-lg'
                        : 'bg-white/80 dark:bg-gray-800/80 hover:bg-pink-50 dark:hover:bg-pink-900/20 text-pink-600 dark:text-pink-400'
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Clear filters */}
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  onClick={onClearFilters}
                  className="h-12 px-4 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl shadow-lg transition-all duration-300"
                >
                  <X className="h-4 w-4 mr-2" />
                  <span className="text-sm font-semibold">Limpar</span>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}