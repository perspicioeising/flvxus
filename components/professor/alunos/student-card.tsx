import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import type { StudentStatus } from '@/types/database.types';
import { statusBadgeVariant, statusLabel } from './labels';

export interface StudentCardData {
  user_id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  status: StudentStatus | null;
}

/** Iniciais para o fallback do avatar. */
function iniciais(nome: string | null, email: string | null): string {
  const base = (nome ?? email ?? '?').trim();
  const partes = base.split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '?';
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

/**
 * Cartão de aluno da listagem. É um link para a ficha 360. Mobile-first,
 * acessível (alvo de toque amplo, foco visível herdado do Link/anchor).
 */
export function StudentCard({ aluno }: { aluno: StudentCardData }) {
  const nome = aluno.full_name ?? 'Aluno sem nome';

  return (
    <Link
      href={`/professor/alunos/${aluno.user_id}`}
      className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Avatar className="h-11 w-11 shrink-0">
        {aluno.avatar_url ? (
          <AvatarImage src={aluno.avatar_url} alt="" />
        ) : null}
        <AvatarFallback>{iniciais(aluno.full_name, aluno.email)}</AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-foreground">{nome}</p>
        {aluno.email ? (
          <p className="truncate text-sm text-muted-foreground">{aluno.email}</p>
        ) : null}
      </div>

      <Badge variant={statusBadgeVariant(aluno.status)} className="shrink-0">
        {statusLabel(aluno.status)}
      </Badge>
      <ChevronRight
        className="h-5 w-5 shrink-0 text-muted-foreground"
        aria-hidden="true"
      />
    </Link>
  );
}
