'use client';

import React, { useState } from 'react';
import { 
  useWorkoutPlans, 
  useCreateWorkoutPlan, 
  useWorkoutPlanData,
  useWorkoutPlanNavigation 
} from '../list';

import { WorkoutPlansHeader } from './WorkoutPlansHeader';
import { WorkoutPlansStats } from './WorkoutPlansStats';
import { WorkoutPlansFilters } from './WorkoutPlansFilters';
import { WorkoutPlansList } from './WorkoutPlansList';
import { LoadingSkeleton } from './LoadingSkeleton';

export default function WorkoutPlansPage() {
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
  } = useCreateWorkoutPlan();

  const {
    workouts,
    students,
    isLoading: isDataLoading,
  } = useWorkoutPlanData();

  // Handler para criar plano com refresh
  const handleCreatePlan = async () => {
    const success = await createPlan();
    if (success) {
      refreshPlans();
    }
  };

  // Handler para clonar plano
  const handleClonePlan = (plan: any) => {
    startCloning(plan);
  };

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
          stats={{ total: plans.length }}
          onCreateNew={openModal}
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
          hasMorePlans={hasMorePlans}
          onLoadMore={loadMorePlans}
          onPageChange={() => {}} // Não usado com infinite scroll
          onPageSizeChange={() => {}} // Não usado com infinite scroll
          onView={navigation.goToDetails}
          onEdit={navigation.goToEdit}
          onClone={handleClonePlan}
          onDelete={deletePlan}
        />

        {/* Create/Clone Modal */}
       
      </div>
    </div>
  );
}