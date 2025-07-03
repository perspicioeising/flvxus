import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Flame, 
  Dumbbell, 
  Target, 
  TrendingUp,
  Trophy,
  Clock,
  BarChart3,
  Award
} from 'lucide-react';
import { StudentStats } from '../../types';

interface StatsCardsProps {
  stats: StudentStats;
  className?: string;
}

export function StatsCards({ stats, className = '' }: StatsCardsProps) {
  const statsConfig = [
    {
      key: 'streak',
      value: stats.streak,
      label: 'Sequência',
      suffix: 'dias',
      icon: Flame,
      color: 'from-orange-500 to-red-500',
      progress: Math.min((stats.streak / 30) * 100, 100),
      description: 'Dias consecutivos'
    },
    {
      key: 'totalWorkouts',
      value: stats.totalWorkouts,
      label: 'Treinos',
      suffix: '',
      icon: Dumbbell,
      color: 'from-blue-500 to-cyan-500',
      progress: Math.min((stats.totalWorkouts / 100) * 100, 100),
      description: 'Total realizados'
    },
    {
      key: 'totalWeight',
      value: stats.totalWeight,
      label: 'Peso Total',
      suffix: 'kg',
      icon: BarChart3,
      color: 'from-purple-500 to-pink-500',
      progress: Math.min((stats.totalWeight / 10000) * 100, 100),
      description: 'Peso levantado'
    },
    {
      key: 'totalExercises',
      value: stats.totalExercises,
      label: 'Exercícios',
      suffix: '',
      icon: Target,
      color: 'from-green-500 to-emerald-500',
      progress: Math.min((stats.totalExercises / 500) * 100, 100),
      description: 'Exercícios completos'
    }
  ];

  return (
    <div className={`grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 ${className}`}>
      {statsConfig.map((stat) => {
        const Icon = stat.icon;
        
        return (
          <Card key={stat.key} className="border-0 card-app">
            <CardContent className="p-3 sm:p-4">
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-bold text-app-text-muted uppercase tracking-wider">
                      {stat.label}
                    </p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg sm:text-xl lg:text-2xl font-black text-app-heading">
                        {stat.value.toLocaleString()}
                      </span>
                      {stat.suffix && (
                        <span className="text-xs sm:text-sm font-semibold text-app-text-secondary">
                          {stat.suffix}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className={`p-2 bg-gradient-to-br ${stat.color} rounded-lg shadow-app-medium`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-1">
                  <Progress value={stat.progress} className="h-1.5" />
                  <p className="text-xs text-app-text-muted">
                    {stat.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// components/my-workouts/components/cards/WorkoutPlanCard.tsx


