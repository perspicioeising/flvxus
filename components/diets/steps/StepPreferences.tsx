// components/diets/components/steps/StepPreferences.tsx
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Apple } from 'lucide-react';
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
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-500/20 to-orange-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <Card className="relative border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute inset-[1px] bg-white dark:bg-gray-900 rounded-2xl"></div>

        <CardHeader className="relative pb-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg">
              <Apple className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                Preferências e Restrições
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Personalize a dieta de acordo com suas preferências
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative space-y-8">
          {/* Dietary Style */}
          <div className="space-y-4">
            <Label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Estilo Alimentar Preferido
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {DIETARY_STYLES.map((style) => {
                const Icon = style.icon;
                const isSelected = formData.dietary_style.includes(style.value);

                return (
                  <button
                    key={style.value}
                    onClick={() => onToggleDietaryStyle(style.value)}
                    className={cn(
                      "p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center space-y-2",
                      isSelected
                        ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    )}
                  >
                    <Icon className={cn(
                      "h-5 w-5",
                      isSelected ? "text-purple-600 dark:text-purple-400" : "text-gray-600 dark:text-gray-400"
                    )} />
                    <span className={cn(
                      "text-sm font-medium text-center",
                      isSelected ? "text-purple-800 dark:text-purple-300" : "text-gray-700 dark:text-gray-300"
                    )}>
                      {style.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Food Preferences */}
          <div className="space-y-4">
            <Label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Preferências de Alimentos
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {FOOD_PREFERENCES.map((pref) => {
                const isSelected = formData.food_preferences.includes(pref.value);

                return (
                  <button
                    key={pref.value}
                    onClick={() => onToggleFoodPreference(pref.value)}
                    className={cn(
                      "p-4 rounded-xl border-2 transition-all duration-300 text-left",
                      isSelected
                        ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className={cn(
                        "font-medium",
                        isSelected ? "text-orange-800 dark:text-orange-300" : "text-gray-700 dark:text-gray-300"
                      )}>
                        {pref.label}
                      </span>
                      {isSelected && (
                        <CheckCircle className="h-5 w-5 text-orange-500" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Restrictions */}
          <div className="space-y-4">
            <Label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Restrições Alimentares
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {RESTRICTIONS.map((restriction) => {
                const isSelected = formData.restrictions.includes(restriction);

                return (
                  <button
                    key={restriction}
                    onClick={() => onToggleRestriction(restriction)}
                    className={cn(
                      "p-3 rounded-xl border-2 transition-all duration-300 text-center",
                      isSelected
                        ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    )}
                  >
                    <span className={cn(
                      "text-sm font-medium",
                      isSelected ? "text-red-800 dark:text-red-300" : "text-gray-700 dark:text-gray-300"
                    )}>
                      {restriction}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Restrictions */}
          <div className="space-y-3">
            <Label htmlFor="custom_restrictions" className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Outras Restrições
            </Label>
            <Textarea
              id="custom_restrictions"
              value={formData.custom_restrictions}
              onChange={(e) => onUpdateField('custom_restrictions', e.target.value)}
              placeholder="Descreva outras restrições ou observações..."
              className="min-h-[100px] bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}