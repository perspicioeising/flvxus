// /components/exercises/components/list/ExercisePaginationInfo.tsx

import { ExercisePaginationInfoProps } from "@/components/exercices/types/exercise";

export function ExercisePaginationInfo({ 
  currentCount, 
  totalCount 
}: ExercisePaginationInfoProps) {
  return (
    <div className="text-center mt-6">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Mostrando <span className="font-semibold text-gray-900 dark:text-white">{currentCount}</span> de{' '}
        <span className="font-semibold text-gray-900 dark:text-white">{totalCount}</span> exercícios
      </p>
    </div>
  );
}