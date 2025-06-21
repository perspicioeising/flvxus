// components/diets/create/DietForm.tsx
'use client';

import { useMemo } from 'react';
import { useDietForm } from '../hooks/useDietForm';
import { DIET_STEPS } from '../constants';

// Import dos componentes
import { DietFormHeader } from './DietFormHeader';
import { DietStepNavigation } from './DietStepNavigation';
import { DietFormSkeleton } from './DietFormSkeleton';
import { StepBasicInfo } from '../steps/StepBasicInfo';
import { StepGoals } from '../steps/StepGoals';
import { StepPreferences } from '../steps/StepPreferences';
import { StepReview } from '../steps/StepReview';

interface DietFormProps {
  mode?: 'create' | 'edit';
  dietId?: string;
  studentId?: string;
  onSuccess?: () => void;
}

export function DietForm({
  mode = 'create',
  dietId,
  studentId,
  onSuccess
}: DietFormProps) {
  const {
    // Estados
    formData,
    activeStep,
    isGenerating,
    isSaving,
    isLoading,
    students,
    physicalAssessment,
    generatedDiet,
    errors,
    dietNotes,
    userProfile,
    
    // Ações
    setActiveStep,
    updateFormField,
    handleStudentChange,
    toggleDietaryStyle,
    toggleFoodPreference,
    toggleRestriction,
    togglePhysicalAssessment,
    generateDiet,
    saveDiet,
    validateStep,
    canAdvanceStep,
    isFormValid,
    setDietNotes
  } = useDietForm({ mode, dietId, studentId, onSuccess });

  // Todos os hooks devem ser chamados antes de qualquer return condicional
  const currentStepData = useMemo(() => 
    DIET_STEPS.find(step => step.id === activeStep), 
    [activeStep]
  );
  
  const progressPercentage = useMemo(() => 
    ((DIET_STEPS.findIndex(s => s.id === activeStep) + 1) / DIET_STEPS.length) * 100,
    [activeStep]
  );

  const currentCanAdvance = useMemo(() => canAdvanceStep(), [canAdvanceStep]);
  const formIsValid = useMemo(() => isFormValid(), [isFormValid]);
  
  const nextStepTitle = useMemo(() => {
    const currentIndex = DIET_STEPS.findIndex(s => s.id === activeStep);
    const nextStep = DIET_STEPS[currentIndex + 1];
    return nextStep?.shortTitle || 'Próximo';
  }, [activeStep]);

  const shouldShowNextButton = activeStep !== 'review';
  const shouldShowBackButton = activeStep !== 'basic';

  // Handlers
  const handleNext = () => {
    if (!validateStep(activeStep)) return;
    
    const currentIndex = DIET_STEPS.findIndex(s => s.id === activeStep);
    if (currentIndex < DIET_STEPS.length - 1 && currentCanAdvance) {
      setActiveStep(DIET_STEPS[currentIndex + 1].id);
    }
  };

  const handleBack = () => {
    const currentIndex = DIET_STEPS.findIndex(s => s.id === activeStep);
    if (currentIndex > 0) {
      setActiveStep(DIET_STEPS[currentIndex - 1].id);
    }
  };

  const renderCurrentStep = () => {
    switch (activeStep) {
      case 'basic':
        return (
          <StepBasicInfo
            formData={formData}
            students={students}
            physicalAssessment={physicalAssessment}
            userProfile={userProfile}
            errors={errors}
            onUpdateField={updateFormField}
            onStudentChange={handleStudentChange}
            onTogglePhysicalAssessment={togglePhysicalAssessment}
          />
        );
      case 'goals':
        return (
          <StepGoals
            formData={formData}
            errors={errors}
            onUpdateField={updateFormField}
          />
        );
      case 'preferences':
        return (
          <StepPreferences
            formData={formData}
            onToggleDietaryStyle={toggleDietaryStyle}
            onToggleFoodPreference={toggleFoodPreference}
            onToggleRestriction={toggleRestriction}
            onUpdateField={updateFormField}
          />
        );
      case 'review':
        return (
          <StepReview
            formData={formData}
            generatedDiet={generatedDiet}
            dietNotes={dietNotes}
            isGenerating={isGenerating}
            isSaving={isSaving}
            isFormValid={formIsValid}
            onGenerateDiet={generateDiet}
            onSaveDiet={saveDiet}
            onSetDietNotes={setDietNotes}
          />
        );
      default:
        return null;
    }
  };

  // Agora sim podemos ter returns condicionais
  if (isLoading) {
    return <DietFormSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        
        {/* Header */}
        <DietFormHeader
          mode={mode}
          currentStepData={currentStepData}
          progressPercentage={progressPercentage}
        />

        {/* Step Navigation */}
        <DietStepNavigation
          steps={DIET_STEPS}
          activeStep={activeStep}
          onStepChange={setActiveStep}
          canAdvance={currentCanAdvance}
        />

        {/* Step Content */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 via-emerald-500/10 to-green-600/10 rounded-2xl blur-md"></div>
          <div className="relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-0 rounded-2xl shadow-xl">
            <div className="p-6 lg:p-8">
              {renderCurrentStep()}
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200/50 to-green-200/50 dark:from-gray-700/50 dark:to-green-700/50 rounded-2xl blur-md"></div>
          <div className="relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-0 rounded-2xl shadow-lg">
            <div className="p-6">
              
              {/* Mobile Navigation */}
              <div className="flex flex-col gap-3 sm:hidden">
                {shouldShowBackButton && (
                  <button
                    onClick={handleBack}
                    className="h-12 px-4 border-2 border-green-200 dark:border-green-700 hover:border-green-300 dark:hover:border-green-600 text-green-600 dark:text-green-400 rounded-xl font-semibold transition-all duration-300 bg-white/80 dark:bg-gray-800/80"
                  >
                    ← Voltar
                  </button>
                )}
                
                {shouldShowNextButton && (
                  <button
                    onClick={handleNext}
                    disabled={!currentCanAdvance}
                    className={`h-12 font-bold rounded-xl shadow-lg transition-all duration-300 border-0 ${
                      currentCanAdvance
                        ? `bg-gradient-to-r ${currentStepData?.color || 'from-green-500 to-emerald-600'} hover:shadow-green-500/25 text-white`
                        : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {activeStep === 'preferences' ? 'Gerar Dieta' : `Próximo: ${nextStepTitle}`}
                    {activeStep !== 'preferences' && <span className="ml-2">→</span>}
                  </button>
                )}
              </div>

              {/* Desktop Navigation */}
              <div className="hidden sm:flex sm:justify-between sm:items-center">
                <div className="flex gap-3">
                  {shouldShowBackButton && (
                    <button
                      onClick={handleBack}
                      className="px-6 h-12 border-2 border-green-200 dark:border-green-700 hover:border-green-300 dark:hover:border-green-600 text-green-600 dark:text-green-400 rounded-xl font-semibold transition-all duration-300 bg-white/80 dark:bg-gray-800/80"
                    >
                      ← Voltar
                    </button>
                  )}
                </div>

                {shouldShowNextButton && (
                  <button
                    onClick={handleNext}
                    disabled={!currentCanAdvance}
                    className={`px-8 h-12 font-bold rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 border-0 ${
                      currentCanAdvance
                        ? `bg-gradient-to-r ${currentStepData?.color || 'from-green-500 to-emerald-600'} hover:shadow-green-500/25 text-white`
                        : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed transform-none'
                    }`}
                  >
                    {activeStep === 'preferences' ? 'Gerar Dieta com IA' : `Próximo: ${nextStepTitle}`}
                    {activeStep !== 'preferences' && <span className="ml-2">→</span>}
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