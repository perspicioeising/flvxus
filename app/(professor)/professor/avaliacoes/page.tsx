import { HeartPulse } from 'lucide-react';

import { PageStub } from '@/components/navigation/page-stub';

export default function ProfessorAvaliacoesPage() {
  return (
    <PageStub
      title="Avaliações"
      icon={HeartPulse}
      description="Avaliação física completa dos alunos, com histórico e evolução. Em construção."
    />
  );
}
