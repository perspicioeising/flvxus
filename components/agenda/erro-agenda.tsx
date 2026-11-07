'use client';

import { useRouter } from 'next/navigation';
import { ErrorState } from '@/components/patterns';

/** ErrorState da agenda com retry (recarrega a rota). */
export function ErroAgenda() {
  const router = useRouter();
  return (
    <ErrorState
      title="Não foi possível carregar a agenda"
      description="Ocorreu um erro ao buscar seus compromissos. Tente novamente."
      onRetry={() => router.refresh()}
    />
  );
}
