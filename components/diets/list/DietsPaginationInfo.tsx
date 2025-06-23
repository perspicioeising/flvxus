// /components/diets/components/list/DietsPaginationInfo.tsx

import React from 'react';
import type { DietsPaginationInfoProps } from '../types';

export function DietsPaginationInfo({ 
  currentCount, 
  totalCount 
}: DietsPaginationInfoProps) {
  return (
    <div className="text-center mt-6">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Mostrando <span className="font-semibold text-gray-900 dark:text-white">{currentCount}</span> de{' '}
        <span className="font-semibold text-gray-900 dark:text-white">{totalCount}</span> dietas
      </p>
    </div>
  );
}