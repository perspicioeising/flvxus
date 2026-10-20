import { redirect } from 'next/navigation';

import { getSessionUser } from '@/lib/auth';

/**
 * Rota legada da v1 (`/dashboard`). Na v2 as áreas são `/professor` e `/aluno`,
 * com gate server-side por papel (architecture.md §5.2). Esta pasta foi mantida
 * apenas como referência das fases, mas NÃO deve mais servir a UI antiga — o
 * layout client da v1 chamava `fetch('/api/profile')` (rota removida), o que
 * fazia o papel cair em `null` e a interface tratar o usuário como aluno.
 *
 * Para eliminar essa confusão, qualquer acesso a `/dashboard` (ou subrotas) é
 * redirecionado para a área correta do usuário, lendo o papel real de
 * `profiles.role` via `getSessionUser()`. Sem sessão → `/login`.
 */
export default async function DashboardLayout() {
  const user = await getSessionUser();

  if (!user) {
    redirect('/login');
  }

  redirect(user.role === 'student' ? '/aluno' : '/professor');
}
