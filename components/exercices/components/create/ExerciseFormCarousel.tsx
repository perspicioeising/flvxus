// components/exercises/ExerciseFormCarousel.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  mode?: 'create' | 'edit';
  exerciseId?: string;
}

export function ExerciseFormCarousel({ mode = 'create', exerciseId }: ExerciseFormCarouselProps) {
  const router = useRouter();
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

  // Fetch exercise data for edit mode
  useEffect(() => {
    if (mode === 'edit' && exerciseId) {
      fetchExerciseData();
    }
  }, [mode, exerciseId]);

  const fetchExerciseData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/exercises/${exerciseId}`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      setFormData({
        name: data.name || '',
        description: data.description || '',
        muscle_group: data.muscle_group || [],
        equipment: data.equipment || [],
        variations: data.variations?.join('\n') || '',
        video_url: data.video_url || '',
        audio_url: data.audio_url || '',
        tips: data.tips?.join('\n') || '',
        common_errors: data.common_errors?.join('\n') || '',
      });

      if (data.video_url) setVideoUrl(data.video_url);
      if (data.audio_url) setAudioUrl(data.audio_url);

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar exercício",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormField = (field: keyof ExerciseFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const currentStepData = EXERCISE_STEPS.find((step: { id: string; }) => step.id === activeStep);
  const progressPercentage = ((EXERCISE_STEPS.findIndex((s: { id: string; }) => s.id === activeStep) + 1) / EXERCISE_STEPS.length) * 100;

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
      case 'media':
        return true; // Media is optional
      case 'details':
        // Campos obrigatórios: dicas e erros comuns
        return Boolean(
          formData.tips.trim() &&
          formData.common_errors.trim()
        );
      default:
        return true;
    }
  };

  const handleNext = () => {
    const currentIndex = EXERCISE_STEPS.findIndex((s: { id: string; }) => s.id === activeStep);
    if (currentIndex < EXERCISE_STEPS.length - 1 && canAdvanceStep()) {
      setActiveStep(EXERCISE_STEPS[currentIndex + 1].id);
    }
  };

  const handleBack = () => {
    const currentIndex = EXERCISE_STEPS.findIndex((s: { id: string; }) => s.id === activeStep);
    if (currentIndex > 0) {
      setActiveStep(EXERCISE_STEPS[currentIndex - 1].id);
    }
  };

  const getNextStepTitle = () => {
    const currentIndex = EXERCISE_STEPS.findIndex((s: { id: string; }) => s.id === activeStep);
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

      toast({
        title: mode === 'edit' ? "Exercício atualizado com sucesso! 🎉" : "Exercício criado com sucesso! 🎉",
        description: mode === 'edit' ? "As alterações foram salvas" : "O exercício foi adicionado à biblioteca",
      });

      router.push('/dashboard/exercises');

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao criar exercício",
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
      case 'details':
        return (
          <StepDetails
            formData={formData}
            onUpdateField={updateFormField as (field: string, value: any) => void}
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black">
      <div className="container mx-auto px-4 py-6 max-w-4xl">

        {/* Header */}
        <ExerciseHeader
          mode={mode}
          currentStepData={currentStepData}
          progressPercentage={progressPercentage}
        />

        {/* Step Navigation */}
        <StepNavigation
          steps={EXERCISE_STEPS}
          activeStep={activeStep}
          onStepChange={setActiveStep}
          canAdvance={canAdvanceStep}
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
                    disabled={!canAdvanceStep()}
                    className={`h-12 font-bold rounded-xl shadow-lg transition-all duration-300 border-0 ${canAdvanceStep()
                        ? `bg-gradient-to-r ${currentStepData?.color || 'from-green-500 to-emerald-600'} hover:shadow-green-500/25 text-white`
                        : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                      }`}
                  >
                    {activeStep === 'details' ? 'Revisar' : `Próximo: ${getNextStepTitle()}`}
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
                    className={`px-8 h-12 font-bold rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 border-0 ${canAdvanceStep()
                        ? `bg-gradient-to-r ${currentStepData?.color || 'from-green-500 to-emerald-600'} hover:shadow-green-500/25 text-white`
                        : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed transform-none'
                      }`}
                  >
                    {activeStep === 'details' ? 'Revisar Exercício' : `Próximo: ${getNextStepTitle()}`}
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