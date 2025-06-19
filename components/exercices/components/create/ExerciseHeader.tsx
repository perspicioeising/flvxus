// components/exercises/ExerciseHeader.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Plus, Edit, Copy } from 'lucide-react';
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
          color: 'from-blue-600 to-blue-700'
        };
      case 'clone':
        return {
          title: 'Clonar Exercício',
          subtitle: originalName ? `Criando cópia de "${originalName}"` : 'Criando cópia do exercício',
          icon: Copy,
          color: 'from-indigo-600 to-purple-600'
        };
      default:
        return {
          title: 'Novo Exercício',
          subtitle: 'Adicione um novo exercício à sua biblioteca',
          icon: Plus,
          color: 'from-green-600 to-emerald-600'
        };
    }
  };

  const headerInfo = getHeaderInfo();
  const HeaderIcon = headerInfo.icon;

  return (
    <div className="relative mb-8">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-purple-500/10 to-purple-600/10 rounded-3xl blur-xl"></div>
      
      <div className="relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-0 rounded-3xl shadow-2xl">
        <div className="p-6 lg:p-8">
          
          {/* Top Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">
            
            {/* Header Info */}
            <div className="flex items-center gap-4">
              <div className={`p-4 bg-gradient-to-br ${headerInfo.color} rounded-2xl shadow-lg`}>
                <HeaderIcon className="h-8 w-8 text-white" />
              </div>
              
              <div>
                <h1 className="text-3xl lg:text-4xl font-black bg-gradient-to-r from-gray-900 via-purple-600 to-gray-900 dark:from-white dark:via-purple-400 dark:to-white bg-clip-text text-transparent">
                  {headerInfo.title}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {headerInfo.subtitle}
                </p>
              </div>
            </div>

            {/* Back Button */}
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/exercises')}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 rounded-xl h-12 px-6 font-semibold transition-all duration-300 hover:scale-105"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Voltar
            </Button>
          </div>

          {/* Clone Banner */}
          {isCloning && (
            <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-200/50 dark:border-indigo-700/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                  <Copy className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="text-indigo-800 dark:text-indigo-300 font-semibold">
                    Modo Clonagem Ativo
                  </h4>
                  <p className="text-indigo-700 dark:text-indigo-400 text-sm">
                    {originalName 
                      ? `Todos os dados de "${originalName}" foram copiados. As mídias foram removidas para evitar duplicação.`
                      : 'Os dados do exercício original foram copiados. Ajuste conforme necessário.'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Progress Section */}
          {currentStepData && (
            <div className="space-y-4">
              
              {/* Step Info */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {currentStepData.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {currentStepData.description}
                  </p>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-black text-gray-900 dark:text-white">
                    {Math.round(progressPercentage)}%
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Progresso
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-purple-500/20 rounded-full blur"></div>
                <Progress 
                  value={progressPercentage} 
                  className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
                />
              </div>

              {/* Step Indicator */}
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <span>Etapa atual:</span>
                <span className="font-semibold text-purple-600 dark:text-purple-400">
                  {currentStepData.title}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}