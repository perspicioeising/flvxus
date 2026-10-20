import Image from 'next/image';

import { formatarData } from '@/lib/datas';
import {
  CIRCUNFERENCIA_LABEL,
  DOBRA_LABEL,
  GENERO_LABEL,
  protocoloLabel,
} from '@/components/professor/avaliacoes/labels';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { AssessmentProtocol } from '@/types/database.types';

const CIRCUNFERENCIAS = [
  'neck_cm',
  'shoulder_cm',
  'chest_cm',
  'waist_cm',
  'abdomen_cm',
  'hip_cm',
  'left_arm_cm',
  'right_arm_cm',
  'left_thigh_cm',
  'right_thigh_cm',
  'left_calf_cm',
  'right_calf_cm',
] as const;

const DOBRAS_COLUNA = [
  'skf_triceps',
  'skf_subscapular',
  'skf_chest',
  'skf_midaxillary',
  'skf_suprailiac',
  'skf_abdominal',
  'skf_thigh',
] as const;

/** Avaliação física do aluno exibida no card (somente leitura). */
export interface AvaliacaoResumo {
  id: string;
  assessed_at: string;
  age: number | null;
  gender: string | null;
  protocol: AssessmentProtocol | null;
  weight_kg: number | null;
  height_cm: number | null;
  bmi: number | null;
  body_fat_pct: number | null;
  fat_mass_kg: number | null;
  lean_mass_kg: number | null;
  photos_consent: boolean;
  medidas: Record<string, unknown>;
  /** URLs assinadas (TTL curto) das fotos — só quando `photos_consent`. */
  fotos: { path: string; url: string }[];
}

/**
 * Card de uma avaliação física do próprio aluno. Reusa os rótulos/estrutura do
 * detalhe do professor. As fotos aparecem APENAS quando `photos_consent` e já
 * chegam como URLs assinadas (geradas no servidor via `signAssessmentPhoto`).
 */
export function AvaliacaoCard({ avaliacao }: { avaliacao: AvaliacaoResumo }) {
  const skfBiceps =
    typeof avaliacao.medidas.skf_biceps === 'number'
      ? (avaliacao.medidas.skf_biceps as number)
      : null;

  const dobras = DOBRAS_COLUNA.map((k) => ({
    rotulo: DOBRA_LABEL[k],
    valor: avaliacao[k as keyof AvaliacaoResumo] as number | null,
  }))
    .concat(skfBiceps != null ? [{ rotulo: DOBRA_LABEL.skf_biceps, valor: skfBiceps }] : [])
    .filter((d) => d.valor != null);

  const circunferencias = CIRCUNFERENCIAS.map((k) => ({
    rotulo: CIRCUNFERENCIA_LABEL[k],
    valor: avaliacao[k as keyof AvaliacaoResumo] as number | null,
  })).filter((c) => c.valor != null);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 p-4 pb-0 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <CardTitle className="text-lg">{formatarData(avaliacao.assessed_at)}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {avaliacao.age != null ? `${avaliacao.age} anos` : ''}
            {avaliacao.age != null && avaliacao.gender ? ' · ' : ''}
            {avaliacao.gender
              ? GENERO_LABEL[avaliacao.gender as 'male' | 'female'] ?? avaliacao.gender
              : ''}
          </p>
        </div>
        <Badge variant="secondary">{protocoloLabel(avaliacao.protocol)}</Badge>
      </CardHeader>
      <CardContent className="space-y-4 p-4">
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Dado rotulo="Peso" valor={avaliacao.weight_kg != null ? `${avaliacao.weight_kg} kg` : null} />
          <Dado rotulo="Altura" valor={avaliacao.height_cm != null ? `${avaliacao.height_cm} cm` : null} />
          <Dado rotulo="IMC" valor={avaliacao.bmi != null ? String(avaliacao.bmi) : null} />
          <Dado rotulo="% Gordura" valor={avaliacao.body_fat_pct != null ? `${avaliacao.body_fat_pct}%` : null} />
          <Dado rotulo="Massa gorda" valor={avaliacao.fat_mass_kg != null ? `${avaliacao.fat_mass_kg} kg` : null} />
          <Dado rotulo="Massa magra" valor={avaliacao.lean_mass_kg != null ? `${avaliacao.lean_mass_kg} kg` : null} />
        </dl>

        {dobras.length > 0 ? (
          <div>
            <h3 className="mb-2 text-sm font-medium text-foreground">Dobras cutâneas (mm)</h3>
            <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {dobras.map((d) => (
                <Dado key={d.rotulo} rotulo={d.rotulo} valor={`${d.valor}`} />
              ))}
            </dl>
          </div>
        ) : null}

        {circunferencias.length > 0 ? (
          <div>
            <h3 className="mb-2 text-sm font-medium text-foreground">Circunferências (cm)</h3>
            <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {circunferencias.map((c) => (
                <Dado key={c.rotulo} rotulo={c.rotulo} valor={`${c.valor}`} />
              ))}
            </dl>
          </div>
        ) : null}

        <div>
          <h3 className="mb-2 text-sm font-medium text-foreground">Fotos</h3>
          {!avaliacao.photos_consent ? (
            <p className="text-sm text-muted-foreground">
              Fotos não exibidas: não há consentimento registrado para armazenamento de fotos (LGPD).
            </p>
          ) : avaliacao.fotos.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma foto nesta avaliação.</p>
          ) : (
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {avaliacao.fotos.map((f) => (
                <li key={f.path} className="overflow-hidden rounded-lg border border-border">
                  <Image
                    src={f.url}
                    alt="Foto da avaliação física"
                    width={400}
                    height={400}
                    className="h-40 w-full object-cover"
                    unoptimized
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function Dado({ rotulo, valor }: { rotulo: string; valor: string | null | undefined }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{rotulo}</dt>
      <dd className="text-sm font-medium text-foreground">{valor ? valor : '—'}</dd>
    </div>
  );
}
