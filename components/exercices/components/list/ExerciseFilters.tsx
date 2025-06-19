// /components/exercises/components/list/ExerciseFilters.tsx

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, X, Grid, LayoutList } from "lucide-react";
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

  return (
    <div className="relative mb-6">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-500/10 to-purple-600/10 rounded-2xl blur-md"></div>
      <Card className="relative border-0 bg-white/60 dark:bg-gray-900/60 backdrop-blur-md shadow-xl rounded-2xl">
        <CardContent className="p-3 sm:p-6">
          {/* Mobile: Layout em Stack */}
          <div className="lg:hidden">
            {/* Campo de Busca - Mobile */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-600 dark:text-purple-400 z-10" />
              <Input
                placeholder="Buscar exercícios..."
                className="pl-10 h-11 text-sm bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 transition-all duration-300 w-full"
                value={filters.searchQuery}
                onChange={(e) => onFiltersChange({ searchQuery: e.target.value })}
              />
            </div>
            
            {/* Filtros - Mobile */}
            <div className="flex gap-2 mb-3">
              <Select 
                value={filters.muscleFilter} 
                onValueChange={(value) => onFiltersChange({ muscleFilter: value })}
              >
                <SelectTrigger className="flex-1 h-10 bg-white/80 dark:bg-gray-800/80 border-0 rounded-lg shadow-md backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    <span className="text-sm font-medium truncate">
                      {filters.muscleFilter === 'all' ? 'Músculo' : filters.muscleFilter}
                    </span>
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white/95 dark:bg-gray-900/95 border-0 rounded-xl shadow-2xl backdrop-blur-md">
                  <SelectItem value="all">Todos</SelectItem>
                  {MUSCLE_GROUPS.map((group) => (
                    <SelectItem key={group} value={group}>{group}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select 
                value={filters.equipmentFilter} 
                onValueChange={(value) => onFiltersChange({ equipmentFilter: value })}
              >
                <SelectTrigger className="flex-1 h-10 bg-white/80 dark:bg-gray-800/80 border-0 rounded-lg shadow-md backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                    <span className="text-sm font-medium truncate">
                      {filters.equipmentFilter === 'all' ? 'Equip.' : 
                       EQUIPMENT_TYPES.find(e => e === filters.equipmentFilter) || 'Equip.'}
                    </span>
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white/95 dark:bg-gray-900/95 border-0 rounded-xl shadow-2xl backdrop-blur-md">
                  <SelectItem value="all">Todos</SelectItem>
                  {EQUIPMENT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>


              {/* Botão Limpar - Mobile */}
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onClearFilters}
                  className="h-10 w-10 bg-white/80 dark:bg-gray-800/80 border-0 rounded-lg shadow-md hover:shadow-lg backdrop-blur-sm transition-all duration-200 shrink-0"
                >
                  <X className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </Button>
              )}
            </div>

            {/* Indicadores Mobile */}
            {hasActiveFilters && (
              <div className="pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    Filtros ativos
                  </span>
                  <div className="flex gap-1">
                    {filters.searchQuery && <div className="w-2 h-2 bg-purple-500 rounded-full"></div>}
                    {filters.muscleFilter !== 'all' && <div className="w-2 h-2 bg-purple-500 rounded-full"></div>}
                    {filters.equipmentFilter !== 'all' && <div className="w-2 h-2 bg-pink-500 rounded-full"></div>}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Desktop: Layout Inline */}
          <div className="hidden lg:flex lg:items-center lg:gap-4">
            {/* Campo de Busca - Desktop */}
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-600 dark:text-purple-400 z-10" />
              <Input
                placeholder="Buscar exercícios por nome ou descrição..."
                className="pl-12 h-14 text-lg bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 transition-all duration-300 w-full"
                value={filters.searchQuery}
                onChange={(e) => onFiltersChange({ searchQuery: e.target.value })}
              />
            </div>

            {/* Filtro Grupo Muscular - Desktop */}
            <div className="shrink-0">
              <Select 
                value={filters.muscleFilter} 
                onValueChange={(value) => onFiltersChange({ muscleFilter: value })}
              >
                <SelectTrigger className="w-[220px] h-14 bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <Filter className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    <span className="font-semibold">Grupo Muscular</span>
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white/95 dark:bg-gray-900/95 border-0 rounded-xl shadow-2xl backdrop-blur-md">
                  <SelectItem value="all">Todos os grupos</SelectItem>
                  {MUSCLE_GROUPS.map((group) => (
                    <SelectItem key={group} value={group}>{group}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro Equipamento - Desktop */}
            <div className="shrink-0">
              <Select 
                value={filters.equipmentFilter} 
                onValueChange={(value) => onFiltersChange({ equipmentFilter: value })}
              >
                <SelectTrigger className="w-[220px] h-14 bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <Filter className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                    <span className="font-semibold">Equipamento</span>
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white/95 dark:bg-gray-900/95 border-0 rounded-xl shadow-2xl backdrop-blur-md">
                  <SelectItem value="all">Todos os equipamentos</SelectItem>
                  {EQUIPMENT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

        

            {/* Botão Limpar - Desktop */}
            {hasActiveFilters && (
              <div className="shrink-0">
                <Button
                  variant="outline"
                  onClick={onClearFilters}
                  className="h-14 px-5 bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg hover:shadow-xl backdrop-blur-sm transition-all duration-200 font-semibold text-gray-700 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400 group"
                >
                  <X className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-200" />
                  Limpar
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}