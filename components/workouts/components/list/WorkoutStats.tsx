
// components/workouts/components/list/WorkoutStats.tsx
'use client';

import { Card, CardContent } from "@/components/ui/card";
import { WorkoutStats as WorkoutStatsType } from '../../types';
import { STATS_CONFIG, WORKOUT_COLORS } from '../../constants';

interface WorkoutStatsProps {
  stats: WorkoutStatsType;
}

export function WorkoutStats({ stats }: WorkoutStatsProps) {
  const statsData = [
    {
      ...STATS_CONFIG[0],
      value: stats.total,
      progress: 100
    },
    {
      ...STATS_CONFIG[1],
      value: stats.totalExercises,
      progress: Math.min((stats.totalExercises / 100) * 100, 100)
    },
    {
      ...STATS_CONFIG[2],
      value: stats.avgExercisesPerWorkout,
      progress: Math.min((stats.avgExercisesPerWorkout / 10) * 100, 100)
    },
    {
      ...STATS_CONFIG[3],
      value: stats.uniqueLevels,
      progress: Math.min((stats.uniqueLevels / 3) * 100, 100)
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={stat.key} className="relative group">
            <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300`}></div>
            <Card className="relative border-0 bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl transform group-hover:scale-105 transition-all duration-300">
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
                  <div className={`p-2 sm:p-3 bg-gradient-to-br ${stat.color} rounded-xl shadow-lg`}>
                    <Icon className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="text-center sm:text-left">
                    <p className={`text-xs sm:text-sm font-semibold mb-1`} style={{ color: `rgb(${stat.color.includes('pink') ? '236 72 153' : '168 85 247'})` }}>
                      {stat.label}
                    </p>
                    <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`bg-gradient-to-r ${stat.color} h-2 rounded-full transition-all duration-1000`}
                    style={{ width: `${stat.progress}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
}