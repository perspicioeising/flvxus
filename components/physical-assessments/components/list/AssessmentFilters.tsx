// /components/physical-assessments/components/list/AssessmentFilters.tsx

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Calculator, Filter, X } from "lucide-react";
import { AssessmentFiltersProps } from "@/types/physical-assessment";
import { PROTOCOLS, DATE_FILTERS } from "@/constants/physical-assessment";

export function AssessmentFilters({
  filters,
  onFiltersChange,
  onClearFilters
}: AssessmentFiltersProps) {
  const hasActiveFilters = filters.searchQuery || filters.protocolFilter !== 'all' || filters.dateFilter !== 'all';

  return (
    <div className="relative mb-6">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-500/10 to-cyan-600/10 rounded-2xl blur-md"></div>
      <Card className="relative border-0 bg-white/60 dark:bg-gray-900/60 backdrop-blur-md shadow-xl rounded-2xl">
        <CardContent className="p-3 sm:p-6">
          {/* Mobile: Layout em Stack */}
          <div className="lg:hidden">
            {/* Campo de Busca - Mobile */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-600 dark:text-blue-400 z-10" />
              <Input
                placeholder="Buscar aluno..."
                className="pl-10 h-11 text-sm bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 transition-all duration-300 w-full"
                value={filters.searchQuery}
                onChange={(e) => onFiltersChange({ searchQuery: e.target.value })}
              />
            </div>
            
            {/* Filtros - Mobile */}
            <div className="flex gap-2">
              <Select 
                value={filters.protocolFilter} 
                onValueChange={(value) => onFiltersChange({ protocolFilter: value })}
              >
                <SelectTrigger className="flex-1 h-10 bg-white/80 dark:bg-gray-800/80 border-0 rounded-lg shadow-md backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <Calculator className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    <span className="text-sm font-medium truncate">
                      {filters.protocolFilter === 'all' ? 'Protocolo' : (PROTOCOLS[filters.protocolFilter] || 'Protocolo')}
                    </span>
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white/95 dark:bg-gray-900/95 border-0 rounded-xl shadow-2xl backdrop-blur-md">
                  <SelectItem value="all">Todos</SelectItem>
                  {Object.entries(PROTOCOLS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select 
                value={filters.dateFilter} 
                onValueChange={(value) => onFiltersChange({ dateFilter: value })}
              >
                <SelectTrigger className="flex-1 h-10 bg-white/80 dark:bg-gray-800/80 border-0 rounded-lg shadow-md backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium truncate">
                      {DATE_FILTERS.find(f => f.value === filters.dateFilter)?.label || 'Data'}
                    </span>
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white/95 dark:bg-gray-900/95 border-0 rounded-xl shadow-2xl backdrop-blur-md">
                  {DATE_FILTERS.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
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
              <div className="mt-3 pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    Filtros ativos
                  </span>
                  <div className="flex gap-1">
                    {filters.searchQuery && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                    {filters.protocolFilter !== 'all' && <div className="w-2 h-2 bg-purple-500 rounded-full"></div>}
                    {filters.dateFilter !== 'all' && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Desktop: Layout Inline - Tudo na mesma linha */}
          <div className="hidden lg:flex lg:items-center lg:gap-4">
            {/* Campo de Busca - Desktop (flexível) */}
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-600 dark:text-blue-400 z-10" />
              <Input
                placeholder="Buscar por aluno ou email..."
                className="pl-12 h-14 text-lg bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 transition-all duration-300 w-full"
                value={filters.searchQuery}
                onChange={(e) => onFiltersChange({ searchQuery: e.target.value })}
              />
            </div>

            {/* Filtro de Protocolo - Desktop (largura fixa) */}
            <div className="shrink-0">
              <Select 
                value={filters.protocolFilter} 
                onValueChange={(value) => onFiltersChange({ protocolFilter: value })}
              >
                <SelectTrigger className="w-[220px] h-14 bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <Calculator className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    <span className="font-semibold">Protocolo</span>
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white/95 dark:bg-gray-900/95 border-0 rounded-xl shadow-2xl backdrop-blur-md">
                  <SelectItem value="all">Todos os Protocolos</SelectItem>
                  {Object.entries(PROTOCOLS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro de Data - Desktop (largura fixa) */}
            <div className="shrink-0">
              <Select 
                value={filters.dateFilter} 
                onValueChange={(value) => onFiltersChange({ dateFilter: value })}
              >
                <SelectTrigger className="w-[180px] h-14 bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <Filter className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <span className="font-semibold">Período</span>
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white/95 dark:bg-gray-900/95 border-0 rounded-xl shadow-2xl backdrop-blur-md">
                  {DATE_FILTERS.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Botão Limpar - Desktop (condicional) */}
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