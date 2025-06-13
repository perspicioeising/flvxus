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
  UserPlus,
  Sparkles,
  Users
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
    title: 'Dados Pessoais',
    shortTitle: 'Pessoal',
    description: 'Informações básicas',
    icon: User,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 2,
    title: 'Perfil de Treino',
    shortTitle: 'Treino',
    description: 'Objetivos e preferências',
    icon: Target,
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 3,
    title: 'Informações Médicas',
    shortTitle: 'Saúde',
    description: 'Saúde e observações',
    icon: Heart,
    color: 'from-green-500 to-emerald-500'
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-green-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black overflow-hidden">
      
      {/* Background Elements - Igual ao Login */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-green-500/20 to-emerald-500/10 rounded-full blur-3xl animate-pulse opacity-50" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-tl from-teal-500/15 to-transparent rounded-full blur-3xl animate-pulse delay-1000 opacity-60" />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-gradient-to-r from-blue-500/10 to-purple-500/20 rounded-full blur-3xl animate-pulse delay-500 opacity-40" />
        <div className="absolute top-10 right-1/4 w-48 h-48 bg-gradient-to-l from-purple-500/15 to-pink-500/10 rounded-full blur-3xl animate-pulse delay-700 opacity-30" />
      </div>

      <div className="relative w-full max-w-2xl mx-4 my-8">
        
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="p-3 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 transition-all duration-300"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>

        {/* Main Card */}
        <div className="relative group">
          {/* Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 via-emerald-500/20 to-teal-600/20 dark:from-green-500/10 dark:via-emerald-400/10 dark:to-teal-500/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          {/* Card */}
          <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-green-200/50 dark:border-green-800/30 rounded-3xl shadow-2xl overflow-hidden">
            
            {/* Animated gradient border */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute inset-[1px] bg-white dark:bg-gray-900 rounded-3xl"></div>

            <div className="relative p-6 lg:p-8">
              
              {/* Header */}
              <div className="text-center mb-8">
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className={`w-16 h-16 bg-gradient-to-br ${currentStepData.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                      <currentStepData.icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <Sparkles className="h-3 w-3 text-white" />
                    </div>
                  </div>
                </div>
                
                <h1 className="text-3xl font-black bg-gradient-to-r from-gray-600 via-gray-600 to-gray-900 dark:from-white dark:via-gray-400 dark:to-white bg-clip-text text-transparent mb-3">
                  {mode === 'edit' ? 'Editar Aluno' : 'Adicionar Novo Aluno'}
                </h1>
                
                <p className="text-gray-600 dark:text-gray-300 text-lg mb-6">
                  {currentStepData.title} • {currentStepData.description}
                </p>

                {/* Progress Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Progresso
                    </span>
                    <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-800 dark:text-green-300 border-0 font-bold">
                      {currentStep} de {STEPS.length}
                    </Badge>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl blur opacity-50"></div>
                    <Progress 
                      value={progressPercentage} 
                      className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-xl"
                    />
                  </div>

                  {/* Steps Navigation */}
                  <div className="flex justify-center gap-3">
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
                          className={`relative w-12 h-12 rounded-2xl transition-all duration-300 ${
                            isActive 
                              ? `bg-gradient-to-br ${step.color} shadow-lg scale-110` 
                              : isCompleted
                              ? 'bg-gradient-to-br from-green-500 to-emerald-500 shadow-md hover:shadow-lg'
                              : canNavigate
                              ? 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
                              : 'bg-gray-100 dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 opacity-50 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-center justify-center">
                            {isCompleted ? (
                              <Check className="h-5 w-5 text-white" />
                            ) : (
                              <step.icon className={`h-5 w-5 ${
                                isActive ? 'text-white' : canNavigate ? 'text-gray-600 dark:text-gray-400' : 'text-gray-400'
                              }`} />
                            )}
                          </div>
                          
                          {isActive && (
                            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"></div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Step Content */}
              <div className="mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-50/50 to-green-50/50 dark:from-gray-800/50 dark:to-green-900/20 rounded-2xl blur opacity-50"></div>
                  <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
                    {renderCurrentStep()}
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="space-y-4">
                {/* Mobile: Stack vertically */}
                <div className="flex flex-col gap-3 sm:hidden">
                  {currentStep > 1 && (
                    <Button
                      variant="outline"
                      onClick={prevStep}
                      className="h-14 text-lg border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 rounded-2xl font-semibold transition-all duration-300"
                    >
                      <ArrowLeft className="h-5 w-5 mr-2" />
                      Voltar
                    </Button>
                  )}
                  
                  <Button
                    onClick={isLastStep ? handleSubmit : nextStep}
                    disabled={!canAdvance || isLoading}
                    className={`h-14 text-lg font-bold rounded-2xl shadow-2xl transition-all duration-500 transform hover:scale-105 border-0 ${
                      isLastStep
                        ? 'bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 hover:shadow-green-500/25'
                        : `bg-gradient-to-r ${currentStepData.color} hover:shadow-lg`
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        {mode === 'edit' ? 'Salvando...' : 'Enviando...'}
                      </>
                    ) : isLastStep ? (
                      <>
                        {mode === 'edit' ? (
                          <>
                            <Check className="h-5 w-5 mr-2" />
                            Salvar Alterações
                          </>
                        ) : (
                          <>
                            <Mail className="h-5 w-5 mr-2" />
                            Enviar Convite
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        Próximo
                        <ArrowRight className="h-5 w-5 ml-2" />
                      </>
                    )}
                  </Button>
                </div>

                {/* Desktop: Horizontal layout */}
                <div className="hidden sm:flex sm:justify-between sm:items-center">
                  <div className="flex gap-3">
                    {currentStep > 1 && (
                      <Button
                        variant="outline"
                        onClick={prevStep}
                        className="px-6 h-12 border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 rounded-2xl font-semibold transition-all duration-300"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Voltar
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      onClick={() => router.back()}
                      className="px-6 h-12 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-2xl font-semibold transition-all duration-300"
                    >
                      Cancelar
                    </Button>
                  </div>

                  <Button
                    onClick={isLastStep ? handleSubmit : nextStep}
                    disabled={!canAdvance || isLoading}
                    className={`px-8 h-12 font-bold rounded-2xl shadow-2xl transition-all duration-500 transform hover:scale-105 border-0 ${
                      isLastStep
                        ? 'bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 hover:shadow-green-500/25'
                        : `bg-gradient-to-r ${currentStepData.color}`
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
                        Próximo
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Footer Info */}
              <div className="mt-6 text-center">
                <div className="p-4 bg-gradient-to-r from-gray-50 to-green-50 dark:from-gray-800/50 dark:to-green-900/20 rounded-xl border border-gray-200/50 dark:border-green-700/50">
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Users className="h-4 w-4" />
                    <span>
                      {mode === 'edit' 
                        ? 'Atualize as informações do aluno conforme necessário'
                        : 'Um convite será enviado automaticamente por email'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}