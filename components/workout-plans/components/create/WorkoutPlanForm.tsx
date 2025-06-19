// components/workout-plans/components/create/WorkoutPlanForm.tsx
'use client';

import { useCreateWorkoutPlan } from '../../hooks/useWorkoutPlanForm';
import { WORKOUT_PLAN_STEPS } from '../../constants';

// Import dos componentes
import { WorkoutPlanFormHeader } from './WorkoutPlanFormHeader';
import { WorkoutPlanStepNavigation } from './WorkoutPlanStepNavigation';
import { StepBasicInfo } from '../steps/StepBasicInfo';
import { StepSchedule } from '../steps/StepSchedule';
import { StepWorkouts } from '../steps/StepWorkouts';
import { StepReview } from '../steps/StepReview';
import { WorkoutPlanFormSkeleton } from './WorkoutPlanFormSkeleton';

interface WorkoutPlanFormProps {
  mode?: 'create' | 'edit';
  workoutPlanId?: string;
  studentId?: string;
  onSuccess?: () => void;
}

export function WorkoutPlanForm({
  mode = 'create',
  workoutPlanId,
  studentId,
  onSuccess
}: WorkoutPlanFormProps) {
  const {
    // Estados
    formData,
    selectedWorkouts,
    activeStep,
    errors,
    isLoading,
    isSaving,
    availableWorkouts,
    
    // Ações
    setActiveStep,
    updateFormField,
    handleWorkoutSelect,
    handleWorkoutRemove,
    handleScheduleUpdate,
    saveWorkoutPlan,
    
    // Validações
    canAdvanceStep,
    validateStep
  } = useCreateWorkoutPlan(mode, workoutPlanId, studentId);

  const currentStepData = WORKOUT_PLAN_STEPS.find(step => step.id === activeStep);
  const progressPercentage = ((WORKOUT_PLAN_STEPS.findIndex(s => s.id === activeStep) + 1) / WORKOUT_PLAN_STEPS.length) * 100;

  const handleNext = () => {
    if (!validateStep(activeStep)) return;
    
    const currentIndex = WORKOUT_PLAN_STEPS.findIndex(s => s.id === activeStep);
    if (currentIndex < WORKOUT_PLAN_STEPS.length - 1 && canAdvanceStep()) {
      setActiveStep(WORKOUT_PLAN_STEPS[currentIndex + 1].id);
    }
  };

  const handleBack = () => {
    const currentIndex = WORKOUT_PLAN_STEPS.findIndex(s => s.id === activeStep);
    if (currentIndex > 0) {
      setActiveStep(WORKOUT_PLAN_STEPS[currentIndex - 1].id);
    }
  };

  const getNextStepTitle = () => {
    const currentIndex = WORKOUT_PLAN_STEPS.findIndex(s => s.id === activeStep);
    const nextStep = WORKOUT_PLAN_STEPS[currentIndex + 1];
    return nextStep?.shortTitle || 'Próximo';
  };

  const renderCurrentStep = () => {
    switch (activeStep) {
      case 'basic':
        return (
          <StepBasicInfo
            formData={formData}
            onUpdateField={updateFormField}
            errors={errors}
            studentId={studentId}
          />
        );
      case 'schedule':
        return (
          <StepSchedule
            schedule={formData.schedule}
            onScheduleUpdate={handleScheduleUpdate}
            errors={errors}
          />
        );
      case 'workouts':
        return (
          <StepWorkouts
            availableWorkouts={availableWorkouts}
            selectedWorkouts={selectedWorkouts}
            schedule={formData.schedule}
            onWorkoutSelect={handleWorkoutSelect}
            onWorkoutRemove={handleWorkoutRemove}
            isLoading={isLoading}
          />
        );
      case 'review':
        return (
          <StepReview
            formData={formData}
            selectedWorkouts={selectedWorkouts}
            onSave={saveWorkoutPlan}
            isSaving={isSaving}
            mode={mode}
          />
        );
      default:
        return null;
    }
  };

  if (isLoading && mode === 'edit') {
    return <WorkoutPlanFormSkeleton />;
  }

  const shouldShowNextButton = activeStep !== 'review';
  const shouldShowBackButton = activeStep !== 'basic';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        
        {/* Header */}
        <WorkoutPlanFormHeader
          mode={mode}
          currentStepData={currentStepData}
          progressPercentage={progressPercentage}
        />

        {/* Step Navigation */}
        <WorkoutPlanStepNavigation
          steps={WORKOUT_PLAN_STEPS}
          activeStep={activeStep}
          onStepChange={setActiveStep}
          canAdvance={canAdvanceStep}
        />

        {/* Step Content */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 via-orange-500/10 to-orange-600/10 rounded-2xl blur-md"></div>
          <div className="relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-0 rounded-2xl shadow-xl">
            <div className="p-6 lg:p-8">
              {renderCurrentStep()}
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200/50 to-orange-200/50 dark:from-gray-700/50 dark:to-orange-700/50 rounded-2xl blur-md"></div>
          <div className="relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-0 rounded-2xl shadow-lg">
            <div className="p-6">
              
              {/* Mobile Navigation */}
              <div className="flex flex-col gap-3 sm:hidden">
                {shouldShowBackButton && (
                  <button
                    onClick={handleBack}
                    className="h-12 px-4 border-2 border-orange-200 dark:border-orange-700 hover:border-orange-300 dark:hover:border-orange-600 text-orange-600 dark:text-orange-400 rounded-xl font-semibold transition-all duration-300 bg-white/80 dark:bg-gray-800/80"
                  >
                    ← Voltar
                  </button>
                )}
                
                {shouldShowNextButton && (
                  <button
                    onClick={handleNext}
                    disabled={!canAdvanceStep()}
                    className={`h-12 font-bold rounded-xl shadow-lg transition-all duration-300 border-0 ${
                      canAdvanceStep()
                        ? `bg-gradient-to-r ${currentStepData?.color || 'from-orange-500 to-orange-600'} hover:shadow-orange-500/25 text-white`
                        : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {activeStep === 'review' ? 'Finalizar' : `Próximo: ${getNextStepTitle()}`}
                    {activeStep !== 'review' && <span className="ml-2">→</span>}
                  </button>
                )}
              </div>

              {/* Desktop Navigation */}
              <div className="hidden sm:flex sm:justify-between sm:items-center">
                <div className="flex gap-3">
                  {shouldShowBackButton && (
                    <button
                      onClick={handleBack}
                      className="px-6 h-12 border-2 border-orange-200 dark:border-orange-700 hover:border-orange-300 dark:hover:border-orange-600 text-orange-600 dark:text-orange-400 rounded-xl font-semibold transition-all duration-300 bg-white/80 dark:bg-gray-800/80"
                    >
                      ← Voltar
                    </button>
                  )}
                </div>

                {shouldShowNextButton && (
                  <button
                    onClick={handleNext}
                    disabled={!canAdvanceStep()}
                    className={`px-8 h-12 font-bold rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 border-0 ${
                      canAdvanceStep()
                        ? `bg-gradient-to-r ${currentStepData?.color || 'from-orange-500 to-orange-600'} hover:shadow-orange-500/25 text-white`
                        : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed transform-none'
                    }`}
                  >
                    {activeStep === 'review' ? 'Finalizar Plano' : `Próximo: ${getNextStepTitle()}`}
                    {activeStep !== 'review' && <span className="ml-2">→</span>}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}