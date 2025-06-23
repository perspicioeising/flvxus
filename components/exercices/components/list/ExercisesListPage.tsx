// /app/(dashboard)/dashboard/exercises/page.tsx - REFATORADO FINAL

'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Infinity, Zap, Sparkles } from "lucide-react";
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
    <div className="min-h-screen bg-app-gradient">
      <div className="container mx-auto px-3 sm:px-4 py-4 max-w-7xl">

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

          {/* Toggle para Infinite Scroll - Mobile Optimized */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-consecutive/10 via-app-achievement-exercise/10 to-app-achievement-consecutive/10 rounded-xl blur-lg"></div>
            <div className="relative flex items-center justify-between p-3 sm:p-4 bg-app-card border border-app-border-muted rounded-xl shadow-app-medium">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  infiniteScrollEnabled 
                    ? 'bg-achievement-consecutive text-white shadow-app-medium' 
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
                    ? 'bg-achievement-consecutive/10 text-achievement-consecutive hover:bg-achievement-consecutive/20'
                    : 'bg-app-bg-secondary text-app-text-secondary hover:bg-app-border-accent/20'
                }`}
              >
                {infiniteScrollEnabled ? 'Desativar' : 'Ativar'}
              </Button>
            </div>
          </div>
        </div>

        {/* Exercises List */}
        <div className="space-y-4 sm:space-y-6">
          {exercises.length > 0 ? (
            <>
              {/* Grid Layout */}
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {exercises.map((exercise, index) => (
                    <div
                      key={exercise.id}
                      className="animate-fade-in-up"
                      style={{
                        animationDelay: `${index * 0.05}s`,
                        animationFillMode: 'both'
                      }}
                    >
                      <ExerciseCard
                        exercise={exercise}
                        viewMode={viewMode}
                        onView={handleViewExercise}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                /* List Layout */
                <div className="space-y-3 sm:space-y-4">
                  {exercises.map((exercise, index) => (
                    <div
                      key={exercise.id}
                      className="animate-fade-in-up"
                      style={{
                        animationDelay: `${index * 0.03}s`,
                        animationFillMode: 'both'
                      }}
                    >
                      <ExerciseCard
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
                  <div className="inline-flex items-center gap-3 px-6 py-3 bg-app-card backdrop-blur-sm rounded-xl shadow-app-medium border border-app-border-muted">
                    <div className="w-5 h-5 border-2 border-app-text-accent border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm text-app-text-secondary font-medium">
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
                  <div className="inline-flex items-center gap-3 px-6 py-3 bg-achievement-consecutive/10 border border-app-border-accent rounded-xl">
                    <div className="w-2 h-2 bg-achievement-consecutive rounded-full"></div>
                    <span className="text-sm text-achievement-consecutive font-medium">
                      Todos os exercícios foram carregados
                    </span>
                    <Sparkles className="h-4 w-4 text-achievement-consecutive" />
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

        {/* Floating Action Button - Mobile Only */}
        <div className="fixed bottom-24 right-4 sm:hidden z-40">
          <div className="relative">
            <div className="absolute inset-0 bg-achievement-exercise/30 rounded-full blur-xl animate-pulse"></div>
            <Button
              onClick={handleCreateNew}
              className="relative w-14 h-14 bg-achievement-exercise hover:bg-achievement-exercise/90 rounded-full shadow-app-xl hover:shadow-app-xl transition-all duration-300 transform hover:scale-110 active:scale-95"
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
            background: rgb(var(--text-accent));
            border-radius: 3px;
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: rgb(var(--button-primary));
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
          outline: 2px solid rgb(var(--text-accent));
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