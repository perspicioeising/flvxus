import { registrarAceiteLegal } from '@/actions/legal';
import { faltaAceiteDaVersaoCorrente } from '@/lib/legal/falta-aceite';
import { PRIVACY_VERSION, TERMS_VERSION } from '@/lib/legal/versions';

/**
 * Gancho idempotente que materializa o aceite PENDENTE do professor
 * (MEDIUM #3 do design-review).
 *
 * Por que aqui e não só no /callback: o /callback NÃO é atingido no login
 * e-mail+senha (só em confirmação de e-mail / magic link). Este gancho é
 * chamado pelo guard RSC de /professor (app/(professor)/layout.tsx), que TODO
 * login autenticado do professor atravessa.
 *
 * Contrato:
 *  - best-effort: NUNCA lança nem bloqueia a navegação;
 *  - idempotente: curto-circuita via `faltaAceiteDaVersaoCorrente` (não regrava
 *    se já existe aceite da versão corrente) + índice único no banco;
 *  - em falha: loga `warn` e segue.
 *
 * Limitação declarada: a manifestação de vontade já foi registrada pelo
 * checkbox obrigatório no /register; esta materialização é prova best-effort —
 * se o professor nunca abrir a área (/professor), o aceite não é persistido,
 * mas isso não ocorre no fluxo normal (o login cai na área do professor).
 */
export async function materializarAceiteProfessor(userId: string): Promise<void> {
  try {
    const falta = await faltaAceiteDaVersaoCorrente(userId);
    if (!falta.algumFaltando) {
      return;
    }

    const documents: { type: 'terms' | 'privacy'; version: string }[] = [];
    if (falta.terms) {
      documents.push({ type: 'terms', version: TERMS_VERSION });
    }
    if (falta.privacy) {
      documents.push({ type: 'privacy', version: PRIVACY_VERSION });
    }

    const resultado = await registrarAceiteLegal({ documents });
    if (!resultado.ok) {
      console.warn(
        '[materializarAceiteProfessor] aceite pendente não materializado:',
        resultado.message,
      );
    }
  } catch (erro) {
    console.warn('[materializarAceiteProfessor] falha best-effort:', erro);
  }
}
