// /components/physical-assessments/components/list/PaginationInfo.tsx

interface PaginationInfoProps { 
  currentCount: number;
  totalCount: number;
}

export function PaginationInfo({ currentCount, totalCount }: PaginationInfoProps) {
  return (
    <div className="text-center mt-6">
      <p className="text-sm text-app-text-secondary">
        Mostrando <span className="font-semibold text-app-heading">{currentCount}</span> de{' '}
        <span className="font-semibold text-app-heading">{totalCount}</span> avaliações
      </p>
    </div>
  );
}