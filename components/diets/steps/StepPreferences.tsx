// components/diets/steps/StepPreferences.tsx
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Apple, Utensils, AlertTriangle, Edit3 } from 'lucide-react';
import { cn } from '@/lib/utils';

import { DIETARY_STYLES, FOOD_PREFERENCES, RESTRICTIONS } from '../constants';
import type { DietFormData } from '../types';

interface StepPreferencesProps {
  formData: DietFormData;
  onToggleDietaryStyle: (style: string) => void;
  onToggleFoodPreference: (preference: string) => void;
  onToggleRestriction: (restriction: string) => void;
  onUpdateField: <K extends keyof DietFormData>(field: K, value: DietFormData[K]) => void;
}

export function StepPreferences({
  formData,
  onToggleDietaryStyle,
  onToggleFoodPreference,
  onToggleRestriction,
  onUpdateField
}: StepPreferencesProps) {
  return (
    <div className="space-y-8">
      {/* Dietary Style */}
      <div className="space-y-4">
        <Label className="text-base font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
          <Utensils className="h-4 w-4 text-purple-600" />
          Estilo Alimentar Preferido
        </Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {DIETARY_STYLES.map((style) => {
            const Icon = style.icon;
            const isSelected = formData.dietary_style.includes(style.value);

            return (
              <div key={style.value} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <Card className={cn(
                  "relative border-0 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 rounded-xl overflow-hidden cursor-pointer",
                  isSelected
                    ? "bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-300 dark:border-purple-600"
                    : "bg-white/90 dark:bg-gray-900/90"
                )}
                onClick={() => onToggleDietaryStyle(style.value)}
                >
                  {!isSelected && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute inset-[1px] bg-white dark:bg-gray-900 rounded-xl"></div>
                    </>
                  )}

                  <CardContent className="relative p-3 sm:p-4 text-center">
                    <Icon className={cn(
                      "h-6 w-6 mx-auto mb-2",
                      isSelected ? "text-purple-600 dark:text-purple-400" : "text-gray-600 dark:text-gray-400"
                    )} />
                    <span className={cn(
                      "text-xs sm:text-sm font-medium",
                      isSelected ? "text-purple-800 dark:text-purple-300" : "text-gray-700 dark:text-gray-300"
                    )}>
                      {style.label}
                    </span>
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      {/* Food Preferences */}
      <div className="space-y-4">
        <Label className="text-base font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
          <Apple className="h-4 w-4 text-orange-600" />
          Preferências de Alimentos
        </Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {FOOD_PREFERENCES.map((pref) => {
            const isSelected = formData.food_preferences.includes(pref.value);

            return (
              <div key={pref.value} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 to-yellow-600/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <Card className={cn(
                  "relative border-0 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 rounded-xl overflow-hidden cursor-pointer",
                  isSelected
                    ? "bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 border-2 border-orange-300 dark:border-orange-600"
                    : "bg-white/90 dark:bg-gray-900/90"
                )}
                onClick={() => onToggleFoodPreference(pref.value)}
                >
                  {!isSelected && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-yellow-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute inset-[1px] bg-white dark:bg-gray-900 rounded-xl"></div>
                    </>
                  )}

                  <CardContent className="relative p-4 flex items-center justify-between">
                    <span className={cn(
                      "font-medium",
                      isSelected ? "text-orange-800 dark:text-orange-300" : "text-gray-700 dark:text-gray-300"
                    )}>
                      {pref.label}
                    </span>
                    {isSelected && (
                      <CheckCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 shrink-0" />
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      {/* Restrictions */}
      <div className="space-y-4">
        <Label className="text-base font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          Restrições Alimentares
        </Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {RESTRICTIONS.map((restriction) => {
            const isSelected = formData.restrictions.includes(restriction);

            return (
              <div key={restriction} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-orange-600/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <Card className={cn(
                  "relative border-0 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 rounded-xl overflow-hidden cursor-pointer",
                  isSelected
                    ? "bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-300 dark:border-red-600"
                    : "bg-white/90 dark:bg-gray-900/90"
                )}
                onClick={() => onToggleRestriction(restriction)}
                >
                  {!isSelected && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute inset-[1px] bg-white dark:bg-gray-900 rounded-xl"></div>
                    </>
                  )}

                  <CardContent className="relative p-3 text-center">
                    <span className={cn(
                      "text-xs sm:text-sm font-medium",
                      isSelected ? "text-red-800 dark:text-red-300" : "text-gray-700 dark:text-gray-300"
                    )}>
                      {restriction}
                    </span>
                    {isSelected && (
                      <div className="absolute top-1 right-1">
                        <CheckCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Restrictions */}
      <div className="space-y-3">
        <Label htmlFor="custom_restrictions" className="text-base font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
          <Edit3 className="h-4 w-4 text-indigo-600" />
          Outras Restrições ou Observações
        </Label>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-purple-600/10 rounded-xl blur"></div>
          <Textarea
            id="custom_restrictions"
            value={formData.custom_restrictions}
            onChange={(e) => onUpdateField('custom_restrictions', e.target.value)}
            placeholder="Descreva outras restrições alimentares, alergias, preferências especiais ou observações importantes..."
            className="relative min-h-[120px] bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm resize-none"
          />
        </div>
      </div>
    </div>
  );
}