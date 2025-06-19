'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  ArrowRight, 
  User, 
  Target, 
  Heart, 
  Check,
  Loader2,
  Mail,
  Sparkles
} from 'lucide-react';

// Import dos componentes dos steps
import { PersonalInfoStep } from './steps/PersonalInfoStep';
import { PhysicalProfileStep } from './steps/PhysicalProfileStep';
import { MedicalInfoStep } from './steps/MedicalInfoStep';
import { useFormValidation } from './hooks/useFormValidation';
import { StudentFormData } from '@/types/student';


interface StudentFormCarouselProps {
  initialData?: Partial<StudentFormData>;
  mode?: 'create' | 'edit';
  studentId?: string;
  onSuccess?: () => void;
}

const STEPS = [
  {
    id: 1,
    title: 'Informações Pessoais',
    shortTitle: 'Pessoal',
    description: 'Nome, email, telefone e dados básicos',
    icon: User,
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 2,
    title: 'Perfil Físico e Objetivos',
    shortTitle: 'Objetivos',
    description: 'Metas, experiência e preferências de treino',
    icon: Target,
    color: 'from-blue-600 to-blue-700'
  },
  {
    id: 3,
    title: 'Informações de Saúde',
    shortTitle: 'Saúde',
    description: 'Condições médicas e contato de emergência',
    icon: Heart,
    color: 'from-blue-700 to-blue-800'
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

export function StudentFormCarousel({ 
  initialData = {}, 
  mode = 'create', 
  studentId,
  onSuccess 
}: StudentFormCarouselProps) {
  const router = useRouter();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<StudentFormData>({
    ...initialFormData,
    ...initialData
  });

  // Usar o hook de validação
  const validation = useFormValidation(formData);
  
  // Validação por step usando o hook
  const canAdvance = validation.stepValidation[currentStep]?.isValid ?? false;
  const isLastStep = currentStep === STEPS.length;

  // Navegação
  const nextStep = () => {
    if (canAdvance && currentStep < STEPS.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step <= currentStep || validation.stepValidation[step - 1]?.isValid) {
      setCurrentStep(step);
    }
  };

  // Submit
  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      
      const url = mode === 'edit' && studentId 
        ? `/api/students/${studentId}` 
        : '/api/students';
      
      const method = mode === 'edit' ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      toast({
        title: mode === 'edit' ? 'Aluno atualizado com sucesso!' : 'Aluno adicionado com sucesso!',
        description: mode === 'edit' 
          ? 'As informações foram atualizadas.'
          : 'O convite foi enviado por email.',
      });

      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/dashboard/students');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Ops! Algo deu errado',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (updates: Partial<StudentFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const currentStepData = STEPS[currentStep - 1];
  const progressPercentage = (currentStep / STEPS.length) * 100;

  // Renderizar step atual
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <PersonalInfoStep
            data={formData}
            onChange={updateFormData}
            errors={validation.errors}
          />
        );
      case 2:
        return (
          <PhysicalProfileStep
            data={formData}
            onChange={updateFormData}
            errors={validation.errors}
          />
        );
      case 3:
        return (
          <MedicalInfoStep
            data={formData}
            onChange={updateFormData}
            errors={validation.errors}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        
        {/* Header */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-blue-500/20 to-blue-600/20 dark:from-blue-500/10 dark:via-blue-400/10 dark:to-blue-500/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-blue-200/50 dark:border-blue-800/30 rounded-3xl p-6 lg:p-8 shadow-2xl">
            
            {/* Back Button + Title */}
            <div className="flex flex-col items-center text-center gap-4 mb-6">
              <div className="flex items-center justify-between w-full">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => router.back()}
                  className="h-12 w-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-blue-200 dark:border-blue-700 hover:border-blue-300 dark:hover:border-blue-600 rounded-xl shadow-lg transition-all duration-300 hover:scale-105"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                
                {/* Spacer para manter o botão alinhado à esquerda */}
                <div className="w-12"></div>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-200 dark:to-white bg-clip-text text-transparent">
                  {mode === 'edit' ? 'Editar Aluno' : 'Novo Aluno'}
                </h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-1">
                  {currentStepData.description}
                </p>
              </div>
            </div>

            {/* Steps Header */}
            <div className="space-y-6">
              
              {/* Current Step Info */}
              <div className="flex flex-col items-center text-center gap-4">
                <div className="relative">
                  <div className={`w-14 h-14 bg-gradient-to-br ${currentStepData.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                    <currentStepData.icon className="h-7 w-7 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <Sparkles className="h-3 w-3 text-white" />
                  </div>
                </div>
                
                <div className="text-center">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {currentStepData.title}
                  </h2>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <Badge className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-600 text-sm">
                      Etapa {currentStep} de {STEPS.length}
                    </Badge>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {Math.round(progressPercentage)}% concluído
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative">
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              {/* Steps Navigation */}
              <div className="flex gap-2 sm:gap-3 justify-center">
                {STEPS.map((step) => {
                  const stepValidation = validation.stepValidation[step.id];
                  const isActive = currentStep === step.id;
                  const isCompleted = currentStep > step.id && stepValidation?.isValid;
                  const canNavigate = step.id <= currentStep || stepValidation?.isValid;

                  return (
                    <button
                      key={step.id}
                      onClick={() => canNavigate && goToStep(step.id)}
                      disabled={!canNavigate}
                      className={`flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-3 rounded-xl transition-all duration-300 ${
                        isActive 
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105' 
                          : isCompleted
                          ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md hover:shadow-lg'
                          : canNavigate
                          ? 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md text-gray-700 dark:text-gray-300 hover:scale-105'
                          : 'bg-gray-100 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 opacity-50 cursor-not-allowed text-gray-400'
                      }`}
                    >
                      <div className="flex items-center justify-center w-5 h-5">
                        {isCompleted ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <step.icon className="h-4 w-4" />
                        )}
                      </div>
                      <span className="text-sm font-medium hidden sm:inline">
                        {step.shortTitle}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-blue-500/10 to-blue-600/10 rounded-2xl blur-md"></div>
          <Card className="relative border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl rounded-2xl">
            <CardContent className="p-6 lg:p-8">
              {renderCurrentStep()}
            </CardContent>
          </Card>
        </div>

        {/* Bottom Navigation */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200/50 to-blue-200/50 dark:from-gray-700/50 dark:to-blue-700/50 rounded-2xl blur-md"></div>
          <Card className="relative border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-lg rounded-2xl">
            <CardContent className="p-6">
              
              {/* Mobile Navigation */}
              <div className="flex flex-col gap-3 sm:hidden">
                {currentStep > 1 && (
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    className="h-12 border-2 border-blue-200 dark:border-blue-700 hover:border-blue-300 dark:hover:border-blue-600 text-blue-600 dark:text-blue-400 rounded-xl font-semibold transition-all duration-300"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar
                  </Button>
                )}
                
                <Button
                  onClick={isLastStep ? handleSubmit : nextStep}
                  disabled={!canAdvance || isLoading}
                  className={`h-12 font-bold rounded-xl shadow-lg transition-all duration-300 border-0 ${
                    isLastStep
                      ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 hover:shadow-green-500/25 text-white'
                      : `bg-gradient-to-r ${currentStepData.color} hover:shadow-blue-500/25 text-white`
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {mode === 'edit' ? 'Salvando...' : 'Enviando...'}
                    </>
                  ) : isLastStep ? (
                    <>
                      {mode === 'edit' ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Salvar Alterações
                        </>
                      ) : (
                        <>
                          <Mail className="h-4 w-4 mr-2" />
                          Enviar Convite
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      Próximo: {STEPS[currentStep]?.shortTitle}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => router.back()}
                  className="h-12 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl font-semibold transition-all duration-300"
                >
                  Cancelar
                </Button>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden sm:flex sm:justify-between sm:items-center">
                <div className="flex gap-3">
                  {currentStep > 1 && (
                    <Button
                      variant="outline"
                      onClick={prevStep}
                      className="px-6 h-12 border-2 border-blue-200 dark:border-blue-700 hover:border-blue-300 dark:hover:border-blue-600 text-blue-600 dark:text-blue-400 rounded-xl font-semibold transition-all duration-300"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Voltar
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="px-6 h-12 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl font-semibold transition-all duration-300"
                  >
                    Cancelar
                  </Button>
                </div>

                <Button
                  onClick={isLastStep ? handleSubmit : nextStep}
                  disabled={!canAdvance || isLoading}
                  className={`px-8 h-12 font-bold rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 border-0 ${
                    isLastStep
                      ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 hover:shadow-green-500/25 text-white'
                      : `bg-gradient-to-r ${currentStepData.color} hover:shadow-blue-500/25 text-white`
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {mode === 'edit' ? 'Salvando...' : 'Enviando...'}
                    </>
                  ) : isLastStep ? (
                    <>
                      {mode === 'edit' ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Salvar Alterações
                        </>
                      ) : (
                        <>
                          <Mail className="h-4 w-4 mr-2" />
                          Enviar Convite
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      Próximo: {STEPS[currentStep]?.shortTitle}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>

              {/* Help Text */}
              <div className="mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {mode === 'edit' 
                    ? 'Atualize as informações necessárias e salve as alterações'
                    : 'Preencha todos os campos obrigatórios para enviar o convite por email'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}