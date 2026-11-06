'use client';

import * as React from 'react';
import type { MotivoAcesso } from '@/lib/billing/acesso';
import type { PerfilAcesso } from '@/lib/billing/mensagens';

/**
 * Contexto de ACESSO (trial/assinatura) para a UI. Só reduz atrito (desabilita
 * botões, mostra aviso): a fronteira real é o gate das Server Actions.
 */
export interface AcessoUi {
  podeEscrever: boolean;
  motivo: MotivoAcesso;
  perfil: PerfilAcesso;
}

const PADRAO: AcessoUi = { podeEscrever: true, motivo: 'assinatura_ativa', perfil: 'master' };

const AcessoContext = React.createContext<AcessoUi>(PADRAO);

export function AcessoProvider({ value, children }: { value: AcessoUi; children: React.ReactNode }) {
  return <AcessoContext.Provider value={value}>{children}</AcessoContext.Provider>;
}

/** Fora de um provider assume "pode escrever" (o servidor continua barrando). */
export function useAcesso(): AcessoUi {
  return React.useContext(AcessoContext);
}
