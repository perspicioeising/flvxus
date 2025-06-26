'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Edit, Webhook, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { WEBHOOK_STEPS } from './constants/webhook';

interface WebhookHeaderProps {
  mode: 'create' | 'edit';
  currentStepData?: {
    id: string;
    title: string;
    description: string;
    color: string;
  };
  progressPercentage: number;
  webhookName?: string;
}

export function WebhookHeader({
  mode,
  currentStepData,
  progressPercentage,
  webhookName
}: WebhookHeaderProps) {
  const router = useRouter();

  const getHeaderInfo = () => {
    switch (mode) {
      case 'edit':
        return {
          title: 'Editar Webhook',
          subtitle: webhookName ? `Modificando "${webhookName}"` : 'Modifique as configurações do webhook',
          icon: Edit,
          color: 'achievement-workout'
        };
      default:
        return {
          title: 'Novo Webhook',
          subtitle: 'Configure uma nova integração com sistemas externos',
          icon: Webhook,
          color: 'achievement-exercise'
        };
    }
  };

  const headerInfo = getHeaderInfo();
  const HeaderIcon = headerInfo.icon;

  return (
    <div className="relative mb-6 sm:mb-8">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-app-text-accent/10 via-app-btn-primary/10 to-app-text-accent/10 rounded-2xl sm:rounded-3xl blur-xl"></div>

      <div className="relative bg-app-overlay backdrop-blur-xl border border-app-border-accent/30 rounded-2xl sm:rounded-3xl overflow-hidden shadow-app-xl">

        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-achievement-consecutive rounded-full transform translate-x-8 sm:translate-x-12 -translate-y-8 sm:-translate-y-12"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-20 sm:h-20 bg-achievement-exercise rounded-full transform -translate-x-4 sm:-translate-x-6 translate-y-4 sm:translate-y-6"></div>
        </div>

        <div className="relative p-4 sm:p-6 lg:p-8">

          {/* Mobile Layout */}
          <div className="block sm:hidden">
            {/* Header Row */}
            <div className="flex items-center justify-between gap-3 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/webhooks')}
                className="h-10 w-10 p-0 bg-app-card border-app-border-muted hover:border-app-border-accent rounded-xl shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg font-black text-app-heading truncate">
                    {headerInfo.title}
                  </h1>
                  <p className="text-xs text-app-text-secondary truncate">
                    {headerInfo.subtitle}
                  </p>
                </div>
              </div>
              <div className={`p-3 ${headerInfo.color} rounded-xl shadow-app-medium`}>
                <HeaderIcon className="h-5 w-5 text-white" />
              </div>
            </div>           
          </div>

          {/* Desktop Layout */}
          <div className="hidden sm:block">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">

              {/* Header Info */}
              <div className="flex items-center gap-4">
                <div className={`p-4 ${headerInfo.color} rounded-2xl shadow-app-large`}>
                  <HeaderIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-black text-app-heading">
                    {headerInfo.title}
                  </h1>
                  <p className="text-app-text-secondary mt-1">
                    {headerInfo.subtitle}
                  </p>
                </div>
              </div>

              {/* Back Button */}
              <Button
                variant="outline"
                onClick={() => router.push('/webhooks')}
                className="bg-app-card border-2 border-app-border-muted hover:border-app-border-accent rounded-xl h-12 px-6 font-semibold transition-all duration-300 hover:scale-105"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Voltar
              </Button>
            </div>            
          </div>
        </div>

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-app-text-accent/30 to-transparent"></div>
      </div>
    </div>
  );
}