// components/diets/components/steps/StepGoals.tsx
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Target, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

import { DIET_GOALS, ACTIVITY_LEVELS, BUDGET_PROFILES } from '../constants';
import type { DietFormData } from '../types';
import type { DietFormErrors } from '../hooks/form-types';

interface StepGoalsProps {
  formData: DietFormData;
  errors: DietFormErrors;
  onUpdateField: <K extends keyof DietFormData>(field: K, value: DietFormData[K]) => void;
}

export function StepGoals({
  formData,
  errors,
  onUpdateField
}: StepGoalsProps) {
  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-500/20 to-cyan-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <Card className="relative border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute inset-[1px] bg-white dark:bg-gray-900 rounded-2xl"></div>

        <CardHeader className="relative pb-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg">
              <Target className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                Objetivos da Dieta
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Defina os objetivos e nível de atividade física
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative space-y-8">
          {/* Goals */}
          <div className="space-y-4">
            <Label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Qual é o objetivo? *
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {DIET_GOALS.map((goal) => {
                const Icon = goal.icon;
                const isSelected = formData.goal === goal.value;

                return (
                  <button
                    key={goal.value}
                    onClick={() => onUpdateField('goal', goal.value)}
                    className={cn(
                      "relative p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105",
                      isSelected
                        ? "border-transparent shadow-xl"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600",
                      errors.goal ? "ring-2 ring-red-500" : ""
                    )}
                  >
                    {isSelected && (
                      <div className={cn(
                        "absolute inset-0 bg-gradient-to-r rounded-2xl opacity-10",
                        goal.color
                      )} />
                    )}
                    <div className="relative z-10 flex flex-col items-center space-y-3">
                      <div className={cn(
                        "p-3 rounded-xl bg-gradient-to-r",
                        goal.color
                      )}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <span className={cn(
                        "font-semibold text-sm text-center",
                        isSelected ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"
                      )}>
                        {goal.label}
                      </span>
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            {errors.goal && (
              <p className="text-sm text-red-500 mt-1">{errors.goal}</p>
            )}

            {formData.goal === 'other' && (
              <div className="mt-4">
                <Textarea
                  value={formData.goal_description}
                  onChange={(e) => onUpdateField('goal_description', e.target.value)}
                  placeholder="Descreva o objetivo específico..."
                  className="min-h-[100px] bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm"
                />
              </div>
            )}
          </div>

          {/* Activity Level */}
          <div className="space-y-4">
            <Label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Nível de Atividade Física *
            </Label>
            <div className="space-y-3">
              {ACTIVITY_LEVELS.map((level) => (
                <button
                  key={level.value}
                  onClick={() => onUpdateField('activity_level', level.value)}
                  className={cn(
                    "w-full p-4 rounded-xl border-2 transition-all duration-300 text-left",
                    formData.activity_level === level.value
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600",
                    errors.activity_level ? "ring-2 ring-red-500" : ""
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {level.label}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {level.description}
                      </p>
                    </div>
                    {formData.activity_level === level.value && (
                      <CheckCircle className="h-5 w-5 text-blue-500" />
                    )}
                  </div>
                </button>
              ))}
            </div>
            {errors.activity_level && (
              <p className="text-sm text-red-500 mt-1">{errors.activity_level}</p>
            )}
          </div>

          {/* Budget Profile */}
          <div className="space-y-4">
            <Label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Perfil de Orçamento *
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {BUDGET_PROFILES.map((budget) => {
                const isSelected = formData.budget_profile === budget.value;

                return (
                  <button
                    key={budget.value}
                    onClick={() => onUpdateField('budget_profile', budget.value)}
                    className={cn(
                      "relative p-4 rounded-xl border-2 transition-all duration-300 text-left",
                      isSelected
                        ? "border-transparent shadow-xl"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600",
                      errors.budget_profile ? "ring-2 ring-red-500" : ""
                    )}
                  >
                    {isSelected && (
                      <div className={cn(
                        "absolute inset-0 bg-gradient-to-r rounded-xl opacity-10",
                        budget.color
                      )} />
                    )}
                    <div className="relative">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={cn(
                          "p-2 rounded-lg bg-gradient-to-r",
                          budget.color
                        )}>
                          <DollarSign className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {budget.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {budget.description}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            {errors.budget_profile && (
              <p className="text-sm text-red-500 mt-1">{errors.budget_profile}</p>
            )}
          </div>

          {/* Meals per Day */}
          <div className="space-y-4">
            <Label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Número de Refeições por Dia: {formData.meals_per_day}
            </Label>
            <Slider
              value={[formData.meals_per_day]}
              onValueChange={(value) => onUpdateField('meals_per_day', value[0])}
              min={1}
              max={6}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>1 refeição</span>
              <span>6 refeições</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}