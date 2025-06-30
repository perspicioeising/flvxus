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
    <div className="min-h-screen bg-app-gradient">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-4xl">
        
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
          <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-workout/10 via-app-achievement-workout/15 to-app-achievement-workout/10 rounded-2xl blur-md"></div>
          <div className="relative bg-app-overlay backdrop-blur-xl border-0 rounded-2xl shadow-app-xl">
            <div className="p-4 sm:p-6 lg:p-8">
              {renderCurrentStep()}
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-app-bg-secondary/50 to-app-achievement-workout/20 rounded-2xl blur-md"></div>
          <div className="relative bg-app-overlay backdrop-blur-xl border-0 rounded-2xl shadow-app-large">
            <div className="p-4 sm:p-6">
              
              {/* Mobile Navigation */}
              <div className="flex flex-col gap-3 sm:hidden">
                {shouldShowBackButton && (
                  <button
                    onClick={handleBack}
                    className="h-12 px-4 border-2 border-app-border-accent hover:border-app-achievement-workout text-app-achievement-workout rounded-xl font-semibold transition-all duration-300 bg-app-card"
                  >
                    ← Voltar
                  </button>
                )}
                
                {shouldShowNextButton && (
                  <button
                    onClick={handleNext}
                    disabled={!canAdvanceStep()}
                    className={`h-12 font-bold rounded-xl shadow-app-large transition-all duration-300 border-0 ${
                      canAdvanceStep()
                        ? `bg-achievement-workout hover:bg-app-achievement-workout/90 hover:shadow-app-achievement-workout/25 text-white`
                        : 'bg-app-bg-secondary text-app-text-muted cursor-not-allowed'
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
                      className="px-6 h-12 border-2 border-app-border-accent hover:border-app-achievement-workout text-app-achievement-workout rounded-xl font-semibold transition-all duration-300 bg-app-card"
                    >
                      ← Voltar
                    </button>
                  )}
                </div>

                {shouldShowNextButton && (
                  <button
                    onClick={handleNext}
                    disabled={!canAdvanceStep()}
                    className={`px-8 h-12 font-bold rounded-xl shadow-app-large transition-all duration-300 transform hover:scale-105 border-0 ${
                      canAdvanceStep()
                        ? `bg-achievement-workout hover:bg-app-achievement-workout/90 hover:shadow-app-achievement-workout/25 text-white`
                        : 'bg-app-bg-secondary text-app-text-muted cursor-not-allowed transform-none'
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