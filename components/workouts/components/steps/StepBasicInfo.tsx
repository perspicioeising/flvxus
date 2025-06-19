// components/workouts/steps/StepBasicInfo.tsx
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Info, Dumbbell } from 'lucide-react';
import { StepBasicInfoProps } from '../../types';

export function StepBasicInfo({ formData, onUpdateField, errors }: StepBasicInfoProps) {
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Info className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Informações Básicas
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Defina o nome e descrição do seu treino
        </p>
      </div>

      <div className="space-y-6">
        {/* Nome do Treino */}
        <div className="space-y-3">
          <Label className="text-base font-semibold flex items-center gap-2">
            <Dumbbell className="h-4 w-4 text-red-600 dark:text-red-400" />
            Nome do Treino
          </Label>
          <Input
            placeholder="ex: Treino de Força - Iniciante"
            value={formData.name}
            onChange={(e) => onUpdateField('name', e.target.value)}
            className={`h-14 text-lg bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 transition-all duration-300 ${
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
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            Descrição (Opcional)
          </Label>
          <Textarea
            placeholder="Descreva os objetivos e características deste treino..."
            value={formData.description}
            onChange={(e) => onUpdateField('description', e.target.value)}
            className={`min-h-[120px] text-base bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 transition-all duration-300 resize-none ${
              errors.description ? 'ring-2 ring-red-500' : ''
            }`}
          />
          {errors.description && (
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">!</span>
              {errors.description}
            </p>
          )}
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Máximo 500 caracteres</span>
            <span>{formData.description.length}/500</span>
          </div>
        </div>

        {/* Preview Card */}
        {formData.name && (
          <div className="relative mt-8">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200/50 to-gray-300/50 dark:from-gray-700/50 dark:to-gray-600/50 rounded-2xl blur-xl"></div>
            <div className="relative p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 rounded-2xl">
              <h4 className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Dumbbell className="h-4 w-4" />
                Preview do Treino
              </h4>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Dumbbell className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {formData.name}
                  </h3>
                  {formData.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
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

