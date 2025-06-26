'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { WebhookHeader } from './WebhookHeader';
import { StepNavigation } from './StepNavigation';
import { StepBasicInfo } from './steps/StepBasicInfo';
import { StepEvents } from './steps/StepEvents';
import { StepConfig } from './steps/StepConfig';
import { StepReview } from './steps/StepReview';
import { useToast } from '@/hooks/use-toast';
import { WEBHOOK_STEPS } from './constants/webhook';

interface WebhookFormData {
  name: string;
  url: string;
  description?: string;
  events: string[];
  retry_attempts: number;
  timeout_seconds: number;
  headers: string;
}

interface WebhookFormCarouselProps {
  mode?: 'create' | 'edit';
  webhookId?: string;
}

export function WebhookFormCarousel({ mode = 'create', webhookId }: WebhookFormCarouselProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [activeStep, setActiveStep] = useState('basic');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<WebhookFormData>({
    name: '',
    url: '',
    description: '',
    events: [],
    retry_attempts: 3,
    timeout_seconds: 30,
    headers: '{}',
  });

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

  // Fetch webhook data for edit mode
  useEffect(() => {
    if (mode === 'edit' && webhookId) {
      fetchWebhookData(webhookId);
    }
  }, [mode, webhookId]);

  const fetchWebhookData = async (id: string) => {
    try {
      setIsLoading(true);
      console.log('🔄 Carregando webhook:', id);

      const response = await fetch(`/api/webhook/${id}`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      console.log('📄 Dados do webhook carregados:', data.name);

      setFormData({
        name: data.name || '',
        url: data.url || '',
        description: data.description || '',
        events: data.events || [],
        retry_attempts: data.retry_attempts || 3,
        timeout_seconds: data.timeout_seconds || 30,
        headers: JSON.stringify(data.headers || {}, null, 2),
      });

    } catch (error: any) {
      console.error('❌ Erro ao carregar webhook:', error);

      toast({
        variant: "destructive",
        title: "Erro ao carregar webhook",
        description: error.message,
      });

      router.push('/webhooks');
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormField = (field: keyof WebhookFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const currentStepData = WEBHOOK_STEPS.find(step => step.id === activeStep);
  const progressPercentage = ((WEBHOOK_STEPS.findIndex(s => s.id === activeStep) + 1) / WEBHOOK_STEPS.length) * 100;

  const canAdvanceStep = (): boolean => {
    switch (activeStep) {
      case 'basic':
        // Campos obrigatórios: nome e URL válida
        return Boolean(
          formData.name.trim() &&
          formData.url.trim() &&
          formData.url.startsWith('http')
        );
      case 'events':
        // Pelo menos um evento deve ser selecionado
        return formData.events.length > 0;
      case 'config':
        // Validar se headers é JSON válido se preenchido
        if (formData.headers.trim()) {
          try {
            JSON.parse(formData.headers);
            return true;
          } catch {
            return false;
          }
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    const currentIndex = WEBHOOK_STEPS.findIndex(s => s.id === activeStep);
    if (currentIndex < WEBHOOK_STEPS.length - 1 && canAdvanceStep()) {
      setActiveStep(WEBHOOK_STEPS[currentIndex + 1].id);
      // Scroll para o topo no mobile
      setTimeout(scrollToTop, 100);
    }
  };

  const handleBack = () => {
    const currentIndex = WEBHOOK_STEPS.findIndex(s => s.id === activeStep);
    if (currentIndex > 0) {
      setActiveStep(WEBHOOK_STEPS[currentIndex - 1].id);
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
    const currentIndex = WEBHOOK_STEPS.findIndex(s => s.id === activeStep);
    const nextStep = WEBHOOK_STEPS[currentIndex + 1];
    return nextStep?.shortTitle || 'Próximo';
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      // Preparar dados do webhook
      let parsedHeaders = {};
      try {
        parsedHeaders = formData.headers.trim() ? JSON.parse(formData.headers) : {};
      } catch (error) {
        throw new Error('Headers deve ser um JSON válido');
      }

      const webhookData = {
        name: formData.name.trim(),
        url: formData.url.trim(),
        description: formData.description?.trim() || '',
        events: formData.events,
        retry_attempts: formData.retry_attempts,
        timeout_seconds: formData.timeout_seconds,
        headers: parsedHeaders,
      };

      console.log('💾 Salvando webhook:', {
        mode,
        name: webhookData.name,
        events: webhookData.events.length
      });

      const response = await fetch(
        mode === 'edit' ? `/api/webhook/${webhookId}` : '/api/webhook',
        {
          method: mode === 'edit' ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webhookData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      // Mensagem de sucesso personalizada
      const successTitle = mode === 'edit' 
        ? "Webhook atualizado com sucesso! 🎉"
        : "Webhook criado com sucesso! 🎉";
      const successDescription = mode === 'edit'
        ? "As configurações foram salvas"
        : "Sua integração está pronta para receber eventos";

      toast({
        title: successTitle,
        description: successDescription,
      });

      router.push('/webhooks');

    } catch (error: any) {
      console.error('❌ Erro ao salvar webhook:', error);

      toast({
        variant: "destructive",
        title: "Erro ao salvar webhook",
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
      case 'events':
        return (
          <StepEvents
            formData={formData}
            onUpdateField={updateFormField as (field: string, value: any) => void}
          />
        );
      case 'config':
        return (
          <StepConfig
            formData={formData} 
            onUpdateField={updateFormField as (field: string, value: any) => void}
          />
        );
      case 'review':
        return (
          <StepReview
            formData={formData}
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
    <div className="min-h-screen bg-app-gradient">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-5xl">

        {/* Header */}
        <WebhookHeader
          mode={mode}
          currentStepData={currentStepData}
          progressPercentage={progressPercentage}
          webhookName={mode === 'edit' ? formData.name : undefined}
        />

        {/* Step Navigation */}
        <StepNavigation
          steps={WEBHOOK_STEPS}
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

        {/* Validation Info Banner */}
        {!canAdvanceStep() && activeStep !== 'review' && (
          <div className="mb-6 p-4 bg-gradient-to-r from-orange-50/50 to-yellow-50/50 dark:from-orange-900/10 dark:to-yellow-900/10 rounded-xl border border-orange-200/50 dark:border-orange-700/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">!</span>
              </div>
              <div>
                <h4 className="text-orange-800 dark:text-orange-300 font-semibold">
                  Campos Obrigatórios
                </h4>
                <p className="text-orange-700 dark:text-orange-400 text-sm">
                  {activeStep === 'basic' && 'Preencha o nome e uma URL válida para continuar'}
                  {activeStep === 'events' && 'Selecione pelo menos um evento para monitorar'}
                  {activeStep === 'config' && 'Verifique se os headers estão em formato JSON válido'}
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
                    {activeStep === 'config' ? 'Revisar' : `Próximo: ${getNextStepTitle()}`}
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
                    {activeStep === 'config' ? 'Revisar Webhook' : `Próximo: ${getNextStepTitle()}`}
                    <span className="ml-2">→</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 text-center">
          <p className="text-sm text-app-text-secondary mb-2">
            Precisa de ajuda? Confira nossa documentação
          </p>
          <div className="flex justify-center gap-4">
            <button className="text-sm text-app-text-accent hover:text-app-text-accent/80 font-medium transition-colors duration-200">
              📚 Guia de Webhooks
            </button>
            <button className="text-sm text-app-text-accent hover:text-app-text-accent/80 font-medium transition-colors duration-200">
              🔧 Exemplos de Código
            </button>
            <button className="text-sm text-app-text-accent hover:text-app-text-accent/80 font-medium transition-colors duration-200">
              💬 Suporte
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}