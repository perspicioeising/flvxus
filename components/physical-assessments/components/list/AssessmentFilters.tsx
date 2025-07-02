
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Calculator, Filter, X, Calendar, Users } from "lucide-react";
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
      {/* Search Bar - Mobile First */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-workout/5 via-app-btn-primary/5 to-app-achievement-workout/5 rounded-xl blur-lg"></div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-app-text-muted z-10" />
          <Input
            placeholder="Buscar avaliações ..."
            className="pl-12 h-12 sm:h-14 text-base bg-app-card border border-app-border-muted rounded-xl shadow-app-medium hover:shadow-app-large focus:shadow-app-large focus:border-app-achievement-workout transition-all duration-300"
            value={filters.searchQuery}
            onChange={(e) => onFiltersChange({ searchQuery: e.target.value })}
          />
          {filters.searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onFiltersChange({ searchQuery: '' })}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-full hover:bg-app-bg-secondary"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Filters Row - Mobile Optimized */}
      <div className="grid grid-cols-4 gap-3">
        {/* Protocol Filter */}
        <Select 
          value={filters.protocolFilter} 
          onValueChange={(value) => onFiltersChange({ protocolFilter: value })}
        >
          <SelectTrigger className={`
            col-span-1 h-12 sm:h-14 rounded-xl border-2 transition-all duration-200 flex items-center justify-center p-0
            ${filters.protocolFilter !== 'all' 
              ? 'bg-purple-500/10 border-purple-500 shadow-app-medium' 
              : 'bg-app-card border-app-border-muted hover:border-app-border-accent hover:shadow-app-medium'
            }
          `}>
            <div className="flex flex-col items-center gap-1">
              <Calculator className={`h-4 w-4 sm:h-5 sm:w-5 ${filters.protocolFilter !== 'all' ? 'text-purple-600' : 'text-app-text-muted'}`} />
              {filters.protocolFilter !== 'all' && (
                <div className="w-1 h-1 rounded-full bg-purple-500"></div>
              )}
            </div>
          </SelectTrigger>
          <SelectContent className="card-app backdrop-blur-xl border border-app-border-muted rounded-xl shadow-app-xl">
            <SelectItem value="all" className="focus:bg-app-bg-secondary">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-app-text-muted"></div>
                Todos os Protocolos
              </div>
            </SelectItem>
            {Object.entries(PROTOCOLS).map(([key, label]) => (
              <SelectItem key={key} value={key} className="focus:bg-purple-500/10">
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
            col-span-1 h-12 sm:h-14 rounded-xl border-2 transition-all duration-200 flex items-center justify-center p-0
            ${filters.dateFilter !== 'all' 
              ? 'bg-app-achievement-workout/10 border-app-achievement-workout shadow-app-medium' 
              : 'bg-app-card border-app-border-muted hover:border-app-border-accent hover:shadow-app-medium'
            }
          `}>
            <div className="flex flex-col items-center gap-1">
              <Calendar className={`h-4 w-4 sm:h-5 sm:w-5 ${filters.dateFilter !== 'all' ? 'text-app-achievement-workout' : 'text-app-text-muted'}`} />
              {filters.dateFilter !== 'all' && (
                <div className="w-1 h-1 rounded-full bg-app-achievement-workout"></div>
              )}
            </div>
          </SelectTrigger>
          <SelectContent className="card-app backdrop-blur-xl border border-app-border-muted rounded-xl shadow-app-xl">
            <SelectItem value="all" className="focus:bg-app-bg-secondary">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-app-text-muted"></div>
                Todos os Períodos
              </div>
            </SelectItem>
            {DATE_FILTERS.map(({ value, label }) => (
              <SelectItem key={value} value={value} className="focus:bg-app-achievement-workout/10">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${value === 'all' ? 'bg-app-text-muted' : 'bg-app-achievement-workout'}`}></div>
                  {label}
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
            className="col-span-1 h-12 sm:h-14 rounded-xl border-2 border-red-500/30 hover:bg-red-500/10 hover:border-red-500 transition-all duration-200 group flex items-center justify-center"
          >
            <div className="flex flex-col items-center gap-1">
              <X className="h-4 w-4 text-red-600 group-hover:rotate-90 transition-transform duration-200" />
              <span className="text-xs font-medium text-red-600">Limpar</span>
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
            <div className="flex items-center gap-2 px-3 py-1.5 bg-app-achievement-workout/10 text-app-achievement-workout rounded-full text-sm border border-app-border-accent">
              <Users className="h-3 w-3" />
              <span>"{filters.searchQuery}"</span>
              <button 
                onClick={() => onFiltersChange({ searchQuery: '' })}
                className="hover:bg-app-achievement-workout/20 rounded-full p-0.5 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          
          {filters.protocolFilter !== 'all' && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 text-purple-600 rounded-full text-sm border border-purple-200">
              <Calculator className="h-3 w-3" />
              <span>{PROTOCOLS[filters.protocolFilter]}</span>
              <button 
                onClick={() => onFiltersChange({ protocolFilter: 'all' })}
                className="hover:bg-purple-500/20 rounded-full p-0.5 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          
          {filters.dateFilter !== 'all' && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-app-achievement-workout/10 text-app-achievement-workout rounded-full text-sm border border-app-border-accent">
              <Calendar className="h-3 w-3" />
              <span>{DATE_FILTERS.find(f => f.value === filters.dateFilter)?.label}</span>
              <button 
                onClick={() => onFiltersChange({ dateFilter: 'all' })}
                className="hover:bg-app-achievement-workout/20 rounded-full p-0.5 transition-colors"
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