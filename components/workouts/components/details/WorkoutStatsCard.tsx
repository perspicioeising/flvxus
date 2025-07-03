import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Activity, 
  Hash, 
  Clock, 
  Target,
  Package,
  Timer,
  Dumbbell,
  Star,
  Crown,
  Award,
  Zap,
  Weight,
  Repeat
} from 'lucide-react';
import { WorkoutStatsCardProps } from './types';

export function WorkoutStatsCard({ stats, level, goal }: WorkoutStatsCardProps) {
  // Verificar se o treino tem configuração avançada
  const hasAdvancedConfig = stats.hasAdvancedConfiguration || false;
  
  // Configuração das métricas principais (atualizada para nova estrutura)
  const metrics = [
    {
      value: stats.totalExercises,
      label: "Exercícios",
      color: 'from-app-achievement-exercise to-app-btn-primary',
      icon: Activity,
      progress: Math.min((stats.totalExercises / 15) * 100, 100),
      suffix: "",
      description: "Total de exercícios",
      idealRange: "6-12 exercícios"
    },
    {
      value: stats.totalSets,
      label: "Séries",
      color: 'from-app-achievement-consecutive to-app-btn-secondary',
      icon: Hash,
      progress: Math.min((stats.totalSets / 50) * 100, 100),
      suffix: "",
      description: hasAdvancedConfig ? "Séries individuais" : "Séries totais",
      idealRange: "15-30 séries"
    },
    {
      value: stats.totalReps || stats.estimatedDuration,
      label: stats.totalReps ? "Repetições" : "Duração",
      color: 'from-app-achievement-weight to-app-text-accent',
      icon: stats.totalReps ? Repeat : Clock,
      progress: stats.totalReps 
        ? Math.min((stats.totalReps / 300) * 100, 100)
        : Math.min((stats.estimatedDuration / 120) * 100, 100),
      suffix: stats.totalReps ? "" : "min",
      description: stats.totalReps ? "Repetições totais" : "Tempo estimado",
      idealRange: stats.totalReps ? "150-300 reps" : "45-90 min"
    },
    {
      value: stats.averageRest,
      label: "Descanso",
      color: 'from-app-achievement-workout to-app-btn-accent',
      icon: Timer,
      progress: Math.min((stats.averageRest / 180) * 100, 100),
      suffix: "s",
      description: "Intervalo médio",
      idealRange: "60-120 seg"
    }
  ];

  // Função para classificação do treino (atualizada)
  const getWorkoutClassification = (totalExercises: number, totalSets: number, hasAdvanced: boolean) => {
    let classification = '';
    let colorClass = '';
    let icon = Award;

    if (hasAdvanced) {
      classification = 'Personalizado';
      colorClass = 'from-green-500 to-teal-600';
      icon = Crown;
    } else if (totalExercises >= 10 && totalSets >= 30) {
      classification = 'Intensivo';
      colorClass = 'from-red-500 to-red-600';
      icon = Crown;
    } else if (totalExercises >= 7 && totalSets >= 20) {
      classification = 'Completo';
      colorClass = 'from-purple-500 to-purple-600';
      icon = Award;
    } else if (totalExercises >= 5 && totalSets >= 15) {
      classification = 'Moderado';
      colorClass = 'from-blue-500 to-indigo-600';
      icon = Target;
    } else {
      classification = 'Básico';
      colorClass = 'from-green-500 to-emerald-600';
      icon = Zap;
    }

    return { classification, colorClass, icon };
  };

  const classification = getWorkoutClassification(stats.totalExercises, stats.totalSets, hasAdvancedConfig);

  return (
    <div className="space-y-6">
      
      {/* Main Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          
          return (
            <div key={index} className="relative group">
              {/* Glow Effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${metric.color} rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500`}></div>

              {/* Card */}
              <Card className="relative border-0 bg-app-card backdrop-blur-xl rounded-2xl shadow-app-large hover:shadow-app-xl transition-all duration-500 group-hover:scale-105 overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute inset-0 bg-gradient-to-br from-app-text-primary to-transparent"></div>
                </div>

                <CardContent className="relative p-4 sm:p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-xs font-bold text-app-text-muted uppercase tracking-wider mb-1">
                        {metric.label}
                      </p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl sm:text-3xl font-black text-app-heading">
                          {metric.value}
                        </span>
                        <span className="text-lg sm:text-xl font-semibold text-app-text-secondary">
                          {metric.suffix}
                        </span>
                      </div>
                      <p className="text-xs text-app-text-muted mt-1">
                        {hasAdvancedConfig && metric.label === "Séries" ? "Config. avançada" : `Ideal: ${metric.idealRange}`}
                      </p>
                    </div>

                    {/* Icon */}
                    <div className={`relative p-2 sm:p-3 bg-gradient-to-br ${metric.color} rounded-xl shadow-app-medium group-hover:shadow-app-large transition-all duration-300`}>
                      <Icon className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                      <div className="absolute inset-0 bg-white/20 rounded-xl blur-sm"></div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <Progress
                      value={metric.progress}
                      className="h-2 bg-app-bg-secondary"
                    />
                    <p className="text-xs text-app-text-muted">
                      {metric.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Advanced Configuration Badge */}
      

      {/* Workout Classification */}
      <div className="relative">
        <div className="p-6 bg-gradient-to-r from-app-bg-secondary/30 via-app-achievement-workout/10 to-app-bg-secondary/30 rounded-2xl border border-app-border-muted shadow-app-medium">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <div className="p-3 bg-app-achievement-workout rounded-xl shadow-app-large">
                <Dumbbell className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                <Star className="h-2 w-2 text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-app-heading">
                Análise do Treino
              </h3>
              <p className="text-app-text-secondary">
                {hasAdvancedConfig ? 'Classificação e configuração personalizada' : 'Classificação e distribuição'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Classification */}
            <div className="text-center">
              <div className="relative w-32 h-32 mx-auto mb-4">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-app-bg-secondary to-app-border-muted"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-black text-app-heading">
                      {stats.totalExercises}
                    </div>
                    <div className="text-xs text-app-text-secondary font-semibold">
                      Exercícios
                    </div>
                  </div>
                </div>
              </div>

              <Badge className={`px-3 py-1 bg-gradient-to-r ${classification.colorClass} text-white rounded-full text-sm font-bold border-0 shadow-app-medium`}>
                <classification.icon className="h-3 w-3 mr-1" />
                {classification.classification}
              </Badge>
          
            </div>

            {/* Extended Stats */}
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-app-card rounded-xl">
                <span className="text-sm font-semibold text-app-text-primary flex items-center gap-2">
                  <Activity className="h-4 w-4 text-app-achievement-workout" />
                  Total de Séries:
                </span>
                <span className="text-sm font-bold text-app-heading">{stats.totalSets}</span>
              </div>
              
              {stats.totalReps && (
                <div className="flex justify-between items-center p-3 bg-app-card rounded-xl">
                  <span className="text-sm font-semibold text-app-text-primary flex items-center gap-2">
                    <Repeat className="h-4 w-4 text-app-achievement-workout" />
                    Total de Repetições:
                  </span>
                  <span className="text-sm font-bold text-app-heading">{stats.totalReps}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center p-3 bg-app-card rounded-xl">
                <span className="text-sm font-semibold text-app-text-primary flex items-center gap-2">
                  <Clock className="h-4 w-4 text-app-achievement-workout" />
                  Duração Estimada:
                </span>
                <span className="text-sm font-bold text-app-heading">{stats.estimatedDuration} min</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-app-card rounded-xl">
                <span className="text-sm font-semibold text-app-text-primary flex items-center gap-2">
                  <Timer className="h-4 w-4 text-app-achievement-workout" />
                  Descanso Médio:
                </span>
                <span className="text-sm font-bold text-app-heading">{stats.averageRest}s</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-app-card rounded-xl">
                <span className="text-sm font-semibold text-app-text-primary flex items-center gap-2">
                  <Target className="h-4 w-4 text-app-achievement-workout" />
                  Grupos Musculares:
                </span>
                <span className="text-sm font-bold text-app-heading">{stats.muscleGroups.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Muscle Groups */}
      <div className="p-4 bg-gradient-to-br from-app-bg-secondary/30 to-app-bg-secondary/50 rounded-xl border border-app-border-muted shadow-app-medium">
        <h4 className="font-bold text-app-heading mb-3 flex items-center gap-2">
          <Target className="h-4 w-4 text-app-achievement-consecutive" />
          Grupos Musculares ({stats.muscleGroups.length})
        </h4>
        <div className="flex flex-wrap gap-2">
          {stats.muscleGroups.map((muscle) => (
            <Badge
              key={muscle}
              className="bg-app-achievement-consecutive/10 text-app-achievement-consecutive border border-app-border-accent text-xs font-medium px-3 py-1 rounded-full"
            >
              {muscle}
            </Badge>
          ))}
        </div>
      </div>

      {/* Equipment */}
      <div className="p-4 bg-gradient-to-br from-app-bg-secondary/30 to-app-bg-secondary/50 rounded-xl border border-app-border-muted shadow-app-medium">
        <h4 className="font-bold text-app-heading mb-3 flex items-center gap-2">
          <Package className="h-4 w-4 text-app-achievement-exercise" />
          Equipamentos ({stats.equipmentNeeded.length})
        </h4>
        <div className="flex flex-wrap gap-2">
          {stats.equipmentNeeded.length > 0 ? (
            stats.equipmentNeeded.map((equipment) => (
              <Badge
                key={equipment}
                className="bg-app-achievement-exercise/10 text-app-achievement-exercise border border-app-border-accent text-xs font-medium px-3 py-1 rounded-full"
              >
                {equipment}
              </Badge>
            ))
          ) : (
            <Badge className="bg-app-bg-secondary text-app-text-muted border border-app-border-muted text-xs px-3 py-1 rounded-full">
              Peso corporal
            </Badge>
          )}
        </div>
      </div>

      {/* Level & Goal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Level */}
        <div className="p-4 bg-gradient-to-br from-app-bg-secondary/30 to-app-bg-secondary/50 rounded-xl border border-app-border-muted shadow-app-medium">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-gradient-to-br from-app-achievement-workout to-app-achievement-workout rounded-lg shadow-app-medium">
              <Dumbbell className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-app-text-secondary mb-1 text-sm">
                Nível
              </div>
              <div className="text-app-heading font-semibold">
                {level}
              </div>
            </div>
          </div>
        </div>

        {/* Goal */}
        <div className="p-4 bg-gradient-to-br from-app-bg-secondary/30 to-app-bg-secondary/50 rounded-xl border border-app-border-muted shadow-app-medium">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-gradient-to-br from-app-achievement-consecutive to-app-achievement-consecutive rounded-lg shadow-app-medium">
              <Target className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-app-text-secondary mb-1 text-sm">
                Objetivo
              </div>
              <div className="text-app-heading font-semibold">
                {goal}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}