// /components/physical-assessments/components/list/PaginationInfo.tsx

import { PaginationInfoProps } from "@/types/physical-assessment";

export function PaginationInfo({ currentCount, totalCount }: PaginationInfoProps) {
  return (
    <div className="text-center mt-6">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Mostrando <span className="font-semibold text-gray-900 dark:text-white">{currentCount}</span> de{' '}
        <span className="font-semibold text-gray-900 dark:text-white">{totalCount}</span> avaliações
      </p>
    </div>
  );
}