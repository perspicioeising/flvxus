// components/workouts/WorkoutsList.tsx
'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Infinity } from "lucide-react";
import {
  WorkoutHeader,
  WorkoutFilters,
  WorkoutCard,
  WorkoutEmptyState,
  WorkoutPageLoadingSkeleton,
  WorkoutLoadMore,
  WorkoutPaginationInfo
} from "./components/list/";
import { useWorkoutList, useWorkoutOperations } from "./hooks";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll"
import { Workout } from "./types";

export default function WorkoutsListPage() {
  const router = useRouter();
  const [infiniteScrollEnabled, setInfiniteScrollEnabled] = useState(false);

  const {
    workouts,
    isLoading,
    isLoadingMore,
    stats,
    filters,
    pagination,
    viewMode,
    updateFilters,
    clearFilters,
    hasActiveFilters,
    refreshWorkouts,
    setViewMode,
    loadMore
  } = useWorkoutList();

  const { cloneWorkout, deleteWorkout } = useWorkoutOperations();
  // Hook de infinite scroll
  useInfiniteScroll({
    hasMore: pagination.hasMore,
    isLoading: isLoadingMore,
    onLoadMore: loadMore,
    threshold: 200,
    enabled: infiniteScrollEnabled
  });

  // Navigation handlers
  const handleViewWorkout = (id: string) => {
    router.push(`/dashboard/workouts/${id}`);
  };

  const handleEditWorkout = (id: string) => {
    router.push(`/dashboard/workouts/${id}/edit`);
  };

  const handleCreateNew = () => {
    router.push('/dashboard/workouts/new');
  };

  // Workout operations
  const handleCloneWorkout = async (workout: Workout) => {
    try {
      await cloneWorkout(workout);
      await refreshWorkouts();
    } catch (error) {
      // Error already handled in hook
    }
  };

  const handleDeleteWorkout = async (workout: Workout) => {
    if (!confirm(`Tem certeza que deseja excluir o treino "${workout.name}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      await deleteWorkout(workout.id, workout.name);
      await refreshWorkouts();
    } catch (error) {
      // Error already handled in hook
    }
  };

  // Loading state inicial
  if (isLoading && workouts.length === 0) {
    return <WorkoutPageLoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-pink-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black">
      <div className="container mx-auto px-4 py-4 max-w-7xl">

        {/* Header */}
        <WorkoutHeader
          userRole="trainer" // TODO: Get from context/props
          stats={stats}
          onCreateNew={handleCreateNew}
        />

        {/* Filters com Toggle de View Mode e Infinite Scroll */}
        <div className="space-y-4">
          <WorkoutFilters
            filters={filters}
            viewMode={viewMode}
            onFiltersChange={updateFilters}
            onViewModeChange={setViewMode}
            onClearFilters={clearFilters}
          />
        </div>

        {/* Workouts List */}
        <div className="space-y-4 sm:space-y-6">
          {workouts.length > 0 ? (
            <>
              {/* Lista de treinos */}
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {workouts.map((workout, index) => (
                    <div
                      key={workout.id}
                      style={{
                        animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`
                      }}
                    >
                      <WorkoutCard
                        workout={workout}
                        viewMode={viewMode}
                        onView={handleViewWorkout}
                        onEdit={handleEditWorkout}
                        onClone={handleCloneWorkout}
                        onDelete={handleDeleteWorkout}
                        isLoading={isLoading}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  {workouts.map((workout, index) => (
                    <div className="grid grid-cols-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                      key={workout.id}
                      style={{
                        animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`
                      }}
                    >
                      <WorkoutCard
                        workout={workout}
                        viewMode={viewMode}
                        onView={handleViewWorkout}
                        onEdit={handleEditWorkout}
                        onClone={handleCloneWorkout}
                        onDelete={handleDeleteWorkout}
                        isLoading={isLoading}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Loading indicator para infinite scroll */}
              {isLoadingMore && infiniteScrollEnabled && (
                <div className="text-center py-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg">
                    <div className="w-5 h-5 border-2 border-pink-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                      Carregando mais treinos...
                    </span>
                  </div>
                </div>
              )}

              {/* Botão Carregar Mais (apenas quando infinite scroll está desabilitado) */}
              {!infiniteScrollEnabled && (
                <div className="mt-8">
                  <WorkoutLoadMore
                    isLoading={isLoadingMore}
                    hasMore={pagination.hasMore}
                    totalLoaded={workouts.length}
                    totalAvailable={pagination.total}
                    itemsPerPage={pagination.limit}
                    onLoadMore={loadMore}
                  />
                </div>
              )}

              {/* Informações de Paginação */}
              <WorkoutPaginationInfo
                currentCount={workouts.length}
                totalCount={pagination.total}
              />

              {/* Indicador de fim da lista */}
              {!pagination.hasMore && workouts.length > 0 && (
                <div className="text-center py-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 border border-pink-200 dark:border-pink-800 rounded-xl">
                    <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                    <span className="text-sm text-pink-700 dark:text-pink-300 font-medium">
                      Todos os treinos foram carregados
                    </span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <WorkoutEmptyState
              userRole="trainer" // TODO: Get from context/props
              hasFilters={hasActiveFilters}
              onCreateNew={handleCreateNew}
            />
          )}
        </div>
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

// Export the main component
export { WorkoutsListPage };