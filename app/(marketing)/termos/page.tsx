import type { Metadata } from 'next';

import { LegalDocument } from '@/components/legal/legal-document';
import { TERMOS_DE_USO } from '@/lib/legal/documents';

export const metadata: Metadata = {
  title: 'Termos de Uso · Flvxus',
  description: 'Termos de Uso da plataforma Flvxus.',
};

export default function TermosPage() {
  return <LegalDocument documento={TERMOS_DE_USO} />;
}
