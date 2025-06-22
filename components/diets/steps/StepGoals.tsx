// components/diets/steps/StepGoals.tsx
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Target, DollarSign, Activity, ChefHat } from 'lucide-react';
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
    <div className="space-y-8">
      {/* Goals */}
      <div className="space-y-4">
        <Label className="text-base font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
          <Target className="h-4 w-4 text-green-600" />
          Qual é o objetivo principal? *
        </Label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DIET_GOALS.map((goal) => {
            const Icon = goal.icon;
            const isSelected = formData.goal === goal.value;

            return (
              <div key={goal.value} className="group relative">
                <div className={cn(
                  "absolute inset-0 rounded-xl sm:rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                  `bg-gradient-to-r ${goal.color}`
                )}></div>
                <Card className={cn(
                  "relative border-0 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 rounded-xl sm:rounded-2xl overflow-hidden group-hover:transform group-hover:scale-[1.02] cursor-pointer",
                  isSelected
                    ? `bg-gradient-to-r ${goal.color} text-white`
                    : 'bg-white/90 dark:bg-gray-900/90',
                  errors.goal ? "ring-2 ring-red-500" : ""
                )}
                onClick={() => onUpdateField('goal', goal.value)}
                >
                  {!isSelected && (
                    <>
                      <div className={cn(
                        "absolute inset-0 bg-gradient-to-r rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                        goal.color
                      )}></div>
                      <div className="absolute inset-[1px] bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl"></div>
                    </>
                  )}

                  <CardContent className="relative p-4 sm:p-6 space-y-3 sm:space-y-4">
                    <div className="flex justify-between items-start">
                      <div className={cn(
                        "p-3 rounded-xl",
                        isSelected ? "bg-white/20" : `bg-gradient-to-r ${goal.color}`
                      )}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      {isSelected && (
                        <CheckCircle className="h-5 w-5 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className={cn(
                        "font-bold text-sm sm:text-base",
                        isSelected ? "text-white" : "text-gray-900 dark:text-white"
                      )}>
                        {goal.label}
                      </h3>
                    </div>
                  </CardContent>
                </Card>
              </div>
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
        <Label className="text-base font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
          <Activity className="h-4 w-4 text-blue-600" />
          Nível de Atividade Física *
        </Label>
        <div className="grid grid-cols-1 gap-3">
          {ACTIVITY_LEVELS.map((level) => {
            const isSelected = formData.activity_level === level.value;

            return (
              <div key={level.value} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <Card className={cn(
                  "relative border-0 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 rounded-xl overflow-hidden cursor-pointer",
                  isSelected
                    ? "bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-2 border-blue-300 dark:border-blue-600"
                    : "bg-white/90 dark:bg-gray-900/90",
                  errors.activity_level ? "ring-2 ring-red-500" : ""
                )}
                onClick={() => onUpdateField('activity_level', level.value)}
                >
                  {!isSelected && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute inset-[1px] bg-white dark:bg-gray-900 rounded-xl"></div>
                    </>
                  )}

                  <CardContent className="relative p-4 flex items-center justify-between">
                    <div>
                      <p className={cn(
                        "font-semibold",
                        isSelected ? "text-blue-800 dark:text-blue-300" : "text-gray-900 dark:text-white"
                      )}>
                        {level.label}
                      </p>
                      <p className={cn(
                        "text-sm",
                        isSelected ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"
                      )}>
                        {level.description}
                      </p>
                    </div>
                    {isSelected && (
                      <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
        {errors.activity_level && (
          <p className="text-sm text-red-500 mt-1">{errors.activity_level}</p>
        )}
      </div>

      {/* Budget Profile */}
      <div className="space-y-4">
        <Label className="text-base font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-purple-600" />
          Perfil de Orçamento *
        </Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {BUDGET_PROFILES.map((budget) => {
            const isSelected = formData.budget_profile === budget.value;

            return (
              <div key={budget.value} className="group relative">
                <div className={cn(
                  "absolute inset-0 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                  `bg-gradient-to-r ${budget.color}`
                )}></div>
                <Card className={cn(
                  "relative border-0 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 rounded-xl overflow-hidden cursor-pointer",
                  isSelected
                    ? `bg-gradient-to-r ${budget.color} text-white`
                    : 'bg-white/90 dark:bg-gray-900/90',
                  errors.budget_profile ? "ring-2 ring-red-500" : ""
                )}
                onClick={() => onUpdateField('budget_profile', budget.value)}
                >
                  {!isSelected && (
                    <>
                      <div className={cn(
                        "absolute inset-0 bg-gradient-to-r rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                        budget.color
                      )}></div>
                      <div className="absolute inset-[1px] bg-white dark:bg-gray-900 rounded-xl"></div>
                    </>
                  )}

                  <CardContent className="relative p-4 sm:p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={cn(
                        "p-2 rounded-lg",
                        isSelected ? "bg-white/20" : `bg-gradient-to-r ${budget.color}`
                      )}>
                        <DollarSign className="h-4 w-4 text-white" />
                      </div>
                      {isSelected && (
                        <CheckCircle className="h-5 w-5 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className={cn(
                        "font-semibold",
                        isSelected ? "text-white" : "text-gray-900 dark:text-white"
                      )}>
                        {budget.label}
                      </h3>
                      <p className={cn(
                        "text-sm",
                        isSelected ? "text-white/80" : "text-gray-600 dark:text-gray-400"
                      )}>
                        {budget.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
        {errors.budget_profile && (
          <p className="text-sm text-red-500 mt-1">{errors.budget_profile}</p>
        )}
      </div>

      {/* Meals per Day */}
      <div className="space-y-4">
        <Label className="text-base font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
          <ChefHat className="h-4 w-4 text-orange-600" />
          Número de Refeições por Dia: <span className="text-green-600 dark:text-green-400">{formData.meals_per_day}</span>
        </Label>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 to-red-600/10 rounded-xl blur"></div>
          <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 shadow-lg">
            <Slider
              value={[formData.meals_per_day]}
              onValueChange={(value) => onUpdateField('meals_per_day', value[0])}
              min={1}
              max={6}
              step={1}
              color='green'
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-2">
              <span>1 refeição</span>
              <span>6 refeições</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}