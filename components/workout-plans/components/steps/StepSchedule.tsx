// components/workout-plans/components/steps/StepSchedule.tsx
import { Clock, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';
import { DAYS_OF_WEEK } from '../../constants';
import { Badge } from '@/components/ui/badge';

interface StepScheduleProps {
  schedule: number[];
  onScheduleUpdate: (days: number[]) => void;
  errors: Record<string, string>;
}

export function StepSchedule({ schedule, onScheduleUpdate, errors }: StepScheduleProps) {
  const toggleDay = (dayValue: number) => {
    if (schedule.includes(dayValue)) {
      onScheduleUpdate(schedule.filter(d => d !== dayValue));
    } else {
      onScheduleUpdate([...schedule, dayValue].sort());
    }
  };

  const getConsecutiveDays = () => {
    if (schedule.length === 0) return 0;
    
    const sortedDays = [...schedule].sort((a, b) => a - b);
    let maxConsecutive = 1;
    let currentConsecutive = 1;
    
    for (let i = 1; i < sortedDays.length; i++) {
      if (sortedDays[i] - sortedDays[i - 1] === 1) {
        currentConsecutive++;
        maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
      } else {
        currentConsecutive = 1;
      }
    }
    
    // Check wrap around (Sunday to Monday)
    if (sortedDays.includes(0) && sortedDays.includes(1)) {
      const sundayIndex = sortedDays.indexOf(0);
      let wrapConsecutive = 1;
      
      // Count backwards from Sunday
      for (let i = sortedDays.length - 1; i >= 0 && sortedDays[i] === 6 - (sortedDays.length - 1 - i); i--) {
        wrapConsecutive++;
      }
      
      // Count forwards from Monday
      for (let i = 0; i < sortedDays.length && sortedDays[i] === i + 1; i++) {
        wrapConsecutive++;
      }
      
      maxConsecutive = Math.max(maxConsecutive, wrapConsecutive);
    }
    
    return maxConsecutive;
  };

  const consecutiveDays = getConsecutiveDays();
  const hasWarning = consecutiveDays > 5;

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="relative inline-block">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg mx-auto">
            <Clock className="h-10 w-10 text-white" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">2</span>
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Agendamento Semanal
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Selecione os dias da semana para os treinos
          </p>
        </div>
      </div>

      {/* Days Grid */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {DAYS_OF_WEEK.map((day) => {
            const isSelected = schedule.includes(day.value);
            
            return (
              <button
                key={day.value}
                onClick={() => toggleDay(day.value)}
                className={`relative group p-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] ${
                  isSelected
                    ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg scale-[0.98]'
                    : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600 shadow-md'
                }`}
              >
                {/* Background Glow */}
                {isSelected && (
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl blur-lg opacity-50"></div>
                )}
                
                <div className="relative space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`font-bold text-lg ${
                      isSelected ? 'text-white' : 'text-gray-900 dark:text-white'
                    }`}>
                      {day.short}
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="h-5 w-5 text-white" />
                    )}
                  </div>
                  <p className={`text-sm ${
                    isSelected ? 'text-white/80' : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {day.label}
                  </p>
                </div>

                {/* Hover Effect */}
                {!isSelected && (
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-amber-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                )}
              </button>
            );
          })}
        </div>

        {/* Error Message */}
        {errors.schedule && (
          <div className="flex items-center gap-2 text-red-500 text-sm">
            <AlertCircle className="h-4 w-4" />
            {errors.schedule}
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <div className="relative p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Dias selecionados</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{schedule.length}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                <Calendar className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <div className="relative p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Frequência semanal</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {schedule.length > 0 ? `${Math.round((schedule.length / 7) * 100)}%` : '0%'}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                <Clock className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className={`relative group ${hasWarning ? 'ring-2 ring-yellow-500' : ''}`}>
          <div className={`absolute inset-0 bg-gradient-to-r ${
            hasWarning ? 'from-yellow-600 to-orange-600' : 'from-purple-600 to-pink-600'
          } rounded-xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity`}></div>
          <div className="relative p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Dias consecutivos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{consecutiveDays}</p>
              </div>
              <div className={`p-3 bg-gradient-to-br ${
                hasWarning ? 'from-yellow-500 to-orange-500' : 'from-purple-500 to-pink-500'
              } rounded-lg`}>
                {hasWarning ? (
                  <AlertCircle className="h-5 w-5 text-white" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-white" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Warning Message */}
      {hasWarning && (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 rounded-xl blur-xl"></div>
          <div className="relative p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-800 dark:text-yellow-300">
                  Atenção: Muitos dias consecutivos
                </h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                  Treinar {consecutiveDays} dias seguidos pode causar fadiga excessiva. 
                  Considere adicionar dias de descanso para melhor recuperação.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 rounded-xl">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
              Iniciante
            </Badge>
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            3-4 dias por semana com pelo menos 1 dia de descanso entre treinos
          </p>
        </div>

        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 rounded-xl">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
              Avançado
            </Badge>
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            5-6 dias por semana com periodização adequada e dias de recuperação ativa
          </p>
        </div>
      </div>
    </div>
  );
}