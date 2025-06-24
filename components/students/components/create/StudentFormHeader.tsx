// /components/students/form/StudentFormHeader.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Plus, Edit, Users, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface StudentFormHeaderProps {
  mode: 'create' | 'edit';
  currentStepData?: {
    id: number;
    title: string;
    description: string;
    color: string;
  };
  progressPercentage: number;
}

export function StudentFormHeader({
  mode,
  currentStepData,
  progressPercentage
}: StudentFormHeaderProps) {
  const router = useRouter();

  const getHeaderInfo = () => {
    switch (mode) {
      case 'edit':
        return {
          title: 'Editar Aluno',
          subtitle: 'Modifique as informações do aluno',
          icon: Edit,
          color: 'achievement-consecutive'
        };
      default:
        return {
          title: 'Novo Aluno',
          subtitle: 'Adicione um novo aluno à sua academia',
          icon: Users,
          color: 'achievement-workout'
        };
    }
  };

  const headerInfo = getHeaderInfo();
  const HeaderIcon = headerInfo.icon;

  return (
    <div className="relative mb-6 sm:mb-8">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-app-text-accent/10 via-app-achievement-workout/10 to-app-achievement-consecutive/10 rounded-2xl sm:rounded-3xl blur-xl"></div>

      <div className="relative bg-app-overlay backdrop-blur-xl border border-app-border-accent/30 rounded-2xl sm:rounded-3xl overflow-hidden shadow-app-xl">

        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-achievement-workout rounded-full transform translate-x-8 sm:translate-x-12 -translate-y-8 sm:-translate-y-12"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-20 sm:h-20 bg-achievement-consecutive rounded-full transform -translate-x-4 sm:-translate-x-6 translate-y-4 sm:translate-y-6"></div>
        </div>

        <div className="relative p-4 sm:p-6 lg:p-8">

          {/* Mobile Layout */}
          <div className="block sm:hidden">
            {/* Header Row */}
            <div className="flex items-center justify-between gap-3 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/dashboard/students')}
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
              <div className={`p-3 bg-${headerInfo.color} rounded-xl shadow-app-medium`}>
                <HeaderIcon className="h-5 w-5 text-white" />
              </div>
            </div>

            {/* Progress Bar Mobile */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-app-text-primary">
                  Progresso
                </span>
                <span className="text-sm text-app-text-secondary">
                  {Math.round(progressPercentage)}%
                </span>
              </div>
              <div className="w-full bg-app-bg-secondary rounded-full h-2">
                <div 
                  className="h-2 bg-gradient-to-r from-app-achievement-workout to-app-achievement-consecutive rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>

            {/* Current Step Info Mobile */}
            {currentStepData && (
              <div className="p-3 bg-app-bg-secondary/50 rounded-xl border border-app-border-muted">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 bg-${currentStepData.color} rounded-lg flex items-center justify-center`}>
                    <span className="text-xs font-bold text-white">
                      {currentStepData.id}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-app-text-primary truncate">
                      {currentStepData.title}
                    </div>
                    <div className="text-xs text-app-text-secondary truncate">
                      {currentStepData.description}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Layout */}
          <div className="hidden sm:block">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">

              {/* Header Info */}
              <div className="flex items-center gap-4">
                <div className={`p-4 bg-${headerInfo.color} rounded-2xl shadow-app-large`}>
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
                onClick={() => router.push('/dashboard/students')}
                className="bg-app-card border-2 border-app-border-muted hover:border-app-border-accent rounded-xl h-12 px-6 font-semibold transition-all duration-300 hover:scale-105"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Voltar
              </Button>
            </div>

            {/* Progress Section Desktop */}
            <div className="space-y-4">
              {/* Progress Bar */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-app-text-primary">
                    Progresso do Cadastro
                  </span>
                  <span className="text-sm font-bold text-app-text-accent">
                    {Math.round(progressPercentage)}%
                  </span>
                </div>
                <div className="w-full bg-app-bg-secondary rounded-full h-3 shadow-inner">
                  <div 
                    className="h-3 bg-gradient-to-r from-app-achievement-workout to-app-achievement-consecutive rounded-full transition-all duration-500 shadow-app-medium"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Current Step Info Desktop */}
              {currentStepData && (
                <div className="p-4 bg-app-bg-secondary/30 border border-app-border-accent/50 rounded-xl backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 bg-${currentStepData.color} rounded-xl flex items-center justify-center shadow-app-medium`}>
                      <span className="text-sm font-bold text-white">
                        {currentStepData.id}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-bold text-app-text-primary">
                        {currentStepData.title}
                      </div>
                      <div className="text-sm text-app-text-secondary">
                        {currentStepData.description}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-app-text-accent">
                      <Sparkles className="h-4 w-4" />
                      <span className="text-sm font-semibold">
                        Etapa {currentStepData.id} de 3
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>           
          </div>
        </div>

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-app-text-accent/30 to-transparent"></div>
      </div>
    </div>
  );
}