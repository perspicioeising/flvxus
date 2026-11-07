import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export interface AvisoFichasSemDiaProps {
  fichas: { id: string; name: string }[];
  /** `true` = aluno autônomo (edita a própria ficha); `false` = vinculado (pede ao professor). */
  autonomo: boolean;
}

/**
 * Aviso de fichas liberadas sem nenhum dia da semana marcado: elas não entram
 * na agenda. Autônomo recebe o link de edição; o aluno vinculado, a orientação
 * de pedir ao professor. Design: §8.1.
 */
export function AvisoFichasSemDia({ fichas, autonomo }: AvisoFichasSemDiaProps) {
  if (fichas.length === 0) return null;
  return (
    <div className="space-y-2" data-testid="aviso-fichas-sem-dia">
      {fichas.map((ficha) => (
        <Alert key={ficha.id}>
          <AlertTitle>Ficha sem dias na agenda</AlertTitle>
          <AlertDescription>
            A ficha «{ficha.name}» não tem dias marcados. Marque o dia da semana nos exercícios
            para ela aparecer na agenda.{' '}
            {autonomo ? (
              <Link
                href={`/professor/treinos/${ficha.id}`}
                className="inline-flex min-h-11 items-center font-medium underline underline-offset-2"
              >
                Editar ficha
              </Link>
            ) : (
              <span>Peça ao seu professor para marcar os dias.</span>
            )}
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
}
