import type { ReactNode } from 'react';
import { requireRole } from '@/lib/auth';
import { getAccess } from '@/lib/billing/access';
import { AcessoProvider } from '@/components/billing/acesso-provider';
import { BannerAssinatura } from '@/components/billing/banner-assinatura';
import { AppShell } from '@/components/navigation/app-shell';
import { materializarAceiteProfessor } from '@/lib/legal/materializar-aceite';

/**
 * Gate server-side da ÁREA DO PROFESSOR (architecture.md §5.2). Lê
 * `profiles.role` via createServerClient; sem sessão → /login, papel divergente
 * → área correta. O papel segue para o scaffolding via props (sem fetch client).
 * Também resolve o estado de acesso (trial/assinatura) para o banner e para o
 * contexto `useAcesso()` (a fronteira real do somente leitura é a Server Action).
 */
export default async function ProfessorLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireRole('trainer');

  // Gancho best-effort (MEDIUM #3): materializa o aceite pendente do professor.
  // É o ponto que TODO login do professor atravessa (inclusive e-mail+senha,
  // que NÃO passa pelo /callback). Idempotente e NÃO bloqueia a navegação —
  // curto-circuita quando o aceite da versão corrente já existe.
  await materializarAceiteProfessor(user.userId);

  const acesso = await getAccess();
  const shell = (
    <AppShell
      role={user.role}
      rootHref="/professor"
      isMaster={user.isMaster}
      accountType={user.accountType}
      banner={acesso ? <BannerAssinatura acesso={acesso} /> : null}
    >
      {children}
    </AppShell>
  );
  return acesso ? (
    <AcessoProvider
      value={{ podeEscrever: acesso.podeEscrever, motivo: acesso.motivo, perfil: acesso.perfil }}
    >
      {shell}
    </AcessoProvider>
  ) : (
    shell
  );
}
