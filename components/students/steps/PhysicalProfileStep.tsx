'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Ruler, Scale, Target, Award, Clock, Zap } from 'lucide-react';
import { StudentFormData } from '@/types/student';

interface PhysicalProfileStepProps {
  data: StudentFormData;
  onChange: (updates: Partial<StudentFormData>) => void;
  errors: Record<string, string>;
}

const GOALS = [
  { value: 'weight_loss', label: 'Perda de Peso', icon: '🔥', bgClass: 'bg-gradient-to-br from-red-500 to-orange-500' },
  { value: 'muscle_gain', label: 'Ganho de Massa', icon: '💪', bgClass: 'bg-gradient-to-br from-app-achievement-exercise to-app-achievement-consecutive' },
  { value: 'strength', label: 'Força', icon: '⚡', bgClass: 'bg-gradient-to-br from-yellow-500 to-orange-500' },
  { value: 'endurance', label: 'Resistência', icon: '🏃', bgClass: 'bg-achievement-workout' },
  { value: 'flexibility', label: 'Flexibilidade', icon: '🤸', bgClass: 'bg-gradient-to-br from-pink-500 to-purple-500' },
  { value: 'general_fitness', label: 'Condicionamento Geral', icon: '🎯', bgClass: 'bg-achievement-weight' },
  { value: 'sports_performance', label: 'Performance Esportiva', icon: '🏆', bgClass: 'bg-gradient-to-br from-amber-500 to-yellow-500' },
  { value: 'rehabilitation', label: 'Reabilitação', icon: '🩺', bgClass: 'bg-achievement-consecutive' }
];

const EXPERIENCE_LEVELS = [
  { value: 'beginner', label: 'Iniciante', description: 'Pouca ou nenhuma experiência' },
  { value: 'intermediate', label: 'Intermediário', description: 'Já pratica há alguns meses' },
  { value: 'advanced', label: 'Avançado', description: 'Experiência consistente' }
];

const TRAINING_TIMES = [
  { value: 'dawn', label: 'Madrugada', time: '05:00 - 07:00' },
  { value: 'morning', label: 'Manhã', time: '07:00 - 12:00' },
  { value: 'afternoon', label: 'Tarde', time: '12:00 - 18:00' },
  { value: 'evening', label: 'Noite', time: '18:00 - 22:00' }
];

export function PhysicalProfileStep({ data, onChange, errors }: PhysicalProfileStepProps) {
  const handleGoalToggle = (goalValue: string) => {
    const currentGoals = data.goals || [];
    const updatedGoals = currentGoals.includes(goalValue)
      ? currentGoals.filter(g => g !== goalValue)
      : [...currentGoals, goalValue];
    
    onChange({ goals: updatedGoals });
  };

  return (
    <div className="space-y-6">
      
      {/* Altura e Peso */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="space-y-3">
          <Label htmlFor="height" className="text-sm font-semibold text-app-text-primary flex items-center gap-2">
            <Ruler className="h-4 w-4 text-app-text-accent" />
            Altura (cm)
          </Label>
          <div className="relative">
            <Input
              id="height"
              type="number"
              inputMode="numeric"
              placeholder="170"
              value={data.height}
              onChange={(e) => onChange({ height: e.target.value })}
              className="h-11 md:h-12 bg-app-bg-card border-app-border-muted rounded-xl focus:ring-2 focus:ring-app-achievement-exercise transition-all text-base pr-12"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-app-text-muted">
              cm
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="weight" className="text-sm font-semibold text-app-text-primary flex items-center gap-2">
            <Scale className="h-4 w-4 text-app-text-accent" />
            Peso (kg)
          </Label>
          <div className="relative">
            <Input
              id="weight"
              type="number"
              inputMode="numeric"
              placeholder="70"
              value={data.weight}
              onChange={(e) => onChange({ weight: e.target.value })}
              className="h-11 md:h-12 bg-app-bg-card border-app-border-muted rounded-xl focus:ring-2 focus:ring-app-achievement-exercise transition-all text-base pr-12"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-app-text-muted">
              kg
            </div>
          </div>
        </div>
      </div>

      {/* Objetivos de Treino */}
      <div className="space-y-4">
        <Label className="text-sm font-semibold text-app-text-primary flex items-center gap-2">
          <Target className="h-4 w-4 text-app-text-accent" />
          Objetivos de Treino
        </Label>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {GOALS.map((goal) => (
            <div key={goal.value} className="relative group">
              <input
                type="checkbox"
                id={goal.value}
                checked={data.goals?.includes(goal.value) || false}
                onChange={() => handleGoalToggle(goal.value)}
                className="peer sr-only"
              />
              <label
                htmlFor={goal.value}
                className="flex items-center gap-3 p-3 md:p-4 bg-app-card border-2 border-app-border-muted rounded-xl cursor-pointer transition-all hover:bg-app-bg-secondary peer-checked:bg-app-achievement-exercise/10 peer-checked:border-app-border-accent peer-checked:shadow-app-medium group-hover:scale-[1.02] active:scale-[0.98] min-h-[60px]"
              >
                <div className={`w-10 h-10 rounded-xl ${goal.bgClass} flex items-center justify-center text-white font-bold shadow-app-medium`}>
                  <span className="text-lg">{goal.icon}</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-app-text-primary">
                    {goal.label}
                  </h4>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 transition-all ${
                  data.goals?.includes(goal.value)
                    ? 'bg-app-achievement-exercise border-app-achievement-exercise'
                    : 'border-app-border-muted'
                }`}>
                  {data.goals?.includes(goal.value) && (
                    <div className="w-full h-full rounded-full bg-white scale-50"></div>
                  )}
                </div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Nível de Experiência */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-app-text-primary flex items-center gap-2">
          <Award className="h-4 w-4 text-app-text-accent" />
          Nível de Experiência
        </Label>
        
        <div className="grid grid-cols-1 gap-3">
          {EXPERIENCE_LEVELS.map((level) => (
            <div key={level.value} className="relative">
              <input
                type="radio"
                id={level.value}
                name="experienceLevel"
                checked={data.experienceLevel === level.value}
                onChange={() => onChange({ experienceLevel: level.value })}
                className="peer sr-only"
              />
              <label
                htmlFor={level.value}
                className="flex items-center justify-between p-4 bg-app-card border-2 border-app-border-muted rounded-xl cursor-pointer transition-all hover:bg-app-bg-secondary peer-checked:bg-app-achievement-consecutive/10 peer-checked:border-app-border-accent peer-checked:shadow-app-medium"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full border-2 transition-all ${
                    data.experienceLevel === level.value
                      ? 'bg-app-achievement-consecutive border-app-achievement-consecutive'
                      : 'border-app-border-muted'
                  }`}>
                    {data.experienceLevel === level.value && (
                      <div className="w-full h-full rounded-full bg-white scale-50"></div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-app-text-primary">
                      {level.label}
                    </h4>
                    <p className="text-sm text-app-text-secondary">
                      {level.description}
                    </p>
                  </div>
                </div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Horário Preferido */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-app-text-primary flex items-center gap-2">
          <Clock className="h-4 w-4 text-app-text-accent" />
          Horário Preferido de Treino
        </Label>
        
        <div className="grid grid-cols-2 gap-3">
          {TRAINING_TIMES.map((time) => (
            <div key={time.value} className="relative">
              <input
                type="radio"
                id={time.value}
                name="preferredTime"
                checked={data.preferredTime === time.value}
                onChange={() => onChange({ preferredTime: time.value })}
                className="peer sr-only"
              />
              <label
                htmlFor={time.value}
                className="flex flex-col items-center justify-center p-4 bg-app-card border-2 border-app-border-muted rounded-xl cursor-pointer transition-all hover:bg-app-bg-secondary peer-checked:bg-app-achievement-weight/10 peer-checked:border-app-border-accent peer-checked:shadow-app-medium text-center min-h-[80px]"
              >
                <h4 className="font-semibold text-app-text-primary mb-1">
                  {time.label}
                </h4>
                <p className="text-xs text-app-text-secondary">
                  {time.time}
                </p>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Info Helper */}
      <div className="bg-app-achievement-exercise/10 rounded-xl p-4 border border-app-border-accent">
        <div className="flex items-start gap-3">
          <Zap className="h-5 w-5 text-app-text-accent mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-app-text-secondary mb-1">
              Personalize o Treino
            </h4>
            <p className="text-sm text-app-text-secondary">
              Essas informações ajudam a criar um plano de treino mais eficaz e personalizado para cada aluno.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}