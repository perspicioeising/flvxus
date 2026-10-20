import { Calendar } from 'lucide-react';

import { PageStub } from '@/components/navigation/page-stub';

export default function ProfessorAgendaPage() {
  return (
    <PageStub
      title="Agenda"
      icon={Calendar}
      description="Agenda e lembretes de atendimentos. Em construção."
    />
  );
}
