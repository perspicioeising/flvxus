// components/workouts/WorkoutsList.tsx
'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Infinity, Sparkles, Zap } from "lucide-react";
import {
  WorkoutHeader,
  WorkoutFilters,
  WorkoutCard,
  WorkoutEmptyState,
  WorkoutPageLoadingSkeleton,
  WorkoutLoadMore,
  WorkoutPaginationInfo
} from "./components/list";
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
    <div className="min-h-screen bg-app-gradient">
      <div className="container mx-auto px-3 sm:px-4 py-4 max-w-7xl">

        {/* Header */}
        <WorkoutHeader
          userRole="trainer" // TODO: Get from context/props
          stats={stats}
          onCreateNew={handleCreateNew}
        />

        {/* Filters com Toggle de Infinite Scroll */}
        <div className="space-y-4">
          <WorkoutFilters
            filters={filters}
            viewMode={viewMode}
            onFiltersChange={updateFilters}
            onViewModeChange={setViewMode}
            onClearFilters={clearFilters}
          />

          {/* Toggle para Infinite Scroll - Mobile Optimized */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-workout/10 via-app-achievement-workout/15 to-app-achievement-workout/10 rounded-xl blur-lg"></div>
            <div className="relative flex items-center justify-between p-3 sm:p-4 bg-app-card border border-app-border-muted rounded-xl shadow-app-medium">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  infiniteScrollEnabled 
                    ? 'bg-app-achievement-workout text-white shadow-app-medium' 
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
                    ? 'bg-app-achievement-workout/10 text-app-achievement-workout hover:bg-app-achievement-workout/20'
                    : 'bg-app-bg-secondary text-app-text-secondary hover:bg-app-border-accent/20'
                }`}
              >
                {infiniteScrollEnabled ? 'Desativar' : 'Ativar'}
              </Button>
            </div>
          </div>
        </div>

        {/* Workouts List */}
        <div className="space-y-4 sm:space-y-6">
          {workouts.length > 0 ? (
            <>
              {/* Grid Layout */}
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {workouts.map((workout, index) => (
                    <div
                      key={workout.id}
                      className="animate-fade-in-up"
                      style={{
                        animationDelay: `${index * 0.05}s`,
                        animationFillMode: 'both'
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
                /* List Layout */
                <div className="space-y-3 sm:space-y-4">
                  {workouts.map((workout, index) => (
                    <div
                      key={workout.id}
                      className="animate-fade-in-up"
                      style={{
                        animationDelay: `${index * 0.03}s`,
                        animationFillMode: 'both'
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
                  <div className="inline-flex items-center gap-3 px-6 py-3 bg-app-card backdrop-blur-sm rounded-xl shadow-app-medium border border-app-border-muted">
                    <div className="w-5 h-5 border-2 border-app-achievement-workout border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm text-app-text-secondary font-medium">
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
                  <div className="inline-flex items-center gap-3 px-6 py-3 bg-app-achievement-workout/10 border border-app-border-accent rounded-xl">
                    <div className="w-2 h-2 bg-app-achievement-workout rounded-full"></div>
                    <span className="text-sm text-app-achievement-workout font-medium">
                      Todos os treinos foram carregados
                    </span>
                    <Sparkles className="h-4 w-4 text-app-achievement-workout" />
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

        {/* Floating Action Button - Mobile Only */}
        <div className="fixed bottom-24 right-4 sm:hidden z-40">
          <div className="relative">
            <div className="absolute inset-0 bg-app-achievement-workout/30 rounded-full blur-xl animate-pulse"></div>
            <Button
              onClick={handleCreateNew}
              className="relative w-14 h-14 bg-achievement-workout hover:bg-app-achievement-workout/90 rounded-full shadow-app-xl hover:shadow-app-xl transition-all duration-300 transform hover:scale-110 active:scale-95"
            >
              <Zap className="h-6 w-6 text-white" />
            </Button>
          </div>
        </div>
      </div>

      {/* CSS para animações e otimizações */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out both;
        }

        /* Mobile scroll optimization */
        @media (max-width: 768px) {
          .container {
            padding-left: 12px;
            padding-right: 12px;
          }
          
          /* Otimização para telas pequenas */
          .grid {
            padding: 0;
          }
        }
        
        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }
        
        /* Custom scrollbar para desktop */
        @media (min-width: 769px) {
          ::-webkit-scrollbar {
            width: 6px;
          }
          
          ::-webkit-scrollbar-track {
            background: rgb(var(--background-secondary));
          }
          
          ::-webkit-scrollbar-thumb {
            background: rgb(var(--achievement-workout));
            border-radius: 3px;
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: rgb(var(--achievement-workout));
            opacity: 0.8;
          }
        }
        
        /* Otimização de performance para animações */
        .animate-fade-in-up {
          will-change: opacity, transform;
        }
        
        /* Reduced motion para acessibilidade */
        @media (prefers-reduced-motion: reduce) {
          .animate-fade-in-up {
            animation: none;
          }
          
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
        
        /* Touch feedback para mobile */
        @media (max-width: 768px) {
          .card-app:active {
            transform: scale(0.98);
            transition: transform 0.1s ease-out;
          }
          
          button:active {
            transform: scale(0.95);
          }
        }
        
        /* Focus states para acessibilidade */
        button:focus-visible,
        [role="button"]:focus-visible {
          outline: 2px solid rgb(var(--achievement-workout));
          outline-offset: 2px;
        }
        
        /* High contrast mode support */
        @media (prefers-contrast: high) {
          .bg-app-card {
            border: 2px solid;
          }
        }
      `}</style>
    </div>
  );
}

// Export the main component
export { WorkoutsListPage };