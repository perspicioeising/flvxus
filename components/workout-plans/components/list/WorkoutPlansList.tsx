// /components/workout-plans/components/list/WorkoutPlansList.tsx - ATUALIZADO

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Infinity } from 'lucide-react';
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
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg">
                  <div className="w-5 h-5 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
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
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-50 to-orange-50 dark:from-orange-900/20 dark:to-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-sm text-orange-700 dark:text-orange-300 font-medium">
                    Todos os planos foram carregados
                  </span>
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