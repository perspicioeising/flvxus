import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatarData } from '@/lib/datas';
import type { AssessmentProtocol } from '@/types/database.types';
import { PROTOCOLO_LABEL } from './labels';

export interface AvaliacaoResumo {
  id: string;
  assessed_at: string;
  protocol: AssessmentProtocol | null;
  weight_kg: number | null;
  bmi: number | null;
  body_fat_pct: number | null;
  alunoNome: string;
}

/** Cartão de avaliação na listagem: aluno, data, protocolo e métricas-chave. */
export function AvaliacaoCard({ avaliacao }: { avaliacao: AvaliacaoResumo }) {
  return (
    <Card className="transition-colors hover:border-primary/40">
      <Link
        href={`/professor/avaliacoes/${avaliacao.id}`}
        className="flex items-center justify-between gap-4 p-4"
      >
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate font-medium text-foreground">{avaliacao.alunoNome}</span>
            {avaliacao.protocol ? (
              <Badge variant="secondary">{PROTOCOLO_LABEL[avaliacao.protocol]}</Badge>
            ) : null}
          </div>
          <p className="text-sm text-muted-foreground">
            {formatarData(avaliacao.assessed_at)}
            {avaliacao.weight_kg != null ? ` · ${avaliacao.weight_kg} kg` : ''}
            {avaliacao.bmi != null ? ` · IMC ${avaliacao.bmi}` : ''}
            {avaliacao.body_fat_pct != null ? ` · ${avaliacao.body_fat_pct}% gordura` : ''}
          </p>
        </div>
        <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
      </Link>
    </Card>
  );
}
