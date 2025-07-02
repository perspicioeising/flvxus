
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
      <p className="text-sm text-app-text-secondary">
        Mostrando <span className="font-semibold text-app-text-primary">{currentCount}</span> de{' '}
        <span className="font-semibold text-app-text-primary">{totalCount}</span> planos de treino
      </p>
    </div>
  );
}
