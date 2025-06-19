// /components/workout-plans/components/list/WorkoutPlansPaginationInfo.tsx

import React from 'react';

interface WorkoutPlansPaginationInfoProps {
  currentCount: number;
  totalCount: number;
}

export function WorkoutPlansPaginationInfo({ 
  currentCount, 
  totalCount 
}: WorkoutPlansPaginationInfoProps) {
  return (
    <div className="text-center mt-6">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Mostrando <span className="font-semibold text-gray-900 dark:text-white">{currentCount}</span> de{' '}
        <span className="font-semibold text-gray-900 dark:text-white">{totalCount}</span> planos de treino
      </p>
    </div>
  );
}