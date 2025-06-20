// /app/(dashboard)/dashboard/exercises/page.tsx - REFATORADO COMPLETO

'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Infinity } from "lucide-react";
import { 
  ExerciseHeader,
  ExerciseFilters,
  ExerciseCard,
  ExerciseEmptyState,
  ExercisePageLoadingSkeleton,
  ExerciseLoadMore,
  ExercisePaginationInfo
} from "@/components/exercices/components/list";
import { useExerciseList } from "@/components/exercices/hooks/useExerciseList";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { Exercise } from "@/components/exercices/types/exercise";

export function ExercisesPage() {
  const router = useRouter();
  const [infiniteScrollEnabled, setInfiniteScrollEnabled] = useState(false);
  
  const {
    exercises,
    isLoading,
    isLoadingMore,
    stats,
    filters,
    pagination,
    viewMode,
    updateFilters,
    clearFilters,
    hasActiveFilters,
    loadMore,
    setViewMode
  } = useExerciseList();

  // Hook de infinite scroll
  useInfiniteScroll({
    hasMore: pagination.hasMore,
    isLoading: isLoadingMore,
    onLoadMore: loadMore,
    threshold: 200,
    enabled: infiniteScrollEnabled
  });

  // Handlers
  const handleViewExercise = (id: string) => {
    router.push(`/dashboard/exercises/${id}`);
  };

  const handleCreateNew = () => {
    router.push('/dashboard/exercises/new');
  };

  // Loading state inicial
  if (isLoading && exercises.length === 0) {
    return <ExercisePageLoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black">
      <div className="container mx-auto px-4 py-4 max-w-7xl">

        {/* Header */}
        <ExerciseHeader
          exerciseCount={exercises.length}
          onCreateNew={handleCreateNew}
        />

        {/* Filters com Toggle de Infinite Scroll */}
        <div className="space-y-4">
          <ExerciseFilters
            filters={filters}
            viewMode={viewMode}
            onFiltersChange={updateFilters}
            onViewModeChange={setViewMode}
            onClearFilters={clearFilters}
          />

          {/* Toggle para Infinite Scroll */}
          
        </div>

        {/* Exercises List */}
        <div className="space-y-4 sm:space-y-6">
          {exercises.length > 0 ? (
            <>
              {/* Lista de exercícios */}
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {exercises.map((exercise, index) => (
                     <div
                      key={exercise.id}
                      style={{
                        animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`
                      }}
                    >
                    <ExerciseCard
                      key={exercise.id} 
                      exercise={exercise}
                      viewMode={viewMode}
                      onView={handleViewExercise}
                    />
                     </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {exercises.map((exercise, index) => (
                     <div
                      key={exercise.id}
                      style={{
                        animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`
                      }}
                    >
                    <ExerciseCard
                      key={exercise.id}
                      exercise={exercise}
                      viewMode={viewMode}
                      onView={handleViewExercise}
                    />
                    </div>
                  ))}
                </div>
              )}

              {/* Loading indicator para infinite scroll */}
              {isLoadingMore && infiniteScrollEnabled && (
                <div className="text-center py-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg">
                    <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                      Carregando mais exercícios...
                    </span>
                  </div>
                </div>
              )}

              {/* Botão Carregar Mais (apenas quando infinite scroll está desabilitado) */}
              {!infiniteScrollEnabled && (
                <div className="mt-8">
                  <ExerciseLoadMore
                    isLoading={isLoadingMore}
                    hasMore={pagination.hasMore}
                    totalLoaded={exercises.length}
                    totalAvailable={pagination.total}
                    itemsPerPage={pagination.limit}
                    onLoadMore={loadMore}
                  />
                </div>
              )}

              {/* Informações de Paginação */}
              <ExercisePaginationInfo
                currentCount={exercises.length}
                totalCount={pagination.total}
              />

              {/* Indicador de fim da lista */}
              {!pagination.hasMore && exercises.length > 0 && (
                <div className="text-center py-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-700 dark:text-green-300 font-medium">
                      Todos os exercícios foram carregados
                    </span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <ExerciseEmptyState
              hasFilters={hasActiveFilters}
              onCreateNew={handleCreateNew}
              onClearFilters={clearFilters}
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