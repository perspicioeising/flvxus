// components/diets/create/DietFormHeader.tsx
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ChefHat, Sparkles } from 'lucide-react';
import type { DietStepData } from '../types';

interface DietFormHeaderProps {
  mode: 'create' | 'edit';
  currentStepData?: DietStepData;
  progressPercentage: number;
}

export function DietFormHeader({
  mode,
  currentStepData,
  progressPercentage
}: DietFormHeaderProps) {
  const router = useRouter();

  return (
    <div className="relative mb-8">
      <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 via-green-500/20 to-green-600/20 dark:from-green-500/10 dark:via-green-400/10 dark:to-green-500/10 rounded-3xl blur-xl"></div>
      <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-green-200/50 dark:border-green-800/30 rounded-3xl p-6 lg:p-8 shadow-2xl">
        
        {/* Back Button + Title */}
        <div className="flex flex-col items-center text-center gap-4 mb-6">
          <div className="flex items-center justify-between w-full">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.back()}
              className="h-12 w-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-green-200 dark:border-green-700 hover:border-green-300 dark:hover:border-green-600 rounded-xl shadow-lg transition-all duration-300 hover:scale-105"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            {/* Spacer para manter o botão alinhado à esquerda */}
            <div className="w-12"></div>
          </div>
          
          <div className="flex flex-col items-center text-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                <ChefHat className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Sparkles className="h-3 w-3 text-white" />
              </div>
            </div>
            
            <div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-200 dark:to-white bg-clip-text text-transparent">
                {mode === 'edit' ? 'Editar Dieta' : 'Nova Dieta Personalizada'}
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-1">
                {currentStepData?.description || 'Sistema inteligente de nutrição com IA'}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Progresso
            </span>
            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-600 text-sm font-semibold">
              {Math.round(progressPercentage)}% concluído
            </Badge>
          </div>
          
          <div className="relative">
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}