// /components/workout-plans/components/list/WorkoutPlans.tsx - ATUALIZADO

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list'); // Padrão list como nos exercícios
  
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

  // Handler para criar plano - navegar para formulário
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black">
      <div className="container mx-auto px-4 py-4 max-w-7xl">

        {/* Header */}
        <WorkoutPlansHeader 
          userRole="trainer" // TODO: Get from context
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
          onPageChange={() => {}} // Não usado com infinite scroll
          onPageSizeChange={() => {}} // Não usado com infinite scroll
          onView={navigation.goToDetails}
          onEdit={navigation.goToEdit}
          onClone={handleClonePlan}
          onDelete={deletePlan}
          viewMode={viewMode}
          hasFilters={hasActiveFilters}
          onCreateNew={handleCreatePlan}
          onClearFilters={handleClearFilters}
        />
      </div>
    </div>
  );
}