import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarCheck, Activity, Users, Clock } from 'lucide-react';
import { WorkoutPlanStatsProps } from '../../types';
import { MODULE_COLORS } from '../../constants';

export function WorkoutPlansStats({ stats, isLoading }: WorkoutPlanStatsProps) {
  const statsConfig = [
    {
      icon: CalendarCheck,
      label: 'Total',
      value: stats.totalPlans,
      color: MODULE_COLORS.primary,
      progress: 100,
    },
    {
      icon: Activity,
      label: 'Ativos',
      value: stats.activePlans,
      color: MODULE_COLORS.success,
      progress: stats.totalPlans > 0 ? (stats.activePlans / stats.totalPlans) * 100 : 0,
    },
    {
      icon: Users,
      label: 'Alunos',
      value: stats.totalStudents,
      color: MODULE_COLORS.secondary,
      progress: 85, // Placeholder progress
    },
    {
      icon: Clock,
      label: 'Duração Média',
      value: `${stats.avgDuration}d`,
      color: MODULE_COLORS.accent,
      progress: Math.min((stats.avgDuration / 90) * 100, 100),
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-0 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
                <div className="flex-1">
                  <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-gray-300 dark:bg-gray-600 h-2 rounded-full w-3/4 animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
      {statsConfig.map((stat, index) => (
        <div key={stat.label} className="relative group">
          <div className={`absolute inset-0 bg-gradient-to-r ${stat.color.gradient} rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300`}></div>
          
          <Card className="relative border-0 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl transform group-hover:scale-105 transition-all duration-300">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 sm:p-3 bg-gradient-to-br ${stat.color.gradient} rounded-xl shadow-lg`}>
                  <stat.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className={`${stat.color.text} text-xs sm:text-sm font-bold uppercase tracking-wider`}>
                    {stat.label}
                  </p>
                  <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className={`bg-gradient-to-r ${stat.color.gradient} h-2 rounded-full transition-all duration-1000 ease-out`}
                  style={{ 
                    width: `${stat.progress}%`,
                    animationDelay: `${index * 200}ms`
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}