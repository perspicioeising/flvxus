'use client';

import Link from 'next/link';
import { useAcesso } from '@/components/billing/acesso-provider';

/** Aviso no topo de formulários/telas de escrita quando o tenant está em somente leitura. */
export function AvisoSomenteLeitura() {
  const { podeEscrever, perfil } = useAcesso();
  if (podeEscrever) {
    return null;
  }
  const podeAssinar = perfil === 'master' || perfil === 'autonomo';
  return (
    <div
      role="status"
      className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-foreground"
    >
      <p>
        Modo somente leitura: sua assinatura não está ativa, então não é possível salvar alterações.
        {podeAssinar ? '' : ' Peça ao responsável pela conta para regularizar.'}
      </p>
      {podeAssinar ? (
        <Link href="/professor/plano" className="mt-1 inline-block font-semibold underline underline-offset-2">
          Assinar para continuar
        </Link>
      ) : null}
    </div>
  );
}

/** Texto curto para `title` de botões desabilitados por somente leitura. */
export function dicaSomenteLeitura(perfil: string): string {
  return perfil === 'master' || perfil === 'autonomo'
    ? 'Assine para continuar'
    : 'Assinatura inativa: peça ao responsável pela conta para regularizar';
}
