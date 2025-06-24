// /components/students/components/list/StudentsPaginationInfo.tsx

interface StudentsPaginationInfoProps {
  currentCount: number;
  totalCount: number;
}

export function StudentsPaginationInfo({ 
  currentCount, 
  totalCount 
}: StudentsPaginationInfoProps) {
  return (
    <div className="text-center mt-6">
      <p className="text-sm text-app-text-secondary">
        Mostrando <span className="font-semibold text-app-text-primary">{currentCount}</span> de{' '}
        <span className="font-semibold text-app-text-primary">{totalCount}</span> alunos
      </p>
    </div>
  );
}