import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, CalendarCheck, Sparkles } from 'lucide-react';

interface WorkoutPlanFormHeaderProps {
  mode: 'create' | 'edit';
  currentStepData?: {
    id: string;
    title: string;
    description: string;
    icon: string;
    color: string;
    shortTitle: string;
  };
  progressPercentage: number;
}

export function WorkoutPlanFormHeader({
  mode,
  currentStepData,
  progressPercentage
}: WorkoutPlanFormHeaderProps) {
  const router = useRouter();

  return (
    <div className="relative mb-8">
      <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-workout/10 via-app-achievement-consecutive/10 to-app-achievement-workout/10 rounded-3xl blur-xl"></div>
      <div className="relative bg-app-overlay backdrop-blur-xl border border-app-border-accent/30 rounded-3xl p-6 lg:p-8 shadow-app-xl">
        
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
                <CalendarCheck className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-app-achievement-consecutive rounded-full flex items-center justify-center">
                <Sparkles className="h-3 w-3 text-white" />
              </div>
            </div>
            
            <div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-app-heading">
                {mode === 'edit' ? 'Editar Plano de Treino' : 'Novo Plano de Treino'}
              </h1>
              <p className="text-sm sm:text-base text-app-text-secondary mt-1">
                {currentStepData?.description || 'Crie planos personalizados para seus alunos'}
              </p>
            </div>
          </div>
        </div>        
      </div>
    </div>
  );
}