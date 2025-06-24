'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Infinity, Zap, Sparkles } from "lucide-react";

// Import dos componentes
import { StudentsHeader } from './StudentsHeader';
import { StudentsFilters } from './StudentsFilters';
import { StudentCard } from './StudentCard';
import { StudentsEmptyState } from './StudentsEmptyState';
import { StudentsLoadingSkeleton } from './StudentsLoadingSkeleton';
import { StudentsLoadMore } from './StudentsLoadMore';
import { StudentsPaginationInfo } from './StudentsPaginationInfo';

// Hook customizado
import { useStudentsList } from '@/components/students/hooks/useStudentsList';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

export function StudentsListPage() {
  const router = useRouter();
  const [infiniteScrollEnabled, setInfiniteScrollEnabled] = useState(false);
  
  const {
    students,
    isLoading,
    isLoadingMore,
    filters,
    pagination,
    stats,
    hasActiveFilters,
    updateFilters,
    clearFilters,
    loadMore
  } = useStudentsList();

  // Hook de infinite scroll
  useInfiniteScroll({
    hasMore: pagination.hasMore,
    isLoading: isLoadingMore,
    onLoadMore: loadMore,
    threshold: 200,
    enabled: infiniteScrollEnabled
  });

  // Handlers
  const handleViewStudent = (id: string) => {
    router.push(`/dashboard/students/${id}`);
  };

  const handleCreateNew = () => {
    router.push('/dashboard/students/new');
  };

  // Loading state inicial
  if (isLoading && students.length === 0) {
    return (
      <div className="min-h-screen bg-app-gradient">
        <div className="container mx-auto px-3 sm:px-4 py-4 max-w-7xl">
          <StudentsLoadingSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-gradient">
      <div className="container mx-auto px-3 sm:px-4 py-4 max-w-7xl">

        {/* Header */}
        <StudentsHeader
          studentsCount={students.length}
          onNewStudent={handleCreateNew}
        />

     
        {/* Filters com Toggle de Infinite Scroll */}
        <div className="space-y-4">
          <StudentsFilters
            filters={filters}
            onFiltersChange={updateFilters}
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

        {/* Students List */}
        <div className="space-y-4 sm:space-y-6">
          {students.length > 0 ? (
            <>
              {/* Lista de Estudantes */}
              <div className="space-y-3 sm:space-y-4">
                {students.map((student, index) => (
                  <div
                    key={student.id}
                    className="animate-fade-in-up"
                    style={{
                      animationDelay: `${index * 0.03}s`,
                      animationFillMode: 'both'
                    }}
                  >
                    <StudentCard
                      student={student}
                      onViewProfile={handleViewStudent}
                    />
                  </div>
                ))}
              </div>

              {/* Loading indicator para infinite scroll */}
              {isLoadingMore && infiniteScrollEnabled && (
                <div className="text-center py-8">
                  <div className="inline-flex items-center gap-3 px-6 py-3 bg-app-card backdrop-blur-sm rounded-xl shadow-app-medium border border-app-border-muted">
                    <div className="w-5 h-5 border-2 border-app-text-accent border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm text-app-text-secondary font-medium">
                      Carregando mais alunos...
                    </span>
                  </div>
                </div>
              )}

              {/* Botão Carregar Mais (apenas quando infinite scroll está desabilitado) */}
              {!infiniteScrollEnabled && (
                <div className="mt-8">
                  <StudentsLoadMore
                    isLoading={isLoadingMore}
                    hasMore={pagination.hasMore}
                    totalLoaded={students.length}
                    totalAvailable={pagination.total}
                    itemsPerPage={pagination.limit}
                    onLoadMore={loadMore}
                  />
                </div>
              )}

              {/* Informações de Paginação */}
              <StudentsPaginationInfo
                currentCount={students.length}
                totalCount={pagination.total}
              />

              {/* Indicador de fim da lista */}
              {!pagination.hasMore && students.length > 0 && (
                <div className="text-center py-8">
                  <div className="inline-flex items-center gap-3 px-6 py-3 bg-achievement-consecutive/10 border border-app-border-accent rounded-xl">
                    <div className="w-2 h-2 bg-achievement-consecutive rounded-full"></div>
                    <span className="text-sm text-achievement-consecutive font-medium">
                      Todos os alunos foram carregados
                    </span>
                    <Sparkles className="h-4 w-4 text-achievement-consecutive" />
                  </div>
                </div>
              )}
            </>
          ) : (
            <StudentsEmptyState
              hasFilters={hasActiveFilters}
              onNewStudent={handleCreateNew}
              onClearFilters={clearFilters}
            />
          )}
        </div>

        {/* Floating Action Button - Mobile Only */}
        <div className="fixed bottom-24 right-4 sm:hidden z-40">
          <div className="relative">
            <div className="absolute inset-0 bg-achievement-consecutive/30 rounded-full blur-xl animate-pulse"></div>
            <Button
              onClick={handleCreateNew}
              className="relative w-14 h-14 bg-achievement-consecutive hover:bg-app-btn-primary-hover rounded-full shadow-app-xl hover:shadow-app-xl transition-all duration-300 transform hover:scale-110 active:scale-95"
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