
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CalendarCheck, Infinity } from 'lucide-react';
import { WorkoutPlanCard } from './WorkoutPlanCard';
import { WorkoutPlansEmptyState } from './WorkoutPlansEmptyState';
import { WorkoutPlansLoadMore } from './WorkoutPlansLoadMore';
import { WorkoutPlansPaginationInfo } from './WorkoutPlansPaginationInfo';
import { WorkoutPlanListProps } from '../../types';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

interface ExtendedWorkoutPlanListProps extends WorkoutPlanListProps {
  viewMode?: 'grid' | 'list';
  hasFilters?: boolean;
  onCreateNew?: () => void;
  onClearFilters?: () => void;
}

export function WorkoutPlansList({
  plans,
  isLoading,
  pagination,
  hasMorePlans,
  onLoadMore,
  onView,
  onEdit,
  onClone,
  onDelete,
  viewMode = 'list',
  hasFilters = false,
  onCreateNew,
  onClearFilters,
}: ExtendedWorkoutPlanListProps) {
  const [infiniteScrollEnabled, setInfiniteScrollEnabled] = useState(false);

  // Hook de infinite scroll
  useInfiniteScroll({
    hasMore: hasMorePlans,
    isLoading,
    onLoadMore,
    threshold: 200,
    enabled: infiniteScrollEnabled
  });

  // Empty state
  if (plans.length === 0 && !isLoading) {
    return (
      <WorkoutPlansEmptyState
        hasFilters={hasFilters}
        onCreateNew={onCreateNew || (() => {})}
        onClearFilters={onClearFilters || (() => {})}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Toggle para Infinite Scroll */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-workout/10 via-app-achievement-consecutive/10 to-app-achievement-workout/10 rounded-xl blur-lg"></div>
        <div className="relative flex items-center justify-between p-3 sm:p-4 bg-app-card border border-app-border-muted rounded-xl shadow-app-medium">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
              infiniteScrollEnabled 
                ? 'bg-app-achievement-consecutive text-white shadow-app-medium' 
                : 'bg-app-bg-secondary text-app-text-muted'
            }`}>
              <Infinity className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-app-text-primary">
                Scroll Infinito
              </p>
              <p className="text-xs text-app-text-secondary">
                {infiniteScrollEnabled ? 'Carregamento automático ativo' : 'Carregamento manual'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setInfiniteScrollEnabled(!infiniteScrollEnabled)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              infiniteScrollEnabled
                ? 'bg-app-achievement-consecutive/10 text-app-achievement-consecutive hover:bg-app-achievement-consecutive/20'
                : 'bg-app-bg-secondary text-app-text-secondary hover:bg-app-border-accent/20'
            }`}
          >
            {infiniteScrollEnabled ? 'Desativar' : 'Ativar'}
          </Button>
        </div>
      </div>

      {/* Plans List */}
      <div className="space-y-4 sm:space-y-6">
        {plans.length > 0 ? (
          <>
            {/* Lista de planos - Grid fixo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {plans.map((plan, index) => (
                <div
                  key={plan.id}
                  style={{
                    animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`
                  }}
                >
                  <WorkoutPlanCard
                    plan={plan}
                    viewMode="grid"
                    onView={onView}
                    onEdit={onEdit}
                    onClone={onClone}
                    onDelete={onDelete}
                    isLoading={isLoading}
                  />
                </div>
              ))}
            </div>

            {/* Loading indicator para infinite scroll */}
            {isLoading && infiniteScrollEnabled && (
              <div className="text-center py-8">
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-app-card backdrop-blur-sm rounded-xl shadow-app-medium border border-app-border-muted">
                  <div className="w-5 h-5 border-2 border-app-achievement-workout border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm text-app-text-secondary font-medium">
                    Carregando mais planos...
                  </span>
                </div>
              </div>
            )}

            {/* Botão Carregar Mais (apenas quando infinite scroll está desabilitado) */}
            {!infiniteScrollEnabled && (
              <div className="mt-8">
                <WorkoutPlansLoadMore
                  isLoading={isLoading}
                  hasMore={hasMorePlans}
                  totalLoaded={plans.length}
                  totalAvailable={pagination.total}
                  itemsPerPage={pagination.limit}
                  onLoadMore={onLoadMore}
                />
              </div>
            )}

            {/* Informações de Paginação */}
            <WorkoutPlansPaginationInfo
              currentCount={plans.length}
              totalCount={pagination.total}
            />

            {/* Indicador de fim da lista */}
            {!hasMorePlans && plans.length > 0 && (
              <div className="text-center py-8">
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-app-achievement-consecutive/10 border border-app-border-accent rounded-xl">
                  <div className="w-2 h-2 bg-app-achievement-consecutive rounded-full"></div>
                  <span className="text-sm text-app-achievement-consecutive font-medium">
                    Todos os planos foram carregados
                  </span>
                  <CalendarCheck className="h-4 w-4 text-app-achievement-consecutive" />
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>

      {/* CSS para animações */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
