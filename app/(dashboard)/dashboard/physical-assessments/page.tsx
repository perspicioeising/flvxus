// /app/(dashboard)/dashboard/physical-assessments/page.tsx - FINAL COM INFINITE SCROLL

'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Settings, Infinity } from "lucide-react";
import { 
  AssessmentHeader,
  AssessmentFilters,
  AssessmentCard,
  AssessmentEmptyState,
  AssessmentPageLoadingSkeleton,
  LoadMoreButton,
  PaginationInfo
} from "@/components/physical-assessments/components/list";
import { useAssessmentList } from "@/components/physical-assessments/hooks/useAssessmentList";
import { useInfiniteScroll } from "@/components/physical-assessments/hooks/useInfiniteScroll";

export default function PhysicalAssessmentsPage() {
  const router = useRouter();
  const [infiniteScrollEnabled, setInfiniteScrollEnabled] = useState(false);
  
  const {
    assessments,
    isLoading,
    isLoadingMore,
    userRole,
    stats,
    filters,
    pagination,
    updateFilters,
    clearFilters,
    hasActiveFilters,
    loadMore
  } = useAssessmentList();

  // Hook de infinite scroll
  useInfiniteScroll({
    hasMore: pagination.hasMore,
    isLoading: isLoadingMore,
    onLoadMore: loadMore,
    threshold: 200,
    enabled: infiniteScrollEnabled
  });

  const handleViewAssessment = (id: string) => {
    router.push(`/dashboard/physical-assessments/${id}`);
  };

  const handleViewAnalysis = (id: string) => {
    router.push(`/dashboard/physical-assessments/${id}?tab=analysis`);
  };

  const handleCreateNew = () => {
    router.push('/dashboard/physical-assessments/new');
  };

  // Loading state inicial
  if (isLoading && assessments.length === 0) {
    return <AssessmentPageLoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-app-gradient">
      <div className="container mx-auto px-4 py-4 max-w-7xl">

        {/* Header */}
        <AssessmentHeader
          userRole={userRole}
          stats={stats}
          onCreateNew={handleCreateNew}
        />

        {/* Filters com Toggle de Infinite Scroll */}
        <div className="space-y-4">
          <AssessmentFilters
            filters={filters}
            onFiltersChange={updateFilters}
            onClearFilters={clearFilters}
          />

          {/* Toggle para Infinite Scroll */}
          
        </div>

        {/* Assessments List */}
        <div className="space-y-4 sm:space-y-6">
          {assessments.length > 0 ? (
            <>
              {/* Lista de avaliações */}
              {assessments.map((assessment) => (
                <AssessmentCard
                  key={assessment.id}
                  assessment={assessment}
                  onView={handleViewAssessment}
                  onViewAnalysis={handleViewAnalysis}
                />
              ))}

              {/* Loading indicator para infinite scroll */}
              {isLoadingMore && infiniteScrollEnabled && (
                <div className="text-center py-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg">
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                      Carregando mais avaliações...
                    </span>
                  </div>
                </div>
              )}

              {/* Botão Carregar Mais (apenas quando infinite scroll está desabilitado) */}
              {!infiniteScrollEnabled && (
                <div className="mt-8">
                  <LoadMoreButton
                    isLoading={isLoadingMore}
                    hasMore={pagination.hasMore}
                    totalLoaded={assessments.length}
                    totalAvailable={pagination.total}
                    itemsPerPage={pagination.limit}
                    onLoadMore={loadMore}
                  />
                </div>
              )}

              {/* Informações de Paginação */}
              <PaginationInfo
                currentCount={assessments.length}
                totalCount={pagination.total}
              />

              {/* Indicador de fim da lista */}
              {!pagination.hasMore && assessments.length > 0 && (
                <div className="text-center py-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-700 dark:text-green-300 font-medium">
                      Todas as avaliações foram carregadas
                    </span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <AssessmentEmptyState
              userRole={userRole}
              hasFilters={hasActiveFilters}
              onCreateNew={handleCreateNew}
            />
          )}
        </div>
      </div>
    </div>
  );
}