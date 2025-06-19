// /components/physical-assessments/components/list/AssessmentFilters.tsx

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Calculator, Filter, X, ChevronDown, Calendar, Users } from "lucide-react";
import { AssessmentFiltersProps } from "@/components/physical-assessments/types/physical-assessment";
import { PROTOCOLS, DATE_FILTERS } from "@/components/physical-assessments/constants/physical-assessment";

export function AssessmentFilters({
  filters,
  onFiltersChange,
  onClearFilters
}: AssessmentFiltersProps) {
  const hasActiveFilters = filters.searchQuery || filters.protocolFilter !== 'all' || filters.dateFilter !== 'all';
  const activeFiltersCount = [
    filters.searchQuery,
    filters.protocolFilter !== 'all',
    filters.dateFilter !== 'all'
  ].filter(Boolean).length;

  return (
    <div className="mb-6 space-y-4">
      {/* Desktop: Search + Filters na mesma linha */}
      <div className="hidden lg:flex lg:items-center lg:gap-4">
        {/* Search Bar - Desktop (flexível) */}
        <div className="relative flex-1">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-cyan-500/5 rounded-2xl blur-lg"></div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
            <Input
              placeholder="Buscar por nome do aluno, email ou observações..."
              className="pl-12 h-14 text-base bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm hover:shadow-md focus:shadow-lg focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300 w-full"
              value={filters.searchQuery}
              onChange={(e) => onFiltersChange({ searchQuery: e.target.value })}
            />
            {filters.searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onFiltersChange({ searchQuery: '' })}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Filters Desktop - mesma linha */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Protocol Filter */}
          <Select 
            value={filters.protocolFilter} 
            onValueChange={(value) => onFiltersChange({ protocolFilter: value })}
          >
            <SelectTrigger className={`
              w-14 h-14 rounded-2xl border-2 transition-all duration-200 flex items-center justify-center
              ${filters.protocolFilter !== 'all' 
                ? 'bg-purple-50 border-purple-200 shadow-md dark:bg-purple-900/20 dark:border-purple-700' 
                : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:hover:border-gray-600'
              }
            `}>
              <Calculator className={`h-6 w-6 ${filters.protocolFilter !== 'all' ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400'}`} />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl">
              <SelectItem value="all" className="focus:bg-gray-50 dark:focus:bg-gray-800">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                  Todos os Protocolos
                </div>
              </SelectItem>
              {Object.entries(PROTOCOLS).map(([key, label]) => (
                <SelectItem key={key} value={key} className="focus:bg-purple-50 dark:focus:bg-purple-900/20">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    {label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Date Filter */}
          <Select 
            value={filters.dateFilter} 
            onValueChange={(value) => onFiltersChange({ dateFilter: value })}
          >
            <SelectTrigger className={`
              w-14 h-14 rounded-2xl border-2 transition-all duration-200 flex items-center justify-center
              ${filters.dateFilter !== 'all' 
                ? 'bg-green-50 border-green-200 shadow-md dark:bg-green-900/20 dark:border-green-700' 
                : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:hover:border-gray-600'
              }
            `}>
              <Calendar className={`h-6 w-6 ${filters.dateFilter !== 'all' ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`} />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl">
              {DATE_FILTERS.map(({ value, label }) => (
                <SelectItem key={value} value={value} className="focus:bg-green-50 dark:focus:bg-green-900/20">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${value === 'all' ? 'bg-gray-400' : 'bg-green-500'}`}></div>
                    {label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Clear All Button Desktop */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={onClearFilters}
              className="h-14 px-4 rounded-2xl border-2 border-gray-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-gray-700 dark:hover:border-red-700 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-all duration-200 group"
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
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-cyan-500/5 rounded-2xl blur-lg"></div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
            <Input
              placeholder="Buscar aluno..."
              className="pl-12 h-12 text-base bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm hover:shadow-md focus:shadow-lg focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300 w-full"
              value={filters.searchQuery}
              onChange={(e) => onFiltersChange({ searchQuery: e.target.value })}
            />
            {filters.searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onFiltersChange({ searchQuery: '' })}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Filter Row - Mobile - Grid layout */}
        <div className="grid grid-cols-4 gap-3">
          {/* Protocol Filter - Expandido */}
          <Select 
            value={filters.protocolFilter} 
            onValueChange={(value) => onFiltersChange({ protocolFilter: value })}
          >
            <SelectTrigger className={`
              col-span-1 h-14 rounded-xl border-2 transition-all duration-200 flex items-center justify-center p-0
              ${filters.protocolFilter !== 'all' 
                ? 'bg-purple-50 border-purple-200 shadow-md dark:bg-purple-900/20 dark:border-purple-700' 
                : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm dark:bg-gray-800 dark:border-gray-700'
              }
            `}>
              <div className="flex flex-col items-center gap-1">
                <Calculator className={`h-5 w-5 ${filters.protocolFilter !== 'all' ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400'}`} />
                {filters.protocolFilter !== 'all' && (
                  <div className="w-1 h-1 rounded-full bg-purple-500"></div>
                )}
              </div>
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl">
              <SelectItem value="all" className="focus:bg-gray-50 dark:focus:bg-gray-800">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                  Todos
                </div>
              </SelectItem>
              {Object.entries(PROTOCOLS).map(([key, label]) => (
                <SelectItem key={key} value={key} className="focus:bg-purple-50 dark:focus:bg-purple-900/20">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    {label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Date Filter - Expandido */}
          <Select 
            value={filters.dateFilter} 
            onValueChange={(value) => onFiltersChange({ dateFilter: value })}
          >
            <SelectTrigger className={`
              col-span-1 h-14 rounded-xl border-2 transition-all duration-200 flex items-center justify-center p-0
              ${filters.dateFilter !== 'all' 
                ? 'bg-green-50 border-green-200 shadow-md dark:bg-green-900/20 dark:border-green-700' 
                : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm dark:bg-gray-800 dark:border-gray-700'
              }
            `}>
              <div className="flex flex-col items-center gap-1">
                <Calendar className={`h-5 w-5 ${filters.dateFilter !== 'all' ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`} />
                {filters.dateFilter !== 'all' && (
                  <div className="w-1 h-1 rounded-full bg-green-500"></div>
                )}
              </div>
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl">
              {DATE_FILTERS.map(({ value, label }) => (
                <SelectItem key={value} value={value} className="focus:bg-green-50 dark:focus:bg-green-900/20">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${value === 'all' ? 'bg-gray-400' : 'bg-green-500'}`}></div>
                    {label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Badge - Expandido */}
          {hasActiveFilters ? (
            <div className="col-span-1 h-14 rounded-xl border-2 border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700 flex items-center justify-center">
              <div className="flex flex-col items-center gap-1">
                <Filter className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-bold text-blue-700 dark:text-blue-300">{activeFiltersCount}</span>
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
              onClick={onClearFilters}
              className="col-span-1 h-14 rounded-xl border-2 border-red-200 hover:bg-red-50 hover:border-red-300 dark:border-red-800 dark:hover:bg-red-900/20 dark:hover:border-red-700 transition-all duration-200 group flex items-center justify-center"
            >
              <div className="flex flex-col items-center gap-1">
                <X className="h-4 w-4 text-red-600 dark:text-red-400 group-hover:rotate-90 transition-transform duration-200" />
                <span className="text-xs font-medium text-red-600 dark:text-red-400">Limpar</span>
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
          {filters.searchQuery && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm dark:bg-blue-900/20 dark:text-blue-300">
              <Users className="h-3 w-3" />
              <span>"{filters.searchQuery}"</span>
              <button 
                onClick={() => onFiltersChange({ searchQuery: '' })}
                className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          
          {filters.protocolFilter !== 'all' && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-sm dark:bg-purple-900/20 dark:text-purple-300">
              <Calculator className="h-3 w-3" />
              <span>{PROTOCOLS[filters.protocolFilter]}</span>
              <button 
                onClick={() => onFiltersChange({ protocolFilter: 'all' })}
                className="hover:bg-purple-200 dark:hover:bg-purple-800 rounded-full p-0.5 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          
          {filters.dateFilter !== 'all' && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm dark:bg-green-900/20 dark:text-green-300">
              <Calendar className="h-3 w-3" />
              <span>{DATE_FILTERS.find(f => f.value === filters.dateFilter)?.label}</span>
              <button 
                onClick={() => onFiltersChange({ dateFilter: 'all' })}
                className="hover:bg-green-200 dark:hover:bg-green-800 rounded-full p-0.5 transition-colors"
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