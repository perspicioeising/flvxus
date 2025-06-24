'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { StudentFormHeader } from './StudentFormHeader';
import { StudentStepNavigation } from './StudentStepNavigation';
import { PersonalInfoStep } from '../../steps/PersonalInfoStep';
import { PhysicalProfileStep } from '../../steps/PhysicalProfileStep';
import { MedicalInfoStep } from '../../steps/MedicalInfoStep';
import { useToast } from '@/hooks/use-toast';
import { useFormValidation } from '../../hooks/useFormValidation';
import { StudentFormData } from '@/types/student';

interface StudentFormCarouselProps {
  mode?: 'create' | 'edit';
  studentId?: string;
}

const STUDENT_STEPS = [
  {
    id: 1,
    title: 'Informações Pessoais',
    shortTitle: 'Pessoal',
    description: 'Nome, email, telefone e dados básicos',
    icon: 'User',
    color: 'achievement-workout'
  },
  {
    id: 2,
    title: 'Perfil Físico e Objetivos',
    shortTitle: 'Objetivos',
    description: 'Metas, experiência e preferências de treino',
    icon: 'Target',
    color: 'achievement-consecutive'
  },
  {
    id: 3,
    title: 'Informações de Saúde',
    shortTitle: 'Saúde',
    description: 'Condições médicas e contato de emergência',
    icon: 'Heart',
    color: 'achievement-weight'
  }
];

const initialFormData: StudentFormData = {
  name: '',
  email: '',
  phone: '',
  birthDate: '',
  gender: '',
  height: '',
  weight: '',
  goals: [],
  medicalConditions: '',
  emergencyContact: '',
  preferredTime: '',
  experienceLevel: '',
  notes: ''
};

export function StudentFormCarousel({ mode = 'create', studentId }: StudentFormCarouselProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [activeStep, setActiveStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<StudentFormData>(initialFormData);

  // Hook de validação
  const validation = useFormValidation(formData);

  // Função para scroll automático para o topo (mobile)
  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    }
  };

  // Fetch student data for edit mode
  useEffect(() => {
    if (mode === 'edit' && studentId) {
      fetchStudentData(studentId);
    }
  }, [mode, studentId]);

  const fetchStudentData = async (id: string) => {
    try {
      setIsLoading(true);
      console.log('🔄 Carregando dados do aluno:', id);

      const response = await fetch(`/api/students/${id}`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      console.log('📄 Dados do aluno carregados:', data.full_name);

      setFormData({
        name: data.full_name || '',
        email: data.email || '',
        phone: data.phone || '',
        birthDate: data.birth_date || '',
        gender: data.gender || '',
        height: data.height ? data.height.toString() : '',
        weight: data.weight ? data.weight.toString() : '',
        goals: data.goals || [],
        medicalConditions: data.medical_conditions || '',
        emergencyContact: data.emergency_contact || '',
        preferredTime: data.preferred_training_time || '',
        experienceLevel: data.experience_level || '',
        notes: data.notes || ''
      });

    } catch (error: any) {
      console.error('❌ Erro ao carregar aluno:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar aluno",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormField = (updates: Partial<StudentFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const currentStepData = STUDENT_STEPS.find(step => step.id === activeStep);
  const progressPercentage = (activeStep / STUDENT_STEPS.length) * 100;

  const canAdvanceStep = (): boolean => {
    return validation.stepValidation[activeStep]?.isValid ?? false;
  };

  const handleNext = () => {
    const currentIndex = STUDENT_STEPS.findIndex(s => s.id === activeStep);
    if (currentIndex < STUDENT_STEPS.length - 1 && canAdvanceStep()) {
      setActiveStep(STUDENT_STEPS[currentIndex + 1].id);
      setTimeout(scrollToTop, 100);
    }
  };

  const handleBack = () => {
    const currentIndex = STUDENT_STEPS.findIndex(s => s.id === activeStep);
    if (currentIndex > 0) {
      setActiveStep(STUDENT_STEPS[currentIndex - 1].id);
      setTimeout(scrollToTop, 100);
    }
  };

  const handleStepChange = (stepId: number) => {
    setActiveStep(stepId);
    setTimeout(scrollToTop, 100);
  };

  const getNextStepTitle = () => {
    const currentIndex = STUDENT_STEPS.findIndex(s => s.id === activeStep);
    const nextStep = STUDENT_STEPS[currentIndex + 1];
    return nextStep?.shortTitle || 'Finalizar';
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      // Preparar dados para envio
      const studentData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        birthDate: formData.birthDate || null,
        gender: formData.gender || null,
        height: formData.height ? parseFloat(formData.height) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        goals: Array.isArray(formData.goals) ? formData.goals : [],
        medicalConditions: formData.medicalConditions || null,
        emergencyContact: formData.emergencyContact || null,
        preferredTime: formData.preferredTime || null,
        experienceLevel: formData.experienceLevel || null,
        notes: formData.notes || null
      };

      console.log('💾 Salvando aluno:', {
        mode,
        name: studentData.name
      });

      const response = await fetch(
        mode === 'edit' ? `/api/students/${studentId}` : '/api/students',
        {
          method: mode === 'edit' ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(studentData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      // Mensagem de sucesso personalizada
      const successTitle = mode === 'edit' 
        ? "Aluno atualizado com sucesso! 🎉"
        : "Aluno criado com sucesso! 🎉";
      
      const successDescription = mode === 'edit'
        ? "As alterações foram salvas"
        : "Um email de convite foi enviado para o aluno definir sua senha";

      toast({
        title: successTitle,
        description: successDescription,
      });

      router.push('/dashboard/students');

    } catch (error: any) {
      console.error('❌ Erro ao salvar aluno:', error);

      toast({
        variant: "destructive",
        title: "Erro ao salvar aluno",
        description: error.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const renderCurrentStep = () => {
    switch (activeStep) {
      case 1:
        return (
          <PersonalInfoStep
            data={formData}
            onChange={updateFormField}
            errors={validation.errors}
          />
        );
      case 2:
        return (
          <PhysicalProfileStep
            data={formData}
            onChange={updateFormField}
            errors={validation.errors}
          />
        );
      case 3:
        return (
          <MedicalInfoStep
            data={formData}
            onChange={updateFormField}
            errors={validation.errors}
            onSave={handleSave}
            isSaving={isSaving}
            mode={mode}
          />
        );
      default:
        return null;
    }
  };

  const shouldShowNextButton = activeStep !== STUDENT_STEPS.length;
  const shouldShowBackButton = activeStep !== 1;

  return (
    <div className="min-h-screen bg-app-gradient">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-5xl">

        {/* Header */}
        <StudentFormHeader
          mode={mode}
          currentStepData={currentStepData}
          progressPercentage={progressPercentage}
        />

        {/* Step Navigation */}
        <StudentStepNavigation
          steps={STUDENT_STEPS}
          activeStep={activeStep}
          onStepChange={handleStepChange}
          stepValidation={validation.stepValidation}
        />

        {/* Step Content */}
        <div className="relative mb-6 sm:mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-app-text-accent/10 via-app-achievement-workout/10 to-app-achievement-consecutive/10 rounded-2xl blur-xl"></div>
          <div className="relative bg-app-card border border-app-border-muted rounded-2xl shadow-app-xl">
            <div className="p-4 sm:p-6 lg:p-8">
              {renderCurrentStep()}
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-app-bg-secondary/50 to-app-text-accent/20 rounded-2xl blur-md"></div>
          <div className="relative bg-app-card border border-app-border-muted rounded-2xl shadow-app-large">
            <div className="p-4 sm:p-6">

              {/* Mobile Navigation */}
              <div className="flex flex-col gap-3 sm:hidden">
                {shouldShowBackButton && (
                  <button
                    onClick={handleBack}
                    className="h-12 px-4 bg-app-bg-secondary border-2 border-app-border-default hover:border-app-border-accent text-app-text-secondary hover:text-app-text-primary rounded-xl font-semibold transition-all duration-300"
                  >
                    ← Voltar
                  </button>
                )}

                {shouldShowNextButton ? (
                  <button
                    onClick={handleNext}
                    disabled={!canAdvanceStep()}
                    className={`h-12 font-bold rounded-xl shadow-app-large transition-all duration-300 border-0 ${canAdvanceStep()
                      ? `btn-gradient-primary hover:shadow-app-xl text-white transform hover:scale-[1.02]`
                      : 'bg-app-bg-secondary text-app-text-muted cursor-not-allowed'
                      }`}
                  >
                    {activeStep === STUDENT_STEPS.length - 1 ? 'Finalizar' : `Próximo: ${getNextStepTitle()}`}
                    <span className="ml-2">→</span>
                  </button>
                ) : null}
              </div>

              {/* Desktop Navigation */}
              <div className="hidden sm:flex sm:justify-between sm:items-center">
                <div className="flex gap-3">
                  {shouldShowBackButton && (
                    <button
                      onClick={handleBack}
                      className="px-6 h-12 bg-app-bg-secondary border-2 border-app-border-default hover:border-app-border-accent text-app-text-secondary hover:text-app-text-primary rounded-xl font-semibold transition-all duration-300"
                    >
                      ← Voltar
                    </button>
                  )}
                </div>

                {shouldShowNextButton && (
                  <button
                    onClick={handleNext}
                    disabled={!canAdvanceStep()}
                    className={`px-8 h-12 font-bold rounded-xl shadow-app-large transition-all duration-300 transform hover:scale-105 border-0 ${canAdvanceStep()
                      ? `btn-gradient-primary hover:shadow-app-xl text-white`
                      : 'bg-app-bg-secondary text-app-text-muted cursor-not-allowed transform-none'
                      }`}
                  >
                    {activeStep === STUDENT_STEPS.length - 1 ? 'Finalizar Cadastro' : `Próximo: ${getNextStepTitle()}`}
                    <span className="ml-2">→</span>
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