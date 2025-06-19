
'use client';

import { useRouter } from "next/navigation";
import { 
  AssessmentHeader,
  AssessmentFilters,
  AssessmentCard,
  AssessmentEmptyState,
  AssessmentPageLoadingSkeleton
} from "@/components/physical-assessments/components/list";
import { useAssessmentList } from "@/components/physical-assessments/hooks/useAssessmentList";

export default function PhysicalAssessmentsPage() {
  const router = useRouter();
  const {
    assessments,
    isLoading,
    userRole,
    stats,
    filters,
    updateFilters,
    clearFilters,
    hasActiveFilters
  } = useAssessmentList();

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
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black">
    <div className="container mx-auto px-4 py-4 max-w-7xl">

      {/* Header */}
      <AssessmentHeader
        userRole={userRole}
        stats={stats}
        onCreateNew={handleCreateNew}
      />

      {/* Filters */}
      <AssessmentFilters
        filters={filters}
        onFiltersChange={updateFilters}
        onClearFilters={clearFilters}
      />

      {/* Assessments List */}
      <div className="space-y-4 sm:space-y-6">
        {assessments.length > 0 ? (
          assessments.map((assessment, index) => (
            <div
              key={assessment.id}
              style={{
                animation: `fadeInUp 0.5s ease-out ${index * 0.85}s both`
              }}
            >
              <AssessmentCard
                assessment={assessment}
                onView={handleViewAssessment}
                onViewAnalysis={handleViewAnalysis}
              />
            </div>
          ))
        ) : (
          <AssessmentEmptyState
            userRole={userRole}
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