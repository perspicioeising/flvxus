
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { 
  useWorkoutPlans, 
  useCreateWorkoutPlan, 
  useWorkoutPlanData,
  useWorkoutPlanNavigation 
} from '../../hooks';

import { WorkoutPlansHeader } from './WorkoutPlansHeader';
import { WorkoutPlansFilters } from './WorkoutPlansFilters';
import { WorkoutPlansList } from './WorkoutPlansList';
import { LoadingSkeleton } from './LoadingSkeleton';

export default function WorkoutPlansPage() {
  const router = useRouter();
  const navigation = useWorkoutPlanNavigation();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const {
    plans,
    isLoading,
    isInitialLoading,
    pagination,
    filters,
    stats,
    updateFilters,
    deletePlan,
    refreshPlans,
    loadMorePlans,
    hasMorePlans,
  } = useWorkoutPlans();

  const {
    isOpen,
    isCloning,
    isLoading: isCreating,
    formData,
    selectedWorkouts,
    isFormValid,
    updateFormData,
    selectWorkout,
    updateWorkout,
    removeWorkout,
    createPlan,
    startCloning,
    openModal,
    handleCancel,
  } = useCreateWorkoutPlan('create', undefined, undefined);

  const {
    workouts,
    students,
    isLoading: isDataLoading,
  } = useWorkoutPlanData();

  // Handler para criar plano
  const handleCreatePlan = () => {
    router.push('/dashboard/workout-plans/new');
  };

  // Handler para clonar plano
  const handleClonePlan = (plan: any) => {
    startCloning(plan);
  };

  // Clear filters
  const handleClearFilters = () => {
    updateFilters({ searchQuery: '', statusFilter: 'all' });
  };

  // Check if has active filters
  const hasActiveFilters = Boolean(
    filters.searchQuery || 
    filters.statusFilter !== 'all'
  );

  // Loading inicial com skeleton
  if (isInitialLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-app-gradient">
      <div className="container mx-auto px-3 sm:px-4 py-4 max-w-7xl">

        {/* Header */}
        <WorkoutPlansHeader 
          userRole="trainer"
          stats={{ total: pagination.total }}
          onCreateNew={handleCreatePlan}
        />

        {/* Filters */}
        <WorkoutPlansFilters 
          filters={filters}
          viewMode={viewMode}
          onFiltersChange={updateFilters}
          onViewModeChange={setViewMode}
        />

        {/* Plans List */}
        <WorkoutPlansList
          plans={plans}
          isLoading={isLoading}
          pagination={pagination}
          hasMore={hasMorePlans}
          hasMorePlans={hasMorePlans}
          onLoadMore={loadMorePlans}
          onPageChange={() => {}}
          onPageSizeChange={() => {}}
          onView={navigation.goToDetails}
          onEdit={navigation.goToEdit}
          onClone={handleClonePlan}
          onDelete={deletePlan}
          viewMode={viewMode}
          hasFilters={hasActiveFilters}
          onCreateNew={handleCreatePlan}
          onClearFilters={handleClearFilters}
        />

        {/* Floating Action Button - Mobile Only - IGUAL AOS EXERCÍCIOS */}
        <div className="fixed bottom-24 right-4 sm:hidden z-40">
          <div className="relative">
            <div className="absolute inset-0 bg-app-achievement-workout/30 rounded-full blur-xl animate-pulse"></div>
            <Button
              onClick={handleCreatePlan}
              className="relative w-14 h-14 bg-achievement-workout hover:bg-app-btn-primary-hover rounded-full shadow-app-xl hover:shadow-app-xl transition-all duration-300 transform hover:scale-110 active:scale-95"
            >
              <Plus className="h-6 w-6 text-white" />
            </Button>
          </div>
        </div>
      </div>

      {/* CSS para animações - IGUAL AOS EXERCÍCIOS */}
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
            background: rgb(var(--button-primary));
          }
        }
        
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
          .card-app {
            border: 2px solid;
          }
        }
      `}</style>
    </div>
  );
}