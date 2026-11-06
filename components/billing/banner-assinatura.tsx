import Link from 'next/link';
import type { Acesso } from '@/lib/billing/access';
import { mensagemBloqueio, MSG_INDISPONIVEL } from '@/lib/billing/mensagens';

/**
 * Faixa de assinatura no topo do <main> (Server Component):
 *  - trial vigente (só master/autônomo): dias restantes, com tom de urgência
 *    quando restam 3 dias ou menos;
 *  - somente leitura: mensagem por perfil + CTA para quem pode assinar.
 */
export function BannerAssinatura({ acesso }: { acesso: Acesso }) {
  const podeAssinar = acesso.perfil === 'master' || acesso.perfil === 'autonomo';

  if (acesso.indisponivel) {
    return (
      <div role="status" className="mb-4 rounded-md border border-border bg-muted p-3 text-sm">
        {MSG_INDISPONIVEL}
      </div>
    );
  }

  if (acesso.podeEscrever) {
    if (acesso.motivo !== 'trial_vigente' || !podeAssinar || acesso.diasRestantesTrial == null) {
      return null;
    }
    const dias = acesso.diasRestantesTrial;
    const urgente = dias <= 3;
    return (
      <div
        role="status"
        className={`mb-4 flex flex-wrap items-center justify-between gap-2 rounded-md border p-3 text-sm ${
          urgente ? 'border-amber-500/50 bg-amber-500/10' : 'border-border bg-muted'
        }`}
      >
        <p>
          Teste grátis: {dias === 1 ? 'resta 1 dia' : `restam ${dias} dias`}.{' '}
          {urgente ? 'Assine agora para não perder o acesso.' : 'Assine para não perder o acesso.'}
        </p>
        <Link
          href="/professor/plano"
          className="inline-flex min-h-11 items-center font-semibold underline underline-offset-2"
        >
          Assinar
        </Link>
      </div>
    );
  }

  return (
    <div
      role="status"
      className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-md border border-amber-500/50 bg-amber-500/10 p-3 text-sm"
    >
      <p>{mensagemBloqueio(acesso.motivo, acesso.perfil)}</p>
      {podeAssinar ? (
        <Link
          href="/professor/plano"
          className="inline-flex min-h-11 items-center rounded-md bg-primary px-4 font-semibold text-primary-foreground"
        >
          Assinar para continuar
        </Link>
      ) : null}
    </div>
  );
}
