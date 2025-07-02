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
          <div className="w-20 h-20 bg-achievement-consecutive rounded-2xl flex items-center justify-center shadow-app-large mx-auto">
            <Clock className="h-10 w-10 text-white" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-app-achievement-workout rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">2</span>
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-app-text-primary">
            Agendamento Semanal
          </h2>
          <p className="text-app-text-secondary mt-2">
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
                    ? 'bg-achievement-workout text-white shadow-app-large scale-[0.98]'
                    : 'bg-app-card border-2 border-app-border-muted hover:border-app-border-accent shadow-app-medium'
                }`}
              >
                {/* Background Glow */}
                {isSelected && (
                  <div className="absolute inset-0 bg-achievement-workout rounded-xl blur-lg opacity-50"></div>
                )}
                
                <div className="relative space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`font-bold text-lg ${
                      isSelected ? 'text-white' : 'text-app-text-primary'
                    }`}>
                      {day.short}
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="h-5 w-5 text-white" />
                    )}
                  </div>
                  <p className={`text-sm ${
                    isSelected ? 'text-white/80' : 'text-app-text-secondary'
                  }`}>
                    {day.label}
                  </p>
                </div>

                {/* Hover Effect */}
                {!isSelected && (
                  <div className="absolute inset-0 bg-app-achievement-workout/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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
          <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-consecutive/20 to-app-achievement-workout/20 rounded-xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <div className="relative p-4 bg-app-card rounded-xl shadow-app-medium">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-app-text-secondary">Dias selecionados</p>
                <p className="text-2xl font-bold text-app-text-primary">{schedule.length}</p>
              </div>
              <div className="p-3 bg-app-achievement-consecutive rounded-lg">
                <Calendar className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-workout/20 to-app-achievement-consecutive/20 rounded-xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <div className="relative p-4 bg-app-card rounded-xl shadow-app-medium">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-app-text-secondary">Frequência semanal</p>
                <p className="text-2xl font-bold text-app-text-primary">
                  {schedule.length > 0 ? `${Math.round((schedule.length / 7) * 100)}%` : '0%'}
                </p>
              </div>
              <div className="p-3 bg-app-achievement-workout rounded-lg">
                <Clock className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className={`relative group ${hasWarning ? 'ring-2 ring-yellow-500' : ''}`}>
          <div className={`absolute inset-0 bg-gradient-to-r ${
            hasWarning ? 'from-yellow-600/20 to-orange-600/20' : 'from-app-achievement-weight/20 to-app-achievement-exercise/20'
          } rounded-xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity`}></div>
          <div className="relative p-4 bg-app-card rounded-xl shadow-app-medium">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-app-text-secondary">Dias consecutivos</p>
                <p className="text-2xl font-bold text-app-text-primary">{consecutiveDays}</p>
              </div>
              <div className={`p-3 bg-gradient-to-br ${
                hasWarning ? 'from-yellow-500 to-orange-500' : 'bg-app-achievement-weight'
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
          <div className="relative p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
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
        <div className="p-4 bg-app-achievement-consecutive/10 rounded-xl border border-app-border-accent">
          <h4 className="font-semibold text-app-text-primary mb-2 flex items-center gap-2">
            <Badge className="bg-app-achievement-consecutive/20 text-app-achievement-consecutive">
              Iniciante
            </Badge>
          </h4>
          <p className="text-sm text-app-text-secondary">
            3-4 dias por semana com pelo menos 1 dia de descanso entre treinos
          </p>
        </div>

        <div className="p-4 bg-app-achievement-workout/10 rounded-xl border border-app-border-accent">
          <h4 className="font-semibold text-app-text-primary mb-2 flex items-center gap-2">
            <Badge className="bg-app-achievement-workout/20 text-app-achievement-workout">
              Avançado
            </Badge>
          </h4>
          <p className="text-sm text-app-text-secondary">
            5-6 dias por semana com periodização adequada e dias de recuperação ativa
          </p>
        </div>
      </div>
    </div>
  );
}