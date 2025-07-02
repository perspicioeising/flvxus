// components/physical-assessments/components/physicalAssessmentForm.tsx
'use client';

import { usePhysicalAssessmentForm } from '@/components/physical-assessments/hooks/usePhysicalAssessmentForm';
import { ASSESSMENT_STEPS } from '@/components/physical-assessments/constants/physical-assessment';

// Import dos componentes dos steps com nova nomenclatura
import { PhysicalAssessmentHeader } from './physicalAssessmentHeader';
import { StepNavigation } from '../progresso/StepNavigation';
import { StepBasic } from '../steps/StepBasic';
import { StepProtocol } from '../steps/StepProtocol';
import { StepMeasurements } from '../steps/StepMeasurements';
import { StepResults } from '../steps/StepResults';
import { StepAnalysis } from '../steps/StepAnalysis';
import { PhysicalAssessmentFormSkeleton } from './physicalAssessmentLoading';

interface PhysicalAssessmentFormCarouselProps {
  mode?: 'create' | 'edit';
  assessmentId?: string;
  onSuccess?: () => void;
}

export function PhysicalAssessmentFormCarousel({
  mode = 'create',
  assessmentId,
  onSuccess
}: PhysicalAssessmentFormCarouselProps) {
  const {
    // Estados
    students,
    selectedStudent,
    formData,
    calculations,
    aiAnalysis,
    activeStep,
    isLoading,
    isAnalyzing,
    isSaving,
    
    // Ações
    setActiveStep,
    handleStudentSelect,
    updateFormField,
    updateMeasurement,
    analyzeWithAI,
    saveAssessment,
    
    // Validações
    hasRequiredMeasurements,
    getRequiredFields
  } = usePhysicalAssessmentForm(mode, assessmentId);

  const currentStepData = ASSESSMENT_STEPS.find(step => step.id === activeStep);
  const progressPercentage = ((ASSESSMENT_STEPS.findIndex(s => s.id === activeStep) + 1) / ASSESSMENT_STEPS.length) * 100;

  // Função corrigida para retornar sempre boolean
  const canAdvanceStep = (): boolean => {
    switch (activeStep) {
      case 'basic':
        return Boolean(formData.student_id && formData.weight && formData.height);
      case 'protocol':
        return Boolean(formData.protocol);
      case 'measurements':
        return hasRequiredMeasurements();
      case 'results':
        return calculations !== null;
      default:
        return true;
    }
  };

  const handleNext = () => {
    const currentIndex = ASSESSMENT_STEPS.findIndex(s => s.id === activeStep);
    if (currentIndex < ASSESSMENT_STEPS.length - 1 && canAdvanceStep()) {
      setActiveStep(ASSESSMENT_STEPS[currentIndex + 1].id);
    }
  };

  const handleBack = () => {
    const currentIndex = ASSESSMENT_STEPS.findIndex(s => s.id === activeStep);
    if (currentIndex > 0) {
      setActiveStep(ASSESSMENT_STEPS[currentIndex - 1].id);
    }
  };

  // Função para obter o próximo step
  const getNextStepTitle = () => {
    const currentIndex = ASSESSMENT_STEPS.findIndex(s => s.id === activeStep);
    const nextStep = ASSESSMENT_STEPS[currentIndex + 1];
    return nextStep?.shortTitle || 'Próximo';
  };

  const renderCurrentStep = () => {
    switch (activeStep) {
      case 'basic':
        return (
          <StepBasic
            students={students}
            selectedStudent={selectedStudent}
            formData={formData}
            onStudentSelect={handleStudentSelect}
            onUpdateField={updateFormField}
            isLoading={isLoading}
          />
        );
      case 'protocol':
        return (
          <StepProtocol
            selectedProtocol={formData.protocol}
            onProtocolSelect={(protocol: string) => updateFormField('protocol', protocol)}
            gender={formData.gender}
            getRequiredFields={getRequiredFields}
          />
        );
      case 'measurements':
        return (
          <StepMeasurements
            measurements={formData.measurements}
            protocol={formData.protocol}
            gender={formData.gender}
            onUpdateMeasurement={updateMeasurement}
            getRequiredFields={getRequiredFields}
          />
        );
      case 'results':
        return (
          <StepResults
            calculations={calculations}
            notes={formData.notes}
            onUpdateNotes={(notes: string) => updateFormField('notes', notes)}
            onAnalyze={analyzeWithAI}
            onSave={saveAssessment}
            isAnalyzing={isAnalyzing}
            isSaving={isSaving}
            mode={mode}
          />
        );
      case 'analysis':
        return (
          <StepAnalysis
            aiAnalysis={aiAnalysis}
            calculations={calculations}
            selectedStudent={selectedStudent}
            onSave={saveAssessment}
            isSaving={isSaving}
            mode={mode}
          />
        );
      default:
        return null;
    }
  };

  if (isLoading && mode === 'edit') {
    return <PhysicalAssessmentFormSkeleton />;
  }

  // Verificar se deve mostrar o botão próximo
  const shouldShowNextButton = activeStep !== 'analysis';
  const shouldShowBackButton = activeStep !== 'basic';

  return (
    <div className="min-h-screen bg-app-gradient">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        
        {/* Header */}
        <PhysicalAssessmentHeader
          mode={mode}
          currentStepData={currentStepData}
          progressPercentage={progressPercentage}
        />

        {/* Step Navigation */}
        <StepNavigation
          steps={ASSESSMENT_STEPS}
          activeStep={activeStep}
          onStepChange={setActiveStep}
          canAdvance={canAdvanceStep}
        />

        {/* Step Content */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 via-green-500/10 to-green-600/10 rounded-2xl blur-md"></div>
          <div className="relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-0 rounded-2xl shadow-xl">
            <div className="p-6 lg:p-8">
              {renderCurrentStep()}
            </div>
          </div>
        </div>

        {/* Bottom Navigation - Corrigido para Mobile */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200/50 to-green-200/50 dark:from-gray-700/50 dark:to-green-700/50 rounded-2xl blur-md"></div>
          <div className="relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-0 rounded-2xl shadow-lg">
            <div className="p-6">
              
              {/* Mobile Navigation - CORRIGIDO */}
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
                    disabled={!canAdvanceStep()}
                    className={`h-12 font-bold rounded-xl shadow-lg transition-all duration-300 border-0 ${
                      canAdvanceStep()
                        ? `bg-gradient-to-r ${currentStepData?.color || 'from-green-500 to-green-600'} hover:shadow-green-500/25 text-white`
                        : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {activeStep === 'results' ? 'Finalizar' : `Próximo: ${getNextStepTitle()}`}
                    {activeStep !== 'results' && <span className="ml-2">→</span>}
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
                    disabled={!canAdvanceStep()}
                    className={`px-8 h-12 font-bold rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 border-0 ${
                      canAdvanceStep()
                        ? `bg-gradient-to-r ${currentStepData?.color || 'from-green-500 to-green-600'} hover:shadow-green-500/25 text-white`
                        : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed transform-none'
                    }`}
                  >
                    {activeStep === 'results' ? 'Finalizar Avaliação' : `Próximo: ${getNextStepTitle()}`}
                    {activeStep !== 'results' && <span className="ml-2">→</span>}
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