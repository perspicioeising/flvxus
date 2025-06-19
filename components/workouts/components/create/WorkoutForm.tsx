// components/workouts/components/WorkoutForm.tsx
'use client';

import { useWorkoutForm, useExerciseLibrary } from '@/components/workouts/hooks';
import { WORKOUT_STEPS } from '@/components/workouts/constants';

// Import dos componentes
import { WorkoutFormHeader } from './WorkoutFormHeader';
import { WorkoutStepNavigation } from './WorkoutStepNavigation';
import { StepBasicInfo } from '../steps/StepBasicInfo';
import { StepGoal } from '../steps/StepGoal';
import { StepExercises } from '../steps/StepExercises';
import { StepReview } from '../steps/StepReview';
import { WorkoutFormSkeleton } from './WorkoutFormSkeleton';

interface WorkoutFormProps {
  mode?: 'create' | 'edit';
  workoutId?: string;
  onSuccess?: () => void;
}

export function WorkoutForm({
  mode = 'create',
  workoutId,
  onSuccess
}: WorkoutFormProps) {
  const {
    // Estados
    formData,
    selectedExercises,
    activeStep,
    errors,
    isLoading,
    isSaving,
    
    // Ações
    setActiveStep,
    updateFormField,
    handleExerciseSelect,
    handleExerciseRemove,
    handleExerciseUpdate,
    saveWorkout,
    
    // Validações
    canAdvanceStep,
    validateStep
  } = useWorkoutForm(mode, workoutId);

  const {
    exercises,
    filteredExercises,
    filters,
    isLoading: isLoadingExercises,
    updateFilters
  } = useExerciseLibrary();

  const currentStepData = WORKOUT_STEPS.find(step => step.id === activeStep);
  const progressPercentage = ((WORKOUT_STEPS.findIndex(s => s.id === activeStep) + 1) / WORKOUT_STEPS.length) * 100;

  const handleNext = () => {
    if (!validateStep(activeStep)) return;
    
    const currentIndex = WORKOUT_STEPS.findIndex(s => s.id === activeStep);
    if (currentIndex < WORKOUT_STEPS.length - 1 && canAdvanceStep()) {
      setActiveStep(WORKOUT_STEPS[currentIndex + 1].id);
    }
  };

  const handleBack = () => {
    const currentIndex = WORKOUT_STEPS.findIndex(s => s.id === activeStep);
    if (currentIndex > 0) {
      setActiveStep(WORKOUT_STEPS[currentIndex - 1].id);
    }
  };

  const getNextStepTitle = () => {
    const currentIndex = WORKOUT_STEPS.findIndex(s => s.id === activeStep);
    const nextStep = WORKOUT_STEPS[currentIndex + 1];
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
          />
        );
      case 'goal':
        return (
          <StepGoal
            selectedLevel={formData.level}
            selectedGoal={formData.goal}
            onLevelSelect={(level: string) => updateFormField('level', level)}
            onGoalSelect={(goal: string) => updateFormField('goal', goal)}
          />
        );
      case 'exercises':
        return (
          <StepExercises
            exercises={exercises}
            selectedExercises={selectedExercises}
            filters={filters}
            onExerciseSelect={handleExerciseSelect}
            onExerciseRemove={handleExerciseRemove}
            onExerciseUpdate={handleExerciseUpdate}
            onFiltersChange={updateFilters}
            isLoading={isLoadingExercises}
          />
        );
      case 'review':
        return (
          <StepReview
            formData={formData}
            selectedExercises={selectedExercises}
            onSave={saveWorkout}
            isSaving={isSaving}
            mode={mode}
          />
        );
      default:
        return null;
    }
  };

  if (isLoading && mode === 'edit') {
    return <WorkoutFormSkeleton />;
  }

  const shouldShowNextButton = activeStep !== 'review';
  const shouldShowBackButton = activeStep !== 'basic';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        
        {/* Header */}
        <WorkoutFormHeader
          mode={mode}
          currentStepData={currentStepData}
          progressPercentage={progressPercentage}
        />

        {/* Step Navigation */}
        <WorkoutStepNavigation
          steps={WORKOUT_STEPS}
          activeStep={activeStep}
          onStepChange={setActiveStep}
          canAdvance={canAdvanceStep}
        />

        {/* Step Content */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 via-red-500/10 to-red-600/10 rounded-2xl blur-md"></div>
          <div className="relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-0 rounded-2xl shadow-xl">
            <div className="p-6 lg:p-8">
              {renderCurrentStep()}
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200/50 to-red-200/50 dark:from-gray-700/50 dark:to-red-700/50 rounded-2xl blur-md"></div>
          <div className="relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-0 rounded-2xl shadow-lg">
            <div className="p-6">
              
              {/* Mobile Navigation */}
              <div className="flex flex-col gap-3 sm:hidden">
                {shouldShowBackButton && (
                  <button
                    onClick={handleBack}
                    className="h-12 px-4 border-2 border-red-200 dark:border-red-700 hover:border-red-300 dark:hover:border-red-600 text-red-600 dark:text-red-400 rounded-xl font-semibold transition-all duration-300 bg-white/80 dark:bg-gray-800/80"
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
                        ? `bg-gradient-to-r ${currentStepData?.color || 'from-red-500 to-red-600'} hover:shadow-red-500/25 text-white`
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
                      className="px-6 h-12 border-2 border-red-200 dark:border-red-700 hover:border-red-300 dark:hover:border-red-600 text-red-600 dark:text-red-400 rounded-xl font-semibold transition-all duration-300 bg-white/80 dark:bg-gray-800/80"
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
                        ? `bg-gradient-to-r ${currentStepData?.color || 'from-red-500 to-red-600'} hover:shadow-red-500/25 text-white`
                        : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed transform-none'
                    }`}
                  >
                    {activeStep === 'review' ? 'Finalizar Treino' : `Próximo: ${getNextStepTitle()}`}
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