import type { Metadata } from 'next';

import { LegalDocument } from '@/components/legal/legal-document';
import { POLITICA_DE_PRIVACIDADE } from '@/lib/legal/documents';

export const metadata: Metadata = {
  title: 'Política de Privacidade · Flvxus',
  description: 'Política de Privacidade do Flvxus, em conformidade com a LGPD.',
};

export default function PrivacidadePage() {
  return <LegalDocument documento={POLITICA_DE_PRIVACIDADE} />;
}
