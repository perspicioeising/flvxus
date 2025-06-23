// components/exercises/ExerciseFormCarousel.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ExerciseHeader } from './ExerciseHeader';
import { StepNavigation } from '@/components/exercices/components/progresso/StepNavigation';
import { StepBasicInfo } from '../steps/StepBasicInfo';
import { StepMedia } from '../steps/StepMedia';
import { StepDetails } from '../steps/StepDetails';
import { StepReview } from '../steps/StepReview';
import { useToast } from '@/hooks/use-toast';
import { EXERCISE_STEPS } from '@/components/exercices/components/constants/exercise';

interface ExerciseFormData {
  name: string;
  description: string;
  muscle_group: string[];
  equipment: string[];
  variations: string;
  video_url: string;
  audio_url: string;
  tips: string;
  common_errors: string;
}

interface ExerciseFormCarouselProps {
  mode?: 'create' | 'clone' | 'edit';
  exerciseId?: string;
  cloneId?: string;
}

export function ExerciseFormCarousel({ mode = 'create', exerciseId, cloneId }: ExerciseFormCarouselProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [activeStep, setActiveStep] = useState('basic');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [audioUrl, setAudioUrl] = useState('');

  const [formData, setFormData] = useState<ExerciseFormData>({
    name: '',
    description: '',
    muscle_group: [],
    equipment: [],
    variations: '',
    video_url: '',
    audio_url: '',
    tips: '',
    common_errors: '',
  });

  // Detectar clonagem via query params se não for passado via props
  const effectiveCloneId = cloneId || searchParams.get('clone');
  const isCloning = mode === 'create' && effectiveCloneId;

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

  // Fetch exercise data for edit mode or clone mode
  useEffect(() => {
    if (mode === 'edit' && exerciseId) {
      fetchExerciseData(exerciseId, false);
    } else if (isCloning && effectiveCloneId) {
      fetchExerciseData(effectiveCloneId, true);
    }
  }, [mode, exerciseId, isCloning, effectiveCloneId]);

  const fetchExerciseData = async (id: string, isClone: boolean = false) => {
    try {
      setIsLoading(true);
      console.log(`🔄 ${isClone ? 'Clonando' : 'Carregando'} exercício:`, id);

      const response = await fetch(`/api/exercises/${id}`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      console.log('📄 Dados do exercício carregados:', data.name);

      // Se for clonagem, limpar campos únicos e modificar nome
      const exerciseData = isClone
        ? {
          ...data,
          name: `${data.name} (Cópia)`,
          video_url: '', // Limpar mídia na clonagem
          audio_url: ''  // Limpar mídia na clonagem
        }
        : data;

      setFormData({
        name: exerciseData.name || '',
        description: exerciseData.description || '',
        muscle_group: exerciseData.muscle_group || [],
        equipment: exerciseData.equipment || [],
        variations: exerciseData.variations?.join('\n') || '',
        video_url: exerciseData.video_url || '',
        audio_url: exerciseData.audio_url || '',
        tips: exerciseData.tips?.join('\n') || '',
        common_errors: exerciseData.common_errors?.join('\n') || '',
      });

      // Só definir URLs de mídia se não for clonagem
      if (!isClone) {
        if (exerciseData.video_url) setVideoUrl(exerciseData.video_url);
        if (exerciseData.audio_url) setAudioUrl(exerciseData.audio_url);
      } else {
        // Limpar URLs de mídia na clonagem
        setVideoUrl('');
        setAudioUrl('');
      }

      if (isClone) {
        toast({
          title: "Exercício clonado! 📋",
          description: `"${data.name}" foi carregado para clonagem. Ajuste conforme necessário.`,
        });
      }

    } catch (error: any) {
      console.error('❌ Erro ao carregar exercício:', error);

      const errorMessage = isClone
        ? "Erro ao clonar exercício"
        : "Erro ao carregar exercício";

      toast({
        variant: "destructive",
        title: errorMessage,
        description: error.message,
      });

      // Se for clonagem e falhou, redirecionar para criação normal
      if (isClone) {
        console.log('🔄 Redirecionando para criação normal...');
        router.replace('/dashboard/exercises/new');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormField = (field: keyof ExerciseFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const currentStepData = EXERCISE_STEPS.find(step => step.id === activeStep);
  const progressPercentage = ((EXERCISE_STEPS.findIndex(s => s.id === activeStep) + 1) / EXERCISE_STEPS.length) * 100;

  const canAdvanceStep = (): boolean => {
    switch (activeStep) {
      case 'basic':
        // Campos obrigatórios: nome, descrição, pelo menos 1 grupo muscular e 1 equipamento
        return Boolean(
          formData.name.trim() &&
          formData.description.trim() &&
          formData.muscle_group.length > 0 &&
          formData.equipment.length > 0
        );
      case 'details':
        return true; // Details são opcionais, mas recomendados
      case 'media':
        return true; // Media is optional
      default:
        return true;
    }
  };

  const handleNext = () => {
    const currentIndex = EXERCISE_STEPS.findIndex(s => s.id === activeStep);
    if (currentIndex < EXERCISE_STEPS.length - 1 && canAdvanceStep()) {
      setActiveStep(EXERCISE_STEPS[currentIndex + 1].id);
      // Scroll para o topo no mobile
      setTimeout(scrollToTop, 100);
    }
  };

  const handleBack = () => {
    const currentIndex = EXERCISE_STEPS.findIndex(s => s.id === activeStep);
    if (currentIndex > 0) {
      setActiveStep(EXERCISE_STEPS[currentIndex - 1].id);
      // Scroll para o topo no mobile
      setTimeout(scrollToTop, 100);
    }
  };

  const handleStepChange = (stepId: string) => {
    setActiveStep(stepId);
    // Scroll para o topo no mobile
    setTimeout(scrollToTop, 100);
  };

  const getNextStepTitle = () => {
    const currentIndex = EXERCISE_STEPS.findIndex(s => s.id === activeStep);
    const nextStep = EXERCISE_STEPS[currentIndex + 1];
    return nextStep?.shortTitle || 'Próximo';
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      const exerciseData = {
        ...formData,
        variations: formData.variations.split('\n').filter(v => v.trim()),
        video_url: videoUrl || formData.video_url,
        audio_url: audioUrl || formData.audio_url,
        tips: formData.tips.split('\n').filter(t => t.trim()),
        common_errors: formData.common_errors.split('\n').filter(e => e.trim()),
      };

      console.log('💾 Salvando exercício:', {
        mode,
        isCloning,
        name: exerciseData.name
      });

      const response = await fetch(
        mode === 'edit' ? `/api/exercises/${exerciseId}` : '/api/exercises',
        {
          method: mode === 'edit' ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(exerciseData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      // Mensagem de sucesso personalizada
      let successTitle = "Exercício criado com sucesso! 🎉";
      let successDescription = "O exercício foi adicionado à biblioteca";

      if (mode === 'edit') {
        successTitle = "Exercício atualizado com sucesso! 🎉";
        successDescription = "As alterações foram salvas";
      } else if (isCloning) {
        successTitle = "Exercício clonado com sucesso! 🎉";
        successDescription = "Uma cópia do exercício foi criada";
      }

      toast({
        title: successTitle,
        description: successDescription,
      });

      router.push('/dashboard/exercises');

    } catch (error: any) {
      console.error('❌ Erro ao salvar exercício:', error);

      toast({
        variant: "destructive",
        title: "Erro ao salvar exercício",
        description: error.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const renderCurrentStep = () => {
    switch (activeStep) {
      case 'basic':
        return (
          <StepBasicInfo
            formData={formData}
            onUpdateField={updateFormField as (field: string, value: any) => void}
            isLoading={isLoading}
          />
        );
      case 'details':
        return (
          <StepDetails
            formData={formData}
            onUpdateField={updateFormField as (field: string, value: any) => void}
          />
        );
      case 'media':
        return (
          <StepMedia
            formData={formData}
            onUpdateField={updateFormField as (field: string, value: any) => void}
            videoFile={videoFile}
            audioFile={audioFile}
            videoUrl={videoUrl}
            audioUrl={audioUrl}
            onVideoFileChange={setVideoFile}
            onAudioFileChange={setAudioFile}
            onVideoUrlChange={setVideoUrl}
            onAudioUrlChange={setAudioUrl}
          />
        );
      case 'review':
        return (
          <StepReview
            formData={formData}
            videoUrl={videoUrl}
            audioUrl={audioUrl}
            onSave={handleSave}
            isSaving={isSaving}
          />
        );
      default:
        return null;
    }
  };

  const shouldShowNextButton = activeStep !== 'review';
  const shouldShowBackButton = activeStep !== 'basic';

  // Determinar título do header baseado no modo
  const getHeaderMode = () => {
    if (mode === 'edit') return 'edit';
    if (isCloning) return 'clone';
    return 'create';
  };

  return (
    <div className="min-h-screen bg-app-gradient">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-5xl">

        {/* Header */}
        <ExerciseHeader
          mode={getHeaderMode()}
          currentStepData={currentStepData}
          progressPercentage={progressPercentage}
          isCloning={!!isCloning}
          originalName={isCloning && effectiveCloneId ? formData.name?.replace(' (Cópia)', '') : undefined}
        />

        {/* Step Navigation */}
        <StepNavigation
          steps={EXERCISE_STEPS}
          activeStep={activeStep}
          onStepChange={handleStepChange}
          canAdvance={canAdvanceStep}
        />

        {/* Step Content */}
        <div className="relative mb-6 sm:mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-app-text-accent/10 via-app-btn-primary/10 to-app-text-accent/10 rounded-2xl blur-xl"></div>
          <div className="relative bg-app-card border border-app-border-muted rounded-2xl shadow-app-xl">
            <div className="p-4 sm:p-6 lg:p-8">
              {renderCurrentStep()}
            </div>
          </div>
        </div>

        {/* Clone Info Banner */}
        {isCloning && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200/50 dark:border-blue-700/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">📋</span>
              </div>
              <div>
                <h4 className="text-blue-800 dark:text-blue-300 font-semibold">
                  Clonando Exercício
                </h4>
                <p className="text-blue-700 dark:text-blue-400 text-sm">
                  Este exercício está sendo criado a partir de uma cópia. As mídias foram removidas e você pode ajustar os dados conforme necessário.
                </p>
              </div>
            </div>
          </div>
        )}

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

                {shouldShowNextButton && (
                  <button
                    onClick={handleNext}
                    disabled={!canAdvanceStep()}
                    className={`h-12 font-bold rounded-xl shadow-app-large transition-all duration-300 border-0 ${canAdvanceStep()
                      ? `btn-gradient-primary hover:shadow-app-xl text-white transform hover:scale-[1.02]`
                      : 'bg-app-bg-secondary text-app-text-muted cursor-not-allowed'
                      }`}
                  >
                    {activeStep === 'media' ? 'Revisar' : `Próximo: ${getNextStepTitle()}`}
                    <span className="ml-2">→</span>
                  </button>
                )}
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
                    {activeStep === 'media' ? 'Revisar Exercício' : `Próximo: ${getNextStepTitle()}`}
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