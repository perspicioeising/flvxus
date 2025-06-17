import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Filter, X, LayoutGrid, List } from 'lucide-react';
import { WorkoutPlanFiltersProps } from '../../types';
import { PLAN_STATUS_OPTIONS, MODULE_COLORS } from '../../constants';

interface ExtendedWorkoutPlanFiltersProps extends WorkoutPlanFiltersProps {
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
}

export function WorkoutPlansFilters({ 
  filters, 
  onFiltersChange,
  viewMode = 'grid',
  onViewModeChange 
}: ExtendedWorkoutPlanFiltersProps) {
  const hasActiveFilters = filters.searchQuery !== '' || filters.statusFilter !== 'all';

  const handleClearFilters = () => {
    onFiltersChange({ searchQuery: '', statusFilter: 'all' });
  };

  return (
    <div className="relative mb-8">
      <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 via-orange-500/10 to-orange-600/10 dark:from-orange-500/5 dark:via-orange-400/5 dark:to-orange-500/5 rounded-2xl blur-xl"></div>
      <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl rounded-2xl">
        <CardContent className="p-4 sm:p-6">
          
          {/* Mobile-first layout */}
          <div className="space-y-4">
            
            {/* Search bar - full width on mobile */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-orange-600/20 rounded-xl blur opacity-20"></div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-orange-600 dark:text-orange-400" />
                <Input
                  placeholder="Buscar planos por nome, descrição ou aluno..."
                  className="pl-12 h-12 text-base bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 transition-all duration-300"
                  value={filters.searchQuery}
                  onChange={(e) => onFiltersChange({
                    searchQuery: e.target.value,
                    statusFilter: 'all'
                  })}
                />
              </div>
            </div>

            {/* Filters row - responsive */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              
              {/* Status filter */}
              <Select 
                value={filters.statusFilter} 
                onValueChange={(value: any) => onFiltersChange({
                  statusFilter: value,
                  searchQuery: ''
                })}
              >
                <SelectTrigger className="h-12 bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <Filter className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    <span className="font-semibold text-sm">Status</span>
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white/95 dark:bg-gray-900/95 border-0 rounded-xl shadow-2xl backdrop-blur-xl">
                  {PLAN_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
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
                        ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-lg'
                        : 'bg-white/80 dark:bg-gray-800/80 hover:bg-orange-50 dark:hover:bg-orange-900/20 text-orange-600 dark:text-orange-400'
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
                        ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-lg'
                        : 'bg-white/80 dark:bg-gray-800/80 hover:bg-orange-50 dark:hover:bg-orange-900/20 text-orange-600 dark:text-orange-400'
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
                  onClick={handleClearFilters}
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