
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
        <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Target className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Nível e Objetivo
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Defina o nível de dificuldade e objetivo do treino
        </p>
      </div>

      <div className="space-y-8">
        {/* Nível de Dificuldade */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Award className="h-5 w-5 text-red-600 dark:text-red-400" />
            Nível de Dificuldade
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {DIFFICULTY_LEVELS.map((level) => (
              <button
                key={level.value}
                onClick={() => onLevelSelect(level.value)}
                className={`relative group p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                  selectedLevel === level.value
                    ? `bg-gradient-to-br ${level.color} text-white shadow-xl scale-105`
                    : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 shadow-lg'
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${level.color} rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                <div className="relative">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 mx-auto ${
                    selectedLevel === level.value
                      ? 'bg-white/20'
                      : `bg-gradient-to-br ${level.color}`
                  }`}>
                    <level.icon className={`h-6 w-6 ${
                      selectedLevel === level.value ? 'text-white' : 'text-white'
                    }`} />
                  </div>
                  <h4 className={`font-bold text-lg mb-2 ${
                    selectedLevel === level.value ? 'text-white' : 'text-gray-900 dark:text-white'
                  }`}>
                    {level.label}
                  </h4>
                  <p className={`text-sm ${
                    selectedLevel === level.value ? 'text-white/80' : 'text-gray-600 dark:text-gray-400'
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
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Target className="h-5 w-5 text-red-600 dark:text-red-400" />
            Objetivo do Treino
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {WORKOUT_GOALS.map((goal) => (
              <button
                key={goal.value}
                onClick={() => onGoalSelect(goal.value)}
                className={`relative group p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                  selectedGoal === goal.value
                    ? `bg-gradient-to-br ${goal.color} text-white shadow-xl scale-105`
                    : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 shadow-lg'
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${goal.color} rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                <div className="relative text-center">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 mx-auto ${
                    selectedGoal === goal.value
                      ? 'bg-white/20'
                      : `bg-gradient-to-br ${goal.color}`
                  }`}>
                    <goal.icon className={`h-6 w-6 ${
                      selectedGoal === goal.value ? 'text-white' : 'text-white'
                    }`} />
                  </div>
                  <h4 className={`font-bold text-base mb-2 ${
                    selectedGoal === goal.value ? 'text-white' : 'text-gray-900 dark:text-white'
                  }`}>
                    {goal.label}
                  </h4>
                  <p className={`text-xs leading-tight ${
                    selectedGoal === goal.value ? 'text-white/80' : 'text-gray-600 dark:text-gray-400'
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
            <div className="absolute inset-0 bg-gradient-to-r from-red-200/50 to-orange-200/50 dark:from-red-700/50 dark:to-orange-700/50 rounded-2xl blur-xl"></div>
            <div className="relative p-6 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-2xl">
              <h4 className="text-sm font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-4">
                Resumo da Configuração
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedLevel && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                      <Award className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Nível</p>
                      <p className="font-bold text-gray-900 dark:text-white">
                        {DIFFICULTY_LEVELS.find(l => l.value === selectedLevel)?.label}
                      </p>
                    </div>
                  </div>
                )}
                {selectedGoal && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                      <Target className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Objetivo</p>
                      <p className="font-bold text-gray-900 dark:text-white">
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