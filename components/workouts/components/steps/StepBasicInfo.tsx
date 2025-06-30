// components/workouts/steps/StepBasicInfo.tsx
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Info, Activity } from 'lucide-react';
import { StepBasicInfoProps } from '../../types';

export function StepBasicInfo({ formData, onUpdateField, errors }: StepBasicInfoProps) {
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-achievement-workout rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-app-large">
          <Info className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-app-text-heading mb-2">
          Informações Básicas
        </h2>
        <p className="text-app-text-secondary">
          Defina o nome e descrição do seu treino
        </p>
      </div>

      <div className="space-y-6">
        {/* Nome do Treino */}
        <div className="space-y-3">
          <Label className="text-base font-semibold flex items-center gap-2">
            <Activity className="h-4 w-4 text-app-achievement-workout" />
            Nome do Treino
          </Label>
          <Input
            placeholder="ex: Treino de Força - Iniciante"
            value={formData.name}
            onChange={(e) => onUpdateField('name', e.target.value)}
            className={`h-14 text-lg bg-app-card border-0 rounded-xl shadow-app-medium backdrop-blur-sm focus:bg-app-card focus:shadow-app-large focus:border-app-achievement-workout transition-all duration-300 ${
              errors.name ? 'ring-2 ring-red-500' : ''
            }`}
          />
          {errors.name && (
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">!</span>
              {errors.name}
            </p>
          )}
        </div>

        {/* Descrição */}
        <div className="space-y-3">
          <Label className="text-base font-semibold flex items-center gap-2">
            <Info className="h-4 w-4 text-app-achievement-consecutive" />
            Descrição (Opcional)
          </Label>
          <Textarea
            placeholder="Descreva os objetivos e características deste treino..."
            value={formData.description}
            onChange={(e) => onUpdateField('description', e.target.value)}
            className={`min-h-[120px] text-base bg-app-card border-0 rounded-xl shadow-app-medium backdrop-blur-sm focus:bg-app-card focus:shadow-app-large focus:border-app-achievement-workout transition-all duration-300 resize-none ${
              errors.description ? 'ring-2 ring-red-500' : ''
            }`}
          />
          {errors.description && (
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">!</span>
              {errors.description}
            </p>
          )}
          <div className="flex justify-between text-xs text-app-text-muted">
            <span>Máximo 500 caracteres</span>
            <span>{formData.description.length}/500</span>
          </div>
        </div>

        {/* Preview Card */}
        {formData.name && (
          <div className="relative mt-8">
            <div className="absolute inset-0 bg-gradient-to-r from-app-bg-secondary/50 to-app-bg-secondary/50 rounded-2xl blur-xl"></div>
            <div className="relative p-6 bg-gradient-to-r from-app-bg-secondary/20 to-app-bg-secondary/20 rounded-2xl border border-app-border-accent">
              <h4 className="text-sm font-bold text-app-achievement-workout uppercase tracking-wider mb-4 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Preview do Treino
              </h4>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-achievement-workout rounded-xl flex items-center justify-center shadow-app-medium">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-app-text-primary">
                    {formData.name}
                  </h3>
                  {formData.description && (
                    <p className="text-sm text-app-text-secondary mt-2 leading-relaxed">
                      {formData.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}