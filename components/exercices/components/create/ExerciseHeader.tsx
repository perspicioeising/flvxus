// components/exercises/ExerciseHeader.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Plus, Edit, Copy, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ExerciseHeaderProps {
  mode: 'create' | 'edit' | 'clone';
  currentStepData?: {
    id: string;
    title: string;
    description: string;
    color: string;
  };
  progressPercentage: number;
  isCloning?: boolean;
  originalName?: string;
}

export function ExerciseHeader({ 
  mode, 
  currentStepData, 
  progressPercentage, 
  isCloning = false,
  originalName 
}: ExerciseHeaderProps) {
  const router = useRouter();

  const getHeaderInfo = () => {
    switch (mode) {
      case 'edit':
        return {
          title: 'Editar Exercício',
          subtitle: 'Modifique as informações do exercício',
          icon: Edit,
          color: 'achievement-workout'
        };
      case 'clone':
        return {
          title: 'Clonar Exercício',
          subtitle: originalName ? `Criando cópia de "${originalName}"` : 'Criando cópia do exercício',
          icon: Copy,
          color: 'achievement-weight'
        };
      default:
        return {
          title: 'Novo Exercício',
          subtitle: 'Adicione um novo exercício à sua biblioteca',
          icon: Plus,
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
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className={`p-3 ${headerInfo.color} rounded-xl shadow-app-medium`}>
                  <HeaderIcon className="h-5 w-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg font-black text-app-heading truncate">
                    {headerInfo.title}
                  </h1>
                  <p className="text-xs text-app-text-secondary truncate">
                    {headerInfo.subtitle}
                  </p>
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/dashboard/exercises')}
                className="h-10 w-10 p-0 bg-app-card border-app-border-muted hover:border-app-border-accent rounded-xl shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </div>

            {/* Progress Section */}
            {currentStepData && (
              <>
                <div className="flex items-center justify-between mb-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-app-text-primary truncate">
                      {currentStepData.title}
                    </h3>
                    <p className="text-xs text-app-text-secondary truncate">
                      {currentStepData.description}
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <div className="text-lg font-black text-app-text-primary">
                      {Math.round(progressPercentage)}%
                    </div>
                    <div className="text-xs text-app-text-muted">
                      Progresso
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="relative mb-3">
                  <div className="absolute inset-0 bg-gradient-to-r from-app-text-accent/20 to-app-btn-primary/20 rounded-full blur"></div>
                  <Progress 
                    value={progressPercentage} 
                    className="relative h-2 bg-app-bg-secondary rounded-full overflow-hidden"
                  />
                </div>
              </>
            )}
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
                onClick={() => router.push('/dashboard/exercises')}
                className="bg-app-card border-2 border-app-border-muted hover:border-app-border-accent rounded-xl h-12 px-6 font-semibold transition-all duration-300 hover:scale-105"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Voltar
              </Button>
            </div>

            {/* Progress Section */}
            {currentStepData && (
              <div className="space-y-4">
                
                {/* Step Info */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-app-text-primary">
                      {currentStepData.title}
                    </h3>
                    <p className="text-sm text-app-text-secondary">
                      {currentStepData.description}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-black text-app-text-primary">
                      {Math.round(progressPercentage)}%
                    </div>
                    <div className="text-xs text-app-text-muted">
                      Progresso
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-app-text-accent/20 to-app-btn-primary/20 rounded-full blur"></div>
                  <Progress 
                    value={progressPercentage} 
                    className="relative h-3 bg-app-bg-secondary rounded-full overflow-hidden"
                  />
                </div>

                {/* Step Indicator */}
                <div className="flex items-center justify-center gap-2 text-sm text-app-text-muted">
                  <span>Etapa atual:</span>
                  <span className="font-semibold text-app-text-accent">
                    {currentStepData.title}
                  </span>
                  <Sparkles className="h-4 w-4 text-app-text-accent" />
                </div>
              </div>
            )}
          </div>

          {/* Clone Info Banner - Mobile Optimized */}
          {isCloning && (
            <div className="mt-4 p-3 sm:p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-200/50 dark:border-indigo-700/50">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-indigo-600 rounded-full flex items-center justify-center shrink-0">
                  <Copy className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-indigo-800 dark:text-indigo-300 font-semibold text-sm sm:text-base">
                    Modo Clonagem Ativo
                  </h4>
                  <p className="text-indigo-700 dark:text-indigo-400 text-xs sm:text-sm mt-1">
                    {originalName 
                      ? `Todos os dados de "${originalName}" foram copiados. As mídias foram removidas para evitar duplicação.`
                      : 'Os dados do exercício original foram copiados. Ajuste conforme necessário.'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-app-text-accent/30 to-transparent"></div>
      </div>
    </div>
  );
}