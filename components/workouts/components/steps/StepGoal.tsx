// components/workouts/steps/StepGoal.tsx
import { Target, Award } from 'lucide-react';
import { DIFFICULTY_LEVELS, WORKOUT_GOALS } from '../../constants';
import { StepGoalProps } from '../../types';

export function StepGoal({ 
  selectedLevel, 
  selectedGoal, 
  onLevelSelect, 
  onGoalSelect 
}: StepGoalProps) {
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-achievement-workout rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-app-large">
          <Target className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-app-text-heading mb-2">
          Nível e Objetivo
        </h2>
        <p className="text-app-text-secondary">
          Defina o nível de dificuldade e objetivo do treino
        </p>
      </div>

      <div className="space-y-8">
        {/* Nível de Dificuldade */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-app-text-primary flex items-center gap-2">
            <Award className="h-5 w-5 text-app-achievement-workout" />
            Nível de Dificuldade
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {DIFFICULTY_LEVELS.map((level) => (
              <button
                key={level.value}
                onClick={() => onLevelSelect(level.value)}
                className={`relative group p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                  selectedLevel === level.value
                    ? `bg-achievement-workout text-white shadow-app-xl scale-105`
                    : 'bg-app-card border-2 border-app-border-muted hover:border-app-achievement-workout shadow-app-large'
                }`}
              >
                <div className={`absolute inset-0 bg-achievement-workout rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300`}></div>
                <div className="relative">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 mx-auto ${
                    selectedLevel === level.value
                      ? 'bg-white/20'
                      : `bg-achievement-workout`
                  }`}>
                    <level.icon className={`h-6 w-6 ${
                      selectedLevel === level.value ? 'text-white' : 'text-white'
                    }`} />
                  </div>
                  <h4 className={`font-bold text-lg mb-2 ${
                    selectedLevel === level.value ? 'text-white' : 'text-app-text-primary'
                  }`}>
                    {level.label}
                  </h4>
                  <p className={`text-sm ${
                    selectedLevel === level.value ? 'text-white/80' : 'text-app-text-secondary'
                  }`}>
                    {level.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Objetivo do Treino */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-app-text-primary flex items-center gap-2">
            <Target className="h-5 w-5 text-app-achievement-workout" />
            Objetivo do Treino
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {WORKOUT_GOALS.map((goal) => (
              <button
                key={goal.value}
                onClick={() => onGoalSelect(goal.value)}
                className={`relative group p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                  selectedGoal === goal.value
                    ? `bg-achievement-workout text-white shadow-app-xl scale-105`
                    : 'bg-app-card border-2 border-app-border-muted hover:border-app-achievement-workout shadow-app-large'
                }`}
              >
                <div className={`absolute inset-0 bg-achievement-workout rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300`}></div>
                <div className="relative text-center">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 mx-auto ${
                    selectedGoal === goal.value
                      ? 'bg-white/20'
                      : `bg-achievement-workout`
                  }`}>
                    <goal.icon className={`h-6 w-6 ${
                      selectedGoal === goal.value ? 'text-white' : 'text-white'
                    }`} />
                  </div>
                  <h4 className={`font-bold text-base mb-2 ${
                    selectedGoal === goal.value ? 'text-white' : 'text-app-text-primary'
                  }`}>
                    {goal.label}
                  </h4>
                  <p className={`text-xs leading-tight ${
                    selectedGoal === goal.value ? 'text-white/80' : 'text-app-text-secondary'
                  }`}>
                    {goal.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        {(selectedLevel || selectedGoal) && (
          <div className="relative mt-8">
            <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-workout/20 to-app-achievement-consecutive/20 rounded-2xl blur-xl"></div>
            <div className="relative p-6 bg-gradient-to-r from-app-achievement-workout/10 to-app-achievement-consecutive/10 rounded-2xl border border-app-border-accent">
              <h4 className="text-sm font-bold text-app-achievement-workout uppercase tracking-wider mb-4">
                Resumo da Configuração
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedLevel && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-achievement-workout rounded-lg flex items-center justify-center">
                      <Award className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-app-text-muted uppercase">Nível</p>
                      <p className="font-bold text-app-text-primary">
                        {DIFFICULTY_LEVELS.find(l => l.value === selectedLevel)?.label}
                      </p>
                    </div>
                  </div>
                )}
                {selectedGoal && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-achievement-workout rounded-lg flex items-center justify-center">
                      <Target className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-app-text-muted uppercase">Objetivo</p>
                      <p className="font-bold text-app-text-primary">
                        {WORKOUT_GOALS.find(g => g.value === selectedGoal)?.label}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}