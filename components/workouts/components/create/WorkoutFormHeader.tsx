// components/workouts/components/WorkoutFormHeader.tsx
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Activity, Sparkles } from 'lucide-react';
import { WorkoutFormHeaderProps } from '../../types';

export function WorkoutFormHeader({
  mode,
  currentStepData,
  progressPercentage
}: WorkoutFormHeaderProps) {
  const router = useRouter();

  return (
    <div className="relative mb-6 sm:mb-8">
      <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-workout/10 via-app-achievement-workout/15 to-app-achievement-workout/10 rounded-2xl sm:rounded-3xl blur-xl"></div>
      <div className="relative bg-app-overlay backdrop-blur-xl border border-app-border-accent/30 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-app-xl">
        
        {/* Back Button + Title */}
        <div className="flex flex-col items-center text-center gap-4 mb-6">
          <div className="flex items-center justify-between w-full">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.back()}
              className="h-12 w-12 bg-app-card backdrop-blur-sm border-2 border-app-border-accent hover:border-app-achievement-workout rounded-xl shadow-app-medium transition-all duration-300 hover:scale-105"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            {/* Spacer para manter o botão alinhado à esquerda */}
            <div className="w-12"></div>
          </div>
          
          <div className="flex flex-col items-center text-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 bg-achievement-workout rounded-2xl flex items-center justify-center shadow-app-large">
                <Activity className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-app-achievement-consecutive to-app-achievement-consecutive rounded-full flex items-center justify-center">
                <Sparkles className="h-3 w-3 text-white" />
              </div>
            </div>
            
            <div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-black bg-gradient-to-r from-app-text-heading to-app-text-heading bg-clip-text text-transparent">
                {mode === 'edit' ? 'Editar Treino' : 'Novo Treino'}
              </h1>
              <p className="text-sm sm:text-base text-app-text-secondary mt-1">
                {currentStepData?.description || 'Crie treinos personalizados para seus alunos'}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-app-achievement-workout uppercase tracking-wider">
              Progresso
            </span>
            <Badge className="bg-app-achievement-workout/10 text-app-achievement-workout border-app-border-accent text-sm font-semibold">
              {Math.round(progressPercentage)}% concluído
            </Badge>
          </div>
          
          <div className="relative">
            <div className="h-2 bg-app-bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-achievement-workout rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}