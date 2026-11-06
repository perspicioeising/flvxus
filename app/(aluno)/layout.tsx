import type { ReactNode } from 'react';
import { requireSelfOrStudent } from '@/lib/auth';
import { getAccess } from '@/lib/billing/access';
import { AcessoProvider } from '@/components/billing/acesso-provider';
import { BannerAssinatura } from '@/components/billing/banner-assinatura';
import { AppShell } from '@/components/navigation/app-shell';

/**
 * Gate server-side da ÁREA DO ALUNO (architecture.md §5.2). Lê `profiles.role`
 * via createServerClient; sem sessão → /login, papel divergente → área correta.
 * Admite também o aluno autônomo (trainer + self_managed) via
 * `requireSelfOrStudent`, que reusa as rotas /aluno (OPÇÃO a do design).
 * O aluno vinculado herda o estado de acesso do tenant do personal.
 */
export default async function AlunoLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireSelfOrStudent();
  const acesso = await getAccess();
  const shell = (
    <AppShell
      role={user.role}
      rootHref="/aluno"
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
