// /components/diets/components/list/DietsFilters.tsx

import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Filter, X, Target, Utensils } from 'lucide-react';
import { useDietsFilters } from '../hooks/useDietsFilters';
import { DIET_STATUS_OPTIONS, DIET_GOAL_OPTIONS } from '../constants';

interface DietsFiltersProps {
  onFiltersChange?: (searchQuery: string, statusFilter: string, goalFilter: string) => void;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
}

export function DietsFilters({ 
  onFiltersChange,
  viewMode = 'list',
  onViewModeChange 
}: DietsFiltersProps) {
  const {
    filters,
    hasActiveFilters,
    activeFiltersCount,
    setSearchQuery,
    setStatusFilter,
    setGoalFilter,
    clearFilters,
    clearFilter
  } = useDietsFilters();

  // Notify parent of filter changes
  React.useEffect(() => {
    onFiltersChange?.(filters.searchQuery, filters.statusFilter, filters.goalFilter);
  }, [filters, onFiltersChange]);

  return (
    <div className="mb-6 space-y-4">
      {/* Desktop: Search + Filters na mesma linha */}
      <div className="hidden lg:flex lg:items-center lg:gap-4">
        {/* Search Bar - Desktop (flexível) */}
        <div className="relative flex-1">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-green-500/5 to-teal-500/5 rounded-2xl blur-lg"></div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
            <Input
              placeholder="Buscar por nome da dieta, descrição ou aluno..."
              className="pl-12 h-14 text-base bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm hover:shadow-md focus:shadow-lg focus:border-emerald-500 dark:focus:border-emerald-400 transition-all duration-300 w-full"
              value={filters.searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {filters.searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Filters Desktop - mesma linha */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Status Filter */}
          <Select 
            value={filters.statusFilter} 
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className={`
              w-14 h-14 rounded-2xl border-2 transition-all duration-200 flex items-center justify-center
              ${filters.statusFilter !== 'all' 
                ? 'bg-emerald-50 border-emerald-200 shadow-md dark:bg-emerald-900/20 dark:border-emerald-700' 
                : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:hover:border-gray-600'
              }
            `}>
              <Utensils className={`h-6 w-6 ${filters.statusFilter !== 'all' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`} />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl">
              {DIET_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value} className="focus:bg-emerald-50 dark:focus:bg-emerald-900/20">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${option.value === 'all' ? 'bg-gray-400' : 'bg-emerald-500'}`}></div>
                    {option.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Goal Filter */}
          <Select 
            value={filters.goalFilter} 
            onValueChange={setGoalFilter}
          >
            <SelectTrigger className={`
              w-14 h-14 rounded-2xl border-2 transition-all duration-200 flex items-center justify-center
              ${filters.goalFilter !== 'all' 
                ? 'bg-blue-50 border-blue-200 shadow-md dark:bg-blue-900/20 dark:border-blue-700' 
                : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:hover:border-gray-600'
              }
            `}>
              <Target className={`h-6 w-6 ${filters.goalFilter !== 'all' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`} />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl">
              {DIET_GOAL_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value} className="focus:bg-blue-50 dark:focus:bg-blue-900/20">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${option.value === 'all' ? 'bg-gray-400' : 'bg-blue-500'}`}></div>
                    {option.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Clear All Button Desktop */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={clearFilters}
              className="h-14 px-4 rounded-2xl border-2 border-gray-200 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600 dark:border-gray-700 dark:hover:border-emerald-700 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-400 transition-all duration-200 group"
            >
              <X className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-200" />
              Limpar
            </Button>
          )}
        </div>
      </div>

      {/* Mobile: Layout melhorado */}
      <div className="lg:hidden">
        {/* Search Bar - Mobile */}
        <div className="relative mb-4">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-green-500/5 to-teal-500/5 rounded-2xl blur-lg"></div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
            <Input
              placeholder="Buscar dieta..."
              className="pl-12 h-12 text-base bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm hover:shadow-md focus:shadow-lg focus:border-emerald-500 dark:focus:border-emerald-400 transition-all duration-300 w-full"
              value={filters.searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {filters.searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Filter Row - Mobile - Grid layout */}
        <div className="grid grid-cols-4 gap-3">
          {/* Status Filter - Expandido */}
          <Select 
            value={filters.statusFilter} 
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className={`
              col-span-1 h-14 rounded-xl border-2 transition-all duration-200 flex items-center justify-center p-0
              ${filters.statusFilter !== 'all' 
                ? 'bg-emerald-50 border-emerald-200 shadow-md dark:bg-emerald-900/20 dark:border-emerald-700' 
                : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm dark:bg-gray-800 dark:border-gray-700'
              }
            `}>
              <div className="flex flex-col items-center gap-1">
                <Utensils className={`h-5 w-5 ${filters.statusFilter !== 'all' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`} />
                {filters.statusFilter !== 'all' && (
                  <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
                )}
              </div>
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl">
              {DIET_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value} className="focus:bg-emerald-50 dark:focus:bg-emerald-900/20">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${option.value === 'all' ? 'bg-gray-400' : 'bg-emerald-500'}`}></div>
                    {option.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Goal Filter - Expandido */}
          <Select 
            value={filters.goalFilter} 
            onValueChange={setGoalFilter}
          >
            <SelectTrigger className={`
              col-span-1 h-14 rounded-xl border-2 transition-all duration-200 flex items-center justify-center p-0
              ${filters.goalFilter !== 'all' 
                ? 'bg-blue-50 border-blue-200 shadow-md dark:bg-blue-900/20 dark:border-blue-700' 
                : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm dark:bg-gray-800 dark:border-gray-700'
              }
            `}>
              <div className="flex flex-col items-center gap-1">
                <Target className={`h-5 w-5 ${filters.goalFilter !== 'all' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`} />
                {filters.goalFilter !== 'all' && (
                  <div className="w-1 h-1 rounded-full bg-blue-500"></div>
                )}
              </div>
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl">
              {DIET_GOAL_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value} className="focus:bg-blue-50 dark:focus:bg-blue-900/20">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${option.value === 'all' ? 'bg-gray-400' : 'bg-blue-500'}`}></div>
                    {option.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Badge - Expandido */}
          {hasActiveFilters ? (
            <div className="col-span-1 h-14 rounded-xl border-2 border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-700 flex items-center justify-center">
              <div className="flex flex-col items-center gap-1">
                <Filter className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">{activeFiltersCount}</span>
              </div>
            </div>
          ) : (
            <div className="col-span-1 h-14 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center">
              <Filter className="h-4 w-4 text-gray-400" />
            </div>
          )}

          {/* Clear Button - Expandido */}
          {hasActiveFilters ? (
            <Button
              variant="ghost"
              onClick={clearFilters}
              className="col-span-1 h-14 rounded-xl border-2 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 dark:border-emerald-800 dark:hover:bg-emerald-900/20 dark:hover:border-emerald-700 transition-all duration-200 group flex items-center justify-center"
            >
              <div className="flex flex-col items-center gap-1">
                <X className="h-4 w-4 text-emerald-600 dark:text-emerald-400 group-hover:rotate-90 transition-transform duration-200" />
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Limpar</span>
              </div>
            </Button>
          ) : (
            <div className="col-span-1 h-14 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center">
              <div className="flex flex-col items-center gap-1">
                <X className="h-4 w-4 text-gray-400" />
                <span className="text-xs text-gray-400">Limpar</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.searchQuery !== '' && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm dark:bg-emerald-900/20 dark:text-emerald-300">
              <Search className="h-3 w-3" />
              <span>"{filters.searchQuery}"</span>
              <button 
                onClick={() => clearFilter('searchQuery')}
                className="hover:bg-emerald-200 dark:hover:bg-emerald-800 rounded-full p-0.5 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          
          {filters.statusFilter !== 'all' && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm dark:bg-blue-900/20 dark:text-blue-300">
              <Utensils className="h-3 w-3" />
              <span>{DIET_STATUS_OPTIONS.find(option => option.value === filters.statusFilter)?.label}</span>
              <button 
                onClick={() => clearFilter('statusFilter')}
                className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {filters.goalFilter !== 'all' && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-sm dark:bg-purple-900/20 dark:text-purple-300">
              <Target className="h-3 w-3" />
              <span>{DIET_GOAL_OPTIONS.find(option => option.value === filters.goalFilter)?.label}</span>
              <button 
                onClick={() => clearFilter('goalFilter')}
                className="hover:bg-purple-200 dark:hover:bg-purple-800 rounded-full p-0.5 transition-colors"
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